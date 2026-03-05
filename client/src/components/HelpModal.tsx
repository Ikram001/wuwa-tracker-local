/**
 * @file HelpModal.tsx
 * @description In-app help modal.
 *
 * Renders a full step-by-step usage guide, pity reference table,
 * troubleshooting tips, and network transparency note.
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
        className="relative bg-black/80 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-black/85 border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl backdrop-blur">
          <h2 className="text-lg font-semibold text-wuwa-text">
            How to use WuWa Tracker
          </h2>
          <button
            onClick={onClose}
            className="text-wuwa-muted hover:text-wuwa-text text-xl leading-none transition-colors">
            x
          </button>
        </div>

        <div className="px-6 py-5 space-y-7 text-sm text-wuwa-text">
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
                  "Open Convene -> Convene History and wait for the list to fully load. This writes the URL to your local log file.",
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
                  "Check the Stats tab for updated pity counts and 5-star history.",
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

          <section className="space-y-3">
            <h3 className="font-semibold text-wuwa-accent text-base">Tabs</h3>
            <div className="space-y-2">
              {[
                [
                  "Stats",
                  "Pity bars (5-star and 4-star), average pulls per 5-star, and a history list.",
                ],
                [
                  "History",
                  "Paginated full pull log. Filter by star rating, banner, or search by name. Export to CSV.",
                ],
                [
                  "Sync",
                  "Auto-detect or manually paste your convene URL, then trigger a sync.",
                ],
              ].map(([tab, desc]) => (
                <div
                  key={tab}
                  className="hover-card bg-black/50 border border-white/10 rounded-lg p-3">
                  <span className="font-medium text-wuwa-accent">{tab}</span>
                  <span className="text-wuwa-muted ml-2">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-wuwa-accent text-base">
              Pity thresholds
            </h3>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-black/50 text-wuwa-muted">
                    <th className="text-left px-3 py-2 font-medium">Banner</th>
                    <th className="text-center px-3 py-2 font-medium">
                      Hard pity
                    </th>
                    <th className="text-center px-3 py-2 font-medium">
                      Soft pity starts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    ["Featured Resonator", "80", "65"],
                    ["Featured Weapon", "80", "65"],
                    ["Standard Resonator", "80", "65"],
                    ["Standard Weapon", "80", "65"],
                  ].map(([banner, hard, soft]) => (
                    <tr key={banner} className="hover:bg-white/5">
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
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-wuwa-accent text-base">
              Troubleshooting
            </h3>
            <div className="space-y-3">
              {[
                {
                  q: "Auto-detect returns No URL found",
                  a: "Open Convene History in-game, wait for it to load, then try again.",
                },
                {
                  q: "Auto-detect still fails",
                  a: "Open Client\\Saved\\Logs\\Client.log, search for 'aki-gm-resources', and paste that URL manually.",
                },
                {
                  q: "Sync fetches 0 new pulls",
                  a: "Those pulls are already stored locally. The tracker deduplicates by time + name + quality.",
                },
              ].map(({ q, a }) => (
                <div
                  key={q}
                  className="hover-card bg-black/50 border border-white/10 rounded-lg p-3 space-y-1">
                  <p className="font-medium text-wuwa-text">Q: {q}</p>
                  <p className="text-wuwa-muted">A: {a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-1">
            <p className="font-semibold text-green-400">Privacy</p>
            <p className="text-wuwa-muted">
              The only outbound request is to
              <code className="text-wuwa-accent bg-black/50 border border-white/10 px-1 rounded ml-1">
                gmserver-api.aki-game2.net
              </code>
              . Everything is stored locally in
              <code className="text-wuwa-accent bg-black/50 border border-white/10 px-1 rounded ml-1">
                server/data/wuwa_pulls.json
              </code>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
