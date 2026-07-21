import type { OverlayConfig } from './types';

/**
 * Built-in defaults. These are intentionally generic so nothing in the
 * repository assumes a specific streamer. Real values come from one of the
 * configuration layers in `loadConfig`.
 */
const DEFAULTS: OverlayConfig = {
  channel: 'twitch',
  theme: 'comfy',
  twitchApiBase: '',
  theme64: '',
  debug: false,
  fadeOutSeconds: 0,
  maxMessages: 100,
  showBadges: true,
  showReplies: true,
  showBits: true,
  showDeleted: false,
  showStatus: false,
  ignoredUsers: ['nightbot', 'streamelements', 'moobot', 'fossabot'],
  ignoreCommands: true,
  animateEmotes: true,
};

const BOOL_KEYS: (keyof OverlayConfig)[] = [
  'showBadges', 'showReplies', 'showBits', 'showDeleted', 'showStatus',
  'ignoreCommands', 'animateEmotes', 'debug',
];

const NUM_KEYS: (keyof OverlayConfig)[] = ['fadeOutSeconds', 'maxMessages'];

const STRING_KEYS: (keyof OverlayConfig)[] = ['channel', 'theme', 'theme64', 'twitchApiBase'];

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

function parseBool(value: string): boolean | undefined {
  const v = value.trim().toLowerCase();
  if (TRUE_VALUES.has(v)) return true;
  if (FALSE_VALUES.has(v)) return false;
  return undefined;
}

async function fetchJsonIfPresent(url: string): Promise<Partial<OverlayConfig> | null> {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    return (await res.json()) as Partial<OverlayConfig>;
  } catch {
    return null;
  }
}

function applyEnvDefaults(cfg: OverlayConfig): OverlayConfig {
  // Build-time defaults via Vite. Only VITE_-prefixed values reach the bundle.
  const env = import.meta.env as Record<string, string | undefined>;
  if (env.VITE_DEFAULT_CHANNEL) cfg.channel = env.VITE_DEFAULT_CHANNEL;
  if (env.VITE_DEFAULT_THEME) cfg.theme = env.VITE_DEFAULT_THEME;
  if (env.VITE_TWITCH_API_BASE) cfg.twitchApiBase = env.VITE_TWITCH_API_BASE;
  return cfg;
}

function applyUrlParams(cfg: OverlayConfig): OverlayConfig {
  const params = new URLSearchParams(window.location.search);
  for (const [rawKey, value] of params.entries()) {
    const key = rawKey.trim();
    if (key === 'channel') {
      cfg.channel = value;
    } else if (key === 'theme') {
      cfg.theme = value;
    } else if (key === 'theme64') {
      cfg.theme64 = value;
    } else if (key === 'ignoredUsers') {
      cfg.ignoredUsers = value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    } else if ((BOOL_KEYS as string[]).includes(key)) {
      const parsed = parseBool(value);
      if (parsed !== undefined) (cfg as any)[key] = parsed;
    } else if ((NUM_KEYS as string[]).includes(key)) {
      const n = Number(value);
      if (Number.isFinite(n)) (cfg as any)[key] = n;
    } else if ((STRING_KEYS as string[]).includes(key)) {
      (cfg as any)[key] = value;
    }
  }

  // ?debug=1 implies showStatus on, since the debug panel relies on the same
  // status hooks for connection state.
  if (cfg.debug) cfg.showStatus = true;

  return cfg;
}

function normalize(cfg: OverlayConfig): OverlayConfig {
  cfg.channel = (cfg.channel ?? '').replace(/^#/, '').toLowerCase() || DEFAULTS.channel;
  cfg.theme = (cfg.theme ?? '').trim().toLowerCase() || DEFAULTS.theme;
  cfg.twitchApiBase = (cfg.twitchApiBase ?? '').trim().replace(/\/+$/, '');
  cfg.ignoredUsers = (cfg.ignoredUsers ?? []).map((u) => u.toLowerCase());
  cfg.fadeOutSeconds = Math.max(0, cfg.fadeOutSeconds | 0);
  cfg.maxMessages = Math.max(1, cfg.maxMessages | 0);
  return cfg;
}

/**
 * Loads overlay configuration. Later layers override earlier ones:
 *   1. Built-in defaults.
 *   2. Build-time env (VITE_DEFAULT_CHANNEL, VITE_DEFAULT_THEME,
 *      VITE_TWITCH_API_BASE from .env.local).
 *   3. /config.json — public, committed default for the deployed site.
 *   4. /config.environment.json — build-target-specific overrides.
 *   5. URL query parameters — final per-instance override (great for OBS).
 */
export async function loadConfig(): Promise<OverlayConfig> {
  let cfg: OverlayConfig = applyEnvDefaults({ ...DEFAULTS });

  const base = import.meta.env.BASE_URL;
  const [publicCfg, environmentCfg] = await Promise.all([
    fetchJsonIfPresent(`${base}config.json`),
    fetchJsonIfPresent(`${base}config.environment.json`),
  ]);
  if (publicCfg) cfg = { ...cfg, ...publicCfg };
  if (environmentCfg) cfg = { ...cfg, ...environmentCfg };

  cfg = applyUrlParams(cfg);
  return normalize(cfg);
}

/**
 * Reads the chosen theme synchronously from URL + build-time env so the
 * stylesheet can be requested before any JSON fetches resolve. This eliminates
 * the brief flash of un-themed base styles on slow connections.
 */
export function readEarlyTheme(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const fromUrl = new URLSearchParams(window.location.search).get('theme');
  return (fromUrl ?? env.VITE_DEFAULT_THEME ?? DEFAULTS.theme).trim().toLowerCase();
}
