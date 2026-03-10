"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface TableControlsOptions<T> {
  data: T[];
  defaultSort?: SortConfig;
  searchableFields?: (keyof T)[];
  filterConfigs?: {
    key: keyof T;
    allValue: string;
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTableControls<T extends Record<string, any>>({
  data,
  defaultSort,
  searchableFields = [],
  filterConfigs = [],
}: TableControlsOptions<T>) {
  const [sort, setSort] = useState<SortConfig | null>(defaultSort ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const fc of filterConfigs) {
      initial[fc.key as string] = fc.allValue;
    }
    return initial;
  });

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc"
          ? { key, direction: "desc" }
          : null;
      }
      return { key, direction: "asc" };
    });
  }

  function setFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearAll() {
    setSearchQuery("");
    setSort(defaultSort ?? null);
    const initial: Record<string, string> = {};
    for (const fc of filterConfigs) {
      initial[fc.key as string] = fc.allValue;
    }
    setFilters(initial);
  }

  const hasActiveControls = useMemo(() => {
    if (searchQuery.trim()) return true;
    for (const fc of filterConfigs) {
      if (filters[fc.key as string] !== fc.allValue) return true;
    }
    return false;
  }, [searchQuery, filters, filterConfigs]);

  const processedData = useMemo(() => {
    let result = [...data];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) =>
        searchableFields.some((field) => {
          const val = item[field];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    for (const fc of filterConfigs) {
      const filterValue = filters[fc.key as string];
      if (filterValue && filterValue !== fc.allValue) {
        result = result.filter((item) => String(item[fc.key]) === filterValue);
      }
    }

    if (sort) {
      result.sort((a, b) => {
        const aVal = a[sort.key as keyof T];
        const bVal = b[sort.key as keyof T];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let cmp: number;
        if (typeof aVal === "number" && typeof bVal === "number") {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }

        return sort.direction === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchQuery, searchableFields, filters, filterConfigs, sort]);

  return {
    sort,
    toggleSort,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearAll,
    hasActiveControls,
    processedData,
  };
}
