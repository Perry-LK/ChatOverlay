import { applyCustomTheme, type CustomTheme } from './theme';
import baseCss from '../styles/base.css?raw';
import { getBadge, loadBadges, type BadgeMap } from '../services/twitch/badges';
import { resolveTwitchUserId } from '../services/twitch/user';
import { collectFontImports } from './presets/fonts';

interface SampleMessage {
  user: string;
  color: string;
  badges: Array<{ setId: string; version: string }>;
  text: string;
  reply?: { user: string; body: string };
  bits?: number;
  isAction?: boolean;
}

const SAMPLE_MESSAGES: SampleMessage[] = [
  { user: 'StreamerHost', color: '#ff5e7a', badges: [{ setId: 'broadcaster', version: '1' }, { setId: 'partner', version: '1' }], text: 'GG everyone, welcome in! 👋' },
  { user: 'mod_kira', color: '#52c878', badges: [{ setId: 'moderator', version: '1' }, { setId: 'subscriber', version: '1' }], text: 'Reminder: please keep chat respectful.' },
  { user: 'VIPFan', color: '#cf46ff', badges: [{ setId: 'vip', version: '1' }, { setId: 'subscriber', version: '1' }], text: 'PogChamp the new emote looks fire' },
  { user: 'sub_tier3', color: '#1e90ff', badges: [{ setId: 'subscriber', version: '1' }], text: 'just resubbed for 12 months :)', reply: { user: 'StreamerHost', body: 'thanks for being here!' } },
  { user: 'cheermaster', color: '#f4b400', badges: [{ setId: 'bits', version: '100' }], text: 'Cheer500 incredible play', bits: 500 },
  { user: 'casual_viewer', color: '#a0a0a0', badges: [], text: 'first time here — really enjoying the stream', isAction: true },
];

const BADGE_COLORS: Record<string, string> = {
  broadcaster: '#e12653',
  moderator: '#34a048',
  vip: '#cf46ff',
  subscriber: '#2c76ff',
  partner: '#9147ff',
  bits: '#f4b400',
};

let currentObjectUrl: string | null = null;
let renderNonce = 0;

export function renderPreview(
  frame: HTMLIFrameElement,
  theme: CustomTheme,
  presetTheme: string,
  channel: string,
  baseUrl: string,
): void {
  const nonce = ++renderNonce;
  const html = buildPreviewDocument(presetTheme, theme);
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  const blob = new Blob([html], { type: 'text/html' });
  currentObjectUrl = URL.createObjectURL(blob);
  frame.src = currentObjectUrl;
  frame.addEventListener('load', () => {
    void applyToFrame(frame, theme, channel, baseUrl, nonce);
  }, { once: true });
}

async function applyToFrame(
  frame: HTMLIFrameElement,
  theme: CustomTheme,
  channel: string,
  baseUrl: string,
  nonce: number,
): Promise<void> {
  const doc = frame.contentDocument;
  if (!doc) return;
  applyCustomTheme(theme, doc);

  const badges = await loadPreviewBadges(channel, baseUrl);
  if (nonce !== renderNonce || frame.contentDocument !== doc) return;

  renderSampleMessages(doc, theme, badges);
}

async function loadPreviewBadges(channel: string, baseUrl: string): Promise<BadgeMap> {
  const twitchApiBase = readTwitchApiBase(baseUrl);
  const userId = channel.trim() ? await resolveTwitchUserId(channel, twitchApiBase) : null;
  const result = await loadBadges(userId, twitchApiBase);
  return result.map;
}

function readTwitchApiBase(baseUrl: string): string {
  try {
    const url = new URL(baseUrl || '/', window.location.href);
    return url.searchParams.get('twitchApiBase')?.trim().replace(/\/+$/, '') ?? '';
  } catch {
    return '';
  }
}

function renderSampleMessages(doc: Document, theme: CustomTheme, badges: BadgeMap): void {
  const root = doc.getElementById('chat');
  if (!root) return;
  root.replaceChildren();

  for (const sample of SAMPLE_MESSAGES) {
    if (sample.bits && theme.show?.bits === false) continue;

    const msg = doc.createElement('div');
    msg.className = 'msg' + (sample.isAction ? ' action' : '');

    if (sample.reply && theme.show?.replies !== false) {
      const reply = doc.createElement('span');
      reply.className = 'reply';
      reply.textContent = `@${sample.reply.user}: ${sample.reply.body}`;
      msg.appendChild(reply);
    }

    if (sample.badges.length && theme.show?.badges !== false) {
      const wrap = doc.createElement('span');
      wrap.className = 'badges';
      for (const badge of sample.badges) {
        const info = getBadge(badges, badge.setId, badge.version);
        if (info) {
          const img = doc.createElement('img');
          img.className = 'badge';
          img.src = info.imageUrl;
          img.alt = info.title;
          img.title = info.title;
          img.addEventListener('error', () => {
            img.replaceWith(makeBadgeFallback(doc, badge.setId));
          }, { once: true });
          wrap.appendChild(img);
          continue;
        }

        wrap.appendChild(makeBadgeFallback(doc, badge.setId));
      }
      msg.appendChild(wrap);
    }

    const user = doc.createElement('span');
    user.className = 'username';
    user.style.color = sample.color;
    user.textContent = sample.user;
    msg.appendChild(user);

    if (!sample.isAction) {
      const colon = doc.createElement('span');
      colon.className = 'colon';
      colon.textContent = ': ';
      msg.appendChild(colon);
    } else {
      msg.appendChild(doc.createTextNode(' '));
    }

    const body = doc.createElement('span');
    body.className = 'msg-text';
    if (sample.bits && theme.show?.bits !== false) {
      const match = sample.text.match(/Cheer(\d+)/i);
      if (match) {
        const start = match.index ?? 0;
        if (start > 0) body.appendChild(doc.createTextNode(sample.text.slice(0, start)));
        const cheer = doc.createElement('span');
        cheer.className = 'cheer';
        cheer.style.color = BADGE_COLORS.bits;
        cheer.textContent = match[0];
        body.appendChild(cheer);
        const rest = sample.text.slice(start + match[0].length);
        if (rest) body.appendChild(doc.createTextNode(rest));
      } else {
        body.textContent = sample.text;
      }
    } else {
      body.textContent = sample.text;
    }
    msg.appendChild(body);

    root.appendChild(msg);
  }
}

function makeBadgeFallback(doc: Document, setId: string): HTMLSpanElement {
  const pill = doc.createElement('span');
  pill.className = `badge-fallback badge-fallback--${setId.replace(/[^a-z0-9_-]/gi, '').toLowerCase()}`;
  pill.style.background = BADGE_COLORS[setId] ?? 'rgba(255,255,255,0.2)';
  pill.style.borderColor = 'rgba(255,255,255,0.35)';
  pill.textContent = setId.replace(/_/g, ' ');
  return pill;
}

function buildPreviewDocument(presetTheme: string, theme: CustomTheme): string {
  const safe = presetTheme.replace(/[^a-z0-9_-]/gi, '');
  const base = `${window.location.origin}${import.meta.env.BASE_URL ?? '/'}`;
  const themeLink = safe && safe !== 'none'
    ? `<link rel="stylesheet" href="${escapeAttribute(`${base}themes/${safe}.css`)}" />`
    : '';
  const fontImports = collectFontImports(theme.vars ?? {});

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${fontImports ? `<style>${fontImports}</style>` : ''}
  <style>${baseCss}</style>
  ${themeLink}
  <style>
    html, body { background: transparent; }
    body { padding: 0; }
    .badge-fallback { display: inline-flex; align-items: center; padding: 0 0.5em; min-height: 1.3em;
      border-radius: 999px; font-size: 0.62em; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; border: 1px solid rgba(255,255,255,0.35); color: #fff; vertical-align: middle; }
  </style>
</head>
<body>
  <div id="chat" class="chat" aria-live="polite"></div>
</body>
</html>`;
}

function escapeAttribute(value: string): string {
  return value.replace(/"/g, '&quot;');
}
