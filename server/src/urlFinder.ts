/**
 * @file urlFinder.ts
 * @description Locates the Wuthering Waves convene-history URL from local
 *              game log files — no network requests, no user interaction.
 *
 * Strategy (in priority order):
 *  1. Windows registry: MUI Cache
 *  2. Windows registry: Firewall rules
 *  3. Windows registry: Uninstall entries
 *  4. Hardcoded common paths on every detected drive letter
 *
 * For each candidate game folder two log files are checked:
 *  - `Client/Saved/Logs/Client.log`  (primary)
 *  - `Client/Binaries/.../debug.log` (fallback)
 *
 * All collected log files are sorted newest-first and the URL is extracted
 * from the most-recent file that contains one.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/** Regex that matches a convene URL inside Client.log plain-text lines. */
const CLIENT_URL_RE =
  /https:\/\/aki-gm-resources(?:-oversea)?\.aki-game\.(?:net|com)\/aki\/gacha\/index\.html#\/record[^\s"]+/;

/** Regex that matches a convene URL inside debug.log JSON entries. */
const DEBUG_URL_RE =
  /"#url":\s*"(https:\/\/aki-gm-resources(?:-oversea)?\.aki-game\.(?:net|com)\/aki\/gacha\/index\.html#\/record[^"]*)"/;

/** Maximum bytes read from the tail of a log file (avoids loading huge files). */
const MAX_LOG_BYTES = 2 * 1024 * 1024; // 2 MB

interface LogCandidate {
  filePath: string;
  type: "client" | "debug";
  mtime: number;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Attempts to find a valid convene history URL from local game log files.
 *
 * @returns The URL string if found, or `null` if no log file contained one.
 */
export function findConveneUrl(): string | null {
  const candidates: LogCandidate[] = [];
  const checked = new Set<string>();

  function collectLogs(root: string): void {
    if (!root || !fs.existsSync(root)) return;
    const clientLog = path.join(root, "Client", "Saved", "Logs", "Client.log");
    const debugLog = path.join(
      root,
      "Client",
      "Binaries",
      "Win64",
      "ThirdParty",
      "KrPcSdk_Global",
      "KRSDKRes",
      "KRSDKWebView",
      "debug.log",
    );
    for (const [fp, type] of [
      [clientLog, "client"],
      [debugLog, "debug"],
    ] as const) {
      if (fs.existsSync(fp)) {
        const stat = fs.statSync(fp);
        candidates.push({ filePath: fp, type, mtime: stat.mtimeMs });
      }
    }
  }

  function tryPath(p: string): void {
    if (!p || p.toLowerCase().includes("onedrive")) return;
    const key = p.toLowerCase();
    if (checked.has(key)) return;
    checked.add(key);
    collectLogs(p);
  }

  // ── 1. Registry via PowerShell ────────────────────────────────────────────
  function runPS(script: string): string {
    return execSync(
      `powershell -NoProfile -NonInteractive -Command "${script}"`,
      { encoding: "utf8", timeout: 8_000, windowsHide: true },
    );
  }

  try {
    const muiScript = [
      `(Get-ItemProperty`,
      ` 'HKCU:\\Software\\Classes\\Local Settings\\Software\\Microsoft\\Windows\\Shell\\MuiCache'`,
      ` -ErrorAction SilentlyContinue).PSObject.Properties`,
      `| Where-Object { $_.Value -like '*wuthering*' -and $_.Name -like '*client-win64-shipping.exe*' }`,
      `| ForEach-Object { ($_.Name -split '\\\\client\\\\')[0] }`,
    ].join(" ");
    runPS(muiScript)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach(tryPath);

    const fwScript = [
      `(Get-ItemProperty`,
      ` 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\SharedAccess\\Parameters\\FirewallPolicy\\FirewallRules'`,
      ` -ErrorAction SilentlyContinue).PSObject.Properties`,
      `| Where-Object { $_.Value -like '*wuthering*' -and $_.Name -like '*client-win64-shipping*' }`,
      `| ForEach-Object { (($_.Value -split 'App=')[1] -split '\\\\client\\\\')[0] }`,
    ].join(" ");
    runPS(fwScript)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach(tryPath);

    const unScript = [
      `Get-ItemProperty`,
      ` -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',`,
      `       'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'`,
      ` -ErrorAction SilentlyContinue`,
      `| Where-Object { $_.DisplayName -like '*wuthering*' }`,
      `| Select-Object -ExpandProperty InstallPath`,
    ].join(" ");
    runPS(unScript)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach(tryPath);
  } catch {
    // Not on Windows or PowerShell unavailable — fall through to path scan
  }

  // ── 2. Hardcoded common paths on every drive letter ───────────────────────
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")) {
    const dr = `${letter}:`;
    if (!fs.existsSync(dr + "\\")) continue;
    [
      `${dr}\\Wuthering Waves Game`,
      `${dr}\\Wuthering Waves\\Wuthering Waves Game`,
      `${dr}\\Program Files\\Wuthering Waves\\Wuthering Waves Game`,
      `${dr}\\Program Files (x86)\\Wuthering Waves\\Wuthering Waves Game`,
      `${dr}\\Games\\Wuthering Waves Game`,
      `${dr}\\Games\\Wuthering Waves\\Wuthering Waves Game`,
      `${dr}\\SteamLibrary\\steamapps\\common\\Wuthering Waves`,
      `${dr}\\SteamLibrary\\steamapps\\common\\Wuthering Waves\\Wuthering Waves Game`,
      `${dr}\\Program Files (x86)\\Steam\\steamapps\\common\\Wuthering Waves`,
      `${dr}\\Program Files (x86)\\Steam\\steamapps\\common\\Wuthering Waves\\Wuthering Waves Game`,
      `${dr}\\Program Files\\Steam\\steamapps\\common\\Wuthering Waves`,
      `${dr}\\Program Files\\Steam\\steamapps\\common\\Wuthering Waves\\Wuthering Waves Game`,
      `${dr}\\Steam\\steamapps\\common\\Wuthering Waves`,
      `${dr}\\Steam\\steamapps\\common\\Wuthering Waves\\Wuthering Waves Game`,
      `${dr}\\Program Files\\Epic Games\\WutheringWavesj3oFh`,
      `${dr}\\Program Files\\Epic Games\\WutheringWavesj3oFh\\Wuthering Waves Game`,
      `${dr}\\Program Files (x86)\\Epic Games\\WutheringWavesj3oFh`,
      `${dr}\\Program Files (x86)\\Epic Games\\WutheringWavesj3oFh\\Wuthering Waves Game`,
    ].forEach(tryPath);
  }

  if (candidates.length === 0) return null;

  // ── 3. Extract URL from the newest log that contains one ──────────────────
  const sorted = candidates.sort((a, b) => b.mtime - a.mtime);
  for (const cand of sorted) {
    const url = extractUrlFromLog(cand);
    if (url) return url;
  }
  return null;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function extractUrlFromLog(cand: LogCandidate): string | null {
  try {
    const size = fs.statSync(cand.filePath).size;
    const readSize = Math.min(size, MAX_LOG_BYTES);
    const buf = Buffer.alloc(readSize);
    const fd = fs.openSync(cand.filePath, "r");
    fs.readSync(fd, buf, 0, readSize, size - readSize);
    fs.closeSync(fd);
    const content = buf.toString("utf8");

    if (cand.type === "client") {
      const matches = [
        ...content.matchAll(new RegExp(CLIENT_URL_RE.source, "g")),
      ];
      if (matches.length > 0)
        return matches[matches.length - 1][0].split(/[\s"]/)[0];
    } else {
      const matches = [
        ...content.matchAll(new RegExp(DEBUG_URL_RE.source, "g")),
      ];
      if (matches.length > 0) return matches[matches.length - 1][1];
    }
  } catch {
    // File locked or unreadable — skip
  }
  return null;
}

// ─── URL parser ───────────────────────────────────────────────────────────────

/**
 * Parses a convene history URL into the parameters required by Kuro's API.
 *
 * The URL format is:
 * ```
 * https://aki-gm-resources[-oversea].aki-game.[net|com]/aki/gacha/index.html
 *   #/record?svr_id=<id>&player_id=<uid>&record_id=<token>&resources_id=<pool>&...
 * ```
 *
 * Note: the query string lives in the URL *fragment* (after `#`), not in the
 * standard query-string position, which is why we split on `#` first.
 *
 * API base URL selection:
 *  - aki-game.net  → Global server → gmserver-api.aki-game2.net
 *  - aki-game.com  → CN server     → gmserver-api.aki-game2.com
 *
 * @param rawUrl - The full convene history URL from the game log.
 * @returns Parsed {@link ConveneParams} ready to pass to the sync route.
 */
export function parseConveneUrl(
  rawUrl: string,
): import("./types").ConveneParams {
  const fragment = rawUrl.split("#")[1] ?? "";
  const qs = fragment.split("?")[1] ?? "";
  const p = new URLSearchParams(qs);

  // Global uses aki-game.net; CN uses aki-game.com
  const apiBase = rawUrl.includes("aki-game.net")
    ? "https://gmserver-api.aki-game2.net"
    : "https://gmserver-api.aki-game2.com";

  return {
    apiBase,
    serverId: p.get("svr_id") ?? "",
    playerId: p.get("player_id") ?? "",
    recordId: p.get("record_id") ?? "",
    languageCode: p.get("lang") ?? "en",
    cardPoolId: p.get("resources_id") ?? "",
  };
}
