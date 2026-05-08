"use client";

import { cn } from "@/lib/utils";

type SelectOption = {
  value: string;
  label: string;
};

type FilterBarProps = {
  filters: {
    name: string;
    label: string;
    options: SelectOption[];
    value: string;
  }[];
  onFilterChange: (name: string, value: string) => void;
  className?: string;
};

export function FilterBar({ filters, onFilterChange, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {filters.map((filter) => (
        <div key={filter.name}>
          <label
            htmlFor={filter.name}
            className="block text-sm font-medium text-muted mb-1"
          >
            {filter.label}
          </label>
          <select
            id={filter.name}
            value={filter.value}
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}