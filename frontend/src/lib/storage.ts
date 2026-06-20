// File upload storage abstraction. Two drivers:
//   - local: writes to <project>/public/uploads/<storageKey>, served by Next
//   - s3    : writes to the configured S3/MinIO bucket (HTTP client, no SDK)
//
// All uploads are validated for MIME whitelist and size, given a
// server-generated UUID storage key, and recorded in the `assets` table.

import { randomUUID } from "node:crypto";
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { prisma } from "./db";

export interface UploadedAsset {
  uuid: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
}

const UPLOAD_DRIVER = process.env.UPLOAD_DRIVER || "local";
const UPLOAD_LOCAL_DIR = process.env.UPLOAD_LOCAL_DIR || "public/uploads";
const PROJECT_ROOT = resolve(process.cwd());

const MAX_BYTES_BY_KIND: Record<string, number> = {
  pdf: 10 * 1024 * 1024, // 10 MB
  image: 5 * 1024 * 1024, // 5 MB
};

const ALLOWED_MIME: Record<string, string[]> = {
  pdf: ["application/pdf"],
  image: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"],
};

function extForMime(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  if (mime === "image/gif") return "gif";
  return "bin";
}

/** Validate a buffer's declared MIME against the whitelist and enforce size. */
export function validateUpload(
  mime: string,
  size: number,
  kind: "pdf" | "image"
): { ok: true } | { ok: false; error: string } {
  const allowed = ALLOWED_MIME[kind];
  if (!allowed.includes(mime)) {
    return { ok: false, error: `Unsupported file type: ${mime}` };
  }
  const max = MAX_BYTES_BY_KIND[kind];
  if (size > max) {
    return { ok: false, error: `File too large (max ${max} bytes)` };
  }
  return { ok: true };
}

/** Persist an uploaded buffer + record the asset. Returns the asset row. */
export async function saveUpload(
  buffer: Buffer,
  declaredMime: string,
  originalFilename: string,
  kind: "pdf" | "image"
): Promise<UploadedAsset> {
  const v = validateUpload(declaredMime, buffer.length, kind);
  if (!v.ok) throw new Error(v.error);

  const uuid = randomUUID();
  const ext = extForMime(declaredMime);
  const storageKey = `${uuid}.${ext}`;

  if (UPLOAD_DRIVER === "s3") {
    await putS3(storageKey, buffer, declaredMime);
  } else {
    const dir = join(PROJECT_ROOT, UPLOAD_LOCAL_DIR);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, storageKey), buffer);
  }

  await prisma.asset.create({
    data: {
      uuid,
      storageKey,
      filename: originalFilename || storageKey,
      mimeType: declaredMime,
      size: buffer.length,
    },
  });

  return {
    uuid,
    storageKey,
    filename: originalFilename || storageKey,
    mimeType: declaredMime,
    size: buffer.length,
  };
}

/** Delete an asset (file + row) when content referencing it is removed. */
export async function deleteAsset(uuid: string): Promise<void> {
  const asset = await prisma.asset.findUnique({ where: { uuid } });
  if (!asset) return;
  if (UPLOAD_DRIVER === "s3") {
    await deleteS3(asset.storageKey);
  } else {
    const { unlink } = await import("node:fs/promises");
    await unlink(join(PROJECT_ROOT, UPLOAD_LOCAL_DIR, asset.storageKey)).catch(() => {});
  }
  await prisma.asset.delete({ where: { uuid } }).catch(() => {});
}

async function putS3(key: string, buffer: Buffer, mime: string): Promise<void> {
  const endpoint = process.env.S3_ENDPOINT!;
  const bucket = process.env.S3_BUCKET!;
  const accessKey = process.env.S3_ACCESS_KEY!;
  const secretKey = process.env.S3_SECRET_KEY!;
  // Minimal S3 PUT via presigned-free public-bucket write. Many MinIO setups
  // permit PUT with basic auth; fall back to AWS SDK if needed in production.
  const url = `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  const auth = "Basic " + Buffer.from(`${accessKey}:${secretKey}`).toString("base64");
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": mime,
      Authorization: auth,
      "Content-Length": String(buffer.length),
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
}

async function deleteS3(key: string): Promise<void> {
  const endpoint = process.env.S3_ENDPOINT!;
  const bucket = process.env.S3_BUCKET!;
  const accessKey = process.env.S3_ACCESS_KEY!;
  const secretKey = process.env.S3_SECRET_KEY!;
  const url = `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  const auth = "Basic " + Buffer.from(`${accessKey}:${secretKey}`).toString("base64");
  await fetch(url, { method: "DELETE", headers: { Authorization: auth } }).catch(() => {});
}