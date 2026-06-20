import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getLocalizedField, Locale } from "@/lib/locale";
import { formatDate } from "@/lib/utils";
import type { NewsItem, NewsCategory } from "@/types";
import { listNews, listNewsCategories } from "@/lib/content";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
};

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const t = await getTranslations();

  let newsItems: NewsItem[] = [];
  let categories: NewsCategory[] = [];

  try {
    categories = await listNewsCategories();
  } catch {
    categories = [];
  }

  try {
    newsItems = await listNews({
      categoryId: filters.category ? Number(filters.category) : undefined,
      limit: 50,
    });
  } catch {
    newsItems = [];
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    newsItems = newsItems.filter(
      (n) =>
        n.title_en.toLowerCase().includes(q) ||
        n.title_sw.toLowerCase().includes(q) ||
        n.excerpt_en?.toLowerCase().includes(q) ||
        n.excerpt_sw?.toLowerCase().includes(q)
    );
  }

  const getCategoryName = (catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? getLocalizedField(cat, "name", loc) : "";
  };

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: t("nav.news") }]} />
      <h1 className="text-3xl font-bold text-primary mb-6">
        {t("news.title")}
      </h1>

      {/* Filters */}
      <form className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          name="q"
          placeholder={locale === "sw" ? "Tafuta habari..." : "Search news..."}
          defaultValue={filters.q || ""}
          className="flex-1 min-w-[200px] px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          name="category"
          defaultValue={filters.category || ""}
          className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">{locale === "sw" ? "Makundi yote" : "All categories"}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {getLocalizedField(cat, "name", loc)}
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

      {/* News List */}
      {newsItems.length === 0 ? (
        <p className="text-muted text-center py-8">{t("news.no_results")}</p>
      ) : (
        <div className="space-y-4">
          {newsItems.map((item) => (
            <a
              key={item.id}
              href={`/${locale}/news/${item.slug}`}
              className="block bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow no-underline"
            >
              <div className="flex items-center gap-2 mb-2">
                {item.category && (
                  <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {getCategoryName(item.category)}
                  </span>
                )}
                <span className="text-xs text-muted">
                  {formatDate(item.date_published, loc)}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {getLocalizedField(item, "title", loc)}
              </h2>
              <p className="text-sm text-muted line-clamp-2">
                {getLocalizedField(item, "excerpt", loc)}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}