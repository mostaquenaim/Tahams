/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Put, Req } from '@nestjs/common';
import { Public, RequirePermissions } from 'src/Rbac/access.decorators';
import { P } from 'src/Rbac/permissions';
import { SiteSettingsService } from './site-settings.service';

// Public business details the storefront shows (contact info, showrooms,
// social links, promo banners). The storefront keeps built-in defaults and
// uses them for any key that isn't saved here, or when this route can't be
// reached. Bodies are checked by site-settings-rules.ts, not a DTO, because
// each key has its own shape.
@Controller('admin')
export class SiteSettingsController {
  constructor(private readonly settings: SiteSettingsService) {}

  @Public()
  @Get('site-settings')
  listPublic() {
    return this.settings.listPublic();
  }

  @RequirePermissions(P.SETTINGS_MANAGE)
  @Get('site-settings/manage')
  listForAdmin() {
    return this.settings.listForAdmin();
  }

  // Audited (AuditInterceptor) with a named action and before/after.
  @RequirePermissions(P.SETTINGS_MANAGE)
  @Put('site-settings/:key')
  async save(@Req() req, @Param('key') key: string, @Body() body: unknown) {
    const { data, audit } = await this.settings.save(key, body);
    req.audit = audit;
    return data;
  }

  @RequirePermissions(P.SETTINGS_MANAGE)
  @Delete('site-settings/:key')
  async reset(@Req() req, @Param('key') key: string) {
    const { data, audit } = await this.settings.reset(key);
    req.audit = audit;
    return data;
  }
}
