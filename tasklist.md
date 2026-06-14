# Implementation Tasklist — User Management System + CMS

> **Instructions for AI coding agent:** Check off (`[x]`) tasks as they are completed.
> Keep this file updated after each significant deliverable.
> Execute phases **sequentially** — each phase must be fully complete before starting the next.

---

## Pre-Flight Checklist

- [ ] **SPIKE:** Test iron-session v8 with Next.js 16.2.9 in middleware, Server Component, and Server Action. Verify `await cookies()` API works with `getIronSession()`. If broken, evaluate `@oslojs/jose` as fallback.
- [ ] Install all npm dependencies (`iron-session`, `bcryptjs`, `nodemailer`, `zod`, `@upstash/ratelimit`, `@upstash/redis`, `prisma`, `@prisma/client`)
- [ ] Set up Docker Compose with PostgreSQL for local development

---

## Phase 1: Foundation

**Objective:** Project setup, database, auth system, basic layouts, session invalidation.

### Database & Prisma

- [ ] Create Prisma schema (`prisma/schema.prisma`) with all models: User, UserGroup, Page, Setting, EmailVerificationToken, PasswordResetToken
- [ ] Run initial Prisma migration
- [ ] Create Prisma client singleton (`lib/prisma.ts`) with connection error handling

### Auth System (`lib/auth/`)

- [ ] `lib/auth/session.ts` — iron-session wrappers: `getSession()`, `createSession()`, `destroySession()`, `updateSession()`
- [ ] `lib/auth/session-cache.ts` — in-memory Map cache for tokenVersion/permissionVersion with 60s TTL
- [ ] `lib/auth/authorize.ts` — unified `authorize()` function with all four check types (`any`, `admin`, `route`, `super_admin`)
- [ ] `lib/auth/password.ts` — `hashPassword()`, `verifyPassword()` with bcryptjs cost factor 12
- [ ] `lib/auth/tokens.ts` — `generateToken()`, `createVerificationToken()`, `createPasswordResetToken()`, `validateToken()`, `cleanupExpiredTokens()`
- [ ] `lib/auth/email.ts` — `sendVerificationEmail()`, `sendPasswordResetEmail()` via nodemailer
- [ ] `lib/auth/rate-limiter.ts` — rate limiting via Upstash Redis with predefined limiters (login, signup, forgotPassword, resendVerification, verifyEmail)

### Auth Server Actions & Validation

- [ ] `lib/validators/auth.ts` — Zod schemas: `signupSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`
- [ ] `lib/actions/auth.ts` — Server Actions: `signup()`, `login()`, `logout()`, `verifyEmail()`, `forgotPassword()`, `resetPassword()`, `resendVerification()`

### Middleware

- [ ] `middleware.ts` — Route protection + tokenVersion/permissionVersion validation for `/account/*` and `/admin/*`

### Utilities

- [ ] `lib/utils/ip.ts` — `getClientIP()` function

### Seed & Recovery Scripts

- [ ] `scripts/seed.ts` — Idempotent seed: creates Super Admins group, Super Admin user, default settings
- [ ] `scripts/recover-super-admin.ts` — Recovery script to reset Super Admin credentials

### Shared Components

- [ ] `components/shared/alert.tsx` — Alert component (success/error/info)
- [ ] `components/shared/loading-spinner.tsx` — Loading spinner
- [ ] Basic reusable Button and Input components (or inline Tailwind)

### Frontend Layout

- [ ] `components/frontend/frontend-layout.tsx` — Header + main + footer wrapper
- [ ] `components/frontend/header.tsx` — Header (static placeholder initially)
- [ ] `components/frontend/footer.tsx` — Footer (static placeholder initially)
- [ ] `app/layout.tsx` — Root layout with FrontendLayout, metadata, fonts

### Admin Layout

- [ ] `components/admin/admin-layout.tsx` — Sidebar + main content wrapper
- [ ] `components/admin/sidebar.tsx` — Admin sidebar (static placeholder initially)
- [ ] `app/admin/layout.tsx` — Admin layout wrapping all `/admin/*` routes

### Auth Pages (Frontend)

- [ ] `app/login/page.tsx` — Frontend login form
- [ ] `app/signup/page.tsx` — Registration form (email + password)
- [ ] `app/forgot-password/page.tsx` — Request password reset form
- [ ] `app/reset-password/page.tsx` — Reset password form (token in query)
- [ ] `app/verify-email/page.tsx` — Email verification handler
- [ ] `app/resend-verification/page.tsx` — Resend verification email form

### Auth Pages (Admin)

- [ ] `app/admin/login/page.tsx` — Admin login form (only allows admin group users)

### Account Area

- [ ] `app/account/layout.tsx` — Account layout with auth guard (calls `authorize({ type: 'any' })`)
- [ ] `app/account/dashboard/page.tsx` — Empty dashboard placeholder

### Types

- [ ] `types/index.ts` — Shared TypeScript types: `SessionData`, `AuthCheck`, `PageData`, `HeaderMenuItem`, `SettingsData`

### Phase 1 Verification

- [ ] JSDoc/file-level comments on every file
- [ ] Verify login/logout flow works end-to-end
- [ ] Verify middleware protects `/account/*` routes
- [ ] Verify middleware protects `/admin/*` routes (except `/admin/login`)

---

## Phase 2: User Features + Admin CRUD

**Objective:** User-facing account management and admin CRUD operations.

### User Account Management

- [ ] `lib/validators/user.ts` — Zod schemas: `updateProfileSchema`, `changePasswordSchema`, `changeEmailSchema`, `deleteAccountSchema`
- [ ] `lib/actions/user.ts` — Server Actions: `updateProfile()`, `changePassword()`, `changeEmail()`, `deleteAccount()`
- [ ] `app/account/profile/page.tsx` — View/edit profile form (name, email, phone, address)
- [ ] `app/account/change-password/page.tsx` — Change password form with tokenVersion increment
- [ ] `app/account/change-email/page.tsx` — Change email form with re-verification flow
- [ ] `app/account/delete-profile/page.tsx` — Delete account confirmation with password re-entry + tokenVersion increment

### Slug Utility

- [ ] `lib/utils/slug.ts` — `generateSlug(title)` with collision handling (append -2, -3... max 10 attempts)

### Admin CRUD — Users

- [ ] `lib/validators/page.ts` — Zod schemas for page actions (create/update)
- [ ] `lib/actions/admin/users.ts` — Server Actions: `getUsers()`, `createUser()`, `updateUser()`, `deleteUser()`
- [ ] `app/admin/users/page.tsx` — User list table with search + pagination
- [ ] `app/admin/users/create/page.tsx` — Create user form
- [ ] `app/admin/users/[id]/edit/page.tsx` — Edit user form

### Admin CRUD — Pages

- [ ] `lib/actions/admin/pages.ts` — Server Actions: `getPages()`, `createPage()` (with slug auto-gen), `updatePage()`, `deletePage()` (prevents deleting home page)
- [ ] `app/admin/pages/page.tsx` — Page list table with search + pagination
- [ ] `app/admin/pages/create/page.tsx` — Create page form (title + content textarea, slug auto-generated and displayed)
- [ ] `app/admin/pages/[id]/edit/page.tsx` — Edit page form (title, slug override, content)

### Admin Settings

- [ ] `lib/settings-cache.ts` — Module-level settings cache with 60s TTL
- [ ] `lib/validators/settings.ts` — Zod schemas with JSON structure validation
- [ ] `lib/actions/admin/settings.ts` — Server Actions: `getSettings()` (with caching), `updateSettings()` (invalidates cache)
- [ ] `app/admin/settings/page.tsx` — Settings form (home page dropdown, header menu JSON textareas, footer HTML, site name)

### Shared Components

- [ ] `components/shared/pagination.tsx` — Reusable pagination component
- [ ] `components/shared/search-input.tsx` — Search input with submit button (form-based)
- [ ] `components/shared/confirm-dialog.tsx` — Delete confirmation modal

### Public-Facing Pages

- [ ] `app/page.tsx` — Home page: reads `home_page` from settings, fetches page by slug, renders content
- [ ] `app/[slug]/page.tsx` — Dynamic CMS page with 404 handling
- [ ] `components/frontend/header.tsx` — Dynamic header: checks session, shows logged-in or logged-out menu from settings
- [ ] `components/frontend/footer.tsx` — Dynamic footer from settings

### Admin Dashboard

- [ ] `app/admin/dashboard/page.tsx` — Empty admin dashboard placeholder

### Phase 2 Verification

- [ ] JSDoc/file-level comments on every file
- [ ] Verify profile edit, password change, email change, account deletion flows
- [ ] Verify admin CRUD for users (create, edit, delete, search, paginate)
- [ ] Verify admin CRUD for pages (create, edit, delete, search, paginate)
- [ ] Verify home page rendering from settings
- [ ] Verify `/[slug]` dynamic page rendering
- [ ] Verify dynamic header/footer from settings

---

## Phase 3: User Groups & RBAC

**Objective:** Fine-grained admin permissions via user groups.

### Group Server Actions & Validation

- [ ] `lib/validators/group.ts` — Zod schemas for group actions
- [ ] `lib/actions/admin/groups.ts` — Server Actions: `getGroups()`, `createGroup()`, `updateGroup()` (with permissionVersion increment), `deleteGroup()` (with guard)

### Group CRUD Pages (Super Admin only)

- [ ] `app/admin/groups/page.tsx` — Group list page
- [ ] `app/admin/groups/create/page.tsx` — Create group form (name, type dropdown, route permissions)
- [ ] `app/admin/groups/[id]/edit/page.tsx` — Edit group form (prevents changing own group type/permissions)

### Permission Infrastructure

- [ ] Middleware extended to enforce route-level permissions via `authorize({ type: 'route', path })`
- [ ] Admin sidebar (`components/admin/sidebar.tsx`) filters menu items based on `routePermissions` from session
- [ ] `components/admin/permission-guard.tsx` — Conditional rendering wrapper for permission-based UI elements
- [ ] Group assignment dropdown added to admin user edit form

### Phase 3 Verification

- [ ] JSDoc/file-level comments on every file
- [ ] Verify group CRUD works (Super Admin only)
- [ ] Verify route permissions enforced in middleware
- [ ] Verify admin sidebar filters by permissions
- [ ] Verify permissionVersion increment triggers session update

---

## Phase 4: Polish & Harden

**Objective:** SEO, security hardening, error handling, responsive design.

### SEO

- [ ] `generateMetadata()` for all public pages (dynamic titles from page data, descriptions from content)
- [ ] `app/sitemap.ts` — Sitemap generation (lists published pages + static routes)
- [ ] `public/robots.txt` — Robots configuration

### Error Handling

- [ ] `app/error.tsx` — Global error boundary
- [ ] `app/not-found.tsx` — Custom 404 page
- [ ] `app/loading.tsx` — Global loading skeleton
- [ ] Per-route-group error boundaries (`app/account/error.tsx`, `app/admin/error.tsx`)
- [ ] Per-route-group loading states (`app/account/loading.tsx`, `app/admin/loading.tsx`)
- [ ] Inline form validation error messages next to each field

### Notification System

- [ ] Toast/notification system: success/error messages at top-right, auto-dismiss after 5s

### Responsive Design

- [ ] Admin sidebar collapses to hamburger on mobile
- [ ] Tables scroll horizontally on small screens
- [ ] Forms are full-width on mobile

### Security Hardening

- [ ] Security headers in `next.config.ts`: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options
- [ ] Verify session maxAge enforcement
- [ ] Prisma connection error handling: retry logic, clear error messages
- [ ] Email sending error handling: try-catch with logging, user-friendly error messages
- [ ] Token cleanup: ensure `cleanupExpiredTokens()` runs on startup and via `setInterval` every hour
- [ ] Document HTML content trust boundary (admin-authored content is trusted)

### Phase 4 Verification

- [ ] JSDoc/file-level comments on every file
- [ ] Run full manual flow: signup → verify → login → profile edit → logout → login → admin CRUD → group management
- [ ] Verify SEO metadata renders correctly on public pages
- [ ] Verify error boundaries catch and display errors gracefully
- [ ] Verify responsive design on mobile viewport
- [ ] Verify security headers present in response
- [ ] Final code review: all files documented, no dead code, no console.logs

---

## Final Delivery

- [ ] All 4 phases complete
- [ ] Every file has JSDoc/file-level comments
- [ ] All exported functions have JSDoc (purpose, parameters, return type)
- [ ] Zod schemas document what each field represents
- [ ] Server Actions document authorization level
- [ ] Prisma schema has comments on each model and non-obvious field
- [ ] `.env.example` file with all required environment variables documented
- [ ] `README.md` with setup instructions

---

## Quick Reference: File Creation Order

| Order | File | Phase |
|---|---|---|
| 1 | `prisma/schema.prisma` | 1 |
| 2 | `lib/prisma.ts` | 1 |
| 3 | `types/index.ts` | 1 |
| 4 | `lib/auth/password.ts` | 1 |
| 5 | `lib/auth/tokens.ts` | 1 |
| 6 | `lib/auth/session.ts` | 1 |
| 7 | `lib/auth/session-cache.ts` | 1 |
| 8 | `lib/auth/authorize.ts` | 1 |
| 9 | `lib/auth/email.ts` | 1 |
| 10 | `lib/auth/rate-limiter.ts` | 1 |
| 11 | `lib/utils/ip.ts` | 1 |
| 12 | `lib/validators/auth.ts` | 1 |
| 13 | `lib/actions/auth.ts` | 1 |
| 14 | `middleware.ts` | 1 |
| 15 | `scripts/seed.ts` | 1 |
| 16 | `scripts/recover-super-admin.ts` | 1 |
| 17 | Shared components (alert, spinner, button, input) | 1 |
| 18 | Frontend layout, header, footer | 1 |
| 19 | Admin layout, sidebar | 1 |
| 20 | Auth pages (login, signup, forgot/reset password, verify, resend) | 1 |
| 21 | Account layout + dashboard | 1 |
| 22 | `lib/utils/slug.ts` | 2 |
| 23 | `lib/validators/user.ts` + `page.ts` | 2 |
| 24 | `lib/actions/user.ts` | 2 |
| 25 | Account pages (profile, change-password, change-email, delete-profile) | 2 |
| 26 | `lib/actions/admin/users.ts` | 2 |
| 27 | Admin user CRUD pages | 2 |
| 28 | `lib/actions/admin/pages.ts` | 2 |
| 29 | Admin page CRUD pages | 2 |
| 30 | `lib/settings-cache.ts` | 2 |
| 31 | `lib/validators/settings.ts` | 2 |
| 32 | `lib/actions/admin/settings.ts` | 2 |
| 33 | Admin settings page | 2 |
| 34 | Pagination, SearchInput, ConfirmDialog components | 2 |
| 35 | Home page (`app/page.tsx`) + `[slug]` page | 2 |
| 36 | `lib/validators/group.ts` | 3 |
| 37 | `lib/actions/admin/groups.ts` | 3 |
| 38 | Admin group CRUD pages | 3 |
| 39 | PermissionGuard component | 3 |
| 40 | Update sidebar + middleware for route permissions | 3 |
| 41 | SEO metadata, sitemap, robots.txt | 4 |
| 42 | Error boundaries, loading states, 404 | 4 |
| 43 | Toast/notification system | 4 |
| 44 | Responsive design audit | 4 |
| 45 | Security headers, hardening | 4 |
