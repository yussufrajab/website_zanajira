import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { newsSchema, parseDate } from "@/lib/admin-schemas";
import { deleteAsset } from "@/lib/storage";

type Props = { params: Promise<{ id: string }> };

// GET /api/admin/news/:id — full item for the edit form.
export async function GET(_request: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await prisma.news.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: row });
}

// PATCH /api/admin/news/:id — update.
export async function PATCH(request: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
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

    const existing = await prisma.news.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Slug uniqueness against other rows.
    if (d.slug !== existing.slug) {
      const clash = await prisma.news.findFirst({ where: { slug: d.slug } });
      if (clash) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
      }
    }

    const updated = await prisma.news.update({
      where: { id: Number(id) },
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

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error) {
    console.error("Update news error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/news/:id — remove the item. Optionally deletes the
// referenced PDF asset (kept simple: only the pdf_document, since the
// featured_image may be shared/reused across rows in edge cases).
export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await prisma.news.findUnique({ where: { id: Number(id) } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.news.delete({ where: { id: Number(id) } });

  if (row.pdfDocument) {
    await deleteAsset(row.pdfDocument).catch(() => {});
  }

  return NextResponse.json({ success: true });
}