import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { interviewSchema, parseDate } from "@/lib/admin-schemas";
import { deleteAsset } from "@/lib/storage";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await prisma.interview.findUnique({ where: { id: Number(id) } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: row });
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = interviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const d = parsed.data;

    const existing = await prisma.interview.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (d.slug !== existing.slug) {
      const clash = await prisma.interview.findFirst({ where: { slug: d.slug } });
      if (clash) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
      }
    }

    const updated = await prisma.interview.update({
      where: { id: Number(id) },
      data: {
        status: d.status,
        titleSw: d.titleSw,
        titleEn: d.titleEn,
        slug: d.slug,
        interviewType: d.interviewType,
        institutionSw: d.institutionSw || null,
        institutionEn: d.institutionEn || null,
        descriptionSw: sanitizeHtml(d.descriptionSw),
        descriptionEn: sanitizeHtml(d.descriptionEn),
        datePosted: parseDate(d.datePosted) ?? existing.datePosted ?? new Date(),
        pdfDocument: d.pdfDocument || null,
      },
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error) {
    console.error("Update interview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const row = await prisma.interview.findUnique({ where: { id: Number(id) } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.interview.delete({ where: { id: Number(id) } });
  if (row.pdfDocument) {
    await deleteAsset(row.pdfDocument).catch(() => {});
  }
  return NextResponse.json({ success: true });
}