import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { fetchItems } from "@/lib/directus";
import { getLocalizedField, Locale } from "@/lib/directus";
import { formatDate } from "@/lib/utils";
import type { Vacancy } from "@/types";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ institution?: string; status?: string; q?: string; page?: string }>;
};

export default async function VacanciesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const t = await getTranslations();

  let vacancies: Vacancy[] = [];
  try {
    vacancies = await fetchItems("vacancies", {
      filter: { status: { _eq: "published" } },
      sort: ["-date_posted"],
      limit: 50,
    }) as Vacancy[];
  } catch {
    vacancies = [];
  }

  // Apply search filter if provided
  if (filters.q) {
    const q = filters.q.toLowerCase();
    vacancies = vacancies.filter(
      (v) =>
        v.title_en.toLowerCase().includes(q) ||
        v.title_sw.toLowerCase().includes(q) ||
        v.institution_en?.toLowerCase().includes(q) ||
        v.institution_sw?.toLowerCase().includes(q)
    );
  }

  if (filters.status === "closed") {
    vacancies = vacancies.filter((v) => v.status === "closed");
  } else if (filters.status === "open") {
    vacancies = vacancies.filter((v) => v.status === "published");
  }

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: t("nav.vacancies") }]} />
      <h1 className="text-3xl font-bold text-primary mb-6">
        {t("vacancies.title")}
      </h1>

      {/* Filters */}
      <form className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          name="q"
          placeholder={t("vacancies.search_vacancies")}
          defaultValue={filters.q || ""}
          className="flex-1 min-w-[200px] px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          name="status"
          className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          defaultValue={filters.status || ""}
        >
          <option value="">{t("vacancies.all_statuses")}</option>
          <option value="open">{t("vacancies.status_open")}</option>
          <option value="closed">{t("vacancies.status_closed")}</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          {locale === "sw" ? "Tafuta" : "Search"}
        </button>
      </form>

      {/* Vacancy List */}
      {vacancies.length === 0 ? (
        <p className="text-muted text-center py-8">{t("vacancies.no_results")}</p>
      ) : (
        <div className="space-y-4">
          {vacancies.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <a
                  href={`/${locale}/vacancies/${item.slug}`}
                  className="flex-1 min-w-0 no-underline"
                >
                  <h2 className="text-lg font-semibold text-foreground">
                    {getLocalizedField(item, "title", loc)}
                  </h2>
                  <p className="text-sm text-muted">
                    {getLocalizedField(item, "institution", loc)} &bull;{" "}
                    {formatDate(item.date_posted, loc)}
                  </p>
                  {item.deadline_date && (
                    <p className="text-sm text-muted">
                      {t("vacancies.deadline")}:{" "}
                      {formatDate(item.deadline_date, loc)}
                    </p>
                  )}
                </a>
                <div className="flex items-center gap-3 shrink-0">
                  {item.pdf_document && (
                    <a
                      href={`${DIRECTUS_URL}/assets/${item.pdf_document}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors no-underline"
                    >
                      PDF
                    </a>
                  )}
                  <Badge variant={item.status === "closed" ? "error" : "success"}>
                    {item.status === "closed"
                      ? t("vacancies.status_closed")
                      : t("vacancies.status_open")}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}