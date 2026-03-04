/**
 * @file HelpModal.tsx
 * @description In-app help modal.
 *
 * Renders a full step-by-step usage guide, pity reference table,
 * troubleshooting tips, and network transparency note — all without
 * leaving the app or opening an external browser tab.
 *
 * Closes on backdrop click or the × button.
 */

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative bg-wuwa-card border border-wuwa-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-wuwa-card border-b border-wuwa-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-wuwa-text">
            How to use WuWa Tracker
          </h2>
          <button
            onClick={onClose}
            className="text-wuwa-muted hover:text-wuwa-text text-xl leading-none transition-colors">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-7 text-sm text-wuwa-text">
          {/* Syncing pulls */}
          <section className="space-y-3">
            <h3 className="font-semibold text-wuwa-accent text-base">
              Syncing your pulls
            </h3>
            <p className="text-wuwa-muted">
              Do this every time you want to fetch new pulls.
            </p>
            <ol className="space-y-2 list-none">
              {[
                ["1", "Launch Wuthering Waves."],
                [
                  "2",
                  "Open Convene → Convene History and wait for the list to fully load. This writes the URL to your local log file.",
                ],
                ["3", "Switch to this app and click the Sync tab."],
                [
                  "4",
                  "Click Auto-detect URL. The server scans your game log files. If found, the URL box fills automatically.",
                ],
                [
                  "5",
                  "Click Sync Pulls. All banners are fetched page-by-page from Kuro's API.",
                ],
                [
                  "6",
                  "Check the Stats tab for updated pity counts and 5★ history.",
                ],
              ].map(([n, text]) => (
                <li key={n} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-wuwa-accent/20 text-wuwa-accent text-xs font-bold flex items-center justify-center">
                    {n}
                  </span>
                  <span className="text-wuwa-muted pt-0.5">{text}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Tabs explained */}
          <section className="space-y-3">
            <h3 className="font-semibold text-wuwa-accent text-base">Tabs</h3>
            <div className="space-y-2">
              {[
                [
                  "Stats",
                  "Pity bars (5★ and 4★), average pulls per 5★, and a chip list of every 5★ you've pulled on each banner.",
                ],
                [
                  "History",
                  "Paginated full pull log. Filter by star rating, banner, or search by name. Export to CSV with one click.",
                ],
                [
                  "Sync",
                  "Auto-detect or manually paste your convene URL, then trigger a sync.",
                ],
              ].map(([tab, desc]) => (
                <div key={tab} className="bg-wuwa-surface rounded-lg p-3">
                  <span className="font-medium text-wuwa-accent">{tab}</span>
                  <span className="text-wuwa-muted ml-2">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pity reference */}
          <section className="space-y-3">
            <h3 className="font-semibold text-wuwa-accent text-base">
              Pity thresholds
            </h3>
            <div className="overflow-x-auto rounded-lg border border-wuwa-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-wuwa-surface text-wuwa-muted">
                    <th className="text-left px-3 py-2 font-medium">Banner</th>
                    <th className="text-center px-3 py-2 font-medium">
                      Hard pity
                    </th>
                    <th className="text-center px-3 py-2 font-medium">
                      Soft pity starts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wuwa-border">
                  {[
                    ["Featured Resonator", "80", "65"],
                    ["Featured Weapon", "80", "65"],
                    ["Standard Resonator", "80", "65"],
                    ["Standard Weapon", "80", "65"],
                    ["Beginner banners", "50", "~35"],
                  ].map(([banner, hard, soft]) => (
                    <tr key={banner} className="hover:bg-wuwa-border/20">
                      <td className="px-3 py-2">{banner}</td>
                      <td className="px-3 py-2 text-center text-red-400 font-medium">
                        {hard}
                      </td>
                      <td className="px-3 py-2 text-center text-yellow-400">
                        {soft}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-wuwa-muted text-xs">
              ⚡ = soft pity (increased 5★ rate) &nbsp;·&nbsp; 🔥 = hard pity
              (next pull guaranteed 5★)
            </p>
          </section>

          {/* Troubleshooting */}
          <section className="space-y-3">
            <h3 className="font-semibold text-wuwa-accent text-base">
              Troubleshooting
            </h3>
            <div className="space-y-3">
              {[
                {
                  q: "Auto-detect returns No URL found",
                  a: "You haven't opened Convene History this session. Open it in-game, wait for it to load, then try again.",
                },
                {
                  q: "Auto-detect still fails",
                  a: 'Your game is in a non-standard folder. Open Client\\Saved\\Logs\\Client.log in Notepad, search for "aki-gm-resources", copy the full URL, and paste it manually.',
                },
                {
                  q: "Sync fetches 0 new pulls",
                  a: "Those pulls are already stored locally. The tracker deduplicates by time + name + quality, so nothing is double-counted.",
                },
                {
                  q: "Port already in use",
                  a: "Edit server/src/config.ts (change PORT) and client/vite.config.ts (change server.port and the proxy target).",
                },
              ].map(({ q, a }) => (
                <div
                  key={q}
                  className="bg-wuwa-surface rounded-lg p-3 space-y-1">
                  <p className="font-medium text-wuwa-text">Q: {q}</p>
                  <p className="text-wuwa-muted">A: {a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy note */}
          <section className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-1">
            <p className="font-semibold text-green-400">🔒 Privacy</p>
            <p className="text-wuwa-muted">
              The only outbound request is to{" "}
              <code className="text-wuwa-accent bg-wuwa-surface px-1 rounded">
                gmserver-api.aki-game2.net
              </code>{" "}
              — Kuro's own official API, the same one the game uses. No data is
              sent to any third party. Everything is stored in{" "}
              <code className="text-wuwa-accent bg-wuwa-surface px-1 rounded">
                server/data/wuwa_pulls.json
              </code>{" "}
              on your machine.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
