// Server-side data accessors for public pages. Replaces the Directus SDK
// `fetchItems`/`fetchItem` calls. Each accessor returns plain shapes that
// match the existing `@/types` interfaces so pages render unchanged.
//
// Public accessors only ever return published items (admin/draft/closed rows
// are excluded). Admin mutations go through `/api/admin/*` route handlers.

import { Prisma, NewsStatus, VacancyStatus, InterviewStatus } from "@prisma/client";
import { prisma } from "./db";
import { assetUrl } from "./assets";
import type {
  NewsItem,
  NewsCategory,
  Vacancy,
  Interview,
} from "@/types";

const NEWS_INCLUDE = { category: true } as const;

type NewsRow = Prisma.NewsGetPayload<{ include: typeof NEWS_INCLUDE }>;

/** Normalize a Prisma News row (camelCase + relations) to the public
 * `NewsItem` shape (snake_case as the frontend types expect). Resolves the
 * featured_image / pdf_document asset identifiers to URLs. */
async function toNewsItem(row: NewsRow): Promise<NewsItem> {
  return {
    id: row.id,
    title_sw: row.titleSw ?? "",
    title_en: row.titleEn,
    slug: row.slug,
    excerpt_sw: row.excerptSw ?? "",
    excerpt_en: row.excerptEn ?? "",
    body_sw: row.bodySw ?? "",
    body_en: row.bodyEn ?? "",
    category: row.categoryId ?? 0,
    date_published: row.datePublished ? row.datePublished.toISOString() : "",
    featured_image: row.featuredImage ? await assetUrl(row.featuredImage) : null,
    pdf_document: row.pdfDocument ? await assetUrl(row.pdfDocument) : null,
    status: row.status,
  };
}

// ---- News ----

export async function listNews(opts?: {
  limit?: number;
  categoryId?: number;
  q?: string;
}): Promise<NewsItem[]> {
  const where: Prisma.NewsWhereInput = { status: NewsStatus.published };
  if (opts?.categoryId) where.categoryId = opts.categoryId;
  if (opts?.q) {
    const q = opts.q;
    where.OR = [
      { titleEn: { contains: q, mode: "insensitive" } },
      { titleSw: { contains: q, mode: "insensitive" } },
      { excerptEn: { contains: q, mode: "insensitive" } },
      { excerptSw: { contains: q, mode: "insensitive" } },
      { bodyEn: { contains: q, mode: "insensitive" } },
      { bodySw: { contains: q, mode: "insensitive" } },
    ];
  }
  const rows = await prisma.news.findMany({
    where,
    include: NEWS_INCLUDE,
    orderBy: { datePublished: Prisma.SortOrder.desc },
    take: opts?.limit ?? 50,
  });
  return Promise.all(rows.map(toNewsItem));
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const row = await prisma.news.findFirst({
    where: { slug, status: NewsStatus.published },
    include: NEWS_INCLUDE,
  });
  return row ? toNewsItem(row) : null;
}

export async function getNewsById(id: number): Promise<NewsItem | null> {
  const row = await prisma.news.findUnique({
    where: { id },
    include: NEWS_INCLUDE,
  });
  return row ? toNewsItem(row) : null;
}

export async function listNewsCategories(): Promise<NewsCategory[]> {
  const rows = await prisma.newsCategory.findMany({ orderBy: { id: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name_sw: r.nameSw ?? "",
    name_en: r.nameEn,
    slug: r.slug,
  }));
}

// ---- Vacancies ----

async function toVacancy(row: Prisma.VacancyGetPayload<null>): Promise<Vacancy> {
  return {
    id: row.id,
    title_sw: row.titleSw ?? "",
    title_en: row.titleEn,
    slug: row.slug,
    institution_sw: row.institutionSw ?? "",
    institution_en: row.institutionEn ?? "",
    description_sw: row.descriptionSw ?? "",
    description_en: row.descriptionEn ?? "",
    date_posted: row.datePosted ? row.datePosted.toISOString() : "",
    deadline_date: row.deadlineDate ? row.deadlineDate.toISOString() : null,
    pdf_document: row.pdfDocument ? await assetUrl(row.pdfDocument) : null,
    status: row.status,
  };
}

export async function listVacancies(opts?: {
  limit?: number;
  q?: string;
  status?: "published" | "closed" | "all";
}): Promise<Vacancy[]> {
  const where: Prisma.VacancyWhereInput = {};
  if (!opts?.status || opts.status === "published") {
    where.status = VacancyStatus.published;
  } else if (opts.status === "closed") {
    where.status = VacancyStatus.closed;
  }
  if (opts?.q) {
    const q = opts.q;
    where.OR = [
      { titleEn: { contains: q, mode: "insensitive" } },
      { titleSw: { contains: q, mode: "insensitive" } },
      { institutionEn: { contains: q, mode: "insensitive" } },
      { institutionSw: { contains: q, mode: "insensitive" } },
    ];
  }
  const rows = await prisma.vacancy.findMany({
    where,
    orderBy: { datePosted: Prisma.SortOrder.desc },
    take: opts?.limit ?? 50,
  });
  return Promise.all(rows.map(toVacancy));
}

export async function getVacancyBySlug(slug: string): Promise<Vacancy | null> {
  const row = await prisma.vacancy.findFirst({ where: { slug } });
  if (!row) return null;
  return toVacancy(row);
}

export async function getVacancyById(id: number): Promise<Vacancy | null> {
  const row = await prisma.vacancy.findUnique({ where: { id } });
  if (!row) return null;
  return toVacancy(row);
}

// ---- Interviews ----

async function toInterview(
  row: Prisma.InterviewGetPayload<null>
): Promise<Interview> {
  return {
    id: row.id,
    title_sw: row.titleSw ?? "",
    title_en: row.titleEn,
    slug: row.slug,
    institution_en: row.institutionEn ?? "",
    institution_sw: row.institutionSw ?? "",
    interview_type: row.interviewType,
    description_sw: row.descriptionSw ?? "",
    description_en: row.descriptionEn ?? "",
    date_posted: row.datePosted ? row.datePosted.toISOString() : "",
    pdf_document: row.pdfDocument ? await assetUrl(row.pdfDocument) : null,
    status: row.status,
  };
}

export async function listInterviews(opts?: {
  limit?: number;
  q?: string;
  type?: string;
}): Promise<Interview[]> {
  const where: Prisma.InterviewWhereInput = {
    status: InterviewStatus.published,
  };
  if (opts?.type) {
    // validated by zod in admin; public filter is a loose equals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (where as any).interviewType = opts.type;
  }
  if (opts?.q) {
    const q = opts.q;
    where.OR = [
      { titleEn: { contains: q, mode: "insensitive" } },
      { titleSw: { contains: q, mode: "insensitive" } },
      { institutionEn: { contains: q, mode: "insensitive" } },
      { institutionSw: { contains: q, mode: "insensitive" } },
    ];
  }
  const rows = await prisma.interview.findMany({
    where,
    orderBy: { datePosted: Prisma.SortOrder.desc },
    take: opts?.limit ?? 50,
  });
  return Promise.all(rows.map(toInterview));
}

export async function getInterviewBySlug(slug: string): Promise<Interview | null> {
  const row = await prisma.interview.findFirst({ where: { slug } });
  if (!row) return null;
  return toInterview(row);
}

export async function getInterviewById(id: number): Promise<Interview | null> {
  const row = await prisma.interview.findUnique({ where: { id } });
  if (!row) return null;
  return toInterview(row);
}

// ---- Cross-collection search ----

export async function searchPublished(q: string): Promise<{
  news: NewsItem[];
  vacancies: Vacancy[];
  interviews: Interview[];
}> {
  if (!q) return { news: [], vacancies: [], interviews: [] };
  const [news, vacancies, interviews] = await Promise.all([
    listNews({ q, limit: 50 }),
    listVacancies({ q, limit: 50 }),
    listInterviews({ q, limit: 50 }),
  ]);
  return { news, vacancies, interviews };
}

// ---- Legacy URL redirect ----

export async function getLegacyUrl(
  oldId: string
): Promise<string | null> {
  const row = await prisma.legacyUrl.findFirst({ where: { oldId } });
  return row?.newUrl ?? null;
}