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
- Fully customisable look via `custom.css`
- Configurable per channel via `config.json` or URL query parameters
- Deploys to GitHub Pages out of the box

## Quick start (local dev)

```powershell
npm install
npm run dev
```

Open the printed URL in a browser. Add `?channel=PerryLK` to test a different
channel without editing `config.json`.

## Configuration

Edit `public/config.json`:

```json
{
  "channel": "PerryLK",
  "fadeOutSeconds": 0,
  "maxMessages": 100,
  "showBadges": true,
  "showReplies": true,
  "showBits": true,
  "showDeleted": false,
  "ignoredUsers": ["nightbot", "streamelements", "moobot", "fossabot"],
  "ignoreCommands": true,
  "animateEmotes": true
}
```

Anything in this file can also be overridden at runtime via URL query
parameters, which is convenient for OBS:

```
https://you.github.io/ChatOverlay/?channel=PerryLK&fadeOutSeconds=30&showBadges=false
```

| Key             | Type        | Notes                                                         |
| --------------- | ----------- | ------------------------------------------------------------- |
| channel         | string      | Twitch login (case-insensitive). `#` prefix optional.         |
| fadeOutSeconds  | number      | `0` disables fading. Otherwise messages fade after N seconds. |
| maxMessages     | number      | Hard cap on messages kept in the DOM.                         |
| showBadges      | boolean     | Show user badges (sub/mod/VIP/bits/etc.).                     |
| showReplies     | boolean     | Show "↪ @parent: …" reply context line.                       |
| showBits        | boolean     | Highlight cheermotes and append a bits tally to messages.     |
| showDeleted     | boolean     | If true, deleted messages are struck through; if false, removed. |
| ignoredUsers    | string[]    | Logins to hide entirely. Lower-cased automatically.           |
| ignoreCommands  | boolean     | Hide messages starting with `!`.                              |
| animateEmotes   | boolean     | Use animated 7TV/Twitch emote URLs.                           |

## Customising the look

Drop a `custom.css` next to `index.html` (in `/public` for dev, or in the
deployed site root). It is loaded after the base stylesheet and can override
any rule. The base styles expose CSS variables you can tweak:

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

## Adding to OBS

1. In OBS, add a **Browser** source.
2. URL: your deployed page (or a local file path), with optional query params.
   Example: `https://you.github.io/ChatOverlay/?channel=PerryLK`.
3. Width / height: whatever fits your layout (e.g. 480 × 720).
4. Tick **Shutdown source when not visible** if you want to save resources.
5. Background is fully transparent — no extra config needed.

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and publishes on push to
`main`. After enabling Pages in your repo settings (Source: GitHub Actions),
the site will be available at:

```
https://<your-username>.github.io/<repo-name>/
```

The Vite `base` path is auto-set to match the repo name during the workflow.

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
