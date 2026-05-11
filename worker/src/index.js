/**
 * Cloudflare Worker: Twitch Helix proxy for Chat Overlay.
 *
 * Exposes only the read-only endpoints the overlay needs and caches responses
 * heavily so traffic to Twitch Helix stays minimal. Created by PerryLK
 *
 * Required secrets (set with `wrangler secret put`):
 *   TWITCH_CLIENT_ID
 *   TWITCH_CLIENT_SECRET
 *
 * Optional vars (in wrangler.toml `[vars]`):
 *   ALLOW_ORIGIN          Exact origin allowed (default: *).
 *   USERS_TTL_SECONDS     Cache TTL for /api/twitch/users (default: 86400).
 *   BADGES_GLOBAL_TTL     Cache TTL for global badges (default: 86400).
 *   BADGES_CHANNEL_TTL    Cache TTL for channel badges (default: 21600).
 */

const TOKEN_KEY = 'twitch:app-token';

export default {
	async fetch(request, env, ctx) {
		const allowOrigin = env.ALLOW_ORIGIN || '*';
		const corsHeaders = {
			'access-control-allow-origin': allowOrigin,
			'access-control-allow-methods': 'GET, OPTIONS',
			'access-control-allow-headers': 'content-type',
			'vary': 'origin',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}
		if (request.method !== 'GET') {
			return json({ error: 'Method not allowed' }, 405, corsHeaders);
		}

		const url = new URL(request.url);

		try {
			if (url.pathname === '/health') {
				return json({
					ok: true,
					hasCredentials: Boolean(env.TWITCH_CLIENT_ID && env.TWITCH_CLIENT_SECRET),
				}, 200, corsHeaders);
			}

			if (url.pathname === '/api/twitch/users') {
				const login = (url.searchParams.get('login') || '').toLowerCase();
				if (!login) return json({ error: 'Missing login query param' }, 400, corsHeaders);
				const ttl = numberOr(env.USERS_TTL_SECONDS, 86400);
				return cachedHelix(
					ctx,
					new Request(`${url.origin}/cache/users/${encodeURIComponent(login)}`),
					() => helix(env, `/users?login=${encodeURIComponent(login)}`),
					ttl,
					corsHeaders,
				);
			}

			if (url.pathname === '/api/twitch/chat/badges/global') {
				const ttl = numberOr(env.BADGES_GLOBAL_TTL, 86400);
				return cachedHelix(
					ctx,
					new Request(`${url.origin}/cache/badges/global`),
					() => helix(env, '/chat/badges/global'),
					ttl,
					corsHeaders,
				);
			}

			if (url.pathname === '/api/twitch/chat/badges') {
				const broadcasterId = url.searchParams.get('broadcaster_id') || '';
				if (!/^\d+$/.test(broadcasterId)) {
					return json({ error: 'Missing or invalid broadcaster_id' }, 400, corsHeaders);
				}
				const ttl = numberOr(env.BADGES_CHANNEL_TTL, 21600);
				return cachedHelix(
					ctx,
					new Request(`${url.origin}/cache/badges/channel/${broadcasterId}`),
					() => helix(env, `/chat/badges?broadcaster_id=${encodeURIComponent(broadcasterId)}`),
					ttl,
					corsHeaders,
				);
			}

			return json({ error: 'Not found' }, 404, corsHeaders);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			return json({ error: message }, 502, corsHeaders);
		}
	},
};

/* -------------------------------------------------------------------------- */
/*  Caching                                                                    */
/* -------------------------------------------------------------------------- */

async function cachedHelix(ctx, cacheKey, fetcher, ttlSeconds, corsHeaders) {
	const cache = caches.default;
	const hit = await cache.match(cacheKey);
	if (hit) {
		const headers = new Headers(hit.headers);
		for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
		headers.set('x-cache', 'HIT');
		return new Response(hit.body, { status: hit.status, headers });
	}

	const payload = await fetcher();
	const body = JSON.stringify(payload);
	const headers = new Headers({
		'content-type': 'application/json; charset=utf-8',
		'cache-control': `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`,
		'x-cache': 'MISS',
		...corsHeaders,
	});
	const response = new Response(body, { status: 200, headers });
	ctx.waitUntil(cache.put(cacheKey, response.clone()));
	return response;
}

/* -------------------------------------------------------------------------- */
/*  Twitch Helix + token                                                       */
/* -------------------------------------------------------------------------- */

async function helix(env, pathAndQuery) {
	const token = await getAppToken(env);
	const res = await fetch(`https://api.twitch.tv/helix${pathAndQuery}`, {
		headers: {
			'Client-Id': env.TWITCH_CLIENT_ID,
			Authorization: `Bearer ${token}`,
		},
	});

	const text = await res.text();
	let payload;
	try {
		payload = text ? JSON.parse(text) : {};
	} catch {
		payload = { raw: text };
	}

	if (res.status === 401) {
		// Token may be stale; force a refresh on the next call.
		if (env.OVERLAY_KV) await env.OVERLAY_KV.delete(TOKEN_KEY);
		throw new Error('Helix request unauthorized; token cleared');
	}
	if (!res.ok) {
		const message = payload?.message || text || `${res.status} ${res.statusText}`;
		throw new Error(`Helix request failed: HTTP ${res.status} ${message}`);
	}

	return payload;
}

async function getAppToken(env) {
	if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
		throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET');
	}

	const now = Math.floor(Date.now() / 1000);

	if (env.OVERLAY_KV) {
		const cached = await env.OVERLAY_KV.get(TOKEN_KEY, { type: 'json' });
		if (cached && cached.accessToken && cached.expiresAt - 60 > now) {
			return cached.accessToken;
		}
	}

	const body = new URLSearchParams({
		client_id: env.TWITCH_CLIENT_ID,
		client_secret: env.TWITCH_CLIENT_SECRET,
		grant_type: 'client_credentials',
	});
	const res = await fetch('https://id.twitch.tv/oauth2/token', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body,
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Token request failed: HTTP ${res.status} ${res.statusText} ${text}`);
	}
	const data = await res.json();
	const expiresAt = now + Math.max(0, Number(data.expires_in || 0));

	if (env.OVERLAY_KV) {
		await env.OVERLAY_KV.put(
			TOKEN_KEY,
			JSON.stringify({ accessToken: data.access_token, expiresAt }),
			{ expirationTtl: Math.max(60, expiresAt - now - 60) },
		);
	}

	return data.access_token;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function json(payload, status, extraHeaders = {}) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
			...extraHeaders,
		},
	});
}

function numberOr(value, fallback) {
	const n = Number(value);
	return Number.isFinite(n) && n > 0 ? n : fallback;
}
