import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getLocalizedField, Locale } from "@/lib/locale";
import { formatDate } from "@/lib/utils";
import type { NewsItem, NewsCategory } from "@/types";
import { getNewsBySlug, listNewsCategories } from "@/lib/content";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const t = await getTranslations();

  let article: NewsItem | null = null;
  try {
    article = await getNewsBySlug(slug);
  } catch {
    article = null;
  }

  if (!article) {
    notFound();
  }

  let categories: NewsCategory[] = [];
  try {
    categories = await listNewsCategories();
  } catch {
    categories = [];
  }

  const getCategoryName = (catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? getLocalizedField(cat, "name", loc) : "";
  };

  const title = getLocalizedField(article, "title", loc);
  const body = getLocalizedField(article, "body", loc);

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.news"), href: "/news" },
          { label: title },
        ]}
      />
      <article className="max-w-3xl mx-auto">
        <div className="mb-6">
          {article.category && (
            <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded">
              {getCategoryName(article.category)}
            </span>
          )}
          <span className="text-xs text-muted ml-2">
            {formatDate(article.date_published, loc)}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          {title}
        </h1>
        <div
          className="prose prose-lg max-w-none [&_h2]:text-primary [&_h2]:font-bold"
          dangerouslySetInnerHTML={{ __html: body }}
        />
        {article.pdf_document && (
          <div className="mt-8 p-4 bg-primary/10 rounded-lg">
            <a
              href={article.pdf_document}
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
              {t("news.download_pdf")}
            </a>
          </div>
        )}
      </article>
    </div>
  );
}