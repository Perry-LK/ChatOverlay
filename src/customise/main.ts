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
  mount: q('#cu-vars-style'),
  groupMounts: {
    message: q('#cu-vars-text'),
    username: q('#cu-vars-text'),
    badges: q('#cu-vars-style'),
    emote: q('#cu-vars-style'),
    card: q('#cu-vars-style'),
    reply: q('#cu-vars-style'),
    animation: q('#cu-vars-style'),
    layout: q('#cu-vars-style'),
  },
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
setupTabs();

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

function setupTabs(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-tab]')];
  const panels = [...document.querySelectorAll<HTMLElement>('[data-tab-panel]')];
  if (!buttons.length || !panels.length) return;

  const activate = (tabId: string): void => {
    for (const button of buttons) {
      const active = button.dataset.tab === tabId;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    }
    for (const panel of panels) {
      const active = panel.dataset.tabPanel === tabId;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    }
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activate(button.dataset.tab || ''));
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = buttons[(index + delta + buttons.length) % buttons.length];
      next.focus();
      activate(next.dataset.tab || '');
    });
  });

  activate(buttons[0]?.dataset.tab || 'setup');
}

// Re-export the runtime application helper for any consumer that imports the
// customiser module directly (e.g. unit tests).
export { applyCustomTheme };
export type { FormState };
