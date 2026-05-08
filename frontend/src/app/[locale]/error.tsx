"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const t = useTranslations("error");

  return (
    <div className="container-main py-16 text-center">
      <h1 className="text-6xl font-bold text-error mb-4">500</h1>
      <h2 className="text-2xl font-semibold mb-4">{t("500_title")}</h2>
      <p className="text-muted mb-8">{t("500_message")}</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors no-underline"
      >
        {t("go_home")}
      </Link>
    </div>
  );
}