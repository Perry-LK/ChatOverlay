import type { ThemePack } from '../presets/themePacks';
import { THEME_PACKS } from '../presets/themePacks';

/**
 * Visual card picker for the curated theme packs in `presets/themePacks.ts`.
 * Selecting a pack triggers `onPick`, which is expected to merge the pack's
 * variables on top of the current customiser state.
 */

export interface ThemePackPickerOptions {
  /** Element to render into. The picker replaces its children. */
  mount: HTMLElement;
  /** Called when the user picks a pack. */
  onPick: (pack: ThemePack) => void;
}

export function createThemePackPicker({ mount, onPick }: ThemePackPickerOptions): { highlight: (id: string | null) => void } {
  mount.replaceChildren();
  mount.classList.add('cu__pack-grid');

  const cards = new Map<string, HTMLButtonElement>();

  for (const pack of THEME_PACKS) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'cu__pack';
    card.dataset.packId = pack.id;
    card.innerHTML = `
      <span class="cu__pack-swatch" style="background: linear-gradient(135deg, ${pack.swatch[0]}, ${pack.swatch[1]})" aria-hidden="true"></span>
      <span class="cu__pack-body">
        <span class="cu__pack-label">${pack.label}</span>
        <span class="cu__pack-desc">${pack.description}</span>
      </span>
    `;
    card.addEventListener('click', () => onPick(pack));
    mount.appendChild(card);
    cards.set(pack.id, card);
  }

  return {
    highlight(id) {
      for (const [packId, card] of cards) {
        card.classList.toggle('cu__pack--active', packId === id);
      }
    },
  };
}
