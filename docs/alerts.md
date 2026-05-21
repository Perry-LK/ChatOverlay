# Alerts overlay

A second browser source (`/alerts/`) that sits alongside the chat overlay and
shows pop-up notifications for events on a Twitch channel. It uses the same
anonymous IRC connection as the chat overlay, so **no authentication is
required** — paste the URL into an OBS browser source and you're done.

## Supported events

All events that Twitch sends over IRC (and are visible to anonymous viewers):

| Type               | URL key            | Trigger                                  |
| ------------------ | ------------------ | ---------------------------------------- |
| New subscription   | `sub`              | First-time paid sub                      |
| Resub              | `resub`            | Re-subscription (months + optional note) |
| Gifted sub         | `subgift`          | Single sub gifted to a viewer            |
| Sub bomb           | `submysterygift`   | Bulk gift to the community               |
| Continued gift sub | `giftpaidupgrade`  | Recipient continues a gifted sub         |
| Raid               | `raid`             | Incoming raid                            |
| Announcement       | `announcement`     | `/announce` from a mod or broadcaster    |
| Cheer              | `cheer`            | PRIVMSG with bits ≥ `minBits`            |
| Bits badge tier    | `bitsbadgetier`    | Viewer unlocks a new bits badge tier     |

> Follow alerts require an authenticated EventSub subscription and so are not
> supported by the anonymous overlay. Use a dedicated follow alert service if
> you need them.

## Quick start

1. Build/deploy the site as normal (`npm run build`, then host `dist/`).
2. In OBS, add a Browser Source pointing at:

   ```
   https://you.github.io/ChatOverlay/alerts/?channel=PerryLK
   ```

3. Set a reasonable size (e.g. 720 × 240) and tick **Shutdown source when not
   visible** so the IRC socket only runs while the scene is active.

To preview styling without waiting for a real event, append `?test=`:

```
.../alerts/?channel=PerryLK&test=sub,resub,raid,cheer,announcement
```

## URL parameters

| Parameter         | Default | Description                                                                           |
| ----------------- | ------- | ------------------------------------------------------------------------------------- |
| `channel`         | —       | Twitch channel login (case-insensitive, `#` optional).                                |
| `theme`           | `comfy` | Shared theme name from `public/themes/`.                                              |
| `theme64`         | —       | Base64 custom theme exported from `/customise/`. Font/colour variables apply.         |
| `durationSeconds` | `7`     | How long each alert stays on screen.                                                  |
| `maxQueue`        | `5`     | Cap on queued alerts; older ones are dropped when exceeded.                           |
| `minBits`         | `100`   | Minimum bits in one cheer required to trigger a cheer alert.                          |
| `types`           | all     | Whitelist of enabled alert types, comma-separated (e.g. `types=sub,resub,raid`).      |
| `disable`         | none    | Blacklist of alert types to disable (e.g. `disable=announcement,bitsbadgetier`).      |
| `test`            | none    | Comma-separated alert types to fire as sample events after load.                      |
| `showStatus`      | `false` | Show a small connection-status pill in the corner.                                    |
| `debug`           | `false` | Log the resolved config to the browser console (also forces `showStatus=true`).       |

## `config.json` integration

The alerts overlay reads the same `public/config.json` /
`public/config.local.json` files as the chat overlay. Top-level `channel`,
`theme`, `theme64` and `twitchApiBase` are shared automatically. Alerts-only
settings live under an `alerts` key, which takes precedence when present:

```json
{
  "channel": "PerryLK",
  "theme": "comfy",
  "alerts": {
    "durationSeconds": 8,
    "minBits": 200,
    "enabled": {
      "announcement": false,
      "bitsbadgetier": false
    }
  }
}
```

## Theming notes

The alerts page reuses the chat overlay's CSS variables (font, text colour,
text shadow) so a custom `theme64` carries the typography across both browser
sources. Per-alert accent colours, layout and card styling live in
`src/alerts/styles.css` and can be overridden by a `public/custom.css` file
exactly like the chat overlay.
