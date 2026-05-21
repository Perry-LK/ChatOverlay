import type { AlertEvent, AlertsConfig } from './types';

const TYPE_ICON: Record<AlertEvent['type'], string> = {
  sub: '★',
  resub: '★',
  subgift: '🎁',
  submysterygift: '🎁',
  giftpaidupgrade: '↑',
  raid: '⚔',
  announcement: '📣',
  cheer: '✦',
  bitsbadgetier: '✦',
};

const TYPE_LABEL: Record<AlertEvent['type'], string> = {
  sub: 'New sub',
  resub: 'Resub',
  subgift: 'Gift sub',
  submysterygift: 'Sub bomb',
  giftpaidupgrade: 'Continued sub',
  raid: 'Raid',
  announcement: 'Announcement',
  cheer: 'Cheer',
  bitsbadgetier: 'Bits badge',
};

export class AlertQueue {
  private root: HTMLElement;
  private config: AlertsConfig;
  private queue: AlertEvent[] = [];
  private active: { el: HTMLElement; timer: number } | null = null;
  private seen = new Set<string>();

  constructor(root: HTMLElement, config: AlertsConfig) {
    this.root = root;
    this.config = config;
  }

  push(event: AlertEvent): void {
    if (!this.config.enabled[event.type]) return;
    if (this.seen.has(event.id)) return;
    this.seen.add(event.id);
    // Bound the seen-set so it cannot grow without limit.
    if (this.seen.size > 500) {
      const trimmed = Array.from(this.seen).slice(-250);
      this.seen = new Set(trimmed);
    }

    this.queue.push(event);
    // Drop oldest pending alerts when the queue exceeds maxQueue.
    while (this.queue.length > this.config.maxQueue) this.queue.shift();
    if (!this.active) this.showNext();
  }

  private showNext(): void {
    const next = this.queue.shift();
    if (!next) {
      this.active = null;
      return;
    }
    const el = this.renderAlert(next);
    this.root.appendChild(el);
    // Force reflow then add the visible class to trigger the enter animation.
    void el.offsetWidth;
    el.classList.add('is-visible');

    const totalMs = this.config.durationSeconds * 1000;
    const timer = window.setTimeout(() => this.dismissActive(), totalMs);
    this.active = { el, timer };
  }

  private dismissActive(): void {
    if (!this.active) return;
    const { el, timer } = this.active;
    window.clearTimeout(timer);
    el.classList.remove('is-visible');
    el.classList.add('is-leaving');
    window.setTimeout(() => {
      el.remove();
      this.showNext();
    }, 600);
    this.active = null;
  }

  private renderAlert(event: AlertEvent): HTMLElement {
    const card = document.createElement('article');
    card.className = `alert alert--${event.type}`;
    if (event.color) card.dataset.color = event.color.toLowerCase();

    const icon = document.createElement('div');
    icon.className = 'alert__icon';
    icon.textContent = TYPE_ICON[event.type];

    const body = document.createElement('div');
    body.className = 'alert__body';

    const label = document.createElement('div');
    label.className = 'alert__label';
    label.textContent = TYPE_LABEL[event.type];

    const headline = document.createElement('div');
    headline.className = 'alert__headline';
    headline.textContent = event.headline;

    body.append(label, headline);

    if (event.detail) {
      const detail = document.createElement('div');
      detail.className = 'alert__detail';
      detail.textContent = event.detail;
      body.append(detail);
    }
    if (event.message) {
      const message = document.createElement('div');
      message.className = 'alert__message';
      message.textContent = event.message;
      body.append(message);
    }

    card.append(icon, body);
    return card;
  }
}
