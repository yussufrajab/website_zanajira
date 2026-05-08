# Tume ya Utumishi Serikalini — Application Documentation

## Overview

**Tume ya Utumishi Serikalini** (Civil Service Commission of Zanzibar) website — a bilingual (Swahili/English) government portal built with Next.js 16, Directus CMS, and PostgreSQL. The site provides information about vacancies, interviews, news, organizational structure, and services for the Zanzibar Civil Service Commission.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | Next.js (App Router) | 16.2.5 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Internationalization | next-intl | 4.11.0 |
| CMS | Directus | 11.17.4+ |
| Database | PostgreSQL | — |
| File Storage | Local filesystem (`cms/uploads/`) | — |
| Process Manager | PM2 | — |
| Package Manager | npm | — |

### Frontend Dependencies

| Package | Purpose |
|---|---|
| `@directus/sdk` | Directus REST SDK |
| `next-intl` | i18n routing and translations |
| `lucide-react` | Icon library |
| `react-hook-form` + `zod` | Form handling and validation |
| `clsx` | Conditional CSS classes |

---

## Database Configuration

| Setting | Value |
|---|---|
| DB Host | `127.0.0.1` |
| DB Port | `5432` |
| DB Name | `tume_cms` |
| DB User | `postgres` |
| DB Password | `postgres` |

Connection string: `postgresql://postgres:postgres@localhost:5432/tume_cms`

---

## User Roles & Credentials

### Admin (Full Access)

| Setting | Value |
|---|---|
| Email | `admin@zanajira.go.tz` |
| Password | `admin123` |
| CMS URL | `http://localhost:8055/admin/login` |
| Role | Administrator (full CRUD on all collections) |

### API Access

| Setting | Value |
|---|---|
| Token | `dev-api-token` |
| Assigned To | Admin user (static token) |
| Usage | Frontend server-side data fetching |

### Public (Anonymous)

| Setting | Value |
|---|---|
| Access | Read-only on published content |
| Collections | `vacancies`, `news`, `news_categories`, `interviews`, `directus_files` |
| Auth | None required — automatic via Public policy |

---

## Role Permissions Matrix

| Collection | Administrator | Public (Anonymous) |
|---|---|---|
| `vacancies` | Full CRUD | Read (published fields) |
| `news` | Full CRUD | Read (all fields) |
| `news_categories` | Full CRUD | Read (all fields) |
| `interviews` | Full CRUD | Read (all fields) |
| `directus_files` | Full CRUD | Read (all fields) |
| `directus_collections` | Full | Read |
| `directus_fields` | Full | Read |
| `directus_settings` | Full | Read |
| `directus_users` | Full | Read (self only) |

---

## Database Schema Overview

### `vacancies`

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | integer (PK, auto) | No | |
| `status` | varchar | No | `draft`, `published`, `closed` |
| `sort` | integer | Yes | Sort order |
| `date_created` | timestamptz | Yes | Auto-generated |
| `date_updated` | timestamptz | Yes | Auto-generated |
| `title_en` | varchar(255) | No | English title |
| `title_sw` | varchar(255) | Yes | Swahili title |
| `slug` | varchar(255) | No | Auto-slug from `title_en` |
| `institution_en` | varchar(255) | Yes | English institution name |
| `institution_sw` | varchar(255) | Yes | Swahili institution name |
| `description_en` | text | Yes | Rich HTML (English) |
| `description_sw` | text | Yes | Rich HTML (Swahili) |
| `deadline_date` | date | Yes | Application deadline |
| `pdf_document` | uuid (FK → `directus_files.id`) | Yes | PDF attachment |
| `date_posted` | date | Yes | Defaults to today |

### `news`

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | integer (PK, auto) | No | |
| `status` | varchar | No | `draft`, `published`, `archived` |
| `sort` | integer | Yes | Sort order |
| `date_created` | timestamptz | Yes | Auto-generated |
| `date_updated` | timestamptz | Yes | Auto-generated |
| `title_en` | varchar(255) | No | |
| `title_sw` | varchar(255) | Yes | |
| `slug` | varchar(255) | No | Auto-slug from `title_en` |
| `excerpt_en` | text | Yes | Short summary (English) |
| `excerpt_sw` | text | Yes | Short summary (Swahili) |
| `body_en` | text | Yes | Full article HTML (English) |
| `body_sw` | text | Yes | Full article HTML (Swahili) |
| `category` | integer (FK → `news_categories.id`) | Yes | |
| `date_published` | date | Yes | Defaults to today |
| `featured_image` | uuid (FK → `directus_files.id`) | Yes | |
| `pdf_document` | uuid (FK → `directus_files.id`) | Yes | PDF attachment |

### `news_categories`

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | integer (PK, auto) | No | |
| `sort` | integer | Yes | Sort order |
| `name_en` | varchar(255) | No | English name |
| `name_sw` | varchar(255) | Yes | Swahili name |
| `slug` | varchar(255) | No | Auto-slug from `name_en` |

### `interviews`

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `id` | integer (PK, auto) | No | |
| `status` | varchar | No | `draft`, `published` |
| `sort` | integer | Yes | Sort order |
| `date_created` | timestamptz | Yes | Auto-generated |
| `date_updated` | timestamptz | Yes | Auto-generated |
| `title_en` | varchar(255) | No | |
| `title_sw` | varchar(255) | Yes | |
| `slug` | varchar(255) | No | Auto-slug from `title_en` |
| `interview_type` | varchar | No | `written`, `face_to_face`, `practical`, `screening` |
| `institution_en` | varchar(255) | Yes | |
| `institution_sw` | varchar(255) | Yes | |
| `description_en` | text | Yes | Rich HTML (English) |
| `description_sw` | text | Yes | Rich HTML (Swahili) |
| `date_posted` | date | Yes | Defaults to today |
| `pdf_document` | uuid (FK → `directus_files.id`) | Yes | PDF attachment |

---

## Project Structure

```
tume_web/
├── manage.sh                    # Service manager script
├── ecosystem.config.js          # PM2 production config
├── docs/                        # Documentation
│   ├── SRS.md
│   ├── implementation_plan.md
│   ├── tus_website.md
│   └── pics/                    # Slide images
│
├── cms/                         # Directus CMS
│   ├── .env                     # CMS environment config
│   ├── package.json
│   ├── uploads/                 # Local file storage
│   └── extensions/             # Custom extensions (if any)
│
├── frontend/                    # Next.js application
│   ├── .env.local               # Frontend environment config
│   ├── .env.example
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── public/
│   │   └── slides/              # Hero slideshow images (1-8.jpeg)
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── globals.css       # Global styles + Tailwind theme
│       │   ├── robots.ts
│       │   ├── sitemap.ts
│       │   ├── api/
│       │   │   ├── contact/route.ts       # POST — contact form submission
│       │   │   └── download/[id]/route.ts  # GET — legacy URL redirects
│       │   └── [locale]/
│       │       ├── layout.tsx
│       │       ├── page.tsx                # Homepage
│       │       ├── not-found.tsx
│       │       ├── error.tsx
│       │       ├── about-us/
│       │       │   ├── introduction/page.tsx
│       │       │   ├── mission-vision/page.tsx
│       │       │   └── core-functions/page.tsx
│       │       ├── contact-us/page.tsx
│       │       ├── interviews/
│       │       │   ├── page.tsx
│       │       │   └── [slug]/page.tsx
│       │       ├── news/
│       │       │   ├── page.tsx
│       │       │   └── [slug]/page.tsx
│       │       ├── organization-structure/
│       │       │   ├── board/page.tsx
│       │       │   ├── department/page.tsx
│       │       │   ├── organization-chart/page.tsx
│       │       │   └── unit-division/page.tsx
│       │       ├── our-service/page.tsx
│       │       ├── search/page.tsx
│       │       └── vacancies/
│       │           ├── page.tsx
│       │           └── [slug]/page.tsx
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Breadcrumb.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── Header.tsx
│       │   │   ├── LanguageSwitcher.tsx
│       │   │   └── SearchOverlay.tsx
│       │   ├── sections/
│       │   │   ├── HeroSlideshow.tsx
│       │   │   ├── InterviewSummary.tsx
│       │   │   ├── NewsSummary.tsx
│       │   │   ├── VacancySummary.tsx
│       │   │   └── WelcomeSection.tsx
│       │   └── ui/
│       │       ├── Badge.tsx
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       ├── ContactForm.tsx
│       │       ├── FilterBar.tsx
│       │       ├── Pagination.tsx
│       │       └── SearchInput.tsx
│       ├── lib/
│       │   ├── directus.ts         # Directus SDK client + helpers
│       │   ├── i18n.ts             # i18n configuration
│       │   ├── navigation.ts       # Navigation links config
│       │   ├── routing.ts          # Locale routing config
│       │   └── utils.ts            # Utility functions (formatDate, etc.)
│       ├── messages/
│       │   ├── en.json             # English translations
│       │   └── sw.json             # Swahili translations
│       ├── middleware.ts           # Next.js middleware (i18n routing)
│       └── types/
│           └── index.ts            # TypeScript interfaces
│
└── infra/                        # Infrastructure scripts
    ├── backup-db.sh
    ├── backup-minio.sh
    ├── healthcheck.sh
    └── setup-minio.sh
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `http://localhost:3000` |
| `DIRECTUS_URL` | Directus CMS URL | `http://localhost:8055` |
| `DIRECTUS_API_TOKEN` | Static API token for Directus | `dev-api-token` |
| `SMTP_HOST` | SMTP server host | `localhost` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | _(empty)_ |
| `SMTP_PASS` | SMTP password | _(empty)_ |
| `CONTACT_EMAIL` | Contact form recipient | `info@zanajira.go.tz` |
| `RATE_LIMIT_MAX` | Max contact form submissions per window | `3` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `3600000` (1 hour) |

### CMS (`cms/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Directus port | `8055` |
| `DB_CLIENT` | Database client | `pg` |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `5432` |
| `DB_DATABASE` | Database name | `tume_cms` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `STORAGE_LOCATIONS` | Storage location name | `local` |
| `STORAGE_LOCAL_DRIVER` | Storage driver | `local` |
| `STORAGE_LOCAL_ROOT` | Upload root directory | `./uploads` |
| `STORAGE_LOCAL_PUBLIC_URL` | Public URL for assets | `http://localhost:8055/assets` |
| `ADMIN_EMAIL` | Admin user email | `admin@zanajira.go.tz` |
| `ADMIN_PASSWORD` | Admin user password | `admin123` |
| `SECRET` | JWT secret | `local-dev-secret-change-in-production` |
| `CORS_ENABLED` | Enable CORS | `true` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

---

## Management Script (`manage.sh`)

The `manage.sh` script at the project root manages all services:

```bash
./manage.sh <command> [service]
```

### Commands

| Command | Description |
|---|---|
| `start [service]` | Start all or a specific service |
| `stop [service]` | Stop all or a specific service |
| `restart [service]` | Restart all or a specific service |
| `status` | Check status of all services |
| `health` | HTTP health checks |
| `logs [service]` | View logs |
| `tail [service]` | Tail logs in real-time |
| `dev` | Start frontend + CMS in dev mode |
| `prod` | Start via PM2 (production) |
| `start-prod` | Build and start everything for production |
| `db-migrate` | Run Directus migrations |
| `db-seed` | Seed the database |
| `db-backup` | Backup PostgreSQL database |
| `db-restore` | Restore PostgreSQL database |
| `db-reset` | Drop and recreate the database |
| `install` | Install npm dependencies |
| `build` | Build the frontend |
| `clean` | Remove build artifacts |

### Service Names

| Service | Port | Description |
|---|---|---|
| `postgres` | 5432 | PostgreSQL database |
| `minio` | 9000 | MinIO object storage |
| `cms` | 8055 | Directus CMS |
| `frontend` | 3000 | Next.js frontend |

### Examples

```bash
./manage.sh start              # Start all services
./manage.sh start cms         # Start only Directus CMS
./manage.sh restart frontend  # Restart the frontend
./manage.sh status             # Check all service ports
./manage.sh health             # HTTP health checks
./manage.sh logs cms           # View CMS logs
./manage.sh db-backup          # Backup the database
```

---

## Running the Application

### Development Mode

```bash
cd /home/yusuf/tume_web

# Start all services
./manage.sh start

# Or start individually
./manage.sh start postgres
./manage.sh start cms
./manage.sh start frontend

# Check status
./manage.sh status
```

Access:
- **Frontend**: http://localhost:3000
- **Directus CMS Admin**: http://localhost:8055/admin/login
- **Directus API**: http://localhost:8055

### Production Mode (PM2)

```bash
./manage.sh start-prod
```

This builds the frontend and starts services via PM2 for production use.

### Network Access (WSL2)

To access the application from other PCs on the same network, run these commands in **PowerShell (Admin)** on Windows:

```powershell
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<WSL_IP>
netsh interface portproxy add v4tov4 listenport=8055 listenaddress=0.0.0.0 connectport=8055 connectaddress=<WSL_IP>
New-NetFirewallRule -DisplayName "Tume Web Dev" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000,8055
```

Get the WSL IP with: `hostname -I` (inside WSL)

---

## API Endpoints

### Directus REST API

Base URL: `http://localhost:8055`

#### Public Endpoints (no auth required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/items/vacancies` | List published vacancies |
| GET | `/items/vacancies/:id` | Get single vacancy |
| GET | `/items/news` | List published news articles |
| GET | `/items/news/:id` | Get single news article |
| GET | `/items/news_categories` | List news categories |
| GET | `/items/interviews` | List published interviews |
| GET | `/items/interviews/:id` | Get single interview |
| GET | `/assets/:id` | Download file/PDF by ID |

#### Query Parameters

```
# Filter by status
?filter[status][_eq]=published

# Filter by slug
?filter[slug][_eq]=assistant-secretary-2026

# Sort descending by date
?sort[]=-date_posted

# Limit results
?limit=5

# Select specific fields
?fields=id,title_en,slug,date_posted
```

#### Authenticated Endpoints (requires admin token)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate and get token |
| GET | `/items/vacancies` | List all vacancies (including drafts) |
| POST | `/items/vacancies` | Create a vacancy |
| PATCH | `/items/vacancies/:id` | Update a vacancy |
| DELETE | `/items/vacancies/:id` | Delete a vacancy |
| POST | `/files` | Upload a file/PDF |
| GET | `/admin` | Directus admin panel |

### Frontend API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact` | Submit contact form (rate-limited) |
| GET | `/api/download/:id` | Legacy WordPress URL redirect |

### Frontend Pages

| Route | Page |
|---|---|
| `/en` or `/sw` | Homepage |
| `/en/about-us/introduction` | Introduction |
| `/en/about-us/mission-vision` | Mission & Vision |
| `/en/about-us/core-functions` | Core Functions |
| `/en/vacancies` | Vacancy listing |
| `/en/vacancies/:slug` | Vacancy detail |
| `/en/news` | News listing |
| `/en/news/:slug` | News detail |
| `/en/interviews` | Interviews listing |
| `/en/interviews/:slug` | Interview detail |
| `/en/organization-structure/board` | Board members |
| `/en/organization-structure/department` | Departments |
| `/en/organization-structure/unit-division` | Units & Divisions |
| `/en/organization-structure/organization-chart` | Org chart |
| `/en/our-service` | Services |
| `/en/contact-us` | Contact form |
| `/en/search` | Search |

Replace `/en` with `/sw` for Swahili versions.

---

## Bilingual Support

The application supports two languages:

| Code | Language |
|---|---|
| `en` | English |
| `sw` | Swahili |

All content fields in Directus use `_en` and `_sw` suffixes (e.g., `title_en`, `title_sw`). The frontend uses `next-intl` for UI translations (stored in `src/messages/en.json` and `sw.json`) and `getLocalizedField()` for CMS content.

---

## Color Theme

| Variable | Hex | Usage |
|---|---|---|
| `primary` | `#006b3f` | Main green — headings, buttons, links |
| `primary-dark` | `#004d2e` | Darker green — hover states |
| `primary-light` | `#e8f5ee` | Light green — backgrounds |
| `secondary` | `#c5922e` | Gold — footer headings, accents |
| `secondary-dark` | `#9e7524` | Dark gold |
| `secondary-light` | `#fdf5e6` | Light gold |
| `accent` | `#003366` | Dark blue — top bar background |
| `accent-dark` | `#002244` | Darker blue |
| `accent-light` | `#e6eef5` | Light blue |
| `foreground` | `#1a1a2e` | Near-black — text, footer background |
| `muted` | `#6b7280` | Gray — secondary text |
| `surface` | `#f9fafb` | Off-white — section backgrounds |
| `success` | `#16a34a` | Green — "Open" badges |
| `error` | `#dc2626` | Red — "Closed" badges |
| `warning` | `#d97706` | Orange — warnings |