import { applyCustomTheme, type CustomTheme } from './theme';
import baseCss from '../styles/base.css?raw';
import { loadBadges, type BadgeMap } from '../services/twitch/badges';
import { resolveTwitchUserId } from '../services/twitch/user';
import { loadSevenTvEmotes } from '../services/emotes/sevenTv';
import { renderMessage } from '../ui/renderMessage';
import { collectFontImports } from './presets/fonts';
import type { ChatMessage, OverlayConfig, SevenTvEmote, TwitchEmoteSpan } from '../types';

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

  const [badges, sevenTv] = await Promise.all([
    loadPreviewBadges(channel, baseUrl),
    loadSevenTvEmotes(null, true),
  ]);
  if (nonce !== renderNonce || frame.contentDocument !== doc) return;

  renderSampleMessages(doc, theme, badges, sevenTv);
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

function renderSampleMessages(doc: Document, theme: CustomTheme, badges: BadgeMap, sevenTv: Map<string, SevenTvEmote>): void {
  const root = doc.getElementById('chat');
  if (!root) return;
  root.replaceChildren();

  const config = buildPreviewConfig(theme);
  const samples = buildSampleMessages(sevenTv);

  for (const sample of samples) {
    if (sample.bits && theme.show?.bits === false) continue;
    root.appendChild(renderMessage(sample, { config, badges, sevenTv, doc }));
  }
}

function buildPreviewConfig(theme: CustomTheme): OverlayConfig {
  return {
    channel: 'preview',
    theme: 'none',
    twitchApiBase: '',
    theme64: '',
    debug: false,
    fadeOutSeconds: 0,
    maxMessages: 12,
    showBadges: theme.show?.badges ?? true,
    showReplies: theme.show?.replies ?? true,
    showBits: theme.show?.bits ?? true,
    showDeleted: false,
    showStatus: theme.show?.status ?? false,
    ignoredUsers: [],
    ignoreCommands: false,
    animateEmotes: true,
  };
}

function buildSampleMessages(sevenTv: Map<string, SevenTvEmote>): ChatMessage[] {
  const sevenTvNames = pickSevenTvPreviewNames(sevenTv);
  const [sevenA, sevenB] = sevenTvNames;

  return [
    makeSampleMessage({
      id: 'preview-1',
      login: 'streamerhost',
      displayName: 'StreamerHost',
      color: '#ff5e7a',
      badges: [{ setId: 'broadcaster', version: '1' }, { setId: 'partner', version: '1' }],
      text: 'GG everyone Kappa Keepo welcome in!',
      emotes: buildTwitchEmotes('GG everyone Kappa Keepo welcome in!', [
        { name: 'Kappa', id: '25' },
        { name: 'Keepo', id: '1902' },
      ]),
    }),
    makeSampleMessage({
      id: 'preview-2',
      login: 'mod_kira',
      displayName: 'mod_kira',
      color: '#52c878',
      badges: [{ setId: 'moderator', version: '1' }, { setId: 'subscriber', version: '1' }],
      text: sevenA && sevenB
        ? `Global 7TV picks for this preview: ${sevenA} ${sevenB}`
        : 'Global 7TV emotes will appear here when the 7TV API responds.',
    }),
    makeSampleMessage({
      id: 'preview-3',
      login: 'vipfan',
      displayName: 'VIPFan',
      color: '#cf46ff',
      badges: [{ setId: 'vip', version: '1' }, { setId: 'subscriber', version: '1' }],
      text: sevenA
        ? `That combo of Kappa with ${sevenA} is dangerously spammy.`
        : 'That combo of Kappa with a 7TV global is dangerously spammy.',
      emotes: buildTwitchEmotes(
        sevenA ? `That combo of Kappa with ${sevenA} is dangerously spammy.` : 'That combo of Kappa with a 7TV global is dangerously spammy.',
        [{ name: 'Kappa', id: '25' }],
      ),
    }),
    makeSampleMessage({
      id: 'preview-4',
      login: 'sub_tier3',
      displayName: 'sub_tier3',
      color: '#1e90ff',
      badges: [{ setId: 'subscriber', version: '1' }],
      text: 'just resubbed for 12 months :)',
      replyParentDisplayName: 'StreamerHost',
      replyParentMsgBody: 'thanks for being here!',
    }),
    makeSampleMessage({
      id: 'preview-5',
      login: 'cheermaster',
      displayName: 'cheermaster',
      color: '#f4b400',
      badges: [{ setId: 'bits', version: '100' }],
      text: 'Cheer500 incredible play',
      bits: 500,
    }),
    makeSampleMessage({
      id: 'preview-6',
      login: 'casual_viewer',
      displayName: 'casual_viewer',
      color: '#a0a0a0',
      badges: [],
      text: sevenB ? `first time here ${sevenB} really enjoying the stream` : 'first time here really enjoying the stream',
      isAction: true,
    }),
  ];
}

function pickSevenTvPreviewNames(sevenTv: Map<string, SevenTvEmote>): [string, string] {
  const candidates = [...sevenTv.values()]
    .filter((emote) => !emote.zeroWidth && /^\S+$/.test(emote.name))
    .slice(0, 2)
    .map((emote) => emote.name);
  return [candidates[0] ?? '', candidates[1] ?? ''];
}

function buildTwitchEmotes(text: string, defs: Array<{ name: string; id: string }>): TwitchEmoteSpan[] {
  const codePoints = Array.from(text);
  const spans: TwitchEmoteSpan[] = [];

  for (const def of defs) {
    const token = Array.from(def.name);
    const start = findCodePointToken(codePoints, token);
    if (start < 0) continue;
    spans.push({ id: def.id, start, end: start + token.length - 1 });
  }

  return spans.sort((a, b) => a.start - b.start);
}

function findCodePointToken(haystack: string[], needle: string[]): number {
  outer: for (let index = 0; index <= haystack.length - needle.length; index++) {
    for (let offset = 0; offset < needle.length; offset++) {
      if (haystack[index + offset] !== needle[offset]) continue outer;
    }
    return index;
  }
  return -1;
}

function makeSampleMessage(partial: Partial<ChatMessage> & Pick<ChatMessage, 'id' | 'login' | 'displayName' | 'color' | 'text'>): ChatMessage {
  return {
    id: partial.id,
    userId: partial.login,
    login: partial.login,
    displayName: partial.displayName,
    color: partial.color,
    badges: partial.badges ?? [],
    text: partial.text,
    emotes: partial.emotes ?? [],
    isAction: partial.isAction ?? false,
    bits: partial.bits ?? 0,
    replyParentDisplayName: partial.replyParentDisplayName,
    replyParentMsgBody: partial.replyParentMsgBody,
    tmiSentTs: Date.now(),
  };
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
