import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date, locale: "sw" | "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "sw" ? "sw-TZ" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateExcerpt(text: string, maxLength: number = 150): string {
  if (!text) return "";
  const stripped = text.replace(/<[^>]*>/g, "").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function matchesSearch(text: string | null | undefined, query: string): boolean {
  if (!text) return false;
  return stripHtml(text).toLowerCase().includes(query);
}