/**
 * Tiny diagnostics overlay rendered when ?debug=1 is in the URL.
 *
 * Surfaces the runtime state that is most often the culprit when the overlay
 * misbehaves: connection state, resolved user-id, badge map size, badge
 * fetch errors, 7TV emote count, and a rolling list of warnings.
 */

export interface DebugSnapshot {
  channel: string;
  userId: string | null;
  twitchApiBase: string;
  ircState: 'connecting' | 'open' | 'closed' | 'error' | 'idle';
  badgeCount: number;
  badgeSource: 'baseline' | 'api' | 'partial';
  badgeError: string | null;
  badgeSampleKeys: string[];
  sevenTvCount: number;
  sevenTvError: string | null;
  themeName: string;
  customThemeApplied: boolean;
  warnings: string[];
}

export class DebugPanel {
  private root: HTMLElement;
  private snapshot: DebugSnapshot;
  private warnings: string[] = [];

  constructor(initial: Partial<DebugSnapshot> = {}) {
    this.snapshot = {
      channel: '',
      userId: null,
      twitchApiBase: '',
      ircState: 'idle',
      badgeCount: 0,
      badgeSource: 'baseline',
      badgeError: null,
      badgeSampleKeys: [],
      sevenTvCount: 0,
      sevenTvError: null,
      themeName: '',
      customThemeApplied: false,
      warnings: [],
      ...initial,
    };

    this.root = document.createElement('div');
    this.root.className = 'co-debug';
    this.root.setAttribute('role', 'status');
    this.root.setAttribute('aria-label', 'Chat overlay debug panel');
    document.body.appendChild(this.root);
    this.injectStyles();
    this.render();
  }

  update(partial: Partial<DebugSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...partial };
    this.render();
  }

  warn(message: string): void {
    const stamp = new Date().toLocaleTimeString();
    this.warnings.push(`[${stamp}] ${message}`);
    if (this.warnings.length > 20) this.warnings.shift();
    this.snapshot.warnings = this.warnings;
    this.render();
  }

  private render(): void {
    const s = this.snapshot;
    const lines: string[] = [
      `<strong>Chat Overlay debug</strong>`,
      `channel: <code>${escapeHtml(s.channel || '—')}</code>`,
      `userId: <code>${escapeHtml(s.userId ?? 'null')}</code>`,
      `apiBase: <code>${escapeHtml(s.twitchApiBase || 'none')}</code>`,
      `IRC: <code class="co-debug__state co-debug__state--${s.ircState}">${s.ircState}</code>`,
      `badges: <code>${s.badgeCount}</code> <code>${s.badgeSource}</code>${s.badgeError ? ` <span class="co-debug__err">(${escapeHtml(s.badgeError)})</span>` : ''}`,
      s.badgeSampleKeys.length
        ? `&nbsp;&nbsp;sample: <code>${escapeHtml(s.badgeSampleKeys.slice(0, 6).join(', '))}</code>`
        : '',
      `7TV emotes: <code>${s.sevenTvCount}</code>${s.sevenTvError ? ` <span class="co-debug__err">(${escapeHtml(s.sevenTvError)})</span>` : ''}`,
      `theme: <code>${escapeHtml(s.themeName || 'none')}</code>${s.customThemeApplied ? ' <span class="co-debug__ok">+ theme64</span>' : ''}`,
    ];

    if (s.warnings.length) {
      lines.push(`<details><summary>warnings (${s.warnings.length})</summary><pre>${escapeHtml(s.warnings.join('\n'))}</pre></details>`);
    }

    this.root.innerHTML = lines.filter(Boolean).join('<br>');
  }

  private injectStyles(): void {
    if (document.getElementById('co-debug-styles')) return;
    const style = document.createElement('style');
    style.id = 'co-debug-styles';
    style.textContent = `
      .co-debug {
        position: fixed;
        top: 6px;
        left: 6px;
        max-width: 420px;
        font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
        background: rgba(8, 12, 24, 0.78);
        color: #d8e3ff;
        border: 1px solid rgba(140, 170, 230, 0.35);
        border-radius: 6px;
        padding: 8px 10px;
        z-index: 9999;
        text-shadow: none;
        backdrop-filter: blur(4px);
        pointer-events: auto;
      }
      .co-debug code { color: #ffe89a; }
      .co-debug__err { color: #ff8a8a; }
      .co-debug__ok { color: #6ee7a8; }
      .co-debug__state--open { color: #6ee7a8; }
      .co-debug__state--connecting,
      .co-debug__state--idle { color: #ffd66e; }
      .co-debug__state--closed,
      .co-debug__state--error { color: #ff8a8a; }
      .co-debug details > summary { cursor: pointer; opacity: 0.85; }
      .co-debug pre { white-space: pre-wrap; max-height: 160px; overflow: auto; margin: 4px 0 0; font-size: 11px; }
    `;
    document.head.appendChild(style);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
