import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { getLocalizedField, Locale } from "@/lib/locale";
import type { Vacancy } from "@/types";

type Props = {
  items: Vacancy[];
  locale: Locale;
};

export async function VacancySummary({ items, locale }: Props) {
  const t = await getTranslations("home");

  return (
    <section className="container-main py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">
          {t("vacancy_announcements")}
        </h2>
        <a
          href={`/${locale}/vacancies`}
          className="text-primary hover:underline text-sm font-medium"
        >
          {t("view_all_vacancies")} →
        </a>
      </div>

      {items.length === 0 ? (
        <p className="text-muted">
          {locale === "sw"
            ? "Hakuna nafasi za kazi kwa sasa."
            : "No vacancies at this time."}
        </p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <Card key={item.id} className="hover:shadow-lg">
              <CardContent className="p-4 flex items-center justify-between">
                <a
                  href={`/${locale}/vacancies/${item.slug}`}
                  className="flex-1 min-w-0 no-underline"
                >
                  <h3 className="font-semibold text-foreground">
                    {getLocalizedField(item, "title", locale)}
                  </h3>
                  <p className="text-sm text-muted">
                    {getLocalizedField(item, "institution", locale)} •{" "}
                    {formatDate(item.date_posted, locale)}
                    {item.deadline_date && (
                      <>
                        {" • "}
                        {locale === "sw" ? "Mwisho wa maombi" : "Deadline"}:{" "}
                        {formatDate(item.deadline_date, locale)}
                      </>
                    )}
                  </p>
                </a>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {item.pdf_document && (
                    <a
                      href={item.pdf_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors no-underline"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      PDF
                    </a>
                  )}
                  <a
                    href={`/${locale}/vacancies/${item.slug}`}
                    className="no-underline"
                  >
                    <Badge
                      variant={item.status === "closed" ? "error" : "success"}
                    >
                      {item.status === "closed"
                        ? locale === "sw"
                          ? "Imefungwa"
                          : "Closed"
                        : locale === "sw"
                          ? "Wazi"
                          : "Open"}
                    </Badge>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}