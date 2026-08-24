# Tahams Backend

The backend API for [Tahams](https://tahamsbd.com) — a clothing brand based in Bangladesh. Built with [NestJS](https://nestjs.com/) and [TypeORM](https://typeorm.io/) on [PostgreSQL](https://www.postgresql.org/), exposed as a single REST API under `/api`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 (TypeScript) |
| Database | PostgreSQL, via TypeORM (`synchronize: true` — schema is auto-created, no migrations) |
| Auth | JWT (`@nestjs/jwt` + Passport), role-based guards, email OTP, token blacklist on logout |
| File uploads | Multer, saved to a local `uploads/` folder and served back per-module |
| Image compression | Sharp (resizes uploaded images and re-encodes them as WebP) |
| Image hosting (partial) | Cloudinary — the backend only issues a signed upload signature; uploads themselves go directly from the client to Cloudinary |
| Email | Nodemailer via Gmail SMTP (`smtp.gmail.com:465`) |
| Courier | Pathao Merchant API (OAuth token + order creation) |
| Fraud check | FraudSpy API (phone-number lookup) |

## Project Structure

```
src/
├── Admin/       # Almost the entire API surface — see below
├── Customer/    # Customer signup + local image retrieval only
├── Employee/    # Employee records, generic file upload/retrieval
├── Global/      # Shared TypeORM entities and DTOs used across modules
├── app.module.ts
└── main.ts
```

**Important:** despite the module names, almost all functionality — including things a storefront customer uses, like customer login, cart, wishlist, checkout, and order tracking — is implemented in `Admin/Controllers/admin.controller.ts` and served under `/api/admin/*`. The `Customer` module only exposes account creation (`POST /api/customer/create`) and an image endpoint. The `Employee` module only exposes employee record creation, a lookup, a generic file upload, and an image endpoint. JWT auth, Passport, and role guards are wired up only in the `Admin` module.

Each module follows the same internal layout: `Controllers/`, `Services/`, `DTOs/`, and (in `Admin`) `Guards/`, `strategies/`, `decorators/`.

The `Global` module also defines a few entities with no endpoints wired up yet (e.g. company info, partners, activity/unread-message tracking) — they exist as TypeORM entities but aren't currently exposed through the API.

## Features

All routes below are served under the `/api/admin` prefix unless noted otherwise.

**Auth & access control**
- Admin sign-in and customer login (`/signin`, `/customer-login`), each issuing a JWT
- Customer signup via `POST /api/customer/create`
- Email OTP send/verify flow (`/send-otp`, `/verify-otp`) and a general "send email" endpoint
- Role-based route guards (`RolesGuard` + `@Roles()`), checked against roles on the authenticated user
- Role management: create, list, update, and delete roles
- User management: list all users, look up by email, update a user's address
- Logout with JWT blacklisting (revoked tokens are checked on every request via `JwtStrategy`)
- A shared "Google password" fallback (`GOOGLE_PASS`) accepted in place of a stored password for admin accounts marked as logged in via Google

**Product catalog**
- Categories, subcategories, and sub-subcategories, including reordering (`shuffle-category`) and enable/disable
- Colors, sizes, fabrics, and gender options, combined per product into size/color/quantity variants
- Multi-image product uploads (stored locally, served back via `getimage`-style endpoints)
- Product search, related products, and search-bar autocomplete
- Per-product view-count and sales-count tracking

**Custom apparel designer**
- Customers submit customization ("customize tee") requests
- Requests can include saved text elements and image elements
- Admin can list, update, and delete customization requests

**Shopping & checkout**
- Cart (add/remove items, list all carts)
- Wishlist (add/remove, check membership, list by user)
- Coupons (create, list, disable)
- Payment methods and payment records
- Orders ("buying history"): creation, status updates, lookup by token, pagination, and per-order grouping

**Fulfillment**
- Pathao courier integration: OAuth token exchange and order creation
- Delivery status list (`get-all-delivery-status`), used when updating order status — no separate create/edit endpoints exist for delivery statuses themselves
- Return/cancellation requests, with an approval step that adjusts the related cart quantity

**Fraud prevention**
- `POST /fraud-check` — looks up a phone number against the FraudSpy API

**Marketing**
- Banners (create, update, delete, replace image)
- Pop-ups (create, view active/all, update)
- New arrivals (create, discontinue)

**Messaging**
- Admin can send a message to a customer (`send-message-to-customer`)

**Employee management**
- Create and look up employee records
- Generic image upload/retrieval endpoints

## Prerequisites

- **Node.js 18 or later** — the fraud-check integration calls the built-in global `fetch`, which requires Node ≥ 18
- **PostgreSQL** 13+ running locally or reachable remotely
- npm (bundled with Node.js)

## Getting Started

### 1. Clone and install dependencies

Cloning creates a folder named `Tahams` (that's the repo name — this checkout has simply been renamed locally to `Tahams-backend`).

```bash
git clone https://github.com/mostaquenaim/Tahams.git
cd Tahams
npm install
```

This step is identical on macOS, Linux, and Windows (PowerShell or Command Prompt).

### 2. Create the database

TypeORM runs with `synchronize: true` (see [`src/app.module.ts`](src/app.module.ts)), so tables are created and kept in sync automatically on startup — you only need an empty database to exist first.

**macOS / Linux:**

```bash
createdb Tahams
```

**Windows:** the PostgreSQL installer doesn't always add its `bin` folder (e.g. `C:\Program Files\PostgreSQL\<version>\bin`) to `PATH`, so `createdb` may not be recognized in either PowerShell or Command Prompt. If that happens, use one of these instead:

- Add that `bin` folder to `PATH`, then `createdb` works the same as on macOS/Linux, **or**
- Run `psql -U postgres` to open an interactive session, then run:
  ```sql
  CREATE DATABASE "Tahams";
  ```
- Or create the database visually with **pgAdmin**, which ships with the Windows installer.

### 3. Configure environment variables

Copy the example file and fill in your own values.

**macOS / Linux / Git Bash:**

```bash
cp .env.example .env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**Windows (Command Prompt):**

```cmd
copy .env.example .env
```

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Secret used to sign admin/customer JWTs (7-day expiry) |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Gmail account + [App Password](https://myaccount.google.com/apppasswords) used to send OTP/notification emails via `smtp.gmail.com` |
| `GOOGLE_PASS` | Shared fallback "password" accepted for admin accounts flagged as Google-authenticated |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` | PostgreSQL connection |
| `SESSION_SECRET` / `SESSION_MAX_AGE` | Present in `.env` for `express-session`, but no session middleware is currently registered anywhere in the app — safe to fill with placeholder values |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | [Cloudinary](https://cloudinary.com/) credentials, used only to generate a signed upload signature (`GET /api/admin/cloudinary-signature`) for direct client-side uploads into a `products` folder |
| `PATHAO_CLIENT_ID` / `PATHAO_CLIENT_SECRET` / `PATHAO_USERNAME` / `PATHAO_PASSWORD` / `PATHAO_BASE_URL` | Pathao Merchant API credentials for courier order creation |
| `FRAUDSPY_API_KEY` / `FRAUDURL` | [FraudSpy](https://fraudspy.com.bd/) API used by `POST /api/admin/fraud-check` |

### 4. Run the app

```bash
npm run start:dev
```

The API is available at `http://localhost:3000/api` (global prefix `api`, port `3000` — both hardcoded in [`src/main.ts`](src/main.ts)).

## Available Scripts

| Command | Description |
|---|---|
| `npm run start` | Start the app |
| `npm run start:dev` | Start in watch mode (recommended for development) |
| `npm run start:debug` | Start in watch mode with the debugger attached |
| `npm run start:prod` | Run the compiled build (`dist/main.js`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Lint and auto-fix `src/` and `test/` |
| `npm run format` | Format `src/` and `test/` with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:cov` | Run unit tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |

## File Storage

- **Uploads** (banners, categories, products, product pictures, customization elements, employee files, etc.) are received via Multer and written to a local `uploads/` folder at the project root, then served back through per-module `getimage`/`getCloudinarySignature`-style endpoints.
- **Sharp** is used separately to compress specific uploaded images: it resizes to a max width of 800px and re-encodes as WebP.
- **Cloudinary** is only used to mint a signed upload signature (`GET /api/admin/cloudinary-signature`, folder `products`); the backend itself never uploads a file to Cloudinary — that happens client-side using the signature.
- A `public/` folder, expected one directory **above** the project root (i.e. a sibling of the cloned repo folder, not inside it), is also served statically at `/public/` — see the `ServeStaticModule` config in [`src/app.module.ts`](src/app.module.ts).

## CORS

Allowed origins are hardcoded in [`src/main.ts`](src/main.ts): `http://localhost:8000`, `http://127.0.0.1:8000`, `https://tahamsbd.com`, and `https://www.tahamsbd.com`. Update this list if you're running a frontend on a different origin during development.

## License

`package.json` marks this project `"private": true` with `"license": "UNLICENSED"` — it is not intended for public/open-source use or redistribution.
