"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type TranslationState = "idle" | "translating" | "error";

/**
 * A hook that takes sourceText (Swahili) and auto-translates it to English.
 * Debounces API calls to avoid excessive requests while typing.
 *
 * @param sourceText - The Swahili text to translate
 * @param debounceMs - Milliseconds to wait before triggering translation (default 800)
 * @returns { translatedText, state, retry }
 */
export function useTranslation(sourceText: string, debounceMs = 800) {
  const [translatedText, setTranslatedText] = useState("");
  const [state, setState] = useState<TranslationState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSourceRef = useRef("");

  const translate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setTranslatedText("");
      setState("idle");
      return;
    }

    setState("translating");
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setTranslatedText(data.translatedText || "");
      setState("idle");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (sourceText === lastSourceRef.current) return;
    lastSourceRef.current = sourceText;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!sourceText.trim()) {
      setTranslatedText("");
      setState("idle");
      return;
    }

    timerRef.current = setTimeout(() => {
      translate(sourceText);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [sourceText, debounceMs, translate]);

  const retry = useCallback(() => {
    if (sourceText.trim()) {
      translate(sourceText);
    }
  }, [sourceText, translate]);

  return { translatedText, state, retry };
}
