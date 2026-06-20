"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

type Props = {
  total: number;
  page: number;
  perPage: number;
};

export function Pagination({ total, page, perPage }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (p <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(p));
    }
    router.replace(`${pathname}?${next.toString()}`);
  }

  // Build visible page numbers with ellipsis
  const pages: (number | "...")[] = [];
  const range = 2; // pages around current
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - range && i <= page + range)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-4 bg-white rounded-b-xl">
      <p className="text-sm text-muted">
        Showing {(page - 1) * perPage + 1}&ndash;{Math.min(page * perPage, total)} of{" "}
        <strong>{total}</strong>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-foreground hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted text-sm">
              &hellip;
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              className={`min-w-[36px] px-2 py-1.5 text-sm rounded-lg border transition-colors ${
                p === page
                  ? "bg-primary text-white border-primary font-medium"
                  : "border-border text-muted hover:text-foreground hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-foreground hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
