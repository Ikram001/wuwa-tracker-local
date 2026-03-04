/**
 * @file routes/detect.ts
 * @description GET /api/detect-url
 *
 * Attempts to locate the convene history URL from the player's local
 * game log files without requiring any user input.
 *
 * Response shape: {@link DetectUrlResponse}
 *
 * - `ok: true`  → `url` contains the discovered URL
 * - `ok: false` → `url` is null; `message` explains why
 *
 * Errors thrown by the URL finder are caught and returned as a 500 with
 * `ok: false` so the client can display a user-friendly message.
 */

import { Router, Request, Response } from "express";
import { findConveneUrl } from "../urlFinder";
import type { DetectUrlResponse } from "../types";

export const detectRouter = Router();

detectRouter.get("/detect-url", (_req: Request, res: Response) => {
  try {
    const url = findConveneUrl();

    if (url) {
      const body: DetectUrlResponse = { ok: true, url };
      return res.json(body);
    }

    const body: DetectUrlResponse = {
      ok: false,
      url: null,
      message:
        "No convene URL found in local log files. " +
        "Make sure you opened Convene History in-game first.",
    };
    return res.json(body);
  } catch (err) {
    const body: DetectUrlResponse = {
      ok: false,
      url: null,
      message: `Server error during URL detection: ${(err as Error).message}`,
    };
    return res.status(500).json(body);
  }
});
