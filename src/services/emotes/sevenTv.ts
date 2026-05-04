import type { SevenTvEmote } from '../../types';

interface SevenTvActiveEmote {
	name: string;
	flags?: number;
	data?: {
		name?: string;
		flags?: number;
		animated?: boolean;
		host?: {
			url: string;
			files: { name: string; format: string; width?: number; height?: number; static_name?: string }[];
		};
	};
}

interface SevenTvEmoteSet {
	emotes?: SevenTvActiveEmote[];
}

interface SevenTvUserConn {
	emote_set?: SevenTvEmoteSet | null;
}

const SEVEN_TV_API = 'https://7tv.io/v3';

function pickBestFile(host: NonNullable<NonNullable<SevenTvActiveEmote['data']>['host']>, animate: boolean): string | null {
	if (!host.files?.length) return null;

	const preferredSizes = ['2x', '3x', '4x', '1x'];
	const wantFormat = animate ? 'AVIF' : 'WEBP';
	const candidates = host.files.filter((file) => file.format === wantFormat || file.format === 'WEBP');
	const pickFor = (size: string) => candidates.find((file) => file.name.startsWith(size + '.'))
		?? candidates.find((file) => file.name.startsWith(size + '_static'));

	for (const size of preferredSizes) {
		const file = pickFor(size);
		if (file) {
			const base = host.url.startsWith('//') ? `https:${host.url}` : host.url;
			return `${base}/${file.name}`;
		}
	}
	return null;
}

function toEmote(active: SevenTvActiveEmote, animate: boolean): SevenTvEmote | null {
	const data = active.data;
	if (!data?.host) return null;
	const url = pickBestFile(data.host, animate && (data.animated ?? false));
	if (!url) return null;
	const flags = (active.flags ?? 0) | (data.flags ?? 0);
	const zeroWidth = (flags & 1) === 1;
	return { name: active.name, url, zeroWidth };
}

async function fetchEmoteSet(setIdOrPath: string): Promise<SevenTvEmoteSet | null> {
	try {
		const res = await fetch(`${SEVEN_TV_API}/emote-sets/${setIdOrPath}`);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

async function fetchUserConnection(twitchId: string): Promise<SevenTvUserConn | null> {
	try {
		const res = await fetch(`${SEVEN_TV_API}/users/twitch/${twitchId}`);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

export async function loadSevenTvEmotes(twitchUserId: string | null, animate: boolean): Promise<Map<string, SevenTvEmote>> {
	const map = new Map<string, SevenTvEmote>();

	const tasks: Promise<SevenTvEmoteSet | null>[] = [fetchEmoteSet('global')];
	if (twitchUserId) {
		tasks.push(fetchUserConnection(twitchUserId).then((conn) => conn?.emote_set ?? null));
	}

	const sets = await Promise.all(tasks);
	for (const set of sets) {
		if (!set?.emotes) continue;
		for (const emote of set.emotes) {
			const mapped = toEmote(emote, animate);
			if (mapped) map.set(mapped.name, mapped);
		}
	}
	return map;
}