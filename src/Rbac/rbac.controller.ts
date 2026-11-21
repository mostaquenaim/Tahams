import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { RequireAnyPermission, RequirePermissions } from './access.decorators';
import { P } from './permissions';
import { StaffService } from './staff.service';
import { AuditService } from './audit.service';
import {
  CreateRoleDto,
  CreateStaffDto,
  PromoteStaffDto,
  ResetStaffPasswordDto,
  UpdateRoleDto,
  UpdateStaffDto,
} from './rbac.dto';

// Strict body validation for these routes only: unknown fields are an
// error, not silently ignored (so `{"role":"admin"}`-style extras can't
// sneak through).
const Strict = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

// Staff, role and audit-log management. Lives under /api/admin next to the
// existing admin routes. Every write here is also recorded by the global
// AuditInterceptor; handlers add a named action + before/after via req.audit.
@Controller('admin')
export class RbacController {
  constructor(
    private readonly staff: StaffService,
    private readonly audit: AuditService,
  ) {}

  private respond(req: any, result: { data: any; audit: any }) {
    req.audit = result.audit;
    return result.data;
  }

  // ---- roles ----

  @RequireAnyPermission(P.ROLES_MANAGE, P.STAFF_VIEW)
  @Get('roles')
  listRoles() {
    return this.staff.listRoles();
  }

  @RequirePermissions(P.ROLES_MANAGE)
  @Post('roles')
  async createRole(@Req() req, @Body(Strict) dto: CreateRoleDto) {
    return this.respond(req, await this.staff.createRole(req.staff, dto));
  }

  @RequirePermissions(P.ROLES_MANAGE)
  @Patch('roles/:id')
  async updateRole(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(Strict) dto: UpdateRoleDto,
  ) {
    return this.respond(req, await this.staff.updateRole(req.staff, id, dto));
  }

  @RequirePermissions(P.ROLES_MANAGE)
  @Delete('roles/:id')
  async deleteRole(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.respond(req, await this.staff.deleteRole(req.staff, id));
  }

  // ---- staff ----

  @RequirePermissions(P.STAFF_VIEW)
  @Get('staff')
  listStaff() {
    return this.staff.listStaff();
  }

  @RequirePermissions(P.STAFF_MANAGE)
  @Post('staff/promote')
  async promote(@Req() req, @Body(Strict) dto: PromoteStaffDto) {
    return this.respond(req, await this.staff.promote(req.staff, dto));
  }

  @RequirePermissions(P.STAFF_MANAGE)
  @Post('staff')
  async create(@Req() req, @Body(Strict) dto: CreateStaffDto) {
    return this.respond(req, await this.staff.create(req.staff, dto));
  }

  @RequirePermissions(P.STAFF_MANAGE)
  @Patch('staff/:id')
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(Strict) dto: UpdateStaffDto,
  ) {
    return this.respond(req, await this.staff.update(req.staff, id, dto));
  }

  @RequirePermissions(P.STAFF_MANAGE)
  @Delete('staff/:id')
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.respond(req, await this.staff.remove(req.staff, id));
  }

  @RequirePermissions(P.STAFF_MANAGE)
  @Post('staff/:id/password')
  async resetPassword(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(Strict) dto: ResetStaffPasswordDto,
  ) {
    return this.respond(
      req,
      await this.staff.resetPassword(req.staff, id, dto.password),
    );
  }

  // ---- audit log ----

  @RequirePermissions(P.AUDIT_VIEW)
  @Get('audit-logs')
  listAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.audit.list({
      page: Number(page),
      limit: Number(limit),
      actorId: actorId ? Number(actorId) : undefined,
      action,
      entity,
      entityId,
      from,
      to,
    });
  }
}
