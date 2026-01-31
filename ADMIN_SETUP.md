# Admin & Disaster Reports Setup

## Prerequisites

- Node.js 18+
- MySQL database

## 1. Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` – MySQL connection string (e.g. `mysql://user:pass@localhost:3306/webgis`)
- `SESSION_SECRET` – Long random string for signing session cookies (required in production)

## 2. Install & Database

```bash
npm install
npx prisma generate
npx prisma db push
```

## 3. Create Admin User

```bash
node scripts/seed-admin.mjs
```

Default credentials: `admin@example.com` / `admin123`. Override with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` if needed.

## 4. Routes (internal – do not link in public nav)

- **Login:** `/internal/auth/sign-in`
- **Dashboard:** `/internal/console`
- **Map of approved reports:** `/reports`
- **Forbidden:** `/403`

Middleware protects all `/internal/*` routes: unauthenticated users are redirected to sign-in; non-admin users are redirected to `/403`.

## 5. Reporting Flow

1. Users submit reports from the main WebGIS page via "Lapor Kejadian" (modal with map location picker).
2. Reports are stored with status `pending`.
3. Admins log in at `/internal/auth/sign-in` and manage reports at `/internal/console` (approve/reject).
4. Approved reports appear on the map at `/reports`.

## Security

- Admin auth is server-side only (session JWT in httpOnly cookie).
- Prisma is used only in Server Components and Server Actions.
- Admin role is checked on every protected action and in middleware.
