import { createDirectus, rest, staticToken, readItem, readItems } from "@directus/sdk";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_API_TOKEN || "";

// Public URL for client-side asset links (PDFs, images served via nginx proxy)
export const PUBLIC_DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "https://usajili.work.gd";

export const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

export type Locale = "sw" | "en";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedField(
  item: any,
  field: string,
  locale: Locale
): string {
  const localizedValue = item[`${field}_${locale}`] as string | undefined;
  if (localizedValue) return localizedValue;
  const fallbackLocale: Locale = locale === "sw" ? "en" : "sw";
  return (item[`${field}_${fallbackLocale}`] as string) || "";
}

export async function fetchItem(collection: string, id: number) {
  return directus.request(readItem(collection, id));
}

export async function fetchItems(
  collection: string,
  query?: Record<string, unknown>
) {
  return directus.request(readItems(collection, query));
}