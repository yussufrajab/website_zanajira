import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";

export default async function NotFound() {
  const t = await getTranslations("error");

  return (
    <div className="container-main py-16 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">{t("404_title")}</h2>
      <p className="text-muted mb-8">{t("404_message")}</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors no-underline"
      >
        {t("go_home")}
      </Link>
    </div>
  );
}