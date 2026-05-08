"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Search, X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export function SearchOverlay({ onClose }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{t("nav.search")}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface rounded"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("nav.search_placeholder")}
            className="flex-1 px-4 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            <Search size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}