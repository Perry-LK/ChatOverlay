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
