/**
 * @file routes/pulls.ts
 * @description GET /api/pulls
 *
 * Returns the full {@link PullStore} (pulls array + lastUpdated timestamp)
 * directly from the local JSON file.
 *
 * The client uses this endpoint to populate the History tab and to display
 * the "last synced" timestamp in the Navbar.
 */

import { Router, Request, Response } from "express";
import { loadData } from "../data";

export const pullsRouter = Router();

pullsRouter.get("/pulls", (_req: Request, res: Response) => {
  const data = loadData();
  res.json(data);
});
