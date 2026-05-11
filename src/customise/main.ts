/**
 * Customiser entry. Keeps the file thin: composition only — UI rendering lives
 * in `./ui/*`, state in `./state.ts`, and the data registries in `./presets/*`.
 */

import { applyCustomTheme, type CustomTheme } from './theme';
import { renderPreview } from './preview';
import {
  applyThemePack,
  buildOutputUrl,
  buildTheme,
  detectThemePack,
  makeInitialState,
  type FormState,
} from './state';
import { createVariableForm } from './ui/form';
import { createThemePackPicker } from './ui/themePackPicker';
import { findThemePack } from './presets/themePacks';
import { flashButton, q } from './utils';

const state = makeInitialState();

/* ------------------------------------------------------------------ */
/* DOM scaffolding                                                    */
/* ------------------------------------------------------------------ */

const packPicker = createThemePackPicker({
  mount: q('#cu-theme-packs'),
  onPick: (pack) => {
    Object.assign(state, applyThemePack(state, pack));
    form.refresh();
    packPicker.highlight(state.themePack);
    refreshOutput();
  },
});

const form = createVariableForm({
  mount: q('#cu-vars'),
  getValue: (name) => state.vars[name] ?? '',
  onVariableChange: (name, value) => {
    if (value.trim()) state.vars[name] = value.trim();
    else delete state.vars[name];
    // Editing any individual variable detaches from the active pack.
    state.themePack = '';
    packPicker.highlight(null);
    refreshOutput();
  },
});

// Populate the static (non-variable) form fields.
q<HTMLInputElement>('#cu-baseUrl').value = state.baseUrl;
q<HTMLInputElement>('#cu-channel').value = state.channel;
q<HTMLSelectElement>('#cu-theme').value = state.theme;
q<HTMLInputElement>('#cu-showBadges').checked = state.show.badges;
q<HTMLInputElement>('#cu-showReplies').checked = state.show.replies;
q<HTMLInputElement>('#cu-showBits').checked = state.show.bits;
q<HTMLInputElement>('#cu-showStatus').checked = state.show.status;
q<HTMLTextAreaElement>('#cu-css').value = state.css;

// Highlight the pack matching the imported theme64 (if any).
const detected = state.themePack ? findThemePack(state.themePack) : detectThemePack(state.vars);
if (detected) {
  state.themePack = detected.id;
  packPicker.highlight(detected.id);
}

/* ------------------------------------------------------------------ */
/* Event wiring                                                       */
/* ------------------------------------------------------------------ */

document.getElementById('cu-form')!.addEventListener('input', (event) => {
  // Variable rows already self-report through onVariableChange; only sync the
  // top-level fields here so we don't double-process.
  const target = event.target as HTMLElement | null;
  if (target?.closest('.cu__var')) return;
  syncStaticFromForm();
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
  const blob = new Blob([JSON.stringify(buildTheme(state), null, 2)], { type: 'application/json' });
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
    state.vars = { ...state.vars, ...(parsed.vars ?? {}) };
    if (parsed.css) state.css = parsed.css;
    if (parsed.show) state.show = { ...state.show, ...parsed.show };
    if (parsed.meta?.themePack) state.themePack = parsed.meta.themePack;
    form.refresh();
    q<HTMLTextAreaElement>('#cu-css').value = state.css;
    syncShowControls();
    packPicker.highlight(state.themePack || null);
    refreshOutput();
  } catch (error) {
    alert(`Could not import theme: ${(error as Error).message}`);
  } finally {
    input.value = '';
  }
});

q<HTMLButtonElement>('#cu-reset').addEventListener('click', () => {
  if (!confirm('Clear every customisation and start from defaults?')) return;
  state.vars = {};
  state.css = '';
  state.themePack = '';
  q<HTMLTextAreaElement>('#cu-css').value = '';
  form.refresh();
  packPicker.highlight(null);
  refreshOutput();
});

refreshOutput();

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function syncStaticFromForm(): void {
  state.baseUrl = q<HTMLInputElement>('#cu-baseUrl').value.trim();
  state.channel = q<HTMLInputElement>('#cu-channel').value.trim();
  state.theme = q<HTMLSelectElement>('#cu-theme').value;
  state.show.badges = q<HTMLInputElement>('#cu-showBadges').checked;
  state.show.replies = q<HTMLInputElement>('#cu-showReplies').checked;
  state.show.bits = q<HTMLInputElement>('#cu-showBits').checked;
  state.show.status = q<HTMLInputElement>('#cu-showStatus').checked;
  state.css = q<HTMLTextAreaElement>('#cu-css').value;
}

function syncShowControls(): void {
  q<HTMLInputElement>('#cu-showBadges').checked = state.show.badges;
  q<HTMLInputElement>('#cu-showReplies').checked = state.show.replies;
  q<HTMLInputElement>('#cu-showBits').checked = state.show.bits;
  q<HTMLInputElement>('#cu-showStatus').checked = state.show.status;
}

function refreshOutput(): void {
  const url = buildOutputUrl(state);
  const theme = buildTheme(state);
  q<HTMLTextAreaElement>('#cu-output').value = url;
  q<HTMLPreElement>('#cu-json').textContent = JSON.stringify(theme, null, 2);
  renderPreview(q<HTMLIFrameElement>('#cu-preview'), theme, state.theme, state.channel, state.baseUrl);
}

// Re-export the runtime application helper for any consumer that imports the
// customiser module directly (e.g. unit tests).
export { applyCustomTheme };
export type { FormState };
