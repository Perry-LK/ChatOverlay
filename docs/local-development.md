# Local Development and Hosting

## Prerequisites

- Node.js 22 or later
- npm

Install exactly the dependencies in the lockfile:

```bash
npm ci
```

## Development server

```bash
npm run dev
```

Vite serves source directly from `src/` at `http://127.0.0.1:5173`. Common
routes are `/chat/`, `/alerts/`, and `/customise/`.

To apply local-only defaults, copy:

```text
src/environments/local/config.example.json
  -> src/environments/local/config.json
```

The destination is gitignored and is never read by the published build.

## Independent local service

Build and start the production-like local server:

```bash
npm run serve:local
```

This creates the gitignored `local/` folder and serves it on the loopback
interface. To expose it to OBS on another machine:

```bash
npm run serve:local:lan
```

LAN mode listens on all interfaces. Use it only on a trusted network and use a
host firewall to limit access.

## Optional Twitch proxy

Set credentials in the process environment, never in frontend files:

```powershell
$env:TWITCH_CLIENT_ID = 'your-client-id'
$env:TWITCH_CLIENT_SECRET = 'your-client-secret'
$env:ALLOW_ORIGIN = 'http://127.0.0.1:5173'
npm run proxy:twitch
```

Then set `twitchApiBase` to `http://localhost:8787` in the local environment
config or URL. See [proxy setup](./proxy-setup.md).

## Validation

```bash
npm run typecheck
npm run build:local
npm run build:published
npm audit
```

Generated `local/` and `published/` folders are disposable and must not be
committed.
