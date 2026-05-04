export interface OverlayConfig {
  channel: string;
  fadeOutSeconds: number; // 0 = never fade
  maxMessages: number;
  showBadges: boolean;
  showReplies: boolean;
  showBits: boolean;
  showDeleted: boolean;
  ignoredUsers: string[];
  ignoreCommands: boolean;
  animateEmotes: boolean;
}

export interface SevenTvEmote {
  name: string;
  url: string;       // best-quality animated/static URL
  zeroWidth: boolean;
  width?: number;
  height?: number;
}

export interface TwitchEmoteSpan {
  id: string;
  start: number;
  end: number; // inclusive, code-point indexed (Twitch IRC convention)
}

export interface BadgeInfo {
  setId: string;
  version: string;
  imageUrl: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  login: string;
  displayName: string;
  color: string;
  badges: { setId: string; version: string }[];
  text: string;
  emotes: TwitchEmoteSpan[];
  isAction: boolean;
  bits: number;
  replyParentDisplayName?: string;
  replyParentMsgBody?: string;
  tmiSentTs: number;
}
