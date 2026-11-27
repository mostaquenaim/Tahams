/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// Public business details shown on the storefront (contact info, showrooms,
// social links, promo banners): one row per key, the value checked by
// src/Admin/site-settings/site-settings-rules.ts before it is saved.
// A key with no row means "not set yet": the storefront then shows its
// built-in defaults.
@Entity('site-setting')
export class SiteSettingEntity {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
