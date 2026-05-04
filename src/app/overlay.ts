import { renderMessage } from '../ui/renderMessage';
import type { BadgeMap } from '../services/twitch/badges';
import type { IrcMessage } from '../services/twitch/irc';
import type { ChatMessage, OverlayConfig, SevenTvEmote } from '../types';
import { ircToChatMessage, shouldIgnoreMessage } from './chatMessage';

function cssEscape(value: string): string {
  return value.replace(/["\\]/g, '\\$&');
}

export class Overlay {
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
    if (config.showStatus) document.body.appendChild(this.status);
  }

  setStatus(text: string, kind: 'ok' | 'err' | 'neutral' = 'neutral'): void {
    if (!this.config.showStatus) return;
    this.status.textContent = text;
    this.status.classList.remove('ok', 'err');
    if (kind === 'ok') this.status.classList.add('ok');
    if (kind === 'err') this.status.classList.add('err');
  }

  setBadges(map: BadgeMap): void {
    this.badges = map;
  }

  setSevenTv(map: Map<string, SevenTvEmote>): void {
    this.sevenTv = map;
  }

  handleIrc(irc: IrcMessage): void {
    switch (irc.command) {
      case 'PRIVMSG': {
        const msg = ircToChatMessage(irc);
        if (msg && !shouldIgnoreMessage(msg, this.config)) this.appendMessage(msg);
        break;
      }
      case 'CLEARMSG': {
        const targetId = irc.tags['target-msg-id'];
        if (targetId) this.deleteOrStrike(`[data-msg-id="${cssEscape(targetId)}"]`);
        break;
      }
      case 'CLEARCHAT': {
        if (irc.trailing) {
          this.deleteOrStrikeAll(`[data-user-id="${cssEscape(irc.tags['target-user-id'] ?? '')}"]`);
        } else {
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

    while (this.root.children.length > this.config.maxMessages) {
      const first = this.root.firstElementChild as HTMLElement | null;
      if (!first) break;
      this.root.removeChild(first);
    }

    if (this.config.fadeOutSeconds > 0) {
      const handle = window.setTimeout(() => {
        el.classList.add('fade-out');
        const removeAfter = window.setTimeout(() => el.remove(), 800);
        this.fadeTimers.set(el, removeAfter);
      }, this.config.fadeOutSeconds * 1000);
      // Track the fade-start timer so the message can be cleaned up if needed.
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