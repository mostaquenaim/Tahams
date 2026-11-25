import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from 'src/Global/Entities/user.entity';
import { RoleEntity } from 'src/Global/Entities/roles.entity';
import { RolePermissionEntity } from 'src/Global/Entities/role-permission.entity';
import {
  ALL_PERMISSIONS,
  BUILT_IN_ROLES,
  OWNER_ONLY_PERMISSIONS,
  OWNER_ROLE_KEY,
  Permission,
  isPermission,
} from './permissions';
import { RbacService, StaffAccess } from './rbac.service';
import { AuditDetails } from './audit.interceptor';
import {
  CreateRoleDto,
  CreateStaffDto,
  PromoteStaffDto,
  UpdateRoleDto,
  UpdateStaffDto,
} from './rbac.dto';

// Synthetic guest identities (see the frontend's utils/guestCustomer.js) can
// never log in, so they must never become staff.
const GUEST_EMAIL = /^guest\d+@tahamsbd\.com$/i;
// arbitrary constant identifying the RBAC advisory lock
const RBAC_LOCK_KEY = 7_324_001;
const BUILT_IN_ORDER = BUILT_IN_ROLES.map((r) => r.key);

type Result<T> = { data: T; audit: AuditDetails };

// All staff / role changes go through here. Every rule is enforced on the
// server, inside a transaction, regardless of what the UI allows:
//
//  - nobody changes their OWN role, status or password through this API
//  - you can only grant permissions you hold yourself, and only act on
//    staff whose role you fully cover ("no acting upward")
//  - only an Owner can make or touch an Owner
//  - the last active Owner can't be demoted, suspended or removed
//    (row-locked, so two Owners can't remove each other at once)
//  - owner-only permissions (staff:manage, roles:manage) never go into a
//    non-Owner role; the Owner role itself is locked
//  - built-in roles can't be renamed or deleted; a role in use can't be
//    deleted
//
// The legacy users.role column is kept in sync ('admin' exactly for
// Owners) so older code paths and the boot backfill stay consistent.
@Injectable()
export class StaffService {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly rbac: RbacService,
  ) {}

  // Every staff/role change runs under one transaction-scoped Postgres
  // advisory lock, so changes are applied strictly one at a time (they're
  // rare - this costs nothing). Inside the lock the actor's access is
  // re-read from the DB: the copy the guard loaded a moment earlier may
  // already be stale (e.g. two Owners demoting each other at once - the
  // second one finds it is no longer an Owner). Using a single lock instead
  // of row locks also means two such requests can never deadlock.
  private async lockAndRefreshActor(m: EntityManager, actor: StaffAccess) {
    await m.query('SELECT pg_advisory_xact_lock($1)', [RBAC_LOCK_KEY]);
    const fresh = await this.rbac.getStaffAccess(actor.userId, m);
    if (!fresh) throw new ForbiddenException('Your staff access has changed - reload and try again');
    return fresh;
  }

  // ---- roles ----------------------------------------------------------------

  async listRoles() {
    const roles = await this.db.getRepository(RoleEntity).find({
      relations: { permissions: true },
    });
    const counts = await this.db
      .getRepository(UserEntity)
      .createQueryBuilder('u')
      .select('u.staffRoleId', 'roleId')
      .addSelect('COUNT(*)', 'n')
      .where('u.staffRoleId IS NOT NULL')
      .groupBy('u.staffRoleId')
      .getRawMany<{ roleId: number; n: string }>();
    const countBy = new Map(counts.map((c) => [Number(c.roleId), Number(c.n)]));

    return roles
      .map((r) => this.roleView(r, countBy.get(r.id) || 0))
      .sort((a, b) => {
        const ia = BUILT_IN_ORDER.indexOf(a.key);
        const ib = BUILT_IN_ORDER.indexOf(b.key);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        return a.name.localeCompare(b.name);
      });
  }

  async createRole(actor: StaffAccess, dto: CreateRoleDto): Promise<Result<any>> {
    return this.db.transaction(async (m) => {
      actor = await this.lockAndRefreshActor(m, actor);
      const permissions = this.validatePermissions(dto.permissions);
      this.assertCanGrant(actor, permissions);
      await this.assertRoleNameFree(m, dto.name);

      const role = await m.getRepository(RoleEntity).save(
        m.getRepository(RoleEntity).create({
          name: dto.name,
          key: await this.uniqueCustomKey(m, dto.name),
          description: dto.description || null,
          isSystem: false,
        }),
      );
      await this.replacePermissions(m, role.id, permissions);

      const saved = await this.loadRole(m, role.id);
      return {
        data: this.roleView(saved, 0),
        audit: {
          action: 'role.create',
          entity: 'role',
          entityId: role.id,
          changes: { name: role.name, permissions },
        },
      };
    });
  }

  async updateRole(actor: StaffAccess, id: number, dto: UpdateRoleDto): Promise<Result<any>> {
    return this.db.transaction(async (m) => {
      actor = await this.lockAndRefreshActor(m, actor);
      const role = await this.loadRole(m, id);
      if (role.key === OWNER_ROLE_KEY) {
        throw new ForbiddenException('The Owner role is locked');
      }
      // you can't edit a role you couldn't hold
      this.assertCanGrant(actor, this.rolePermissions(role));

      const before = { name: role.name, description: role.description, permissions: this.rolePermissions(role) };
      const changes: Record<string, any> = {};

      if (dto.name !== undefined && dto.name !== role.name) {
        if (role.isSystem) throw new ForbiddenException('Built-in roles cannot be renamed');
        await this.assertRoleNameFree(m, dto.name, role.id);
        role.name = dto.name;
        changes.name = { from: before.name, to: dto.name };
      }
      if (dto.description !== undefined && dto.description !== role.description) {
        role.description = dto.description || null;
        changes.description = { from: before.description, to: role.description };
      }
      await m.getRepository(RoleEntity).save(role);

      if (dto.permissions !== undefined) {
        const next = this.validatePermissions(dto.permissions);
        this.assertCanGrant(actor, next);
        const prev = new Set(before.permissions);
        const added = next.filter((p) => !prev.has(p));
        const removed = before.permissions.filter((p) => !next.includes(p));
        if (added.length || removed.length) {
          await this.replacePermissions(m, role.id, next);
          changes.permissions = { added, removed };
        }
      }

      const saved = await this.loadRole(m, id);
      const members = await m.getRepository(UserEntity).count({ where: { staffRoleId: id } });
      return {
        data: this.roleView(saved, members),
        audit: { action: 'role.update', entity: 'role', entityId: id, changes },
      };
    });
  }

  async deleteRole(actor: StaffAccess, id: number): Promise<Result<any>> {
    return this.db.transaction(async (m) => {
      actor = await this.lockAndRefreshActor(m, actor);
      const role = await this.loadRole(m, id);
      if (role.isSystem) throw new ForbiddenException('Built-in roles cannot be deleted');
      this.assertCanGrant(actor, this.rolePermissions(role));

      const members = await m.getRepository(UserEntity).count({ where: { staffRoleId: id } });
      if (members > 0) {
        throw new ConflictException(
          `Role is assigned to ${members} staff member(s) - reassign them first`,
        );
      }
      try {
        await m.getRepository(RoleEntity).delete(id); // role_permissions cascade
      } catch (err: any) {
        // someone was assigned this role between the count and the delete:
        // users.staffRoleId is ON DELETE RESTRICT, so the DB refuses
        if (err?.code === '23503') {
          throw new ConflictException('Role was just assigned to someone - reassign them first');
        }
        throw err;
      }
      return {
        data: { deleted: true, id },
        audit: {
          action: 'role.delete',
          entity: 'role',
          entityId: id,
          changes: { name: role.name, permissions: this.rolePermissions(role) },
        },
      };
    });
  }

  // ---- staff ----------------------------------------------------------------

  async listStaff() {
    const users = await this.db.getRepository(UserEntity).find({
      where: { staffRoleId: Not(IsNull()) },
      relations: { staffRole: true },
    });
    return users
      .map((u) => this.staffView(u))
      .sort((a, b) => a.email.localeCompare(b.email));
  }

  // Give an existing account (customer who signed up, or Google user) a
  // staff role. They keep their own login method.
  async promote(actor: StaffAccess, dto: PromoteStaffDto): Promise<Result<any>> {
    return this.db.transaction(async (m) => {
      actor = await this.lockAndRefreshActor(m, actor);
      this.assertNotGuest(dto.email);
      const user = await this.findUserByEmail(m, dto.email);
      if (!user) {
        throw new NotFoundException(
          'No account with that email. Ask them to sign up first, or create a staff account instead.',
        );
      }
      this.assertNotGuest(user.email);
      this.assertNotSelf(actor, user.id);
      if (user.staffRoleId) {
        throw new ConflictException('Already a staff member - change their role instead');
      }
      const role = await this.loadRole(m, dto.roleId);
      this.assertCanAssign(actor, role);

      user.staffRoleId = role.id;
      user.staffActive = true;
      user.role = this.legacyRoleFor(role, user.role);
      await m.getRepository(UserEntity).save(user);

      return {
        data: this.staffView({ ...user, staffRole: role } as UserEntity),
        audit: {
          action: 'staff.promote',
          entity: 'user',
          entityId: user.id,
          changes: { email: user.email, role: { to: role.name } },
        },
      };
    });
  }

  // Create a brand-new password account that is staff from the start.
  async create(actor: StaffAccess, dto: CreateStaffDto): Promise<Result<any>> {
    return this.db.transaction(async (m) => {
      actor = await this.lockAndRefreshActor(m, actor);
      this.assertNotGuest(dto.email);
      if (await this.findUserByEmail(m, dto.email)) {
        throw new ConflictException(
          'An account with that email already exists - promote it instead',
        );
      }
      const role = await this.loadRole(m, dto.roleId);
      this.assertCanAssign(actor, role);

      const saved = await m.getRepository(UserEntity).save(
        m.getRepository(UserEntity).create({
          name: dto.name,
          email: dto.email,
          password: await bcrypt.hash(dto.password, await bcrypt.genSalt()),
          mbl_no: dto.mbl_no || null,
          uniqueId: uuidv4(),
          role: this.legacyRoleFor(role, 'customer'),
          staffRoleId: role.id,
          staffActive: true,
        }),
      );

      return {
        data: this.staffView({ ...saved, staffRole: role } as UserEntity),
        audit: {
          action: 'staff.create',
          entity: 'user',
          entityId: saved.id,
          changes: { email: saved.email, role: { to: role.name } },
        },
      };
    });
  }

  async update(actor: StaffAccess, userId: number, dto: UpdateStaffDto): Promise<Result<any>> {
    if (dto.roleId === undefined && dto.active === undefined) {
      throw new BadRequestException('Nothing to change');
    }
    return this.db.transaction(async (m) => {
      actor = await this.lockAndRefreshActor(m, actor);
      const user = await this.loadStaffMember(m, userId);
      this.assertNotSelf(actor, user.id);
      this.assertCanAssign(actor, user.staffRole); // must cover their CURRENT role

      const changes: Record<string, any> = {};
      let revokeSessions = false;
      let nextRole = user.staffRole;

      if (dto.roleId !== undefined && dto.roleId !== user.staffRoleId) {
        nextRole = await this.loadRole(m, dto.roleId);
        this.assertCanAssign(actor, nextRole); // ...and the NEW one
        changes.role = { from: user.staffRole.name, to: nextRole.name };
      }
      if (dto.active !== undefined && dto.active !== user.staffActive) {
        changes.active = { from: user.staffActive, to: dto.active };
        if (!dto.active) revokeSessions = true; // suspension logs them out everywhere
      }
      if (!Object.keys(changes).length) {
        return { data: this.staffView(user), audit: { action: 'staff.update', entity: 'user', entityId: user.id, changes } };
      }

      const losesOwner =
        user.staffRole.key === OWNER_ROLE_KEY &&
        (nextRole.key !== OWNER_ROLE_KEY || dto.active === false);
      if (losesOwner) await this.assertNotLastOwner(m, user.id);

      user.staffRoleId = nextRole.id;
      user.staffRole = nextRole;
      if (dto.active !== undefined) user.staffActive = dto.active;
      user.role = this.legacyRoleFor(nextRole, user.role);
      if (revokeSessions) user.tokenVersion = (user.tokenVersion || 0) + 1;
      await m.getRepository(UserEntity).save(user);

      return {
        data: this.staffView(user),
        audit: { action: 'staff.update', entity: 'user', entityId: user.id, changes: { email: user.email, ...changes, sessionsRevoked: revokeSessions } },
      };
    });
  }

  // Take away staff access entirely. The account stays (as a customer).
  async remove(actor: StaffAccess, userId: number): Promise<Result<any>> {
    return this.db.transaction(async (m) => {
      actor = await this.lockAndRefreshActor(m, actor);
      const user = await this.loadStaffMember(m, userId);
      this.assertNotSelf(actor, user.id);
      this.assertCanAssign(actor, user.staffRole);
      if (user.staffRole.key === OWNER_ROLE_KEY) await this.assertNotLastOwner(m, user.id);

      const formerRole = user.staffRole.name;
      user.staffRoleId = null;
      user.staffRole = null;
      user.staffActive = true;
      // never leave role='admin' behind - the boot backfill would re-grant Owner
      if (user.role === 'admin') user.role = 'customer';
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await m.getRepository(UserEntity).save(user);

      return {
        data: { removed: true, id: user.id },
        audit: { action: 'staff.remove', entity: 'user', entityId: user.id, changes: { email: user.email, role: { from: formerRole } } },
      };
    });
  }

  async resetPassword(actor: StaffAccess, userId: number, password: string): Promise<Result<any>> {
    return this.db.transaction(async (m) => {
      actor = await this.lockAndRefreshActor(m, actor);
      const user = await this.loadStaffMember(m, userId);
      this.assertNotSelf(actor, user.id);
      this.assertCanAssign(actor, user.staffRole);
      if (user.loggedInWith === 'Google') {
        throw new BadRequestException('This account signs in with Google and has no password');
      }
      user.password = await bcrypt.hash(password, await bcrypt.genSalt());
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await m.getRepository(UserEntity).save(user);
      return {
        data: { passwordReset: true, id: user.id },
        audit: { action: 'staff.password_reset', entity: 'user', entityId: user.id, changes: { email: user.email, sessionsRevoked: true } },
      };
    });
  }

  // ---- rules ----------------------------------------------------------------

  private validatePermissions(input: string[]): Permission[] {
    const unique = [...new Set(input || [])];
    const unknown = unique.filter((p) => !isPermission(p));
    if (unknown.length) throw new BadRequestException(`Unknown permission(s): ${unknown.join(', ')}`);
    const ownerOnly = unique.filter((p) => (OWNER_ONLY_PERMISSIONS as string[]).includes(p));
    if (ownerOnly.length) {
      throw new BadRequestException(`Only the Owner role can have: ${ownerOnly.join(', ')}`);
    }
    return unique as Permission[];
  }

  private assertCanGrant(actor: StaffAccess, permissions: Permission[]) {
    if (actor.isOwner) return;
    const held = new Set(actor.permissions);
    const missing = permissions.filter((p) => !held.has(p));
    if (missing.length) {
      throw new ForbiddenException(`You can't grant permissions you don't have: ${missing.join(', ')}`);
    }
  }

  // assign someone to (or act on someone holding) this role
  private assertCanAssign(actor: StaffAccess, role: RoleEntity) {
    if (role.key === OWNER_ROLE_KEY && !actor.isOwner) {
      throw new ForbiddenException('Only an Owner can manage Owners');
    }
    this.assertCanGrant(actor, this.rolePermissions(role));
  }

  private assertNotSelf(actor: StaffAccess, userId: number) {
    if (actor.userId === userId) {
      throw new ForbiddenException("You can't change your own staff access");
    }
  }

  private assertNotGuest(email: string) {
    if (GUEST_EMAIL.test(String(email).trim())) {
      throw new BadRequestException('Guest checkout identities cannot be staff');
    }
  }

  // Locks every active Owner row, so concurrent demotions serialise and the
  // second one sees the first one's result.
  private async assertNotLastOwner(m: EntityManager, targetUserId: number) {
    const owner = await m.getRepository(RoleEntity).findOne({ where: { key: OWNER_ROLE_KEY } });
    const owners = await m
      .getRepository(UserEntity)
      .createQueryBuilder('u')
      .select(['u.id'])
      .where('u.staffRoleId = :rid', { rid: owner.id })
      .andWhere('u.staffActive = true')
      .getMany();
    const others = owners.filter((o) => o.id !== targetUserId);
    if (others.length === 0) {
      throw new ConflictException('This is the last active Owner - make someone else an Owner first');
    }
  }

  private async assertRoleNameFree(m: EntityManager, name: string, exceptId?: number) {
    const n = name.trim().toLowerCase();
    const reserved = BUILT_IN_ROLES.some(
      (r) => r.key === n || r.name.toLowerCase() === n || r.legacyNames.includes(n),
    );
    if (reserved) throw new ConflictException('That name is reserved for a built-in role');
    const clash = await m
      .getRepository(RoleEntity)
      .createQueryBuilder('r')
      .where('LOWER(r.name) = :n', { n })
      .andWhere(exceptId ? 'r.id <> :id' : '1=1', { id: exceptId })
      .getOne();
    if (clash) throw new ConflictException('A role with that name already exists');
  }

  private async uniqueCustomKey(m: EntityManager, name: string) {
    const base =
      'custom_' +
      (name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'role');
    let key = base;
    for (let i = 2; (await m.getRepository(RoleEntity).count({ where: { key } })) > 0; i++) key = `${base}_${i}`;
    return key;
  }

  private async replacePermissions(m: EntityManager, roleId: number, permissions: Permission[]) {
    await m.getRepository(RolePermissionEntity).delete({ roleId });
    if (permissions.length) {
      await m.getRepository(RolePermissionEntity).insert(permissions.map((permission) => ({ roleId, permission })));
    }
  }

  private async loadRole(m: EntityManager, id: number) {
    const role = await m.getRepository(RoleEntity).findOne({
      where: { id: Number(id) },
      relations: { permissions: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  private async loadStaffMember(m: EntityManager, userId: number) {
    const user = await m.getRepository(UserEntity).findOne({
      where: { id: Number(userId) },
      relations: { staffRole: { permissions: true } },
    });
    if (!user || !user.staffRoleId || !user.staffRole) {
      throw new NotFoundException('Staff member not found');
    }
    return user;
  }

  private async findUserByEmail(m: EntityManager, email: string) {
    const qb = m
      .getRepository(UserEntity)
      .createQueryBuilder('u')
      .where('LOWER(u.email) = LOWER(:email)', { email: email.trim() });
    const matches = await qb.getMany();
    if (matches.length > 1) {
      throw new ConflictException('Several accounts match that email (different letter case) - fix them first');
    }
    return matches[0] || null;
  }

  private rolePermissions(role: RoleEntity): Permission[] {
    if (role.key === OWNER_ROLE_KEY) return [...ALL_PERMISSIONS];
    return (role.permissions || []).map((rp) => rp.permission).filter(isPermission) as Permission[];
  }

  // legacy users.role: 'admin' exactly for Owners; never invents 'admin'
  private legacyRoleFor(role: RoleEntity, current: string) {
    if (role.key === OWNER_ROLE_KEY) return 'admin';
    return current === 'admin' ? 'customer' : current || 'customer';
  }

  private roleView(role: RoleEntity, memberCount: number) {
    const isOwner = role.key === OWNER_ROLE_KEY;
    return {
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      isOwner,
      locked: isOwner,
      permissions: this.rolePermissions(role),
      memberCount,
    };
  }

  private staffView(u: UserEntity) {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      mbl_no: u.mbl_no,
      active: u.staffActive,
      loginMethod: u.loggedInWith === 'Google' ? 'google' : u.password ? 'password' : 'other',
      role: u.staffRole ? { id: u.staffRole.id, key: u.staffRole.key, name: u.staffRole.name } : null,
      createdAt: u.created_at,
    };
  }
}
