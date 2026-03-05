/**
 * @file App.tsx
 * @description Root application component.
 *
 * Owns the global data-fetching state (stats + pulls) and re-fetches
 * both endpoints after every successful sync so every tab shows
 * up-to-date figures without a manual refresh.
 */

import { useState, useEffect, useCallback } from "react";
import { getPulls, getStats } from "./api";
import Navbar from "./components/Navbar";
import SyncPanel from "./components/SyncPanel";
import StatsPanel from "./components/StatsPanel";
import HistoryPanel from "./components/HistoryPanel";
import type { Pull, StatsResponse, TabName } from "./types";

const TABS: TabName[] = ["Stats", "History", "Sync"];

export default function App() {
  const [tab, setTab] = useState<TabName>("Stats");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetches stats and pulls from the server and updates local state. */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, pullsData] = await Promise.all([
        getStats(),
        getPulls(),
      ]);
      setStats(statsData);
      setPulls(pullsData.pulls ?? []);
      setLastUpdated(pullsData.lastUpdated);
    } catch (e) {
      console.error("[App] Failed to load data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data once on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-black text-wuwa-text">
      <Navbar tab={tab} setTab={setTab} tabs={TABS} lastUpdated={lastUpdated} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && !stats ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-wuwa-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === "Stats" && <StatsPanel stats={stats} pulls={pulls} />}
            {tab === "History" && <HistoryPanel pulls={pulls} />}
            {tab === "Sync" && <SyncPanel onSynced={fetchData} />}
          </>
        )}
      </main>
    </div>
  );
}
