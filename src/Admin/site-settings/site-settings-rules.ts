/* eslint-disable prettier/prettier */
// What each site setting may hold, and the checks run before saving one.
// Everything here is public (it is shown on the storefront); the checks are
// there to stop typos going live: a phone number customers can't call, a
// link to the wrong site, an empty banner.
//
// check(key, raw) returns the tidied value (trimmed, phones in one format)
// plus a list of problems written for the admin. Unknown fields are a
// problem, never silently dropped.

export const SETTING_KEYS = ['contact', 'showrooms', 'social', 'promoBanners'] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export const isSettingKey = (value: unknown): value is SettingKey =>
  typeof value === 'string' && (SETTING_KEYS as readonly string[]).includes(value);

export const MAX_SHOWROOMS = 20;
export const MAX_BANNERS = 10;
export const MAX_BANNER_LINKS = 5;

type Result<T> = { value: T | null; problems: string[] };

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

// Bangladeshi mobile numbers, stored as +8801XXXXXXXXX. Accepts the usual
// ways of writing one (01..., 8801..., +88 01..., with spaces or dashes).
export const normalizeBdPhone = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  let digits = raw.replace(/[\s\-()]/g, '');
  if (digits.startsWith('+88')) digits = digits.slice(3);
  else if (digits.startsWith('88') && digits.length === 13) digits = digits.slice(2);
  return /^01[3-9]\d{8}$/.test(digits) ? `+88${digits}` : null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const SHOWROOM_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,29}$/;

const httpsUrl = (raw: string): URL | null => {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && url.hostname.includes('.') ? url : null;
  } catch {
    return null;
  }
};

const hostIs = (url: URL, hosts: string[]) => {
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  return hosts.some((h) => host === h || host.endsWith(`.${h}`));
};

// Small helper that walks one object, collecting tidied fields and problems.
class Reader {
  readonly out: Record<string, unknown> = {};
  constructor(
    private readonly obj: Record<string, unknown>,
    private readonly where: string,
    private readonly problems: string[],
  ) {}

  private label(field: string, label: string) {
    return this.where ? `${this.where}: ${label}` : label;
  }

  // Trimmed text; Windows line breaks normalised. '' counts as missing.
  text(field: string, label: string, opts: { max: number; required?: boolean; multiline?: boolean }) {
    const raw = this.obj[field];
    if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
      if (opts.required) this.problems.push(`${this.label(field, label)} is required.`);
      this.out[field] = null;
      return null;
    }
    if (typeof raw !== 'string') {
      this.problems.push(`${this.label(field, label)} must be text.`);
      return null;
    }
    let value = raw.replace(/\r\n?/g, '\n').trim();
    if (!opts.multiline) value = value.replace(/\s*\n\s*/g, ' ');
    else value = value.replace(/\n{3,}/g, '\n\n');
    if (value.length > opts.max) {
      this.problems.push(`${this.label(field, label)} must be at most ${opts.max} characters.`);
    }
    this.out[field] = value;
    return value;
  }

  phone(field: string, label: string, opts: { required?: boolean } = {}) {
    const raw = this.text(field, label, { max: 30, required: opts.required });
    if (raw === null) return null;
    const phone = normalizeBdPhone(raw);
    if (!phone) {
      this.problems.push(
        `${this.label(field, label)} "${raw}" is not a Bangladeshi mobile number (like 01712345678).`,
      );
      return null;
    }
    this.out[field] = phone;
    return phone;
  }

  url(field: string, label: string, opts: { hosts?: string[]; required?: boolean } = {}) {
    const raw = this.text(field, label, { max: 500, required: opts.required });
    if (raw === null) return null;
    const url = httpsUrl(raw);
    if (!url) {
      this.problems.push(`${this.label(field, label)} must be a full link starting with https://.`);
      return null;
    }
    if (opts.hosts && !hostIs(url, opts.hosts)) {
      this.problems.push(`${this.label(field, label)} must be a ${opts.hosts.join(' or ')} link.`);
      return null;
    }
    return raw;
  }

  bool(field: string, label: string, fallback: boolean) {
    const raw = this.obj[field];
    if (raw === undefined) {
      this.out[field] = fallback;
      return fallback;
    }
    if (typeof raw !== 'boolean') {
      this.problems.push(`${this.label(field, label)} must be true or false.`);
      return fallback;
    }
    this.out[field] = raw;
    return raw;
  }

  color(field: string, label: string, fallback: string) {
    const raw = this.obj[field];
    if (raw === undefined || raw === null || raw === '') {
      this.out[field] = fallback;
      return fallback;
    }
    if (typeof raw !== 'string' || !COLOR_PATTERN.test(raw.trim())) {
      this.problems.push(`${this.label(field, label)} must be a colour like #ffffff.`);
      return fallback;
    }
    const value = raw.trim().toLowerCase();
    this.out[field] = value;
    return value;
  }

  // Call last: complains about any field nobody read.
  noOtherFields(known: string[]) {
    const extra = Object.keys(this.obj).filter((k) => !known.includes(k));
    if (extra.length) {
      this.problems.push(
        `${this.where ? `${this.where}: ` : ''}unknown field${extra.length > 1 ? 's' : ''} ${extra.join(', ')}.`,
      );
    }
  }
}

const CONTACT_FIELDS = ['phone', 'whatsapp', 'email', 'supportHours', 'headOfficeAddress', 'headOfficeMapUrl'];

export const checkContact = (raw: unknown): Result<Record<string, unknown>> => {
  const problems: string[] = [];
  if (!isPlainObject(raw)) return { value: null, problems: ['Contact details must be an object.'] };
  const r = new Reader(raw, '', problems);
  r.phone('phone', 'Phone', { required: true });
  r.phone('whatsapp', 'WhatsApp number');
  const email = r.text('email', 'Email', { max: 120, required: true });
  if (email !== null) {
    const lower = email.toLowerCase();
    if (!EMAIL_PATTERN.test(lower)) problems.push(`Email "${email}" is not an email address.`);
    r.out.email = lower;
  }
  r.text('supportHours', 'Contact hours', { max: 80 });
  r.text('headOfficeAddress', 'Head office address', { max: 300, required: true, multiline: true });
  r.url('headOfficeMapUrl', 'Head office map link');
  r.noOtherFields(CONTACT_FIELDS);
  return { value: problems.length ? null : r.out, problems };
};

const SHOWROOM_FIELDS = ['id', 'name', 'pickupName', 'address', 'phone', 'mapUrl', 'pickup'];

export const checkShowrooms = (raw: unknown): Result<Record<string, unknown>[]> => {
  const problems: string[] = [];
  if (!Array.isArray(raw)) return { value: null, problems: ['Showrooms must be a list.'] };
  if (raw.length > MAX_SHOWROOMS) problems.push(`At most ${MAX_SHOWROOMS} showrooms.`);

  const out = raw.slice(0, MAX_SHOWROOMS).map((item, index) => {
    const where = `Showroom ${index + 1}`;
    if (!isPlainObject(item)) {
      problems.push(`${where} must be an object.`);
      return null;
    }
    const r = new Reader(item, where, problems);
    const id = r.text('id', 'ID', { max: 30, required: true });
    if (id !== null && !SHOWROOM_ID_PATTERN.test(id)) {
      problems.push(`${where}: ID may only use lower-case letters, digits and dashes.`);
    }
    r.text('name', 'Name', { max: 60, required: true });
    const pickup = r.bool('pickup', 'Store pickup', false);
    // The name saved on pickup orders and shown to staff, so it must exist
    // whenever customers can pick up here.
    r.text('pickupName', 'Pickup name', { max: 80, required: pickup });
    r.text('address', 'Address', { max: 300, required: true, multiline: true });
    r.phone('phone', 'Phone');
    r.url('mapUrl', 'Map link');
    r.noOtherFields(SHOWROOM_FIELDS);
    return r.out;
  });

  const seen = (field: string, label: string) => {
    const counts = new Map<string, number>();
    for (const s of out) {
      const v = s?.[field];
      if (typeof v === 'string') counts.set(v.toLowerCase(), (counts.get(v.toLowerCase()) ?? 0) + 1);
    }
    for (const [v, n] of counts) if (n > 1) problems.push(`Two showrooms have the same ${label} "${v}".`);
  };
  seen('id', 'ID');
  seen('pickupName', 'pickup name');

  return { value: problems.length ? null : (out as Record<string, unknown>[]), problems };
};

// Which site each social link must point at, so a pasted Instagram link
// can't end up behind the Facebook icon.
export const SOCIAL_HOSTS: Record<string, string[]> = {
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  tiktok: ['tiktok.com'],
  messenger: ['m.me', 'messenger.com'],
};
const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  messenger: 'Messenger',
};

export const checkSocial = (raw: unknown): Result<Record<string, unknown>> => {
  const problems: string[] = [];
  if (!isPlainObject(raw)) return { value: null, problems: ['Social links must be an object.'] };
  const r = new Reader(raw, '', problems);
  for (const field of Object.keys(SOCIAL_HOSTS)) {
    r.url(field, `${SOCIAL_LABELS[field]} link`, { hosts: SOCIAL_HOSTS[field] });
  }
  r.noOtherFields(Object.keys(SOCIAL_HOSTS));
  return { value: problems.length ? null : r.out, problems };
};

// Banner links may also call or email (tel:/mailto:).
const checkBannerLinkUrl = (raw: string): string | null => {
  if (/^tel:/i.test(raw)) {
    const phone = normalizeBdPhone(raw.slice(4));
    return phone ? `tel:${phone}` : null;
  }
  if (/^mailto:/i.test(raw)) {
    const email = raw.slice(7).trim().toLowerCase();
    return EMAIL_PATTERN.test(email) ? `mailto:${email}` : null;
  }
  return httpsUrl(raw) ? raw : null;
};

const BANNER_FIELDS = ['text', 'bgColor', 'textColor', 'links', 'active'];
const LINK_FIELDS = ['text', 'url'];

export const checkPromoBanners = (raw: unknown): Result<Record<string, unknown>[]> => {
  const problems: string[] = [];
  if (!Array.isArray(raw)) return { value: null, problems: ['Promo banners must be a list.'] };
  if (raw.length > MAX_BANNERS) problems.push(`At most ${MAX_BANNERS} banners.`);

  const out = raw.slice(0, MAX_BANNERS).map((item, index) => {
    const where = `Banner ${index + 1}`;
    if (!isPlainObject(item)) {
      problems.push(`${where} must be an object.`);
      return null;
    }
    const r = new Reader(item, where, problems);
    r.text('text', 'Text', { max: 200, required: true });
    const bg = r.color('bgColor', 'Background colour', '#ffffff');
    const fg = r.color('textColor', 'Text colour', '#000000');
    if (bg === fg) problems.push(`${where}: text and background are the same colour, so the text can't be read.`);
    r.bool('active', 'Shown', true);

    const links = item.links ?? [];
    if (!Array.isArray(links)) {
      problems.push(`${where}: links must be a list.`);
    } else {
      if (links.length > MAX_BANNER_LINKS) problems.push(`${where}: at most ${MAX_BANNER_LINKS} links.`);
      r.out.links = links.slice(0, MAX_BANNER_LINKS).map((link, li) => {
        const lw = `${where}, link ${li + 1}`;
        if (!isPlainObject(link)) {
          problems.push(`${lw} must be an object.`);
          return null;
        }
        const lr = new Reader(link, lw, problems);
        lr.text('text', 'Text', { max: 30, required: true });
        const url = lr.text('url', 'Link', { max: 500, required: true });
        if (url !== null) {
          const checked = checkBannerLinkUrl(url);
          if (!checked) {
            problems.push(
              `${lw}: "${url}" must be an https:// link, tel: with a Bangladeshi mobile number, or mailto: with an email.`,
            );
          } else lr.out.url = checked;
        }
        lr.noOtherFields(LINK_FIELDS);
        return lr.out;
      });
    }
    r.noOtherFields(BANNER_FIELDS);
    return r.out;
  });

  return { value: problems.length ? null : (out as Record<string, unknown>[]), problems };
};

const CHECKS: Record<SettingKey, (raw: unknown) => Result<unknown>> = {
  contact: checkContact,
  showrooms: checkShowrooms,
  social: checkSocial,
  promoBanners: checkPromoBanners,
};

export const checkSetting = (key: SettingKey, raw: unknown): Result<unknown> => CHECKS[key](raw);
