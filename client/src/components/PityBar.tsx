/**
 * @file PityBar.tsx
 * @description Animated progress bar for displaying pity counters.
 *
 * Visual states:
 *  - Normal  → solid fill at the configured colour
 *  - Soft    → ⚡ label, yellow text on the counter
 *  - Hard    → 🔥 label, red text, pulsing animation
 *
 * @param current - Current pity count (pulls since last 5★ / 4★).
 * @param max     - Hard-pity threshold for this banner and quality tier.
 * @param label   - Short label shown above the bar (e.g. "5★ Pity").
 * @param color   - Tailwind colour token: "gold" | "silver" | "accent".
 */

interface PityBarProps {
  current: number;
  max: number;
  label: string;
  color?: "gold" | "silver" | "accent";
}

const COLOR_CLASS: Record<string, string> = {
  gold: "bg-wuwa-gold",
  silver: "bg-wuwa-silver",
  accent: "bg-wuwa-accent",
};

export default function PityBar({
  current,
  max,
  label,
  color = "accent",
}: PityBarProps) {
  const pct = Math.min((current / max) * 100, 100);
  const softPity = max <= 50 ? Math.floor(max * 0.7) : max - 15;
  const isSoft = current >= softPity && current < max;
  const isHard = current >= max;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-wuwa-muted">
        <span>{label}</span>
        <span
          className={
            isHard
              ? "text-red-400 font-semibold"
              : isSoft
                ? "text-yellow-400"
                : "text-wuwa-text"
          }>
          {current} / {max}
          {isHard && " 🔥"}
          {isSoft && " ⚡"}
        </span>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${COLOR_CLASS[color]} ${isHard ? "animate-pulse" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
