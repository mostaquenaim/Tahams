/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettingEntity } from 'src/Global/Entities/site-setting.entity';
import { SETTING_KEYS, SettingKey, checkSetting, isSettingKey } from './site-settings-rules';

const asKey = (key: string): SettingKey => {
  if (!isSettingKey(key)) {
    throw new NotFoundException(`Unknown setting "${key}". Known: ${SETTING_KEYS.join(', ')}.`);
  }
  return key;
};

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSettingEntity)
    private readonly repo: Repository<SiteSettingEntity>,
  ) {}

  // The storefront's view: { contact?, showrooms?, social?, promoBanners? }.
  // A missing key means it was never saved (or was reset); the storefront
  // then uses its built-in default for it.
  async listPublic() {
    const rows = await this.repo.find();
    const out: Partial<Record<SettingKey, unknown>> = {};
    for (const row of rows) if (isSettingKey(row.key)) out[row.key] = row.value;
    return out;
  }

  // For the admin page: every key, saved or not, with when it was saved.
  async listForAdmin() {
    const rows = await this.repo.find();
    return SETTING_KEYS.map((key) => {
      const row = rows.find((r) => r.key === key);
      return { key, value: row?.value ?? null, updatedAt: row?.updatedAt ?? null };
    });
  }

  // Returns the saved setting plus a before/after for the audit log.
  async save(rawKey: string, body: unknown) {
    const key = asKey(rawKey);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Send { "value": ... }.');
    }
    const extra = Object.keys(body).filter((k) => k !== 'value');
    if (extra.length || !('value' in body)) {
      throw new BadRequestException('Send { "value": ... } and nothing else.');
    }

    const { value, problems } = checkSetting(key, (body as { value: unknown }).value);
    // A plain string: the admin page reads `message`.
    if (problems.length) throw new BadRequestException(problems.join(' '));

    const before = await this.repo.findOneBy({ key });
    const saved = await this.repo.save({ key, value });
    return {
      data: { key, value: saved.value, updatedAt: saved.updatedAt },
      audit: {
        action: 'site_setting.update',
        entity: 'site_setting',
        entityId: key,
        changes: { from: before?.value ?? null, to: saved.value },
      },
    };
  }

  // Back to the storefront's built-in default.
  async reset(rawKey: string) {
    const key = asKey(rawKey);
    const before = await this.repo.findOneBy({ key });
    if (before) await this.repo.delete({ key });
    return {
      data: { key, value: null, updatedAt: null },
      audit: {
        action: 'site_setting.reset',
        entity: 'site_setting',
        entityId: key,
        changes: { from: before?.value ?? null, to: null },
      },
    };
  }
}
