import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { fetchItems } from "@/lib/directus";
import { getLocalizedField, Locale } from "@/lib/directus";
import { formatDate } from "@/lib/utils";
import type { Interview } from "@/types";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

const interviewTypeLabels: Record<string, { sw: string; en: string }> = {
  written: { sw: "Andishi", en: "Written" },
  face_to_face: { sw: "Ana kwa Ana", en: "Face-to-Face" },
  practical: { sw: "Vitendo", en: "Practical" },
  screening: { sw: "Uchunguzi", en: "Screening" },
};

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function InterviewDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const t = await getTranslations();

  let interview: Interview | null = null;
  try {
    const items = await fetchItems("interviews", {
      filter: { slug: { _eq: slug } },
      limit: 1,
    }) as Interview[];
    interview = items.length > 0 ? items[0] : null;
  } catch {
    interview = null;
  }

  if (!interview) {
    notFound();
  }

  const title = getLocalizedField(interview, "title", loc);
  const description = getLocalizedField(interview, "description", loc);
  const institution = getLocalizedField(interview, "institution", loc);
  const typeLabel = interviewTypeLabels[interview.interview_type];

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.interviews"), href: "/interviews" },
          { label: title },
        ]}
      />
      <article className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          {typeLabel && (
            <Badge variant="default">
              {locale === "sw" ? typeLabel.sw : typeLabel.en}
            </Badge>
          )}
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
            {formatDate(interview.date_posted, loc)}
          </p>
        </div>
        <div
          className="prose prose-lg max-w-none [&_h2]:text-primary [&_h2]:font-bold"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {interview.pdf_document && (
          <div className="mt-8 p-4 bg-primary/10 rounded-lg">
            <a
              href={`${DIRECTUS_URL}/assets/${interview.pdf_document}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark no-underline"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {t("interviews.download_pdf")}
            </a>
          </div>
        )}
      </article>
    </div>
  );
}