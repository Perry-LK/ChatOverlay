# Hosting Options

## Local static service

```bash
npm ci
npm run serve:local
```

The command builds `local/` and serves it on loopback. Use
`npm run serve:local:lan` only on trusted networks.

## GitHub Pages

The workflow on `main`:

1. Installs dependencies with `npm ci`
2. Reads only the published environment configuration
3. Runs `npm run build:published`
4. Uploads only `published/`
5. Deploys that artifact through the protected `github-pages` environment

Enable **Settings → Pages → Source: GitHub Actions**. Optional variables are
documented in the project [README](../README.md).

The workflow never uploads the repository, `src/`, `local/`, local
configuration, the optional proxy, or the Worker.

## Other static hosts

Run `npm run build:published` and deploy only `published/`. Configure
`BASE_PATH` for the host's URL prefix before building.

## Optional API split

The frontend remains static. Twitch Helix credentials belong in the included
Node proxy or Cloudflare Worker, hosted separately with:

- HTTPS
- exact-origin CORS through `ALLOW_ORIGIN`
- credentials stored in the platform's secret store

See [proxy setup](./proxy-setup.md).
