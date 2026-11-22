# Staff roles (RBAC) rollout runbook

How to ship staff roles and permissions to production, check that they work,
and undo them if something goes wrong. Read it once end to end before you
start. The deploy itself takes about 15 minutes, plus a 10-minute smoke test.

## What is shipping

| Repo | Branch to merge | Contains |
|---|---|---|
| Backend (`Tahams`) | `feat/rbac-phase5-e2e` | RBAC phases 0-5, plus `906d77c` (sidebar badge counts), which is also not on `main` yet |
| Frontend (`Tahams-frontEnd`) | `feat/rbac-phase5-rollout` | RBAC phases 0-5, stacked on `fix/mobile-ux`, which brings **19 non-RBAC commits** with it (mobile UX, ISR/static pages, nginx gzip config) |

Each phase was also pushed as its own branch, so you can review phase by
phase. The simplest merge is one PR per repo from the branch above into
`main`: the phase PRs are stacked, so merging them one by one means
retargeting each to `main` after the previous one lands.

> **Frontend check:** if the 19 `fix/mobile-ux` / `perf/static-pages`
> commits aren't in production yet, they go live in this release too. Make
> sure they've been tested, or ship them first on their own.

**The two repos must go out together.** The new admin panel needs
`GET /admin/me`, which the old backend doesn't have: with the new frontend
and the old backend, every admin sees the 404 page. The old frontend
against the new backend mostly works, but these break until the frontend
lands: order status updates, saving courier details, the admin "All
carts" page, and removing several items at once from a cart.

## What changes on first boot

The backend uses TypeORM `synchronize: true`, so the schema updates itself
when the new code starts. Every change is additive:

- `users`: new columns `staffRoleId` (nullable), `staffActive` (default true) and `tokenVersion` (default 0)
- `roles`: new columns `key`, `description`, `isSystem`, `defaultsAppliedAt`, `createdAt` and `updatedAt`
- new tables: `role_permissions` and `audit_logs`

Then the RBAC boot sync runs:

1. Creates the built-in roles: Owner, Manager, Order Staff and Content
   Editor. Rows the old Manage Roles page created as `admin`, `manager`,
   `order staff` or `content editor` are adopted rather than duplicated.
   Any other old role rows stay, as custom roles with no permissions.
2. Applies the default permissions once. Later edits by an Owner are
   never overwritten.
3. **Gives the Owner role to every user with `users.role = 'admin'`.**

Existing sessions keep working: tokens issued before the deploy are still
accepted, so nobody is logged out.

## 1. Before deploying

### 1.1 Run the checks locally

```bash
# backend
npm test            # unit tests, including the route-policy check
npm run build
npm run test:rbac   # role matrix: needs the local Postgres from README step 3

# frontend
npm run build
npm run check:admin-access -- --backend ../../Tahams-backend   # adjust the path
```

`test:rbac` uses its own database (`<DB_NAME>_rbac_e2e`, created if
missing) and wipes it at the start of every run. It refuses to run against
any database whose name doesn't end in `_e2e` or `_test`, or a non-local
host. It never touches your normal database.

### 1.2 Check who will become Owner

Every `role = 'admin'` account becomes an **Owner**: full access, including
adding and removing staff. Until Phase 1, anyone could register as admin
through the public sign-up endpoint (`POST /customer/create` with
`"role":"admin"`). That hole is closed in this release, but an account
created through it would be promoted. **Look at the list before you deploy:**

```sql
SELECT id, email, name, created_at FROM users WHERE role = 'admin' ORDER BY id;
```

For any account you don't recognise, demote it **before** deploying:

```sql
UPDATE users SET role = 'customer' WHERE id = <id>;
```

Note the remaining admin emails. You'll check them again after the deploy.

### 1.3 Back up the database

```bash
pg_dump -Fc -h <host> -U <user> -d <db> -f tahams-before-rbac-$(date +%Y%m%d-%H%M).dump
```

Keep the backup until the release has run cleanly for a week. Don't restore
it as a rollback, though: it would also wipe orders placed after the deploy.
See "Rolling back" below.

## 2. Deploy

Pick a quiet hour. The steps below are generic: use your usual build and
restart commands.

1. **Backend:** pull `main`, `npm ci`, `npm run build`, then restart the
   process.
2. **Watch the backend log on startup.** Expect lines like:
   - `RBAC: adopting legacy role "admin" (id …) as "Owner"` (only if old role rows exist)
   - `RBAC: assigned Owner to N legacy admin(s)`. N should equal the count from 1.2.

   **Stop and investigate** if you see
   `RBAC boot sync failed - built-in roles may be missing`.
3. **Frontend:** straight away, pull `main`, `npm ci`, `npm run build`, then
   restart. Anyone with the admin panel open must reload it.
4. **Check the data:**

   ```sql
   -- 4 built-in roles; Manager 26, Order Staff 12, Content Editor 6 permissions; Owner 0 (it implicitly has all)
   SELECT r.id, r.key, r.name, count(rp.*) AS permissions
   FROM roles r LEFT JOIN role_permissions rp ON rp."roleId" = r.id
   GROUP BY r.id ORDER BY r.id;

   -- every former admin is now Owner, and nobody else is staff yet
   SELECT u.id, u.email, u.role, r.name AS staff_role, u."staffActive"
   FROM users u LEFT JOIN roles r ON r.id = u."staffRoleId"
   WHERE u."staffRoleId" IS NOT NULL OR u.role = 'admin';
   ```

## 3. Smoke test (about 10 minutes)

As an **Owner**, in a normal window:

- [ ] Log in. You land on the dashboard with revenue showing.
- [ ] The sidebar shows every section, including **Staff & Roles** and **Settings → Audit Log**.
- [ ] Orders, order details, products, catalog pages, coupons and settings open and load as before. Change one order status to make sure writes work.
- [ ] **Staff:** your account is listed as Owner, with "Your account" in place of actions.
- [ ] **Staff → Add staff → Create a new account:** create `rollout-test@<your domain>` with the **Order Staff** role.

As that test account, in a **private window**:

- [ ] Log in. You land on the admin dashboard with **Total sales: Hidden**.
- [ ] The sidebar shows Orders, Products (stock list only), Inventory and User Management only.
- [ ] Orders open, and the order status can be changed.
- [ ] Opening `/admin/manage/staff` directly shows "You don't have access to this page".

Back as the Owner:

- [ ] **Staff:** suspend the test account. Within a click or two, the private window lands on the login page.
- [ ] **Audit log:** shows "Created staff account" and "Changed staff access" with your email.
- [ ] **Staff:** remove the test account. It stays behind as a customer account, which you can ignore.

As a **customer** (or logged out):

- [ ] Browse, add to cart, check out as a guest, and track the order from the confirmation link.
- [ ] Opening `/admin` shows the 404 page.

## 4. After the release

- Give staff access from **Staff & Roles → Staff**:
  - **From an existing account** for people who already have a Tahams account. They keep signing in the way they do now, Google included.
  - **Create a new account** for staff who don't. Share the password privately.
- Review the default permissions under **Roles & permissions** before you
  hand out roles. For example, Managers can see revenue by default.
- Old roles from the Manage Roles page show up as custom roles with no
  permissions. Fill them in or delete them.
- Things to watch for in the backend log in the first days:
  - `AUDIT WRITE FAILED`: the request still went through, but its audit row is missing.
  - `declares no access policy`: a route was refused because it has no access rule. This shouldn't happen, since `npm test` fails on it.
- Audit rows older than 180 days are deleted automatically.

## Rolling back

Redeploy the previous builds of **both** repos (the old frontend needs the
old backend). The shop keeps working: Owners are still `users.role =
'admin'`, so the old code still treats them as admins, and existing
sessions stay valid.

What you lose, because the old code's `synchronize: true` drops the
columns it doesn't know about:

- staff role assignments (`users.staffRoleId`, `staffActive`, `tokenVersion`)
- the extra `roles` columns

The `role_permissions` and `audit_logs` tables stay, unused. Non-Owner staff
lose admin access, which they never had under the old code anyway.

Rolling back also **reopens the security holes fixed in Phases 0 and 1**:
registering as admin through the public sign-up endpoint, and admin routes
trusting an email instead of a token. Roll back only for a real outage, and
redeploy as soon as it's fixed.

Redeploying RBAC later is safe. Owners are restored from `users.role`, but
non-Owner staff must be re-added. The built-in roles get their default
permissions back on top of whatever rows remain in `role_permissions`.

Don't restore the database backup to roll back the code. That loses real
orders. The backup is for data accidents only.

## Reference

- Permissions and built-in roles: `src/Rbac/permissions.ts`
- Route access rules: the decorators on each controller route; checked by `src/Rbac/route-policy.spec.ts` and `test/rbac.e2e-spec.ts`
- Admin panel page rules: `utils/adminAccess.js` in the frontend; checked by `npm run check:admin-access`
