import type { CustomTheme } from './theme';
import { decodeTheme, encodeTheme } from './theme';
import { collectFontImports } from './presets/fonts';
import { THEME_PACKS, findThemePack, type ThemePack } from './presets/themePacks';

/**
 * Form state for the customiser. Kept deliberately small so it round-trips
 * cleanly to a `theme64` payload and back without losing information.
 */

export interface FormState {
  baseUrl: string;
  channel: string;
  theme: string;
  themePack: string;
  show: { badges: boolean; replies: boolean; bits: boolean; status: boolean };
  vars: Record<string, string>;
  css: string;
}

const DEFAULT_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}${import.meta.env.BASE_URL ?? '/'}`
    : '';

export function makeInitialState(): FormState {
  const params = new URLSearchParams(window.location.search);
  const importedTheme64 = params.get('theme64');
  const seed: CustomTheme | null = importedTheme64 ? decodeTheme(importedTheme64) : null;

  const baseFromUrl = params.get('base') || params.get('baseUrl') || '';
  return {
    baseUrl: baseFromUrl || DEFAULT_BASE_URL.replace(/\/customise\/$/, '/'),
    channel: params.get('channel') || 'PerryLK',
    theme: params.get('theme') || 'comfy',
    themePack: seed?.meta?.themePack ?? '',
    show: {
      badges: seed?.show?.badges ?? true,
      replies: seed?.show?.replies ?? true,
      bits: seed?.show?.bits ?? true,
      status: seed?.show?.status ?? false,
    },
    vars: { ...(seed?.vars ?? {}) },
    css: seed?.css ?? '',
  };
}

/**
 * Builds the serialisable `CustomTheme` used to encode `theme64`. Font @import
 * URLs from any selected font presets are prepended to the CSS payload so a
 * deployed OBS overlay actually loads the chosen webfonts.
 */
export function buildTheme(state: FormState): CustomTheme {
  const fontImports = collectFontImports(state.vars);
  const userCss = state.css.trim();
  const css = [fontImports, userCss].filter(Boolean).join('\n\n') || undefined;

  return {
    vars: stripDefaultVars(state.vars),
    css,
    show: { ...state.show },
    meta: {
      name: state.channel || 'overlay',
      createdAt: new Date().toISOString(),
      themePack: state.themePack || undefined,
    },
  };
}

/**
 * Strips variables whose value is empty. Empty entries mean "use the overlay's
 * base default" — encoding them would add noise without changing the output.
 */
function stripDefaultVars(vars: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(vars)) {
    if (value && value.trim()) out[name] = value.trim();
  }
  return out;
}

export function buildOutputUrl(state: FormState): string {
  const theme = buildTheme(state);
  const isEmpty =
    Object.keys(theme.vars ?? {}).length === 0 &&
    !theme.css &&
    state.show.badges && state.show.replies && state.show.bits && !state.show.status;

  const base = state.baseUrl || '/';
  const url = new URL(base, window.location.href);
  if (state.channel) url.searchParams.set('channel', state.channel);
  if (state.theme && state.theme !== 'comfy') url.searchParams.set('theme', state.theme);
  if (!isEmpty) url.searchParams.set('theme64', encodeTheme(theme));
  return url.toString();
}

/**
 * Returns a new vars map with the theme pack's variables merged on top of the
 * existing values. Falsy values in the pack are ignored.
 */
export function applyThemePack(state: FormState, pack: ThemePack): FormState {
  const vars = { ...state.vars, ...pack.vars };
  return { ...state, themePack: pack.id, vars };
}

export function detectThemePack(vars: Record<string, string>): ThemePack | undefined {
  // Best-effort: a pack "matches" when every variable it sets exists in vars
  // with the same value. Used so reloading a theme64 highlights the right card.
  for (const pack of THEME_PACKS) {
    const allMatch = Object.entries(pack.vars).every(([name, value]) => vars[name]?.trim() === value);
    if (allMatch) return pack;
  }
  return undefined;
}

export { findThemePack };
