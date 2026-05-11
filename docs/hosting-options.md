# Hosting Options

Chat Overlay is a static frontend, so you have several hosting choices depending on whether you want a simple static site, a local-only setup, or a production deployment backed by a Twitch proxy.

## Option 1: GitHub Pages

This is the default deployment path for the static overlay.

### Standard repo-hosted Pages

1. Push to `main`
2. In GitHub repository settings, open `Pages`
3. Set source to `GitHub Actions`
4. Let the workflow publish the site

The default URL is:

```text
https://<your-username>.github.io/<repo-name>/
```

### Custom-domain Pages

Use this when the site should live at a root domain or a branded subdomain.

1. Point the domain at GitHub Pages with the required DNS records
2. Set the custom domain in GitHub Pages settings
3. Add repository variable `PAGES_BASE_PATH=/`
4. Add repository variable `PAGES_CUSTOM_DOMAIN=your-domain.example`
5. Redeploy the Pages workflow

## Option 2: Local hosting

Useful for testing, private setups, or LAN-only OBS usage.

### Development server

```powershell
npm install
npm run dev
```

### Production-like preview

```powershell
npm install
npm run build
npm run preview
```

### LAN preview

```powershell
npm install
npm run build
npm run host:local
```

## Option 3: Static site + proxy split

This is the recommended production setup when you want Twitch Helix-backed user lookup and badge metadata.

Recommended layout:

- Static site on GitHub Pages or another static host
- Proxy on Cloudflare Worker or the included local Node proxy

Example:

- Overlay site: `https://perrychat.uk`
- Proxy API: `https://api.perrychat.uk`

Then set:

- `twitchApiBase=https://api.perrychat.uk`
- `ALLOW_ORIGIN=https://perrychat.uk`

## Option 4: Other static hosts

Because the frontend is static after build, you can also host the built `dist/` folder on any static host that supports modern browser assets.

Examples:

- Cloudflare Pages
- Netlify
- Vercel static hosting
- any Nginx or Apache host

If you use another static host, the same proxy options still apply.

## Choosing the right option

- Use GitHub Pages if you want the lowest-friction public deployment.
- Use local hosting if this is only for your own machine or LAN.
- Use a Cloudflare Worker proxy if you want a stable public Helix proxy without exposing secrets.