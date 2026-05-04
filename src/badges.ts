import type { BadgeInfo } from './types';

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

const GLOBAL_URL = 'https://badges.twitch.tv/v1/badges/global/display?language=en';
const channelUrl = (userId: string) =>
  `https://badges.twitch.tv/v1/badges/channels/${userId}/display?language=en`;

export type BadgeMap = Map<string, BadgeInfo>;

function badgeKey(setId: string, version: string): string {
  return `${setId}/${version}`;
}

function ingest(map: BadgeMap, data: BadgeApiResponse | null): void {
  if (!data?.badge_sets) return;
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
    }
  }
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Loads global Twitch badges plus channel-specific (subs, bits, etc.).
 * Channel badges override globals when keys collide.
 */
export async function loadBadges(twitchUserId: string | null): Promise<BadgeMap> {
  const map: BadgeMap = new Map();
  const tasks: Promise<BadgeApiResponse | null>[] = [fetchJson<BadgeApiResponse>(GLOBAL_URL)];
  if (twitchUserId) tasks.push(fetchJson<BadgeApiResponse>(channelUrl(twitchUserId)));

  const [globalData, channelData] = await Promise.all(tasks);
  ingest(map, globalData);
  ingest(map, channelData ?? null);
  return map;
}

export function getBadge(map: BadgeMap, setId: string, version: string): BadgeInfo | undefined {
  return map.get(badgeKey(setId, version)) ?? map.get(badgeKey(setId, '1'));
}
