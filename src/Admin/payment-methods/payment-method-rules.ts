/* eslint-disable prettier/prettier */
// Rules for payment methods, kept free of Nest/TypeORM so they can be unit
// tested on their own (payment-method-rules.spec.ts).

// ---------------------------------------------------------------------------
// Cash on delivery and pay-at-pickup
// ---------------------------------------------------------------------------
// They are ids 1 and 8 in production, but ids depend on insert order (the dev
// seed puts Cash on Delivery at 4), so the name is the fallback.
export const PAY_LATER_METHODS = {
  cod: { id: 1, name: /cash\s*on\s*delivery|^cod$/i },
  pickup: { id: 8, name: /pick\s*-?\s*up/i },
} as const;

export type PayLaterKind = keyof typeof PAY_LATER_METHODS;

// True for cash on delivery / pay at pickup: no money has been taken yet.
export function isPayLaterMethod(method: { id?: number; name?: string } | null | undefined): boolean {
  if (!method) return false;
  const { cod, pickup } = PAY_LATER_METHODS;
  if (method.id === cod.id || method.id === pickup.id) return true;
  const name = method.name || '';
  return cod.name.test(name) || pickup.name.test(name);
}

// ---------------------------------------------------------------------------
// One-time fill of the details the storefront used to hard-code
// ---------------------------------------------------------------------------
// These are the values utils/Methods.js in the storefront showed customers
// before the details moved to the database. They are written ONCE into the
// rows that already exist (matched by name, because ids differ between
// databases) and never again: a row that has configuredAt is left alone, and
// rows created later get configuredAt when they are created. After that,
// the admin page is the only way to change them.
export type MethodDetails = {
  instructions: string | null;
  accountNumber: string | null;
  icon: string;
  payOnline: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type DefaultKind =
  | 'cod' | 'bkash' | 'nagad' | 'rocket' | 'visa' | 'bank' | 'amex' | 'pickup';

const DEFAULTS: { kind: DefaultKind; name: RegExp; details: MethodDetails }[] = [
  {
    kind: 'cod',
    name: PAY_LATER_METHODS.cod.name,
    details: { instructions: 'Payment upon delivery', accountNumber: null, icon: '/cod.png', payOnline: false, isActive: true, sortOrder: 10 },
  },
  {
    kind: 'bkash',
    name: /b\s*-?\s*kash/i,
    details: { instructions: 'Merchant Number: 01314188605 (PAYMENT)\nReference: Your name and amount you pay', accountNumber: '01314188605', icon: '/bkash-bnw.png', payOnline: true, isActive: true, sortOrder: 20 },
  },
  {
    kind: 'nagad',
    name: /nagad/i,
    details: { instructions: 'Merchant Number: 01602054102 (PAYMENT)\nReference: Your name and amount you pay', accountNumber: '01602054102', icon: '/nagad-bnw.png', payOnline: true, isActive: true, sortOrder: 30 },
  },
  {
    kind: 'rocket',
    name: /rocket/i,
    details: { instructions: 'Number: 01602054102 (Send Money)\nReference: Your name and amount you pay', accountNumber: '01602054102', icon: '/rocket-bnw.png', payOnline: true, isActive: true, sortOrder: 40 },
  },
  {
    // was commented out in the storefront, so it starts switched off
    kind: 'visa',
    name: /visa/i,
    details: { instructions: null, accountNumber: null, icon: '/visa.png', payOnline: false, isActive: false, sortOrder: 90 },
  },
  {
    kind: 'bank',
    name: /bank\s*transfer|^bank$/i,
    details: { instructions: 'Please proceed with your Bank details.\n\nBank Name: The City Bank Ltd.\nBranch Name: Shyamoli\nA/C NAME: TAHAMS\nA/C NUMBER: 1233871270001', accountNumber: '1233871270001', icon: '/bank-transfer.jpg', payOnline: true, isActive: true, sortOrder: 50 },
  },
  {
    // was commented out in the storefront, so it starts switched off
    kind: 'amex',
    name: /amex|american\s*express/i,
    details: { instructions: null, accountNumber: null, icon: '/amex.png', payOnline: false, isActive: false, sortOrder: 91 },
  },
  {
    kind: 'pickup',
    name: PAY_LATER_METHODS.pickup.name,
    details: { instructions: 'Pay when you pick up your item.', accountNumber: null, icon: '/cop-bnw.png', payOnline: false, isActive: true, sortOrder: 60 },
  },
];

// The default a method name stands for, or null when it matches none or
// more than one (e.g. "bKash or Nagad") - guessing would risk showing a
// customer the wrong number.
export function defaultKindFor(name: string | null | undefined): DefaultKind | null {
  const trimmed = String(name || '').trim();
  const hits = DEFAULTS.filter((d) => d.name.test(trimmed));
  return hits.length === 1 ? hits[0].kind : null;
}

export function defaultDetails(kind: DefaultKind): MethodDetails {
  return { ...DEFAULTS.find((d) => d.kind === kind)!.details };
}

// Decides which unconfigured rows get which defaults. A default is applied
// only when exactly one row stands for it; if two rows both look like bKash,
// neither is filled and the problem is reported instead.
export function planDefaultFill(rows: { id: number; name: string }[]) {
  const byKind = new Map<DefaultKind, { id: number; name: string }[]>();
  const unmatched: { id: number; name: string }[] = [];
  for (const row of rows) {
    const kind = defaultKindFor(row.name);
    if (!kind) {
      unmatched.push(row);
      continue;
    }
    byKind.set(kind, [...(byKind.get(kind) || []), row]);
  }
  const fill: { id: number; name: string; kind: DefaultKind; details: MethodDetails }[] = [];
  const ambiguous: { kind: DefaultKind; rows: { id: number; name: string }[] }[] = [];
  for (const [kind, matched] of byKind) {
    if (matched.length === 1) fill.push({ ...matched[0], kind, details: defaultDetails(kind) });
    else ambiguous.push({ kind, rows: matched });
  }
  return { fill, ambiguous, unmatched };
}

// ---------------------------------------------------------------------------
// Admin edits
// ---------------------------------------------------------------------------
export const ICON_PATTERN = /^\/(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9/_.-]{0,110}\.(png|jpe?g|webp|svg)$/i;
export const ACCOUNT_NUMBER_PATTERN = /^\d{6,20}$/;
export const MAX_INSTRUCTIONS = 1000;

export type EditableDetails = {
  instructions: string | null;
  accountNumber: string | null;
  icon: string | null;
  payOnline: boolean;
  isActive: boolean;
  sortOrder: number;
};

// Checks a method as it would be after an edit. Returns the problems in
// plain language (empty = OK). The DTO has already checked each field's
// format; these are the rules that involve more than one field.
export function checkMethod(
  method: { id: number; name: string },
  next: EditableDetails,
): string[] {
  const problems: string[] = [];
  const payLater = isPayLaterMethod(method);

  if (payLater && next.payOnline) {
    problems.push(`${method.name} is paid on delivery or at pickup, so it can't be an online payment.`);
  }
  if (payLater && !next.isActive) {
    problems.push(`${method.name} is part of checkout and can't be switched off here.`);
  }
  if (next.payOnline && next.isActive) {
    if (!next.instructions) problems.push('Online payment methods need instructions telling the customer how to pay.');
    if (!next.accountNumber) problems.push('Online payment methods need the number or account the customer pays to.');
  }
  // The Copy button copies accountNumber while the customer reads the
  // instructions - they must not disagree.
  if (next.accountNumber && next.instructions && !next.instructions.includes(next.accountNumber)) {
    problems.push(`The instructions must show the same number as the account number (${next.accountNumber}), so customers don't copy one number and read another.`);
  }
  return problems;
}
