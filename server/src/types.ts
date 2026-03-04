/**
 * @file types.ts
 * @description Shared TypeScript interfaces and types used across the server.
 *
 * These types mirror the shape of data returned by Kuro's gacha API
 * as well as the local storage schema.
 */

// ─── Kuro API ────────────────────────────────────────────────────────────────

/**
 * A single gacha pull item as returned by Kuro's `/game/gacha/gachaLog` endpoint.
 */
export interface KuroGachaItem {
  /** Display name of the resonator or weapon (e.g. "Jiyan", "Emerald of Genesis") */
  name: string;
  /** ISO-like timestamp string, e.g. "2025-05-01 14:23:05" */
  time: string;
  /** Star rating as a string: "3", "4", or "5" */
  qualityLevel: string;
  /** Either "Resonator" or "Weapon" */
  resourceType: string;
  /** Internal resource ID */
  resourceId: string;
  /** Card pool (banner) type ID as a string */
  cardPoolType: string;
  /** Pool ID (not used by this tracker) */
  cardPoolId: string;
}

/**
 * Wrapper returned by Kuro's gacha log API.
 * `code === 0` means success; any other code is an error.
 */
export interface KuroApiResponse {
  code: number;
  message: string;
  data: KuroGachaItem[] | null;
}

/**
 * Parsed parameters extracted from a convene history URL.
 * These are passed as the POST body to Kuro's gacha log API.
 */
export interface ConveneParams {
  /** Base URL of the API (differs for global vs CN server) */
  apiBase: string;
  /** Server/region ID (e.g. "76", "76a") */
  serverId: string;
  /** Player's in-game UID */
  playerId: string;
  /** One-time authentication token embedded in the convene URL */
  recordId: string;
  /** Language code for item names, e.g. "en" */
  languageCode: string;
  /** Gacha resource/pool ID */
  cardPoolId: string;
}

// ─── Local storage ───────────────────────────────────────────────────────────

/**
 * A single pull record as persisted in `server/data/wuwa_pulls.json`.
 *
 * The `uid` field is a synthetic deduplication key derived from
 * `time|name|qualityLevel|resourceType`.
 */
export interface Pull {
  /** Deduplication key: `"<time>|<name>|<qualityLevel>|<resourceType>"` */
  uid: string;
  /** Display name of the item */
  name: string;
  /** Timestamp string from the API, e.g. "2025-05-01 14:23:05" */
  time: string;
  /** Numeric star rating: 3, 4, or 5 */
  qualityLevel: number;
  /** "Resonator" | "Weapon" */
  resourceType: string;
  /** Banner type ID as a string key, e.g. "1" */
  cardPoolType: string;
  /** Human-readable banner name, e.g. "Featured Resonator" */
  bannerName: string;
}

/**
 * Root structure of `server/data/wuwa_pulls.json`.
 */
export interface PullStore {
  /** All stored pulls, newest first */
  pulls: Pull[];
  /** ISO timestamp of the last successful sync, or `null` if never synced */
  lastUpdated: string | null;
}

// ─── API response shapes ─────────────────────────────────────────────────────

/**
 * Payload returned by `GET /api/detect-url`.
 */
export interface DetectUrlResponse {
  ok: boolean;
  /** The convene history URL if found, otherwise `null` */
  url: string | null;
  message?: string;
}

/**
 * Payload returned by `POST /api/sync`.
 */
export interface SyncResponse {
  ok: boolean;
  /** Number of new pulls added in this sync run */
  newCount: number;
  /** Total number of pulls now stored locally */
  total: number;
  /** Non-fatal per-banner error messages (e.g. API timeouts on one banner) */
  errors: string[];
  message?: string;
}

/**
 * Per-banner statistics computed by `GET /api/stats`.
 */
export interface BannerStats {
  /** Banner type ID, e.g. "1" */
  type: string;
  /** Human-readable banner name */
  name: string;
  /** Total pulls recorded on this banner */
  total: number;
  /** Number of pulls since the last 5★ (current pity counter) */
  pity5: number;
  /** Number of pulls since the last 4★-or-higher (current 4★ pity) */
  pity4: number;
  /** Hard-pity threshold for this banner */
  hard: number;
  /** Average pulls between 5★ results; `null` if no 5★ has been pulled yet */
  avgPity: number | null;
  /** All 5★ pulls on this banner, newest first */
  fiveStars: Pull[];
}

/** Full stats response: a map of banner type ID → BannerStats */
export type StatsResponse = Record<string, BannerStats>;
