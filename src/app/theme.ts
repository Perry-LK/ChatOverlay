import type { OverlayConfig } from '../types';

async function loadOptionalStylesheet(href: string, id: string): Promise<void> {
  await new Promise<void>((resolve) => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => {
      link.remove();
      resolve();
    };

    document.head.appendChild(link);
  });
}

function sanitizeThemeName(name: string): string {
  return name.replace(/[^a-z0-9_-]/g, '');
}

/**
 * Loads the named theme stylesheet as early as possible (before config.json
 * has finished fetching) to avoid a flash of un-themed base styles. Calling
 * this twice with different names replaces the previously injected link.
 */
export async function preloadTheme(themeName: string): Promise<void> {
  const safe = sanitizeThemeName(themeName);
  if (!safe || safe === 'none') return;
  await loadOptionalStylesheet(`${import.meta.env.BASE_URL}themes/${safe}.css`, 'overlay-theme');
}

export async function applyTheme(config: OverlayConfig): Promise<void> {
  await preloadTheme(config.theme);
  await loadOptionalStylesheet(`${import.meta.env.BASE_URL}custom.css`, 'overlay-custom');
}