# Project Configuration

This guide explains how runtime configuration is layered and how to override settings for local development, production, and OBS scenes.

## Configuration precedence

Each layer overrides the previous one:

1. Built-in defaults
2. Build-time env from `.env.local`
3. `public/config.json`
4. `public/config.local.json`
5. URL query parameters

`twitchApiBase` can be set in `.env.local`, `public/config.local.json`, `public/config.json`, or the browser URL.

## Runtime config file

The committed default config lives in `public/config.json`.

Example:

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

## Supported settings

| Key | Type | Notes |
| --- | --- | --- |
| channel | string | Twitch login. `#` prefix is optional. |
| theme | string | Built-ins: `comfy`, `minimalist`, or `none`. |
| twitchApiBase | string | Optional base URL of the local proxy or Worker proxy. |
| fadeOutSeconds | number | `0` disables fading. |
| maxMessages | number | DOM message cap. |
| showBadges | boolean | Show user badges. |
| showReplies | boolean | Show reply preview text. |
| showBits | boolean | Highlight cheermotes and bits messages. |
| showDeleted | boolean | Strike through deleted messages or remove them. |
| showStatus | boolean | Show the connection status indicator. |
| ignoredUsers | string[] | Logins to hide entirely. |
| ignoreCommands | boolean | Hide messages starting with `!`. |
| animateEmotes | boolean | Prefer animated emote assets. |

## URL-driven configuration

Every setting can be passed as a query parameter, which makes it suitable for OBS browser sources.

Example:

```text
https://you.github.io/ChatOverlay/chat/?channel=PerryLK&theme=minimalist&fadeOutSeconds=30&showBadges=false&showStatus=false
```

Fully explicit example:

```text
?channel=PerryLK
&theme=comfy
&twitchApiBase=https://api.example.com
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

Boolean query parameters accept `true/false`, `1/0`, `yes/no`, and `on/off`.

## Private local overrides

Use `public/config.local.json` for settings you do not want committed.

Example:

```json
{
  "channel": "PerryLK",
  "twitchApiBase": "https://api.perrychat.uk"
}
```

## Build-time env overrides

Copy `.env.example` to `.env.local` and set values such as:

```text
VITE_DEFAULT_CHANNEL=PerryLK
VITE_DEFAULT_THEME=comfy
VITE_TWITCH_API_BASE=https://api.perrychat.uk
```

## GitHub Actions deployment overrides

The Pages workflow supports the following repository variables or secrets:

| Name | Kind | Effect |
| --- | --- | --- |
| OVERLAY_CONFIG_LOCAL | Secret or variable | Writes `public/config.local.json` at build time. |
| PAGES_CUSTOM_DOMAIN | Variable | Writes `public/CNAME` at build time. |
| PAGES_BASE_PATH | Variable | Overrides Vite base path. Use `/` for a root custom domain. |
| VITE_DEFAULT_CHANNEL | Variable | Build-time default channel. |
| VITE_DEFAULT_THEME | Variable | Build-time default theme. |

## Debugging configuration issues

Append `?debug=1` to the overlay URL to see:

- resolved Twitch user ID
- badge fetch source and errors
- 7TV emote load status
- whether a `theme64` custom theme was applied
- recent runtime warnings