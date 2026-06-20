"use client";

import { useState } from "react";

type Props = {
  contentType: "news" | "vacancy" | "interview";
  /** All Swahili field values keyed by their field name (e.g. { titleSw, bodySw }) */
  swValues: Record<string, string>;
  /** Called with translated values keyed by the same field names */
  onTranslated: (translations: Record<string, string>) => void;
  className?: string;
};

export function TranslateButton({
  contentType,
  swValues,
  onTranslated,
  className = "",
}: Props) {
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTranslate() {
    setTranslating(true);
    setError(null);

    try {
      const res = await fetch("/api/translate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          fields: swValues,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Translation failed");
      }

      if (data.translations && Object.keys(data.translations).length > 0) {
        onTranslated(data.translations);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Translation failed. Please try again.",
      );
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleTranslate}
        disabled={translating}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
      >
        {translating ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Translating with AI…
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
              />
            </svg>
            Translate to English (AI)
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
