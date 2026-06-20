import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { getLocalizedField, Locale } from "@/lib/locale";
import { formatDate } from "@/lib/utils";
import type { Vacancy } from "@/types";
import { getVacancyBySlug } from "@/lib/content";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function VacancyDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const t = await getTranslations();

  let vacancy: Vacancy | null = null;
  try {
    vacancy = await getVacancyBySlug(slug);
  } catch {
    vacancy = null;
  }

  if (!vacancy) {
    notFound();
  }

  const title = getLocalizedField(vacancy, "title", loc);
  const institution = getLocalizedField(vacancy, "institution", loc);
  const description = getLocalizedField(vacancy, "description", loc);

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.vacancies"), href: "/vacancies" },
          { label: title },
        ]}
      />
      <article className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant={vacancy.status === "closed" ? "error" : "success"}>
            {vacancy.status === "closed"
              ? t("vacancies.status_closed")
              : t("vacancies.status_open")}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {title}
        </h1>
        <div className="text-sm text-muted mb-6 space-y-1">
          <p>
            <strong>{locale === "sw" ? "Taasisi:" : "Institution:"}</strong>{" "}
            {institution}
          </p>
          <p>
            <strong>{locale === "sw" ? "Tarehe:" : "Date:"}</strong>{" "}
            {formatDate(vacancy.date_posted, loc)}
          </p>
          {vacancy.deadline_date && (
            <p>
              <strong>{t("vacancies.deadline")}:</strong>{" "}
              {formatDate(vacancy.deadline_date, loc)}
            </p>
          )}
        </div>
        {description && (
          <div
            className="prose prose-lg max-w-none [&_h2]:text-primary [&_h2]:font-bold"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {vacancy.pdf_document && (
          <div className="mt-8 p-4 bg-primary/10 rounded-lg">
            <a
              href={vacancy.pdf_document}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark no-underline"
            >
              <svg
                width="20"
                height="20"
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
              </svg>
              {t("vacancies.download_pdf")}
            </a>
          </div>
        )}
      </article>
    </div>
  );
}