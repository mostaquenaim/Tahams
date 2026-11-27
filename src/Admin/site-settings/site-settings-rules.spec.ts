import {
  checkContact,
  checkPromoBanners,
  checkSetting,
  checkShowrooms,
  checkSocial,
  isSettingKey,
  normalizeBdPhone,
} from './site-settings-rules';

const contact = {
  phone: '+8801347519967',
  whatsapp: '01347519967',
  email: 'TahamsBD@gmail.com ',
  supportHours: 'Sat–Thu, 10 AM – 6 PM',
  headOfficeAddress: '2nd Floor, Maa House,\r\nShyamoli, Dhaka-1207',
  headOfficeMapUrl: 'https://maps.app.goo.gl/w6CFtf6APKZ5FF8S6',
};

const showroom = (over = {}) => ({
  id: 'dc1',
  name: 'Display Center 1',
  pickupName: 'DC1 - Shahabuddin Plaza',
  address: 'Shop No. 36-37, Ring Road, Dhaka-1207',
  phone: '01314188605',
  mapUrl: 'https://maps.app.goo.gl/89rVTtxgdV5G1E3j9',
  pickup: true,
  ...over,
});

describe('normalizeBdPhone', () => {
  it.each([
    ['01347519967', '+8801347519967'],
    ['+880 1347-519967', '+8801347519967'],
    ['8801347519967', '+8801347519967'],
  ])('%s -> %s', (raw, want) => expect(normalizeBdPhone(raw)).toBe(want));

  it.each(['0134751996', '01247519967', '+1 555 0100', '', 12])('rejects %p', (raw) =>
    expect(normalizeBdPhone(raw)).toBeNull(),
  );
});

describe('isSettingKey', () => {
  it('knows the four keys only', () => {
    expect(['contact', 'showrooms', 'social', 'promoBanners'].every(isSettingKey)).toBe(true);
    expect(isSettingKey('paymentMethods')).toBe(false);
    expect(isSettingKey('__proto__')).toBe(false);
  });
});

describe('checkContact', () => {
  it('tidies a good value', () => {
    const { value, problems } = checkContact(contact);
    expect(problems).toEqual([]);
    expect(value).toEqual({
      ...contact,
      whatsapp: '+8801347519967',
      email: 'tahamsbd@gmail.com',
      headOfficeAddress: '2nd Floor, Maa House,\nShyamoli, Dhaka-1207',
    });
  });

  it('needs phone, email and address', () => {
    const { value, problems } = checkContact({});
    expect(value).toBeNull();
    expect(problems).toEqual([
      'Phone is required.',
      'Email is required.',
      'Head office address is required.',
    ]);
  });

  it('refuses a bad phone, email, map link and unknown fields', () => {
    const { problems } = checkContact({
      ...contact,
      phone: '12345',
      email: 'not-an-email',
      headOfficeMapUrl: 'http://maps.example.com',
      fax: '123',
    });
    expect(problems).toEqual([
      'Phone "12345" is not a Bangladeshi mobile number (like 01712345678).',
      'Email "not-an-email" is not an email address.',
      'Head office map link must be a full link starting with https://.',
      'unknown field fax.',
    ]);
  });

  it('refuses non-objects', () => {
    expect(checkContact([]).problems).toEqual(['Contact details must be an object.']);
    expect(checkContact(null).problems).toEqual(['Contact details must be an object.']);
  });
});

describe('checkShowrooms', () => {
  it('accepts a list and normalises phones', () => {
    const { value, problems } = checkShowrooms([showroom()]);
    expect(problems).toEqual([]);
    expect(value).toEqual([{ ...showroom(), phone: '+8801314188605' }]);
  });

  it('accepts an empty list (no showrooms, no store pickup)', () => {
    expect(checkShowrooms([])).toEqual({ value: [], problems: [] });
  });

  it('needs a pickup name only when pickup is on', () => {
    expect(checkShowrooms([showroom({ pickup: false, pickupName: '' })]).problems).toEqual([]);
    expect(checkShowrooms([showroom({ pickupName: '' })]).problems).toEqual([
      'Showroom 1: Pickup name is required.',
    ]);
  });

  it('refuses duplicate ids and pickup names', () => {
    const { problems } = checkShowrooms([showroom(), showroom({ id: 'DC1' })]);
    expect(problems).toEqual([
      'Showroom 2: ID may only use lower-case letters, digits and dashes.',
      'Two showrooms have the same ID "dc1".',
      'Two showrooms have the same pickup name "dc1 - shahabuddin plaza".',
    ]);
  });

  it('refuses too many', () => {
    const many = Array.from({ length: 21 }, (_, i) => showroom({ id: `s${i}`, pickupName: `P${i}` }));
    expect(checkShowrooms(many).problems).toEqual(['At most 20 showrooms.']);
  });
});

describe('checkSocial', () => {
  it('accepts matching sites and empty links', () => {
    const { value, problems } = checkSocial({
      facebook: 'https://www.facebook.com/tahamsbd/',
      instagram: 'https://www.instagram.com/tahams_bd/',
      tiktok: '',
      messenger: 'https://m.me/111664024670524',
    });
    expect(problems).toEqual([]);
    expect(value).toMatchObject({ tiktok: null });
  });

  it('refuses a link to the wrong site', () => {
    expect(checkSocial({ facebook: 'https://www.instagram.com/tahams_bd/' }).problems).toEqual([
      'Facebook link must be a facebook.com or fb.com link.',
    ]);
    // not fooled by look-alike hosts
    expect(checkSocial({ facebook: 'https://facebook.com.evil.test/x' }).problems).toHaveLength(1);
  });
});

describe('checkPromoBanners', () => {
  const banner = {
    text: 'Order easily',
    bgColor: '#FFFFFF',
    textColor: '#000000',
    links: [
      { text: 'Call Now', url: 'tel:01314188605' },
      { text: 'Facebook', url: 'https://www.facebook.com/tahamsbd' },
    ],
  };

  it('tidies a good banner', () => {
    const { value, problems } = checkPromoBanners([banner]);
    expect(problems).toEqual([]);
    expect(value).toEqual([
      {
        ...banner,
        bgColor: '#ffffff',
        active: true,
        links: [
          { text: 'Call Now', url: 'tel:+8801314188605' },
          { text: 'Facebook', url: 'https://www.facebook.com/tahamsbd' },
        ],
      },
    ]);
  });

  it('refuses unreadable colours, bad links and javascript: urls', () => {
    const { problems } = checkPromoBanners([
      {
        text: 'Hi',
        bgColor: '#000000',
        textColor: '#000000',
        links: [{ text: 'x', url: 'javascript:alert(1)' }, { text: 'y', url: 'tel:123' }],
      },
    ]);
    expect(problems).toEqual([
      "Banner 1: text and background are the same colour, so the text can't be read.",
      'Banner 1, link 1: "javascript:alert(1)" must be an https:// link, tel: with a Bangladeshi mobile number, or mailto: with an email.',
      'Banner 1, link 2: "tel:123" must be an https:// link, tel: with a Bangladeshi mobile number, or mailto: with an email.',
    ]);
  });

  it('needs banner text', () => {
    expect(checkPromoBanners([{ text: '  ' }]).problems).toEqual(['Banner 1: Text is required.']);
  });
});

describe('checkSetting', () => {
  it('routes by key', () => {
    expect(checkSetting('social', {}).problems).toEqual([]);
    expect(checkSetting('showrooms', {}).problems).toEqual(['Showrooms must be a list.']);
  });
});
