/**
 * Small DOM helpers shared by the customiser UI modules. Kept dependency-free
 * so any module can import them without pulling in the rest of the app.
 */

export function q<T extends HTMLElement = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Customise: missing element ${selector}`);
  return el;
}

export function flashButton(selector: string, label: string): void {
  const button = document.querySelector<HTMLButtonElement>(selector);
  if (!button) return;
  const prev = button.textContent;
  button.textContent = label;
  setTimeout(() => {
    button.textContent = prev;
  }, 1200);
}

/**
 * Normalises a colour-ish string to a `#rrggbb` form usable in
 * `<input type="color">`. Returns `null` when the value is not a hex literal.
 */
export function normalizeColor(value: string): string | null {
  const v = value.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return null;
  if (v.length === 4) {
    return '#' + v.slice(1).split('').map((c) => c + c).join('').toLowerCase();
  }
  return v.toLowerCase();
}
