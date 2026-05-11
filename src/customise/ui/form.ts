import type { VariableDefinition } from '../presets/variables';
import { CUSTOMISABLE_VARS, GROUP_LABELS } from '../presets/variables';
import { createVariableRow, type VariableRow } from './variableRow';

/**
 * Builds the full set of variable rows, grouped by `VariableDefinition.group`,
 * and inserts a fieldset per group. Each row registers itself so its value
 * can be refreshed externally (e.g. when a theme pack is applied).
 */

export interface VariableFormOptions {
  /** Where the generated fieldsets are appended. */
  mount: HTMLElement;
  /** Current value lookup. */
  getValue: (name: string) => string;
  /** Notified when any individual variable changes. */
  onVariableChange: (name: string, value: string) => void;
}

export interface VariableForm {
  /** Refresh every row from `getValue`. Useful after a bulk update. */
  refresh: () => void;
}

export function createVariableForm({ mount, getValue, onVariableChange }: VariableFormOptions): VariableForm {
  mount.replaceChildren();

  const rows = new Map<string, VariableRow>();
  const grouped = groupBy(CUSTOMISABLE_VARS, (v) => v.group);

  for (const [group, defs] of grouped) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'cu__vars';
    fieldset.dataset.group = group;

    const legend = document.createElement('legend');
    legend.textContent = GROUP_LABELS[group] ?? group;
    fieldset.appendChild(legend);

    for (const def of defs) {
      const row = createVariableRow({
        def,
        value: getValue(def.name),
        onChange: (next) => onVariableChange(def.name, next),
      });
      fieldset.appendChild(row.element);
      rows.set(def.name, row);
    }

    mount.appendChild(fieldset);
  }

  return {
    refresh() {
      for (const [name, row] of rows) row.setValue(getValue(name));
    },
  };
}

function groupBy<T, K extends string>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}

export { CUSTOMISABLE_VARS };
export type { VariableDefinition };
