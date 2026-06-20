import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, generateExcerpt } from "@/lib/utils";
import { getLocalizedField, Locale } from "@/lib/locale";
import type { NewsItem, NewsCategory } from "@/types";

type Props = {
  items: NewsItem[];
  categories: NewsCategory[];
  locale: Locale;
};

export async function NewsSummary({ items, categories, locale }: Props) {
  const t = await getTranslations("home");

  const getCategory = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId);
  };

  return (
    <section className="bg-surface py-12">
      <div className="container-main">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">
            {t("latest_news")}
          </h2>
          <a
            href={`/${locale}/news`}
            className="text-primary hover:underline text-sm font-medium"
          >
            {t("view_all_news")} →
          </a>
        </div>

        {items.length === 0 ? (
          <p className="text-muted">{locale === "sw" ? "Hakuna habari kwa sasa." : "No news at this time."}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.slice(0, 6).map((item) => {
              const category = getCategory(item.category);
              return (
                <a
                  key={item.id}
                  href={`/${locale}/news/${item.slug}`}
                  className="no-underline"
                >
                  <Card className="h-full hover:shadow-lg cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {category && (
                          <Badge>
                            {getLocalizedField(category, "name", locale)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted">
                          {formatDate(item.date_published, locale)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                        {getLocalizedField(item, "title", locale)}
                      </h3>
                      <p className="text-sm text-muted line-clamp-3">
                        {getLocalizedField(item, "excerpt", locale) ||
                          generateExcerpt(
                            getLocalizedField(item, "body", locale)
                          )}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}