import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { newsSchema, parseDate } from "@/lib/admin-schemas";

// GET /api/admin/news — list all news (any status) for the admin table.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.news.findMany({
    include: { category: true },
    orderBy: { datePublished: "desc" },
  });

  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      status: r.status,
      titleEn: r.titleEn,
      titleSw: r.titleSw,
      slug: r.slug,
      category: r.category
        ? { id: r.category.id, nameEn: r.category.nameEn, nameSw: r.category.nameSw }
        : null,
      datePublished: r.datePublished,
    })),
  });
}

// POST /api/admin/news — create a news item.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = newsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const d = parsed.data;

    // Enforce slug uniqueness.
    const existing = await prisma.news.findFirst({ where: { slug: d.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }

    const created = await prisma.news.create({
      data: {
        status: d.status,
        titleSw: d.titleSw,
        titleEn: d.titleEn,
        slug: d.slug,
        excerptSw: d.excerptSw || null,
        excerptEn: d.excerptEn || null,
        bodySw: sanitizeHtml(d.bodySw),
        bodyEn: sanitizeHtml(d.bodyEn),
        categoryId: d.categoryId ?? null,
        datePublished: parseDate(d.datePublished),
        featuredImage: d.featuredImage || null,
        pdfDocument: d.pdfDocument || null,
      },
    });

    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Create news error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}