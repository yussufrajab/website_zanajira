import { NextRequest, NextResponse } from "next/server";
import { getLegacyUrl } from "@/lib/content";

// Legacy URL redirect handler for WordPress /download/XXXX/ paths.
// Maps old WordPress download IDs to the new document URLs stored in the
// `legacy_urls` table. Returns a 301 permanent redirect or 404.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const newUrl = await getLegacyUrl(id);
    if (newUrl) {
      return NextResponse.redirect(newUrl, 301);
    }
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  } catch (error) {
    console.error("Legacy URL redirect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}