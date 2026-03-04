/**
 * @file routes/stats.ts
 * @description GET /api/stats
 *
 * Computes per-banner statistics from the locally stored pull history and
 * returns them as a {@link StatsResponse} map (banner type ID → BannerStats).
 *
 * ### Pity calculation
 * Pulls are sorted newest-first. The 5★ pity counter is the number of pulls
 * before the first 5★ item in that sorted list (i.e. since the most-recent
 * 5★). The 4★ pity counter follows the same logic for 4★-or-higher.
 *
 * ### Average pulls per 5★
 * Computed as `total pulls on banner / number of 5★ on banner`.
 * Returns `null` if no 5★ has been pulled yet.
 */

import { Router, Request, Response } from "express";
import { loadData } from "../data";
import { BANNER_NAMES, PITY_HARD } from "../config";
import type { BannerStats, Pull, StatsResponse } from "../types";

export const statsRouter = Router();

statsRouter.get("/stats", (_req: Request, res: Response) => {
  const { pulls } = loadData();
  const result: StatsResponse = {};

  for (const [type, name] of Object.entries(BANNER_NAMES)) {
    // Sort newest-first for pity counting
    const bannerPulls: Pull[] = pulls
      .filter((p) => p.cardPoolType === type)
      .sort((a, b) => b.time.localeCompare(a.time));

    const total = bannerPulls.length;
    const hard = PITY_HARD[type] ?? 80;

    // 5★ pity: count from top until we hit a 5★
    let pity5 = 0;
    for (const p of bannerPulls) {
      if (p.qualityLevel >= 5) break;
      pity5++;
    }

    // 4★ pity: count from top until we hit a 4★-or-higher
    let pity4 = 0;
    for (const p of bannerPulls) {
      if (p.qualityLevel >= 4) break;
      pity4++;
    }

    const fiveStars = bannerPulls.filter((p) => p.qualityLevel >= 5);
    const avgPity =
      fiveStars.length > 0
        ? parseFloat((total / fiveStars.length).toFixed(1))
        : null;

    const stats: BannerStats = {
      type,
      name,
      total,
      pity5,
      pity4,
      hard,
      avgPity,
      fiveStars,
    };
    result[type] = stats;
  }

  res.json(result);
});
