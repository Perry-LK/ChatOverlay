import type { OverlayConfig } from './types';

const DEFAULTS: OverlayConfig = {
  channel: 'PerryLK',
  fadeOutSeconds: 0,
  maxMessages: 100,
  showBadges: true,
  showReplies: true,
  showBits: true,
  showDeleted: false,
  ignoredUsers: ['nightbot', 'streamelements', 'moobot', 'fossabot'],
  ignoreCommands: true,
  animateEmotes: true,
};

const BOOL_KEYS: (keyof OverlayConfig)[] = [
  'showBadges', 'showReplies', 'showBits', 'showDeleted',
  'ignoreCommands', 'animateEmotes',
];

const NUM_KEYS: (keyof OverlayConfig)[] = ['fadeOutSeconds', 'maxMessages'];

function parseBool(v: string): boolean {
  return v === '1' || v.toLowerCase() === 'true' || v.toLowerCase() === 'yes';
}

/**
 * Loads overlay configuration with this priority (lower wins overrides upper):
 *   1. Built-in defaults
 *   2. /config.json (relative to deployed site root)
 *   3. URL query parameters (e.g. ?channel=foo&fadeOutSeconds=20)
 */
export async function loadConfig(): Promise<OverlayConfig> {
  let cfg: OverlayConfig = { ...DEFAULTS };

  // 2. config.json
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      cfg = { ...cfg, ...data };
    }
  } catch {
    /* ignore — defaults are fine */
  }

  // 3. URL params
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params.entries()) {
    if (key === 'channel') {
      cfg.channel = value;
    } else if (key === 'ignoredUsers') {
      cfg.ignoredUsers = value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    } else if ((BOOL_KEYS as string[]).includes(key)) {
      (cfg as any)[key] = parseBool(value);
    } else if ((NUM_KEYS as string[]).includes(key)) {
      const n = Number(value);
      if (!Number.isNaN(n)) (cfg as any)[key] = n;
    }
  }

  // Normalize
  cfg.channel = cfg.channel.replace(/^#/, '').toLowerCase();
  cfg.ignoredUsers = (cfg.ignoredUsers ?? []).map((u) => u.toLowerCase());

  return cfg;
}
