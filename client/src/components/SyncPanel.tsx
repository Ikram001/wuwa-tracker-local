/**
 * @file SyncPanel.tsx
 * @description "Sync" tab — URL detection, manual entry, and sync trigger.
 *
 * Flow:
 *  1. User clicks "Auto-detect URL" → calls GET /api/detect-url
 *     - Success: populates the URL input + shows a green confirmation
 *     - Failure: shows an error message; user can paste manually
 *  2. User clicks "Sync Pulls" → calls POST /api/sync with the URL
 *     - Reports how many new pulls were added
 *     - Calls `onSynced` on success so App re-fetches stats + history
 *
 * The instruction card at the top mirrors the in-app help guide so
 * new users can sync without opening the help modal.
 */

import { useState } from "react";
import {
  RefreshCw,
  Link,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { detectUrl, syncPulls } from "../api";
import type { SyncResponse } from "../types";

interface SyncPanelProps {
  /** Called after a successful sync so the parent can refresh data. */
  onSynced: () => void;
}

type ResultState =
  | (SyncResponse & { message: string })
  | { ok: false; message: string }
  | null;

export default function SyncPanel({ onSynced }: SyncPanelProps) {
  const [url, setUrl] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<ResultState>(null);

  /** Step 1: auto-detect the convene URL from local log files. */
  async function handleDetect() {
    setDetecting(true);
    setResult(null);
    try {
      const res = await detectUrl();
      if (res.ok && res.url) {
        setUrl(res.url);
        setResult({
          ok: true,
          newCount: 0,
          total: 0,
          errors: [],
          message: "URL detected from your game logs ✓",
        });
      } else {
        setResult({
          ok: false,
          message: res.message ?? "Could not detect URL automatically.",
        });
      }
    } catch (e) {
      setResult({
        ok: false,
        message: `Server error: ${(e as Error).message}`,
      });
    } finally {
      setDetecting(false);
    }
  }

  /** Step 2: sync all banners using the current URL. */
  async function handleSync() {
    if (!url.trim()) return;
    setSyncing(true);
    setResult(null);
    try {
      const res = await syncPulls(url.trim());
      setResult({
        ...res,
        message: res.ok
          ? `Sync complete! ${res.newCount} new pull(s) added · ${res.total} total stored.`
          : (res.message ?? "Sync failed."),
      });
      if (res.ok) onSynced();
    } catch (e) {
      setResult({
        ok: false,
        message: `Server error: ${(e as Error).message}`,
      });
    } finally {
      setSyncing(false);
    }
  }

  const ResultIcon = result?.ok ? CheckCircle : XCircle;
  const resultBg = result?.ok
    ? "bg-green-500/10 border-green-500/30"
    : "bg-red-500/10 border-red-500/30";
  const resultColor = result?.ok ? "text-green-400" : "text-red-400";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Quick-start instructions ── */}
      <div className="hover-card bg-black/65 border border-white/10 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-wuwa-accent font-semibold">
          <AlertCircle className="w-5 h-5" />
          Before syncing
        </div>
        <ol className="text-sm text-wuwa-muted space-y-1.5 list-decimal list-inside">
          <li>
            Launch <span className="text-wuwa-text">Wuthering Waves</span>
          </li>
          <li>
            Open{" "}
            <span className="text-wuwa-text">Convene → Convene History</span>{" "}
            and wait for it to load
          </li>
          <li>
            Return here and click{" "}
            <span className="text-wuwa-text">Auto-detect URL</span>
          </li>
          <li>
            Click <span className="text-wuwa-text">Sync Pulls</span>
          </li>
        </ol>
        <p className="text-xs text-wuwa-muted border-t border-white/10 pt-3">
          Data is fetched directly from Kuro's API and stored locally in{" "}
          <code className="text-white bg-black/55 px-1 rounded border border-white/10">
            server/data/wuwa_pulls.json
          </code>
          . Nothing is sent to any third-party server.
        </p>
      </div>

      {/* ── URL input + sync button ── */}
      <div className="hover-card bg-black/65 border border-white/10 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold">Convene History URL</h2>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wuwa-muted" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://aki-gm-resources…"
              className="w-full bg-black/55 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm placeholder-wuwa-muted focus:outline-none focus:border-white/35 transition-colors"
            />
          </div>
          <button
            onClick={handleDetect}
            disabled={detecting || syncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-black/55 border border-white/10 rounded-lg text-sm text-wuwa-muted hover:text-wuwa-text hover:border-white/35 disabled:opacity-40 transition-all whitespace-nowrap">
            <RefreshCw
              className={`w-4 h-4 ${detecting ? "animate-spin" : ""}`}
            />
            {detecting ? "Detecting…" : "Auto-detect URL"}
          </button>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing || detecting || !url.trim()}
          className="w-full py-3 rounded-xl bg-white/15 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all border border-white/10 flex items-center justify-center gap-2">
          <RefreshCw className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing all banners…" : "Sync Pulls"}
        </button>
      </div>

      {/* ── Result banner ── */}
      {result && (
        <div
          className={`hover-card flex items-start gap-3 p-4 rounded-xl border ${resultBg}`}>
          <ResultIcon className={`w-5 h-5 mt-0.5 shrink-0 ${resultColor}`} />
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium">{result.message}</p>
            {"errors" in result && result.errors.length > 0 && (
              <details className="text-xs text-wuwa-muted">
                <summary className="cursor-pointer">
                  {result.errors.length} warning(s) — click to expand
                </summary>
                <ul className="mt-1 space-y-0.5 pl-2 list-disc list-inside">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
