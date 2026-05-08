I've thoroughly analyzed your current website. Here's a comprehensive migration plan and architecture suggestions for the new **Next.js 16** application (excluding the recruitment portal).

------

## 📊 Current Website Analysis

Your site has these core content areas:

| Section                | Type             | Notes                                          |
| ---------------------- | ---------------- | ---------------------------------------------- |
| Home                   | Static + Dynamic | Hero slider, welcome text, news lists          |
| About Us               | Static pages     | Introduction, Mission & Vision, Core Functions |
| Organization Structure | Static + media   | Board, Departments, Units, Org Chart           |
| Our Service            | Static           | Service listings                               |
| Contact Us             | Static + form    | Contact info                                   |
| Latest News            | Dynamic          | PDF downloads                                  |
| Vacancy Announcements  | Dynamic          | PDF downloads                                  |
| Call for Interviews    | Dynamic          | PDF downloads                                  |
| External/Staff Links   | Static           | Footer links                                   |

------

## 🏗️ Recommended Architecture

### 1. Tech Stack

```
Next.js 16 (App Router)
├── Frontend        → Next.js + Tailwind CSS
├── CMS/Backend     → Payload CMS or Directus (self-hosted, headless)
├── Database        → PostgreSQL
├── File Storage    → MinIO (for PDFs/documents)
├── Language        → TypeScript
└── Deployment      → Your Proxmox VMs (as per your infrastructure)
```

**Why a headless CMS?** Your staff needs to keep uploading PDFs (vacancies, news, interviews) without touching code. A CMS gives them a clean admin panel — just like WordPress, but the frontend is fully custom Next.js.

------

### 2. Page Structure (App Router)

```
app/
├── page.tsx                          → Home
├── about-us/
│   ├── introduction/page.tsx
│   ├── mission-vision/page.tsx
│   └── core-functions/page.tsx
├── organization-structure/
│   ├── board/page.tsx
│   ├── department/page.tsx
│   ├── unit-division/page.tsx
│   └── organization-chart/page.tsx
├── our-service/page.tsx
├── contact-us/page.tsx
├── news/
│   ├── page.tsx                      → News listing
│   └── [slug]/page.tsx               → Single news item
├── vacancies/
│   ├── page.tsx                      → Vacancies listing
│   └── [slug]/page.tsx
└── interviews/
    ├── page.tsx                      → Call for interviews listing
    └── [slug]/page.tsx
```

------

### 3. Rendering Strategy Per Page

| Page                          | Strategy               | Reason                       |
| ----------------------------- | ---------------------- | ---------------------------- |
| Home                          | ISR (revalidate: 3600) | News list changes frequently |
| About Us                      | SSG                    | Never changes                |
| Org Structure                 | SSG                    | Rarely changes               |
| Our Service                   | SSG                    | Rarely changes               |
| Contact Us                    | SSG                    | Static                       |
| News / Vacancies / Interviews | ISR (revalidate: 1800) | Updated regularly            |
| Single news/vacancy           | ISR                    | Per-document page            |

------

### 4. Key Features to Build

**A. Document/PDF Management** Since most of your content is PDF announcements, build a clean document management system:

- Upload PDFs → stored in **MinIO**
- CMS stores metadata (title, category, date, file URL)
- Frontend fetches and lists them with filters by category (News / Vacancies / Interviews)

**B. Bilingual Support (Swahili + English)** Your current site mixes Swahili and English. Use `next-intl` for proper i18n routing:

```
/sw/habari/...     → Swahili
/en/news/...       → English
```

**C. Search & Filter** A simple client-side or server-side search across vacancies, news, and interviews — something WordPress lacks natively.

**D. Accessibility & Performance** Current site loads slowly due to Elementor bloat. Next.js with proper image optimization (`next/image`) and static generation will be significantly faster.

------

### 5. CMS Recommendation

**use — Directus for backend**

- More polished admin UI
- REST + GraphQL API out of the box
- Good for non-technical staff

Both run on Node.js and connect to your existing PostgreSQL setup.

------

### 6. Infrastructure Mapping (Proxmox)

Based on your current server setup:

```
VM 1 → Next.js App          (Node.js, PM2 never use Docker)
VM 2 → PostgreSQL + CMS     (Payload/Directus + DB)
VM 3 → MinIO                (PDF/document storage)
```

All behind an **Nginx reverse proxy** on the host or a dedicated proxy VM. this project should use no docker at all. we will use manage.sh script to manage the start, stop, restart of all or individual services 

------

## ✅ Migration Steps

1. **Audit & export** all current WordPress content (pages, PDFs, media)
2. **Set up Payload CMS** with content models for: News, Vacancies, Interviews, Pages
3. **Import existing PDFs** into MinIO, link metadata in CMS
4. **Build Next.js frontend** page by page, starting with static pages
5. **Connect dynamic pages** (news/vacancies/interviews) to CMS API
6. **Test, optimize, and deploy** on your Proxmox infrastructure
7. **DNS cutover** from WordPress to Next.js

------

## ⚠️ Things to Keep in Mind

- **Keep all existing PDF URLs working** — either redirect `/download/XXXX/` paths or preserve them so old links don't break
- **Staff training** on the new CMS admin panel will be needed
- The **ZanAjira Portal** link (`portal.zanajira.go.tz`) stays as-is — you're only replacing the main website
- Consider keeping WordPress running in parallel during migration until fully tested

[Directus](https://directus.io?utm_source=chatgpt.com) is a **self-hosted headless CMS and data platform** used to manage content and databases through an API-first approach.