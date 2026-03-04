/**
 * @file index.ts
 * @description Express server entry point.
 *
 * Mounts all API routes and starts listening on {@link PORT}.
 *
 * All game data stays on the player's machine:
 *  - Reads local log files to find the convene URL
 *  - Proxies pull requests to Kuro's official API (gmserver-api.aki-game2.net)
 *  - Persists results to server/data/wuwa_pulls.json
 *
 * @module server
 */

import express from "express";
import cors from "cors";
import { PORT } from "./config";
import { ensureDataDir } from "./data";
import { detectRouter } from "./routes/detect";
import { syncRouter } from "./routes/sync";
import { pullsRouter } from "./routes/pulls";
import { statsRouter } from "./routes/stats";
import { exportRouter } from "./routes/exportCsv";

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", detectRouter);
app.use("/api", syncRouter);
app.use("/api", pullsRouter);
app.use("/api", statsRouter);
app.use("/api", exportRouter);

// ─── Startup ──────────────────────────────────────────────────────────────────
ensureDataDir();

app.listen(PORT, () => {
  console.log("");
  console.log("  ╔═══════════════════════════════════════╗");
  console.log("  ║   WuWa Tracker  —  API Server          ║");
  console.log(`  ║   Listening on http://localhost:${PORT}  ║`);
  console.log("  ║   Data: server/data/wuwa_pulls.json   ║");
  console.log("  ╚═══════════════════════════════════════╝");
  console.log("");
});
