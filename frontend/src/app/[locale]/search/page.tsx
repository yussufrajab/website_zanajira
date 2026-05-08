import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations();
  const query = q || "";

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

          {/* Placeholder — will be replaced by Directus search */}
          <div className="text-center py-12">
            <p className="text-muted">
              {locale === "sw"
                ? "Matokeo ya utafutaji yataonekana hapa baada ya kuunganisha na CMS."
                : "Search results will appear here after CMS integration."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}