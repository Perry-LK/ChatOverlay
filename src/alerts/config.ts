import type { AlertType, AlertsConfig } from './types';

const ALL_TYPES: AlertType[] = [
  'sub', 'resub', 'subgift', 'submysterygift', 'giftpaidupgrade',
  'raid', 'announcement', 'cheer', 'bitsbadgetier',
];

const DEFAULTS: AlertsConfig = {
  channel: 'twitch',
  theme: 'comfy',
  theme64: '',
  twitchApiBase: '',
  durationSeconds: 7,
  maxQueue: 5,
  enabled: {
    sub: true,
    resub: true,
    subgift: true,
    submysterygift: true,
    giftpaidupgrade: true,
    raid: true,
    announcement: true,
    cheer: true,
    bitsbadgetier: true,
  },
  minBits: 100,
  showStatus: false,
  debug: false,
  test: [],
};

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

function parseBool(value: string): boolean | undefined {
  const v = value.trim().toLowerCase();
  if (TRUE_VALUES.has(v)) return true;
  if (FALSE_VALUES.has(v)) return false;
  return undefined;
}

async function fetchJsonIfPresent(url: string): Promise<Partial<AlertsConfig> | null> {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    return (await res.json()) as Partial<AlertsConfig>;
  } catch {
    return null;
  }
}

function applyEnvDefaults(cfg: AlertsConfig): AlertsConfig {
  const env = import.meta.env as Record<string, string | undefined>;
  if (env.VITE_DEFAULT_CHANNEL) cfg.channel = env.VITE_DEFAULT_CHANNEL;
  if (env.VITE_DEFAULT_THEME) cfg.theme = env.VITE_DEFAULT_THEME;
  if (env.VITE_TWITCH_API_BASE) cfg.twitchApiBase = env.VITE_TWITCH_API_BASE;
  return cfg;
}

function parseTypeList(value: string): AlertType[] {
  const valid = new Set<string>(ALL_TYPES);
  return value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is AlertType => valid.has(s));
}

function applyUrlParams(cfg: AlertsConfig): AlertsConfig {
  const params = new URLSearchParams(window.location.search);
  for (const [rawKey, value] of params.entries()) {
    const key = rawKey.trim();
    switch (key) {
      case 'channel': cfg.channel = value; break;
      case 'theme': cfg.theme = value; break;
      case 'theme64': cfg.theme64 = value; break;
      case 'twitchApiBase': cfg.twitchApiBase = value; break;
      case 'durationSeconds': {
        const n = Number(value);
        if (Number.isFinite(n)) cfg.durationSeconds = n;
        break;
      }
      case 'maxQueue': {
        const n = Number(value);
        if (Number.isFinite(n)) cfg.maxQueue = n;
        break;
      }
      case 'minBits': {
        const n = Number(value);
        if (Number.isFinite(n)) cfg.minBits = n;
        break;
      }
      case 'showStatus': {
        const b = parseBool(value);
        if (b !== undefined) cfg.showStatus = b;
        break;
      }
      case 'debug': {
        const b = parseBool(value);
        if (b !== undefined) cfg.debug = b;
        break;
      }
      case 'types': {
        // Whitelist: only listed types are enabled.
        const allowed = new Set(parseTypeList(value));
        for (const t of ALL_TYPES) cfg.enabled[t] = allowed.has(t);
        break;
      }
      case 'disable': {
        for (const t of parseTypeList(value)) cfg.enabled[t] = false;
        break;
      }
      case 'test': {
        cfg.test = parseTypeList(value);
        break;
      }
      default: break;
    }
  }
  if (cfg.debug) cfg.showStatus = true;
  return cfg;
}

function normalize(cfg: AlertsConfig): AlertsConfig {
  cfg.channel = (cfg.channel ?? '').replace(/^#/, '').toLowerCase() || DEFAULTS.channel;
  cfg.theme = (cfg.theme ?? '').trim().toLowerCase() || DEFAULTS.theme;
  cfg.twitchApiBase = (cfg.twitchApiBase ?? '').trim().replace(/\/+$/, '');
  cfg.durationSeconds = Math.max(1, cfg.durationSeconds | 0);
  cfg.maxQueue = Math.max(1, cfg.maxQueue | 0);
  cfg.minBits = Math.max(0, cfg.minBits | 0);
  return cfg;
}

/**
 * Loads the alerts overlay configuration. Layer order mirrors the chat
 * overlay: built-in defaults -> env -> /config.json -> /config.environment.json ->
 * URL query parameters. Each layer may override the previous one.
 *
 * The committed config.json may include an `alerts` section; if present, its
 * keys override the top-level defaults so the chat overlay and the alerts
 * overlay can share the same config file without colliding.
 */
export async function loadAlertsConfig(): Promise<AlertsConfig> {
  let cfg: AlertsConfig = applyEnvDefaults({ ...DEFAULTS, enabled: { ...DEFAULTS.enabled } });

  const base = import.meta.env.BASE_URL;
  const [publicCfg, environmentCfg] = await Promise.all([
    fetchJsonIfPresent(`${base}config.json`),
    fetchJsonIfPresent(`${base}config.environment.json`),
  ]);
  cfg = mergeFileConfig(cfg, publicCfg);
  cfg = mergeFileConfig(cfg, environmentCfg);

  cfg = applyUrlParams(cfg);
  return normalize(cfg);
}

function mergeFileConfig(cfg: AlertsConfig, file: Partial<AlertsConfig> | null): AlertsConfig {
  if (!file) return cfg;
  // Shared keys also accepted at the top level of config.json.
  if (typeof file.channel === 'string') cfg.channel = file.channel;
  if (typeof file.theme === 'string') cfg.theme = file.theme;
  if (typeof file.theme64 === 'string') cfg.theme64 = file.theme64;
  if (typeof file.twitchApiBase === 'string') cfg.twitchApiBase = file.twitchApiBase;
  // Dedicated alerts subsection wins over the top-level shared keys.
  const sub = (file as unknown as { alerts?: Partial<AlertsConfig> }).alerts;
  if (sub) {
    if (typeof sub.channel === 'string') cfg.channel = sub.channel;
    if (typeof sub.theme === 'string') cfg.theme = sub.theme;
    if (typeof sub.theme64 === 'string') cfg.theme64 = sub.theme64;
    if (typeof sub.twitchApiBase === 'string') cfg.twitchApiBase = sub.twitchApiBase;
    if (typeof sub.durationSeconds === 'number') cfg.durationSeconds = sub.durationSeconds;
    if (typeof sub.maxQueue === 'number') cfg.maxQueue = sub.maxQueue;
    if (typeof sub.minBits === 'number') cfg.minBits = sub.minBits;
    if (typeof sub.showStatus === 'boolean') cfg.showStatus = sub.showStatus;
    if (typeof sub.debug === 'boolean') cfg.debug = sub.debug;
    if (sub.enabled && typeof sub.enabled === 'object') {
      cfg.enabled = { ...cfg.enabled, ...sub.enabled };
    }
  }
  return cfg;
}

export function readEarlyAlertsTheme(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const fromUrl = new URLSearchParams(window.location.search).get('theme');
  return (fromUrl ?? env.VITE_DEFAULT_THEME ?? DEFAULTS.theme).trim().toLowerCase();
}
