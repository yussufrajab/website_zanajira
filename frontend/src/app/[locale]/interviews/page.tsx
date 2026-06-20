import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { getLocalizedField, Locale } from "@/lib/locale";
import { formatDate } from "@/lib/utils";
import type { Interview } from "@/types";
import { listInterviews } from "@/lib/content";

const interviewTypeLabels: Record<string, { sw: string; en: string }> = {
  written: { sw: "Andishi", en: "Written" },
  face_to_face: { sw: "Ana kwa Ana", en: "Face-to-Face" },
  practical: { sw: "Vitendo", en: "Practical" },
  screening: { sw: "Uchunguzi", en: "Screening" },
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; q?: string }>;
};

export default async function InterviewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const t = await getTranslations();

  let interviews: Interview[] = [];
  try {
    interviews = await listInterviews({ limit: 50 });
  } catch {
    interviews = [];
  }

  if (filters.type) {
    interviews = interviews.filter((i) => i.interview_type === filters.type);
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    interviews = interviews.filter(
      (i) =>
        i.title_en.toLowerCase().includes(q) ||
        i.title_sw.toLowerCase().includes(q) ||
        i.institution_en?.toLowerCase().includes(q) ||
        i.institution_sw?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: t("nav.interviews") }]} />
      <h1 className="text-3xl font-bold text-primary mb-6">
        {t("interviews.title")}
      </h1>

      {/* Filters */}
      <form className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          name="q"
          placeholder={t("interviews.search_interviews")}
          defaultValue={filters.q || ""}
          className="flex-1 min-w-[200px] px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          name="type"
          defaultValue={filters.type || ""}
          className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{t("interviews.all_types")}</option>
          {Object.entries(interviewTypeLabels).map(([key, labels]) => (
            <option key={key} value={key}>
              {locale === "sw" ? labels.sw : labels.en}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          {locale === "sw" ? "Tafuta" : "Search"}
        </button>
      </form>

      {/* Interview List */}
      {interviews.length === 0 ? (
        <p className="text-muted text-center py-8">{t("interviews.no_results")}</p>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => {
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
                    <h2 className="text-lg font-semibold text-foreground">
                      {getLocalizedField(item, "title", loc)}
                    </h2>
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
      )}
    </div>
  );
}