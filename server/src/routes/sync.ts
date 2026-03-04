/**
 * @file routes/sync.ts
 * @description POST /api/sync  { url: string }
 *
 * Fetches the full convene history for all known banner types from Kuro's
 * official gacha-log API, then merges newly discovered pulls into the local
 * JSON store.
 *
 * ### Correct endpoint
 *   POST https://gmserver-api.aki-game2.net/gacha/record/query   (Global)
 *   POST https://gmserver-api.aki-game2.com/gacha/record/query   (CN)
 *
 * ### API behaviour
 * Returns ALL records for a cardPoolType in a single response (no pagination).
 * cardPoolType MUST be sent as a number (integer).
 * qualityLevel is returned as a number (3 | 4 | 5) — we store it as such.
 *
 * ### Deduplication
 * Each pull is identified by `"<time>|<name>|<qualityLevel>|<resourceType>"`.
 */

import { Router, Request, Response } from "express";
import axios from "axios";
import { BANNER_NAMES, API_PAGE_DELAY_MS } from "../config";
import { loadData, saveData } from "../data";
import { parseConveneUrl } from "../urlFinder";
import type {
  ConveneParams,
  KuroGachaItem,
  Pull,
  SyncResponse,
} from "../types";

export const syncRouter = Router();

// ─── Route handler ────────────────────────────────────────────────────────────

syncRouter.post("/sync", async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url?.trim()) {
    return res
      .status(400)
      .json({ ok: false, message: "url is required in request body." });
  }

  let params: ConveneParams;
  try {
    params = parseConveneUrl(url.trim());
  } catch (e) {
    return res
      .status(400)
      .json({ ok: false, message: `Invalid URL: ${(e as Error).message}` });
  }

  if (!params.playerId || !params.recordId) {
    return res.status(400).json({
      ok: false,
      message:
        "URL is missing player_id or record_id. Re-open Convene History in-game to generate a fresh URL.",
    });
  }

  const store = loadData();

  // ── Migrate any legacy string qualityLevels to numbers ──────────────────
  // Old syncs may have stored qualityLevel as a string (e.g. "5") because
  // the raw API value was not coerced. Fix in-place so filters always work.
  let migrated = 0;
  store.pulls = store.pulls.map((p) => {
    if (typeof p.qualityLevel === "string") {
      migrated++;
      return {
        ...p,
        qualityLevel: parseInt(p.qualityLevel as unknown as string, 10),
      };
    }
    return p;
  });
  if (migrated > 0) {
    console.log(
      `[sync] Migrated ${migrated} pulls from string → number qualityLevel`,
    );
  }

  const knownUIDs = new Set(store.pulls.map((p) => p.uid));
  const newPulls: Pull[] = [];
  const errors: string[] = [];

  for (const [bannerType, bannerName] of Object.entries(BANNER_NAMES)) {
    try {
      const items = await fetchBanner(params, bannerType);

      for (const item of items) {
        const uid = buildUid(item);
        if (!knownUIDs.has(uid)) {
          newPulls.push(itemToPull(item, bannerType, bannerName, uid));
        }
      }

      await sleep(API_PAGE_DELAY_MS);
    } catch (e) {
      errors.push(`Banner "${bannerName}": ${(e as Error).message}`);
    }
  }

  store.pulls = [...newPulls, ...store.pulls];
  saveData(store);

  const body: SyncResponse = {
    ok: true,
    newCount: newPulls.length,
    total: store.pulls.length,
    errors,
  };
  return res.json(body);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetches ALL gacha records for one banner type in a single API call.
 * cardPoolType MUST be sent as a number — Kuro's API returns 404 for strings.
 */
async function fetchBanner(
  params: ConveneParams,
  cardPoolType: string,
): Promise<KuroGachaItem[]> {
  const body = {
    cardPoolId: params.cardPoolId,
    cardPoolType: Number(cardPoolType), // ← must be a number
    languageCode: params.languageCode,
    playerId: params.playerId,
    recordId: params.recordId,
    serverId: params.serverId,
  };

  const { data } = await axios.post<{
    code: number;
    message: string;
    data: KuroGachaItem[] | null;
  }>(`${params.apiBase}/gacha/record/query`, body, {
    headers: { "Content-Type": "application/json" },
    timeout: 15_000,
  });

  if (data.code !== 0) {
    throw new Error(`API error code ${data.code}: ${data.message}`);
  }

  return data.data ?? [];
}

/**
 * Builds a stable deduplication UID.
 * Uses the raw qualityLevel value (before coercion) for consistency with
 * any previously stored UIDs.
 */
function buildUid(item: KuroGachaItem): string {
  return `${item.time}|${item.name}|${item.qualityLevel}|${item.resourceType}`;
}

/**
 * Converts a raw KuroGachaItem into a locally-stored Pull.
 * qualityLevel is explicitly parsed to a number so the stored JSON always
 * contains a numeric value — this is what the client filters compare against.
 */
function itemToPull(
  item: KuroGachaItem,
  bannerType: string,
  bannerName: string,
  uid: string,
): Pull {
  return {
    uid,
    name: item.name,
    time: item.time,
    qualityLevel: parseInt(String(item.qualityLevel), 10), // always a number
    resourceType: item.resourceType,
    cardPoolType: bannerType,
    bannerName,
  };
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
