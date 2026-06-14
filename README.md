# User Management System + CMS

A full-featured user management system with CMS, built with **Next.js 16 (App Router)**, **Prisma**, **PostgreSQL**, and **Tailwind CSS**. Features JWE-based session encryption, role-based access control (RBAC), email verification, and rate limiting.

## Features

- **Authentication** — JWE-encrypted httpOnly session cookies (jose), password hashing (bcryptjs)
- **Authorization** — Role-based access control with four check types: any, admin, route, super_admin
- **User Management** — Profile editing, email change with re-verification, account deletion
- **Admin Panel** — CRUD for users, pages, groups; site settings management
- **CMS** — Dynamic pages with slug-based routing, SEO metadata, sitemap generation
- **Rate Limiting** — Upstash Redis rate limiting on auth endpoints
- **Responsive** — Mobile-friendly admin sidebar and frontend navigation
- **Security** — CSP headers, HSTS, session invalidation, token cleanup

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+
- **Redis** (via Upstash — free tier available)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url> nextjs-user-dashboard
cd nextjs-user-dashboard
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | At least 32 characters for JWE encryption |
| `SUPER_ADMIN_EMAIL` | Super Admin email (used by seed script) |
| `SUPER_ADMIN_PASSWORD` | Super Admin password (used by seed script) |
| `SMTP_HOST` | SMTP server (e.g., smtp.resend.com) |
| `SMTP_PORT` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | SMTP username or API key |
| `SMTP_PASS` | SMTP password or API key |
| `SMTP_FROM` | From address for outgoing emails |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (e.g., http://localhost:3000) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

### 3. Database Setup

Run the Prisma migration to create the schema:

```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database

Creates the Super Admins group, Super Admin user, and default settings:

```bash
npx tsx scripts/seed.ts
```

### 5. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Admin Login

Navigate to `/admin/login` and sign in with the Super Admin credentials you configured.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |
| `npx tsx scripts/seed.ts` | Seed database with defaults |
| `npx tsx scripts/recover-super-admin.ts --email new@example.com --password newpass` | Recover Super Admin account |

## Architecture

### Key Files

- `src/proxy.ts` — Route protection (Next.js 16 proxy, not middleware)
- `src/lib/auth/session.ts` — JWE session creation/reading/destruction
- `src/lib/auth/authorize.ts` — Authorization checks (any/admin/route/super_admin)
- `src/lib/auth/rate-limiter.ts` — Upstash rate limiting
- `src/lib/settings-cache.ts` — In-memory settings cache (60s TTL)
- `src/lib/flash.ts` — Flash message cookie for post-redirect notifications
- `prisma/schema.prisma` — Database schema

### Auth Flow

1. User submits login form → Server Action validates credentials → creates JWE session cookie
2. Every request to `/account/*` or `/admin/*` runs through `proxy.ts` which decrypts the session, checks tokenVersion, and enforces route permissions
3. Session invalidation: changing password increments `tokenVersion` → proxy detects mismatch → redirects to login

## License

MIT
