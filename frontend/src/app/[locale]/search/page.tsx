import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { getLocalizedField, Locale } from "@/lib/locale";
import { formatDate } from "@/lib/utils";
import type { NewsItem, Vacancy, Interview } from "@/types";
import { searchPublished } from "@/lib/content";

const interviewTypeLabels: Record<string, { sw: string; en: string }> = {
  written: { sw: "Andishi", en: "Written" },
  face_to_face: { sw: "Ana kwa Ana", en: "Face-to-Face" },
  practical: { sw: "Vitendo", en: "Practical" },
  screening: { sw: "Uchunguzi", en: "Screening" },
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const t = await getTranslations();
  const query = q || "";

  let newsResults: NewsItem[] = [];
  let vacancyResults: Vacancy[] = [];
  let interviewResults: Interview[] = [];

  if (query) {
    try {
      const r = await searchPublished(query);
      newsResults = r.news;
      vacancyResults = r.vacancies;
      interviewResults = r.interviews;
    } catch {
      // leave empty
    }
  }

  const hasAnyResults =
    newsResults.length > 0 ||
    vacancyResults.length > 0 ||
    interviewResults.length > 0;

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: t("nav.search") }]} />
      <h1 className="text-3xl font-bold text-primary mb-6">
        {t("search.title")}
      </h1>

      {/* Search Form */}
      <form action={`/${locale}/search`} method="GET" className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={t("search.placeholder")}
            className="flex-1 px-4 py-3 border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            {t("nav.search")}
          </button>
        </div>
      </form>

      {/* Results */}
      {!query ? (
        <p className="text-muted text-center py-8">
          {locale === "sw"
            ? "Tafadhali andika neno la kutafuta."
            : "Please enter a search term."}
        </p>
      ) : (
        <div>
          <p className="text-muted mb-6">
            {t("search.results_for", { query })}
          </p>

          {!hasAnyResults && (
            <p className="text-muted text-center py-8">
              {t("search.no_results", { query })}
            </p>
          )}

          {/* News Results */}
          {newsResults.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">
                {t("search.news_results")}
              </h2>
              <div className="space-y-4">
                {newsResults.map((item) => (
                  <a
                    key={item.id}
                    href={`/${locale}/news/${item.slug}`}
                    className="block bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow no-underline"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted">
                        {formatDate(item.date_published, loc)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {getLocalizedField(item, "title", loc)}
                    </h3>
                    <p className="text-sm text-muted line-clamp-2">
                      {getLocalizedField(item, "excerpt", loc)}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Vacancy Results */}
          {vacancyResults.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">
                {t("search.vacancy_results")}
              </h2>
              <div className="space-y-4">
                {vacancyResults.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <a
                        href={`/${locale}/vacancies/${item.slug}`}
                        className="flex-1 min-w-0 no-underline"
                      >
                        <h3 className="text-lg font-semibold text-foreground">
                          {getLocalizedField(item, "title", loc)}
                        </h3>
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
                            href={item.pdf_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors no-underline"
                          >
                            PDF
                          </a>
                        )}
                        <Badge variant="success">
                          {t("vacancies.status_open")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interview Results */}
          {interviewResults.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">
                {t("search.interview_results")}
              </h2>
              <div className="space-y-4">
                {interviewResults.map((item) => {
                  const typeLabel = interviewTypeLabels[item.interview_type];
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <a
                          href={`/${locale}/interviews/${item.slug}`}
                          className="flex-1 min-w-0 no-underline"
                        >
                          <h3 className="text-lg font-semibold text-foreground">
                            {getLocalizedField(item, "title", loc)}
                          </h3>
                          <p className="text-sm text-muted">
                            {getLocalizedField(item, "institution", loc)} &bull;{" "}
                            {formatDate(item.date_posted, loc)}
                          </p>
                        </a>
                        <div className="flex items-center gap-3 shrink-0">
                          {item.pdf_document && (
                            <a
                              href={item.pdf_document}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors no-underline"
                            >
                              PDF
                            </a>
                          )}
                          {typeLabel && (
                            <Badge variant="default">
                              {locale === "sw" ? typeLabel.sw : typeLabel.en}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}