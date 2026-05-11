/**
 * Custom theme schema produced by /customise/ and consumed at runtime.
 *
 * The whole object is JSON-encoded then base64url-encoded into a single
 * `?theme64=...` URL parameter so a fully customised overlay is shareable as
 * one link with no server-side storage.
 *
 * The catalogue of customisable variables and their presets lives in
 * `./presets/variables.ts` so this file stays a pure data contract.
 */
export interface CustomTheme {
  /** Map of CSS variables (e.g. "--co-text") to values. */
  vars?: Record<string, string>;
  /** Optional raw CSS appended last so user rules can win specificity ties. */
  css?: string;
  /** Per-element visibility toggles. Mirrors a subset of OverlayConfig. */
  show?: Partial<{
    badges: boolean;
    replies: boolean;
    bits: boolean;
    status: boolean;
  }>;
  /** Optional metadata for the editor; ignored at runtime. */
  meta?: {
    name?: string;
    createdAt?: string;
    /** Id of the curated theme pack the user started from, if any. */
    themePack?: string;
  };
}

/* --------------------------------------------------------------------- */
/* base64url encoding                                                    */
/* --------------------------------------------------------------------- */

function toBase64Url(input: string): string {
  // btoa handles latin1; encode UTF-8 first.
  const utf8 = unescape(encodeURIComponent(input));
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  const bin = atob(padded);
  return decodeURIComponent(escape(bin));
}

export function encodeTheme(theme: CustomTheme): string {
  return toBase64Url(JSON.stringify(theme));
}

export function decodeTheme(encoded: string): CustomTheme | null {
  if (!encoded) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    if (parsed && typeof parsed === 'object') return parsed as CustomTheme;
    return null;
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------------- */
/* runtime application                                                   */
/* --------------------------------------------------------------------- */

const STYLE_ELEMENT_ID = 'overlay-theme64';

/**
 * Applies a decoded theme to the document. Idempotent — replaces any prior
 * `theme64` style element on each call so live preview can reuse it.
 */
export function applyCustomTheme(theme: CustomTheme | null, target: Document = document): void {
  // Clear any prior theme64 vars on the root before reapplying.
  const root = target.documentElement;
  if (root.dataset.theme64Vars) {
    for (const name of root.dataset.theme64Vars.split(',')) {
      if (name) root.style.removeProperty(name);
    }
    delete root.dataset.theme64Vars;
  }
  target.getElementById(STYLE_ELEMENT_ID)?.remove();

  if (!theme) return;

  if (theme.vars) {
    const applied: string[] = [];
    for (const [rawName, value] of Object.entries(theme.vars)) {
      if (typeof value !== 'string') continue;
      const name = rawName.startsWith('--') ? rawName : `--${rawName}`;
      if (!/^--[a-z0-9_-]+$/i.test(name)) continue;
      root.style.setProperty(name, value);
      applied.push(name);
    }
    if (applied.length) root.dataset.theme64Vars = applied.join(',');
  }

  if (theme.css && typeof theme.css === 'string') {
    const style = target.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = theme.css;
    target.head.appendChild(style);
  }
}
