import http from 'node:http';
import { URL } from 'node:url';

const port = Number(process.env.PORT || 8787);
const clientId = process.env.TWITCH_CLIENT_ID || '';
const clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
const allowOrigin = process.env.ALLOW_ORIGIN || '*';

let tokenCache = {
	accessToken: '',
	expiresAt: 0,
};

function sendJson(res, status, payload) {
	res.writeHead(status, {
		'content-type': 'application/json; charset=utf-8',
		'access-control-allow-origin': allowOrigin,
		'access-control-allow-methods': 'GET, OPTIONS',
		'access-control-allow-headers': 'content-type',
		'cache-control': 'no-store',
	});
	res.end(JSON.stringify(payload));
}

function sendEmpty(res, status) {
	res.writeHead(status, {
		'access-control-allow-origin': allowOrigin,
		'access-control-allow-methods': 'GET, OPTIONS',
		'access-control-allow-headers': 'content-type',
	});
	res.end();
}

async function getAppToken() {
	const now = Date.now();
	if (tokenCache.accessToken && now < tokenCache.expiresAt - 60_000) {
		return tokenCache.accessToken;
	}

	if (!clientId || !clientSecret) {
		throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET');
	}

	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
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
	tokenCache = {
		accessToken: data.access_token,
		expiresAt: now + Math.max(0, Number(data.expires_in || 0)) * 1000,
	};
	return tokenCache.accessToken;
}

async function helix(pathAndQuery) {
	const token = await getAppToken();
	const res = await fetch(`https://api.twitch.tv/helix${pathAndQuery}`, {
		headers: {
			'Client-Id': clientId,
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

	if (!res.ok) {
		const message = payload?.message || text || `${res.status} ${res.statusText}`;
		throw new Error(`Helix request failed: HTTP ${res.status} ${message}`);
	}

	return payload;
}

const server = http.createServer(async (req, res) => {
	if (!req.url) return sendJson(res, 400, { error: 'Missing URL' });
	if (req.method === 'OPTIONS') return sendEmpty(res, 204);
	if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

	const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

	try {
		if (url.pathname === '/health') {
			return sendJson(res, 200, {
				ok: true,
				hasCredentials: Boolean(clientId && clientSecret),
				cachedToken: Boolean(tokenCache.accessToken && Date.now() < tokenCache.expiresAt),
			});
		}

		if (url.pathname === '/api/twitch/users') {
			const login = url.searchParams.get('login');
			if (!login) return sendJson(res, 400, { error: 'Missing login query param' });
			const payload = await helix(`/users?login=${encodeURIComponent(login)}`);
			return sendJson(res, 200, payload);
		}

		if (url.pathname === '/api/twitch/chat/badges/global') {
			const payload = await helix('/chat/badges/global');
			return sendJson(res, 200, payload);
		}

		if (url.pathname === '/api/twitch/chat/badges') {
			const broadcasterId = url.searchParams.get('broadcaster_id');
			if (!broadcasterId) return sendJson(res, 400, { error: 'Missing broadcaster_id query param' });
			const payload = await helix(`/chat/badges?broadcaster_id=${encodeURIComponent(broadcasterId)}`);
			return sendJson(res, 200, payload);
		}

		return sendJson(res, 404, { error: 'Not found' });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return sendJson(res, 502, { error: message });
	}
});

server.listen(port, () => {
	console.log(`[ChatOverlay] Twitch proxy listening on http://localhost:${port}`);
	if (!clientId || !clientSecret) {
		console.warn('[ChatOverlay] Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET; Helix requests will fail until set.');
	}
});