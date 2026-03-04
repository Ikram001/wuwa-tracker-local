/**
 * @file api.ts
 * @description Typed API client for all server endpoints.
 *
 * All functions return the parsed response body and throw on HTTP errors,
 * so callers can rely on a consistent interface without dealing with
 * raw `axios` responses.
 *
 * Vite's dev-server proxy forwards `/api/*` to `http://localhost:4321`,
 * so no base URL is needed here.
 */

import axios from "axios";
import type {
  DetectUrlResponse,
  PullStore,
  StatsResponse,
  SyncResponse,
} from "./types";

/**
 * Asks the server to auto-detect the convene URL from local game log files.
 *
 * @returns `DetectUrlResponse` — `ok: true` means `url` is populated.
 */
export async function detectUrl(): Promise<DetectUrlResponse> {
  const { data } = await axios.get<DetectUrlResponse>("/api/detect-url");
  return data;
}

/**
 * Triggers a full sync of all banners against Kuro's API.
 *
 * @param url - A valid convene history URL (auto-detected or manually pasted).
 * @returns `SyncResponse` with the count of new pulls added.
 */
export async function syncPulls(url: string): Promise<SyncResponse> {
  const { data } = await axios.post<SyncResponse>("/api/sync", { url });
  return data;
}

/**
 * Fetches all stored pulls plus the `lastUpdated` timestamp.
 *
 * @returns The full `PullStore` from `server/data/wuwa_pulls.json`.
 */
export async function getPulls(): Promise<PullStore> {
  const { data } = await axios.get<PullStore>("/api/pulls");
  return data;
}

/**
 * Fetches computed per-banner statistics.
 *
 * @returns A map of banner type ID → `BannerStats`.
 */
export async function getStats(): Promise<StatsResponse> {
  const { data } = await axios.get<StatsResponse>("/api/stats");
  return data;
}

/**
 * Navigates the browser to the CSV export endpoint, triggering a download.
 * No return value — the browser handles the file directly.
 */
export function downloadCsv(): void {
  window.location.href = "/api/export/csv";
}
