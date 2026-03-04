/**
 * @file types.ts
 * @description Client-side TypeScript interfaces.
 *
 * These mirror the server's response shapes so every API call is
 * fully typed end-to-end.
 */

// ─── Stored data ──────────────────────────────────────────────────────────────

/** A single pull as returned by GET /api/pulls */
export interface Pull {
  uid: string;
  name: string;
  time: string;
  qualityLevel: number;
  resourceType: string;
  cardPoolType: string;
  bannerName: string;
}

/** Root shape of GET /api/pulls */
export interface PullStore {
  pulls: Pull[];
  lastUpdated: string | null;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/** Per-banner stats returned by GET /api/stats */
export interface BannerStats {
  type: string;
  name: string;
  total: number;
  pity5: number;
  pity4: number;
  hard: number;
  avgPity: number | null;
  fiveStars: Pull[];
}

/** Full stats response: banner type ID → BannerStats */
export type StatsResponse = Record<string, BannerStats>;

// ─── API responses ────────────────────────────────────────────────────────────

export interface DetectUrlResponse {
  ok: boolean;
  url: string | null;
  message?: string;
}

export interface SyncResponse {
  ok: boolean;
  newCount: number;
  total: number;
  errors: string[];
  message?: string;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

/** The three main navigation tabs */
export type TabName = "Stats" | "History" | "Sync";
