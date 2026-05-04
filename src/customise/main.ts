import {
  CUSTOMISABLE_VARS,
  applyCustomTheme,
  decodeTheme,
  encodeTheme,
  type CustomTheme,
} from './theme';
import { renderPreview } from './preview';

interface FormState {
  baseUrl: string;
  channel: string;
  theme: string;
  show: { badges: boolean; replies: boolean; bits: boolean; status: boolean };
  vars: Record<string, string>;
  css: string;
}

const DEFAULT_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}${import.meta.env.BASE_URL ?? '/'}`
    : '';

function makeInitialState(): FormState {
  const params = new URLSearchParams(window.location.search);
  const importedTheme64 = params.get('theme64');
  const seed: CustomTheme | null = importedTheme64 ? decodeTheme(importedTheme64) : null;

  const baseFromUrl = params.get('base') || params.get('baseUrl') || '';
  return {
    baseUrl: baseFromUrl || DEFAULT_BASE_URL.replace(/\/customise\/$/, '/'),
    channel: params.get('channel') || 'PerryLK',
    theme: params.get('theme') || 'comfy',
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

const state = makeInitialState();

/* ------------------------------------------------------------------ */
/* DOM construction                                                   */
/* ------------------------------------------------------------------ */

const groups: Record<string, HTMLFieldSetElement> = {
  message: q('#cu-vars-message'),
  username: q('#cu-vars-username'),
  emote: q('#cu-vars-emote'),
  card: q('#cu-vars-card'),
  animation: q('#cu-vars-animation'),
};

for (const def of CUSTOMISABLE_VARS) {
  const fs = groups[def.group];
  if (!fs) continue;
  fs.appendChild(buildVarRow(def.name, def.label, def.type, state.vars[def.name] ?? ''));
}

q<HTMLInputElement>('#cu-baseUrl').value = state.baseUrl;
q<HTMLInputElement>('#cu-channel').value = state.channel;
q<HTMLSelectElement>('#cu-theme').value = state.theme;
q<HTMLInputElement>('#cu-showBadges').checked = state.show.badges;
q<HTMLInputElement>('#cu-showReplies').checked = state.show.replies;
q<HTMLInputElement>('#cu-showBits').checked = state.show.bits;
q<HTMLInputElement>('#cu-showStatus').checked = state.show.status;
q<HTMLTextAreaElement>('#cu-css').value = state.css;

/* ------------------------------------------------------------------ */
/* Wiring                                                             */
/* ------------------------------------------------------------------ */

document.getElementById('cu-form')!.addEventListener('input', () => {
  syncStateFromForm();
  refreshOutput();
});

q<HTMLButtonElement>('#cu-copy').addEventListener('click', async () => {
  const url = q<HTMLTextAreaElement>('#cu-output').value;
  try {
    await navigator.clipboard.writeText(url);
    flashButton('#cu-copy', 'Copied!');
  } catch {
    q<HTMLTextAreaElement>('#cu-output').select();
    document.execCommand('copy');
    flashButton('#cu-copy', 'Copied!');
  }
});

q<HTMLButtonElement>('#cu-open').addEventListener('click', () => {
  const url = q<HTMLTextAreaElement>('#cu-output').value;
  if (url) window.open(url, '_blank', 'noopener');
});

q<HTMLButtonElement>('#cu-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(buildTheme(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'chat-overlay-theme.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

q<HTMLButtonElement>('#cu-import').addEventListener('click', () => {
  q<HTMLInputElement>('#cu-import-file').click();
});

q<HTMLInputElement>('#cu-import-file').addEventListener('change', async (event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as CustomTheme;
    Object.assign(state.vars, parsed.vars ?? {});
    if (parsed.css) state.css = parsed.css;
    if (parsed.show) state.show = { ...state.show, ...parsed.show };
    rehydrateForm();
    refreshOutput();
  } catch (error) {
    alert(`Could not import theme: ${(error as Error).message}`);
  } finally {
    input.value = '';
  }
});

refreshOutput();

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function syncStateFromForm(): void {
  state.baseUrl = q<HTMLInputElement>('#cu-baseUrl').value.trim();
  state.channel = q<HTMLInputElement>('#cu-channel').value.trim();
  state.theme = q<HTMLSelectElement>('#cu-theme').value;
  state.show.badges = q<HTMLInputElement>('#cu-showBadges').checked;
  state.show.replies = q<HTMLInputElement>('#cu-showReplies').checked;
  state.show.bits = q<HTMLInputElement>('#cu-showBits').checked;
  state.show.status = q<HTMLInputElement>('#cu-showStatus').checked;
  state.css = q<HTMLTextAreaElement>('#cu-css').value;

  state.vars = {};
  for (const def of CUSTOMISABLE_VARS) {
    const input = document.querySelector<HTMLInputElement>(`[data-var="${def.name}"]`);
    if (input && input.value.trim()) state.vars[def.name] = input.value.trim();
  }
}

function rehydrateForm(): void {
  q<HTMLInputElement>('#cu-showBadges').checked = state.show.badges;
  q<HTMLInputElement>('#cu-showReplies').checked = state.show.replies;
  q<HTMLInputElement>('#cu-showBits').checked = state.show.bits;
  q<HTMLInputElement>('#cu-showStatus').checked = state.show.status;
  q<HTMLTextAreaElement>('#cu-css').value = state.css;
  for (const def of CUSTOMISABLE_VARS) {
    const input = document.querySelector<HTMLInputElement>(`[data-var="${def.name}"]`);
    if (input) input.value = state.vars[def.name] ?? '';
    const colorInput = document.querySelector<HTMLInputElement>(`[data-var-color="${def.name}"]`);
    if (colorInput && def.type === 'color' && state.vars[def.name]) {
      const c = normalizeColor(state.vars[def.name]);
      if (c) colorInput.value = c;
    }
  }
}

function buildTheme(): CustomTheme {
  return {
    vars: state.vars,
    css: state.css || undefined,
    show: { ...state.show },
    meta: { name: state.channel || 'overlay', createdAt: new Date().toISOString() },
  };
}

function buildOutputUrl(): string {
  const theme = buildTheme();
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

function refreshOutput(): void {
  const url = buildOutputUrl();
  q<HTMLTextAreaElement>('#cu-output').value = url;
  q<HTMLPreElement>('#cu-json').textContent = JSON.stringify(buildTheme(), null, 2);
  renderPreview(q<HTMLIFrameElement>('#cu-preview'), buildTheme(), state.theme);
}

function buildVarRow(name: string, label: string, type: string, value: string): HTMLLabelElement {
  const wrap = document.createElement('label');
  wrap.innerHTML = `<span>${label} <code>${name}</code></span>`;

  const row = document.createElement('div');
  row.className = 'cu__var-row';

  if (type === 'color') {
    const color = document.createElement('input');
    color.type = 'color';
    color.dataset.varColor = name;
    color.value = normalizeColor(value) || '#ffffff';
    row.appendChild(color);

    const text = document.createElement('input');
    text.type = 'text';
    text.dataset.var = name;
    text.value = value;
    text.placeholder = 'inherit / #fff / rgba(...)';
    row.appendChild(text);

    color.addEventListener('input', () => { text.value = color.value; text.dispatchEvent(new Event('input', { bubbles: true })); });
  } else {
    const text = document.createElement('input');
    text.type = 'text';
    text.dataset.var = name;
    text.value = value;
    text.placeholder = type === 'length' ? 'e.g. 22px / 1.6em' : type === 'number' ? 'e.g. 700' : 'CSS value';
    row.appendChild(text);
  }

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'cu__reset';
  reset.textContent = 'reset';
  reset.addEventListener('click', () => {
    const text = row.querySelector<HTMLInputElement>(`[data-var="${name}"]`);
    if (text) {
      text.value = '';
      text.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  row.appendChild(reset);

  wrap.appendChild(row);
  return wrap;
}

function normalizeColor(value: string): string | null {
  const v = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
    if (v.length === 4) {
      return '#' + v.slice(1).split('').map((c) => c + c).join('');
    }
    return v.toLowerCase();
  }
  return null;
}

function flashButton(selector: string, label: string): void {
  const button = document.querySelector<HTMLButtonElement>(selector);
  if (!button) return;
  const prev = button.textContent;
  button.textContent = label;
  setTimeout(() => { button.textContent = prev; }, 1200);
}

function q<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Customise: missing element ${selector}`);
  return el;
}

// Re-export so the preview iframe inherits the same theme application logic.
export { applyCustomTheme };
