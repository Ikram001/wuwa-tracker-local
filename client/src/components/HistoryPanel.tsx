/**
 * @file HistoryPanel.tsx
 * @description "History" tab — paginated, searchable, filterable pull log.
 *
 * ### Filter logic
 * All comparisons use Number() coercion on both sides so string/number
 * mismatches in stored data never silently break filtering.
 *
 * Filters:
 *  - Free-text search on item name (case-insensitive, trims whitespace)
 *  - Quality star filter: All / 5★ / 4★ / 3★
 *  - Banner dropdown: All Banners or one of the four main pools
 *
 * Each filter change resets pagination to page 1.
 * Pagination: 50 rows per page with «←→» navigation.
 * CSV export: GET /api/export/csv browser download.
 */

import { useState, useMemo } from "react";
import { Download, Search, X } from "lucide-react";
import { downloadCsv } from "../api";
import type { Pull } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

/**
 * Kuro API cardPoolType ID → short display name.
 * Only the four main pools; beginner pools (5-7) excluded.
 */
const BANNER_SHORT: Record<string, string> = {
  "1": "Feat. Resonator",
  "2": "Feat. Weapon",
  "3": "Std. Resonator",
  "4": "Std. Weapon",
};

const QUALITY_ROW_CLASS: Record<number, string> = {
  5: "bg-yellow-500/10 border-l-2 border-yellow-500",
  4: "bg-purple-500/10 border-l-2 border-purple-500",
  3: "border-l-2 border-transparent",
};

const QUALITY_STARS: Record<number, string> = {
  5: "★★★★★",
  4: "★★★★",
  3: "★★★",
};

const QUALITY_TEXT_CLASS: Record<number, string> = {
  5: "text-xs font-bold text-wuwa-gold",
  4: "text-xs font-bold text-wuwa-silver",
  3: "text-xs text-wuwa-muted",
};

/** Valid values for the star-quality filter. */
type QualityFilter = "all" | "3" | "4" | "5";

// ─── Component ────────────────────────────────────────────────────────────────

interface HistoryPanelProps {
  pulls: Pull[];
}

export default function HistoryPanel({ pulls }: HistoryPanelProps) {
  // ── Filter state — all explicitly typed to avoid literal narrowing ────────
  const [search, setSearch] = useState<string>("");
  const [quality, setQuality] = useState<QualityFilter>("all");
  const [banner, setBanner] = useState<string>("all");
  const [page, setPage] = useState<number>(1);

  // ── Filter change helpers — always reset page to 1 ───────────────────────
  const changeSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const changeQuality = (v: QualityFilter) => {
    setQuality(v);
    setPage(1);
  };
  const changeBanner = (v: string) => {
    setBanner(v);
    setPage(1);
  };
  const clearAll = () => {
    setSearch("");
    setQuality("all");
    setBanner("all");
    setPage(1);
  };

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo<Pull[]>(() => {
    let list = pulls.filter((p) => p.cardPoolType in BANNER_SHORT);

    // Banner filter
    if (banner !== "all") {
      list = list.filter((p) => String(p.cardPoolType) === String(banner));
    }

    // Quality filter
    // Use Number() on BOTH sides to guard against qualityLevel being stored
    // as a string in older JSON files (e.g. "5" instead of 5).
    if (quality !== "all") {
      const target = Number(quality);
      list = list.filter((p) => Number(p.qualityLevel) === target);
    }

    // Name search
    const needle = search.trim().toLowerCase();
    if (needle !== "") {
      list = list.filter((p) => p.name.toLowerCase().includes(needle));
    }

    // Sort newest → oldest
    return [...list].sort((a, b) => b.time.localeCompare(a.time));
  }, [pulls, banner, quality, search]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages); // clamp after filter narrows results
  const pageData = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const totalMainPulls = pulls.filter(
    (p) => p.cardPoolType in BANNER_SHORT,
  ).length;
  const activeFilterCount = [
    search.trim() !== "",
    quality !== "all",
    banner !== "all",
  ].filter(Boolean).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Name search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wuwa-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full bg-wuwa-card border border-wuwa-border rounded-lg pl-9 pr-8 py-2 text-sm placeholder-wuwa-muted focus:outline-none focus:border-wuwa-accent transition-colors"
          />
          {search !== "" && (
            <button
              onClick={() => changeSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-wuwa-muted hover:text-wuwa-text transition-colors"
              title="Clear search">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quality star buttons */}
        <div className="flex gap-1">
          {(["all", "5", "4", "3"] as const).map((q) => (
            <button
              key={q}
              onClick={() => changeQuality(q)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                quality === q
                  ? "bg-wuwa-accent text-white shadow shadow-wuwa-accent/30"
                  : "bg-wuwa-card border border-wuwa-border text-wuwa-muted hover:text-wuwa-text hover:border-wuwa-accent/50"
              }`}>
              {q === "all" ? "All ★" : `${q}★`}
            </button>
          ))}
        </div>

        {/* Banner dropdown */}
        <select
          value={banner}
          onChange={(e) => changeBanner(e.target.value)}
          className="bg-wuwa-card border border-wuwa-border rounded-lg px-3 py-2 text-sm text-wuwa-text focus:outline-none focus:border-wuwa-accent transition-colors cursor-pointer">
          <option value="all">All Banners</option>
          {Object.entries(BANNER_SHORT).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        {/* Clear all — only when a filter is active */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-wuwa-muted border border-wuwa-border bg-wuwa-card hover:text-red-400 hover:border-red-400/50 transition-all">
            <X className="w-3.5 h-3.5" />
            Clear ({activeFilterCount})
          </button>
        )}

        {/* CSV export */}
        <button
          onClick={downloadCsv}
          className="flex items-center gap-2 px-3 py-1.5 bg-wuwa-card border border-wuwa-border rounded-lg text-sm text-wuwa-muted hover:text-wuwa-text hover:border-wuwa-accent transition-all ml-auto">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Result count */}
      <p className="text-xs text-wuwa-muted">
        {filtered.length === totalMainPulls
          ? `${filtered.length} total pulls`
          : `Showing ${filtered.length} of ${totalMainPulls} pulls`}
      </p>

      {/* ── Table ── */}
      <div className="bg-wuwa-card border border-wuwa-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-wuwa-surface text-wuwa-muted text-xs uppercase tracking-wide">
                {["#", "Name", "Type", "Banner", "Stars", "Time"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-wuwa-border">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-wuwa-muted">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-30" />
                      <span>No pulls match your filters.</span>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-wuwa-accent hover:underline text-xs mt-1">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pageData.map((p, i) => {
                  // Normalise qualityLevel to number for lookups — guards
                  // against any remaining string values in stored JSON.
                  const ql = Number(p.qualityLevel);
                  return (
                    <tr
                      key={p.uid}
                      className={`${QUALITY_ROW_CLASS[ql] ?? ""} hover:bg-wuwa-border/30 transition-colors`}>
                      <td className="px-4 py-2.5 text-wuwa-muted text-xs">
                        {(safePage - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="px-4 py-2.5 font-medium">{p.name}</td>
                      <td className="px-4 py-2.5 text-wuwa-muted">
                        {p.resourceType}
                      </td>
                      <td className="px-4 py-2.5 text-wuwa-muted">
                        {BANNER_SHORT[String(p.cardPoolType)] ?? p.bannerName}
                      </td>
                      <td
                        className={`px-4 py-2.5 ${QUALITY_TEXT_CLASS[ql] ?? "text-xs text-wuwa-muted"}`}>
                        {QUALITY_STARS[ql] ?? `${ql}★`}
                      </td>
                      <td className="px-4 py-2.5 text-wuwa-muted text-xs whitespace-nowrap">
                        {p.time}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-wuwa-surface border-t border-wuwa-border text-sm">
            <span className="text-wuwa-muted text-xs">
              Page {safePage} of {totalPages} · {filtered.length} pulls
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage === 1}
                onClick={() => setPage(1)}
                className="px-2 py-1 rounded bg-wuwa-card border border-wuwa-border text-xs disabled:opacity-30 hover:border-wuwa-accent transition-all">
                «
              </button>
              <button
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-wuwa-card border border-wuwa-border disabled:opacity-30 hover:border-wuwa-accent transition-all">
                ←
              </button>
              <span className="px-3 py-1 text-wuwa-muted text-xs">
                {safePage} / {totalPages}
              </span>
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded bg-wuwa-card border border-wuwa-border disabled:opacity-30 hover:border-wuwa-accent transition-all">
                →
              </button>
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-2 py-1 rounded bg-wuwa-card border border-wuwa-border text-xs disabled:opacity-30 hover:border-wuwa-accent transition-all">
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
