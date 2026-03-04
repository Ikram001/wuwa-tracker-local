/**
 * @file config.ts
 * @description Centralised configuration constants for the server.
 *
 * Edit this file to change ports, file paths, or banner metadata
 * without touching any route logic.
 */

import path from "path";

/** TCP port the Express server listens on. */
export const PORT = 4321;

/** Absolute path to the directory where `wuwa_pulls.json` is stored. */
export const DATA_DIR = path.join(__dirname, "..", "data");

/** Absolute path to the pull-history JSON file. */
export const DATA_FILE = path.join(DATA_DIR, "wuwa_pulls.json");

/**
 * Milliseconds to wait between successive banner API requests during a sync.
 * A small delay avoids triggering Kuro's rate-limiter.
 */
export const API_PAGE_DELAY_MS = 300;

/**
 * Maximum sync iterations per banner (safety cap — the API is not paginated,
 * so this is only a guard against unexpected infinite loops).
 */
export const MAX_PAGES = 9999;

/**
 * Maps Kuro's numeric `cardPoolType` IDs to human-readable banner names.
 *
 * Confirmed correct mapping (sourced from multiple open-source Kuro API
 * clients and community datamining):
 *
 *  1 = Featured Resonator  (角色活动唤取 / 角色精准调谐)
 *  2 = Featured Weapon     (武器活动唤取 / 武器精准调谐)
 *  3 = Standard Resonator  (角色常驻唤取 / 角色调谐（常驻池）)
 *  4 = Standard Weapon     (武器常驻唤取 / 武器调谐（常驻池）)
 *  5 = Beginner's Banner   (新手唤取)          ← intentionally excluded
 *  6 = Beginner's Choice   (新手自选唤取)       ← intentionally excluded
 *  7 = Beginner's Selector (感恩定向唤取)       ← intentionally excluded
 *
 * Beginner pools (5-7) are omitted: they are one-time-only pools with a
 * hard cap of ~20 pulls total and clutter the Stats view with near-empty
 * banners for most players.
 */
export const BANNER_NAMES: Record<string, string> = {
  "1": "Featured Resonator",
  "2": "Featured Weapon",
  "3": "Standard Resonator",
  "4": "Standard Weapon",
};

/**
 * Hard-pity thresholds per banner type.
 * At hard pity the next pull is guaranteed to be 5★.
 *
 * All four active banners share an 80-pull hard pity.
 */
export const PITY_HARD: Record<string, number> = {
  "1": 80,
  "2": 80,
  "3": 80,
  "4": 80,
};

/**
 * The order banners are displayed in the Stats panel.
 * Featured banners are shown first, standard banners second.
 */
export const BANNER_DISPLAY_ORDER = ["1", "2", "3", "4"];
