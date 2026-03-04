/**
 * @file StatsPanel.tsx
 * @description "Stats" tab — overview cards and per-banner detail.
 *
 * Layout:
 *  1. Four summary stat cards (total pulls, 5★ count, active banners, avg/5★)
 *  2. Per-banner cards (ordered by BANNER_DISPLAY_ORDER) showing:
 *     - 5★ pity bar
 *     - 4★ pity bar
 *     - Average pulls per 5★
 *     - Scrollable list of 5★ chips
 */

import { Hash, Star, TrendingUp } from "lucide-react";
import PityBar from "./PityBar";
import type { StatsResponse } from "../types";

/**
 * Display order: featured banners first, standard banners second.
 * Beginner pools (5-7) are excluded — they are one-time pools with
 * a ~20-pull cap and add noise for most players.
 */
const BANNER_DISPLAY_ORDER = ["1", "2", "3", "4"];

interface StatsPanelProps {
  stats: StatsResponse | null;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) {
    return (
      <div className="text-center py-20 text-wuwa-muted">
        No data yet — go to the <span className="text-wuwa-accent">Sync</span>{" "}
        tab to import your pulls.
      </div>
    );
  }

  const allBanners = Object.values(stats);
  const totalPulls = allBanners.reduce((s, b) => s + b.total, 0);
  const totalFive = allBanners.reduce((s, b) => s + b.fiveStars.length, 0);
  const activeBanners = allBanners.filter((b) => b.total > 0).length;

  const avgArr = allBanners.filter((b) => b.avgPity !== null);
  const overallAvg =
    avgArr.length > 0
      ? (
          avgArr.reduce((s, b) => s + (b.avgPity ?? 0), 0) / avgArr.length
        ).toFixed(1)
      : "—";

  const summaryCards = [
    { label: "Total Pulls", value: totalPulls, icon: Hash },
    { label: "5★ Pulled", value: totalFive, icon: Star },
    { label: "Active Banners", value: activeBanners, icon: TrendingUp },
    { label: "Avg per 5★", value: overallAvg, icon: TrendingUp },
  ];

  // Only render the four main banners; ignore any beginner-pool data that
  // may already be stored from a previous sync before they were removed.
  const orderedBanners = BANNER_DISPLAY_ORDER.map((k) => stats[k]).filter(
    Boolean,
  );

  return (
    <div className="space-y-6">
      {/* ── Summary row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-wuwa-card border border-wuwa-border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-wuwa-accent/15">
              <Icon className="w-4 h-4 text-wuwa-accent" />
            </div>
            <div>
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-wuwa-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Per-banner cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orderedBanners.map((banner) => (
          <div
            key={banner.type}
            className="bg-wuwa-card border border-wuwa-border rounded-xl p-5 space-y-4 hover:border-wuwa-accent/40 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{banner.name}</h3>
              <span className="text-xs text-wuwa-muted bg-wuwa-surface px-2 py-0.5 rounded-full border border-wuwa-border">
                {banner.total} pulls
              </span>
            </div>

            {/* Pity bars */}
            <div className="space-y-3">
              <PityBar
                current={banner.pity5}
                max={banner.hard}
                label="5★ Pity"
                color="gold"
              />
              <PityBar
                current={banner.pity4}
                max={10}
                label="4★ Pity"
                color="silver"
              />
            </div>

            {/* Average pulls per 5★ */}
            {banner.avgPity !== null && (
              <p className="text-xs text-wuwa-muted">
                Avg pulls per 5★:{" "}
                <span className="text-wuwa-text font-medium">
                  {banner.avgPity}
                </span>
              </p>
            )}

            {/* 5★ chip list */}
            {banner.fiveStars.length > 0 && (
              <div>
                <p className="text-xs text-wuwa-muted mb-2 uppercase tracking-wide">
                  5★ History
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {banner.fiveStars.map((f, i) => (
                    <span
                      key={i}
                      title={`${f.time} · ${f.resourceType}`}
                      className="text-xs px-2 py-0.5 rounded-full border font-medium text-wuwa-gold border-yellow-500/40 bg-yellow-500/10">
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {banner.total === 0 && (
              <p className="text-xs text-wuwa-muted italic">
                No pulls recorded on this banner.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
