import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { interviewSchema, parseDate } from "@/lib/admin-schemas";

// GET /api/admin/interviews — list all interviews for the admin table.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.interview.findMany({ orderBy: { datePosted: "desc" } });
  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      status: r.status,
      titleEn: r.titleEn,
      titleSw: r.titleSw,
      slug: r.slug,
      institutionEn: r.institutionEn,
      institutionSw: r.institutionSw,
      interviewType: r.interviewType,
      datePosted: r.datePosted,
    })),
  });
}

// POST /api/admin/interviews — create.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

    const existing = await prisma.interview.findFirst({ where: { slug: d.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }

    const created = await prisma.interview.create({
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
        datePosted: parseDate(d.datePosted) ?? new Date(),
        pdfDocument: d.pdfDocument || null,
      },
    });

    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Create interview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}