import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { getLocalizedField, Locale } from "@/lib/directus";
import type { Interview } from "@/types";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

const interviewTypeLabels: Record<
  string,
  { sw: string; en: string }
> = {
  written: { sw: "Andishi", en: "Written" },
  face_to_face: { sw: "Ana kwa Ana", en: "Face-to-Face" },
  practical: { sw: "Vitendo", en: "Practical" },
  screening: { sw: "Uchunguzi", en: "Screening" },
};

type Props = {
  items: Interview[];
  locale: Locale;
};

export async function InterviewSummary({ items, locale }: Props) {
  const t = await getTranslations("home");

  return (
    <section className="bg-surface py-12">
      <div className="container-main">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">
            {t("call_for_interviews")}
          </h2>
          <a
            href={`/${locale}/interviews`}
            className="text-primary hover:underline text-sm font-medium"
          >
            {t("view_all_interviews")} →
          </a>
        </div>

        {items.length === 0 ? (
          <p className="text-muted">
            {locale === "sw"
              ? "Hakuna mwaliko wa usaili kwa sasa."
              : "No interview calls at this time."}
          </p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => {
              const typeLabel = interviewTypeLabels[item.interview_type];
              return (
                <Card key={item.id} className="hover:shadow-lg">
                  <CardContent className="p-4 flex items-center justify-between">
                    <a
                      href={`/${locale}/interviews/${item.slug}`}
                      className="flex-1 min-w-0 no-underline"
                    >
                      <h3 className="font-semibold text-foreground">
                        {getLocalizedField(item, "title", locale)}
                      </h3>
                      <p className="text-sm text-muted">
                        {getLocalizedField(item, "institution", locale)} •{" "}
                        {formatDate(item.date_posted, locale)}
                      </p>
                    </a>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {item.pdf_document && (
                        <a
                          href={`${DIRECTUS_URL}/assets/${item.pdf_document}`}
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
                        href={`/${locale}/interviews/${item.slug}`}
                        className="no-underline"
                      >
                        <Badge variant="default">
                          {typeLabel ? typeLabel[locale] : item.interview_type}
                        </Badge>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}