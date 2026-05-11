import type { VariableDefinition, VariablePreset } from '../presets/variables';
import { findVariablePreset } from '../presets/variables';
import { normalizeColor } from '../utils';

/**
 * One self-contained form row for a single CSS variable. Combines a "preset"
 * dropdown with a free-form input so users can either pick a named value or
 * type their own ("Custom"). The preset dropdown automatically reflects the
 * current input value: if it matches a preset, that preset is selected;
 * otherwise the dropdown shows "Custom".
 */

export interface VariableRowOptions {
  def: VariableDefinition;
  /** Current value for the variable; empty string means "use base default". */
  value: string;
  /** Called whenever the user changes the value (preset, text, or colour). */
  onChange: (next: string) => void;
}

export interface VariableRow {
  /** Mount node to append into the form. */
  element: HTMLElement;
  /** Refresh the row from an external value change (e.g. theme pack applied). */
  setValue: (next: string) => void;
}

const CUSTOM_OPTION_VALUE = '__custom__';
const RESET_OPTION_VALUE = '__reset__';

export function createVariableRow({ def, value, onChange }: VariableRowOptions): VariableRow {
  const root = document.createElement('label');
  root.className = 'cu__var';

  const header = document.createElement('span');
  header.className = 'cu__var-header';
  header.innerHTML = `<span class="cu__var-label">${def.label}</span><code class="cu__var-name">${def.name}</code>`;
  root.appendChild(header);

  if (def.description) {
    const help = document.createElement('span');
    help.className = 'cu__var-help';
    help.textContent = def.description;
    root.appendChild(help);
  }

  const controls = document.createElement('div');
  controls.className = 'cu__var-controls';
  root.appendChild(controls);

  // -- Preset dropdown ----------------------------------------------------
  const select = document.createElement('select');
  select.className = 'cu__var-select';
  select.dataset.varSelect = def.name;
  appendPresetOptions(select, def.presets ?? []);
  controls.appendChild(select);

  // -- Optional colour swatch --------------------------------------------
  let colorInput: HTMLInputElement | null = null;
  if (def.type === 'color') {
    colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'cu__var-color';
    controls.appendChild(colorInput);
  }

  // -- Free-form value input ---------------------------------------------
  const text = document.createElement('input');
  text.type = 'text';
  text.className = 'cu__var-input';
  text.dataset.var = def.name;
  text.placeholder = placeholderFor(def.type);
  controls.appendChild(text);

  // -- Behaviour ----------------------------------------------------------
  const apply = (next: string): void => {
    text.value = next;
    if (colorInput) {
      const hex = normalizeColor(next);
      if (hex) colorInput.value = hex;
    }
    select.value = computeSelectValue(def, next);
  };

  apply(value);

  select.addEventListener('change', () => {
    const choice = select.value;
    if (choice === RESET_OPTION_VALUE) {
      apply('');
      onChange('');
      return;
    }
    if (choice === CUSTOM_OPTION_VALUE) {
      // Keep current value but focus the input so the user can edit it.
      text.focus();
      return;
    }
    const preset = def.presets?.find((p) => p.id === choice);
    if (!preset) return;
    apply(preset.value);
    onChange(preset.value);
  });

  text.addEventListener('input', () => {
    const next = text.value;
    select.value = computeSelectValue(def, next);
    if (colorInput) {
      const hex = normalizeColor(next);
      if (hex) colorInput.value = hex;
    }
    onChange(next);
  });

  if (colorInput) {
    colorInput.addEventListener('input', () => {
      text.value = colorInput!.value;
      text.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  return {
    element: root,
    setValue: apply,
  };
}

/* --------------------------------------------------------------------- */
/* Local helpers                                                         */
/* --------------------------------------------------------------------- */

function appendPresetOptions(select: HTMLSelectElement, presets: VariablePreset[]): void {
  const reset = document.createElement('option');
  reset.value = RESET_OPTION_VALUE;
  reset.textContent = '— use overlay default —';
  select.appendChild(reset);

  for (const preset of presets) {
    const opt = document.createElement('option');
    opt.value = preset.id;
    opt.textContent = preset.label;
    select.appendChild(opt);
  }

  const custom = document.createElement('option');
  custom.value = CUSTOM_OPTION_VALUE;
  custom.textContent = 'Custom value…';
  select.appendChild(custom);
}

function computeSelectValue(def: VariableDefinition, value: string): string {
  if (!value.trim()) return RESET_OPTION_VALUE;
  const preset = findVariablePreset(def, value);
  return preset ? preset.id : CUSTOM_OPTION_VALUE;
}

function placeholderFor(type: VariableDefinition['type']): string {
  switch (type) {
    case 'length': return 'e.g. 22px / 1.6em';
    case 'number': return 'e.g. 700';
    case 'color': return '#fff, rgba(...) or named';
    case 'font': return "'Inter', sans-serif";
    case 'shadow': return '0 0 6px #000';
    case 'background': return 'transparent / colour / gradient';
    case 'border': return '1px solid #fff';
    case 'select': return 'CSS value';
    default: return 'CSS value';
  }
}
