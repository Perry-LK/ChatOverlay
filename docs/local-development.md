# Local Development

This guide covers how to run Chat Overlay on your machine for development, testing, and local production-style previews.

## Prerequisites

- Node.js 18+
- npm

## Start the app in development mode

From the repository root:

```powershell
npm install
npm run dev
```

Open the printed local URL in a browser.

To test a specific channel without editing files, append a URL parameter:

```text
?channel=PerryLK
```

## Local production-style preview

Use this when you want to test the built output before deploying.

```powershell
npm install
npm run build
npm run preview
```

## Host the preview on your local network

Use this when OBS or another browser is running on a different machine.

```powershell
npm install
npm run build
npm run host:local
```

## Running with the local Twitch proxy

If you want official Twitch user lookup and Helix badge metadata during development, start the local proxy in a second terminal.

```powershell
$env:TWITCH_CLIENT_ID = 'your-client-id'
$env:TWITCH_CLIENT_SECRET = 'your-client-secret'
$env:PORT = '8787'
npm run proxy:twitch
```

Optional:

```powershell
$env:ALLOW_ORIGIN = 'http://127.0.0.1:5173'
```

Then point the overlay at the proxy with one of these:

- `.env.local`: `VITE_TWITCH_API_BASE=http://localhost:8787`
- `public/config.local.json`: `"twitchApiBase": "http://localhost:8787"`
- URL param: `?twitchApiBase=http://localhost:8787`

## Common local URLs

- Default Vite dev server: `http://127.0.0.1:5173`
- Local proxy health: `http://localhost:8787/health`
- Local proxy global badges: `http://localhost:8787/api/twitch/chat/badges/global`

## Troubleshooting

- If the overlay loads but badges do not appear, add `?debug=1` and inspect the diagnostics panel.
- If the proxy health route shows `hasCredentials: false`, your Twitch env vars are missing in the terminal running the proxy.
- If OBS cannot load the overlay from a local path, use an HTTP URL instead of a `file://` path.