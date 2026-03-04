/**
 * @file routes/exportCsv.ts
 * @description GET /api/export/csv
 *
 * Streams all stored pulls as a UTF-8 CSV file.
 *
 * The file is sorted chronologically (oldest pull first) and includes the
 * following columns:
 *   Time, Name, Quality, ResourceType, Banner
 *
 * The `Content-Disposition: attachment` header causes browsers to download
 * the file rather than display it inline.
 */

import { Router, Request, Response } from "express";
import { loadData } from "../data";

export const exportRouter = Router();

exportRouter.get("/export/csv", (_req: Request, res: Response) => {
  const { pulls } = loadData();

  const header = "Time,Name,Quality,ResourceType,Banner\n";
  const rows = [...pulls]
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(
      (p) =>
        `"${p.time}","${p.name}",${p.qualityLevel},"${p.resourceType}","${p.bannerName}"`,
    )
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="wuwa_pulls.csv"');
  res.send(header + rows);
});
