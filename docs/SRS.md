# Software Requirements Specification (SRS)

## Civil Service Commission Zanzibar (Tume ya Utumishi Serikalini) — Website Redesign

**Document Version:** 1.0
**Date:** 2026-05-07
**Organization:** Tume ya Utumishi Serikalini — Zanzibar (Civil Service Commission)
**Parent Office:** President's Office — Constitution, Legal Affairs, Public Service and Good Governance

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Architecture](#3-system-architecture)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Interface Requirements](#7-interface-requirements)
8. [Security Requirements](#8-security-requirements)
9. [Infrastructure & Deployment](#9-infrastructure--deployment)
10. [Migration Requirements](#10-migration-requirements)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Appendices](#12-appendices)

---

## 1. Introduction

### 1.1 Purpose

This document defines the complete software requirements for redesigning and replacing the existing WordPress-based website of the Civil Service Commission Zanzibar (commonly known as ZanAjira or Tume ya Utumishi Serikalini) with a modern, performant, and maintainable web application. The new system shall serve as the official public-facing website for the Commission, providing citizens, civil servants, and stakeholders with access to news, vacancy announcements, interview calls, organizational information, and contact details.

### 1.2 Scope

The scope of this project covers:

- **In Scope:** Complete replacement of the main public website at `zanajira.go.tz`, including all content sections (Home, About Us, Organization Structure, Our Services, Contact Us, News, Vacancies, Call for Interviews), a headless CMS for staff content management, document/PDF storage, bilingual support (Swahili and English), and deployment on existing Proxmox infrastructure.
- **Out of Scope:** The ZanAjira recruitment portal (`portal.zanajira.go.tz`), the Ajira Portal Tanzania (`ajira.go.tz`), staff systems (e-Office, HRMS, Staff Mail, Salary Claim), and any internal workflow or recruitment processing systems.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| SRS | Software Requirements Specification |
| CMS | Content Management System |
| ISR | Incremental Static Regeneration |
| SSG | Static Site Generation |
| SSR | Server-Side Rendering |
| i18n | Internationalization |
| MinIO | Self-hosted object storage server compatible with Amazon S3 API |
| PM2 | Node.js production process manager |
| Proxmox | Open-source virtualization management platform |
| SMZ | Serikali ya Mapinduzi ya Zanzibar (Revolutionary Government of Zanzibar) |
| Directus | Self-hosted headless CMS and data platform |
| ISR | Incremental Static Regeneration — Next.js strategy that regenerates pages at request-time at a configured interval |

### 1.4 References

- Current website: `https://www.zanajira.go.tz/`
- Civil Service Commission Act No. 14 of 1986
- Zanzibar Constitution of 1984
- Next.js 16 App Router documentation
- Directus CMS documentation (`https://directus.io`)
- MinIO documentation (`https://min.io`)

### 1.5 Overview

Section 2 describes the product context and user profiles. Sections 3–9 detail the system architecture, functional and non-functional requirements, data models, interfaces, and security. Section 10 covers migration, and Section 11 defines acceptance criteria.

---

## 2. Overall Description

### 2.1 Product Perspective

The new website replaces an existing WordPress + Elementor site that suffers from poor performance, limited bilingual support, no native search/filter capability, and a content management workflow that requires technical intervention for routine updates. The new system is a greenfield build using Next.js 16 with a decoupled headless CMS (Directus), PostgreSQL database, and MinIO object storage, deployed on the organization's existing Proxmox virtualization infrastructure without Docker.

The system consists of three main components:

1. **Frontend Application** — Next.js 16 (App Router) public-facing website
2. **Headless CMS** — Directus providing an admin panel and API for content management
3. **Object Storage** — MinIO for PDF/document file storage

### 2.2 User Classes and Characteristics

| User Class | Description | Technical Skill | Key Needs |
|-----------|-------------|----------------|-----------|
| **Public Visitor (Citizen)** | General public seeking vacancy announcements, interview calls, news, and organizational information | Low | Fast access to documents, clear navigation, Swahili language |
| **Civil Servant** | Government employees checking interview schedules, vacancy announcements, and official notices | Low–Medium | Up-to-date listings, downloadable PDFs, accessible information |
| **CMS Editor** | Commission staff responsible for posting news, vacancies, and interview announcements | Low–Medium | Intuitive admin panel, easy PDF upload, no coding required |
| **CMS Administrator** | IT-literate staff managing CMS users, content models, and system configuration | Medium | Full control over content structure, user management |
| **System Administrator** | Technical staff managing infrastructure, deployments, and backups | High | Process management, log access, backup/restore procedures |

### 2.3 Operating Environment

- **Server Platform:** Proxmox VE virtual machines running Ubuntu Linux
- **Runtime:** Node.js (LTS), managed by PM2
- **Database:** PostgreSQL 16+
- **Object Storage:** MinIO
- **Reverse Proxy:** Nginx
- **No Docker:** All services run natively on VMs, managed via a `manage.sh` script
- **Network:** Hosted within the Zanzibar government network infrastructure
- **Domain:** `zanajira.go.tz`, SSL termination at Nginx

### 2.4 Constraints

1. **No Docker** — All services must run natively on the VMs; containerization is explicitly excluded
2. **No cloud hosting** — Deployment is on self-owned Proxmox infrastructure only
3. **Low-bandwidth users** — Must perform well on slow connections typical in Zanzibar
4. **Bilingual audience** — Must serve content in both Swahili and English
5. **Government compliance** — Must adhere to SMZ (Revolutionary Government of Zanzibar) branding and accessibility standards
6. **Legacy URL preservation** — Existing `/download/XXXX/` PDF URLs must remain functional or redirect properly
7. **Staff training** — CMS must be simple enough for non-technical staff after minimal training

### 2.5 Assumptions and Dependencies

- PostgreSQL is already available or will be installed on VM 2
- SSL certificates will be provisioned (e.g., via Let's Encrypt)
- DNS for `zanajira.go.tz` is under the organization's control
- Existing PDF documents from WordPress can be exported and migrated
- Staff will receive training on the Directus admin panel post-launch
- The existing WordPress site will remain operational during migration until the new site is fully verified

---

## 3. System Architecture

### 3.1 Architecture Overview

```
                    ┌─────────────┐
                    │   Internet   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │  (Reverse Proxy / SSL Termination)
                    │  (VM 0 or  │
                    │   Host)     │
                    └──┬─────┬───┘
                       │     │
            ┌──────────▼┐   ┌▼──────────┐
            │  VM 1      │   │  VM 2     │
            │  Next.js   │   │  Directus │
            │  Frontend  │   │  CMS      │
            │  (PM2)     │   │  (PM2)   │
            │  :3000     │   │  :8055   │
            └────────────┘   │          │
                             │ Postgres │
                             │  :5432   │
                             └────┬─────┘
                                  │
                             ┌────▼─────┐
                             │  VM 3    │
                             │  MinIO   │
                             │  :9000   │
                             └──────────┘
```

### 3.2 VM Allocation

| VM | Role | Services | Ports |
|----|------|----------|-------|
| VM 1 | Frontend Application | Next.js (PM2) | 3000 |
| VM 2 | Backend + Database | Directus CMS (PM2), PostgreSQL | 8055, 5432 |
| VM 3 | Object Storage | MinIO Server | 9000 (API), 9001 (Console) |

### 3.3 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Next.js (App Router) | 16.x |
| UI/Styling | Tailwind CSS | 4.x |
| Language | TypeScript | 5.x |
| Headless CMS | Directus | 11.x |
| Database | PostgreSQL | 16+ |
| Object Storage | MinIO | Latest |
| Process Manager | PM2 | Latest |
| Reverse Proxy | Nginx | Latest |
| Internationalization | next-intl | 4.x |
| Node.js | LTS | 22.x |

### 3.4 Service Management

All services are managed via a `manage.sh` shell script (no Docker, no systemd units required — though systemd may optionally be used).

**manage.sh** must support the following commands:

```bash
manage.sh start [all|frontend|cms|minio]
manage.sh stop [all|frontend|cms|minio]
manage.sh restart [all|frontend|cms|minio]
manage.sh status [all|frontend|cms|minio]
manage.sh logs [frontend|cms|minio]
manage.sh build [frontend]     # Build Next.js production bundle
manage.sh deploy [frontend]    # Pull latest, build, restart
```

---

## 4. Functional Requirements

### 4.1 Public Website — Pages and Content

#### FR-4.1.1: Home Page

**ID:** FR-4.1.1
**Priority:** High
**Description:** The home page shall display the following sections in order:

1. **Hero Slider/Carousel** — Rotating banner images with overlay text and optional call-to-action links. Administrators must be able to add, remove, reorder, and set active/inactive slides via the CMS. Minimum 1 slide, maximum 10 slides. Auto-rotation interval: 5 seconds. Manual navigation via prev/next arrows and dot indicators. Mobile-responsive.

2. **Welcome Section** — Institutional description with historical context (founding year 1986, constitutional basis). Content managed via CMS. Bilingual (Swahili default, English available).

3. **Latest News Listings** — Display the 10 most recent news items. Each item shows: title, date posted, category tag, and a link to the full news page or PDF download. "View All News" link navigates to `/news` listing page.

4. **Vacancy Announcements Summary** — Display the 5 most recent vacancy announcements. Each item shows: title, institution name, date posted. "View All Vacancies" link navigates to `/vacancies` listing page.

5. **Call for Interviews Summary** — Display the 5 most recent interview call items. Each item shows: title, institution/ministry name, date posted. "View All Interviews" link navigates to `/interviews` listing page.

**Rendering Strategy:** ISR with revalidation period of 3600 seconds (1 hour).

---

#### FR-4.1.2: About Us Section

**ID:** FR-4.1.2
**Priority:** High
**Description:** Three sub-pages under `/about-us/`:

1. **Introduction** (`/about-us/introduction`) — Overview of the Civil Service Commission, its establishment under Act No. 14 of 1986 and the Zanzibar Constitution of 1984, institutional independence, and composition (Chairman, Vice Chairman, five Members appointed by the President).

2. **Mission & Vision** (`/about-us/mission-vision`) — Commission's mission statement and vision. Content managed via CMS as rich text.

3. **Core Functions** (`/about-us/core-functions`) — Duties including managing civil servant discipline, confirmation of servants, increasing service time, retirement, promotion, and oversight. Content managed via CMS as rich text.

All content must be bilingual (Swahili and English). CMS editors must be able to edit each section independently.

**Rendering Strategy:** SSG (static at build time).

---

#### FR-4.1.3: Organization Structure Section

**ID:** FR-4.1.3
**Priority:** High
**Description:** Four sub-pages under `/organization-structure/`:

1. **Board** (`/organization-structure/board`) — List of Commission Board members with: name, title/role, photo (optional), and brief biography. Data managed via CMS as a repeatable collection.

2. **Department** (`/organization-structure/department`) — List of departments with: department name, head of department, description, and optional image. Data managed via CMS as a repeatable collection.

3. **Unit & Division** (`/organization-structure/unit-division`) — List of units and divisions with: name, parent department, head, and description. Data managed via CMS as a repeatable collection.

4. **Organization Chart** (`/organization-structure/organization-chart`) — Visual organizational hierarchy chart. Must be interactive (expandable/collapsible nodes) and render correctly on mobile devices. Chart data sourced from CMS (same Board/Department/Unit collections with parent-child relationships).

**Rendering Strategy:** SSG.

---

#### FR-4.1.4: Our Services Page

**ID:** FR-4.1.4
**Priority:** Medium
**Description:** A single page at `/our-service` listing all services provided by the Commission. Each service entry includes: service name, description, any applicable procedures or requirements, and optional document link. Content managed via CMS as a repeatable collection. Bilingual.

**Rendering Strategy:** SSG.

---

#### FR-4.1.5: Contact Us Page

**ID:** FR-4.1.5
**Priority:** High
**Description:** A page at `/contact-us` containing:

1. **Contact Information Display** — Phone number (+255-663-101012), email (info@zanajira.go.tz), physical address, office hours. Managed via CMS.

2. **Contact Form** — Allows visitors to submit inquiries. Fields:
   - Full Name (required, max 100 characters)
   - Email Address (required, validated format)
   - Subject (required, max 200 characters)
   - Message (required, max 2000 characters)
   - reCAPTCHA v3 or honeypot anti-spam mechanism

   On submission:
   - Form data is stored in the CMS/database
   - Notification email is sent to info@zanajira.go.tz
   - Confirmation message displayed to the user
   - Input validation with clear error messages in both languages

3. **Map** — Embedded map showing the Commission's office location.

**Rendering Strategy:** SSG for page shell, SSR for form submission.

---

#### FR-4.1.6: News Listing and Detail Pages

**ID:** FR-4.1.6
**Priority:** High
**Description:**

**Listing Page** (`/news`) — Displays all news items in reverse chronological order. Each item shows: title, date posted, category tag, excerpt (auto-generated from first 150 characters of body or manually set), and thumbnail if available.

Features:
- Pagination (10 items per page)
- Filter by category (tag)
- Search by keyword (title and body text)
- Bilingual content support

**Detail Page** (`/news/[slug]`) — Full news article display with: title, date, full body (rich text with images), category, and attached PDF document (if any) with download link. PDF opens in a new tab or downloads directly.

**Rendering Strategy:** ISR with revalidation of 1800 seconds (30 minutes).

---

#### FR-4.1.7: Vacancy Announcements

**ID:** FR-4.1.7
**Priority:** High
**Description:**

**Listing Page** (`/vacancies`) — Displays all vacancy announcements in reverse chronological order. Each item shows: title, institution/ministry name, date posted, deadline date (if applicable), and status badge (Open/Closed).

Features:
- Pagination (15 items per page)
- Filter by institution/ministry
- Filter by status (Open/Closed)
- Search by keyword
- Bilingual content support

**Detail Page** (`/vacancies/[slug]`) — Full vacancy announcement with: title, institution, date posted, deadline, description body, and PDF download link.

**Rendering Strategy:** ISR with revalidation of 1800 seconds.

---

#### FR-4.1.8: Call for Interviews

**ID:** FR-4.1.8
**Priority:** High
**Description:**

**Listing Page** (`/interviews`) — Displays all interview call announcements in reverse chronological order. Each item shows: title, institution/ministry, interview type (Written/Face-to-Face/Practical/Screening), date posted.

Features:
- Pagination (15 items per page)
- Filter by institution/ministry
- Filter by interview type
- Search by keyword
- Bilingual content support

**Detail Page** (`/interviews/[slug]`) — Full interview call with: title, institution, interview type, date, description body, and PDF download link.

**Rendering Strategy:** ISR with revalidation of 1800 seconds.

---

### 4.2 Internationalization (Bilingual Support)

#### FR-4.2.1: Language Routing

**ID:** FR-4.2.1
**Priority:** High
**Description:** The system shall support Swahili and English via `next-intl` with the following URL structure:

- Swahili (default): `/sw/habari`, `/sw/nafasi-za-kazi`, `/sw/mwaliko-wa-usaili`
- English: `/en/news`, `/en/vacancies`, `/en/interviews`

Static pages (About, Services, Contact) must also have language variants.

The root path `/` must redirect to `/sw` (Swahili as default language).

A language switcher must be present in the site header, allowing users to toggle between Swahili and English while preserving the current page context.

---

#### FR-4.2.2: Content Translation in CMS

**ID:** FR-4.2.2
**Priority:** High
**Description:** The Directus CMS must be configured so that editors can enter content in both Swahili and English for every translatable field (title, body, excerpt, etc.). If content is only available in one language, the system shall fall back to the available language version rather than showing an empty page.

---

### 4.3 Document and PDF Management

#### FR-4.3.1: PDF Upload and Storage

**ID:** FR-4.3.1
**Priority:** High
**Description:** CMS editors must be able to upload PDF documents when creating or editing news items, vacancy announcements, or interview calls. PDFs are stored in MinIO object storage. The CMS stores metadata (title, category, date, MinIO file URL) in PostgreSQL. File size limit: 25 MB per document. Accepted formats: PDF only.

---

#### FR-4.3.2: PDF Download and Viewing

**ID:** FR-4.3.2
**Priority:** High
**Description:** Visitors must be able to download PDFs directly from listing pages and detail pages. PDF links must open in a new browser tab. The system shall track download counts for reporting purposes (optional, Phase 2).

---

#### FR-4.3.3: Legacy URL Compatibility

**ID:** FR-4.3.3
**Priority:** High
**Description:** All existing `/download/XXXX/` URLs from the WordPress site must either:
- Resolve to the corresponding migrated document in MinIO, OR
- Return an HTTP 301 redirect to the new document URL

A URL mapping table must be created during migration. The Next.js application must include a catch-all route handler for `/download/[id]` that performs the lookup and redirect.

---

### 4.4 Search and Filter

#### FR-4.4.1: Global Search

**ID:** FR-4.4.1
**Priority:** Medium
**Description:** The site header must include a search input that searches across news, vacancies, and interview announcements. Search must match against title and body text. Results are displayed on a dedicated search results page grouped by content type (News, Vacancies, Interviews). Search must support both Swahili and English content.

Implementation: Server-side search via Directus API with full-text search support on PostgreSQL.

---

#### FR-4.4.2: Category Filters

**ID:** FR-4.4.2
**Priority:** Medium
**Description:** Each listing page (News, Vacancies, Interviews) must provide filter controls:
- **News:** filter by category tag
- **Vacancies:** filter by institution/ministry, status (Open/Closed)
- **Interviews:** filter by institution/ministry, interview type

Filters must be combinable with search. Filters must update the URL query parameters for shareable/bookmarkable filtered views.

---

### 4.5 CMS Administration (Directus)

#### FR-4.5.1: Content Models

**ID:** FR-4.5.1
**Priority:** High
**Description:** The Directus CMS must define the following content collections:

| Collection | Fields | Relationships |
|-----------|--------|--------------|
| `news` | id, title_sw, title_en, slug, excerpt_sw, excerpt_en, body_sw, body_en, category (M2O to news_categories), date_published, featured_image (file), pdf_document (file), status (draft/published/archived) | belongs to category |
| `news_categories` | id, name_sw, name_en, slug | has many news |
| `vacancies` | id, title_sw, title_en, slug, institution_sw, institution_en, description_sw, description_en, date_posted, deadline_date, pdf_document (file), status (draft/published/closed) | — |
| `institutions` | id, name_sw, name_en, slug | referenced by vacancies, interviews |
| `interviews` | id, title_sw, title_en, slug, institution (M2O to institutions), interview_type (written/face_to_face/practical/screening), description_sw, description_en, date_posted, pdf_document (file), status (draft/published) | belongs to institution |
| `interview_types` | id, name_sw, name_en | referenced by interviews |
| `board_members` | id, name, title_role_sw, title_role_en, photo (file), bio_sw, bio_en, sort_order, status | — |
| `departments` | id, name_sw, name_en, head_name, description_sw, description_en, image (file), sort_order, status | has many units |
| `units` | id, name_sw, name_en, department (M2O to departments), head_name, description_sw, description_en, sort_order, status | belongs to department |
| `pages` | id, slug, title_sw, title_en, body_sw, body_en, status | — |
| `hero_slides` | id, title_sw, title_en, subtitle_sw, subtitle_en, image (file), link_url, sort_order, is_active, status | — |
| `services` | id, name_sw, name_en, description_sw, description_en, document (file), sort_order, status | — |
| `contact_submissions` | id, full_name, email, subject, message, created_at, is_read | — |
| `site_settings` | id, key, value_sw, value_en | singleton for phone, email, address, etc. |

---

#### FR-4.5.2: User Roles in CMS

**ID:** FR-4.5.2
**Priority:** High
**Description:** The CMS must implement the following user roles:

| Role | Permissions |
|------|-----------|
| **Editor** | Create, edit, publish news, vacancies, interviews, pages. Upload PDFs and images. View contact submissions. |
| **Reviewer** | All Editor permissions, plus ability to archive/ unpublish content. |
| **Administrator** | Full access: manage users, content models, site settings, system configuration. |

---

#### FR-4.5.3: Content Workflow

**ID:** FR-4.5.3
**Priority:** Medium
**Description:** Content must support a draft/published workflow:
- New content is created as "Draft" by default
- Only "Published" content appears on the public website
- Editors can preview draft content before publishing
- Administrators can archive old content (removes from public view but retains in CMS)

---

### 4.6 Site-Wide Elements

#### FR-4.6.1: Header and Navigation

**ID:** FR-4.6.1
**Priority:** High
**Description:** The site header must include:

1. **Top Bar:**
   - ZanAjira Portal link (external: `portal.zanajira.go.tz`)
   - Ajira Portal Tanzania link (external: `ajira.go.tz`)
   - Social media icons: Facebook, Instagram, YouTube (links configurable via CMS)
   - Language switcher (Swahili/English)

2. **Main Navigation:**
   - Logo (SMZ/CSC branding)
   - Home
   - About Us (dropdown: Introduction, Mission & Vision, Core Functions)
   - Organization Structure (dropdown: Board, Department, Unit & Division, Organization Chart)
   - Our Service
   - Contact Us
   - Search icon (opens search overlay)

3. **Mobile:** Hamburger menu with full navigation tree, language switcher, and search.

---

#### FR-4.6.2: Footer

**ID:** FR-4.6.2
**Priority:** High
**Description:** The footer must include:

1. **Organization Info:** Commission name, brief description, contact details
2. **Staff Services Links:**
   - e-Office (`eoffice.goz.go.tz`)
   - HRMS (`hrms.utumishismz.go.tz`)
   - Staff Mail (`mail.zanajira.go.tz`)
   - Salary Claim (`mshahara.egaz.go.tz`)
3. **External Links:**
   - Ikulu Zanzibar (State House)
   - ORKSUUB (`utumishismz.go.tz`)
   - eGAZ (e-Government Zanzibar)
   - ZAECA (Zanzibar Anti-Corruption and Economic Authority)
   - ZPSC (Zanzibar Public Service Commission)
   - IPA (Institute of Public Administration)
4. **Useful Links:**
   - ZanAjira Portal
   - Ajira Portal-Tanzania
5. **Copyright Notice:** © [Current Year] Tume ya Utumishi Serikalini — Zanzibar
6. **Social Media Icons:** Facebook, Instagram, YouTube

All footer links must be configurable via CMS site settings.

---

#### FR-4.6.3: Error Pages

**ID:** FR-4.6.3
**Priority:** Medium
**Description:** Custom error pages for:
- **404 Not Found:** Bilingual message, link to home page, search suggestion
- **500 Server Error:** Bilingual message, link to home page
- Error pages must maintain site header and footer

---

### 4.7 Contact Form Processing

#### FR-4.7.1: Form Submission

**ID:** FR-4.7.1
**Priority:** High
**Description:**

1. Form submissions are sent via API to the Next.js backend, which writes to the `contact_submissions` collection in Directus.
2. An email notification is sent to `info@zanajira.go.tz` for each new submission.
3. Anti-spam: implement honeypot field (hidden input that bots fill) plus rate limiting (max 3 submissions per IP per hour).
4. Server-side validation for all fields before storage.
5. CMS editors/administrators can view and mark submissions as read in the Directus panel.

---

### 4.8 SEO and Metadata

#### FR-4.8.1: Meta Tags and Open Graph

**ID:** FR-4.8.1
**Priority:** High
**Description:** Every page must include:
- `<title>` tag (bilingual)
- `<meta name="description">` (bilingual)
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Canonical URL
- `hreflang` tags linking Swahili and English variants
- Structured data (JSON-LD) for Organization schema

CMS editors must be able to override SEO metadata per page.

---

#### FR-4.8.2: Sitemap and Robots

**ID:** FR-4.8.2
**Priority:** Medium
**Description:**
- Auto-generated `sitemap.xml` including all published content pages
- `robots.txt` allowing all crawlers, disallowing `/api/`, `/admin/` (Directus), and draft content
- Sitemap must include `hreflang` alternates for bilingual pages

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Metric |
|----|------------|--------|
| NFR-5.1.1 | Largest Contentful Paint (LCP) | ≤ 2.5 seconds on 4G connection |
| NFR-5.1.2 | First Input Delay (FID) | ≤ 100 ms |
| NFR-5.1.3 | Cumulative Layout Shift (CLS) | ≤ 0.1 |
| NFR-5.1.4 | Time to First Byte (TTFB) | ≤ 600 ms |
| NFR-5.1.5 | Lighthouse Performance Score | ≥ 90 |
| NFR-5.1.6 | Page weight (home page) | ≤ 1.5 MB initial load |
| NFR-5.1.7 | Image optimization | All images served via `next/image` with WebP/AVIF format, responsive sizes |

### 5.2 Accessibility

| ID | Requirement | Standard |
|----|------------|----------|
| NFR-5.2.1 | WCAG 2.1 Level AA compliance | All pages must pass automated and manual WCAG 2.1 AA checks |
| NFR-5.2.2 | Keyboard navigation | All interactive elements accessible via keyboard |
| NFR-5.2.3 | Screen reader compatibility | All content readable by screen readers, proper ARIA labels |
| NFR-5.2.4 | Color contrast | Minimum 4.5:1 contrast ratio for normal text |
| NFR-5.2.5 | Language declaration | `lang` attribute set correctly on `<html>` for each language variant |

### 5.3 Reliability and Availability

| ID | Requirement | Target |
|----|------------|--------|
| NFR-5.3.1 | Uptime | ≥ 99.5% (excluding scheduled maintenance) |
| NFR-5.3.2 | Graceful degradation | If CMS is unavailable, serve statically cached pages; display "Content temporarily unavailable" for dynamic sections |
| NFR-5.3.3 | Process recovery | PM2 must auto-restart crashed processes within 10 seconds |
| NFR-5.3.4 | Database backups | Daily automated PostgreSQL backups, retained for 30 days |

### 5.4 Scalability

| ID | Requirement | Target |
|----|------------|--------|
| NFR-5.4.1 | Concurrent users | System must support 500 concurrent users |
| NFR-5.4.2 | Content volume | System must handle 10,000+ documents without performance degradation |
| NFR-5.4.3 | File storage | MinIO must support up to 500 GB of PDF/document storage |

### 5.5 Maintainability

| ID | Requirement |
|----|------------|
| NFR-5.5.1 | TypeScript throughout — all code must be strongly typed |
| NFR-5.5.2 | Code linting with ESLint and Prettier, enforced via pre-commit hooks |
| NFR-5.5.3 | All environment-specific configuration via `.env` files (never hardcoded) |
| NFR-5.5.4 | CMS content models version-controlled as Directus snapshots/migrations |
| NFR-5.5.5 | `manage.sh` provides single entry point for all operational tasks |

### 5.6 Browser Compatibility

| ID | Requirement |
|----|------------|
| NFR-5.6.1 | Chrome 90+ |
| NFR-5.6.2 | Firefox 90+ |
| NFR-5.6.3 | Safari 15+ |
| NFR-5.6.4 | Edge 90+ |
| NFR-5.6.5 | Mobile browsers: Chrome Android, Safari iOS (current - 2 versions) |

---

## 6. Data Requirements

### 6.1 Database Schema Overview

The PostgreSQL database (managed by Directus) stores all content collections defined in FR-4.5.1. Directus auto-generates tables from collection definitions.

Key design decisions:
- All translatable text fields are stored as separate columns (`_sw` / `_en` suffix) rather than a separate translations table, for simplicity
- Files (PDFs, images) are stored in MinIO; Directus stores only the file metadata and reference
- Soft delete: content is archived (status = "archived"), not hard-deleted
- `slug` fields are auto-generated from the Swahili title on creation, editable by CMS user, and must be unique per collection

### 6.2 Data Migration

The following data must be migrated from the existing WordPress site:

| Data Type | Source | Target | Notes |
|----------|--------|--------|-------|
| Pages (About, Services, Contact) | WordPress pages | `pages` collection | Manual review and re-entry likely needed |
| News items | WordPress posts (news category) | `news` collection | Titles, dates, body content, PDF links |
| Vacancy announcements | WordPress posts (vacancy category) | `vacancies` collection | Titles, dates, institution, PDF links |
| Interview calls | WordPress posts (interview category) | `interviews` collection | Titles, dates, institution, type, PDF links |
| PDF documents | WordPress `/wp-content/uploads/` | MinIO | All PDFs with URL mapping table |
| Images | WordPress media library | MinIO | Hero slides, board photos, page images |
| Board members | WordPress pages/posts | `board_members` collection | Manual re-entry recommended |
| Departments/Units | WordPress pages/posts | `departments`, `units` collections | Manual re-entry recommended |

---

## 7. Interface Requirements

### 7.1 User Interface

#### 7.1.1 Design System

- **Color palette:** Aligned with SMZ/Zanzibar government branding (green, gold, blue tones — exact values TBD from existing brand guidelines)
- **Typography:** Clean sans-serif font supporting both Latin and Swahili characters (recommend Inter or Noto Sans)
- **Icon set:** Consistent icon library (e.g., Heroicons or Lucide)
- **Component library:** Shared React components for buttons, cards, forms, pagination, etc.
- **Responsive breakpoints:** Mobile (< 640px), Tablet (640–1024px), Desktop (> 1024px)

#### 7.1.2 Page Layout

All pages share a common layout:
1. Top bar (external links, social, language switcher)
2. Main header (logo, navigation, search)
3. Breadcrumb navigation (below header, above content)
4. Content area
5. Footer (organization info, staff links, external links, copyright)

---

### 7.2 API Interfaces

#### 7.2.1 Directus REST/GraphQL API

The Next.js frontend communicates with Directus via its REST API (preferred for simplicity) or GraphQL API. All API calls are made server-side (in Next.js Server Components or Route Handlers) to avoid exposing the CMS API key to the client.

Authentication: Static API token or user credentials (stored in environment variables).

#### 7.2.2 MinIO S3 API

Directus connects to MinIO via the S3-compatible API for file storage. Configuration:
- Endpoint: MinIO server URL (internal)
- Access key and secret key: stored in Directus environment variables
- Bucket name: `tume-web-assets`

#### 7.2.3 Email API

Contact form submissions trigger email notifications. Options:
- SMTP relay via the organization's existing mail server
- Or Directus built-in email notifications via configured SMTP

---

## 8. Security Requirements

| ID | Requirement | Details |
|----|------------|---------|
| SEC-8.1 | HTTPS enforcement | All traffic redirected from HTTP to HTTPS. SSL certificates via Let's Encrypt, auto-renewal. |
| SEC-8.2 | Security headers | Nginx must set: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy` (configured per page) |
| SEC-8.3 | CMS access control | Directus admin panel accessible only from authenticated users. Optional: restrict admin access to specific IP ranges. |
| SEC-8.4 | API authentication | All Directus API calls from Next.js use authenticated tokens. No unauthenticated public API access. |
| SEC-8.5 | Input sanitization | All user-submitted content (contact form) sanitized server-side to prevent XSS and injection attacks. |
| SEC-8.6 | Rate limiting | Contact form: max 3 submissions per IP per hour. API endpoints: rate limited at Nginx level. |
| SEC-8.7 | File upload security | PDF-only uploads enforced at CMS level. File type validation on upload. Max file size 25 MB. |
| SEC-8.8 | Password policy | CMS user passwords: minimum 12 characters, must include uppercase, lowercase, number, and special character. |
| SEC-8.9 | Session management | CMS sessions expire after 2 hours of inactivity. |
| SEC-8.10 | Dependency auditing | `npm audit` must pass with no high/critical vulnerabilities before each deployment. |
| SEC-8.11 | Environment secrets | All API keys, database credentials, and secrets stored in `.env` files with restricted file permissions (600). Never committed to version control. |
| SEC-8.12 | CORS | Directus API CORS configured to allow requests only from the Next.js application origin. |

---

## 9. Infrastructure and Deployment

### 9.1 Proxmox VM Setup

| VM | Specs (Minimum) | OS | Services |
|----|-----------------|-----|---------|
| VM 1 | 2 vCPU, 4 GB RAM, 40 GB disk | Ubuntu 22.04 LTS | Node.js 22 LTS, PM2, Next.js production build |
| VM 2 | 2 vCPU, 4 GB RAM, 80 GB disk | Ubuntu 22.04 LTS | Node.js 22 LTS, PM2, Directus, PostgreSQL 16 |
| VM 3 | 1 vCPU, 2 GB RAM, 200 GB disk (expandable) | Ubuntu 22.04 LTS | MinIO |

### 9.2 Nginx Configuration

Nginx serves as the single entry point:

```
zanajira.go.tz → Nginx
  ├── /           → proxy_pass VM1:3000  (Next.js)
  ├── /admin/     → proxy_pass VM2:8055  (Directus admin panel)
  ├── /api/       → proxy_pass VM2:8055  (Directus API)
  └── /assets/    → proxy_pass VM3:9000  (MinIO public assets)
```

- SSL termination at Nginx with Let's Encrypt
- Gzip compression enabled
- Static asset caching with appropriate headers
- HTTP → HTTPS redirect

### 9.3 manage.sh Script

The `manage.sh` script (located at a defined path, e.g., `/opt/tume-web/manage.sh`) must:

1. **start** — Start services in order: MinIO → PostgreSQL → Directus → Next.js (respects dependencies)
2. **stop** — Stop services in reverse order: Next.js → Directus → PostgreSQL → MinIO
3. **restart** — Stop then start with dependency order
4. **status** — Check if each service's PM2 process is running, report PID, uptime, memory
5. **logs** — Tail logs for a specific service (via PM2 log commands)
6. **build** — Run `npm run build` for the Next.js application
7. **deploy** — Git pull, install dependencies, build, restart (zero-downtime if possible)

Each service runs under PM2 with an ecosystem config file (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: 'tume-frontend',
      script: 'node_modules/.bin/next start',
      cwd: '/opt/tume-web/frontend',
      env: { NODE_ENV: 'production', PORT: 3000 },
    },
    {
      name: 'tume-cms',
      script: 'node_modules/.bin/directus start',
      cwd: '/opt/tume-web/cms',
      env: { NODE_ENV: 'production', PORT: 8055 },
    },
  ],
};
```

MinIO runs as a system service or under PM2 as appropriate.

### 9.4 Backup Strategy

| Component | Method | Frequency | Retention |
|-----------|--------|-----------|-----------|
| PostgreSQL | `pg_dump` full backup | Daily at 02:00 | 30 days |
| MinIO files | `mc mirror` to backup directory | Daily at 03:00 | 30 days |
| Next.js build | Git repository + build artifacts | On each deploy | Last 5 builds |
| CMS snapshots | Directus schema/content export | Weekly | 90 days |

Backup scripts are triggered via cron jobs on each VM.

### 9.5 Monitoring

- **PM2 Monitoring:** `pm2 monit` for real-time process metrics
- **Nginx Access Logs:** Standard access logging, rotated daily
- **Application Logs:** Structured JSON logs via PM2 log management
- **Uptime Monitoring:** Optional — simple cron-based health check that alerts on failure

---

## 10. Migration Requirements

### 10.1 Migration Phases

| Phase | Activity | Duration Estimate | Dependencies |
|-------|----------|-------------------|-------------|
| Phase 1 | Audit existing WordPress content; catalog all pages, posts, PDFs, media | 1 week | Access to WordPress admin |
| Phase 2 | Export WordPress content (WP REST API or WP CLI) | 3 days | Phase 1 complete |
| Phase 3 | Set up Directus CMS with content models per FR-4.5.1 | 1 week | None |
| Phase 4 | Deploy MinIO; import existing PDFs with URL mapping table | 3 days | Phase 2 complete, MinIO operational |
| Phase 5 | Import content into Directus (pages, news, vacancies, interviews) | 1 week | Phase 3 and 4 complete |
| Phase 6 | Build Next.js frontend — static pages (About, Services, Contact) | 2 weeks | Phase 3 complete |
| Phase 7 | Build Next.js frontend — dynamic pages (News, Vacancies, Interviews) | 2 weeks | Phase 5 complete |
| Phase 8 | Implement bilingual support, search, filters | 1 week | Phase 6–7 complete |
| Phase 9 | Implement legacy URL redirects for `/download/XXXX/` | 2 days | Phase 4 complete |
| Phase 10 | Testing: functional, accessibility, performance, security | 1 week | Phase 8 complete |
| Phase 11 | Staff training on Directus CMS | 2 days | Phase 3 complete |
| Phase 12 | DNS cutover from WordPress to Next.js | 1 day | Phase 10 passed |
| Phase 13 | Post-launch monitoring and bug fixes | 2 weeks | Phase 12 complete |

### 10.2 Parallel Operation

During migration (Phases 6–10), the existing WordPress site must remain operational at `zanajira.go.tz`. The new Next.js site can be tested on a staging subdomain (e.g., `staging.zanajira.go.tz`).

### 10.3 Rollback Plan

If critical issues are discovered after DNS cutover:
1. Revert DNS to point back to the WordPress server
2. WordPress site remains intact (no data was deleted during migration)
3. Maximum rollback time: 1 hour

---

## 11. Acceptance Criteria

### 11.1 Functional Acceptance

| ID | Criterion | Verification Method |
|----|----------|-------------------|
| AC-11.1.1 | All pages defined in FR-4.1.1 through FR-4.1.8 render correctly with real content | Manual review + automated E2E tests |
| AC-11.1.2 | CMS editor can create, edit, and publish a news item with PDF attachment without developer assistance | Manual test with non-technical user |
| AC-11.1.3 | CMS editor can create and publish a vacancy and interview call | Manual test |
| AC-11.1.4 | Language switcher switches all visible content between Swahili and English | Manual test on every page type |
| AC-11.1.5 | All legacy `/download/XXXX/` URLs redirect to correct new URLs or serve the document | Automated redirect test for all mapped URLs |
| AC-11.1.6 | Contact form submits successfully, data stored in CMS, email notification sent | Manual test |
| AC-11.1.7 | Search returns relevant results across news, vacancies, and interviews | Manual test with known content |
| AC-11.1.8 | Filters work correctly on all listing pages | Manual test |
| AC-11.1.9 | Hero slider displays CMS-managed slides with auto-rotation and manual navigation | Manual test |
| AC-11.1.10 | Organization chart renders interactively and correctly on mobile | Manual test |

### 11.2 Performance Acceptance

| ID | Criterion | Verification Method |
|----|----------|-------------------|
| AC-11.2.1 | Lighthouse Performance score ≥ 90 on home page | Lighthouse CI |
| AC-11.2.2 | LCP ≤ 2.5s on simulated 4G | WebPageTest |
| AC-11.2.3 | CLS ≤ 0.1 | Lighthouse CI |
| AC-11.2.4 | Page load ≤ 3s on 3G connection | WebPageTest |

### 11.3 Security Acceptance

| ID | Criterion | Verification Method |
|----|----------|-------------------|
| AC-11.3.1 | No high or critical vulnerabilities in `npm audit` | Automated in CI |
| AC-11.3.2 | HTTPS enforced on all pages | Manual check |
| AC-11.3.3 | Security headers present (per SEC-8.2) | securityheaders.com scan |
| AC-11.3.4 | CMS admin panel requires authentication | Manual test |
| AC-11.3.5 | Contact form rate limiting works | Automated test (4+ rapid submissions) |

### 11.4 Accessibility Acceptance

| ID | Criterion | Verification Method |
|----|----------|-------------------|
| AC-11.4.1 | All pages pass WCAG 2.1 Level AA automated checks (axe-core) | axe-core in E2E tests |
| AC-11.4.2 | Full keyboard navigation works on all pages | Manual test |
| AC-11.4.3 | Screen reader can access all content on home, news, and vacancy pages | Manual test with NVDA/VoiceOver |

---

## 12. Appendices

### Appendix A: Next.js App Router File Structure

```
app/
├── [locale]/                          # Dynamic segment for i18n (sw|en)
│   ├── layout.tsx                     # Root layout with providers
│   ├── page.tsx                       # Home page
│   ├── about-us/
│   │   ├── introduction/page.tsx
│   │   ├── mission-vision/page.tsx
│   │   └── core-functions/page.tsx
│   ├── organization-structure/
│   │   ├── board/page.tsx
│   │   ├── department/page.tsx
│   │   ├── unit-division/page.tsx
│   │   └── organization-chart/page.tsx
│   ├── our-service/page.tsx
│   ├── contact-us/page.tsx
│   ├── news/
│   │   ├── page.tsx                   # Listing
│   │   └── [slug]/page.tsx            # Detail
│   ├── vacancies/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── interviews/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── search/page.tsx                # Global search results
├── api/
│   ├── contact/route.ts               # Contact form handler
│   └── download/[id]/route.ts          # Legacy URL redirect handler
├── not-found.tsx                      # Custom 404
└── error.tsx                          # Custom error boundary
```

### Appendix B: Environment Variables

**VM 1 — Next.js Frontend (.env)**
```
NEXT_PUBLIC_SITE_URL=https://zanajira.go.tz
DIRECTUS_URL=http://VM2_INTERNAL_IP:8055
DIRECTUS_API_TOKEN=<static-api-token>
NEXT_PUBLIC_GOOGLE_MAPS_KEY=<optional>
RECAPTCHA_SECRET_KEY=<optional>
SMTP_HOST=<mail-server>
SMTP_PORT=587
SMTP_USER=<user>
SMTP_PASS=<password>
CONTACT_EMAIL=info@zanajira.go.tz
```

**VM 2 — Directus CMS (.env)**
```
PORT=8055
DB_CLIENT=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=tume_cms
DB_USER=tume_app
DB_PASSWORD=<password>
STORAGE_LOCATIONS=minio
MINIO_ENDPOINT=VM3_INTERNAL_IP
MINIO_PORT=9000
MINIO_KEY=<access-key>
MINIO_SECRET=<secret-key>
MINIO_BUCKET=tume-web-assets
MINIO_PUBLIC_URL=https://zanajira.go.tz/assets
ADMIN_EMAIL=admin@zanajira.go.tz
ADMIN_PASSWORD=<initial-password>
```

**VM 3 — MinIO (.env)**
```
MINIO_ROOT_USER=<access-key>
MINIO_ROOT_PASSWORD=<secret-key>
MINIO_BROWSER=on
```

### Appendix C: Rendering Strategy Summary

| Page | Strategy | Revalidation | Rationale |
|------|----------|-------------|-----------|
| Home | ISR | 3600s | News summaries change frequently |
| About Us (all sub-pages) | SSG | — | Content rarely changes |
| Organization Structure (all sub-pages) | SSG | — | Structure rarely changes |
| Our Service | SSG | — | Content rarely changes |
| Contact Us | SSG (shell) + SSR (form) | — | Static page with dynamic form |
| News Listing | ISR | 1800s | Updated regularly |
| News Detail | ISR | 1800s | Updated regularly |
| Vacancies Listing | ISR | 1800s | Updated regularly |
| Vacancies Detail | ISR | 1800s | Updated regularly |
| Interviews Listing | ISR | 1800s | Updated regularly |
| Interviews Detail | ISR | 1800s | Updated regularly |
| Search | SSR | — | Dynamic per query |

### Appendix D: Glossary of Swahili URL Segments

| English Path | Swahili Path |
|-------------|-------------|
| `/en/news` | `/sw/habari` |
| `/en/vacancies` | `/sw/nafasi-za-kazi` |
| `/en/interviews` | `/sw/mwaliko-wa-usaili` |
| `/en/about-us` | `/sw/kuhusu-sisi` |
| `/en/about-us/introduction` | `/sw/kuhusu-sisis/utangulizi` |
| `/en/about-us/mission-vision` | `/sw/kuhusu-sisis/dira-na-dhamira` |
| `/en/about-us/core-functions` | `/sw/kuhusu-sisis/kazi-msingi` |
| `/en/organization-structure` | `/sw/muundo-wa-shirika` |
| `/en/our-service` | `/sw/huduma-yetu` |
| `/en/contact-us` | `/sw/wasiliana-nasi` |
| `/en/search` | `/sw/tafuta` |

---

*End of Software Requirements Specification*