import type { IrcMessage } from '../services/twitch/irc';
import type { ChatMessage, OverlayConfig, TwitchEmoteSpan } from '../types';

function parseEmotes(tag: string | undefined): TwitchEmoteSpan[] {
  if (!tag) return [];
  const out: TwitchEmoteSpan[] = [];
  for (const part of tag.split('/')) {
    if (!part) continue;
    const [id, positions] = part.split(':');
    if (!id || !positions) continue;
    for (const range of positions.split(',')) {
      const [start, end] = range.split('-').map(Number);
      if (Number.isFinite(start) && Number.isFinite(end)) out.push({ id, start, end });
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
  if (text.startsWith('\u0001ACTION ') && text.endsWith('\u0001')) {
    return { isAction: true, text: text.slice(8, -1) };
  }
  return { isAction: false, text };
}

export function ircToChatMessage(irc: IrcMessage): ChatMessage | null {
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

export function shouldIgnoreMessage(msg: ChatMessage, config: OverlayConfig): boolean {
  if (config.ignoredUsers.includes(msg.login)) return true;
  if (config.ignoreCommands && msg.text.trimStart().startsWith('!')) return true;
  return false;
}