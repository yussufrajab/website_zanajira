import { getTranslations } from "next-intl/server";
import type { Page } from "@/types";
import { getLocalizedField, Locale } from "@/lib/locale";

type Props = {
  page: Page | null;
  locale: Locale;
};

export async function WelcomeSection({ page, locale }: Props) {
  const t = await getTranslations("home");

  const title = page
    ? getLocalizedField(page, "title", locale)
    : t("welcome_title");
  const body = page
    ? getLocalizedField(page, "body", locale)
    : t("welcome_text");

  return (
    <section className="container-main py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
          {title}
        </h2>
        <div
          className="text-muted leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </section>
  );
}