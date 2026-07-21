# Twitch Proxy Setup

This guide covers both proxy options included in the project:

- the local Node proxy in `proxy/server.mjs`
- the Cloudflare Worker proxy in `worker/`

Use either option to keep your Twitch client secret out of the browser while still accessing Helix-backed badge and user metadata.

## What the proxy does

The proxy exchanges your Twitch client ID and client secret for an app access token and exposes only the endpoints the overlay needs.

Available routes:

- `GET /health`
- `GET /api/twitch/users?login=<login>`
- `GET /api/twitch/chat/badges/global`
- `GET /api/twitch/chat/badges?broadcaster_id=<id>`

## 1. Create a Twitch application

1. Go to https://dev.twitch.tv/console/apps
2. Click `Register Your Application`
3. Name it something like `ChatOverlay Proxy`
4. Set the OAuth redirect URL to `http://localhost`
5. Choose `Application Integration`
6. Save the app and copy the client ID and client secret

The redirect URL is not actively used by this project, but Twitch still requires it when you register the app.

## 2. Local Node proxy setup

From the repository root:

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

Validate it with:

- `http://localhost:8787/health`
- `http://localhost:8787/api/twitch/chat/badges/global`

## 3. Cloudflare Worker setup

The Worker source lives in `worker/` and can be deployed independently from the static site.

One-time setup:

```powershell
cd worker
npm install
npx wrangler login
```

Required secrets:

```powershell
npx wrangler secret put TWITCH_CLIENT_ID
npx wrangler secret put TWITCH_CLIENT_SECRET
```

Optional shared token cache with KV:

```powershell
npx wrangler kv namespace create OVERLAY_KV
```

If you create the KV namespace, paste the returned ID into `worker/wrangler.toml`.

Deploy with:

```powershell
npm run deploy
```

## Recommended Cloudflare build settings

- Build command: leave blank
- Deploy command: `npm run deploy`
- Path: `worker/`

## Worker environment values

Required:

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`

Optional:

- `ALLOW_ORIGIN`
- `USERS_TTL_SECONDS`
- `BADGES_GLOBAL_TTL`
- `BADGES_CHANNEL_TTL`

## Worker validation

After deploy, check:

- `https://<your-worker-domain>/health`
- `https://<your-worker-domain>/api/twitch/chat/badges/global`

Expected health response:

```json
{
  "ok": true,
  "hasCredentials": true
}
```

If `hasCredentials` is `false`, the Worker is live but the Twitch secrets are missing from that environment.

## 4. Point the overlay at the proxy

Set one of these:

- Local environment config: `"twitchApiBase": "https://api.example.com"`
- Published environment config: `"twitchApiBase": "https://api.example.com"`
- URL param: `?twitchApiBase=https://api.example.com`