import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/admin/news-categories — categories for the admin news form.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.newsCategory.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ items: rows });
}