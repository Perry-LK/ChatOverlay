/**
 * Definitions of every CSS variable exposed in the customiser, together with
 * a small set of named presets per variable. The "Custom" option in the UI is
 * implicit: when no preset matches the current value the input falls through
 * to a free-text field.
 *
 * Keep this file declarative — adding a new preset should not require any
 * other code changes.
 */

import { FONT_PRESETS } from './fonts';

export type VariableType = 'color' | 'length' | 'number' | 'text' | 'font' | 'shadow' | 'background' | 'border' | 'select';

export interface VariablePreset {
  id: string;
  label: string;
  value: string;
}

export interface VariableDefinition {
  /** CSS custom property name, e.g. `--co-text`. */
  name: string;
  /** Human label for the form row. */
  label: string;
  /** Group key, used to route the control into the right fieldset. */
  group: 'message' | 'username' | 'badges' | 'emote' | 'card' | 'reply' | 'animation' | 'layout';
  /** Hint to the input widget. */
  type: VariableType;
  /** Short description shown beneath the label. */
  description?: string;
  /** Optional curated presets. */
  presets?: VariablePreset[];
}

const FONT_VARIABLE_PRESETS: VariablePreset[] = FONT_PRESETS.map((p) => ({
  id: `font-${p.id}`,
  label: p.label,
  value: p.family,
}));

export const CUSTOMISABLE_VARS: VariableDefinition[] = [
  /* -------------------------------------------------- Message text */
  {
    name: '--co-font',
    label: 'Font family',
    group: 'message',
    type: 'font',
    description: 'Applies to all chat text. Google Fonts presets are auto-imported into the exported theme.',
    presets: FONT_VARIABLE_PRESETS,
  },
  {
    name: '--co-font-size',
    label: 'Font size',
    group: 'message',
    type: 'length',
    presets: [
      { id: 'xs', label: 'Tight (16px)', value: '16px' },
      { id: 'sm', label: 'Small (18px)', value: '18px' },
      { id: 'md', label: 'Medium (20px)', value: '20px' },
      { id: 'lg', label: 'Large (24px)', value: '24px' },
      { id: 'xl', label: 'Huge (28px)', value: '28px' },
    ],
  },
  {
    name: '--co-font-weight',
    label: 'Font weight',
    group: 'message',
    type: 'number',
    presets: [
      { id: 'light', label: 'Light (300)', value: '300' },
      { id: 'regular', label: 'Regular (400)', value: '400' },
      { id: 'medium', label: 'Medium (500)', value: '500' },
      { id: 'bold', label: 'Bold (700)', value: '700' },
      { id: 'black', label: 'Black (900)', value: '900' },
    ],
  },
  {
    name: '--co-line-height',
    label: 'Line height',
    group: 'message',
    type: 'number',
    presets: [
      { id: 'snug', label: 'Snug (1.2)', value: '1.2' },
      { id: 'normal', label: 'Normal (1.35)', value: '1.35' },
      { id: 'roomy', label: 'Roomy (1.55)', value: '1.55' },
    ],
  },
  {
    name: '--co-letter-spacing',
    label: 'Letter spacing',
    group: 'message',
    type: 'length',
    presets: [
      { id: 'tight', label: 'Tight (-0.02em)', value: '-0.02em' },
      { id: 'normal', label: 'Normal', value: 'normal' },
      { id: 'wide', label: 'Wide (0.04em)', value: '0.04em' },
      { id: 'extra-wide', label: 'Extra wide (0.1em)', value: '0.1em' },
    ],
  },
  {
    name: '--co-text',
    label: 'Text colour',
    group: 'message',
    type: 'color',
    presets: [
      { id: 'white', label: 'White', value: '#ffffff' },
      { id: 'cream', label: 'Cream', value: '#f7eedd' },
      { id: 'lemon', label: 'Lemon', value: '#fff2a1' },
      { id: 'sky', label: 'Sky blue', value: '#cfe6ff' },
      { id: 'mint', label: 'Mint', value: '#c5f0d6' },
      { id: 'ink', label: 'Ink', value: '#0c1224' },
    ],
  },
  {
    name: '--co-text-shadow',
    label: 'Text shadow',
    group: 'message',
    type: 'shadow',
    presets: [
      { id: 'soft', label: 'Soft outline', value: '0 0 2px #000, 0 0 4px #000, 1px 1px 2px #000' },
      { id: 'hard', label: 'Hard outline', value: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' },
      { id: 'neon-cyan', label: 'Neon cyan glow', value: '0 0 6px #00e5ff, 0 0 14px #00e5ff' },
      { id: 'neon-magenta', label: 'Neon magenta glow', value: '0 0 6px #ff3df0, 0 0 14px #ff3df0' },
      { id: 'paper', label: 'Paper (none)', value: 'none' },
    ],
  },

  /* -------------------------------------------------- Username */
  {
    name: '--co-username-weight',
    label: 'Username weight',
    group: 'username',
    type: 'number',
    presets: [
      { id: 'regular', label: 'Regular (400)', value: '400' },
      { id: 'semibold', label: 'Semibold (600)', value: '600' },
      { id: 'bold', label: 'Bold (700)', value: '700' },
      { id: 'black', label: 'Black (900)', value: '900' },
    ],
  },
  {
    name: '--co-username-letter-spacing',
    label: 'Username letter spacing',
    group: 'username',
    type: 'length',
    presets: [
      { id: 'normal', label: 'Normal', value: 'normal' },
      { id: 'wide', label: 'Wide (0.04em)', value: '0.04em' },
      { id: 'extra-wide', label: 'Extra wide (0.12em)', value: '0.12em' },
    ],
  },
  {
    name: '--co-username-transform',
    label: 'Username case',
    group: 'username',
    type: 'select',
    presets: [
      { id: 'none', label: 'As-is', value: 'none' },
      { id: 'upper', label: 'UPPERCASE', value: 'uppercase' },
      { id: 'lower', label: 'lowercase', value: 'lowercase' },
      { id: 'small-caps', label: 'Small caps', value: 'small-caps' },
    ],
  },

  /* -------------------------------------------------- Badges */
  {
    name: '--co-badge-size',
    label: 'Badge size',
    group: 'badges',
    type: 'length',
    presets: [
      { id: 'sm', label: 'Small (0.9em)', value: '0.9em' },
      { id: 'md', label: 'Medium (1em)', value: '1em' },
      { id: 'lg', label: 'Large (1.2em)', value: '1.2em' },
    ],
  },
  {
    name: '--co-badge-gap',
    label: 'Badge gap',
    group: 'badges',
    type: 'length',
    presets: [
      { id: 'tight', label: 'Tight (2px)', value: '2px' },
      { id: 'normal', label: 'Normal (3px)', value: '3px' },
      { id: 'wide', label: 'Wide (6px)', value: '6px' },
    ],
  },

  /* -------------------------------------------------- Emotes */
  {
    name: '--co-emote-size',
    label: 'Emote size',
    group: 'emote',
    type: 'length',
    presets: [
      { id: 'sm', label: 'Small (1.3em)', value: '1.3em' },
      { id: 'md', label: 'Medium (1.6em)', value: '1.6em' },
      { id: 'lg', label: 'Large (2em)', value: '2em' },
      { id: 'xl', label: 'Huge (2.5em)', value: '2.5em' },
    ],
  },

  /* -------------------------------------------------- Card */
  {
    name: '--co-card-bg',
    label: 'Card background',
    group: 'card',
    type: 'background',
    description: 'Accepts colours, gradients, or `transparent`.',
    presets: [
      { id: 'none', label: 'None (transparent)', value: 'transparent' },
      { id: 'glass', label: 'Glass', value: 'rgba(20, 28, 48, 0.55)' },
      { id: 'dark', label: 'Dark solid', value: 'rgba(0, 0, 0, 0.78)' },
      { id: 'comic', label: 'Comic yellow', value: '#fff3a0' },
      { id: 'paper', label: 'Paper cream', value: '#f7eedd' },
      { id: 'neon-gradient', label: 'Neon gradient', value: 'linear-gradient(135deg, rgba(255,61,240,0.32), rgba(0,229,255,0.32))' },
      { id: 'sleek-gradient', label: 'Sleek gradient', value: 'linear-gradient(180deg, rgba(25, 34, 58, 0.78), rgba(14, 20, 36, 0.66))' },
    ],
  },
  {
    name: '--co-card-border',
    label: 'Card border',
    group: 'card',
    type: 'border',
    description: 'CSS shorthand: width style colour.',
    presets: [
      { id: 'none', label: 'None', value: '0 solid transparent' },
      { id: 'hairline', label: 'Hairline', value: '1px solid rgba(255,255,255,0.18)' },
      { id: 'glass', label: 'Glass edge', value: '1px solid rgba(194,219,255,0.16)' },
      { id: 'comic', label: 'Comic ink', value: '3px solid #111' },
      { id: 'neon-cyan', label: 'Neon cyan', value: '1px solid #00e5ff' },
      { id: 'neon-magenta', label: 'Neon magenta', value: '1px solid #ff3df0' },
    ],
  },
  {
    name: '--co-card-shadow',
    label: 'Card shadow',
    group: 'card',
    type: 'shadow',
    presets: [
      { id: 'none', label: 'None', value: 'none' },
      { id: 'soft', label: 'Soft drop', value: '0 8px 20px rgba(0,0,0,0.28)' },
      { id: 'inset', label: 'Inset highlight', value: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 24px rgba(0,0,0,0.28)' },
      { id: 'comic', label: 'Comic offset', value: '4px 4px 0 #111' },
      { id: 'neon', label: 'Neon glow', value: '0 0 14px rgba(0,229,255,0.55), 0 0 28px rgba(255,61,240,0.35)' },
    ],
  },
  {
    name: '--co-card-backdrop',
    label: 'Card backdrop blur',
    group: 'card',
    type: 'select',
    description: 'CSS `backdrop-filter`. Requires a translucent card background to be visible.',
    presets: [
      { id: 'none', label: 'None', value: 'none' },
      { id: 'soft', label: 'Soft (blur 6px)', value: 'blur(6px)' },
      { id: 'glass', label: 'Glass (blur 12px)', value: 'blur(12px) saturate(120%)' },
      { id: 'heavy', label: 'Heavy (blur 20px)', value: 'blur(20px) saturate(140%)' },
    ],
  },
  {
    name: '--co-radius',
    label: 'Card radius',
    group: 'card',
    type: 'length',
    presets: [
      { id: 'square', label: 'Square (0)', value: '0' },
      { id: 'small', label: 'Small (6px)', value: '6px' },
      { id: 'medium', label: 'Medium (12px)', value: '12px' },
      { id: 'large', label: 'Large (20px)', value: '20px' },
      { id: 'pill', label: 'Pill (999px)', value: '999px' },
    ],
  },
  {
    name: '--co-padding',
    label: 'Card padding',
    group: 'card',
    type: 'text',
    presets: [
      { id: 'tight', label: 'Tight (2px 6px)', value: '2px 6px' },
      { id: 'cozy', label: 'Cozy (6px 10px)', value: '6px 10px' },
      { id: 'roomy', label: 'Roomy (10px 14px)', value: '10px 14px' },
      { id: 'spacious', label: 'Spacious (14px 18px)', value: '14px 18px' },
    ],
  },
  {
    name: '--co-card-max-width',
    label: 'Card max width',
    group: 'card',
    type: 'length',
    presets: [
      { id: 'full', label: 'Full width', value: '100%' },
      { id: 'compact', label: 'Compact (560px)', value: 'min(92%, 560px)' },
      { id: 'wide', label: 'Wide (760px)', value: 'min(92%, 760px)' },
    ],
  },
  {
    name: '--co-message-gap',
    label: 'Gap between messages',
    group: 'card',
    type: 'length',
    presets: [
      { id: 'tight', label: 'Tight (2px)', value: '2px' },
      { id: 'normal', label: 'Normal (6px)', value: '6px' },
      { id: 'roomy', label: 'Roomy (12px)', value: '12px' },
    ],
  },

  /* -------------------------------------------------- Layout */
  {
    name: '--co-chat-padding',
    label: 'Chat padding',
    group: 'layout',
    type: 'length',
    presets: [
      { id: 'tight', label: 'Tight (4px)', value: '4px' },
      { id: 'normal', label: 'Normal (12px)', value: '12px' },
      { id: 'roomy', label: 'Roomy (24px)', value: '24px' },
    ],
  },
  {
    name: '--co-chat-align',
    label: 'Chat alignment',
    group: 'layout',
    type: 'select',
    presets: [
      { id: 'bottom', label: 'Bottom up', value: 'flex-end' },
      { id: 'top', label: 'Top down', value: 'flex-start' },
      { id: 'center', label: 'Centered', value: 'center' },
    ],
  },

  /* -------------------------------------------------- Reply */
  {
    name: '--co-reply-opacity',
    label: 'Reply line opacity',
    group: 'reply',
    type: 'number',
    presets: [
      { id: 'faint', label: 'Faint (0.45)', value: '0.45' },
      { id: 'soft', label: 'Soft (0.75)', value: '0.75' },
      { id: 'full', label: 'Full (1)', value: '1' },
    ],
  },
  {
    name: '--co-reply-style',
    label: 'Reply style',
    group: 'reply',
    type: 'select',
    presets: [
      { id: 'normal', label: 'Normal', value: 'normal' },
      { id: 'italic', label: 'Italic', value: 'italic' },
    ],
  },
  {
    name: '--co-reply-color',
    label: 'Reply colour',
    group: 'reply',
    type: 'color',
    presets: [
      { id: 'inherit', label: 'Inherit', value: 'inherit' },
      { id: 'cool', label: 'Cool blue', value: '#d4e4ff' },
      { id: 'muted', label: 'Muted grey', value: '#a8a8a8' },
    ],
  },

  /* -------------------------------------------------- Animation */
  {
    name: '--co-fade-duration',
    label: 'Fade duration',
    group: 'animation',
    type: 'length',
    presets: [
      { id: 'fast', label: 'Fast (200ms)', value: '200ms' },
      { id: 'normal', label: 'Normal (400ms)', value: '400ms' },
      { id: 'slow', label: 'Slow (800ms)', value: '800ms' },
    ],
  },
  {
    name: '--co-enter-duration',
    label: 'Enter duration',
    group: 'animation',
    type: 'length',
    presets: [
      { id: 'snap', label: 'Snap (120ms)', value: '120ms' },
      { id: 'normal', label: 'Normal (220ms)', value: '220ms' },
      { id: 'lazy', label: 'Lazy (420ms)', value: '420ms' },
    ],
  },
  {
    name: '--co-enter-translate',
    label: 'Enter translate',
    group: 'animation',
    type: 'length',
    description: 'How far new messages slide in from.',
    presets: [
      { id: 'none', label: 'None (0)', value: '0px' },
      { id: 'small', label: 'Small (6px)', value: '6px' },
      { id: 'big', label: 'Big (16px)', value: '16px' },
    ],
  },
  {
    name: '--co-enter-easing',
    label: 'Enter easing',
    group: 'animation',
    type: 'select',
    presets: [
      { id: 'ease-out', label: 'Ease-out', value: 'ease-out' },
      { id: 'linear', label: 'Linear', value: 'linear' },
      { id: 'snappy', label: 'Snappy', value: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      { id: 'bouncy', label: 'Bouncy', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    ],
  },
];

/** Maps group keys to the user-facing legend in the customiser form. */
export const GROUP_LABELS: Record<VariableDefinition['group'], string> = {
  message: 'Message text',
  username: 'Username',
  badges: 'Badges',
  emote: 'Emotes',
  card: 'Message card',
  reply: 'Replies',
  animation: 'Animation',
  layout: 'Layout',
};

export function findVariablePreset(def: VariableDefinition, value: string): VariablePreset | undefined {
  if (!def.presets) return undefined;
  const v = value.trim();
  return def.presets.find((p) => p.value.trim() === v);
}
