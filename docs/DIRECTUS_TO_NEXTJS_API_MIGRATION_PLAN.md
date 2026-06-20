# Migration Plan: Directus → Next.js Native API Backend

**Project:** Tume ya Utumishi Serikalini (Zanzibar Civil Service Commission) portal
**Scope:** Replace the standalone Directus CMS backend (`/cms`) with native Next.js API routes living inside the existing frontend app (`/frontend`), including a built-in admin login and content management UI for posting **News**, **Vacancies**, and **Interviews**.
**Date:** 2026-06-19
**Author:** Engineering

---

## 1. Goals & Non-Goals

### 1.1 Goals
1. Eliminate the dependency on Directus (`/cms`, port 8055) — one less service to run, secure, back up, and proxy through nginx.
2. Provide a **first-party admin experience**: admin login UI hosted inside the Next.js app at `/admin`, with authenticated forms to create / edit / delete **news**, **vacancies**, and **interviews** (including PDF + image uploads).
3. Keep the public-facing site (homepage, news list/detail, vacancies list/detail, interviews list/detail, search, contact form) fully functional and visually unchanged.
4. Preserve the existing PostgreSQL database and all existing content (one-time data migration from Directus-managed tables to a Prisma-managed schema).
5. Preserve the bilingual (`sw` / `en`) content model and `next-intl` routing.
6. Preserve the existing `legacy_urls` WordPress-redirect endpoint and the contact-submission + reply flow.

### 1.2 Non-Goals (out of scope for this plan)
- Re-implementing Directus's role-based access control (RBAC) with multiple roles. We need a **single admin role** for now. Additional roles can be layered later.
- Migrating the secondary collections that are **not** in the admin's day-to-day posting workflow: `board_members`, `departments`, `units`, `pages`, `hero_slides`, `services`, `institutions`, `interview_types`, `site_settings`. These will be migrated to the new schema and **read-only** through the existing public pages, but no admin UI is required for them in phase 1. (A follow-up phase can add admin screens.)
- Replacing MinIO with another object store. We will keep MinIO (or local-disk storage) and just change how the app talks to it.

---

## 2. Current Architecture Summary

(See `APP_DOCUMENTATION.md` and the exploration report for full detail.)

- **Frontend:** Next.js 16.2.5 (App Router), React 19, `next-intl` for `sw`/`en` locales, Tailwind 4, TypeScript 5. Source in `frontend/src/`.
- **Backend today:** Directus 11.17.4 running on port 8055, PostgreSQL `tume_cms` DB, MinIO or local `cms/uploads/` for files. Schema defined in `cms/migrations/001_initial_schema.js` + `002_contact_replies.js`.
- **Reads:** Public pages call Directus REST via `@directus/sdk` (`frontend/src/lib/directus.ts`) using a static API token (`DIRECTUS_API_TOKEN`).
- **Writes:** `frontend/src/app/api/contact/route.ts` and `contact/reply/route.ts` log in to Directus as the admin user (email/password) to POST/PATCH `contact_submissions`. `api/download/[id]` does read-only `legacy_urls` lookups via the static token.
- **Auth today:** No frontend-side admin auth. The admin works entirely in the Directus admin UI at `/admin` (proxied via nginx). Frontend API routes that need write access re-authenticate with `DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` on every request.
- **Content model:** Bilingual fields suffixed `_sw` / `_en`; rich-text bodies stored as HTML strings; file fields store Directus asset UUIDs; asset URLs built as `${PUBLIC_DIRECTUS_URL}/assets/${uuid}`.
- **Data access patterns to migrate** (the consumers we must update):
  - `frontend/src/app/[locale]/page.tsx` (homepage)
  - `frontend/src/app/[locale]/news/page.tsx` + `news/[slug]/page.tsx`
  - `frontend/src/app/[locale]/vacancies/page.tsx` + `vacancies/[slug]/page.tsx`
  - `frontend/src/app/[locale]/interviews/page.tsx` + `interviews/[slug]/page.tsx`
  - `frontend/src/app/[locale]/search/page.tsx`
  - `frontend/src/app/[locale]/about-us/**` and `organization-structure/board/page.tsx` (read board_members, departments, units, pages, services)
  - `frontend/src/components/sections/{NewsSummary,VacancySummary,InterviewSummary,HeroSlideshow,WelcomeSection}.tsx`
  - `frontend/src/app/api/contact/{route.ts,reply/route.ts}`
  - `frontend/src/app/api/download/[id]/route.ts`

---

## 3. Target Architecture

### 3.1 Single Next.js service
Everything runs inside `frontend/`:

```
frontend/
├── prisma/
│   ├── schema.prisma            # Prisma schema (mirrors existing data model)
│   └── migrations/              # Prisma migration history
├── src/
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── auth.ts              # Credentials provider, password hashing, session/JWT helpers
│   │   ├── storage.ts           # File upload abstraction (local-disk or MinIO/S3)
│   │   ├── directus.ts          # REMOVED
│   │   ├── content.ts           # NEW: server-side data accessors (getNewsList, getNewsBySlug, …)
│   │   ├── i18n.ts / routing.ts / navigation.ts / utils.ts   # unchanged
│   ├── types/index.ts           # Updated: keep public interfaces, drop Directus-isms
│   ├── app/
│   │   ├── [locale]/…           # Public pages (rewritten to use src/lib/content.ts)
│   │   ├── api/
│   │   │   ├── contact/route.ts          # rewritten: writes to Prisma
│   │   │   ├── contact/reply/route.ts    # rewritten: reads/writes Prisma + nodemailer
│   │   │   ├── download/[id]/route.ts    # rewritten: reads Prisma.legacy_urls
│   │   │   ├── auth/                     # NEW
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── me/route.ts
│   │   │   ├── upload/route.ts           # NEW: multipart file upload (PDF/image) → storage
│   │   │   └── admin/                    # NEW: CRUD endpoints for admin UI
│   │   │       ├── news/route.ts
│   │   │       ├── news/[id]/route.ts
│   │   │       ├── vacancies/route.ts
│   │   │       ├── vacancies/[id]/route.ts
│   │   │       ├── interviews/route.ts
│   │   │       └── interviews/[id]/route.ts
│   │   └── admin/                        # NEW: admin UI (App Router, locale-aware optional)
│   │       ├── layout.tsx               # Auth gate (server component, redirects to /admin/login if no session)
│   │       ├── login/page.tsx
│   │       ├── page.tsx                 # Dashboard (counts + recent items)
│   │       ├── news/
│   │       │   ├── page.tsx             # List + "New" button
│   │       │   ├── new/page.tsx         # Create form
│   │       │   └── [id]/edit/page.tsx   # Edit form
│   │       ├── vacancies/{page,new,[id]/edit}/
│   │       └── interviews/{page,new,[id]/edit}/
├── public/uploads/                       # Default local storage root (or use MinIO)
├── .env, .env.example                    # Updated (see §6)
```

### 3.2 Stack decisions
| Concern | Choice | Rationale |
|---|---|---|
| ORM / DB access | **Prisma** over the existing PostgreSQL | Type-safe, migration-friendly, fits Next.js App Router server components; reuses the existing `tume_cms` Postgres instance. |
| Admin auth | **NextAuth (Auth.js) v5** Credentials provider, JWT session strategy, http-only cookies | Avoids re-implementing password hashing + session management; works in App Router; supports server-side `auth()` helper. |
| Password storage | `argon2` (or `bcrypt`) hash for the single admin user | Standard, slow-hash KDF. |
| File uploads | `multipart/form-data` parsed in route handlers; stored via a `storage.ts` abstraction that supports **local disk** (`public/uploads/`) and **MinIO/S3** (preserving the existing MinIO config) | Keeps current storage backend; lets us migrate to S3 later without touching handlers. |
| Rich-text editing | **TipTap** (or `@milkdown/kit`) in the admin forms, output stored as HTML to match existing `body_sw`/`description_sw` rendering (`dangerouslySetInnerHTML`) | Keeps public rendering code untouched. |
| Form validation | `react-hook-form` + `zod` (already dependencies) | Consistency with existing `ContactForm`. |
| CSRF / rate limiting | Reuse the same patterns already in `api/contact/route.ts` (honeypot, rate limit) for public routes; admin routes protected by auth + same-origin. | No new dependencies. |

### 3.3 Public read path
Public pages stop calling Directus. Instead, each page imports typed helpers from `src/lib/content.ts` (e.g. `getNewsBySlug(slug, locale)`, `listRecentVacancies(limit)`), which call Prisma directly in the server component. Asset URLs become a new helper `assetUrl(file)` returning either `/uploads/<filename>` (local) or the MinIO public URL — **no more `/assets/<uuid>`**.

### 3.4 Admin write path
Admin UI pages under `/admin/*` are server components that check the NextAuth session; mutation forms POST to `/api/admin/*` route handlers, which also enforce the session. Each route validates input with a zod schema and writes via Prisma.

---

## 4. Database / Data Migration

### 4.1 Schema migration approach
Two options, ordered by recommendation:

**Option A (recommended) — Adopt the existing Directus tables, manage them with Prisma.**
Directus stores its data in ordinary PostgreSQL tables named after the collections (`news`, `vacancies`, `interviews`, `news_categories`, `institutions`, `contact_submissions`, `legacy_urls`, `site_settings`, etc.) plus its own internal tables (`directus_*`). We:
1. Stop the Directus service.
2. `prisma db pull` to introspect the existing tables (excluding `directus_*` system tables) and generate an initial `schema.prisma`. Prisma will not take ownership of `directus_*` tables — they remain untouched and can be dropped later.
3. Hand-clean the generated `schema.prisma`: rename fields to be Prisma-idiomatic, add enums for `status` and `interview_type`, fix relations (`news.category` → `news_categories`, `interviews.institution` → `institutions`, `units.department` → `departments`). Keep the existing `*_sw`/`*_en` columns as-is (Prisma handles them fine).
4. `prisma migrate diff --from-empty --to-schema-datamodel …` → produce a baseline migration that we mark as applied with `prisma migrate resolve --applied`. This avoids rebuilding tables from scratch.
5. Add a new `admin_users` table (not present in Directus) for the credentials login.

**Option B (fallback) — Fresh schema, scripted data copy.**
Write a one-off Node script that connects to Postgres, reads each Directus table, and inserts into a freshly-migrated Prisma schema. Use this only if Option A's introspection produces unfixable drift.

### 4.2 File-asset migration
Directus assets are currently referenced by UUID and stored either on local disk (`cms/uploads/<uuid>`) or in MinIO. The frontend renders them as `${PUBLIC_DIRECTUS_URL}/assets/<uuid>`.

Migration:
1. Export all assets from `cms/uploads/` (or MinIO bucket `tume-web-assets`) into a new location `frontend/public/uploads/` (or a dedicated MinIO bucket). Use the **UUID as the filename** initially to avoid rewriting every row, then optionally rename to slugged human filenames in a later cleanup.
2. Add a Prisma `assets` table (`id`, `uuid`, `filename`, `mime_type`, `size`, `storage_key`, `created_at`) — populated during migration — so future uploads are tracked. Existing `featured_image`/`pdf_document`/`photo`/`image`/`document` columns keep storing the asset identifier; the `assetUrl()` helper resolves it.
3. For local-disk mode, `assetUrl()` returns `/uploads/<uuid>` and a new `GET /uploads/...` is unnecessary (Next.js serves `/public` automatically). For MinIO mode, `assetUrl()` returns the configured public URL.

### 4.3 Admin user bootstrap
- Add `admin_users(id, email UNIQUE, password_hash, name, created_at, updated_at)`.
- Provide a CLI script `scripts/seed-admin.ts` (run via `node --experimental-strip-types` or `tsx`) that prompts for email + password, hashes with argon2, and inserts. Document it in the new `.env.example.
- Default dev credentials seeded for local use only (e.g. `admin@tume.go.tz` / a strong placeholder), clearly flagged as must-change.

### 4.4 Decommission Directus
After the cutover:
- Stop the PM2 process for the `cms` app (`ecosystem.config.js` update required).
- Keep the Postgres database running; do **not** drop `directus_*` tables for one release cycle (rollback safety). Schedule their removal for a follow-up.
- Remove `cms/` from the deployment but keep it in git history.

---

## 5. Migration Phases

### Phase 0 — Preparation (no user-visible changes)
1. Add Prisma + `@prisma/client`, `argon2`, `next-auth@beta` (Auth.js v5), `@tiptap/*` (or chosen rich-text editor) to `frontend/package.json`.
2. Create `frontend/prisma/schema.prisma` from introspection (Option A). Add the `admin_users` model and `assets` model.
3. Generate the Prisma client; add `frontend/src/lib/db.ts` singleton.
4. Create `frontend/src/lib/auth.ts` configuring the NextAuth Credentials provider against `admin_users`, JWT strategy, cookie settings.
5. Write the `seed-admin` script and create the first admin locally.
6. Write `frontend/src/lib/storage.ts` with two implementations (`local`, `s3`) selected by env.
7. Copy assets from `cms/uploads/` into `frontend/public/uploads/` (or verify MinIO access). Populate `assets` table from existing UUIDs.

**Exit criteria:** Prisma can read all existing news/vacancies/interviews rows locally; an admin can sign in via a throwaway `/admin/login` page; assets are reachable at `/uploads/<uuid>`.

### Phase 1 — Public read path (switch reads from Directus to Prisma)
8. Create `frontend/src/lib/content.ts` with typed accessors mirroring the current fetch shapes:
   - `listNews({ limit, categorySlug?, q?, page? })`, `getNewsBySlug(slug)`
   - `listVacancies({ limit, q?, status?, page? })`, `getVacancyBySlug(slug)`
   - `listInterviews({ limit, q?, type?, page? })`, `getInterviewBySlug(slug)`
   - `listNewsCategories()`, `listBoardMembers()`, `listDepartments()`, `listUnits()`, `listServices()`, `listHeroSlides()`, `getSiteSettings()`, `getLegacyUrl(id)`
9. Rewrite each consumer (homepage, list/detail pages, section components, search, about-us pages, organization-structure/board) to call these accessors instead of `fetchItems`/`fetchItem`. Replace `PUBLIC_DIRECTUS_URL`/`assets/<uuid>` usage with `assetUrl()`.
10. Delete `frontend/src/lib/directus.ts`; remove `@directus/sdk` from deps.
11. Keep the public site running against the **same** Postgres DB (Directus tables are still readable).

**Exit criteria:** All public pages render correctly with Prisma reads; Directus SDK is gone from the read path.

### Phase 2 — Migrate the write API routes
12. Rewrite `frontend/src/app/api/contact/route.ts` to insert into Prisma `contact_submissions` (drop the `/auth/login` dance; the route is public).
13. Rewrite `frontend/src/app/api/contact/reply/route.ts` to: require an admin session (NextAuth `auth()`), update the Prisma row, send email via nodemailer (config unchanged), set `status`/`reply_message`/`reply_sent_at`.
14. Rewrite `frontend/src/app/api/download/[id]/route.ts` to query Prisma `legacy_urls`.

**Exit criteria:** Contact form, reply email, and WordPress redirects all work without Directus.

### Phase 3 — Admin API + UI
15. Build auth endpoints: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` (these may be provided by Auth.js directly; only add custom wrappers if needed).
16. Build admin CRUD route handlers (all session-protected, zod-validated):
    - `POST/PATCH/DELETE /api/admin/news/[id]`, `POST /api/admin/news`
    - same for `vacancies`, `interviews`
    - `POST /api/admin/upload` (multipart → `storage.save()` → returns the asset identifier; used by the rich-text editor for inline images and by the PDF/featured-image fields)
17. Build admin UI under `frontend/src/app/admin/`:
    - `login/page.tsx` — email/password form (react-hook-form + zod), posts to `/api/auth/login`, redirects to `/admin`.
    - `layout.tsx` — server component; `await auth()`; if no session, `redirect("/admin/login")`. Renders a sidebar with News / Vacancies / Interviews sections and a "Sign out" button.
    - `page.tsx` — dashboard: counts of published/draft items per collection + 5 most recent of each.
    - `news/page.tsx` — table of all news (status filter, search, pagination). "New news" button.
    - `news/new/page.tsx` and `news/[id]/edit/page.tsx` — the form:
      - Status select (draft / published / archived)
      - Title (sw + en), Excerpt (sw + en)
      - Slug (auto-suggested from title, editable; uniqueness check)
      - Category dropdown (from `news_categories`)
      - Body (sw + en) using the TipTap rich-text editor
      - Featured image upload (drag-drop → `/api/admin/upload`)
      - PDF upload
      - Date published picker
      - Save / Publish / Delete actions
    - Equivalent forms for **vacancies** (status draft/published/closed; institution text fields; deadline date; PDF; description rich-text) and **interviews** (status draft/published; institution m2o dropdown; `interview_type` select; description rich-text; PDF).
18. Add a thin middleware change: keep `/admin/*` and `/api/admin/*` OUT of the `next-intl` matcher (the existing matcher already excludes `/api`; ensure `/admin` is excluded too so it isn't locale-prefixed). Add an explicit matcher so `/admin` and `/api/admin` bypass i18n.
19. Update `frontend/next.config.ts` `images.remotePatterns` if we change asset hostnames (remove the `localhost:8055`/Directus entry once assets are served from the app itself).

**Exit criteria:** An admin can log in, create a news item with a PDF + image, publish it, and see it on the public news list immediately. Same for vacancies and interviews. Draft state hides items from the public list. Delete removes the row (and optionally its asset).

### Phase 4 — Decommission Directus
20. Update `ecosystem.config.js` to drop the `cms` PM2 process; restart only the frontend.
21. Update `infra/nginx.conf` and `docs/nginx-tume.work.gd.conf` to remove the `/admin`/`/assets`/`/items` proxy to `:8055`. Keep `/uploads` if we serve locally through the Next app (already handled by `/public`).
22. Update `infra/backup-db.sh` to dump only the application tables (skip `directus_*`), or keep dumping everything until the Directus tables are dropped.
23. Update `Readme.md`, `manage.sh`, `.env.example` files, and `infra/healthcheck.sh` to reflect the single-service topology.
24. After a monitoring period (one release cycle), drop the `directus_*` tables and the old `cms/` directory from the repo.

**Exit criteria:** Only the Next.js frontend process runs; nginx has no Directus upstream; backups contain only application tables.

---

## 6. Environment Variables (target `.env`)

Removed:
- `DIRECTUS_URL`
- `DIRECTUS_API_TOKEN`
- `NEXT_PUBLIC_DIRECTUS_URL`
- `DIRECTUS_ADMIN_EMAIL`
- `DIRECTUS_ADMIN_PASSWORD`

Added / changed:
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/tume_cms` (Prisma)
- `NEXTAUTH_SECRET=<strong random>` (JWT signing)
- `NEXTAUTH_URL=https://tume.work.gd` (or `http://localhost:3009` locally)
- `ADMIN_SESSION_MAX_AGE_SECONDS=43200` (12h) — optional
- `UPLOAD_DRIVER=local|s3`
- `UPLOAD_LOCAL_DIR=public/uploads`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_URL` (only when `UPLOAD_DRIVER=s3`)
- `SMTP_*` (unchanged from `cms/.env.example`; moved into frontend `.env`)

Preserved: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_*` image config, `next-intl` config, the existing SMTP values used by `contact/reply/route.ts`.

---

## 7. Data Model (Prisma, key tables)

```prisma
enum NewsStatus      { draft published archived }
enum VacancyStatus   { draft published closed }
enum InterviewStatus { draft published }
enum InterviewType   { written face_to_face practical screening }

model AdminUser {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model News {
  id             Int          @id @default(autoincrement())
  status         NewsStatus   @default(draft)
  titleSw        String       @map("title_sw")
  titleEn        String       @map("title_en")
  slug           String       @unique
  excerptSw      String?      @map("excerpt_sw")
  excerptEn     String?      @map("excerpt_en")
  bodySw         String       @map("body_sw")
  bodyEn         String       @map("body_en")
  categoryId     Int          @map("category")
  category       NewsCategory @relation(fields: [categoryId], references: [id])
  datePublished  DateTime?    @map("date_published")
  featuredImage  String?      @map("featured_image")   // asset id/uuid
  pdfDocument    String?      @map("pdf_document")
  @@map("news")
}

model NewsCategory { id Int @id ...; nameSw String; nameEn String; slug String @unique; news News[] @@map("news_categories") }

model Vacancy {
  id            Int           @id @default(autoincrement())
  status        VacancyStatus @default(draft)
  titleSw       String         @map("title_sw")
  titleEn       String         @map("title_en")
  slug          String         @unique
  institutionSw String?       @map("institution_sw")
  institutionEn String?       @map("institution_en")
  descriptionSw String        @map("description_sw")
  descriptionEn String         @map("description_en")
  datePosted    DateTime      @map("date_posted")
  deadlineDate  DateTime?     @map("deadline_date")
  pdfDocument   String?       @map("pdf_document")
  @@map("vacancies")
}

model Interview {
  id            Int            @id @default(autoincrement())
  status        InterviewStatus @default(draft)
  titleSw       String         @map("title_sw")
  titleEn       String         @map("title_en")
  slug          String         @unique
  institutionId Int            @map("institution")
  institution   Institution    @relation(fields: [institutionId], references: [id])
  interviewType InterviewType  @map("interview_type")
  descriptionSw String         @map("description_sw")
  descriptionEn String         @map("description_en")
  datePosted    DateTime       @map("date_posted")
  pdfDocument   String?        @map("pdf_document")
  @@map("interviews")
}

model Institution { id Int @id ...; nameSw String; nameEn String; slug String @unique; interviews Interview[] @@map("institutions") }

model Asset {
  id        Int      @id @default(autoincrement())
  uuid      String   @unique
  filename  String
  mimeType  String
  size      Int
  storageKey String
  createdAt DateTime @default(now())
  @@map("assets")
}

model ContactSubmission {
  id           Int      @id @default(autoincrement())
  fullName     String   @map("full_name")
  email        String
  subject      String
  message      String
  createdAt    DateTime @default(now()) @map("created_at")
  isRead       Boolean  @default(false) @map("is_read")
  status       String   @default("new") // new | replied | closed
  replyMessage String?  @map("reply_message")
  replySentAt  DateTime? @map("reply_sent_at")
  @@map("contact_submissions")
}

model LegacyUrl {
  id            Int     @id @default(autoincrement())
  oldId         Int     @map("old_id")
  newUrl        String  @map("new_url")
  collectionName String  @map("collection_name")
  @@map("legacy_urls")
}
```

Other tables (`board_members`, `departments`, `units`, `pages`, `hero_slides`, `services`, `site_settings`) are migrated the same way and exposed only through `src/lib/content.ts` for the existing public pages (no admin UI in phase 1).

---

## 8. Security Considerations

- **Admin auth:** NextAuth Credentials + JWT in http-only, `Secure`, `SameSite=Lax` cookies. Rotate `NEXTAUTH_SECRET`. Add a server-side session-expiry check on every admin route via `auth()`.
- **Password storage:** argon2 with recommended parameters; never log or return the hash.
- **Authorization:** All `/api/admin/*` and `/admin/*` routes require a valid admin session. Public write routes (`/api/contact`) keep the existing rate limiting + honeypot.
- **Input validation:** Every admin mutation route validates with a zod schema (whitelist fields; reject unknown keys). Rich-text HTML is sanitized server-side with DOMPurify (jsdom) before storage to strip `<script>`, inline event handlers, etc., preventing stored XSS in the public `dangerouslySetInnerHTML` rendering.
- **CSRF:** Auth.js v5 handles CSRF for its own endpoints. For admin mutation forms, rely on the SameSite cookie + custom CSRF token if we add fetch-based mutations from the client; if all admin forms are plain HTML POSTs (server actions or form actions), CSRF is largely mitigated by SameSite.
- **File uploads:**
  - Whitelist MIME types: `application/pdf` for documents, `image/png|jpeg|webp|avif` for images.
  - Enforce max size (e.g. 10 MB PDF, 5 MB image) at the route handler.
  - Generate new UUIDs server-side; never trust the client filename for the storage key.
  - Scan with `file`/magic-byte check before storing.
- **Rate limiting:** Reuse the existing in-memory rate limiter for `/api/contact`; add the same for `/api/auth/login` (e.g. 5 attempts / 15 min per IP) to slow brute force.
- **Secrets:** Move SMTP and DB passwords into the frontend `.env` (gitignored). Update `.env.example` with placeholders. Audit that no secrets are baked into the image.

---

## 9. Testing Strategy

- **Unit tests (vitest, already configured):**
  - `lib/content.ts` accessors with a test Postgres (or mocked Prisma).
  - zod schemas for news/vacancy/interview mutation inputs.
  - `storage.ts` local driver with a tmp dir.
  - HTML sanitizer for rich-text bodies.
- **Integration tests (vitest + jsdom, already configured):**
  - Admin route handlers: assert unauthenticated requests return 401; assert valid create/edit/delete flows mutate the DB and return expected shapes.
  - `/api/contact` happy path and validation errors.
- **End-to-end (manual or Playwright if added later):**
  - Admin logs in, creates a news item with PDF + image, publishes, sees it on the public homepage and `/habari` list, opens the detail page, downloads the PDF.
  - Same flow for vacancies and interviews.
  - Draft items are not visible publicly.
  - Logout redirects to `/admin/login`.
- **Migration verification:** After Phase 0, run a parity script that compares row counts and a sample of slugs between the old Directus reads and the new Prisma reads for news, vacancies, interviews.

---

## 10. Rollout / Rollback Plan

- Run the entire migration on a staging instance first (the project already runs on `tume.work.gd` and `localhost:3009`).
- Phase 1 (read switch) is the riskiest user-visible change. Deploy behind a feature flag `USE_PRISA_READS=true` so we can flip back to Directus reads by toggling an env var if a regression appears. (Implement `content.ts` with two backends behind the flag for the duration of Phase 1 verification; remove the Directus branch once stable.)
- Phase 3 (admin UI) ships after Phase 1 is verified stable; it does not affect the public site.
- Phase 4 (decommission Directus) only after at least one full content cycle (post + edit + delete of all three content types) succeeds in production.
- **Rollback:** Until Phase 4, keep Directus running and the DB intact. Rolling back means reverting the frontend deploy and re-pointing reads/writes at Directus. After Phase 4, rollback requires restoring the `directus_*` tables from a pre-decommission backup.

---

## 11. Open Decisions (to confirm before implementation)

1. **Rich-text editor:** TipTap vs Milkdown vs a simple `<textarea>` + server-side markdown-to-HTML (would require converting existing HTML bodies). Recommendation: TipTap, since it outputs HTML directly.
2. **Storage backend at launch:** keep local-disk `public/uploads` (simplest) or move straight to the existing MinIO? Recommendation: local-disk for the migration, MinIO optional in a follow-up — keeps the cutover smaller.
3. **Should `/admin` be locale-prefixed (`/[locale]/admin`)?** Recommendation: **no** — keep `/admin` outside `next-intl` to simplify auth and avoid accidental locale redirects. The admin UI can be English-only.
4. **Auth library:** NextAuth/Auth.js v5 vs a hand-rolled JWT cookie. Recommendation: NextAuth for safety and speed.
5. **Server actions vs route handlers for admin mutations.** Recommendation: route handlers + plain HTML forms (or fetch calls) — easier to test, no Next.js 16 server-action edge cases. Server actions can be revisited later.

---

## 12. File-by-File Change List

**Delete:**
- `frontend/src/lib/directus.ts`
- `cms/` (in Phase 4)

**Create:**
- `frontend/prisma/schema.prisma`, `frontend/prisma/migrations/*`
- `frontend/scripts/seed-admin.ts`
- `frontend/src/lib/{db,auth,storage,content,sanitize}.ts`
- `frontend/src/app/api/auth/{login,logout,me}/route.ts` (or rely on Auth.js handlers)
- `frontend/src/app/api/admin/{news,vacancies,interviews}/route.ts` + `[id]/route.ts`
- `frontend/src/app/api/admin/upload/route.ts`
- `frontend/src/app/admin/{layout,login,page}.tsx`
- `frontend/src/app/admin/{news,vacancies,interviews}/{page,new,[id]/edit}.tsx`
- Shared admin components: `frontend/src/components/admin/{AdminForm,FileUpload,RichTextEditor,DataTable}.tsx`

**Rewrite (logic only, keep public rendering):**
- `frontend/src/app/api/contact/route.ts`
- `frontend/src/app/api/contact/reply/route.ts`
- `frontend/src/app/api/download/[id]/route.ts`

**Rewrite data access (keep markup):**
- `frontend/src/app/[locale]/page.tsx`
- `frontend/src/app/[locale]/news/{page,[slug]/page}.tsx`
- `frontend/src/app/[locale]/vacancies/{page,[slug]/page}.tsx`
- `frontend/src/app/[locale]/interviews/{page,[slug]/page}.tsx`
- `frontend/src/app/[locale]/search/page.tsx`
- `frontend/src/app/[locale]/about-us/{core-functions,introduction,mission-vision}/page.tsx`
- `frontend/src/app/[locale]/organization-structure/board/page.tsx`
- `frontend/src/components/sections/{NewsSummary,VacancySummary,InterviewSummary,HeroSlideshow,WelcomeSection}.tsx`

**Update config:**
- `frontend/.env.example`, `frontend/.env.local`
- `frontend/package.json` (add Prisma, Auth.js, argon2, TipTap, DOMPurify, jsdom; remove `@directus/sdk`)
- `frontend/next.config.ts` (image remotePatterns once assets move in-app)
- `frontend/src/middleware.ts` (exclude `/admin`, `/api/admin`, `/api/auth` from i18n)
- `frontend/src/types/index.ts` (drop Directus-shaped optional fields, keep public shape)
- `ecosystem.config.js` (drop `cms`)
- `infra/nginx.conf`, `docs/nginx-tume.work.gd.conf` (drop `:8055` upstream)
- `infra/backup-db.sh`, `docs/database/backup-db.sh` (table selection)
- `Readme.md`, `manage.sh`, `infra/healthcheck.sh`

---

## 13. Acceptance Criteria (definition of done)

1. Directus process is no longer started; only the Next.js frontend runs under PM2.
2. An admin can navigate to `/admin/login`, sign in with email + password, and reach `/admin`.
3. From `/admin`, the admin can create, edit, publish, unpublish, and delete **news**, **vacancies**, and **interviews**, including uploading a PDF and an image, all within the Next.js UI.
4. Newly published items appear on the corresponding public list and detail pages in both `sw` and `en` locales; draft/closed items do not.
5. The public contact form still submits, and the admin reply flow still sends email.
6. Legacy WordPress `/download/<id>/` redirects still resolve.
7. `@directus/sdk` is no longer a dependency; `grep -ri directus frontend/src` returns no functional references.
8. Existing content (rows present at migration time) is fully visible and editable in the new admin UI.
9. Backups taken after cutover contain all application tables and no `directus_*` system tables (post-decommission).
10. `npm run build` and the existing vitest suite pass.