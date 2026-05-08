# Implementation Plan — Tume ya Utumishi Serikalini Website

## Context

The existing WordPress + Elementor website at `zanajira.go.tz` suffers from poor performance, no native bilingual support, limited search/filter, and requires technical intervention for content updates. This plan implements a complete replacement using Next.js 16 + Directus CMS + MinIO + PostgreSQL, deployed on existing Proxmox infrastructure — no Docker, no cloud. The SRS is in `docs/SRS.md`.

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize the Next.js project

**Directory:** `/home/yusuf/tume_web/frontend`

- `npx create-next-app@latest` with App Router, TypeScript, Tailwind CSS, ESLint
- Install dependencies: `next-intl`, `@directus/sdk`, `lucide-react` (icons), `react-hook-form` + `zod` (form validation)
- Set up `tsconfig.json` strict mode, path aliases (`@/` mapping)
- Create `.env.example` with all required env vars (see SRS Appendix B)
- Initialize Git repository with `.gitignore` (node_modules, .env, .next, etc.)
- Configure ESLint + Prettier with pre-commit hooks via `husky` + `lint-staged`

**Files to create:**
```
frontend/
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── robots.ts
│   └── sitemap.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          # Locale layout with providers
│   │   │   └── page.tsx            # Home page (placeholder)
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── api/
│   │   │   ├── contact/route.ts
│   │   │   └── download/[id]/route.ts
│   │   └── globals.css
│   ├── lib/
│   │   ├── directus.ts             # Directus SDK client
│   │   ├── i18n.ts                 # next-intl config
│   │   └── utils.ts                 # Shared helpers
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── SearchOverlay.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── ContactForm.tsx
│   │   └── sections/
│   │       ├── HeroSlider.tsx
│   │       ├── WelcomeSection.tsx
│   │       ├── NewsSummary.tsx
│   │       ├── VacancySummary.tsx
│   │       └── InterviewSummary.tsx
│   ├── messages/
│   │   ├── en.json
│   │   └── sw.json
│   └── types/
│       ├── index.ts
│       └── directus.ts
```

### 1.2 Set up Directus CMS

**Directory:** `/home/yusuf/tume_web/cms`

- Install Directus via `npm init directus@latest` or manual setup
- Configure PostgreSQL connection in `.env`
- Configure MinIO storage backend in `.env`
- Define all content collections from SRS FR-4.5.1 as Directus migrations/snapshots
- Set up user roles: Editor, Reviewer, Administrator (FR-4.5.2)
- Configure draft/published/archived workflow (FR-4.5.3)

**Files to create:**
```
cms/
├── .env.example
├── .gitignore
├── package.json
├── snapshots/
│   └── schema.yaml                # Directus schema snapshot (version-controlled)
├── migrations/
│   └── 001_initial_schema.js      # Content model migrations
└── seed/
    └── sample-data.json            # Initial sample content for dev
```

### 1.3 Set up MinIO

- Install MinIO binary on VM 3
- Create `tume-web-assets` bucket
- Set up access policies for public read, authenticated write
- Configure MinIO as systemd service or PM2-managed process

### 1.4 Create `manage.sh`

**Directory:** `/home/yusuf/tume_web/manage.sh`

Write the management script supporting: `start`, `stop`, `restart`, `status`, `logs`, `build`, `deploy` for all services or individual ones. Include:
- PM2 ecosystem config for frontend and CMS
- Systemd integration for PostgreSQL and MinIO
- Color-coded output, error handling, dependency ordering
- Environment variable validation before starting services

---

## Phase 2: Core Design System & Layout

### 2.1 Design system foundation

- Define Tailwind config with SMZ/Zanzibar government color palette (green, gold, blue)
- Define typography scale (Inter or Noto Sans)
- Set up responsive breakpoints: mobile (<640px), tablet (640–1024px), desktop (>1024px)
- Create base component library in `src/components/ui/`: Button, Card, Pagination, Badge, SearchInput, FilterBar, ContactForm
- Create `src/components/layout/` components: Header, Footer, TopBar, Navigation, MobileMenu, LanguageSwitcher, SearchOverlay, Breadcrumb

### 2.2 Root layout and locale routing

- Configure `next-intl` with `[locale]` dynamic segment (`sw` default, `en` alternative)
- Set up `middleware.ts` for locale detection and redirect from `/` → `/sw`
- Create message files `messages/en.json` and `messages/sw.json` with all UI strings
- Build root layout with `<html lang={locale}>`, meta tags, font loading
- Build locale layout wrapping pages with `NextIntlClientProvider`

### 2.3 Header and Footer

- **TopBar:** ZanAjira Portal link, Ajira Portal link, social icons, language switcher
- **Navigation:** Logo, dropdown menus for About Us and Organization Structure, search icon
- **Mobile:** Hamburger menu with slide-out navigation
- **Footer:** 4-column layout (Organization Info, Staff Links, External Links, Useful Links) + copyright "© {year} Tume ya Utumishi Serikalini — Zanzibar" + social icons
- All footer links configurable from CMS `site_settings` collection

### 2.4 Error pages

- `not-found.tsx` — Bilingual 404 with link to home and search suggestion
- `error.tsx` — Bilingual 500 error boundary with link to home

---

## Phase 3: Static Pages (SSG)

### 3.1 About Us pages

Three pages under `/[locale]/about-us/`:

1. **Introduction** — Fetch `pages` collection from Directus (slug: `introduction`). Render rich text. ISR-like on-demand revalidation.
2. **Mission & Vision** — Fetch `pages` collection (slug: `mission-vision`).
3. **Core Functions** — Fetch `pages` collection (slug: `core-functions`).

Each page: breadcrumb, bilingual content, fallback to available language if missing translation.

### 3.2 Organization Structure pages

Four pages under `/[locale]/organization-structure/`:

1. **Board** — Fetch `board_members` collection, display as card grid (photo, name, role, bio)
2. **Department** — Fetch `departments` collection, display as card grid
3. **Unit & Division** — Fetch `units` collection (with department relation), display as grouped list
4. **Organization Chart** — Build interactive org chart from `board_members` + `departments` + `units` data. Use a tree visualization library (e.g., `react-organizational-chart` or custom CSS). Must be mobile-responsive with expand/collapse.

### 3.3 Our Services page

Single page `/[locale]/our-service/`. Fetch `services` collection. Display as card grid or accordion with service name, description, optional document link.

### 3.4 Contact Us page

Single page `/[locale]/contact-us/`:
- Contact info section (phone, email, address from `site_settings`)
- Contact form with validation (react-hook-form + zod), honeypot anti-spam, rate limiting
- Form submits to `/api/contact` Route Handler → Directus `contact_submissions` collection → email notification
- Embedded map (OpenStreetMap/Leaflet to avoid Google Maps billing)

---

## Phase 4: Dynamic Pages (ISR)

### 4.1 Home page

`/[locale]/page.tsx` — ISR with revalidation 3600s:
1. Fetch `hero_slides` (active, sorted) → render `<HeroSlider>` component
2. Fetch `pages` (slug: `welcome`) → render `<WelcomeSection>`
3. Fetch latest 10 `news` (published) → render `<NewsSummary>`
4. Fetch latest 5 `vacancies` (published) → render `<VacancySummary>`
5. Fetch latest 5 `interviews` (published) → render `<InterviewSummary>`

### 4.2 News listing and detail

**Listing** (`/[locale]/news/page.tsx`):
- Fetch all published `news` items (paginated, 10 per page)
- Category filter via URL search params
- Search via URL search params
- ISR revalidation 1800s

**Detail** (`/[locale]/news/[slug]/page.tsx`):
- Fetch single news item by slug + locale
- Render title, date, body (rich text), category, PDF download link
- ISR revalidation 1800s
- `generateStaticParams` for known slugs at build time

### 4.3 Vacancy announcements

Same pattern as News:
- **Listing:** `/[locale]/vacancies/page.tsx` — paginated, filterable by institution and status
- **Detail:** `/[locale]/vacancies/[slug]/page.tsx` — full vacancy with PDF download

### 4.4 Call for Interviews

Same pattern as News:
- **Listing:** `/[locale]/interviews/page.tsx` — paginated, filterable by institution and interview type
- **Detail:** `/[locale]/interviews/[slug]/page.tsx` — full interview call with PDF download

### 4.5 Global search page

`/[locale]/search/page.tsx` — SSR:
- Accept `?q=` query parameter
- Search across `news`, `vacancies`, `interviews` collections via Directus API
- Display results grouped by type with links to detail pages
- Support both Swahili and English content

---

## Phase 5: i18n, SEO, and Cross-Cutting Features

### 5.1 Full bilingual implementation

- Ensure all page components read content from Directus `_sw`/`_en` fields based on current `locale`
- Fallback logic: if `title_en` is empty, display `title_sw` (and vice versa)
- UI chrome strings (navigation labels, button text, form labels) from `messages/en.json` and `messages/sw.json`
- Language switcher preserves current route, swaps locale segment
- `hreflang` alternate links in `<head>` for SEO

### 5.2 SEO implementation

- Dynamic `<title>` and `<meta description>` per page from CMS content or overrides
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- JSON-LD structured data for `Organization` schema on home page
- Auto-generated `sitemap.xml` via `app/sitemap.ts` (Next.js built-in)
- `robots.ts` allowing all crawlers, disallowing `/api/`, `/admin/`, draft content
- Canonical URLs on every page

### 5.3 Legacy URL redirects

- Create `/api/download/[id]/route.ts` that looks up old WordPress download IDs in a mapping table
- Mapping table stored as a JSON file or Directus collection (`legacy_urls`: `old_id`, `new_url`)
- Return 301 redirect to the new document URL
- All `/download/XXXX/` paths from WordPress must be cataloged and mapped

### 5.4 Security headers and middleware

- Add security headers via `next.config.ts` headers function: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Content-Security-Policy`
- Rate limiting for `/api/contact` — in-memory or Redis-based (simple Map with TTL for single-server setup)
- Input sanitization on contact form using `dompurify` or server-side stripping

---

## Phase 6: Infrastructure & Deployment Configuration

### 6.1 Nginx configuration

Write Nginx config for reverse proxy:
- SSL termination with Let's Encrypt (certbot)
- Proxy pass `/` → VM1:3000 (Next.js)
- Proxy pass `/admin/` and `/api/` → VM2:8055 (Directus)
- Proxy pass `/assets/` → VM3:9000 (MinIO public assets)
- Gzip compression, static asset caching headers
- HTTP → HTTPS redirect
- Security headers (redundant with Next.js but defense-in-depth)

### 6.2 PM2 ecosystem configuration

Write `ecosystem.config.js` with process definitions for:
- `tume-frontend` — Next.js production server on port 3000
- `tume-cms` — Directus server on port 8055
- MinIO as systemd service (not PM2)

### 6.3 Backup scripts

Write shell scripts:
- `backup-db.sh` — `pg_dump` daily, rotate 30-day retention
- `backup-minio.sh` — `mc mirror` daily, rotate 30-day retention
- `backup-cms-snapshot.sh` — Directus schema+content export weekly, 90-day retention
- Install as cron jobs on respective VMs

### 6.4 Health check script

Write a simple `healthcheck.sh` that curls the frontend, CMS API, and MinIO health endpoints, and alerts (via log or email) on failure.

---

## Phase 7: Testing

### 7.1 Unit tests

- Test Directus SDK client configuration
- Test i18n message loading and fallback logic
- Test contact form validation (zod schemas)
- Test utility functions (slug generation, date formatting, excerpt generation)

**Framework:** Vitest + React Testing Library

### 7.2 Integration tests

- Test contact form submission → Directus API → email notification
- Test legacy URL redirect lookup and 301 response
- Test search across collections
- Test pagination and filter logic

**Framework:** Vitest + MSW (Mock Service Worker) for API mocking

### 7.3 E2E tests

- Test critical user flows: home page loads, language switch, news listing + detail, vacancy listing + PDF download, contact form submission, search
- Test bilingual content display and fallback
- Test mobile responsive layout

**Framework:** Playwright

### 7.4 Accessibility tests

- Run axe-core automated checks on all pages
- Verify keyboard navigation on interactive elements
- Verify color contrast ratios

### 7.5 Performance tests

- Lighthouse CI on home page, news listing, vacancy detail
- Verify LCP ≤ 2.5s, CLS ≤ 0.1, Lighthouse ≥ 90

---

## Phase 8: Content Migration & CMS Population

### 8.1 WordPress content audit and export

- Use WP REST API or WP-CLI to export all posts, pages, media
- Catalog all `/download/XXXX/` URLs with their target PDFs
- Export media library (PDFs and images)

### 8.2 MinIO import

- Upload all exported PDFs to MinIO `tume-web-assets` bucket
- Create URL mapping table (old WordPress download IDs → new MinIO URLs)
- Upload all images (hero slides, board member photos, page images)

### 8.3 Directus content population

- Create all content collections in Directus via migration scripts
- Import news items with bilingual titles, dates, body content, PDF links
- Import vacancy announcements and interview calls
- Manually enter: board members, departments, units, services, pages (About, Mission, etc.)
- Configure hero slides, site settings (phone, email, address, social links, footer links)
- Create CMS user accounts for editors and administrators

### 8.4 Legacy URL mapping

- Insert all `/download/XXXX/` → new URL mappings into `legacy_urls` collection
- Verify redirect functionality with a sample of old URLs

---

## Phase 9: Deployment & Go-Live

### 9.1 Staging deployment

- Deploy all three VMs on Proxmox
- Configure Nginx on staging subdomain (`staging.zanajira.go.tz`)
- Run full test suite against staging
- Invite staff to test CMS and provide feedback

### 9.2 Staff training

- Train editors on Directus CMS: creating/editing news, vacancies, interviews
- Train on PDF upload workflow
- Train administrators on user management and site settings

### 9.3 DNS cutover

- Lower DNS TTL to 5 minutes 24 hours before cutover
- Switch `zanajira.go.tz` DNS to point to new Nginx server
- Verify all pages, forms, downloads, and redirects work in production
- Monitor error logs for 48 hours

### 9.4 Post-launch

- Monitor performance (Lighthouse, Core Web Vitals)
- Fix any issues found in first 2 weeks
- Keep WordPress running in parallel for rollback capability
- Remove WordPress after 2 weeks if no rollback needed

---

## Execution Order & Task Dependencies

```
Phase 1.1 (Next.js init) ─────────────────────────┐
Phase 1.2 (Directus setup) ───────────────────────┤
Phase 1.3 (MinIO setup) ──────────────────────────┤
Phase 1.4 (manage.sh) ────────────────────────────┤
                                                    ├──▶ Phase 2 (Layout & i18n)
Phase 8.1 (WP export) ────────────────────────────┤    │
Phase 8.2 (MinIO import) ── depends on 1.3, 8.1 ──┤    ├──▶ Phase 3 (Static pages)
Phase 8.3 (Directus content) ── depends on 1.2 ───┤    ├──▶ Phase 4 (Dynamic pages)
                                                    │    └──▶ Phase 5 (SEO, redirects, security)
Phase 3 (Static pages) ── depends on Phase 2 ─────┤
Phase 4 (Dynamic pages) ── depends on Phase 2 + 8.3┤
Phase 5 (SEO, etc.) ── depends on Phase 2 ─────────┤
                                                    ├──▶ Phase 6 (Infrastructure)
Phase 6 (Infra) ── can start after Phase 1 ────────┤    ├──▶ Phase 7 (Testing)
                                                    │    └──▶ Phase 8 (Migration)
Phase 7 (Testing) ── depends on Phases 3–6 ────────┤
                                                    └──▶ Phase 9 (Go-Live)
Phase 9 (Go-Live) ── depends on Phase 7 + 8 ──────┘
```

**Recommended parallel tracks:**
- **Track A (Frontend):** Phase 1.1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
- **Track B (Backend/Infra):** Phase 1.2 + 1.3 + 1.4 → Phase 6 → Phase 8
- **Track C (Testing):** Starts after Track A Phase 3 is complete, runs in parallel with Phase 4–5

---

## Verification Checklist

After each phase, verify:

- [ ] **Phase 1:** `npm run build` succeeds, Directus admin panel accessible, MinIO bucket created, `manage.sh status` reports all services
- [ ] **Phase 2:** Home page renders with header/footer, language switcher toggles Swahili/English, all routes navigate correctly
- [ ] **Phase 3:** All static pages render with content from CMS, breadcrumbs work, contact form submits successfully
- [ ] **Phase 4:** News/vacancy/interview listings paginate and filter, detail pages load, PDF downloads work, home page shows dynamic summaries
- [ ] **Phase 5:** Lighthouse SEO score ≥ 90, `sitemap.xml` generates, legacy `/download/XXXX/` URLs redirect correctly, security headers present
- [ ] **Phase 6:** Nginx proxies correctly, SSL works, backups run on schedule, PM2 processes auto-restart
- [ ] **Phase 7:** All unit/integration/E2E tests pass, Lighthouse performance ≥ 90, axe-core reports zero violations
- [ ] **Phase 8:** All WordPress content migrated, CMS editors can create/publish content independently
- [ ] **Phase 9:** Production site live at `zanajira.go.tz`, all acceptance criteria from SRS Section 11 met