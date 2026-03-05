/**
 * @file Navbar.tsx
 * @description Sticky top navigation bar.
 *
 * Displays the app logo, tab switcher, last-synced timestamp, and a
 * help button that opens the {@link HelpModal}.
 */

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import HelpModal from "./HelpModal";
import type { TabName } from "../types";
interface NavbarProps {
  tab: TabName;
  setTab: (t: TabName) => void;
  tabs: TabName[];
  lastUpdated: string | null;
}

export default function Navbar({
  tab,
  setTab,
  tabs,
  lastUpdated,
}: NavbarProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  const formatted = lastUpdated
    ? new Date(lastUpdated).toLocaleString()
    : "Never synced";

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/85 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hover-card p-1.5 rounded-lg bg-black/50 border border-white/10">
              <img
                src="/logo.jpg"
                alt="WuWa Tracker logo"
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-wuwa-border"
              />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              WuWa <span className="text-white/90">Pull Tracker</span>
            </span>
            <span className="hidden sm:block text-xs text-wuwa-muted border border-white/10 rounded px-1.5 py-0.5">
              LOCAL
            </span>
          </div>

          {/* Tab switcher */}
          <nav className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-white/15 text-white border border-white/15"
                    : "text-wuwa-muted hover:text-wuwa-text hover:bg-white/5"
                }`}>
                {t}
              </button>
            ))}
          </nav>

          {/* Right side: last synced + help */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-xs text-wuwa-muted text-right">
              <div>Last synced</div>
              <div className="text-wuwa-text/70">{formatted}</div>
            </div>
            <button
              onClick={() => setHelpOpen(true)}
              title="Open help guide"
              className="p-1.5 rounded-lg text-wuwa-muted hover:text-wuwa-text hover:bg-white/5 transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
