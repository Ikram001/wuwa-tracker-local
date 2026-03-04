# WuWa Pull Tracker — Local Edition

A fully local Wuthering Waves convene-history tracker. Pull data is fetched directly from Kuro's official API and stored in a JSON file on your own machine — no third-party servers, no accounts.

---

## Prerequisites

- **Node.js 18 LTS** → https://nodejs.org
- **Windows 10/11** _(macOS/Linux: auto-detect won't work, paste URL manually)_

---

## Quick Start (Windows — recommended)

1. Install Node.js if you haven't already
2. Copy all project files into a folder (e.g. `D:\wuwa-pull-tracker`)
3. **Double-click `start.bat`**

That's it. The script installs dependencies, starts both servers, and opens the app in your browser automatically.

> Keep both terminal windows open while using the app. Close them to stop.

---

## Manual Start (any OS)

Open **two separate terminals** and run one command in each:

**Terminal 1 — API server**

```bash
cd server
npm install      # first time only
npm run dev
```

**Terminal 2 — UI**

```bash
cd client
npm install      # first time only
npm run dev
```

Then open **http://localhost:5173** in your browser.

Both must stay running at the same time. The UI proxies all `/api/*` requests to the server on port 4321.

---

## Syncing Your Pulls

> Do this every session before syncing.

1. Launch **Wuthering Waves**
2. Open **Convene → Convene History** and wait for the list to fully load
3. Switch to the browser → click the **Sync** tab
4. Click **Auto-detect URL** — fills the URL box from your game log
5. Click **Sync Pulls** and wait for the green confirmation
6. Check the **Stats** tab for updated pity counts

---

## Tabs

| Tab         | What it does                                                                           |
| ----------- | -------------------------------------------------------------------------------------- |
| **Stats**   | Pity bars (5★ & 4★), 5★ history chips, averages, and totals per banner                 |
| **History** | Full pull log — search by name, filter by star rating or banner, paginated, CSV export |
| **Sync**    | Auto-detect or manually paste your convene URL, then trigger a sync                    |

**Pity thresholds** — all four banners share **80 hard pity** (soft pity begins at 65).

---

## Your Data

```
server/data/wuwa_pulls.json
```

Plain JSON on your own disk. Back it up, move it between machines, or open it in any text editor. Deleting it clears all history — the next sync will re-fetch everything from Kuro's API.

---

## Troubleshooting

**Auto-detect returns "No URL found"**
→ Open Convene History in-game first, wait for it to load, then try again.

**Auto-detect still fails**
→ Open `<GameFolder>\Client\Saved\Logs\Client.log` in Notepad, search for `aki-gm-resources`, copy the full URL, and paste it manually.

**Sync fetches 0 new pulls**
→ Those pulls are already stored. The tracker deduplicates by `time + name + quality`.

**ECONNREFUSED errors in the browser**
→ The API server isn't running. Open a terminal, `cd server`, run `npm run dev`.

**Port conflict**
→ Change `PORT` in `server/src/config.ts` and update the proxy target in `client/vite.config.ts`.

---

## Network Transparency

The only outbound requests made are:

```
POST https://gmserver-api.aki-game2.net/gacha/record/query
```

These are Kuro's own official endpoints — the same ones the game uses internally. Nothing else leaves your machine. Verify in `server/src/routes/sync.ts`.
