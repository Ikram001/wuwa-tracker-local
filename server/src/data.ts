/**
 * @file data.ts
 * @description Helpers for reading and writing the local pull-history store.
 *
 * The store is a plain JSON file (`server/data/wuwa_pulls.json`).
 *
 * ### Data integrity
 * `loadData` runs a lightweight migration pass on every read to fix any
 * historical type inconsistencies (e.g. qualityLevel stored as a string).
 * This is safe to run repeatedly — it only touches fields that need fixing.
 */

import fs from "fs";
import { DATA_DIR, DATA_FILE } from "./config";
import type { Pull, PullStore } from "./types";

/**
 * Ensures the data directory exists, creating it recursively if needed.
 * Call this once at server startup.
 */
export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Loads the pull store from disk and runs a migration pass.
 *
 * Migration fixes applied on every load:
 *  - `qualityLevel` stored as a string → coerced to number
 *
 * Returns an empty store if the file does not yet exist or cannot be parsed.
 *
 * @returns The current {@link PullStore}, guaranteed to be non-null.
 */
export function loadData(): PullStore {
  if (!fs.existsSync(DATA_FILE)) {
    return { pulls: [], lastUpdated: null };
  }
  try {
    const raw  = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw) as PullStore;
    data.pulls = migratePulls(data.pulls ?? []);
    return data;
  } catch {
    console.warn("[data] wuwa_pulls.json is corrupt — starting with empty store.");
    return { pulls: [], lastUpdated: null };
  }
}

/**
 * Persists the pull store to disk, stamping `lastUpdated` with the current
 * UTC timestamp.
 *
 * @param data - The {@link PullStore} to write. `lastUpdated` is set in-place
 *               before serialisation.
 */
export function saveData(data: PullStore): void {
  data.lastUpdated = new Date().toISOString();
  // Always migrate before saving so the file stays clean
  data.pulls = migratePulls(data.pulls);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ─── Internal ─────────────────────────────────────────────────────────────────

/**
 * Runs all data-integrity fixes over a pull array.
 *
 * Currently handles:
 *  - `qualityLevel` as string (e.g. `"5"`) → number (`5`).
 *    The Kuro API sometimes returns this field as a string. Old syncs may have
 *    stored it without coercion, which breaks strict `===` comparisons in the
 *    client-side quality filter.
 *
 * @param pulls - Raw array from JSON.parse (types may be looser than declared).
 * @returns New array with all fields correctly typed.
 */
function migratePulls(pulls: Pull[]): Pull[] {
  return pulls.map((p) => ({
    ...p,
    // Coerce to number regardless of whether it arrived as string or number
    qualityLevel: typeof p.qualityLevel === "number"
      ? p.qualityLevel
      : parseInt(String(p.qualityLevel), 10),
  }));
}