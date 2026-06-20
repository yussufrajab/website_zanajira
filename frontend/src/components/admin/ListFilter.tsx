"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useRef, useCallback } from "react";

type StatusOption = {
  value: string;
  label: string;
};

type Props = {
  placeholder?: string;
  statusOptions: StatusOption[];
};

export function ListFilter({ placeholder = "Search…", statusOptions }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "";

  const setSearchParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.replace(`${pathname}?${next.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchParam("q", value);
      }, 300);
    },
    [setSearchParam]
  );

  function clearAll() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.replace(pathname);
  }

  const hasFilters = currentQ || currentStatus;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          defaultValue={currentQ}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
        />
      </div>

      {/* Status filter */}
      <select
        value={currentStatus}
        onChange={(e) => {
          const next = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            next.set("status", e.target.value);
          } else {
            next.delete("status");
          }
          router.replace(`${pathname}?${next.toString()}`);
        }}
        className="px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
      >
        <option value="">All statuses</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear button */}
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
