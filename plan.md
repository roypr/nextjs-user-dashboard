# Implementation Plan: User Management System + CMS

---

**TL;DR**
A lightweight Next.js user management system with a basic CMS, separate frontend and admin areas, RBAC, email verification, and PostgreSQL persistence. Uses Next.js App Router with iron-session for stateless auth (with tokenVersion-based invalidation), Prisma ORM, Server Actions for form handling, and Upstash Redis for rate limiting. The single biggest risk is iron-session + Next.js 16 middleware compatibility — spike this first.

---

## Code Style & Documentation

**This is an open source project.** Every file must include:
- A file-level JSDoc comment at the top explaining what the module does
- JSDoc comments on all exported functions (purpose, parameters, return type)
- Inline comments for non-obvious logic (e.g., why a particular check exists, edge cases being handled)
- A `/** @fileoverview ... */` or equivalent comment even on component files

Server Actions must document which authorization level they require. Zod schemas must document what each field represents. Prisma schema must have comments on each model and non-obvious field.

---

## Project Classification

- **Type:** Internal tool / production-ready MVP
- **Complexity:** Moderate (custom auth, dual-area, RBAC)
- **Expected scale:** Low-to-moderate (single deployment, small-to-medium user base)
- **Team:** AI coding agents following this plan

---

## Goal

Build a user management and CMS system where:
- **End users** can sign up, verify email, log in, manage their profile, and view CMS pages.
- **Admins** can manage users, pages, and site settings via a separate admin panel.
- **Super Admin** (single account, `.env`-defined) controls user groups and route-level permissions.
- Public-facing pages are SEO-friendly and use a common header/footer layout.

---

## Confirmed Requirements

1. Separate login pages for frontend users and admin users
2. User signup with email + password only (email verification required)
3. Email verification for signup and email change (with resend option)
4. User profile: name, email, phone, address
5. Frontend dashboard (empty placeholder) for logged-in users
6. Route-based protection: `account/*` restricted to any authenticated user
7. Admin panel: only users in groups with type `admin` can log in
8. Admin CRUD for Users, Pages (title + HTML content, no WYSIWYG)
9. Settings: home page selection, header menu (different for logged-in/out), footer content (HTML)
10. User groups with type `admin` or `regular`, created by Super Admin only
11. Route-based access control within admin panel (not all admins access all routes)
12. Super Admin: single account defined in `.env`, only one who creates groups and assigns permissions
13. Forgot password, change password, change email, edit profile, delete profile flows
14. Next.js with React Compiler, TypeScript, Tailwind CSS
15. PostgreSQL, accessed via `DATABASE_URL` env var
16. Prisma ORM
17. Industry-standard security practices
18. SEO best practices for public content
19. Session invalidation on password change, permission change, and account deletion (tokenVersion pattern)

---

## Assumptions

1. **Email sending** — A transactional email service (Resend recommended, SendGrid or SMTP also supported) will be configured via env vars. Resend is preferred for deliverability (DKIM/SPF/DMARC handled automatically). nodemailer connects via SMTP, which Resend supports.
2. **Single deployment** — One instance serving both frontend and admin. No horizontal scaling needed initially.
3. **Session strategy** — Stateless sealed cookies (iron-session) with a `tokenVersion` field on User for invalidation on password change / account deletion, and a `permissionVersion` on UserGroup for permission change invalidation. Invalidation checks happen in middleware with a 60-second in-memory cache to avoid DB hits.
4. **File uploads** — Not required. Profile images out of scope for MVP.
5. **Pagination** — Needed for user and page lists but modest scale (server-side with offset/limit, no cursor-based).
6. **Admin route permissions** — Stored as an array of route path patterns in the UserGroup record (e.g., `["/admin/users", "/admin/pages"]`). Pattern matching uses `startsWith`. Wildcard patterns like `"/admin/users*"` are the expected format and cover parameterized sub-routes.
7. **Slug generation** — Auto-generated from page title (lowercase, hyphens, no special chars). If slug exists, append `-2`, `-3`, etc. (max 10 attempts). Slug is shown to admin before save. Prisma unique constraint error is caught and returns a specific error message with a suggested alternative slug.
8. **Home page** — Settings stores the slug of the selected page. Frontend `/` route renders that page's content. Deleting the home page is prevented if it's currently set as `home_page` in settings.
9. **Settings header menu editor** — For MVP, the header menu is edited as raw JSON in a textarea (admins edit a JSON array of `{label, href}` objects directly). A visual editor with add/remove/reorder buttons is deferred to a future enhancement.
10. **Rate limiting** — Uses Upstash Redis (free tier: 10,000 commands/day). Applied inside Server Actions (not middleware) to reliably get client IP via `x-forwarded-for` header.

> **If invalidated:** If iron-session proves incompatible with Next.js 16 middleware, switch to `@oslojs/jose` for manual JWT-based httpOnly cookie sessions. If user scale exceeds ~50K, add connection pooling (PgBouncer) and consider Redis for settings caching. If Upstash Redis is unavailable, fall back to an in-memory `Map` with the understanding that limits reset on deploy and don't work across multiple instances.

---

## Constraints

| Constraint | Impact |
|---|---|
| PostgreSQL only (no SQLite fallback) | Requires a running PG instance for dev; use Docker Compose |
| No bundled DB | No `better-sqlite3` or embedded option; good for production parity |
| Email verification mandatory | Adds token generation, email sending, verification endpoint, and resend flow complexity |
| Separate login pages | Two auth entry points with shared session logic; must prevent cross-area session confusion |
| React Compiler | Requires Next.js 15+ with `reactCompiler: true` in next.config; already enabled |
| Open source | All files must have JSDoc/file-level comments; code must be self-documenting |

---

## Recommended Stack

| Layer | Technology | Version | Justification |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.x | Industry standard, React Compiler support, server components, built-in SEO |
| Language | TypeScript (strict mode) | 5.x | Type safety across the stack |
| Styling | Tailwind CSS | v4 | Utility-first, rapid UI, good DX with Next.js |
| ORM | Prisma | latest | Type-safe queries, migrations, excellent PG support |
| Database | PostgreSQL | 15+ | Required; battle-tested |
| Auth (sessions) | `iron-session` | v8+ | Stateless sealed cookies, minimal overhead |
| Password hashing | `bcryptjs` | latest | Pure JS avoids native build issues in CI/CD |
| Email | `nodemailer` + Resend SMTP | latest | Simple, Resend provides reliable deliverability |
| Form handling | Server Actions + `useActionState` | built-in | Native Next.js pattern, automatic CSRF |
| Validation | `zod` | latest | Type-safe schema validation for API boundaries |
| Rate limiting | `@upstash/ratelimit` + `@upstash/redis` | latest | Simple API, free tier sufficient, works cross-instance |

**NPM packages to install:**
```
iron-session
bcryptjs
nodemailer
zod
@upstash/ratelimit
@upstash/redis
prisma
@prisma/client
```

**Alternatives considered and rejected:**
- **next-auth v5:** Feature-rich but heavy for this use case; credential provider + email verification requires significant custom wiring anyway.
- **Lucia Auth:** Recently deprecated; migration burden.
- **Drizzle ORM:** Good but Prisma's migration system and studio are better for rapid admin-panel development.
- **JWT in localStorage:** Security anti-pattern; httpOnly cookies strictly better.
- **bcrypt (native):** Requires native build tools; `bcryptjs` is simpler for CI/CD and still secure at cost factor 12.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│                                                         │
│  ┌──────────────────┐       ┌──────────────────┐       │
│  │   Frontend Area   │       │    Admin Area     │       │
│  │  /                │       │  /admin/*         │       │
│  │  /login           │       │  /admin/login     │       │
│  │  /signup          │       │  /admin/dashboard │       │
│  │  /account/*       │       │  /admin/users     │       │
│  │  /[page-slug]     │       │  /admin/pages     │       │
│  └────────┬─────────┘       │  /admin/settings  │       │
│           │                 │  /admin/groups    │       │
│           │                 └────────┬──────────┘       │
│           │                          │                   │
│  ┌────────▼──────────────────────────▼──────────┐       │
│  │              Middleware (route guard)          │       │
│  │  - Parse iron-session cookie (await cookies()) │       │
│  │  - Validate tokenVersion against in-memory    │       │
│  │    cache (60s TTL, fallback to DB query)      │       │
│  │  - /account/* → require any auth              │       │
│  │  - /admin/* (except /admin/login) → require   │       │
│  │    admin + check route permissions            │       │
│  │  - Super Admin bypasses all permission checks │       │
│  └──────────────────────┬───────────────────────┘       │
│                         │                                │
│  ┌──────────────────────▼───────────────────────┐       │
│  │          Server Actions / API Routes          │       │
│  │  - Auth actions (signup, login, logout, etc) │       │
│  │  - CRUD actions (users, pages, settings)     │       │
│  │  - Email actions (verification, reset)       │       │
│  │  - Rate limiting applied inside each action  │       │
│  │  - authorize() called as first line in each  │       │
│  └──────────────────────┬───────────────────────┘       │
│                         │                                │
│  ┌──────────────────────▼───────────────────────┐       │
│  │              Prisma ORM Layer                 │       │
│  │  - Typed queries, migrations, validation      │       │
│  └──────────────────────┬───────────────────────┘       │
│                         │                                │
│  ┌──────────────────────▼───────────────────────┐       │
│  │              PostgreSQL                       │       │
│  │  Tables: users, user_groups, pages,           │       │
│  │  settings, verification_tokens,               │       │
│  │  password_reset_tokens                        │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

1. **Single middleware for both areas** — Simplifies session parsing; route pattern matching determines auth requirements.
2. **Server Actions over API Routes** — Better DX with form submissions, automatic CSRF protection via Next.js, no need for client-side fetch boilerplate.
3. **No separate API server** — Everything lives in the Next.js app; reduces operational surface area.
4. **Stateless sessions with tokenVersion** — Session data (userId, groupId, groupType, routePermissions, tokenVersion, permissionVersion) sealed in an httpOnly cookie. Token version checked against DB (with short cache) on each request via middleware. This gives us stateless performance with stateful invalidation.
5. **Rate limiting in Server Actions, not middleware** — Middleware cannot reliably get client IP across all deployment environments. Server Actions use `headers().get('x-forwarded-for')` with fallback logic.
6. **Authorization at two layers** — Middleware for route-level gating (redirect if unauthorized), Server Actions for operation-level enforcement (defense in depth). Layout components call `authorize()` for render-level decisions (showing/hiding admin sidebar items), but route enforcement lives in middleware.

---

## Component Breakdown

### 1. Auth System (`lib/auth/`)

| File | Responsibility |
|---|---|
| `session.ts` | `getSession()`, `createSession()`, `destroySession()`, `updateSession()` — wraps iron-session. `createSession` includes `tokenVersion` from User and `permissionVersion` from UserGroup in the session payload. `updateSession` refreshes these versions from DB. |
| `password.ts` | `hashPassword()`, `verifyPassword()` — bcryptjs wrappers with cost factor 12 |
| `tokens.ts` | `generateToken()` (uses `crypto.randomUUID()`), `createVerificationToken()`, `createPasswordResetToken()`, `validateToken()`, `cleanupExpiredTokens()` |
| `email.ts` | `sendVerificationEmail()`, `sendPasswordResetEmail()` — nodemailer wrapper configured via SMTP env vars |
| `authorize.ts` | `authorize()` function — the single authorization entry point, supports `any`, `admin`, `route`, and `super_admin` check types |
| `rate-limiter.ts` | `rateLimit()` function — wraps `@upstash/ratelimit`, configured with Upstash Redis. Exported as a factory that takes identifier (IP + action type) and returns `{ success, limit, remaining, reset }`. |
| `session-cache.ts` | In-memory `Map` cache for tokenVersion/permissionVersion lookups with 60-second TTL. Exports `getCachedTokenVersion(userId)` and `getCachedPermissionVersion(groupId)`. On cache miss, queries DB and populates cache. |

### 2. Frontend Area (`app/`)

| Route | Type | Auth | Description |
|---|---|---|---|
| `/` | Page | Public | Renders home page from settings. Fetches home_page slug from settings, then fetches that page's content. |
| `/login` | Page | Public | User login form. Must not redirect already-logged-in users; show message instead. |
| `/signup` | Page | Public | Registration form (email + password only) |
| `/forgot-password` | Page | Public | Request password reset (email input) |
| `/reset-password` | Page | Public | Reset password form (token in query param `?token=xxx`) |
| `/verify-email` | Page | Public | Email verification handler (token in query param `?token=xxx`). Uses interactive Prisma transaction to prevent double-use race. |
| `/resend-verification` | Page | Public | Request a new verification email. Rate limited: 3 requests per IP per hour. |
| `/account/dashboard` | Page | Any user | Empty dashboard placeholder with welcome message |
| `/account/profile` | Page | Any user | View/edit profile form (name, email, phone, address) |
| `/account/change-password` | Page | Any user | Change password form (current password + new password). Increments `tokenVersion` on success. |
| `/account/change-email` | Page | Any user | Change email form. Sets `pendingEmail`, sends verification to new address. Old email remains active until new one verified. |
| `/account/delete-profile` | Page | Any user | Delete account confirmation with password re-entry. Increments `tokenVersion` before deletion to invalidate session. |
| `/[slug]` | Page | Public | Dynamic CMS page. Fetches page by slug, returns 404 if not found. |

### 3. Admin Area (`app/admin/`)

| Route | Type | Auth | Description |
|---|---|---|---|
| `/admin/login` | Page | Public (no session) | Admin login form. Only allows users in groups with `type="admin"`. |
| `/admin/dashboard` | Page | Admin | Empty dashboard with admin welcome |
| `/admin/users` | Page | Admin (perm check) | User list table with search by name/email/phone (server-side, form-submit-driven, no debounce for MVP). Pagination. |
| `/admin/users/create` | Page | Admin (perm check) | Create user form (email, password, name, group assignment) |
| `/admin/users/[id]/edit` | Page | Admin (perm check) | Edit user form (name, email, phone, address, group assignment). Cannot edit Super Admin's email. |
| `/admin/pages` | Page | Admin (perm check) | Page list table with search by title (server-side, form-submit-driven). Pagination. |
| `/admin/pages/create` | Page | Admin (perm check) | Create page form (title → auto-generates slug shown below title field; content as HTML textarea) |
| `/admin/pages/[id]/edit` | Page | Admin (perm check) | Edit page form (title, slug override, content). Slug must remain unique. |
| `/admin/settings` | Page | Admin (perm check) | Site settings: home page dropdown (all pages), header menu JSON textarea (logged-out), header menu JSON textarea (logged-in), footer HTML textarea, site name. |
| `/admin/groups` | Page | Super Admin only | User group list |
| `/admin/groups/create` | Page | Super Admin only | Create group form (name, type dropdown: admin/regular, route permissions checkbox list) |
| `/admin/groups/[id]/edit` | Page | Super Admin only | Edit group form. Cannot change own group's type or permissions to prevent lockout. |

### 4. Shared Components (`components/`)

| Component | Purpose |
|---|---|
| `FrontendLayout` | Header + footer wrapper. Used in `app/layout.tsx` for all frontend routes. Reads header menu from settings (logged-in vs logged-out variant based on session). |
| `AdminLayout` | Sidebar + topbar wrapper. Used in `app/admin/layout.tsx`. Sidebar filters visible menu items based on routePermissions from session. |
| `Header` | Renders dynamic menu from settings. Checks session to determine which menu variant to show. |
| `Footer` | Renders raw HTML from `footer_content` setting using `dangerouslySetInnerHTML`. |
| `AuthGuard` | Client component wrapper for protected routes. Shows loading spinner while session is being validated, redirects to login if unauthorized. Used as fallback UI, not primary auth enforcement. |
| `Pagination` | Reusable pagination component. Props: `currentPage`, `totalPages`, `baseUrl`. Renders Previous/Next + page numbers. |
| `SearchInput` | Simple search input with submit button (no debounce for MVP). Wrapped in a `<form>` that submits via query params. |
| `ConfirmDialog` | Delete confirmation modal. Props: `title`, `message`, `onConfirm`, `onCancel`. Uses `<dialog>` element with backdrop. |
| `Alert` | Notification component for success/error messages. Props: `type` ('success' | 'error' | 'info'), `message`. |
| `PermissionGuard` | Conditional rendering wrapper. Props: `requiredPermission: AuthCheck`. Checks session permissions, renders children or nothing. Used in admin sidebar and for conditional UI elements. |

### 5. Server Actions (`lib/actions/`)

| File | Operations |
|---|---|
| `auth.ts` | `signup()`, `login()`, `logout()`, `verifyEmail()`, `forgotPassword()`, `resetPassword()`, `resendVerification()` |
| `user.ts` | `updateProfile()`, `changePassword()`, `changeEmail()`, `deleteAccount()` |
| `admin/users.ts` | `createUser()`, `updateUser()`, `deleteUser()`, `getUsers()` |
| `admin/pages.ts` | `createPage()`, `updatePage()`, `deletePage()`, `getPages()` |
| `admin/settings.ts` | `updateSettings()`, `getSettings()` |
| `admin/groups.ts` | `createGroup()`, `updateGroup()`, `deleteGroup()`, `getGroups()` |

### 6. Authorization Utility (`lib/auth/authorize.ts`)

Single `authorize()` function used by middleware (route-level), Server Actions (operation-level), and layout components (render-level).

```ts
/**
 * Authorization check types for the unified authorize() function.
 * 
 * - 'any':          Any authenticated user (frontend or admin)
 * - 'admin':        Any user in a group with type 'admin'
 * - 'route':        Admin user with specific route permission pattern
 * - 'super_admin':  Only the Super Admin (matched by SUPERVISOR_ADMIN_EMAIL env var)
 */
type AuthCheck = 
  | { type: 'any' }
  | { type: 'admin' }
  | { type: 'route'; path: string }
  | { type: 'super_admin' }

/**
 * Unified authorization function.
 * 
 * @param session - The current session data (or null if not logged in)
 * @param check - The authorization check to perform
 * @returns boolean - true if authorized
 * 
 * Super Admin (identified by session.isSuperAdmin === true) always passes all checks.
 * 
 * @example
 * // In a Server Action:
 * authorize(session, { type: 'admin' })
 * 
 * // In middleware:
 * authorize(session, { type: 'route', path: '/admin/users' })
 */
function authorize(session: SessionData | null, check: AuthCheck): boolean
```

**Important:** This function must be implemented with all four check types in Phase 1, even though `route` and `super_admin` checks won't be enforced until Phase 3. This prevents a rework cycle when Phase 3 starts.

---

## Data Flow

### Authentication Flow

```
1. User submits login form
2. Rate limiter check: max 5 attempts per IP per 60 seconds
3. Server Action: validate credentials against DB (bcrypt.compare)
4. If valid: fetch user's group + group's permissionVersion
5. Create iron-session seal with:
   { userId, email, groupId, groupType, routePermissions, isSuperAdmin, tokenVersion, permissionVersion }
6. Set httpOnly cookie in response (7-day maxAge)
7. Redirect to appropriate dashboard (frontend or admin)
8. Middleware on subsequent requests:
   a. Decrypt session cookie
   b. Check in-memory cache for latest tokenVersion (60s TTL)
   c. If cache miss: query DB for current tokenVersion + permissionVersion
   d. If versions don't match: destroy session, redirect to login
   e. If match: allow request through
```

### Email Verification Flow

```
1. User signs up → user created with emailVerified=false
2. Server generates crypto.randomUUID() token, stores in verification_tokens table with 24h expiry
3. Email sent with link: /verify-email?token=xxx
4. User clicks link → interactive Prisma transaction:
   - Delete token by value (if already consumed, transaction fails)
   - Update user.emailVerified = true
   - If pendingEmail is set, move pendingEmail → email and clear pendingEmail
5. If transaction fails (token already used) → show "Link already used or expired"
6. Resend flow: user requests new token → old token deleted → new token generated → new email sent
   Rate limited: 3 resends per IP per hour
```

### Page Rendering Flow

```
1. User visits / or /[slug]
2. Server Component:
   - If "/": call getSettings() → read home_page slug → fetch that page by slug
   - If "/[slug]": fetch page by slug directly
3. If page not found → next({ notFound: true }) → renders not-found.tsx
4. Render page content inside FrontendLayout (header from settings, footer from settings)
5. SEO: generateMetadata() exports dynamic title (page.title), description (first 160 chars of stripped content)
```

### Admin CRUD Flow

```
1. Admin navigates to /admin/users
2. Server Component: calls getUsers() Server Action → fetches user list with group include
3. Search: form submit with query param → Server Component reads searchParams, passes to getUsers()
4. Create/Edit: Server Action handles form submission with Zod validation
   - Validates input
   - Checks authorization via authorize()
   - Performs Prisma operation
   - Calls revalidatePath() on the list route
   - Returns { success: true } or { error: string }
5. Delete: ConfirmDialog → Server Action → revalidatePath()
   - deletePage() checks if page slug matches home_page setting → prevents deletion if so
   - deleteUser() prevents deleting Super Admin
   - deleteGroup() prevents deleting group that contains the current user
```

### Settings Caching Flow

```
1. First request: getSettings() queries all rows from Setting table
2. Result is cached in a module-level variable with timestamp
3. Subsequent requests within 60 seconds: return cached value
4. After 60 seconds: re-query DB, update cache
5. updateSettings() Server Action: updates DB, then invalidates cache immediately
6. Cache stores parsed JSON values (header menus as typed arrays, not raw strings)
```

---

## Suggested Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (metadata, fonts, FrontendLayout)
│   ├── page.tsx                      # Home page (renders selected CMS page from settings)
│   ├── not-found.tsx                 # Custom 404 page
│   ├── error.tsx                     # Global error boundary
│   ├── loading.tsx                   # Global loading skeleton
│   ├── login/
│   │   └── page.tsx                  # Frontend login form
│   ├── signup/
│   │   └── page.tsx                  # Registration form
│   ├── forgot-password/
│   │   └── page.tsx                  # Request password reset
│   ├── reset-password/
│   │   └── page.tsx                  # Reset password (token in query)
│   ├── verify-email/
│   │   └── page.tsx                  # Email verification handler
│   ├── resend-verification/
│   │   └── page.tsx                  # Resend verification email
│   ├── account/
│   │   ├── layout.tsx                # Protected layout (calls authorize({ type: 'any' }))
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── change-password/
│   │   │   └── page.tsx
│   │   ├── change-email/
│   │   │   └── page.tsx
│   │   └── delete-profile/
│   │       └── page.tsx
│   ├── [slug]/
│   │   └── page.tsx                  # Dynamic CMS page
│   └── admin/
│       ├── layout.tsx                # Admin layout (sidebar + calls authorize({ type: 'admin' }))
│       ├── login/
│       │   └── page.tsx              # Admin login form
│       ├── dashboard/
│       │   └── page.tsx
│       ├── users/
│       │   ├── page.tsx              # User list with search
│       │   ├── create/
│       │   │   └── page.tsx
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx
│       ├── pages/
│       │   ├── page.tsx              # Page list with search
│       │   ├── create/
│       │   │   └── page.tsx
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx
│       ├── settings/
│       │   └── page.tsx              # Site settings (home page, menus, footer, site name)
│       └── groups/
│           ├── page.tsx              # Group list (Super Admin only)
│           ├── create/
│           │   └── page.tsx
│           └── [id]/
│               └── edit/
│                   └── page.tsx
├── components/
│   ├── frontend/
│   │   ├── header.tsx                # Dynamic header menu from settings
│   │   ├── footer.tsx                # Footer with HTML content from settings
│   │   └── frontend-layout.tsx       # Header + main + footer wrapper
│   ├── admin/
│   │   ├── sidebar.tsx               # Admin sidebar (filters items by permissions)
│   │   ├── admin-layout.tsx          # Sidebar + main content wrapper
│   │   └── permission-guard.tsx      # Conditional render by permission
│   └── shared/
│       ├── pagination.tsx            # Reusable pagination
│       ├── search-input.tsx          # Search form with submit button
│       ├── confirm-dialog.tsx        # Delete confirmation modal
│       ├── alert.tsx                 # Success/error/info notification
│       └── loading-spinner.tsx       # Loading state component
├── lib/
│   ├── prisma.ts                     # Prisma client singleton (with connection error handling)
│   ├── auth/
│   │   ├── session.ts               # getSession, createSession, destroySession, updateSession
│   │   ├── password.ts              # hashPassword, verifyPassword (bcryptjs, cost 12)
│   │   ├── tokens.ts                # Token generation, creation, validation, cleanup
│   │   ├── email.ts                 # sendVerificationEmail, sendPasswordResetEmail (nodemailer)
│   │   ├── authorize.ts             # Unified authorize() function
│   │   ├── rate-limiter.ts          # Rate limiting via Upstash Redis
│   │   └── session-cache.ts         # In-memory tokenVersion cache (60s TTL)
│   ├── actions/
│   │   ├── auth.ts                  # signup, login, logout, verifyEmail, forgotPassword, resetPassword, resendVerification
│   │   ├── user.ts                  # updateProfile, changePassword, changeEmail, deleteAccount
│   │   └── admin/
│   │       ├── users.ts             # createUser, updateUser, deleteUser, getUsers
│   │       ├── pages.ts             # createPage, updatePage, deletePage, getPages
│   │       ├── settings.ts          # updateSettings, getSettings (with caching)
│   │       └── groups.ts            # createGroup, updateGroup, deleteGroup, getGroups
│   ├── validators/
│   │   ├── auth.ts                  # Zod schemas: signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema
│   │   ├── user.ts                  # Zod schemas: updateProfileSchema, changePasswordSchema, changeEmailSchema, deleteAccountSchema
│   │   ├── page.ts                  # Zod schemas: createPageSchema, updatePageSchema
│   │   ├── settings.ts              # Zod schemas: settingsSchema (parses JSON values, validates structure)
│   │   └── group.ts                 # Zod schemas: createGroupSchema, updateGroupSchema
│   ├── settings-cache.ts            # Module-level settings cache with 60s TTL
│   └── utils/
│       ├── slug.ts                   # generateSlug(title): lowercase, hyphens, no special chars. Checks uniqueness, appends -2,-3... max 10 attempts
│       ├── ip.ts                     # getClientIP(): reads x-forwarded-for header with fallback
│       └── format.ts                # formatDate, formatPhone helpers
├── middleware.ts                      # Next.js middleware (route protection + tokenVersion validation)
├── types/
│   └── index.ts                      # Shared TypeScript types: SessionData, AuthCheck, PageData, HeaderMenuItem, SettingsData
├── emails/
│   ├── verification.tsx              # Verification email HTML template
│   └── password-reset.tsx            # Password reset email HTML template
├── scripts/
│   ├── seed.ts                       # Database seed (Super Admin, default settings)
│   └── recover-super-admin.ts        # Recovery script: updates Super Admin credentials from CLI args
└── prisma/
    └── schema.prisma                 # Database schema
```

---

## Database Design

### Prisma Schema

```prisma
// This is the canonical data model for the application.
// Always update this file and generate migrations — never modify the DB directly.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/// Represents a user account. Both frontend users and admin users are stored here.
/// Admin status is determined by the user's group type, not a flag on this model.
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String
  name           String?
  phone          String?
  address        String?
  emailVerified  Boolean   @default(false)
  pendingEmail   String?                    // Set during email change; cleared when new email verified
  groupId        String?
  group          UserGroup?  @relation(fields: [groupId], references: [id])
  tokenVersion   Int       @default(0)      // Incremented on password change, email change, account deletion. Invalidates all existing sessions.
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  verificationTokens EmailVerificationToken[]
  passwordResetTokens PasswordResetToken[]

  @@index([email])
  @@index([groupId])
}

/// Defines a user group with a type (admin/regular) and route-level permissions for admin panels.
/// Only the Super Admin can create, update, or delete groups.
model UserGroup {
  id                String   @id @default(cuid())
  name              String   @unique
  type              String   @default("regular") // "admin" | "regular"
  routePermissions  String[]                      // Route path patterns, e.g. ["/admin/users", "/admin/pages"]. Uses startsWith matching. "*" means all routes.
  permissionVersion Int      @default(0)          // Incremented when permissions change. Invalidates sessions for all users in this group.
  users             User[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

/// Represents a CMS page. Rendered at /[slug] for public pages.
/// The home page slug is stored in the Setting model.
model Page {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String                        // Raw HTML content (admin-authored, trusted)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
}

/// Key-value store for site-wide settings.
/// Values are stored as strings; structured values (menus) are JSON-encoded.
model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value String                           // String value, JSON-encoded for structured data
}

/// One-time use token for email verification.
/// Deleted after successful verification or expiry.
model EmailVerificationToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([expiresAt])
}

/// One-time use token for password reset.
/// Deleted after successful reset or expiry.
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([expiresAt])
}
```

### Settings Key Structure

| Key | Value Format | Example | Validation |
|---|---|---|---|
| `home_page` | Page slug (string) | `"welcome"` | Must match an existing page slug |
| `header_menu_logged_out` | JSON array of `{label, href}` | `[{"label":"Home","href":"/"},{"label":"Login","href":"/login"}]` | Each item must have non-empty `label` and `href` |
| `header_menu_logged_in` | JSON array of `{label, href}` | `[{"label":"Home","href":"/"},{"label":"Dashboard","href":"/account/dashboard"}]` | Same as above |
| `footer_content` | HTML string | `"<p>&copy; 2025 My Site</p>"` | No validation (admin-authored, trusted) |
| `site_name` | Plain text string | `"My Site"` | Max 100 characters |

### Super Admin Seeding

The seed script (`scripts/seed.ts`) reads from `.env`:
```
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=change-me-immediately
```

**Seed script behavior (idempotent):**
1. Check if a UserGroup with name "Super Admins" exists. If not, create it with `type="admin"` and `routePermissions=["*"]`.
2. Check if a User with `SUPER_ADMIN_EMAIL` exists:
   - If yes: update the password hash (allows recovery by re-running seed with new password)
   - If no: create the User with `emailVerified=true`, assigned to "Super Admins" group, `tokenVersion=0`
3. Insert default settings if the Setting table is empty:
   - `home_page`: empty string (no home page selected)
   - `header_menu_logged_out`: `[{"label":"Home","href":"/"}]`
   - `header_menu_logged_in`: `[{"label":"Home","href":"/"},{"label":"Dashboard","href":"/account/dashboard"}]`
   - `footer_content`: `"<p>Powered by Next.js</p>"`
   - `site_name`: `"My Site"`

**Super Admin identification at runtime:**
The Super Admin is identified by comparing `session.email === process.env.SUPER_ADMIN_EMAIL` in the `authorize()` function — not a separate DB flag. This means changing the Super Admin requires updating `.env` AND the User record's email.

### Recovery Script (`scripts/recover-super-admin.ts`)

A standalone Node.js script that resets the Super Admin credentials:
```bash
npx tsx scripts/recover-super-admin.ts --email new-admin@example.com --password new-password
```

This script:
1. Connects to the database via Prisma
2. Finds the user matching `SUPER_ADMIN_EMAIL` from `.env`
3. Updates the email and password hash
4. Increments `tokenVersion` to invalidate any existing sessions
5. Prints confirmation

---

## API Design

### Authentication Endpoints (Server Actions)

```
/**
 * Register a new user account.
 * Rate limited: 3 signups per IP per hour.
 * Authorization: none (public)
 */
signup(formData: { email: string, password: string })
  → { success: true, message: "Check your email to verify your account" } | { error: string }

/**
 * Log in an existing user.
 * Rate limited: 5 attempts per IP per 60 seconds.
 * Authorization: none (public)
 * If isAdmin=true, additionally checks that user's group type is "admin".
 */
login(formData: { email: string, password: string, isAdmin?: boolean })
  → redirect to dashboard | { error: string }

/**
 * Destroy the current session and redirect to home.
 * Authorization: any authenticated user
 */
logout()
  → destroy session cookie, redirect to /

/**
 * Verify an email address using a token from the verification link.
 * Uses an interactive Prisma transaction to prevent double-use race conditions.
 * Authorization: none (public, token-based)
 */
verifyEmail(token: string)
  → redirect with success message | redirect with error message

/**
 * Request a password reset email.
 * Always returns success to prevent email enumeration.
 * Rate limited: 3 requests per IP per hour.
 * Authorization: none (public)
 */
forgotPassword(formData: { email: string })
  → { success: true } (always)

/**
 * Reset password using a token from the reset email.
 * Token expires after 1 hour.
 * Increments tokenVersion to invalidate all existing sessions.
 * Authorization: none (public, token-based)
 */
resetPassword(formData: { token: string, password: string })
  → redirect to login with success message | { error: string }

/**
 * Request a new verification email.
 * Deletes any existing verification token for the user before creating a new one.
 * Rate limited: 3 requests per IP per hour.
 * Authorization: none (public, but requires knowing the email)
 */
resendVerification(formData: { email: string })
  → { success: true } (always, to prevent email enumeration)
```

### Admin CRUD Endpoints (Server Actions)

All admin endpoints call `authorize(session, ...)` as their first line.

```
// Users (admin CRUD)
/**
 * Get paginated user list with optional search.
 * Authorization: admin with route permission for /admin/users
 */
getUsers(query: { search?: string, page?: number, limit?: number })
  → { users: User[], total: number, page: number, totalPages: number }

/**
 * Create a new user. Admin can set group assignment.
 * Authorization: admin with route permission for /admin/users
 */
createUser(formData: { email: string, password: string, name?: string, groupId?: string })
  → { success: true, userId: string } | { error: string }

/**
 * Update an existing user. Cannot change Super Admin's email.
 * Authorization: admin with route permission for /admin/users
 */
updateUser(id: string, formData: { name?: string, email?: string, phone?: string, address?: string, groupId?: string })
  → { success: true } | { error: string }

/**
 * Delete a user. Cannot delete Super Admin.
 * Authorization: admin with route permission for /admin/users
 */
deleteUser(id: string)
  → { success: true } | { error: string }

// Pages (admin CRUD)
/**
 * Get paginated page list with optional search by title.
 * Authorization: admin with route permission for /admin/pages
 */
getPages(query: { search?: string, page?: number, limit?: number })
  → { pages: Page[], total: number, page: number, totalPages: number }

/**
 * Create a new page. Slug is auto-generated from title if not provided.
 * Authorization: admin with route permission for /admin/pages
 */
createPage(formData: { title: string, content?: string, slug?: string })
  → { success: true, pageId: string } | { error: string }

/**
 * Update a page. Slug must remain unique.
 * Authorization: admin with route permission for /admin/pages
 */
updatePage(id: string, formData: { title?: string, content?: string, slug?: string })
  → { success: true } | { error: string }

/**
 * Delete a page. Refuses if page is currently set as home_page.
 * Authorization: admin with route permission for /admin/pages
 */
deletePage(id: string)
  → { success: true } | { error: string }

// Settings
/**
 * Get all settings as a typed object. Uses module-level cache with 60s TTL.
 * Authorization: admin with route permission for /admin/settings
 */
getSettings()
  → { settings: SettingsData }

/**
 * Update settings. Validates each setting value based on its key.
 * Invalidates settings cache after successful update.
 * Authorization: admin with route permission for /admin/settings
 */
updateSettings(formData: Record<string, string>)
  → { success: true } | { error: string }

// Groups (Super Admin only)
/**
 * Get all user groups.
 * Authorization: super_admin
 */
getGroups()
  → { groups: UserGroup[] }

/**
 * Create a new user group.
 * Authorization: super_admin
 */
createGroup(formData: { name: string, type: 'admin' | 'regular', routePermissions?: string[] })
  → { success: true, groupId: string } | { error: string }

/**
 * Update a user group. Increments permissionVersion if permissions change.
 * Cannot change type or permissions of the group the Super Admin belongs to.
 * Authorization: super_admin
 */
updateGroup(id: string, formData: { name?: string, type?: 'admin' | 'regular', routePermissions?: string[] })
  → { success: true } | { error: string }

/**
 * Delete a user group. Refuses if group has users assigned.
 * Cannot delete the Super Admin's own group.
 * Authorization: super_admin
 */
deleteGroup(id: string)
  → { success: true } | { error: string }
```

### Validation Pattern (mandatory for every Server Action)

Every Server Action must follow this exact pattern:

```ts
'use server'

import { z } from 'zod'
import { authorize } from '@/lib/auth/authorize'
import { getSession } from '@/lib/auth/session'
import { rateLimit } from '@/lib/auth/rate-limiter'
import { getClientIP } from '@/lib/utils/ip'
import { revalidatePath } from 'next/cache'

/**
 * Schema for [action name].
 * [Description of each field and any constraints]
 */
const schema = z.object({
  // ... field definitions with .describe() for each field
})

/**
 * [Description of what this action does, who can call it, and what it returns]
 * Authorization: [required auth level]
 * Rate limit: [limit description, if applicable]
 */
export async function myAction(formData: FormData) {
  // 1. Get session
  const session = await getSession()

  // 2. Authorize (always first, before any business logic)
  if (!authorize(session, { type: 'admin' })) {
    return { error: 'Unauthorized' }
  }

  // 3. Rate limit (if applicable)
  const ip = getClientIP()
  const { success: rateLimitOk } = await rateLimit({
    identifier: `${ip}:myAction`,
    limit: 10,
    window: '60s',
  })
  if (!rateLimitOk) {
    return { error: 'Too many requests. Please try again later.' }
  }

  // 4. Validate input
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // 5. Perform operation
  // ...

  // 6. Revalidate paths
  revalidatePath('/admin/whatever')

  // 7. Return result
  return { success: true }
}
```

---

## Authentication & Security

### Session Configuration

```ts
/**
 * Session data sealed into the iron-session cookie.
 * 
 * tokenVersion and permissionVersion are checked against the database
 * (with a short in-memory cache) on each request to provide session
 * invalidation for password changes, permission changes, and account deletion.
 */
export interface SessionData {
  userId: string
  email: string
  groupId: string | null
  groupType: 'admin' | 'regular' | null
  routePermissions: string[]
  isSuperAdmin: boolean
  tokenVersion: number           // From User.tokenVersion
  permissionVersion: number      // From UserGroup.permissionVersion
}

/**
 * iron-session configuration for the App Router.
 * 
 * cookieName: 'app_session'
 * maxAge: 7 days
 * httpOnly: true (not accessible via JavaScript)
 * secure: true in production
 * sameSite: 'lax' (allows links from emails to include the cookie)
 */
const sessionOptions = {
  password: process.env.SESSION_SECRET!,  // Must be at least 32 characters
  cookieName: 'app_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,  // 7 days in seconds
    path: '/',
  },
}
```

### Middleware (route protection + session invalidation)

```ts
/**
 * Next.js middleware for route protection and session validation.
 * 
 * This runs on every matched request. It:
 * 1. Parses the iron-session cookie
 * 2. Validates tokenVersion and permissionVersion against a short-lived cache
 * 3. Enforces auth requirements based on route patterns
 * 
 * Uses the iron-session v8 App Router API: getIronSession(await cookies(), options)
 * 
 * IMPORTANT: This middleware uses the Node.js runtime (not Edge) because
 * iron-session requires the Node.js crypto module. If deployed to Vercel,
 * configure the middleware to use the Node.js runtime.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions } from '@/lib/auth/session'
import { authorize } from '@/lib/auth/authorize'
import { getCachedTokenVersion, getCachedPermissionVersion } from '@/lib/auth/session-cache'

// Routes accessible without auth
const PUBLIC_FRONTEND = [
  '/', '/login', '/signup', '/forgot-password', 
  '/reset-password', '/verify-email', '/resend-verification'
]
const ADMIN_PUBLIC = ['/admin/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Parse session using iron-session v8 App Router API
  // NOTE: cookies() must be awaited in Next.js 16
  const session = await getIronSession(await cookies(), sessionOptions)

  // ---- Session Invalidation Check ----
  // If user has a session, validate tokenVersion and permissionVersion
  if (session.userId) {
    const currentTokenVersion = getCachedTokenVersion(session.userId)
    const currentPermissionVersion = session.groupId
      ? getCachedPermissionVersion(session.groupId)
      : null

    // If tokenVersion doesn't match, session was invalidated (password change, account deletion)
    if (currentTokenVersion !== session.tokenVersion) {
      session.destroy()
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('app_session')
      return response
    }

    // If permissionVersion doesn't match, permissions changed — update session
    if (currentPermissionVersion !== null && currentPermissionVersion !== session.permissionVersion) {
      // Rebuild session with updated permissions
      session.permissionVersion = currentPermissionVersion
      await session.save()
    }
  }

  // ---- Frontend Account Routes ----
  if (pathname.startsWith('/account/')) {
    if (!authorize(session, { type: 'any' })) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // ---- Admin Routes (except login) ----
  if (pathname.startsWith('/admin/') && !ADMIN_PUBLIC.includes(pathname)) {
    if (!authorize(session, { type: 'admin' })) {
      // If frontend user, redirect to frontend dashboard
      if (session.userId) {
        return NextResponse.redirect(new URL('/account/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Route-specific permission check (Super Admin bypasses)
    if (!authorize(session, { type: 'route', path: pathname })) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return NextResponse.next()
  }

  // ---- Public routes: no action needed ----
  return NextResponse.next()
}

/**
 * Middleware matcher: only run on protected route prefixes.
 * Excludes static assets, images, and Next.js internal routes.
 */
export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}
```

**Critical implementation note:** The above middleware code uses `await cookies()` which is the Next.js 16 async cookies API. This must be validated with a spike before building Phase 1. If `getIronSession(await cookies(), options)` fails, try `getIronSession(cookies(), options)` (without await, which was the Next.js 15 API). Consult `node_modules/next/dist/docs/` if available for the exact API surface.

### Session Invalidation Rules

| Event | Action |
|---|---|
| User changes password | Increment `User.tokenVersion` → all existing sessions invalidated on next middleware check |
| User deletes account | Increment `User.tokenVersion` before deletion → session invalidated immediately |
| User changes email (after verification) | Increment `User.tokenVersion` → all existing sessions invalidated |
| Admin's group permissions change | Increment `UserGroup.permissionVersion` → all sessions for users in that group get updated permissions on next check |
| Admin's group type changes (admin→regular) | Increment `UserGroup.permissionVersion` → sessions updated; middleware will now reject admin access |

### Rate Limiting Configuration

Using `@upstash/ratelimit` with `@upstash/redis`:

```
Endpoint                  Limit
─────────────────────────────────────────────
login                     5 attempts per IP per 60s
signup                    3 attempts per IP per 1h
forgot-password           3 attempts per IP per 1h
resend-verification       3 attempts per IP per 1h
verify-email              10 attempts per IP per 60s
```

The `rateLimit()` function in `lib/auth/rate-limiter.ts` wraps these as reusable presets:

```ts
/**
 * Pre-configured rate limiters for different endpoints.
 * Uses Upstash Redis for cross-instance state sharing.
 * 
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
 */
export const rateLimiters = {
  login: createRateLimiter({ limit: 5, window: '60s' }),
  signup: createRateLimiter({ limit: 3, window: '1h' }),
  forgotPassword: createRateLimiter({ limit: 3, window: '1h' }),
  resendVerification: createRateLimiter({ limit: 3, window: '1h' }),
  verifyEmail: createRateLimiter({ limit: 10, window: '60s' }),
}
```

### Security Checklist

| Measure | Implementation |
|---|---|
| Password hashing | bcryptjs, cost factor 12 |
| Session security | httpOnly, secure (production), sameSite=lax cookies; sealed with 32+ char secret |
| Session invalidation | tokenVersion on User, permissionVersion on UserGroup, checked in middleware with 60s cache |
| CSRF | Built into Next.js Server Actions (automatic token validation) |
| Rate limiting | Upstash Redis via @upstash/ratelimit; applied inside Server Actions |
| Email enumeration prevention | Forgot password and resend verification always return success; login error is generic ("Invalid email or password") |
| SQL injection | Prisma parameterized queries |
| XSS | React's default escaping; `dangerouslySetInnerHTML` only for admin-authored page content and footer (trusted source) |
| Input validation | Zod schema on every Server Action boundary; all fields use `.describe()` |
| Email verification tokens | `crypto.randomUUID()`, single-use, 24h expiry, deleted via interactive Prisma transaction |
| Password reset tokens | `crypto.randomUUID()`, single-use, 1h expiry, deleted via interactive Prisma transaction |
| Token cleanup | `cleanupExpiredTokens()` called on server startup and periodically |
| Super Admin identification | Email match against `SUPER_ADMIN_EMAIL` env var; no DB flag |

---

## Failure Analysis & Mitigations

| Failure | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Email delivery failure** | Medium | User cannot verify email or reset password | Show clear UI message ("Didn't receive the email? Check spam or resend"); provide resend option; log failures server-side |
| **iron-session + Next.js 16 incompatibility** | Medium | Auth system non-functional | Spike before building; fallback to `@oslojs/jose` for manual JWT-based httpOnly cookies if needed |
| **Verification token double-use race** | Medium | User sees error on second click | Use interactive Prisma transaction: delete token + update user atomically; catch and show friendly message |
| **Session cookie corruption** | Low | User locked out | iron-session throws on tampered cookie; catch and redirect to login with clear session |
| **Password reset token reuse** | Low | Token used twice | Same interactive transaction pattern as verification; delete token before updating password |
| **Home page deleted by admin** | Medium | Site homepage broken for all visitors | Prevent deletion in `deletePage()` if page slug matches `home_page` setting; return specific error |
| **Admin deletes their own group** | Low | Admin locked out of admin panel | Prevent deletion of group that contains the current user; prevent changing own group type to "regular" |
| **Super Admin lockout** | Low-Medium | Cannot manage groups/permissions | `recover-super-admin.ts` script; seed script is idempotent and updates password on re-run |
| **Settings JSON parse failure** | Low | Header/footer breaks | Parse with try-catch in `getSettings()`; fall back to defaults; validate JSON structure on save in `updateSettings()` |
| **Slug collision on create** | Medium | Page creation fails | Auto-append `-2`, `-3`... (max 10 attempts); show generated slug to admin before save; catch Prisma unique constraint error and suggest alternative |
| **Concurrent email change** | Low | Stale pendingEmail | Check `pendingEmail !== newEmail` before setting; old email stays active until new one verified |
| **N+1 queries on user list** | Medium | Slow page load | Always `include: { group: true }` in user queries |
| **Delete user with active session** | Low | Session valid until next middleware check (max 60s) | tokenVersion check in middleware invalidates within 60s (cache TTL); acceptable window |
| **Expired tokens accumulating** | Low | Table bloat over time | `cleanupExpiredTokens()` runs on server startup; for long-running servers, call via `setInterval` every hour |
| **Upstash Redis unavailable** | Low | Rate limiting fails open or closed | Design choice: fail closed (return error). Document that if Upstash is down, rate-limited actions will fail. Consider a circuit breaker for future. |

---

## Development Phases

Execute phases sequentially. Each phase must be complete before starting the next.

### Phase 1: Foundation

**Objective:** Project setup, database, auth system, basic layouts, session invalidation.

**Pre-flight checklist:**
- [ ] **SPIKE:** Test iron-session v8 with Next.js 16.2.9 in middleware, Server Component, and Server Action. Verify `await cookies()` API works with `getIronSession()`. If broken, evaluate `@oslojs/jose` as fallback.
- [ ] Install all npm dependencies
- [ ] Set up Docker Compose with PostgreSQL for local development

**Deliverables:**
- [ ] Prisma schema created, initial migration run, Prisma client singleton (`lib/prisma.ts`)
- [ ] Database seed script (`scripts/seed.ts`) — idempotent, creates Super Admin and default settings
- [ ] Recovery script (`scripts/recover-super-admin.ts`)
- [ ] iron-session configured and verified working (`lib/auth/session.ts`)
- [ ] Session cache with 60s TTL (`lib/auth/session-cache.ts`)
- [ ] `authorize()` function with all four check types (`lib/auth/authorize.ts`)
- [ ] Password hashing utilities (`lib/auth/password.ts`)
- [ ] Token generation + validation + cleanup (`lib/auth/tokens.ts`)
- [ ] Email sending via nodemailer (`lib/auth/email.ts`)
- [ ] Rate limiter setup with Upstash Redis (`lib/auth/rate-limiter.ts`)
- [ ] IP extraction utility (`lib/utils/ip.ts`)
- [ ] Auth Server Actions: signup, login, logout, verifyEmail, forgotPassword, resetPassword, resendVerification (`lib/actions/auth.ts`)
- [ ] Zod schemas for all auth forms (`lib/validators/auth.ts`)
- [ ] Middleware with route protection + tokenVersion validation (`middleware.ts`, `lib/auth/middleware.ts`)
- [ ] FrontendLayout with header and footer (static placeholders initially) (`components/frontend/`)
- [ ] AdminLayout with sidebar (static initially) (`components/admin/`)
- [ ] Login page for frontend (`app/login/page.tsx`)
- [ ] Login page for admin (`app/admin/login/page.tsx`)
- [ ] Signup page (`app/signup/page.tsx`)
- [ ] Forgot password page (`app/forgot-password/page.tsx`)
- [ ] Reset password page (`app/reset-password/page.tsx`)
- [ ] Verify email page (`app/verify-email/page.tsx`)
- [ ] Resend verification page (`app/resend-verification/page.tsx`)
- [ ] Basic shared components: Alert, LoadingSpinner, Button, Input
- [ ] Account layout with auth guard (`app/account/layout.tsx`)
- [ ] Empty account dashboard (`app/account/dashboard/page.tsx`)
- [ ] Every file has JSDoc/file-level comments

### Phase 2: User Features + Admin CRUD

**Objective:** User-facing account management and admin CRUD operations.

**Deliverables:**
- [ ] Profile page: view and edit form (`app/account/profile/page.tsx`)
- [ ] Change password page with tokenVersion increment (`app/account/change-password/page.tsx`)
- [ ] Change email page with re-verification flow (`app/account/change-email/page.tsx`)
- [ ] Delete profile page with password confirmation + tokenVersion increment (`app/account/delete-profile/page.tsx`)
- [ ] User Server Actions: updateProfile, changePassword, changeEmail, deleteAccount (`lib/actions/user.ts`)
- [ ] Zod schemas for user actions (`lib/validators/user.ts`)
- [ ] Admin dashboard (empty) (`app/admin/dashboard/page.tsx`)
- [ ] Admin user list: table with search by name/email/phone, pagination (`app/admin/users/page.tsx`)
- [ ] Admin user create form: email, password, name, group assignment (`app/admin/users/create/page.tsx`)
- [ ] Admin user edit form: name, email, phone, address, group assignment (`app/admin/users/[id]/edit/page.tsx`)
- [ ] Admin user CRUD Server Actions: getUsers, createUser, updateUser, deleteUser (`lib/actions/admin/users.ts`)
- [ ] Admin pages list: table with search by title, pagination (`app/admin/pages/page.tsx`)
- [ ] Admin page create form: title + content textarea, slug auto-generation displayed below title (`app/admin/pages/create/page.tsx`)
- [ ] Admin page edit form: title, slug override, content (`app/admin/pages/[id]/edit/page.tsx`)
- [ ] Admin pages CRUD Server Actions: getPages, createPage, updatePage, deletePage (`lib/actions/admin/pages.ts`)
  - `deletePage()` checks if page is `home_page` and prevents deletion if so
  - `createPage()` auto-generates slug with collision handling
- [ ] Slug generation utility with collision handling (`lib/utils/slug.ts`)
- [ ] Settings page: home page dropdown, header menu JSON textareas (logged-out + logged-in), footer HTML textarea, site name (`app/admin/settings/page.tsx`)
- [ ] Settings Server Actions: getSettings (with caching), updateSettings (`lib/actions/admin/settings.ts`)
- [ ] Settings cache (`lib/settings-cache.ts`)
- [ ] Settings Zod schemas with JSON structure validation (`lib/validators/settings.ts`)
- [ ] Dynamic home page rendering: reads `home_page` from settings, fetches page, renders content (`app/page.tsx`)
- [ ] Dynamic header menu: checks session, shows logged-in or logged-out menu from settings (`components/frontend/header.tsx`)
- [ ] Dynamic footer from settings (`components/frontend/footer.tsx`)
- [ ] Frontend `/[slug]` dynamic page route with 404 handling (`app/[slug]/page.tsx`)
- [ ] Shared components: Pagination, SearchInput, ConfirmDialog
- [ ] Zod schemas for page actions (`lib/validators/page.ts`)
- [ ] Every file has JSDoc/file-level comments

### Phase 3: User Groups & RBAC

**Objective:** Fine-grained admin permissions via user groups.

**Deliverables:**
- [ ] User groups list page, Super Admin only (`app/admin/groups/page.tsx`)
- [ ] Create group form: name, type dropdown, route permissions checkbox list (`app/admin/groups/create/page.tsx`)
- [ ] Edit group form: same fields; prevents changing own group type/permissions (`app/admin/groups/[id]/edit/page.tsx`)
- [ ] Delete group with guard: prevents deleting group that has users or is Super Admin's group (`lib/actions/admin/groups.ts`)
- [ ] Group Zod schemas (`lib/validators/group.ts`)
- [ ] `permissionVersion` increment on permission changes in updateGroup
- [ ] Middleware extended to enforce route-level permissions (already scaffolded in Phase 1)
- [ ] Admin sidebar filters menu items based on `routePermissions` from session
- [ ] `PermissionGuard` component for conditional rendering in admin
- [ ] Assign user to group dropdown in admin user edit form
- [ ] Every file has JSDoc/file-level comments

### Phase 4: Polish & Harden

**Objective:** SEO, security hardening, error handling, responsive design.

**Deliverables:**
- [ ] SEO: `generateMetadata()` for all public pages (dynamic titles from page data, descriptions from content)
- [ ] SEO: `sitemap.xml` generation (lists all published pages and static routes)
- [ ] SEO: `robots.txt`
- [ ] Proper error boundaries (`error.tsx`) for each route group (frontend, account, admin)
- [ ] Loading states (`loading.tsx`) with skeleton UI for each route group
- [ ] Custom 404 page (`not-found.tsx`) if not already done
- [ ] Form validation: inline error messages next to each field
- [ ] Toast/notification system: success/error messages appear at top-right, auto-dismiss after 5s
- [ ] Responsive design audit:
  - Admin sidebar collapses to hamburger on mobile
  - Tables scroll horizontally on small screens
  - Forms are full-width on mobile
- [ ] Security headers in `next.config.ts`: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options
- [ ] Session maxAge enforcement (already configured; verify)
- [ ] Prisma connection error handling in the singleton (`lib/prisma.ts`): retry logic, clear error messages
- [ ] Email sending error handling: try-catch with logging, return user-friendly error
- [ ] Token cleanup: ensure `cleanupExpiredTokens()` is called on startup and via interval
- [ ] HTML content sanitization consideration: document that admin-authored HTML is trusted; add comment in code noting this is a known trust boundary
- [ ] Every file has JSDoc/file-level comments

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Session (generate with: openssl rand -base64 32)
SESSION_SECRET=at-least-32-character-random-string-here

# Super Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=change-me-immediately

# Email (Resend SMTP recommended for deliverability)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxx
SMTP_FROM=noreply@yourdomain.com

# Upstash Redis (for rate limiting; free tier sufficient)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxx

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Operational Concerns

### Database Migrations

- **Development:** `npx prisma migrate dev` (creates migration files, applies to dev DB)
- **Production:** `npx prisma migrate deploy` (applies pending migrations, no data loss)
- All migration files committed to the repository
- Seed script runs via `npx prisma db seed` (configure `prisma.seed` in package.json)

### Backups

- PostgreSQL native `pg_dump` scheduled daily
- Prisma schema is the source of truth for table structure; committed to repo

### Logging

- Server-side: use `console.error` for auth failures, email errors, Prisma errors
- Use structured log format: `[module] message { key: value }`
- Example: `[auth] Login failed { email: "user@example.com", reason: "invalid_password" }`
- Client-side: no logging beyond form validation feedback

### Deployment

1. **Vercel (recommended):**
   - Connect GitHub repository
   - Set all environment variables in Vercel dashboard
   - Add `prisma migrate deploy` to build step or `postinstall` script
   - Deploy on push to `main`

2. **Docker on VPS (alternative):**
   - Use `node:22-alpine` base image
   - `docker-compose.yml` with PostgreSQL service for staging
   - Run `prisma migrate deploy` before starting the app

---

## Scaling Strategy

Not needed for MVP scale. Documented for future reference:

1. **Connection pooling:** Add PgBouncer or use Prisma Data Proxy / Accelerate
2. **Caching:** Redis for session cache (replace in-memory Map) and settings cache
3. **Email queue:** BullMQ + Redis for async email sending under load
4. **Static generation:** Pre-render public CMS pages with ISR (`revalidate`) instead of SSR
5. **Database indexing:** Review slow queries; add composite indexes as needed

---

## Testing Strategy

| Layer | Tool | Scope |
|---|---|---|
| **Unit** | Vitest | Password hashing, token generation, slug generation, Zod schemas, `authorize()` logic |
| **Integration** | Vitest + Prisma test DB | Server Actions with real DB: signup→verify→login flow, CRUD operations, permissions |
| **E2E** | Playwright | Critical flows: signup, login, admin CRUD, email verification |
| **Security** | Manual review | Password reset flow, rate limiting, session handling, CSRF, session invalidation |

**Testing priorities (what to test first):**
1. `authorize()` unit tests — all four check types, edge cases (null session, missing fields)
2. Auth flow integration tests — signup, verify email, login, logout, reset password
3. Session invalidation integration tests — password change invalidates session, permission change triggers version check
4. Admin CRUD integration tests — create/read/update/delete for users and pages, page deletion guard

---

## MVP Scope

What ships as MVP (Phase 1 + Phase 2 + Phase 3):

- ✅ User signup, login, logout
- ✅ Email verification with resend option
- ✅ Forgot/reset password
- ✅ User profile management (edit, change password, change email, delete)
- ✅ Session invalidation on password change, email change, account deletion
- ✅ Frontend dashboard (empty)
- ✅ Admin login (any admin group user)
- ✅ Admin CRUD: users, pages
- ✅ Settings: home page, header menus (JSON textarea), footer HTML, site name
- ✅ Dynamic home page and `/[slug]` pages with header/footer
- ✅ Route protection for `/account/*` and `/admin/*`
- ✅ User groups with granular route permissions (Super Admin management)
- ✅ Permission-based admin sidebar filtering
- ✅ SEO metadata for public pages

**Deferred to Phase 4:**
- Rate limiting (the infrastructure is set up in Phase 1, but enforcement is hardened in Phase 4)
- Security headers (CSP, HSTS)
- Sitemap and robots.txt
- Advanced error boundaries and loading states
- Responsive design polish
- Toast notification system

---

## Future Enhancements

- Visual header menu editor (drag-and-drop add/remove/reorder) — replacing JSON textarea
- Image/file uploads for pages
- WYSIWYG editor for page content (TipTap, Lexical)
- User avatar/profile image
- Activity/audit log
- Email templates with React Email
- Dark mode
- i18n / localization
- API keys for headless CMS consumption
- Webhooks on user events
- OAuth social login
- Two-factor authentication (2FA)
