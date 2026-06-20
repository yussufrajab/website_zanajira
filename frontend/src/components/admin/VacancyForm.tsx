"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { FileUpload } from "./FileUpload";
import { useTranslation } from "@/lib/useTranslation";
import { stripHtml, wrapInParagraphs } from "@/lib/translate-html";
import { TranslateButton } from "./TranslateButton";

type Props = {
  id?: number;
};

export function VacancyForm({ id }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [status, setStatus] = useState<"draft" | "published" | "closed">("draft");
  const [titleSw, setTitleSw] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [institutionSw, setInstitutionSw] = useState("");
  const [institutionEn, setInstitutionEn] = useState("");
  const [descriptionSw, setDescriptionSw] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [pdfDocument, setPdfDocument] = useState<string | null>(null);

  // Auto-translation state
  const [titleEnManuallyEdited, setTitleEnManuallyEdited] = useState(false);
  const [institutionEnManuallyEdited, setInstitutionEnManuallyEdited] = useState(false);
  const [descriptionEnManuallyEdited, setDescriptionEnManuallyEdited] = useState(false);
  const initialLoadComplete = useRef(!id);

  // Translation hooks
  const { translatedText: translatedTitle, state: titleState } = useTranslation(titleSw, 800);
  const { translatedText: translatedInstitution, state: institutionState } = useTranslation(institutionSw, 800);
  const { translatedText: translatedDescription, state: descriptionState } = useTranslation(
    descriptionSw ? stripHtml(descriptionSw) : "",
    1000,
  );

  // Sync translations
  useEffect(() => {
    if (translatedTitle && initialLoadComplete.current && !titleEnManuallyEdited) {
      setTitleEn(translatedTitle);
    }
  }, [translatedTitle, titleEnManuallyEdited]);

  useEffect(() => {
    if (translatedInstitution && initialLoadComplete.current && !institutionEnManuallyEdited) {
      setInstitutionEn(translatedInstitution);
    }
  }, [translatedInstitution, institutionEnManuallyEdited]);

  useEffect(() => {
    if (translatedDescription && initialLoadComplete.current && !descriptionEnManuallyEdited) {
      setDescriptionEn(wrapInParagraphs(translatedDescription));
    }
  }, [translatedDescription, descriptionEnManuallyEdited]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/vacancies/${id}`)
      .then((r) => r.json())
      .then((d) => {
        const it = d.item;
        if (!it) return;
        setStatus(it.status);
        setTitleSw(it.titleSw ?? "");
        setTitleEn(it.titleEn ?? "");
        setSlug(it.slug ?? "");
        setInstitutionSw(it.institutionSw ?? "");
        setInstitutionEn(it.institutionEn ?? "");
        setDescriptionSw(it.descriptionSw ?? "");
        setDescriptionEn(it.descriptionEn ?? "");
        setDatePosted(it.datePosted ? it.datePosted.slice(0, 10) : "");
        setDeadlineDate(it.deadlineDate ? it.deadlineDate.slice(0, 10) : "");
        setPdfDocument(it.pdfDocument ?? null);
        initialLoadComplete.current = true;
      })
      .catch(() => {});
  }, [id]);

  // Auto-suggest slug from the English title.
  useEffect(() => {
    if (!slug && titleEn) {
      setSlug(
        titleEn
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 80)
      );
    }
  }, [titleEn, slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (status === "published" && !pdfDocument) {
      setError("A PDF document is required before publishing.");
      setBusy(false);
      return;
    }

    try {
      const payload = {
        status,
        titleSw,
        titleEn,
        slug: slug || titleEn.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80),
        institutionSw,
        institutionEn,
        descriptionSw,
        descriptionEn,
        datePosted: datePosted || null,
        deadlineDate: deadlineDate || null,
        pdfDocument,
      };
      const url = id ? `/api/admin/vacancies/${id}` : "/api/admin/vacancies";
      const method = id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const specificIssue = data.issues?.[0]?.message;
        setError(specificIssue || data.error || "Save failed");
        return;
      }
      router.push("/admin/vacancies");
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  function onBatchTranslated(translations: Record<string, string>) {
    if (translations.titleSwEn) {
      setTitleEn(translations.titleSwEn);
      setTitleEnManuallyEdited(true);
    }
    if (translations.institutionSwEn) {
      setInstitutionEn(translations.institutionSwEn);
      setInstitutionEnManuallyEdited(true);
    }
    if (translations.descriptionSwEn) {
      setDescriptionEn(wrapInParagraphs(translations.descriptionSwEn));
      setDescriptionEnManuallyEdited(true);
    }
  }

  async function remove() {
    if (!id) return;
    if (!confirm("Delete this vacancy? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/vacancies/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/vacancies");
    else setError("Delete failed");
  }

  const inputCls =
    "w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {id ? "Edit vacancy" : "New vacancy"}
        </h1>
        <p className="text-sm text-muted mt-1">
          {id ? "Update the vacancy details below" : "Fill in the details for the new vacancy"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        {/* Titles */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Titles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Title (Swahili)</label>
              <input value={titleSw} onChange={(e) => setTitleSw(e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Title (English)
                {titleState === "translating" && (
                  <span className="ml-2 text-xs text-amber-600">translating…</span>
                )}
              </label>
              <input
                value={titleEn}
                onChange={(e) => {
                  setTitleEn(e.target.value);
                  setTitleEnManuallyEdited(true);
                }}
                className={inputCls}
                placeholder="Auto-translated from Swahili"
              />
              {titleState === "error" && (
                <p className="text-xs text-error mt-1">Translation unavailable — you can type English manually</p>
              )}
            </div>
          </div>
        </div>

        {/* Institution */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Institution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Institution (Swahili)</label>
              <input value={institutionSw} onChange={(e) => setInstitutionSw(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Institution (English)
                {institutionState === "translating" && (
                  <span className="ml-2 text-xs text-amber-600">translating…</span>
                )}
              </label>
              <input
                value={institutionEn}
                onChange={(e) => {
                  setInstitutionEn(e.target.value);
                  setInstitutionEnManuallyEdited(true);
                }}
                className={inputCls}
                placeholder="Auto-translated from Swahili"
              />
              {institutionState === "error" && (
                <p className="text-xs text-error mt-1">Translation unavailable — you can type English manually</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Description</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description (Swahili)</label>
              <RichTextEditor value={descriptionSw} onChange={setDescriptionSw} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description (English)
                {descriptionState === "translating" && (
                  <span className="ml-2 text-xs text-amber-600">translating…</span>
                )}
              </label>
              <RichTextEditor
                value={descriptionEn}
                onChange={(html) => {
                  setDescriptionEn(html);
                  setDescriptionEnManuallyEdited(true);
                }}
              />
              {descriptionState === "error" && (
                <p className="text-xs text-error mt-1">Translation unavailable — you can type English manually</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Translate */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">AI Translation</h2>
          <p className="text-sm text-muted mb-4">
            After filling in the Swahili fields above, click below to translate all content to English using AI.
          </p>
          <TranslateButton
            contentType="vacancy"
            swValues={{
              titleSwEn: titleSw || "",
              institutionSwEn: institutionSw || "",
              descriptionSwEn: descriptionSw ? stripHtml(descriptionSw) : "",
            }}
            onTranslated={onBatchTranslated}
          />
        </div>

        {/* Publishing metadata */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Publishing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className={inputCls}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date posted</label>
              <input
                type="date"
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Deadline</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <FileUpload kind="pdf" value={pdfDocument} onChange={setPdfDocument} label="PDF document (required to publish)" />
          </div>
        </div>

        {/* Advanced options (collapsible) */}
        <div className="bg-white rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-4 text-sm font-medium text-foreground hover:bg-gray-50 rounded-xl transition-colors"
          >
            <span>More options</span>
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </button>
          {showAdvanced && (
            <div className="px-6 pb-6 space-y-6 border-t border-border pt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputCls}
                  pattern="[a-z0-9-]+"
                  placeholder="Auto-generated from English title"
                />
                <p className="text-xs text-muted mt-1">Auto-generated from English title if left empty</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm"
            >
              {busy ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Save
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/vacancies")}
              className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
          {id && (
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-error hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
