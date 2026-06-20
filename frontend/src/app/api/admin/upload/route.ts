import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = (formData.get("kind") as string) || "pdf";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (kind !== "pdf" && kind !== "image") {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await saveUpload(buffer, file.type, file.name, kind);

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}