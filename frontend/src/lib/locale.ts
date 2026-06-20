// Locale + bilingual field helpers, decoupled from any backend SDK.
// Public pages import `Locale` and `getLocalizedField` from here.

export type Locale = "sw" | "en";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedField(
  item: any,
  field: string,
  locale: Locale
): string {
  const localizedValue = item?.[`${field}_${locale}`] as string | undefined;
  if (localizedValue) return localizedValue;
  const fallbackLocale: Locale = locale === "sw" ? "en" : "sw";
  return (item?.[`${field}_${fallbackLocale}`] as string) || "";
}