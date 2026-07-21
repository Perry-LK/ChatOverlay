# Chat Overlay

A static Twitch chat and alerts overlay for OBS, with a browser-based theme
customiser. The frontend has no server-side runtime and reads Twitch chat
anonymously. An optional Node or Cloudflare Worker proxy provides Twitch Helix
metadata without exposing credentials to the browser.

## Quick start

Requirements: Node.js 22 or later and npm.

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/chat/?channel=<channel>`.

## Independent deployment targets

Source files live under `src/`. Builds create two isolated, gitignored folders:

| Target | Command | Output | Purpose |
| --- | --- | --- | --- |
| Local | `npm run build:local` | `local/` | Local/LAN static service |
| Published | `npm run build:published` | `published/` | GitHub Pages artifact |

Run a production-like local service:

```bash
npm run serve:local
```

Use `npm run serve:local:lan` to listen on all network interfaces. Only do this
on a trusted network. The command rebuilds `local/` before serving it.

The Pages workflow builds and uploads only `published/`; local configuration and
the `local/` artifact are never included.

## Environment configuration

Configuration precedence is:

1. Safe defaults in the application
2. `src/public/config.json`
3. The selected environment's `config.json`
4. URL query parameters

Create an optional environment file from its example:

```text
src/environments/local/config.example.json
  -> src/environments/local/config.json

src/environments/published/config.example.json
  -> src/environments/published/config.json
```

Both real files are gitignored. A local build reads only the local file; a
published build reads only the published file and emits it as
`config.environment.json`.

For GitHub Pages, set the repository variable `PUBLISHED_CONFIG_JSON` to the
complete JSON object instead of committing a published environment file.
**Everything deployed to a static site is public. Never put tokens, passwords,
client secrets, or other confidential values in this JSON or in `VITE_*`
variables.**

URL parameters are recommended for OBS-specific settings:

```text
https://<user>.github.io/ChatOverlay/chat/?channel=<channel>&theme=minimalist&showStatus=false
```

See [configuration documentation](docs/configuration.md) for all settings.

## GitHub Pages

1. In repository **Settings → Pages**, select **GitHub Actions** as the source.
2. Push to `main`, or manually run **Deploy to GitHub Pages**.
3. The workflow installs from the lockfile, builds `published/`, and uploads
   only that folder.

Optional repository variables:

| Variable | Purpose |
| --- | --- |
| `PUBLISHED_CONFIG_JSON` | Public deployment configuration as valid JSON |
| `PAGES_BASE_PATH` | `/` for a root custom domain; defaults to `/<repo>/` |
| `PAGES_CUSTOM_DOMAIN` | Custom domain written to generated `published/CNAME` |

No deployment secret is needed. See [hosting options](docs/hosting-options.md)
and [custom domains](docs/custom-domains.md).

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Landing page |
| `/chat/` | Chat overlay |
| `/alerts/` | Alerts overlay |
| `/customise/` | Theme customiser |

## Source layout

```text
src/
├── index.html
├── chat/                 # Chat entry HTML, TypeScript, and CSS
├── alerts/               # Alerts entry and implementation
├── customise/            # Theme customiser
├── app/                  # Shared overlay logic
├── services/             # Twitch and 7TV integrations
├── ui/                   # Rendering helpers
├── public/               # Shared static assets and defaults
└── environments/         # Target-specific config examples
```

`proxy/` and `worker/` are independent optional server-side services. Keep
`TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` only in their runtime secret
stores; never expose them through frontend configuration.

## Validation commands

```bash
npm run typecheck
npm run build:local
npm run build:published
npm audit
```

Worker dependencies are managed separately:

```bash
cd worker
npm ci
npm audit
```

## Documentation

- [Documentation hub](docs/README.md)
- [Local development and hosting](docs/local-development.md)
- [Configuration](docs/configuration.md)
- [Alerts](docs/alerts.md)
- [Proxy setup](docs/proxy-setup.md)
- [Hosting options](docs/hosting-options.md)
- [Custom domains](docs/custom-domains.md)

## License

MIT
