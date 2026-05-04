import { loadConfig } from './config';
import { TwitchIrc, type IrcMessage } from './twitchIrc';
import { resolveTwitchUserId } from './twitchUser';
import { loadSevenTvEmotes } from './sevenTv';
import { loadBadges } from './badges';
import { renderMessage } from './render';
import type { ChatMessage, OverlayConfig, TwitchEmoteSpan } from './types';
import type { BadgeMap } from './badges';
import type { SevenTvEmote } from './types';

/* -------------------------------------------------------------------------- */
/*  IRC tag → ChatMessage                                                      */
/* -------------------------------------------------------------------------- */

function parseEmotes(tag: string | undefined): TwitchEmoteSpan[] {
  if (!tag) return [];
  const out: TwitchEmoteSpan[] = [];
  for (const part of tag.split('/')) {
    if (!part) continue;
    const [id, positions] = part.split(':');
    if (!id || !positions) continue;
    for (const range of positions.split(',')) {
      const [s, e] = range.split('-').map(Number);
      if (Number.isFinite(s) && Number.isFinite(e)) out.push({ id, start: s, end: e });
    }
  }
  return out;
}

function parseBadges(tag: string | undefined): { setId: string; version: string }[] {
  if (!tag) return [];
  return tag.split(',').filter(Boolean).map((seg) => {
    const [setId, version] = seg.split('/');
    return { setId, version: version ?? '1' };
  });
}

function unwrapAction(text: string): { isAction: boolean; text: string } {
  // /me messages are wrapped: \x01ACTION ...\x01
  if (text.startsWith('\u0001ACTION ') && text.endsWith('\u0001')) {
    return { isAction: true, text: text.slice(8, -1) };
  }
  return { isAction: false, text };
}

function ircToChatMessage(irc: IrcMessage): ChatMessage | null {
  if (irc.command !== 'PRIVMSG') return null;
  const tags = irc.tags;
  const login = irc.prefix.split('!')[0]?.toLowerCase() ?? '';
  const { isAction, text } = unwrapAction(irc.trailing);

  return {
    id: tags['id'] ?? crypto.randomUUID(),
    userId: tags['user-id'] ?? '',
    login,
    displayName: tags['display-name'] || login,
    color: tags['color'] ?? '',
    badges: parseBadges(tags['badges']),
    text,
    emotes: parseEmotes(tags['emotes']),
    isAction,
    bits: Number(tags['bits'] ?? 0) || 0,
    replyParentDisplayName: tags['reply-parent-display-name'] || undefined,
    replyParentMsgBody: tags['reply-parent-msg-body'] || undefined,
    tmiSentTs: Number(tags['tmi-sent-ts'] ?? Date.now()) || Date.now(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Filtering                                                                  */
/* -------------------------------------------------------------------------- */

function shouldIgnore(msg: ChatMessage, config: OverlayConfig): boolean {
  if (config.ignoredUsers.includes(msg.login)) return true;
  if (config.ignoreCommands && msg.text.trimStart().startsWith('!')) return true;
  return false;
}

/* -------------------------------------------------------------------------- */
/*  Overlay controller                                                         */
/* -------------------------------------------------------------------------- */

class Overlay {
  private root: HTMLElement;
  private status: HTMLElement;
  private config: OverlayConfig;
  private badges: BadgeMap = new Map();
  private sevenTv: Map<string, SevenTvEmote> = new Map();
  private fadeTimers = new WeakMap<HTMLElement, number>();

  constructor(root: HTMLElement, config: OverlayConfig) {
    this.root = root;
    this.config = config;

    this.status = document.createElement('div');
    this.status.className = 'status';
    this.status.textContent = `connecting to #${config.channel}…`;
    document.body.appendChild(this.status);
  }

  setStatus(text: string, kind: 'ok' | 'err' | 'neutral' = 'neutral'): void {
    this.status.textContent = text;
    this.status.classList.remove('ok', 'err');
    if (kind === 'ok') this.status.classList.add('ok');
    if (kind === 'err') this.status.classList.add('err');
  }

  setBadges(map: BadgeMap): void { this.badges = map; }
  setSevenTv(map: Map<string, SevenTvEmote>): void { this.sevenTv = map; }

  handleIrc(irc: IrcMessage): void {
    switch (irc.command) {
      case 'PRIVMSG': {
        const msg = ircToChatMessage(irc);
        if (msg && !shouldIgnore(msg, this.config)) this.appendMessage(msg);
        break;
      }
      case 'CLEARMSG': {
        const targetId = irc.tags['target-msg-id'];
        if (targetId) this.deleteOrStrike(`[data-msg-id="${cssEscape(targetId)}"]`);
        break;
      }
      case 'CLEARCHAT': {
        const targetUser = irc.trailing;
        if (targetUser) {
          this.deleteOrStrikeAll(`[data-user-id="${cssEscape(irc.tags['target-user-id'] ?? '')}"]`);
        } else {
          // Full chat clear
          this.root.replaceChildren();
        }
        break;
      }
      default:
        break;
    }
  }

  private appendMessage(msg: ChatMessage): void {
    const el = renderMessage(msg, {
      config: this.config,
      badges: this.badges,
      sevenTv: this.sevenTv,
    });
    this.root.appendChild(el);

    // Trim to maxMessages
    while (this.root.children.length > this.config.maxMessages) {
      const first = this.root.firstElementChild as HTMLElement | null;
      if (!first) break;
      this.root.removeChild(first);
    }

    // Fade-out timer
    if (this.config.fadeOutSeconds > 0) {
      const handle = window.setTimeout(() => {
        el.classList.add('fade-out');
        const removeAfter = window.setTimeout(() => el.remove(), 800);
        this.fadeTimers.set(el, removeAfter);
      }, this.config.fadeOutSeconds * 1000);
      this.fadeTimers.set(el, handle);
    }
  }

  private deleteOrStrike(selector: string): void {
    const el = this.root.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    if (this.config.showDeleted) el.classList.add('deleted');
    else el.remove();
  }

  private deleteOrStrikeAll(selector: string): void {
    for (const el of Array.from(this.root.querySelectorAll(selector)) as HTMLElement[]) {
      if (this.config.showDeleted) el.classList.add('deleted');
      else el.remove();
    }
  }
}

function cssEscape(s: string): string {
  // Minimal CSS attribute-value escape; user IDs and msg IDs are simple anyway.
  return s.replace(/["\\]/g, '\\$&');
}

/* -------------------------------------------------------------------------- */
/*  Bootstrap                                                                  */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const root = document.getElementById('chat');
  if (!root) throw new Error('#chat element not found');

  const config = await loadConfig();

  const overlay = new Overlay(root, config);

  // Resolve user ID, then fetch badges + 7TV emotes in parallel.
  const userId = await resolveTwitchUserId(config.channel);
  const [badges, sevenTv] = await Promise.all([
    loadBadges(userId),
    loadSevenTvEmotes(userId, config.animateEmotes),
  ]);
  overlay.setBadges(badges);
  overlay.setSevenTv(sevenTv);

  // Connect to Twitch IRC.
  const irc = new TwitchIrc(config.channel);
  irc.onStatus((s) => {
    if (s === 'open') overlay.setStatus(`connected to #${config.channel}`, 'ok');
    else if (s === 'closed' || s === 'error') overlay.setStatus(`disconnected (#${config.channel})`, 'err');
    else overlay.setStatus(`connecting to #${config.channel}…`);
  });
  irc.on((msg) => overlay.handleIrc(msg));
  irc.connect();

  // Periodically refresh 7TV channel emotes (e.g. every 10 minutes) so adds/removals appear without reload.
  setInterval(async () => {
    const refreshed = await loadSevenTvEmotes(userId, config.animateEmotes);
    overlay.setSevenTv(refreshed);
  }, 10 * 60 * 1000);
}

main().catch((err) => {
  console.error('Chat overlay failed to start:', err);
});
