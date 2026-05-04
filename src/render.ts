import type { ChatMessage, OverlayConfig, SevenTvEmote } from './types';
import type { BadgeMap } from './badges';
import { getBadge } from './badges';

const TWITCH_EMOTE_URL = (id: string, animate: boolean) =>
  `https://static-cdn.jtvnw.net/emoticons/v2/${id}/${animate ? 'default' : 'static'}/dark/2.0`;

// Default fallback colors when a chatter has no Twitch color set.
const FALLBACK_COLORS = [
  '#FF4A80', '#FF7F50', '#FFD700', '#7FFF00', '#00FA9A',
  '#1E90FF', '#9370DB', '#FF69B4', '#00CED1', '#FF6347',
];

function fallbackColor(login: string): string {
  let h = 0;
  for (let i = 0; i < login.length; i++) h = (h * 31 + login.charCodeAt(i)) | 0;
  return FALLBACK_COLORS[Math.abs(h) % FALLBACK_COLORS.length];
}

interface RenderContext {
  config: OverlayConfig;
  badges: BadgeMap;
  sevenTv: Map<string, SevenTvEmote>;
}

/* -------------------------------------------------------------------------- */
/*  Message tokenization                                                       */
/* -------------------------------------------------------------------------- */

type Token =
  | { type: 'text'; value: string }
  | { type: 'twitchEmote'; id: string; name: string }
  | { type: 'sevenTv'; emote: SevenTvEmote };

function tokenizeMessage(msg: ChatMessage, sevenTv: Map<string, SevenTvEmote>): Token[] {
  // Twitch sends emote positions as code-point indices into the message text.
  // Use Array.from to split into an array of code points (handles astral chars).
  const codePoints = Array.from(msg.text);
  const sortedEmotes = [...msg.emotes].sort((a, b) => a.start - b.start);

  const tokens: Token[] = [];
  let cursor = 0;

  const flushText = (cpStart: number, cpEnd: number) => {
    if (cpEnd <= cpStart) return;
    const text = codePoints.slice(cpStart, cpEnd).join('');
    pushTextWithSevenTv(text, tokens, sevenTv);
  };

  for (const span of sortedEmotes) {
    flushText(cursor, span.start);
    const name = codePoints.slice(span.start, span.end + 1).join('');
    tokens.push({ type: 'twitchEmote', id: span.id, name });
    cursor = span.end + 1;
  }
  flushText(cursor, codePoints.length);

  return tokens;
}

function pushTextWithSevenTv(text: string, out: Token[], sevenTv: Map<string, SevenTvEmote>): void {
  if (!text) return;

  // Tokenize on whitespace, preserving the whitespace runs as text.
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      appendText(out, part);
      continue;
    }
    const emote = sevenTv.get(part);
    if (emote) {
      out.push({ type: 'sevenTv', emote });
    } else {
      appendText(out, part);
    }
  }
}

function appendText(out: Token[], text: string): void {
  const last = out[out.length - 1];
  if (last && last.type === 'text') last.value += text;
  else out.push({ type: 'text', value: text });
}

/* -------------------------------------------------------------------------- */
/*  DOM rendering                                                              */
/* -------------------------------------------------------------------------- */

const CHEER_PREFIXES = [
  'Cheer', 'BitBoss', 'ShowLove', 'Party', 'SeemsGood', 'Pride', 'Kappa',
  'FrankerZ', 'HeyGuys', 'DansGame', 'EleGiggle', 'TriHard', 'Kreygasm',
  'biblethump', 'corgo', 'uni', 'showlove', 'party', 'doodlecheer',
  'streamlabs', 'anon', 'muxy',
];

function cheerTier(amount: number): string {
  if (amount >= 10000) return '#ff1493';
  if (amount >= 5000) return '#1e90ff';
  if (amount >= 1000) return '#00bfa5';
  if (amount >= 100) return '#9b59ff';
  return '#a0a0a0';
}

function renderTextWithCheers(text: string, hasBits: boolean): (HTMLElement | Text)[] {
  if (!hasBits) return [document.createTextNode(text)];
  const cheerRegex = new RegExp(`\\b(${CHEER_PREFIXES.join('|')})(\\d+)\\b`, 'gi');
  const out: (HTMLElement | Text)[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = cheerRegex.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(document.createTextNode(text.slice(lastIdx, m.index)));
    const span = document.createElement('span');
    span.className = 'cheer';
    span.style.color = cheerTier(Number(m[2]));
    span.textContent = m[0];
    out.push(span);
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) out.push(document.createTextNode(text.slice(lastIdx)));
  return out;
}

function makeEmoteImg(src: string, alt: string, animate: boolean): HTMLImageElement {
  const img = document.createElement('img');
  img.className = 'emote';
  img.alt = alt;
  img.title = alt;
  img.src = src;
  img.loading = 'eager';
  img.decoding = 'async';
  if (!animate) {
    // Static fallback for image formats that always animate (animated webp/avif):
    // we cannot pause them in pure HTML, so this is informational only.
    img.dataset.static = 'true';
  }
  return img;
}

export function renderMessage(msg: ChatMessage, ctx: RenderContext): HTMLElement {
  const { config, badges, sevenTv } = ctx;

  const root = document.createElement('div');
  root.className = 'msg';
  root.dataset.msgId = msg.id;
  root.dataset.userId = msg.userId;
  if (msg.isAction) root.classList.add('action');

  // Reply context line
  if (config.showReplies && msg.replyParentDisplayName && msg.replyParentMsgBody) {
    const reply = document.createElement('span');
    reply.className = 'reply';
    reply.textContent = `@${msg.replyParentDisplayName}: ${msg.replyParentMsgBody}`;
    root.appendChild(reply);
  }

  // Badges
  if (config.showBadges && msg.badges.length) {
    const wrap = document.createElement('span');
    wrap.className = 'badges';
    for (const b of msg.badges) {
      const info = getBadge(badges, b.setId, b.version);
      if (!info) continue;
      const img = document.createElement('img');
      img.className = 'badge';
      img.src = info.imageUrl;
      img.alt = info.title;
      img.title = info.title;
      wrap.appendChild(img);
    }
    if (wrap.childNodes.length) root.appendChild(wrap);
  }

  // Username
  const user = document.createElement('span');
  user.className = 'username';
  user.textContent = msg.displayName;
  user.style.color = msg.color || fallbackColor(msg.login);
  root.appendChild(user);

  if (!msg.isAction) {
    const colon = document.createElement('span');
    colon.className = 'colon';
    colon.textContent = ': ';
    root.appendChild(colon);
  } else {
    root.appendChild(document.createTextNode(' '));
  }

  // Message body
  const body = document.createElement('span');
  body.className = 'msg-text';
  if (msg.isAction && msg.color) body.style.color = msg.color;

  const tokens = tokenizeMessage(msg, sevenTv);
  const hasBits = config.showBits && msg.bits > 0;

  let lastEmoteEl: HTMLImageElement | HTMLElement | null = null;
  for (const t of tokens) {
    if (t.type === 'text') {
      lastEmoteEl = null;
      for (const node of renderTextWithCheers(t.value, hasBits)) body.appendChild(node);
    } else if (t.type === 'twitchEmote') {
      const img = makeEmoteImg(TWITCH_EMOTE_URL(t.id, config.animateEmotes), t.name, config.animateEmotes);
      body.appendChild(img);
      lastEmoteEl = img;
    } else {
      const img = makeEmoteImg(t.emote.url, t.emote.name, config.animateEmotes);
      if (t.emote.zeroWidth && lastEmoteEl) {
        // Stack zero-width emote on top of the preceding emote.
        let stack: HTMLElement;
        if (lastEmoteEl.parentElement?.classList.contains('zw-stack')) {
          stack = lastEmoteEl.parentElement;
        } else {
          stack = document.createElement('span');
          stack.className = 'zw-stack';
          body.replaceChild(stack, lastEmoteEl);
          stack.appendChild(lastEmoteEl);
        }
        stack.appendChild(img);
        // lastEmoteEl stays the base emote for further stacking.
      } else {
        body.appendChild(img);
        lastEmoteEl = img;
      }
    }
  }

  root.appendChild(body);

  // Bits indicator
  if (hasBits) {
    const bitsTag = document.createElement('span');
    bitsTag.className = 'cheer';
    bitsTag.style.color = cheerTier(msg.bits);
    bitsTag.textContent = `  ✦ ${msg.bits} bits`;
    root.appendChild(bitsTag);
  }

  return root;
}
