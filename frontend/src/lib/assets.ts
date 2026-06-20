// Asset URL resolution. File columns (`featured_image`, `pdf_document`, …)
// store an asset identifier — historically a Directus file UUID, now a UUID
// (or storage key) tracked in the `assets` table and served from
// `public/uploads` (local) or an S3/MinIO public URL.

import { prisma } from "./db";

const UPLOAD_DRIVER = process.env.UPLOAD_DRIVER || "local";
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || "";

/**
 * Resolve a stored asset identifier (UUID) to a publicly-accessible URL.
 *
 * For local storage the asset is served from `/uploads/<storage_key>` (the
 * Next.js `/public` directory). For S3/MinIO it returns the configured public
 * URL. Returns an empty string for falsy/empty input so callers can render
 * conditionally.
 *
 * The lookup is cached per-request via a simple Map to avoid hitting the DB
 * for repeated references (e.g. a list page rendering many PDFs).
 */
const cache = new Map<string, string>();

export async function assetUrl(identifier: string | null | undefined): Promise<string> {
  if (!identifier) return "";

  // If it already looks like a URL or an absolute path, return as-is.
  if (identifier.startsWith("http") || identifier.startsWith("/")) {
    return identifier;
  }

  if (UPLOAD_DRIVER === "s3") {
    const cached = cache.get(identifier);
    if (cached !== undefined) return cached;
    const asset = await prisma.asset.findUnique({ where: { uuid: identifier } });
    const url = asset ? `${S3_PUBLIC_URL}/${asset.storageKey}` : "";
    cache.set(identifier, url);
    return url;
  }

  // Local driver: look up the on-disk storage key (e.g. "<uuid>.pdf").
  const cached = cache.get(identifier);
  if (cached !== undefined) return cached;
  const asset = await prisma.asset.findUnique({ where: { uuid: identifier } });
  const key = asset?.storageKey ?? identifier;
  const url = `/uploads/${key}`;
  cache.set(identifier, url);
  return url;
}

/** Synchronous variant for use in non-async render contexts. Resolves the
 * local-driver URL without a DB lookup; falls back to `/uploads/<id>`. */
export function assetUrlSync(identifier: string | null | undefined): string {
  if (!identifier) return "";
  if (identifier.startsWith("http") || identifier.startsWith("/")) return identifier;
  if (UPLOAD_DRIVER === "s3") return `${S3_PUBLIC_URL}/${identifier}`;
  return `/uploads/${identifier}`;
}