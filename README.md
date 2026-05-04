# Chat Overlay

A lightweight, transparent Twitch chat overlay for OBS browser sources, with
**7TV** emote support (including animated and zero-width emotes), Twitch
sub/mod/VIP/bits badges, replies, bits highlighting, and bot filtering.

No authentication required — chat is read anonymously over Twitch IRC.

## Features

- Twitch IRC chat (anonymous read-only — no login or token needed)
- 7TV global + channel emotes (animated AVIF/WEBP, zero-width stacking)
- Twitch native emotes via official CDN
- Twitch global + channel badges
- Reply context lines
- Cheers / bits highlighting (tier-coloured)
- Bot filtering (Nightbot/StreamElements/Moobot/Fossabot by default)
- Optional fade-out after N seconds
- Built-in `comfy` and `minimalist` theme templates
- Fully customisable look via `custom.css`
- Configurable per channel via `config.json` or URL query parameters
- Deploys to GitHub Pages out of the box
- Works with standard GitHub Pages, custom domains, or local hosting
- Optional Twitch Helix proxy for official user lookup and badge metadata

## Quick start (local dev)

```powershell
npm install
npm run dev
```

Open the printed URL in a browser. Add `?channel=PerryLK` to test a different
channel without editing `config.json`.

## Configuration

Configuration is layered. Each layer overrides the previous one, so you can
keep the public repo neutral and ship a private overlay just by setting URL
parameters or a non-committed config file.

1. **Built-in defaults** — generic, channel-agnostic.
2. **Build-time env** — `.env.local` with `VITE_DEFAULT_CHANNEL` /
   `VITE_DEFAULT_THEME` (gitignored; baked into the bundle at build time).
3. **`public/config.json`** — committed default for the deployed site.
4. **`public/config.local.json`** — private overrides. Gitignored locally,
   and can be written from a repo secret at deploy time.
5. **URL query parameters** — final per-instance override; ideal for OBS.

`twitchApiBase` can be set in `config.local.json`, `.env.local`, or the URL to
point the browser overlay at your own Twitch Helix proxy.

### URL-driven configuration (recommended for OBS)

Every setting can be set straight from the browser-source URL, so a single
deployment can power many overlays without editing any files:

```
https://you.github.io/ChatOverlay/?channel=PerryLK&theme=minimalist&fadeOutSeconds=30&showBadges=false&showStatus=false
```

A fully-explicit example covering every supported parameter:

```
?channel=PerryLK
&theme=comfy
&twitchApiBase=http://localhost:8787
&fadeOutSeconds=0
&maxMessages=100
&showBadges=true
&showReplies=true
&showBits=true
&showDeleted=false
&showStatus=false
&ignoreCommands=true
&animateEmotes=true
&ignoredUsers=nightbot,streamelements,moobot,fossabot
```

Boolean params accept `true/false`, `1/0`, `yes/no`, `on/off`.
`ignoredUsers` is a comma-separated list. The `#` prefix on `channel` is
optional and case is ignored.

### `public/config.json`

The committed default that ships with the site:

```json
{
  "channel": "twitch",
  "theme": "comfy",
  "fadeOutSeconds": 0,
  "maxMessages": 100,
  "showBadges": true,
  "showReplies": true,
  "showBits": true,
  "showDeleted": false,
  "showStatus": true,
  "ignoredUsers": ["nightbot", "streamelements", "moobot", "fossabot"],
  "ignoreCommands": true,
  "animateEmotes": true
}
```

| Key             | Type        | Notes                                                         |
| --------------- | ----------- | ------------------------------------------------------------- |
| channel         | string      | Twitch login (case-insensitive). `#` prefix optional.         |
| theme           | string      | Built-ins: `comfy`, `minimalist`, or `none`.                  |
| twitchApiBase   | string      | Optional base URL of your Twitch Helix proxy.                 |
| fadeOutSeconds  | number      | `0` disables fading. Otherwise messages fade after N seconds. |
| maxMessages     | number      | Hard cap on messages kept in the DOM.                         |
| showBadges      | boolean     | Show user badges (sub/mod/VIP/bits/etc.).                     |
| showReplies     | boolean     | Show "↪ @parent: …" reply context line.                       |
| showBits        | boolean     | Highlight cheermotes and bits messages.                       |
| showDeleted     | boolean     | If true, deleted messages are struck through; if false, removed. |
| showStatus      | boolean     | Show the small connection-status indicator. Hide for clean OBS captures. |
| ignoredUsers    | string[]    | Logins to hide entirely. Lower-cased automatically.           |
| ignoreCommands  | boolean     | Hide messages starting with `!`.                              |
| animateEmotes   | boolean     | Use animated 7TV/Twitch emote URLs.                           |

### Private configuration (not in the repo)

For anything you do not want pushed to a public repo — your default channel,
your custom domain, etc. — use one of these mechanisms.

**Local machine:** copy `public/config.local.json.example` to
`public/config.local.json` and set whatever you want overridden. The file is
gitignored. It is loaded after `config.json` at runtime, so it transparently
overrides the public defaults during `npm run dev`, `npm run build`, and
`npm run preview`.

For build-time defaults that get baked into the bundle (and therefore work
even if `config.local.json` is removed from the deployed site), copy
`.env.example` to `.env.local` and set:

```
VITE_DEFAULT_CHANNEL=PerryLK
VITE_DEFAULT_THEME=comfy
VITE_TWITCH_API_BASE=http://localhost:8787
```

**GitHub Actions deploy:** instead of committing private values, set them as
repository **Variables** or **Secrets** under *Settings → Secrets and variables
→ Actions*. The deploy workflow recognises:

| Name                    | Kind            | Effect                                                                 |
| ----------------------- | --------------- | ---------------------------------------------------------------------- |
| `OVERLAY_CONFIG_LOCAL`  | Secret or Var   | Full JSON written to `public/config.local.json` at build time.         |
| `PAGES_CUSTOM_DOMAIN`   | Variable        | When set, writes `public/CNAME` with this domain at build time.        |
| `PAGES_BASE_PATH`       | Variable        | Override Vite `base`. Use `/` for a custom domain at the root.         |
| `VITE_DEFAULT_CHANNEL`  | Variable        | Build-time default channel, baked into the bundle.                     |
| `VITE_DEFAULT_THEME`    | Variable        | Build-time default theme, baked into the bundle.                       |

Nothing in this list needs to be committed to the repo, so the public source
tree stays neutral while your deployed site uses your private values.

## Twitch API app setup

Twitch Helix badge endpoints require authenticated server-side access. Do not
put your Twitch client secret in the browser bundle or OBS URL.

This repo now includes a tiny local proxy at [proxy/server.mjs](proxy/server.mjs)
that exchanges your client ID and secret for an app access token and exposes
only the endpoints the overlay needs.

### 1. Create a Twitch application

1. Go to the Twitch developer console: https://dev.twitch.tv/console/apps
2. Click **Register Your Application**.
3. Name it something like `ChatOverlay Local Proxy`.
4. Set **OAuth Redirect URL** to `http://localhost`.
5. Set **Category** to `Application Integration`.
6. Save, then copy the **Client ID** and generate/copy the **Client Secret**.

For this proxy, the redirect URL is not actively used; Twitch still requires
one when you register the app.

### 2. Run the local proxy

In PowerShell:

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

Available routes:

- `GET /health`
- `GET /api/twitch/users?login=<login>`
- `GET /api/twitch/chat/badges/global`
- `GET /api/twitch/chat/badges?broadcaster_id=<id>`

### 3. Point the overlay at the proxy

Set one of the following:

- `.env.local`: `VITE_TWITCH_API_BASE=http://localhost:8787`
- `public/config.local.json`: `"twitchApiBase": "http://localhost:8787"`
- URL param: `?twitchApiBase=http://localhost:8787`

Once set, the overlay uses the proxy for user lookup and badge metadata first,
then falls back to the old public lookups only if the proxy is unavailable.

### Cloudflare Worker deployment (always-on, heavily cached)

For an always-on, free, low-maintenance proxy, deploy the same surface as a
Cloudflare Worker. Source lives under [worker/](worker/) and is independent
from the static overlay build.

Why this is a good fit:

- Twitch app token is cached at the edge (KV), shared across requests.
- Helix responses are cached in Cloudflare's edge cache:
  - User lookups: 24h
  - Global badges: 24h
  - Channel badges: 6h
- Hot paths typically never reach Twitch.

One-time setup:

```powershell
cd worker
npm install
npx wrangler login

# Required secrets — never commit these
npx wrangler secret put TWITCH_CLIENT_ID
npx wrangler secret put TWITCH_CLIENT_SECRET

# Optional KV namespace for shared token cache
npx wrangler kv namespace create OVERLAY_KV
# then paste the returned id into wrangler.toml

npm run deploy
```

Once deployed, Cloudflare prints a URL like
`https://chatoverlay-twitch-proxy.<your-subdomain>.workers.dev`. Use that as
`twitchApiBase` (env, config, or URL param). For production, also set
`ALLOW_ORIGIN` in `wrangler.toml` to your overlay's exact origin so the worker
only serves your site:

```toml
[vars]
ALLOW_ORIGIN = "https://you.github.io"
```

## Customiser (`/customise/`)

A built-in editor at `/customise/` lets you visually tune every part of the
chat (message text, username, badges, replies, cheers, emotes, message card)
and exports the result as a **single shareable URL** with everything baked in:

```
https://you.github.io/ChatOverlay/?channel=PerryLK&theme64=eyJ2YXJzIjp7Ii0...
```

Features:

- Live preview using sample messages (no Twitch connection needed).
- Per-element CSS variable inputs (colour pickers, sizes, fonts).
- Visibility toggles for badges, replies, bits, status indicator.
- Free-form raw CSS section for surgical overrides.
- Import / export the underlying JSON for sharing or version control.

The encoded payload travels in `?theme64=...` (URL-safe base64). Nothing is
uploaded — the editor produces the URL entirely client-side.

## Debug mode

The overlay is silent by default — the connection-status indicator is hidden
so captures stay clean. Append `?debug=1` to the URL to enable a diagnostics
panel in the top-left corner that surfaces:

- Resolved Twitch user-id (or `null` if the lookup failed).
- IRC connection state.
- Badge map size, sample keys, and the exact fetch error if any.
- 7TV emote count and any load error.
- Whether a `theme64` custom theme was applied.
- Rolling list of warnings emitted at runtime.

Use this if badges or emotes are not appearing as expected — it tells you
whether the IRC payload contains them, whether the metadata fetch failed, and
which source (baseline / api / partial) is currently in use.

## Customising the look

Two built-in templates ship in `public/themes/`:

- `comfy`: soft translucent message cards with more spacing.
- `minimalist`: very light chrome and tighter spacing.

Switch theme in `public/config.json` or by URL:

```
https://you.github.io/ChatOverlay/?theme=comfy
https://you.github.io/ChatOverlay/?theme=minimalist
```

Drop a `custom.css` next to `index.html` (in `/public` for dev, or in the
deployed site root). It is loaded after the base stylesheet and can override
the selected theme. The base styles expose CSS variables you can tweak:

Example override files are included in `public/custom.css.example` and
`public/CNAME.example`.

- Copy `public/custom.css.example` to `public/custom.css` to start a custom theme override.
- Copy `public/CNAME.example` to `public/CNAME` only if you are enabling a custom domain.

```css
:root {
  --co-font: 'Inter', sans-serif;
  --co-font-size: 22px;
  --co-text: #fff;
  --co-text-shadow: 0 0 3px #000;
  --co-emote-size: 1.8em;
  --co-fade-duration: 600ms;
}
```

Or override individual classes: `.msg`, `.username`, `.badge`, `.emote`,
`.reply`, `.cheer`, `.zw-stack`.

## Source layout

The `src/` folder is organized by concern:

- `src/app/`: overlay controller, IRC-to-chat mapping, theme application.
- `src/services/twitch/`: Twitch IRC, badge loading, user-id lookup.
- `src/services/emotes/`: 7TV emote loading.
- `src/ui/`: DOM rendering.
- `src/styles/`: base stylesheet entry.
- `src/main.ts`: application entrypoint.
- `src/config.ts` and `src/types.ts`: shared runtime config and types.

## Adding to OBS

1. In OBS, add a **Browser** source.
2. URL: your deployed page or local web server URL, with optional query params.
   Example: `https://you.github.io/ChatOverlay/?channel=PerryLK&theme=comfy`.
3. Width / height: whatever fits your layout (e.g. 480 × 720).
4. Tick **Shutdown source when not visible** if you want to save resources.
5. Background is fully transparent — no extra config needed.

Use a local server URL rather than a raw `file://` path. The overlay loads
module scripts and fetches `config.json`, which is more reliable through HTTP.

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and publishes on push to
`main`. By default it assumes standard repo-hosted GitHub Pages. After enabling
Pages in your repo settings (Source: GitHub Actions), the site will be
available at:

```
https://<your-username>.github.io/<repo-name>/
```

The workflow defaults `BASE_PATH` to `/<repo-name>/`, which is what Vite needs
for repo-hosted Pages.

### Standard GitHub Pages

Use the repository as-is.

1. Push to `main`.
2. In GitHub repo settings, open **Pages**.
3. Set the source to **GitHub Actions**.
4. Your overlay will publish under `https://<your-username>.github.io/<repo-name>/`.

### Custom domain override

If you want to host the same build on a root custom domain such as
`https://perrychat.uk/`, treat that as a private deployment override rather
than something committed to the repo.

1. In your DNS provider, point the domain at GitHub Pages using GitHub's
   documented records.
2. In GitHub repo settings, open **Pages** and set the custom domain.
3. Add a repository **Variable** named `PAGES_BASE_PATH` with the value `/`.
4. Add a repository **Variable** named `PAGES_CUSTOM_DOMAIN` with the value
   `your-domain.example`. The deploy workflow writes `public/CNAME` at build
   time from this variable, so the domain never lands in the public repo.
5. Re-run the Pages workflow or push a new commit.

If you later move back to standard repo-hosted Pages, delete the
`PAGES_BASE_PATH` and `PAGES_CUSTOM_DOMAIN` variables; the next deploy reverts
to `/<repo-name>/` and no `CNAME`.

### Local hosting

This project is static after build, so it can also be hosted locally.

For local development with hot reload:

```powershell
npm install
npm run dev
```

For a local production-like preview:

```powershell
npm install
npm run build
npm run preview
```

To expose the preview on your local network, for example if OBS is running on a
different machine:

```powershell
npm install
npm run build
npm run host:local
```

You can also serve the generated `dist/` folder with any static file server on
your machine or LAN and use that URL in OBS.

## How it works

- **IRC**: Connects to `wss://irc-ws.chat.twitch.tv:443` as `justinfan<random>`
  — Twitch's well-known anonymous read-only login. No OAuth.
- **User-id lookup**: Uses public services (decapi.me, fallback ivr.fi) to
  resolve `channel` → numeric user ID, required for channel-scoped badges
  and 7TV emote sets.
- **Badges**: Public endpoint
  `https://badges.twitch.tv/v1/badges/{global|channels/<id>}/display`.
- **7TV**: `https://7tv.io/v3/users/twitch/<id>` for channel emotes,
  `https://7tv.io/v3/emote-sets/global` for globals.
- **Twitch native emotes**: positions are taken from the IRC `emotes` tag and
  rendered via `https://static-cdn.jtvnw.net/emoticons/v2/<id>/...`.

No third-party API keys are required.

## License

MIT
