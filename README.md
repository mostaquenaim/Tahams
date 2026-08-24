# Tahams Backend

The backend API powering [Tahams](https://tahamsbd.com) — a clothing brand based in Bangladesh. Built with [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/) and [PostgreSQL](https://www.postgresql.org/), it serves the admin dashboard, the employee portal, and the customer-facing storefront from a single API.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 (TypeScript) |
| Database | PostgreSQL, via TypeORM |
| Auth | JWT (Passport), role-based guards, email OTP verification |
| File storage | Cloudinary (products, banners) + local disk uploads (`/uploads`) |
| Image processing | Sharp (compression/optimization) |
| Email | Nodemailer (Gmail SMTP) |
| Courier | Pathao Merchant API |
| Fraud detection | FraudSpy API |

## Features

**Auth & access control**
- JWT-based login for admins and customers, separate employee flow
- Role-based route guards and role management
- Email OTP verification and transactional email sending
- Token blacklisting on logout

**Product catalog**
- Categories, subcategories and sub-subcategories (with drag-to-reorder/shuffle)
- Colors, sizes, fabrics, gender, and color–size combinations
- Multi-image product uploads with Cloudinary storage and Sharp-based compression
- Product search, related products, and search-bar autocomplete
- View-count and sales-count tracking per product
- "New arrivals" and featured/popular items

**Custom apparel designer**
- Customer-submitted customization requests (custom tee designer)
- Persisted text and image elements per design, with admin approval workflow

**Shopping & checkout**
- Cart and wishlist management
- Coupons (create, disable, apply)
- Multiple payment methods and payment records
- Order ("buying history") creation, status tracking, and per-order grouping

**Fulfillment**
- Pathao courier integration for order creation and delivery tracking
- Delivery status management
- Return and cancellation request workflow, with admin approval

**Fraud prevention**
- Order fraud screening via the FraudSpy API

**Marketing & content**
- Banners, pop-ups (active/scheduled), and partner listings
- Company info management

**Messaging & activity**
- Direct messages to customers, with unread-message tracking
- Customer activity logging

**Employee management**
- Employee records and profile image uploads

## Project Structure

```
src/
├── Admin/       # Admin auth, dashboard, and most business logic (products, orders, marketing, etc.)
├── Customer/    # Customer-facing signup/profile endpoints
├── Employee/    # Employee records and file uploads
├── Global/      # Shared TypeORM entities and DTOs used across modules
├── app.module.ts
└── main.ts
```

Each domain module (`Admin`, `Customer`, `Employee`) follows the same internal layout: `Controllers/`, `Services/`, `DTOs/`, and (where applicable) `Entities/`, `Guards/`, `strategies/`, `decorators/`.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [PostgreSQL](https://www.postgresql.org/download/) 13 or later, running locally or reachable remotely
- npm (bundled with Node.js)

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd Tahams-backend
npm install
```

### 2. Create the database

TypeORM is configured with `synchronize: true`, so tables are created and kept in sync automatically — you only need to create an empty database:

```bash
createdb Tahams
```

or from `psql`:

```sql
CREATE DATABASE "Tahams";
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Secret used to sign JWTs |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Gmail account + [App Password](https://myaccount.google.com/apppasswords) used to send emails |
| `GOOGLE_PASS` | Additional auth/verification value used by the app |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` | PostgreSQL connection |
| `SESSION_SECRET` / `SESSION_MAX_AGE` | Session configuration |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | [Cloudinary](https://cloudinary.com/) credentials for image storage |
| `PATHAO_CLIENT_ID` / `PATHAO_CLIENT_SECRET` / `PATHAO_USERNAME` / `PATHAO_PASSWORD` / `PATHAO_BASE_URL` | Pathao Merchant API credentials for courier integration |
| `FRAUDSPY_API_KEY` / `FRAUDURL` | [FraudSpy](https://fraudspy.com.bd/) API for order fraud checks |

### 4. Run the app

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api` (global prefix `api`, port `3000`).

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

Uploaded files are handled two ways:
- **Product, banner, and category images** go through **Cloudinary** and are compressed with **Sharp** before upload.
- **Employee uploads** are written to a local `uploads/` directory and served back via dedicated `getimage` endpoints.

A `public/` directory (one level above the project root) is also served statically at `/public/`.

## CORS

Allowed origins are configured in [`src/main.ts`](src/main.ts) and currently include `localhost:8000`, `127.0.0.1:8000`, and `tahamsbd.com`/`www.tahamsbd.com`. Update this list if you're running a frontend on a different origin during development.

## License

This project is private and unlicensed for public use.
