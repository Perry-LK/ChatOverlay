import type { BadgeInfo } from '../../types';

interface BadgeApiResponse {
	badge_sets: Record<string, {
		versions: Record<string, {
			image_url_1x?: string;
			image_url_2x?: string;
			image_url_4x?: string;
			title?: string;
			description?: string;
		}>;
	}>;
}

interface HelixBadgeResponse {
	data?: Array<{
		set_id: string;
		versions: Array<{
			id: string;
			image_url_1x?: string;
			image_url_2x?: string;
			image_url_4x?: string;
			title?: string;
			description?: string;
		}>;
	}>;
}

const GLOBAL_URL = 'https://badges.twitch.tv/v1/badges/global/display?language=en';
const channelUrl = (userId: string) =>
	`https://badges.twitch.tv/v1/badges/channels/${userId}/display?language=en`;
const helixGlobalUrl = (base: string) =>
	`${base.replace(/\/+$/, '')}/api/twitch/chat/badges/global`;
const helixChannelUrl = (base: string, userId: string) =>
	`${base.replace(/\/+$/, '')}/api/twitch/chat/badges?broadcaster_id=${encodeURIComponent(userId)}`;

export type BadgeMap = Map<string, BadgeInfo>;

export interface BadgeLoadResult {
	map: BadgeMap;
	error: string | null;
	source: 'baseline' | 'api' | 'partial';
}

/**
 * Hardcoded baseline of universally-published Twitch badge assets, served from
 * Twitch's static CDN. These image IDs are stable public values and let the
 * overlay always render the broadcaster / mod / VIP / sub / prime badges even
 * if `badges.twitch.tv` is unreachable from the browser (CORS, deprecation,
 * network) or returns an empty payload. A successful API fetch later layers
 * on top of this map and overrides whatever it can.
 */
const BASELINE_BADGES: Record<string, { id: string; title: string }> = {
	'broadcaster/1': { id: '5527c58c-fb7d-422d-b71b-f309dcb85cc1', title: 'Broadcaster' },
	'moderator/1': { id: '3267646d-33f0-4b17-b3df-f923a41db1d0', title: 'Moderator' },
	'vip/1': { id: 'b817aba4-fad8-49e2-b88a-7cc744dfa6ec', title: 'VIP' },
	'subscriber/0': { id: '5d9f2208-5dd8-11e7-8513-2ff4adfae661', title: 'Subscriber' },
	'subscriber/1': { id: '5d9f2208-5dd8-11e7-8513-2ff4adfae661', title: 'Subscriber' },
	'premium/1': { id: 'a1dd5073-19c3-4911-8cb4-c464a7bc1510', title: 'Prime Gaming' },
	'turbo/1': { id: 'bd444ec6-8f34-4bf9-94f3-e9aeb1d3fb10', title: 'Turbo' },
	'partner/1': { id: 'd12a2e27-16f6-41d0-ab77-b780518f00a3', title: 'Verified' },
	'staff/1': { id: 'd97c37bd-a6f5-4c38-8f57-4e4bef88af34', title: 'Staff' },
	'admin/1': { id: '9384c43e-4ce7-4e94-b2c1-b48c1eddfe5a', title: 'Admin' },
	'global_mod/1': { id: '9f13ab61-da70-4de5-a147-cd5cf260bce6', title: 'Global Moderator' },
	'no_audio/1': { id: 'aef2cd08-f29b-45a1-8c12-d44d7fd5e6f0', title: 'No audio' },
	'no_video/1': { id: '199a0dba-58f3-494e-a7fc-1e5bf3b71770', title: 'No video' },
};

function badgeKey(setId: string, version: string): string {
	return `${setId}/${version}`;
}

function ingest(map: BadgeMap, data: BadgeApiResponse | null): number {
	if (!data?.badge_sets) return 0;
	let count = 0;
	for (const [setId, set] of Object.entries(data.badge_sets)) {
		for (const [version, v] of Object.entries(set.versions)) {
			const url = v.image_url_2x ?? v.image_url_1x ?? v.image_url_4x;
			if (!url) continue;
			map.set(badgeKey(setId, version), {
				setId,
				version,
				imageUrl: url,
				title: v.title ?? `${setId} ${version}`,
			});
			count++;
		}
	}
	return count;
}

function ingestHelix(map: BadgeMap, data: HelixBadgeResponse | null): number {
	if (!data?.data?.length) return 0;
	let count = 0;
	for (const set of data.data) {
		for (const version of set.versions ?? []) {
			const url = version.image_url_2x ?? version.image_url_1x ?? version.image_url_4x;
			if (!url) continue;
			map.set(badgeKey(set.set_id, version.id), {
				setId: set.set_id,
				version: version.id,
				imageUrl: url,
				title: version.title ?? `${set.set_id} ${version.id}`,
			});
			count++;
		}
	}
	return count;
}

function ingestBaseline(map: BadgeMap): void {
	for (const [key, info] of Object.entries(BASELINE_BADGES)) {
		const [setId, version] = key.split('/');
		map.set(key, {
			setId,
			version,
			imageUrl: `https://static-cdn.jtvnw.net/badges/v1/${info.id}/2`,
			title: info.title,
		});
	}
}

async function fetchJson<T>(url: string): Promise<{ data: T | null; error: string | null }> {
	try {
		const res = await fetch(url);
		if (!res.ok) return { data: null, error: `HTTP ${res.status} ${res.statusText} for ${url}` };
		return { data: (await res.json()) as T, error: null };
	} catch (error) {
		return { data: null, error: `${(error as Error).message || 'fetch failed'} for ${url}` };
	}
}

export async function loadBadges(twitchUserId: string | null, twitchApiBase = ''): Promise<BadgeLoadResult> {
	const map: BadgeMap = new Map();
	ingestBaseline(map);

	if (twitchApiBase) {
		const tasks: Promise<{ data: HelixBadgeResponse | null; error: string | null }>[] = [
			fetchJson<HelixBadgeResponse>(helixGlobalUrl(twitchApiBase)),
		];
		if (twitchUserId) tasks.push(fetchJson<HelixBadgeResponse>(helixChannelUrl(twitchApiBase, twitchUserId)));

		const results = await Promise.all(tasks);
		let apiCount = 0;
		const errors: string[] = [];
		for (const r of results) {
			apiCount += ingestHelix(map, r.data);
			if (r.error) errors.push(r.error);
		}

		const error = errors.length ? errors.join(' | ') : null;
		const source: BadgeLoadResult['source'] = apiCount === 0 ? 'baseline' : (errors.length ? 'partial' : 'api');
		if (error) console.warn('[ChatOverlay] badge fetch issue:', error);
		return { map, error, source };
	}

	const tasks: Promise<{ data: BadgeApiResponse | null; error: string | null }>[] = [fetchJson<BadgeApiResponse>(GLOBAL_URL)];
	if (twitchUserId) tasks.push(fetchJson<BadgeApiResponse>(channelUrl(twitchUserId)));

	const results = await Promise.all(tasks);
	let apiCount = 0;
	const errors: string[] = [];
	for (const r of results) {
		apiCount += ingest(map, r.data);
		if (r.error) errors.push(r.error);
	}

	const error = errors.length ? errors.join(' | ') : null;
	const source: BadgeLoadResult['source'] = apiCount === 0 ? 'baseline' : (errors.length ? 'partial' : 'api');
	if (error) console.warn('[ChatOverlay] badge fetch issue:', error);
	return { map, error, source };
}

export function getBadge(map: BadgeMap, setId: string, version: string): BadgeInfo | undefined {
	return map.get(badgeKey(setId, version)) ?? map.get(badgeKey(setId, '1')) ?? map.get(badgeKey(setId, '0'));
}
