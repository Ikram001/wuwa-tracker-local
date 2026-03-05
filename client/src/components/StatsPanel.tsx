/**
 * @file StatsPanel.tsx
 * @description "Stats" tab — dashboard view inspired by tracker card layouts.
 */

import { CalendarClock } from "lucide-react";
import { useState } from "react";
import type { Pull, StatsResponse } from "../types";

/**
 * Display order: featured banners first, standard banners second.
 * Beginner pools (5-7) are excluded — they are one-time pools with
 * a ~20-pull cap and add noise for most players.
 */
const BANNER_DISPLAY_ORDER = ["1", "2", "3", "4"];

const BANNER_TONE: Record<string, string> = {
  "1": "from-rose-500/30 via-red-500/10 to-transparent",
  "2": "from-sky-500/30 via-blue-500/10 to-transparent",
  "3": "from-fuchsia-500/25 via-purple-500/10 to-transparent",
  "4": "from-yellow-500/25 via-amber-500/10 to-transparent",
};

const BANNER_RING: Record<string, string> = {
  "1": "ring-rose-400/25",
  "2": "ring-sky-400/25",
  "3": "ring-fuchsia-400/25",
  "4": "ring-amber-400/25",
};

const BANNER_ICON_BG: Record<string, string> = {
  "1": "bg-rose-500/25 text-rose-200",
  "2": "bg-sky-500/25 text-sky-200",
  "3": "bg-fuchsia-500/25 text-fuchsia-200",
  "4": "bg-amber-500/25 text-amber-200",
};

interface StatsPanelProps {
  stats: StatsResponse | null;
  pulls: Pull[];
}

export default function StatsPanel({ stats, pulls }: StatsPanelProps) {
  if (!stats) {
    return (
      <div className="text-center py-20 text-wuwa-muted">
        No data yet — go to the <span className="text-wuwa-accent">Sync</span>{" "}
        tab to import your pulls.
      </div>
    );
  }

  // Only render the four main banners; ignore any beginner-pool data that
  // may already be stored from a previous sync before they were removed.
  const orderedBanners = BANNER_DISPLAY_ORDER.map((k) => stats[k]).filter(
    Boolean,
  );

  const activeOrdered = orderedBanners.filter((b) => b.total > 0);
  const defaultBanner = activeOrdered[0] ?? orderedBanners[0];
  const [selectedBannerType, setSelectedBannerType] = useState<string>(
    defaultBanner?.type ?? BANNER_DISPLAY_ORDER[0],
  );
  const selectedBanner =
    orderedBanners.find((b) => b.type === selectedBannerType) ?? defaultBanner;

  const sortedMainPullsAsc = [...pulls]
    .filter((p) => BANNER_DISPLAY_ORDER.includes(String(p.cardPoolType)))
    .sort((a, b) => {
      const byTime = a.time.localeCompare(b.time);
      if (byTime !== 0) return byTime;
      return a.uid.localeCompare(b.uid);
    });

  // Pull number at each 5★ (inclusive), calculated from full history per banner.
  const fiveStarPullNoByUid: Record<string, number> = {};
  const pityByBanner: Record<string, number> = {};

  for (const pull of sortedMainPullsAsc) {
    const bannerType = String(pull.cardPoolType);
    const next = (pityByBanner[bannerType] ?? 0) + 1;
    pityByBanner[bannerType] = next;

    if (pull.qualityLevel >= 5) {
      fiveStarPullNoByUid[pull.uid] = next;
      pityByBanner[bannerType] = 0;
    }
  }

  const recentFiveStars = sortedMainPullsAsc
    .filter(
      (p) =>
        p.qualityLevel >= 5 &&
        p.cardPoolType === String(selectedBanner?.type ?? ""),
    )
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 10);

  const fiveLuckPercent =
    selectedBanner?.avgPity === null || selectedBanner?.avgPity === undefined
      ? null
      : Math.max(
          0,
          Math.min(99.9, (1 - Number(selectedBanner.avgPity) / 80) * 100),
        );

  const fourLuckPercent =
    selectedBanner === undefined
      ? null
      : Math.max(0, Math.min(99.9, (1 - selectedBanner.pity4 / 10) * 100));

  const luckLabel = (value: number | null) => {
    if (value === null) return "No data";
    if (value >= 70) return "Top";
    if (value >= 40) return "Middle";
    return "Bottom";
  };

  const selectedBannerPulls = sortedMainPullsAsc.filter(
    (p) => p.cardPoolType === String(selectedBanner?.type ?? ""),
  );
  const selectedTotalPulls = selectedBannerPulls.length;
  const selectedAstrites = selectedTotalPulls * 160;
  const selectedFourPlus = selectedBannerPulls.filter(
    (p) => p.qualityLevel >= 4,
  ).length;
  const selectedFivePlus = selectedBannerPulls.filter(
    (p) => p.qualityLevel >= 5,
  ).length;

  const summaryCards = [
    {
      label: "Total Pulls",
      value: selectedTotalPulls.toLocaleString(),
      valueClass: "text-wuwa-text",
      labelClass: "text-wuwa-text/90",
    },
    {
      label: "Astrites",
      value: selectedAstrites.toLocaleString(),
      valueClass: "text-wuwa-text",
      labelClass: "text-wuwa-text/90",
    },
    {
      label: "4+ Pulls",
      value: selectedFourPlus.toLocaleString(),
      valueClass: "text-wuwa-silver",
      labelClass: "text-wuwa-silver",
    },
    {
      label: "5+ Pulls",
      value: selectedFivePlus.toLocaleString(),
      valueClass: "text-wuwa-gold",
      labelClass: "text-wuwa-gold",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-4">
        <aside className="space-y-4">
          {orderedBanners.map((banner) => (
            <button
              type="button"
              key={banner.type}
              onClick={() => setSelectedBannerType(banner.type)}
              className={`no-lift appearance-none relative w-full text-left overflow-hidden bg-black/65 border rounded-2xl p-4 ring-1 transition-[border-color,box-shadow] duration-200 ${selectedBanner?.type === banner.type ? "border-white/35 ring-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : `border-white/10 ${BANNER_RING[banner.type] ?? "ring-white/10"} hover:border-white/25`}`}>
              <div
                className={`absolute inset-0 bg-gradient-to-br ${BANNER_TONE[banner.type] ?? "from-wuwa-accent/10 to-transparent"}`}
              />
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-3xl font-bold text-wuwa-gold leading-none">
                      {banner.pity5}/{banner.hard}
                    </p>
                    <p className="text-xs text-wuwa-gold/90 font-semibold">
                      5★ Pity
                    </p>
                    <p className="text-3xl font-bold text-wuwa-silver leading-none mt-3">
                      {banner.pity4}/10
                    </p>
                    <p className="text-xs text-wuwa-silver/90 font-semibold">
                      4★ Pity
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${BANNER_ICON_BG[banner.type] ?? "bg-wuwa-accent/20 text-wuwa-text"}`}>
                    {banner.name
                      .split(" ")
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join("")}
                  </div>
                </div>
                <p className="text-2xl font-semibold leading-tight">
                  {banner.name}
                </p>
              </div>
            </button>
          ))}
        </aside>

        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-4">
            <div className="hover-card relative overflow-hidden bg-black/65 border border-white/10 rounded-2xl p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none">
                      {selectedBanner?.name ?? "Stats Overview"}
                    </h2>
                    <p className="text-sm text-wuwa-muted mt-2">
                      Featured Banner
                    </p>
                  </div>
                  <span className="text-xs text-wuwa-muted">
                    wuwatracker.local
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {summaryCards.map(
                    ({ label, value, valueClass, labelClass }) => (
                      <div
                        key={label}
                        className="hover-card rounded-xl bg-black/55 border border-white/10 p-3 min-w-0 overflow-hidden">
                        <div
                          className={`text-xl sm:text-2xl lg:text-3xl font-black leading-none tracking-tight tabular-nums break-all ${valueClass}`}
                          title={value}>
                          {value}
                        </div>
                        <div
                          className={`mt-1 text-sm sm:text-base ${labelClass}`}>
                          {label}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="hover-card bg-black/65 border border-white/10 rounded-2xl p-5">
              <p className="text-wuwa-muted text-sm">5★ Luck</p>
              <p className="text-wuwa-gold text-4xl font-black mt-1">
                {luckLabel(fiveLuckPercent)}
              </p>
              <p className="text-wuwa-gold text-5xl font-black leading-none mt-2">
                {fiveLuckPercent === null
                  ? "--"
                  : `${fiveLuckPercent.toFixed(2)}%`}
              </p>
              <p className="text-sm text-wuwa-muted mt-3">
                {fiveLuckPercent === null
                  ? "Need more pulls for estimate"
                  : `Luckier than ${(100 - fiveLuckPercent).toFixed(2)}% of players`}
              </p>
            </div>

            <div className="hover-card bg-black/65 border border-white/10 rounded-2xl p-5">
              <p className="text-wuwa-muted text-sm">4★ Luck</p>
              <p className="text-wuwa-silver text-4xl font-black mt-1">
                {luckLabel(fourLuckPercent)}
              </p>
              <p className="text-wuwa-silver text-5xl font-black leading-none mt-2">
                {fourLuckPercent === null
                  ? "--"
                  : `${fourLuckPercent.toFixed(2)}%`}
              </p>
              <p className="text-sm text-wuwa-muted mt-3">
                {fourLuckPercent === null
                  ? "Need more pulls for estimate"
                  : `Luckier than ${(100 - fourLuckPercent).toFixed(2)}% of players`}
              </p>
            </div>
          </div>

          <div className="hover-card bg-black/65 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-3xl font-black tracking-tight">
                Recent 5★ Convenes
              </h3>
              <span className="text-xs text-wuwa-muted">Latest 10</span>
            </div>

            {recentFiveStars.length === 0 ? (
              <p className="text-sm text-wuwa-muted">
                No 5★ history yet. Sync your pulls to populate this section.
              </p>
            ) : (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {recentFiveStars.map((pull) => (
                  <div
                    key={pull.uid}
                    className="shrink-0 text-center transition-transform duration-200 hover:-translate-y-1">
                    {(() => {
                      const pullNo = fiveStarPullNoByUid[pull.uid] ?? null;
                      const badgeClass =
                        pullNo === null
                          ? "bg-wuwa-muted text-wuwa-text border-wuwa-border"
                          : pullNo <= 30
                            ? "bg-green-600 text-white border-green-300/30"
                            : pullNo <= 50
                              ? "bg-yellow-500 text-black border-yellow-200/30"
                              : "bg-red-600 text-white border-red-300/30";

                      return (
                        <div className="relative w-16 h-16 rounded-full border border-white/10 bg-black/45 flex items-center justify-center text-xs font-semibold px-1 text-center leading-tight">
                          {pull.name
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join("")}
                          <span
                            className={`absolute -right-1 -bottom-1 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center border shadow ${badgeClass}`}>
                            {pullNo ?? "-"}
                          </span>
                        </div>
                      );
                    })()}
                    <p
                      className="text-xs text-wuwa-muted mt-1 max-w-16 truncate"
                      title={pull.name}>
                      {pull.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hover-card bg-black/65 border border-white/10 rounded-2xl p-5">
            <h3 className="text-4xl font-black tracking-tight mb-5">
              Pull History
            </h3>
            {recentFiveStars.length === 0 ? (
              <p className="text-sm text-wuwa-muted">
                No pull history to display yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-wuwa-muted border-b border-white/10">
                      <th className="text-left py-3 pr-4">Pull No.</th>
                      <th className="text-left py-3 pr-4">Item</th>
                      <th className="text-left py-3 pr-4">Type</th>
                      <th className="text-left py-3">Date Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFiveStars.map((pull, idx) => (
                      <tr
                        key={`${pull.uid}-row`}
                        className="border-b border-white/10">
                        <td className="py-3 pr-4 text-wuwa-text/90">
                          {fiveStarPullNoByUid[pull.uid] ?? idx + 1}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-wuwa-gold">
                            {pull.name}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-wuwa-muted">
                          {pull.resourceType}
                        </td>
                        <td className="py-3 text-wuwa-muted whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock className="w-3.5 h-3.5" />
                            {pull.time}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
