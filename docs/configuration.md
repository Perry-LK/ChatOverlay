# Environment Configuration

## Precedence

Later layers override earlier layers:

1. Built-in defaults
2. Shared `src/public/config.json`
3. Target-specific `config.environment.json`
4. URL query parameters

Vite-prefixed process variables can provide build-time defaults, but their
values are embedded in browser code. They are public and must never contain
secrets.

## Shared configuration

`src/public/config.json` contains safe, non-sensitive defaults used by both
targets.

Supported settings include:

| Key | Type | Notes |
| --- | --- | --- |
| `channel` | string | Twitch login |
| `theme` | string | `comfy`, `minimalist`, or `none` |
| `twitchApiBase` | string | Optional proxy URL; never a credential |
| `fadeOutSeconds` | number | `0` disables fading |
| `maxMessages` | number | Minimum `1` |
| `showBadges` | boolean | Show user badges |
| `showReplies` | boolean | Show reply context |
| `showBits` | boolean | Highlight cheers |
| `showDeleted` | boolean | Retain deleted messages |
| `showStatus` | boolean | Show connection status |
| `ignoredUsers` | string[] | Usernames to hide |
| `ignoreCommands` | boolean | Hide `!` commands |
| `animateEmotes` | boolean | Prefer animated emotes |

## Local environment

Copy `src/environments/local/config.example.json` to
`src/environments/local/config.json`. It is used by `npm run dev` and
`npm run build:local`, and emitted only into `local/config.environment.json`.

## Published environment

For manual builds, copy `src/environments/published/config.example.json` to
`src/environments/published/config.json`. It is used only by
`npm run build:published`.

For GitHub Pages, create a repository **Variable** named
`PUBLISHED_CONFIG_JSON` containing valid JSON. The workflow validates it before
building. Do not use a secret: a static deployment makes the resulting file
publicly downloadable.

## URL overrides

URL settings are useful for keeping each OBS scene independent:

```text
/chat/?channel=<channel>&theme=comfy&fadeOutSeconds=30&showBadges=true
```

Boolean values accept `true/false`, `1/0`, `yes/no`, and `on/off`.
`ignoredUsers` is a comma-separated list.

## Security rules

- Never place Twitch client secrets, access tokens, passwords, or private keys
  in `src/`, environment JSON, URLs, repository variables, or `VITE_*` values.
- Keep proxy credentials in process environment variables or a platform secret
  store.
- Treat custom CSS and `theme64` payloads as untrusted when sharing URLs.
- Restrict proxy CORS with `ALLOW_ORIGIN` in production.
