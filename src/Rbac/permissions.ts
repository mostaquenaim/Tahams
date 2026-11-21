// Single source of truth for staff permissions.
//
// Permissions are defined HERE, in code - never created at runtime. Roles
// (stored in the DB) are just named bundles of these keys, so a typo in a
// key is a compile error and a custom role can never grant something the
// backend doesn't actually enforce. Unknown keys found in the DB are pruned
// on boot (see RbacService.onModuleInit).

export const P = {
  // Overview
  DASHBOARD_VIEW: 'dashboard:view',
  FINANCE_VIEW: 'finance:view', // revenue / sales figures
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // Orders
  ORDERS_VIEW: 'orders:view',
  ORDERS_UPDATE_STATUS: 'orders:update_status',
  ORDERS_EDIT: 'orders:edit', // notes, order fields
  ORDERS_COURIER: 'orders:courier', // Pathao / courier info
  ORDERS_DELETE: 'orders:delete',

  // Returns & customizations
  RETURNS_VIEW: 'returns:view',
  RETURNS_PROCESS: 'returns:process',
  CUSTOMIZATIONS_VIEW: 'customizations:view',
  CUSTOMIZATIONS_MANAGE: 'customizations:manage',
  CUSTOMIZATIONS_DELETE: 'customizations:delete',

  // Customers
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CONTACT: 'customers:contact',

  // Products & inventory
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_PUBLISH: 'products:publish',
  PRODUCTS_DELETE: 'products:delete',
  PRICING_DISCOUNT: 'pricing:discount',
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_UPDATE: 'inventory:update',

  // Catalog structure (categories, types, series, sizes, colors, fabrics)
  CATALOG_MANAGE: 'catalog:manage',
  CATALOG_DELETE: 'catalog:delete',

  // Storefront content (banners, popups, home sections, new arrivals, navbar)
  CONTENT_MANAGE: 'content:manage',

  // Promotions & payments
  COUPONS_VIEW: 'coupons:view',
  COUPONS_MANAGE: 'coupons:manage',
  PAYMENTS_VIEW: 'payments:view',
  PAYMENT_METHODS_MANAGE: 'payment_methods:manage',

  // People & system
  STAFF_VIEW: 'staff:view',
  STAFF_MANAGE: 'staff:manage',
  ROLES_MANAGE: 'roles:manage',
  SETTINGS_MANAGE: 'settings:manage',
  SYSTEM_SYNC: 'system:sync',
  AUDIT_VIEW: 'audit:view',
} as const;

export type Permission = (typeof P)[keyof typeof P];

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(P);

const PERMISSION_SET = new Set<string>(ALL_PERMISSIONS);
export const isPermission = (value: unknown): value is Permission =>
  typeof value === 'string' && PERMISSION_SET.has(value);

// Permissions that can NEVER be put in a non-owner role, because holding
// them lets you grant yourself (or anyone) everything else. Only the Owner
// role has them, implicitly.
export const OWNER_ONLY_PERMISSIONS: readonly Permission[] = [
  P.STAFF_MANAGE,
  P.ROLES_MANAGE,
];

// Display grouping for the role editor (frontend renders this).
export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] =
  [
    {
      label: 'Overview',
      permissions: [
        P.DASHBOARD_VIEW,
        P.FINANCE_VIEW,
        P.REPORTS_VIEW,
        P.REPORTS_EXPORT,
      ],
    },
    {
      label: 'Orders',
      permissions: [
        P.ORDERS_VIEW,
        P.ORDERS_UPDATE_STATUS,
        P.ORDERS_EDIT,
        P.ORDERS_COURIER,
        P.ORDERS_DELETE,
      ],
    },
    {
      label: 'Returns & customizations',
      permissions: [
        P.RETURNS_VIEW,
        P.RETURNS_PROCESS,
        P.CUSTOMIZATIONS_VIEW,
        P.CUSTOMIZATIONS_MANAGE,
        P.CUSTOMIZATIONS_DELETE,
      ],
    },
    { label: 'Customers', permissions: [P.CUSTOMERS_VIEW, P.CUSTOMERS_CONTACT] },
    {
      label: 'Products & inventory',
      permissions: [
        P.PRODUCTS_CREATE,
        P.PRODUCTS_EDIT,
        P.PRODUCTS_PUBLISH,
        P.PRODUCTS_DELETE,
        P.PRICING_DISCOUNT,
        P.INVENTORY_VIEW,
        P.INVENTORY_UPDATE,
      ],
    },
    { label: 'Catalog', permissions: [P.CATALOG_MANAGE, P.CATALOG_DELETE] },
    { label: 'Content', permissions: [P.CONTENT_MANAGE] },
    {
      label: 'Promotions & payments',
      permissions: [
        P.COUPONS_VIEW,
        P.COUPONS_MANAGE,
        P.PAYMENTS_VIEW,
        P.PAYMENT_METHODS_MANAGE,
      ],
    },
    {
      label: 'People & system',
      permissions: [
        P.STAFF_VIEW,
        P.STAFF_MANAGE,
        P.ROLES_MANAGE,
        P.SETTINGS_MANAGE,
        P.SYSTEM_SYNC,
        P.AUDIT_VIEW,
      ],
    },
  ];

// ---- Built-in roles -------------------------------------------------------

export const OWNER_ROLE_KEY = 'owner';

export interface BuiltInRole {
  key: string;
  name: string;
  description: string;
  // Legacy `roles.name` values this role adopts on first boot instead of
  // creating a duplicate (the old Manage Roles page stored lowercase names).
  legacyNames: string[];
  // Initial permissions, applied ONCE when the role is first created or
  // adopted. Owners can change them afterwards; boot never re-applies them.
  // Ignored for the Owner, which implicitly has every permission.
  defaultPermissions: Permission[];
}

export const BUILT_IN_ROLES: BuiltInRole[] = [
  {
    key: OWNER_ROLE_KEY,
    name: 'Owner',
    description:
      'Full access to everything, including staff and roles. Cannot be edited or deleted.',
    legacyNames: ['admin', 'owner'],
    defaultPermissions: [],
  },
  {
    key: 'manager',
    name: 'Manager',
    description:
      'Runs the shop day to day: catalog, inventory, orders, promotions, content and reports.',
    legacyNames: ['manager'],
    defaultPermissions: [
      P.DASHBOARD_VIEW,
      P.FINANCE_VIEW,
      P.REPORTS_VIEW,
      P.REPORTS_EXPORT,
      P.ORDERS_VIEW,
      P.ORDERS_UPDATE_STATUS,
      P.ORDERS_EDIT,
      P.ORDERS_COURIER,
      P.RETURNS_VIEW,
      P.RETURNS_PROCESS,
      P.CUSTOMIZATIONS_VIEW,
      P.CUSTOMIZATIONS_MANAGE,
      P.CUSTOMERS_VIEW,
      P.CUSTOMERS_CONTACT,
      P.PRODUCTS_CREATE,
      P.PRODUCTS_EDIT,
      P.PRODUCTS_PUBLISH,
      P.PRICING_DISCOUNT,
      P.INVENTORY_VIEW,
      P.INVENTORY_UPDATE,
      P.CATALOG_MANAGE,
      P.CONTENT_MANAGE,
      P.COUPONS_VIEW,
      P.COUPONS_MANAGE,
      P.PAYMENTS_VIEW,
      P.STAFF_VIEW,
    ],
  },
  {
    key: 'order_staff',
    name: 'Order Staff',
    description:
      'Fulfilment and support: orders, couriers, returns, customizations and customer lookup.',
    legacyNames: ['order staff', 'order_staff'],
    defaultPermissions: [
      P.DASHBOARD_VIEW,
      P.ORDERS_VIEW,
      P.ORDERS_UPDATE_STATUS,
      P.ORDERS_EDIT,
      P.ORDERS_COURIER,
      P.RETURNS_VIEW,
      P.RETURNS_PROCESS,
      P.CUSTOMIZATIONS_VIEW,
      P.CUSTOMIZATIONS_MANAGE,
      P.CUSTOMERS_VIEW,
      P.CUSTOMERS_CONTACT,
      P.INVENTORY_VIEW,
    ],
  },
  {
    key: 'content_editor',
    name: 'Content Editor',
    description:
      'Products, catalog structure and storefront content. No orders, customers or revenue.',
    legacyNames: ['content editor', 'content_editor'],
    defaultPermissions: [
      P.PRODUCTS_CREATE,
      P.PRODUCTS_EDIT,
      P.PRODUCTS_PUBLISH,
      P.INVENTORY_VIEW,
      P.CATALOG_MANAGE,
      P.CONTENT_MANAGE,
    ],
  },
];
