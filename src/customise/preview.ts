import { applyCustomTheme, type CustomTheme } from './theme';
import baseCss from '../styles/base.css?raw';

interface SampleMessage {
  user: string;
  color: string;
  badges: string[];
  text: string;
  reply?: { user: string; body: string };
  bits?: number;
  isAction?: boolean;
}

const SAMPLE_MESSAGES: SampleMessage[] = [
  { user: 'StreamerHost', color: '#ff5e7a', badges: ['broadcaster', 'partner'], text: 'GG everyone, welcome in! 👋' },
  { user: 'mod_kira', color: '#52c878', badges: ['moderator', 'subscriber'], text: 'Reminder: please keep chat respectful.' },
  { user: 'VIPFan', color: '#cf46ff', badges: ['vip', 'subscriber'], text: 'PogChamp the new emote looks fire' },
  { user: 'sub_tier3', color: '#1e90ff', badges: ['subscriber'], text: 'just resubbed for 12 months :)', reply: { user: 'StreamerHost', body: 'thanks for being here!' } },
  { user: 'cheermaster', color: '#f4b400', badges: ['bits'], text: 'Cheer500 incredible play', bits: 500 },
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

export function renderPreview(frame: HTMLIFrameElement, theme: CustomTheme, presetTheme: string): void {
  const html = buildPreviewDocument(presetTheme);
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  const blob = new Blob([html], { type: 'text/html' });
  currentObjectUrl = URL.createObjectURL(blob);
  frame.src = currentObjectUrl;
  frame.addEventListener('load', () => applyToFrame(frame, theme), { once: true });
}

function applyToFrame(frame: HTMLIFrameElement, theme: CustomTheme): void {
  const doc = frame.contentDocument;
  if (!doc) return;
  applyCustomTheme(theme, doc);
  renderSampleMessages(doc, theme);
}

function renderSampleMessages(doc: Document, theme: CustomTheme): void {
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
      for (const setId of sample.badges) {
        const pill = doc.createElement('span');
        pill.className = 'badge-fallback';
        pill.style.background = BADGE_COLORS[setId] ?? 'rgba(255,255,255,0.2)';
        pill.style.borderColor = 'rgba(255,255,255,0.35)';
        pill.textContent = setId.replace(/_/g, ' ');
        wrap.appendChild(pill);
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
      body.innerHTML = sample.text.replace(/Cheer(\d+)/i, (_, n) => `<span class="cheer">Cheer${n}</span>`);
    } else {
      body.textContent = sample.text;
    }
    msg.appendChild(body);

    root.appendChild(msg);
  }
}

function buildPreviewDocument(presetTheme: string): string {
  const safe = presetTheme.replace(/[^a-z0-9_-]/gi, '');
  const base = `${window.location.origin}${import.meta.env.BASE_URL ?? '/'}`;
  const themeLink = safe && safe !== 'none'
    ? `<link rel="stylesheet" href="${escapeAttribute(`${base}themes/${safe}.css`)}" />`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
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
