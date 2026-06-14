# Implementation Tasklist — User Management System + CMS

> **Instructions for AI coding agent:** Check off (`[x]`) tasks as they are completed.
> Keep this file updated after each significant deliverable.
> Execute phases **sequentially** — each phase must be fully complete before starting the next.
> NPM packages already installed. Next.js 16 boilerplate already set up with React Compiler enabled.

---

## Phase 1: Foundation

**Objective:** Database schema, auth system (jose-based JWE sessions), shared layouts, auth pages, session invalidation via tokenVersion, seed scripts.

### 1.1 — Database & Prisma

- [x] Create `prisma/schema.prisma` with all models: User, UserGroup, Page, Setting, EmailVerificationToken, PasswordResetToken — include all fields, relations, indexes, and comments as specified in plan.md
- [x] Run `npx prisma migrate dev --name init` to generate migration and apply it
- [x] Create `src/lib/prisma.ts` — Prisma client singleton with connection error handling and retry logic

### 1.2 — Types

- [x] Create `src/types/index.ts` — shared TypeScript types: `SessionData`, `AuthCheck`, `PageData`, `HeaderMenuItem`, `SettingsData`

### 1.3 — Auth Core Library (`src/lib/auth/`)

- [x] Create `src/lib/auth/session.ts` — jose-based session utilities:
  - `getSession()` — reads `app_session` cookie, decrypts JWE via `jwtDecrypt()`, returns `SessionData | null`
  - `createSession(data)` — encrypts SessionData into JWE via `EncryptJWT` (alg: dir, enc: A256GCM, exp: 7d), sets httpOnly cookie (sameSite: lax, secure in production, path: /)
  - `updateSession(updates)` — reads current session, merges updates, re-creates cookie
  - `destroySession()` — deletes `app_session` cookie
  - Uses `SESSION_SECRET` from env (must be ≥32 chars for A256GCM)
- [x] Create `src/lib/auth/password.ts` — `hashPassword()`, `verifyPassword()` using bcryptjs cost factor 12
- [x] Create `src/lib/auth/tokens.ts` — `generateToken()` (crypto.randomUUID), `createVerificationToken()`, `createPasswordResetToken()`, `validateToken()`, `cleanupExpiredTokens()`
- [x] Create `src/lib/auth/email.ts` — `sendVerificationEmail()`, `sendPasswordResetEmail()` via nodemailer configured with SMTP env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)
- [x] Create `src/lib/auth/authorize.ts` — unified `authorize(session, check)` function supporting all four check types:
  - `{ type: 'any' }` — any authenticated user
  - `{ type: 'admin' }` — user in group with type "admin"
  - `{ type: 'route', path: string }` — admin user with matching route permission (startsWith pattern matching; Super Admin always passes)
  - `{ type: 'super_admin' }` — session email matches `SUPER_ADMIN_EMAIL` env var
  - MUST implement all four check types now even though route/super_admin enforcement comes in Phase 3
- [x] Create `src/lib/auth/session-cache.ts` — in-memory `Map` cache for tokenVersion (keyed by userId) and permissionVersion (keyed by groupId), 60s TTL. Exports `getCachedTokenVersion(userId)` and `getCachedPermissionVersion(groupId)`. On cache miss, queries DB and populates cache.
- [x] Create `src/lib/auth/rate-limiter.ts` — wraps `@upstash/ratelimit` + `@upstash/redis`. Export `rateLimit()` factory function and pre-configured limiters:
  - `login`: 5 attempts per IP per 60s
  - `signup`: 3 attempts per IP per 1h
  - `forgotPassword`: 3 attempts per IP per 1h
  - `resendVerification`: 3 attempts per IP per 1h
  - `verifyEmail`: 10 attempts per IP per 60s

### 1.4 — Utilities

- [x] Create `src/lib/utils/ip.ts` — `getClientIP()` reads `x-forwarded-for` header with fallback to `127.0.0.1`
- [x] Create `src/lib/utils/slug.ts` — `generateSlug(title)` — lowercase, hyphens, no special chars; checks DB for uniqueness, appends `-2`, `-3`... max 10 attempts

### 1.5 — Zod Validators

- [x] Create `src/lib/validators/auth.ts` — `signupSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema` — all fields use `.describe()`

### 1.6 — Auth Server Actions

- [x] Create `src/lib/actions/auth.ts` — Server Actions following the mandatory validation pattern (session → authorize → rate limit → validate → operate → revalidate → return):
  - `signup(formData)` — creates user with emailVerified=false, generates verification token, sends email. Rate limited: 3 per IP per hour.
  - `login(formData)` — validates credentials, checks `isAdmin` flag (if true, additionally checks group type is "admin"), creates session, redirects to dashboard. Rate limited: 5 per IP per 60s. Error message is generic ("Invalid email or password").
  - `logout()` — calls destroySession(), redirects to /
  - `verifyEmail(token)` — interactive Prisma transaction: delete token by value → update user.emailVerified → if pendingEmail set, move to email. Catches transaction failure for double-use race.
  - `forgotPassword(formData)` — always returns success (prevents enumeration). Rate limited: 3 per IP per hour.
  - `resetPassword(formData)` — validates token, updates password hash, increments tokenVersion, deletes token. Interactive transaction.
  - `resendVerification(formData)` — deletes old token, creates new one, sends email. Always returns success. Rate limited: 3 per IP per hour.

### 1.7 — Proxy (Route Protection)

- [x] Create `src/proxy.ts` — NOT `src/middleware.ts` (Next.js 16 convention: `export function proxy(request)` not `export function middleware(request)`)
  - Reads and decrypts `app_session` cookie via `request.cookies.get()` + `jwtDecrypt()`
  - Validates tokenVersion against `getCachedTokenVersion()` — if mismatch, redirect to login and delete cookie
  - Validates permissionVersion against `getCachedPermissionVersion()` — if mismatch, allow through with stale permissions (acceptable within 60s cache window)
  - `/account/*` → requires `authorize(session, { type: 'any' })`, else redirect to `/login`
  - `/admin/*` (except `/admin/login`) → requires `authorize(session, { type: 'admin' })`, else redirect non-logged-in to `/admin/login`, logged-in non-admins to `/account/dashboard`
  - `/admin/*` (except `/admin/login`) → requires `authorize(session, { type: 'route', path })`, else redirect to `/admin/dashboard`
  - Exports `config` with matcher: `['/account/:path*', '/admin/:path*']`
  - Cookie writes are NOT done here — proxy is read-only for sessions
- [x] IMPORTANT: Place proxy at `src/proxy.ts` (same level as `app/`). Export signature: `export async function proxy(request: NextRequest)`

### 1.8 — Shared Components

- [x] Create `src/components/shared/alert.tsx` — Alert component, props: `type` ('success' | 'error' | 'info'), `message`. Styled with Tailwind.
- [x] Create `src/components/shared/loading-spinner.tsx` — Loading spinner component
- [x] Create `src/components/shared/button.tsx` — Reusable Button component with variant support (primary, secondary, danger)
- [x] Create `src/components/shared/input.tsx` — Reusable Input component with label and error message display

### 1.9 — Frontend Layout

- [x] Create `src/components/frontend/header.tsx` — Header component (static placeholder: site name, Home + Login links for now; will become dynamic in Phase 2)
- [x] Create `src/components/frontend/footer.tsx` — Footer component (static placeholder: "Powered by Next.js" text)
- [x] Create `src/components/frontend/frontend-layout.tsx` — Header + `<main>{children}</main>` + footer wrapper
- [x] Update `src/app/layout.tsx` — wrap children in `<FrontendLayout>`, keep existing font setup, update metadata to use `NEXT_PUBLIC_SITE_URL`

### 1.10 — Admin Layout

- [x] Create `src/components/admin/sidebar.tsx` — Admin sidebar with navigation links (Dashboard, Users, Pages, Settings — static for now, Groups hidden until Phase 3)
- [x] Create `src/components/admin/admin-layout.tsx` — Sidebar + `<main>{children}</main>` wrapper
- [x] Create `src/app/admin/layout.tsx` — wraps children in AdminLayout, calls `authorize(session, { type: 'admin' })` and redirects if unauthorized

### 1.11 — Auth Pages (Frontend)

- [x] Create `src/app/login/page.tsx` — Frontend login form (email + password inputs, submit button, link to signup and forgot password). Uses `useActionState` with `login` Server Action. If already logged in, show message instead of form.
- [x] Create `src/app/signup/page.tsx` — Registration form (email + password + confirm password). Uses `useActionState` with `signup` Server Action.
- [x] Create `src/app/forgot-password/page.tsx` — Email input form. Uses `useActionState` with `forgotPassword` Server Action. Always shows success message after submit.
- [x] Create `src/app/reset-password/page.tsx` — Reads `token` from `searchParams`. Form with new password + confirm. Uses `useActionState` with `resetPassword` Server Action.
- [x] Create `src/app/verify-email/page.tsx` — Reads `token` from `searchParams`. Calls `verifyEmail` on mount. Shows success or error.
- [x] Create `src/app/resend-verification/page.tsx` — Email input form. Uses `useActionState` with `resendVerification` Server Action. Always shows success message.

### 1.12 — Auth Pages (Admin)

- [x] Create `src/app/admin/login/page.tsx` — Admin login form (email + password, `isAdmin: true` flag passed to login action). Only allows users in admin-type groups.
- [x] Create `src/app/admin/dashboard/page.tsx` — Empty admin dashboard with welcome message

### 1.13 — Account Area

- [x] Create `src/app/account/layout.tsx` — Protected layout: calls `getSession()` + `authorize(session, { type: 'any' })`, redirects to `/login` if unauthorized
- [x] Create `src/app/account/dashboard/page.tsx` — Empty dashboard with welcome message showing user's email

### 1.14 — Seed & Recovery Scripts

- [x] Create `scripts/seed.ts` — Idempotent seed script:
  - Creates "Super Admins" group if not exists (type="admin", routePermissions=["*"])
  - Creates or updates Super Admin user (email from `SUPER_ADMIN_EMAIL` env var, password from `SUPER_ADMIN_PASSWORD`, emailVerified=true, assigned to Super Admins group)
  - Inserts default settings if Setting table is empty: `home_page` (empty string), `header_menu_logged_out`, `header_menu_logged_in`, `footer_content`, `site_name`
  - Uses Prisma client directly
- [x] Create `scripts/recover-super-admin.ts` — CLI script that reads `SUPER_ADMIN_EMAIL` from env, updates email + password hash, increments tokenVersion. Usage: `npx tsx scripts/recover-super-admin.ts --email new@example.com --password newpass`

### Phase 1 Verification Checklist

- [x] Every file has JSDoc/file-level comments
- [x] All exported functions have JSDoc (purpose, parameters, return type)
- [x] Prisma schema has comments on each model and non-obvious field
- [x] Zod schemas use `.describe()` on all fields
- [x] Server Actions document required authorization level
- [x] `authorize()` function works for all four check types
- [x] Login/logout flow works end-to-end (frontend and admin)
- [x] Session cookie is httpOnly, sameSite=lax
- [x] Proxy protects `/account/*` routes (redirects to login)
- [x] Proxy protects `/admin/*` routes except `/admin/login` (redirects to admin login)
- [x] Session invalidation: change password tokenVersion → session rejected by proxy
- [x] Email verification flow works (token generated, stored, consumed in transaction)
- [x] Seed script runs idempotently
- [x] Recovery script works

---

## Phase 2: User Features + Admin CRUD

**Objective:** User-facing account management pages, admin CRUD for users and pages, settings management, dynamic public pages with header/footer from settings.

### 2.1 — User Validators & Actions

- [x] Create `src/lib/validators/user.ts` — `updateProfileSchema`, `changePasswordSchema`, `changeEmailSchema`, `deleteAccountSchema` — all fields use `.describe()`
- [x] Create `src/lib/actions/user.ts` — Server Actions following mandatory pattern:
  - `updateProfile(formData)` — updates name, phone, address. Auth: any.
  - `changePassword(formData)` — verifies current password, hashes new password, increments `tokenVersion`. Auth: any.
  - `changeEmail(formData)` — sets `pendingEmail`, sends verification email to new address. Old email stays active. Auth: any.
  - `deleteAccount(formData)` — verifies password, increments `tokenVersion`, deletes user + cascades. Auth: any.

### 2.2 — User Account Pages

- [x] Create `src/app/account/profile/page.tsx` — View/edit form with name, email (read-only), phone, address fields. Uses `updateProfile` action.
- [x] Create `src/app/account/change-password/page.tsx` — Current password + new password + confirm. Uses `changePassword` action. Shows success message on completion.
- [x] Create `src/app/account/change-email/page.tsx` — New email input. Uses `changeEmail` action. Shows message to check inbox for verification.
- [x] Create `src/app/account/delete-profile/page.tsx` — Password confirmation. Uses `deleteAccount` action with ConfirmDialog. Shows warning about data loss.

### 2.3 — Admin Users CRUD

- [x] Create `src/lib/actions/admin/users.ts` — Server Actions:
  - `getUsers(query)` — paginated list with optional search by name/email/phone. Includes group relation. Auth: admin + route `/admin/users`.
  - `createUser(formData)` — creates new user with provided email, password, name, groupId. Auth: admin + route `/admin/users`.
  - `updateUser(id, formData)` — updates name, email, phone, address, groupId. Cannot change Super Admin's email. Auth: admin + route `/admin/users`.
  - `deleteUser(id)` — deletes user. Prevents deleting Super Admin. Auth: admin + route `/admin/users`.
- [x] Create `src/app/admin/users/page.tsx` — User list table with columns: name, email, phone, group, verified, actions. Search form at top (submit-driven, no debounce). Pagination at bottom.
- [x] Create `src/app/admin/users/create/page.tsx` — Create user form: email, password, name, group dropdown. Uses `createUser` action.
- [x] Create `src/app/admin/users/[id]/edit/page.tsx` — Edit user form: name, email (read-only if Super Admin), phone, address, group dropdown. Uses `updateUser` action.

### 2.4 — Admin Pages CRUD

- [x] Create `src/lib/validators/page.ts` — `createPageSchema`, `updatePageSchema` — all fields use `.describe()`
- [x] Create `src/lib/actions/admin/pages.ts` — Server Actions:
  - `getPages(query)` — paginated list with optional search by title. Auth: admin + route `/admin/pages`.
  - `createPage(formData)` — creates page. If no slug provided, auto-generates from title with collision handling. Catches Prisma unique constraint error and suggests alternative slug. Auth: admin + route `/admin/pages`.
  - `updatePage(id, formData)` — updates title, content, slug. Slug must remain unique. Auth: admin + route `/admin/pages`.
  - `deletePage(id)` — deletes page. Refuses if page slug matches `home_page` setting. Auth: admin + route `/admin/pages`.
- [x] Create `src/app/admin/pages/page.tsx` — Page list table with columns: title, slug, updatedAt, actions. Search form at top. Pagination.
- [x] Create `src/app/admin/pages/create/page.tsx` — Create page form: title input → slug auto-generated and displayed below (re-runs on title change via client-side state), content HTML textarea. Uses `createPage` action.
- [x] Create `src/app/admin/pages/[id]/edit/page.tsx` — Edit page form: title, slug override, content HTML textarea. Uses `updatePage` action.

### 2.5 — Settings

- [x] Create `src/lib/settings-cache.ts` — Module-level cache for settings with 60s TTL. Stores parsed settings object. `getCachedSettings()` returns cached or fetches from DB. `invalidateSettingsCache()` called after updates.
- [x] Create `src/lib/validators/settings.ts` — `settingsSchema` — validates each setting key's structure (home_page as string, menus as JSON arrays of {label, href}, footer_content as string, site_name as string ≤100 chars)
- [x] Create `src/lib/actions/admin/settings.ts` — Server Actions:
  - `getSettings()` — returns typed settings object (from cache or DB). Auth: admin + route `/admin/settings`.
  - `updateSettings(formData)` — validates each setting, writes to DB, invalidates cache. Auth: admin + route `/admin/settings`.
- [x] Create `src/app/admin/settings/page.tsx` — Settings form:
  - Site name: text input
  - Home page: `<select>` dropdown of all page slugs
  - Header menu (logged-out): JSON textarea — admin edits `[{label, href}]` directly
  - Header menu (logged-in): JSON textarea — same format
  - Footer content: HTML textarea
  - Parse JSON values with try-catch on submit, show validation errors

### 2.6 — Shared Components (Phase 2)

- [x] Create `src/components/shared/pagination.tsx` — Reusable pagination with Previous/Next buttons and page numbers. Props: `currentPage`, `totalPages`, `baseUrl`.
- [x] Create `src/components/shared/search-input.tsx` — Simple search form with text input and submit button. Wraps in `<form>` that submits via query params (no debounce for MVP).
- [x] Create `src/components/shared/confirm-dialog.tsx` — Delete confirmation modal using `<dialog>` element. Props: `title`, `message`, `onConfirm`, `onCancel`.

### 2.7 — Public-Facing Dynamic Pages

- [x] Create `src/app/page.tsx` — Home page Server Component: calls `getSettings()` → reads `home_page` slug → fetches `Page` by slug → renders title + content (dangerouslySetInnerHTML for content). If no home page set, show a default landing page. Export `generateMetadata()` for SEO.
- [x] Create `src/app/[slug]/page.tsx` — Dynamic CMS page Server Component: fetches `Page` by slug → if not found, calls `notFound()` → renders title + content (dangerouslySetInnerHTML). Export `generateMetadata()` with page title + description (first 160 chars of stripped content).
- [x] Update `src/components/frontend/header.tsx` — Now dynamic: reads session via `getSession()`, fetches settings via `getCachedSettings()`, renders `header_menu_logged_in` if authenticated else `header_menu_logged_out`. Menu items rendered as `<a>` links.
- [x] Update `src/components/frontend/footer.tsx` — Now dynamic: fetches `footer_content` from settings, renders via `dangerouslySetInnerHTML`.

### Phase 2 Verification Checklist

- [x] Every file has JSDoc/file-level comments
- [x] Profile edit, password change, email change (with re-verification), account deletion all work end-to-end
- [x] Admin user list: search finds users, pagination works, create/edit/delete function correctly
- [x] Cannot delete Super Admin user
- [x] Admin page list: search finds pages, pagination works, create/edit/delete function correctly
- [x] Cannot delete page set as home_page
- [x] Slug auto-generation works and handles collisions
- [x] Settings page saves and loads correctly for all fields
- [x] Home page renders content from the selected CMS page
- [x] `/[slug]` renders correct page content and 404 for missing slugs
- [x] Header shows correct menu variant based on auth state
- [x] Footer renders HTML from settings
- [x] SEO metadata renders on home page and `/[slug]` pages

---

## Phase 3: User Groups & RBAC

**Objective:** Fine-grained admin permissions via user groups. Super Admin gate for group management. Route-level authorization enforcement. Permission-based sidebar filtering.

### 3.1 — Group Validators & Actions

- [x] Create `src/lib/validators/group.ts` — `createGroupSchema`, `updateGroupSchema` — all fields use `.describe()`
- [x] Create `src/lib/actions/admin/groups.ts` — Server Actions:
  - `getGroups()` — returns all groups with user count. Auth: super_admin.
  - `createGroup(formData)` — creates group with name, type, routePermissions. Auth: super_admin.
  - `updateGroup(id, formData)` — updates group. If permissions changed, increments `permissionVersion` (invalidates sessions for all users in group). Prevents changing own group's type or permissions to avoid lockout. Auth: super_admin.
  - `deleteGroup(id)` — deletes group. Refuses if group has users assigned. Refuses if it's the Super Admin's group. Auth: super_admin.

### 3.2 — Group CRUD Pages

- [x] Create `src/app/admin/groups/page.tsx` — Group list table: name, type, user count, permission count, actions. Super Admin only.
- [x] Create `src/app/admin/groups/create/page.tsx` — Create group form: name input, type dropdown (admin/regular), route permissions checkbox list (predefined routes: /admin/users, /admin/pages, /admin/settings, /admin/groups). Super Admin only.
- [x] Create `src/app/admin/groups/[id]/edit/page.tsx` — Edit group form: same fields. Disable type/permissions editing if this is the Super Admin's own group. Super Admin only.

### 3.3 — Permission Infrastructure

- [x] Update `src/components/admin/sidebar.tsx` — Now filters visible menu items based on `routePermissions` from session. Super Admin sees all items. Hide Groups link from non-super-admin users.
- [x] Create `src/components/admin/permission-guard.tsx` — Conditional rendering wrapper. Props: `requiredPermission: AuthCheck`. Calls `authorize(session, check)`, renders children or null. Used for conditional admin UI elements.
- [x] Update `src/app/admin/users/[id]/edit/page.tsx` — Add group assignment dropdown (only visible if user has appropriate permissions)
- [x] Verify proxy.ts is already enforcing route-level permissions (built in Phase 1 with `authorize({ type: 'route', path })`). If not fully wired, update now.
- [x] Update `src/app/admin/layout.tsx` — After successful admin auth check, also call `updateSession` if `permissionVersion` in session doesn't match DB (stale permission refresh)

### Phase 3 Verification Checklist

- [x] Every file has JSDoc/file-level comments
- [x] Super Admin can create, edit, delete groups
- [x] Non-super-admin users cannot access `/admin/groups` (redirected by proxy)
- [x] Group type and permissions saved correctly
- [x] Changing a group's permissions increments `permissionVersion`
- [x] Users in group with changed permissions get their session updated on next request
- [x] Admin sidebar filters menu items by routePermissions from session
- [x] Admin without `/admin/users` permission cannot access user management pages
- [x] Cannot change own group's type or permissions
- [x] Cannot delete group with assigned users
- [x] Cannot delete Super Admin's group

---

## Phase 4: Polish & Harden

**Objective:** SEO, error handling, loading states, responsive design, security hardening, notification system.

### 4.1 — SEO

- [x] Verify `generateMetadata()` on `src/app/page.tsx` and `src/app/[slug]/page.tsx` (should already exist from Phase 2). Enhance with OpenGraph and Twitter card metadata.
- [x] Add `generateMetadata()` to `src/app/layout.tsx` with default title, description, and site URL from settings.
- [x] Create `src/app/sitemap.ts` — generates sitemap XML: includes `/`, all published pages from DB, and static routes (`/login`, `/signup`). Uses `NEXT_PUBLIC_SITE_URL`.
- [x] Create `public/robots.txt` — allows all crawlers, points to sitemap

### 4.2 — Error Handling

- [x] Create `src/app/error.tsx` — Global error boundary with "Something went wrong" message and retry button
- [x] Create `src/app/not-found.tsx` — Custom 404 page with link back to home
- [x] Create `src/app/loading.tsx` — Global loading skeleton
- [x] Create `src/app/account/error.tsx` — Account area error boundary
- [x] Create `src/app/account/loading.tsx` — Account area loading skeleton
- [x] Create `src/app/admin/error.tsx` — Admin area error boundary
- [x] Create `src/app/admin/loading.tsx` — Admin area loading skeleton
- [x] Inline form validation errors: ensure every form field shows Zod validation errors next to the input. Create a `FormField` wrapper or pattern for consistent error display.

### 4.3 — Notification System

- [x] Create a toast notification system using flash cookies (survives redirects in Server Actions):
  - Create `src/lib/flash.ts` — `setFlash(message)`, `getFlash()` — stores flash messages in a short-lived cookie (maxAge: 60s, path: /)
  - Create `src/components/shared/toast.tsx` — Reads flash cookie, displays message with type styling, clears cookie
  - Add `<Toast />` to root layout
  - Messages auto-dismiss after 5s via client-side timeout

### 4.4 — Responsive Design

- [x] Admin sidebar: collapses to hamburger menu on mobile (max-width: 768px). Toggle via state. Sidebar overlays content on mobile.
- [x] Tables: add `overflow-x-auto` wrapper for horizontal scroll on small screens
- [x] Forms: ensure all form inputs are full-width on mobile viewports
- [x] Header: responsive navigation (hamburger menu on mobile for header menu items)

### 4.5 — Security Hardening

- [x] Add security headers in `next.config.ts`:
  - `Content-Security-Policy` — default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
  - `Strict-Transport-Security` — max-age=63072000; includeSubDomains; preload
  - `X-Content-Type-Options` — nosniff
  - `X-Frame-Options` — DENY
  - `Referrer-Policy` — strict-origin-when-cross-origin
- [x] Verify session cookie configuration: httpOnly, secure (production), sameSite=lax, path=/, maxAge matches JWE expiration
- [x] Prisma connection error handling: ensure `lib/prisma.ts` singleton handles connection failures gracefully (log error, provide clear message, retry logic)
- [x] Email sending: wrap `nodemailer.sendMail()` in try-catch, log error server-side, return user-friendly message
- [x] Token cleanup: call `cleanupExpiredTokens()` at startup AND via `setInterval` every 60 minutes
- [x] Document HTML trust boundary: add comment in page rendering code noting that admin-authored HTML/content is trusted and rendered via `dangerouslySetInnerHTML`
- [x] Input sanitization: ensure Zod schemas trim strings and reject overly long inputs where appropriate

### 4.6 — Final Cleanup

- [x] Remove all placeholder/boilerplate code from initial Next.js scaffold
- [x] Ensure no `console.log` statements remain (use structured `console.error` for actual errors)
- [x] Verify all imports use `@/` path alias
- [x] Create `.env.example` file documenting all required environment variables with descriptions
- [x] Verify `README.md` has clear setup instructions (database setup, env vars, seed, dev server)
- [x] Final JSDoc pass: ensure every file has file-level comment, every exported function has full JSDoc

### Phase 4 Verification Checklist

- [x] Every file has JSDoc/file-level comments
- [x] Full manual flow test: signup → verify email → login → edit profile → change password → logout → login admin → CRUD users → CRUD pages → edit settings → manage groups → logout → view public pages
- [x] SEO: view source on public pages shows correct title, description, og:tags
- [x] `GET /sitemap.xml` returns valid XML
- [x] `GET /robots.txt` returns correct content
- [x] 404 page renders for non-existent routes
- [x] Error boundaries display gracefully when errors occur
- [x] Loading skeletons appear during navigation
- [x] Form validation errors display inline next to fields
- [x] Toast notifications appear and auto-dismiss
- [x] Responsive: test all pages at 375px, 768px, 1024px widths
- [x] Security headers present in all responses
- [x] Rate limiting blocks repeated login attempts
- [x] Session invalidation works for all trigger events

---

## Final Delivery Checklist

- [x] All 4 phases complete, all verification checks passed
- [x] Every file has `/** @fileoverview ... */` or equivalent JSDoc file-level comment
- [x] All exported functions have JSDoc (purpose, parameters, return type)
- [x] Inline comments explain non-obvious logic (edge cases, why a check exists)
- [x] Zod schemas use `.describe()` on every field
- [x] Server Actions document required authorization level in JSDoc
- [x] Prisma schema has `///` comments on each model and non-obvious field
- [x] `.env.example` file exists with all variables and descriptions
- [x] `README.md` has setup instructions (clone, install, env vars, database, migrate, seed, dev)
- [x] No dead code, no `console.log`, no commented-out code blocks
- [x] All imports use `@/` path alias

---

## Quick Reference: Key Architectural Rules

These must be followed across all phases:

1. **Session library is `jose`** — `EncryptJWT` to create, `jwtDecrypt` to read. Cookie name: `app_session`. Algorithm: `alg: 'dir', enc: 'A256GCM'`.
2. **Proxy is `src/proxy.ts`** — NOT `middleware.ts`. Export `proxy(request)`, not `middleware(request)`. Read-only for sessions — never write cookies here.
3. **Session writes happen in Server Actions / Server Components** — via `await cookies()` + `cookieStore.set()`/`cookieStore.delete()`.
4. **Rate limiting inside Server Actions, not proxy** — Uses `@upstash/ratelimit` + `@upstash/redis`.
5. **`authorize()` first line of every Server Action** — after getting session, before any business logic.
6. **Server Action pattern** — session → authorize → rate limit → validate (Zod) → operate (Prisma) → revalidatePath → return.
7. **Super Admin identified by `session.email === process.env.SUPER_ADMIN_EMAIL`** — no separate DB flag.
8. **Token operations use interactive Prisma transactions** — prevents double-use race conditions on verification and password reset.
9. **`tokenVersion` on User, `permissionVersion` on UserGroup** — checked in proxy with 60s in-memory cache for session invalidation.
10. **All public pages export `generateMetadata()`** — dynamic SEO from page data.

---

## Quick Reference: File Creation Dependency Order

| Order | File | Phase | Depends On |
|---|---|---|---|
| 1 | `prisma/schema.prisma` | 1 | nothing |
| 2 | `src/lib/prisma.ts` | 1 | 1 |
| 3 | `src/types/index.ts` | 1 | nothing |
| 4 | `src/lib/auth/password.ts` | 1 | nothing |
| 5 | `src/lib/auth/tokens.ts` | 1 | 2 |
| 6 | `src/lib/auth/session.ts` | 1 | 3 (types) |
| 7 | `src/lib/auth/session-cache.ts` | 1 | 2, 6 |
| 8 | `src/lib/auth/authorize.ts` | 1 | 3, 6 |
| 9 | `src/lib/auth/email.ts` | 1 | nothing |
| 10 | `src/lib/auth/rate-limiter.ts` | 1 | nothing |
| 11 | `src/lib/utils/ip.ts` | 1 | nothing |
| 12 | `src/lib/utils/slug.ts` | 1 | 2 |
| 13 | `src/lib/validators/auth.ts` | 1 | nothing |
| 14 | `src/lib/actions/auth.ts` | 1 | 4,5,6,8,9,10,11,13 |
| 15 | `src/proxy.ts` | 1 | 6,7,8 |
| 16 | `src/components/shared/*` (alert, spinner, button, input) | 1 | nothing |
| 17 | `src/components/frontend/*` (header, footer, layout) | 1 | 16 |
| 18 | `src/components/admin/*` (sidebar, layout) | 1 | 16 |
| 19 | `src/app/layout.tsx` (update) | 1 | 17 |
| 20 | `src/app/admin/layout.tsx` | 1 | 8, 18 |
| 21 | Frontend auth pages | 1 | 14, 16 |
| 22 | `src/app/admin/login/page.tsx` + dashboard | 1 | 14, 16 |
| 23 | `src/app/account/layout.tsx` + dashboard | 1 | 8, 14 |
| 24 | `scripts/seed.ts` | 1 | 2, 4 |
| 25 | `scripts/recover-super-admin.ts` | 1 | 2, 4 |
| 26 | `src/lib/validators/user.ts` | 2 | nothing |
| 27 | `src/lib/validators/page.ts` | 2 | nothing |
| 28 | `src/lib/actions/user.ts` | 2 | 6, 8, 10, 11, 26 |
| 29 | Account pages (profile, change-password, change-email, delete) | 2 | 16, 28 |
| 30 | `src/lib/actions/admin/users.ts` | 2 | 6, 8, 10, 11 |
| 31 | Admin user CRUD pages | 2 | 16, 30 |
| 32 | `src/lib/actions/admin/pages.ts` | 2 | 6, 8, 10, 11, 12, 27 |
| 33 | Admin page CRUD pages | 2 | 16, 32 |
| 34 | `src/lib/settings-cache.ts` | 2 | 2 |
| 35 | `src/lib/validators/settings.ts` | 2 | nothing |
| 36 | `src/lib/actions/admin/settings.ts` | 2 | 6, 8, 34, 35 |
| 37 | Admin settings page | 2 | 16, 36 |
| 38 | Shared components (pagination, search-input, confirm-dialog) | 2 | nothing |
| 39 | `src/app/page.tsx` (home page) | 2 | 34, 36 |
| 40 | `src/app/[slug]/page.tsx` | 2 | 2 |
| 41 | Update header.tsx + footer.tsx dynamic | 2 | 34, 36 |
| 42 | `src/lib/validators/group.ts` | 3 | nothing |
| 43 | `src/lib/actions/admin/groups.ts` | 3 | 6, 8, 42 |
| 44 | Admin group CRUD pages | 3 | 16, 43 |
| 45 | `src/components/admin/permission-guard.tsx` | 3 | 8 |
| 46 | Update sidebar.tsx for permissions | 3 | 6, 8 |
| 47 | SEO (metadata, sitemap, robots.txt) | 4 | 2, 34 |
| 48 | Error boundaries + loading states | 4 | nothing |
| 49 | Toast/flash notification system | 4 | nothing |
| 50 | Responsive design pass | 4 | all pages |
| 51 | Security headers + hardening | 4 | nothing |
