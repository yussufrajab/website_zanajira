import { NextRequest, NextResponse } from "next/server";

// Legacy URL redirect handler for WordPress /download/XXXX/ paths
// Maps old WordPress download IDs to new MinIO document URLs

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_API_TOKEN || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Look up legacy URL mapping in Directus
    const response = await fetch(
      `${DIRECTUS_URL}/items/legacy_urls?filter[old_id][_eq]=${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Directus lookup failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const newUrl = data.data[0].new_url;
      return NextResponse.redirect(newUrl, 301);
    }

    // No mapping found — return 404
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Legacy URL redirect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}