# Custom Domains

This guide covers custom domains for both the overlay frontend and the Twitch proxy.

## Recommended domain layout

Keep the static site and the API on separate hostnames.

Example:

- Overlay: `https://perrychat.uk`
- Worker API: `https://api.perrychat.uk`

This avoids routing conflicts and keeps the architecture simple.

## Frontend custom domain with GitHub Pages

If the overlay is hosted on GitHub Pages:

1. Add the required DNS records at your DNS provider
2. Set the custom domain in GitHub Pages settings
3. Set `PAGES_BASE_PATH=/` as a repository variable
4. Set `PAGES_CUSTOM_DOMAIN=perrychat.uk` as a repository variable
5. Redeploy the Pages workflow

The workflow writes `published/CNAME` after the published build. The generated
file is not stored in the repository.

## Cloudflare Worker custom domain

To use a custom Worker hostname such as `api.perrychat.uk`:

1. Deploy the Worker
2. In Cloudflare, bind the Worker to `api.perrychat.uk`
3. Add Worker secrets:
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`
4. Optionally add `ALLOW_ORIGIN` with the exact overlay origin
5. Validate `https://api.perrychat.uk/health`

Expected result:

```json
{
  "ok": true,
  "hasCredentials": true
}
```

## `ALLOW_ORIGIN` guidance

`ALLOW_ORIGIN` should be the frontend origin, not the Worker hostname.

Example:

- Overlay: `https://perrychat.uk`
- Worker: `https://api.perrychat.uk`
- `ALLOW_ORIGIN=https://perrychat.uk`

## Moving DNS from GoDaddy to Cloudflare

If your domain is registered at GoDaddy, you can still use Cloudflare for DNS and Worker custom domains.

### What changes

- GoDaddy remains the domain registrar
- Cloudflare becomes the DNS provider

### Steps

1. Add the domain to Cloudflare
2. Let Cloudflare import your current DNS records
3. Verify the imported records before switching nameservers
4. Copy the Cloudflare-assigned nameservers
5. In GoDaddy, replace the current nameservers with the Cloudflare ones
6. Wait for propagation
7. Make future DNS changes in Cloudflare, not GoDaddy

### Before you switch nameservers

Verify these records exist in Cloudflare:

- website DNS records
- `www` records
- GitHub Pages records if used
- mail records such as `MX`, `SPF`, `DKIM`, and `DMARC`
- any service verification records

## Post-migration checklist

After the move:

1. Confirm the frontend domain loads correctly
2. Confirm `https://api.perrychat.uk/health` returns JSON
3. Confirm the Worker shows `hasCredentials: true`
4. Set the overlay `twitchApiBase` to the Worker hostname