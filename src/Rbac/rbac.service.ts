import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { UserEntity } from 'src/Global/Entities/user.entity';
import { RoleEntity } from 'src/Global/Entities/roles.entity';
import { RolePermissionEntity } from 'src/Global/Entities/role-permission.entity';
import { BlacklistToken } from 'src/Global/Entities/blacklist-token.entity';
import {
  ALL_PERMISSIONS,
  BUILT_IN_ROLES,
  OWNER_ONLY_PERMISSIONS,
  OWNER_ROLE_KEY,
  Permission,
  isPermission,
} from './permissions';

export interface StaffAccess {
  userId: number;
  email: string;
  name: string | null;
  role: { id: number; key: string | null; name: string };
  isOwner: boolean;
  permissions: Permission[];
}

// Thrown when a backend JWT is structurally valid but must not be honoured
// (logged out, user gone, or issued before an access change).
export class TokenRejectedError extends Error {}

@Injectable()
export class RbacService implements OnModuleInit {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermRepo: Repository<RolePermissionEntity>,
    @InjectRepository(BlacklistToken)
    private readonly blacklistRepo: Repository<BlacklistToken>,
  ) {}

  // ---- boot-time sync -----------------------------------------------------

  // Idempotent; safe to run on every boot and from several processes. A
  // failure is logged loudly but never takes the shop down: phase-1 routes
  // still work through the legacy admin guard.
  async onModuleInit() {
    try {
      await this.syncBuiltInRoles();
      await this.prunePermissions();
      await this.backfillLegacyAdmins();
    } catch (err: any) {
      this.logger.error(
        `RBAC boot sync failed - built-in roles may be missing: ${err?.message}`,
        err?.stack,
      );
    }
  }

  private async syncBuiltInRoles() {
    for (const def of BUILT_IN_ROLES) {
      let role = await this.roleRepo.findOne({ where: { key: def.key } });

      // Adopt a matching row created by the old Manage Roles page (which
      // stored bare lowercase names, e.g. 'admin', 'manager') rather than
      // creating a duplicate next to it.
      if (!role && def.legacyNames.length) {
        role = await this.roleRepo
          .createQueryBuilder('r')
          .where('r.key IS NULL')
          .andWhere('LOWER(r.name) IN (:...names)', {
            names: def.legacyNames.map((n) => n.toLowerCase()),
          })
          .orderBy('r.id', 'ASC')
          .getOne();
        if (role) {
          this.logger.log(
            `RBAC: adopting legacy role "${role.name}" (id ${role.id}) as "${def.name}"`,
          );
        }
      }

      if (!role) {
        role = this.roleRepo.create({ key: def.key });
      }

      role.key = def.key;
      role.name = def.name;
      role.isSystem = true;
      if (!role.description) role.description = def.description;
      try {
        role = await this.roleRepo.save(role);
      } catch (err) {
        // Another process won the race to create it - use theirs.
        const existing = await this.roleRepo.findOne({
          where: { key: def.key },
        });
        if (!existing) throw err;
        role = existing;
      }

      if (!role.defaultsAppliedAt) {
        if (def.key !== OWNER_ROLE_KEY && def.defaultPermissions.length) {
          await this.rolePermRepo
            .createQueryBuilder()
            .insert()
            .values(
              def.defaultPermissions.map((permission) => ({
                roleId: role.id,
                permission,
              })),
            )
            .orIgnore()
            .execute();
        }
        await this.roleRepo.update(role.id, { defaultsAppliedAt: new Date() });
      }
    }
  }

  // Drop permission rows that no longer mean anything (key removed from the
  // catalog), owner-only keys on non-owner roles, and any rows on the Owner
  // (which implicitly has everything - rows there would only mislead).
  private async prunePermissions() {
    const unknown = await this.rolePermRepo.delete({
      permission: Not(In(ALL_PERMISSIONS as string[])),
    });

    const owner = await this.roleRepo.findOne({
      where: { key: OWNER_ROLE_KEY },
    });
    let ownerOnly = { affected: 0 } as { affected?: number };
    let ownerRows = { affected: 0 } as { affected?: number };
    if (owner) {
      ownerOnly = await this.rolePermRepo.delete({
        roleId: Not(owner.id),
        permission: In(OWNER_ONLY_PERMISSIONS as string[]),
      });
      ownerRows = await this.rolePermRepo.delete({ roleId: owner.id });
    }

    const total =
      (unknown.affected || 0) +
      (ownerOnly.affected || 0) +
      (ownerRows.affected || 0);
    if (total) this.logger.warn(`RBAC: pruned ${total} invalid permission row(s)`);
  }

  // Every existing admin becomes an Owner, so nobody loses access when
  // enforcement switches from users.role to staff roles. Only fills in a
  // missing role - never overrides one an Owner has since assigned.
  private async backfillLegacyAdmins() {
    const owner = await this.roleRepo.findOne({
      where: { key: OWNER_ROLE_KEY },
    });
    if (!owner) return;
    const res = await this.userRepo.update(
      { role: 'admin', staffRoleId: IsNull() },
      { staffRoleId: owner.id, staffActive: true },
    );
    if (res.affected) {
      this.logger.log(`RBAC: assigned Owner to ${res.affected} legacy admin(s)`);
    }
  }

  // ---- tokens ---------------------------------------------------------------

  // Call after the JWT signature/expiry has been verified. Rejects tokens
  // that were logged out, whose user no longer exists, or that were issued
  // before the user's access last changed (tokenVersion bump).
  async validateTokenPayload(payload: any): Promise<void> {
    if (!payload?.jti) throw new TokenRejectedError('Token has no id');

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new TokenRejectedError('Token has no subject');
    }

    const blacklisted = await this.blacklistRepo.findOne({
      where: { jti: payload.jti },
    });
    if (blacklisted && blacklisted.expiry > Math.floor(Date.now() / 1000)) {
      throw new TokenRejectedError('Token revoked');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { id: true, tokenVersion: true },
    });
    if (!user) throw new TokenRejectedError('User no longer exists');

    // Tokens issued before tokenVersion existed carry no `tv` - treat as 0
    // so the rollout logs nobody out.
    if ((Number(payload.tv) || 0) !== (user.tokenVersion || 0)) {
      throw new TokenRejectedError('Token is out of date - sign in again');
    }
  }

  // ---- staff access ---------------------------------------------------------

  // Fresh from the DB on every call (no cache): a demotion or suspension
  // must take effect on the very next request, on every process.
  async getStaffAccess(userId: number): Promise<StaffAccess | null> {
    if (!Number.isInteger(userId) || userId <= 0) return null;

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { staffRole: { permissions: true } },
      select: {
        id: true,
        email: true,
        name: true,
        staffRoleId: true,
        staffActive: true,
        staffRole: {
          id: true,
          key: true,
          name: true,
          permissions: { id: true, permission: true },
        },
      },
    });

    if (!user || !user.staffRoleId || !user.staffRole || !user.staffActive) {
      return null;
    }

    const role = user.staffRole;
    const isOwner = role.key === OWNER_ROLE_KEY;
    const ownerOnly = new Set<string>(OWNER_ONLY_PERMISSIONS);
    const permissions = isOwner
      ? [...ALL_PERMISSIONS]
      : [
          ...new Set(
            (role.permissions || [])
              .map((rp) => rp.permission)
              .filter((p) => isPermission(p) && !ownerOnly.has(p)),
          ),
        ];

    return {
      userId: user.id,
      email: user.email,
      name: user.name ?? null,
      role: { id: role.id, key: role.key ?? null, name: role.name },
      isOwner,
      permissions: permissions as Permission[],
    };
  }

  hasAllPermissions(
    access: StaffAccess | null | undefined,
    required: Permission[],
  ): boolean {
    if (!access) return false;
    if (access.isOwner) return true;
    const held = new Set(access.permissions);
    return required.every((p) => held.has(p));
  }

  hasAnyPermission(
    access: StaffAccess | null | undefined,
    candidates: Permission[],
  ): boolean {
    if (!access) return false;
    if (access.isOwner) return true;
    const held = new Set(access.permissions);
    return candidates.some((p) => held.has(p));
  }
}
