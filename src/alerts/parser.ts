import type { IrcMessage } from '../services/twitch/irc';
import type { AlertEvent, AlertType } from './types';

const TIER_NAMES: Record<string, string> = {
  '1000': 'Tier 1',
  '2000': 'Tier 2',
  '3000': 'Tier 3',
  'Prime': 'Prime',
  'prime': 'Prime',
};

function tierLabel(planId: string | undefined): string {
  if (!planId) return 'Tier 1';
  return TIER_NAMES[planId] ?? planId;
}

function userIdFor(irc: IrcMessage): string {
  return irc.tags['user-id'] ?? irc.tags['msg-param-sender-id'] ?? Math.random().toString(36).slice(2);
}

function displayNameOf(irc: IrcMessage): { login: string; displayName: string } {
  const login = (irc.tags['login'] ?? irc.prefix.split('!')[0] ?? '').toLowerCase();
  const displayName = irc.tags['display-name'] || login;
  return { login, displayName };
}

/**
 * Maps a Twitch USERNOTICE IRC message to an AlertEvent. Returns null if the
 * message is not a notice type we surface as an alert.
 */
export function userNoticeToAlert(irc: IrcMessage): AlertEvent | null {
  if (irc.command !== 'USERNOTICE') return null;
  const msgId = irc.tags['msg-id'] as AlertType | undefined;
  if (!msgId) return null;

  const { login, displayName } = displayNameOf(irc);
  const ts = Number(irc.tags['tmi-sent-ts']) || Date.now();
  const id = `${irc.tags['id'] ?? userIdFor(irc)}-${ts}`;
  const userMessage = irc.trailing || undefined;

  switch (msgId) {
    case 'sub': {
      const tier = tierLabel(irc.tags['msg-param-sub-plan']);
      return {
        id, type: 'sub', login, displayName, ts, tier,
        headline: `${displayName} subscribed!`,
        detail: `New ${tier} subscriber`,
      };
    }
    case 'resub': {
      const tier = tierLabel(irc.tags['msg-param-sub-plan']);
      const months = Number(irc.tags['msg-param-cumulative-months']) || 0;
      const streak = Number(irc.tags['msg-param-streak-months']) || 0;
      const detailBits = [`${tier}`];
      if (months > 0) detailBits.push(`${months} month${months === 1 ? '' : 's'}`);
      if (streak > 1) detailBits.push(`${streak}-month streak`);
      return {
        id, type: 'resub', login, displayName, ts, tier,
        amount: months,
        headline: `${displayName} resubscribed!`,
        detail: detailBits.join(' • '),
        message: userMessage,
      };
    }
    case 'subgift': {
      const tier = tierLabel(irc.tags['msg-param-sub-plan']);
      const recipient = irc.tags['msg-param-recipient-display-name']
        || irc.tags['msg-param-recipient-user-name']
        || 'someone';
      const giftMonths = Number(irc.tags['msg-param-gift-months']) || 1;
      return {
        id, type: 'subgift', login, displayName, ts, tier,
        amount: giftMonths,
        headline: `${displayName} gifted a sub to ${recipient}!`,
        detail: giftMonths > 1 ? `${giftMonths} months • ${tier}` : tier,
      };
    }
    case 'submysterygift': {
      const tier = tierLabel(irc.tags['msg-param-sub-plan']);
      const count = Number(irc.tags['msg-param-mass-gift-count']) || 1;
      return {
        id, type: 'submysterygift', login, displayName, ts, tier,
        amount: count,
        headline: `${displayName} gifted ${count} sub${count === 1 ? '' : 's'}!`,
        detail: `${count} × ${tier} to the community`,
      };
    }
    case 'giftpaidupgrade':
    case 'anongiftpaidupgrade' as AlertType: {
      const gifter = irc.tags['msg-param-sender-name'] || irc.tags['msg-param-sender-login'] || 'an anonymous gifter';
      return {
        id, type: 'giftpaidupgrade', login, displayName, ts,
        headline: `${displayName} is continuing their gifted sub!`,
        detail: `Originally gifted by ${gifter}`,
      };
    }
    case 'raid': {
      const viewers = Number(irc.tags['msg-param-viewerCount']) || 0;
      const raider = irc.tags['msg-param-displayName'] || displayName;
      return {
        id, type: 'raid', login, displayName: raider, ts,
        amount: viewers,
        headline: `${raider} is raiding with ${viewers} viewer${viewers === 1 ? '' : 's'}!`,
        detail: 'Incoming raid',
      };
    }
    case 'announcement': {
      const color = irc.tags['msg-param-color'] || undefined;
      return {
        id, type: 'announcement', login, displayName, ts,
        color,
        headline: `${displayName} announced:`,
        message: userMessage,
      };
    }
    case 'bitsbadgetier': {
      const threshold = Number(irc.tags['msg-param-threshold']) || 0;
      return {
        id, type: 'bitsbadgetier', login, displayName, ts,
        amount: threshold,
        headline: `${displayName} unlocked the ${threshold.toLocaleString()} bits badge!`,
        message: userMessage,
      };
    }
    default:
      return null;
  }
}

/** Builds a cheer alert from a PRIVMSG with a bits tag, when above minBits. */
export function privmsgToCheerAlert(irc: IrcMessage, minBits: number): AlertEvent | null {
  if (irc.command !== 'PRIVMSG') return null;
  const bits = Number(irc.tags['bits']) || 0;
  if (bits <= 0 || bits < minBits) return null;
  const { login, displayName } = displayNameOf(irc);
  const ts = Number(irc.tags['tmi-sent-ts']) || Date.now();
  return {
    id: `cheer-${irc.tags['id'] ?? ts}`,
    type: 'cheer',
    login,
    displayName,
    ts,
    amount: bits,
    headline: `${displayName} cheered ${bits.toLocaleString()} bits!`,
    message: irc.trailing || undefined,
  };
}

/** Sample alerts used by the `?test=` query parameter to preview styling. */
export function buildSampleAlert(type: AlertType): AlertEvent {
  const base = { id: `test-${type}-${Date.now()}`, login: 'tester', displayName: 'TestUser', ts: Date.now() };
  switch (type) {
    case 'sub':
      return { ...base, type, tier: 'Tier 1', headline: 'TestUser subscribed!', detail: 'New Tier 1 subscriber' };
    case 'resub':
      return { ...base, type, tier: 'Tier 1', amount: 12, headline: 'TestUser resubscribed!',
        detail: 'Tier 1 • 12 months • 4-month streak',
        message: 'Loving the stream, keep it up!' };
    case 'subgift':
      return { ...base, type, tier: 'Tier 1', amount: 1, headline: 'TestUser gifted a sub to LuckyViewer!', detail: 'Tier 1' };
    case 'submysterygift':
      return { ...base, type, tier: 'Tier 1', amount: 10, headline: 'TestUser gifted 10 subs!', detail: '10 × Tier 1 to the community' };
    case 'giftpaidupgrade':
      return { ...base, type, headline: 'TestUser is continuing their gifted sub!', detail: 'Originally gifted by Generous123' };
    case 'raid':
      return { ...base, type, amount: 42, headline: 'TestUser is raiding with 42 viewers!', detail: 'Incoming raid' };
    case 'announcement':
      return { ...base, type, color: 'PURPLE', headline: 'TestUser announced:', message: 'Going live in 5 minutes!' };
    case 'cheer':
      return { ...base, type, amount: 500, headline: 'TestUser cheered 500 bits!', message: 'Cheer500 great stream!' };
    case 'bitsbadgetier':
      return { ...base, type, amount: 10000, headline: 'TestUser unlocked the 10,000 bits badge!', message: 'Onward!' };
  }
}
