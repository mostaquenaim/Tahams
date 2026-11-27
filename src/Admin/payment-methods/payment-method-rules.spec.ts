import {
  checkMethod,
  defaultDetails,
  defaultKindFor,
  EditableDetails,
  ICON_PATTERN,
  isPayLaterMethod,
  planDefaultFill,
} from './payment-method-rules';

// Production names (the storefront's old utils/Methods.js) and the dev seed.
describe('defaultKindFor', () => {
  it.each([
    ['Cash on Delivery', 'cod'],
    ['COD', 'cod'],
    ['BKash', 'bkash'],
    ['bKash', 'bkash'],
    ['Nagad', 'nagad'],
    ['Rocket', 'rocket'],
    ['Visa Card', 'visa'],
    ['Bank Transfer', 'bank'],
    ['Amex Card', 'amex'],
    ['Pick-Up Point', 'pickup'],
    ['Pickup Point', 'pickup'],
    ['  Nagad  ', 'nagad'],
  ])('%s -> %s', (name, kind) => {
    expect(defaultKindFor(name)).toBe(kind);
  });

  it.each(['Card Payment', 'Bank of X wallet', '', null, undefined, 'bKash or Nagad'])(
    'no default for %p',
    (name) => {
      expect(defaultKindFor(name as any)).toBeNull();
    },
  );
});

describe('defaults keep the old storefront values', () => {
  it('online methods carry the old numbers, shown in their instructions', () => {
    expect(defaultDetails('bkash')).toMatchObject({ accountNumber: '01314188605', payOnline: true, isActive: true });
    expect(defaultDetails('nagad')).toMatchObject({ accountNumber: '01602054102', payOnline: true });
    expect(defaultDetails('rocket')).toMatchObject({ accountNumber: '01602054102', payOnline: true });
    expect(defaultDetails('bank')).toMatchObject({ accountNumber: '1233871270001', payOnline: true });
  });

  it('cards that were commented out start switched off', () => {
    expect(defaultDetails('visa')).toMatchObject({ isActive: false, payOnline: false });
    expect(defaultDetails('amex')).toMatchObject({ isActive: false, payOnline: false });
  });

  it('every default passes the same checks an admin edit must pass', () => {
    const rows = [
      ['cod', 'Cash on Delivery', 1],
      ['bkash', 'BKash', 2],
      ['nagad', 'Nagad', 3],
      ['rocket', 'Rocket', 4],
      ['visa', 'Visa Card', 5],
      ['bank', 'Bank Transfer', 6],
      ['amex', 'Amex Card', 7],
      ['pickup', 'Pick-Up Point', 8],
    ] as const;
    for (const [kind, name, id] of rows) {
      const d = defaultDetails(kind);
      expect(checkMethod({ id, name }, d)).toEqual([]);
      expect(d.icon).toMatch(ICON_PATTERN);
    }
  });

  it('returns a copy, so callers cannot change the table', () => {
    defaultDetails('bkash').accountNumber = '0';
    expect(defaultDetails('bkash').accountNumber).toBe('01314188605');
  });
});

describe('planDefaultFill', () => {
  it('fills production-like rows, matched by name not id', () => {
    const plan = planDefaultFill([
      { id: 4, name: 'Cash on Delivery' },
      { id: 9, name: 'bKash' },
      { id: 12, name: 'Card Payment' },
    ]);
    expect(plan.fill.map((r) => [r.id, r.kind])).toEqual([
      [4, 'cod'],
      [9, 'bkash'],
    ]);
    expect(plan.unmatched).toEqual([{ id: 12, name: 'Card Payment' }]);
    expect(plan.ambiguous).toEqual([]);
  });

  it('fills neither row when two look like the same method', () => {
    const plan = planDefaultFill([
      { id: 2, name: 'BKash' },
      { id: 5, name: 'bKash merchant' },
      { id: 3, name: 'Nagad' },
    ]);
    expect(plan.fill.map((r) => r.id)).toEqual([3]);
    expect(plan.ambiguous).toEqual([
      { kind: 'bkash', rows: [{ id: 2, name: 'BKash' }, { id: 5, name: 'bKash merchant' }] },
    ]);
  });
});

describe('checkMethod', () => {
  const online: EditableDetails = {
    instructions: 'Merchant Number: 01700000000 (PAYMENT)',
    accountNumber: '01700000000',
    icon: '/bkash-bnw.png',
    payOnline: true,
    isActive: true,
    sortOrder: 20,
  };
  const bkash = { id: 2, name: 'BKash' };

  it('accepts a consistent online method', () => {
    expect(checkMethod(bkash, online)).toEqual([]);
  });

  it('refuses instructions that show a different number', () => {
    const problems = checkMethod(bkash, { ...online, accountNumber: '01800000000' });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('01800000000');
  });

  it('refuses an active online method without instructions or number', () => {
    expect(checkMethod(bkash, { ...online, instructions: null })).toHaveLength(1);
    expect(checkMethod(bkash, { ...online, accountNumber: null })).toHaveLength(1);
  });

  it('lets an inactive method be incomplete', () => {
    expect(
      checkMethod(bkash, { ...online, isActive: false, instructions: null, accountNumber: null }),
    ).toEqual([]);
  });

  it('never lets cash on delivery or pickup become online or be switched off', () => {
    const cod = { id: 1, name: 'Cash on Delivery' };
    const base = { ...online, instructions: 'Pay on delivery', accountNumber: null, payOnline: false };
    expect(checkMethod(cod, base)).toEqual([]);
    expect(checkMethod(cod, { ...base, payOnline: true, accountNumber: '01700000000', instructions: '01700000000' })).toHaveLength(1);
    expect(checkMethod(cod, { ...base, isActive: false })).toHaveLength(1);
    expect(checkMethod({ id: 30, name: 'Pick-Up Point' }, { ...base, isActive: false })).toHaveLength(1);
  });
});

describe('isPayLaterMethod', () => {
  it.each([
    [{ id: 1, name: 'anything' }, true],
    [{ id: 8, name: 'anything' }, true],
    [{ id: 4, name: 'Cash on Delivery' }, true],
    [{ id: 30, name: 'Pick-Up Point' }, true],
    [{ id: 2, name: 'BKash' }, false],
    [null, false],
  ])('%p -> %p', (method, expected) => {
    expect(isPayLaterMethod(method as any)).toBe(expected);
  });
});

describe('ICON_PATTERN', () => {
  it.each(['/cod.png', '/delivery-methods/pathao-bnw.png', '/bank-transfer.jpg', '/x.webp', '/x.svg'])(
    'accepts %s',
    (p) => expect(p).toMatch(ICON_PATTERN),
  );
  it.each(['cod.png', 'https://evil.example/x.png', '/../secret.png', '/a/../b.png', '/x.js', '//evil/x.png', 'javascript:alert(1)'])(
    'refuses %s',
    (p) => expect(p).not.toMatch(ICON_PATTERN),
  );
});
