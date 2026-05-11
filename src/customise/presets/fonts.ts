/**
 * Font presets exposed in the customiser. Each entry describes the CSS
 * font-family stack to apply and, optionally, a Google Fonts stylesheet to
 * @import so the font also renders when the overlay is loaded standalone in
 * OBS (the @import is baked into the exported `theme64` CSS payload).
 */

export interface FontPreset {
  /** Stable key used in the form state. */
  id: string;
  /** Human-friendly label rendered in the picker. */
  label: string;
  /** Short category tag, used for grouping in the UI. */
  category: 'sans' | 'serif' | 'mono' | 'display' | 'handwriting' | 'system';
  /** Full CSS font-family stack. */
  family: string;
  /** Optional Google Fonts stylesheet URL imported when this preset is active. */
  importUrl?: string;
}

export const FONT_PRESETS: FontPreset[] = [
  // System / sans
  { id: 'system-sans', label: 'System sans', category: 'system', family: "system-ui, 'Segoe UI', sans-serif" },
  { id: 'inter', label: 'Inter', category: 'sans', family: "'Inter', system-ui, sans-serif", importUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap' },
  { id: 'roboto', label: 'Roboto', category: 'sans', family: "'Roboto', system-ui, sans-serif", importUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap' },
  { id: 'plex-sans', label: 'IBM Plex Sans', category: 'sans', family: "'IBM Plex Sans', system-ui, sans-serif", importUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;700&display=swap' },
  { id: 'nunito', label: 'Nunito', category: 'sans', family: "'Nunito', system-ui, sans-serif", importUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap' },
  { id: 'trebuchet', label: 'Trebuchet MS', category: 'sans', family: "'Trebuchet MS', 'Avenir Next', system-ui, sans-serif" },

  // Serif
  { id: 'merriweather', label: 'Merriweather', category: 'serif', family: "'Merriweather', Georgia, serif", importUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap' },
  { id: 'georgia', label: 'Georgia', category: 'serif', family: "Georgia, 'Times New Roman', serif" },
  { id: 'playfair', label: 'Playfair Display', category: 'serif', family: "'Playfair Display', Georgia, serif", importUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap' },

  // Mono
  { id: 'jetbrains-mono', label: 'JetBrains Mono', category: 'mono', family: "'JetBrains Mono', ui-monospace, monospace", importUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap' },
  { id: 'fira-code', label: 'Fira Code', category: 'mono', family: "'Fira Code', ui-monospace, monospace", importUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap' },
  { id: 'mono-system', label: 'System mono', category: 'mono', family: "ui-monospace, 'SF Mono', Menlo, monospace" },

  // Display / arcade
  { id: 'orbitron', label: 'Orbitron (futurist)', category: 'display', family: "'Orbitron', system-ui, sans-serif", importUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap' },
  { id: 'press-start', label: 'Press Start 2P (arcade)', category: 'display', family: "'Press Start 2P', ui-monospace, monospace", importUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap' },
  { id: 'bangers', label: 'Bangers (comic)', category: 'display', family: "'Bangers', 'Comic Sans MS', cursive", importUrl: 'https://fonts.googleapis.com/css2?family=Bangers&display=swap' },
  { id: 'bungee', label: 'Bungee (bold display)', category: 'display', family: "'Bungee', system-ui, sans-serif", importUrl: 'https://fonts.googleapis.com/css2?family=Bungee&display=swap' },
  { id: 'audiowide', label: 'Audiowide (sci-fi)', category: 'display', family: "'Audiowide', system-ui, sans-serif", importUrl: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap' },

  // Handwriting
  { id: 'caveat', label: 'Caveat (hand-written)', category: 'handwriting', family: "'Caveat', 'Comic Sans MS', cursive", importUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap' },
  { id: 'permanent-marker', label: 'Permanent Marker', category: 'handwriting', family: "'Permanent Marker', 'Comic Sans MS', cursive", importUrl: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap' },
  { id: 'shadows-into-light', label: 'Shadows Into Light', category: 'handwriting', family: "'Shadows Into Light', cursive", importUrl: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap' },
  { id: 'comic-sans', label: 'Comic Sans MS', category: 'handwriting', family: "'Comic Sans MS', 'Comic Neue', cursive" },
];

export function findFontPreset(family: string | undefined): FontPreset | undefined {
  if (!family) return undefined;
  const cleaned = family.trim();
  return FONT_PRESETS.find((p) => p.family === cleaned || p.label === cleaned);
}

/**
 * Collects @import URLs for whichever preset fonts are currently referenced by
 * the supplied vars map. Returned as a single CSS string ready to prepend to
 * the exported custom CSS (so OBS picks them up too).
 */
export function collectFontImports(vars: Record<string, string>): string {
  const seen = new Set<string>();
  const imports: string[] = [];

  for (const [name, value] of Object.entries(vars)) {
    if (!name.startsWith('--co-font')) continue;
    const preset = findFontPreset(value);
    if (!preset?.importUrl) continue;
    if (seen.has(preset.importUrl)) continue;
    seen.add(preset.importUrl);
    imports.push(`@import url("${preset.importUrl}");`);
  }

  return imports.join('\n');
}
