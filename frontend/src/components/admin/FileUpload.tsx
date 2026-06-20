"use client";

import { useState, useRef } from "react";

type Props = {
  kind: "pdf" | "image";
  value: string | null | undefined;
  onChange: (assetUuid: string | null) => void;
  label?: string;
};

// File upload widget. POSTs multipart to /api/admin/upload and stores the
// returned asset UUID in the parent form state. Renders a download/preview
// link when an asset UUID is set.
export function FileUpload({ kind, value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.asset.uuid);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const accept = kind === "pdf" ? "application/pdf" : "image/*";

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm border border-border rounded-lg text-muted hover:text-foreground hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          {busy ? "Uploading…" : value ? "Replace" : "Upload"}
        </button>
        {value && (
          <>
            <a
              href={`/uploads/${value}.${kind === "pdf" ? "pdf" : "img"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
            >
              View current
            </a>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-sm text-error hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              Remove
            </button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
      {value && (
        <p className="text-xs text-muted break-all">Asset ID: {value}</p>
      )}
    </div>
  );
}