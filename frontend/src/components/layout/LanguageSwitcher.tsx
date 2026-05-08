"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";
import { routing } from "@/lib/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = () => {
    const nextLocale = locale === "sw" ? "en" : "sw";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={handleSwitch}
      className="px-3 py-1 text-sm font-medium border border-white/30 rounded hover:bg-white/10 transition-colors"
    >
      {locale === "sw" ? "English" : "Kiswahili"}
    </button>
  );
}