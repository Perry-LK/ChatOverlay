export type AlertType =
  | 'sub'
  | 'resub'
  | 'subgift'
  | 'submysterygift'
  | 'giftpaidupgrade'
  | 'raid'
  | 'announcement'
  | 'cheer'
  | 'bitsbadgetier';

export interface AlertEvent {
  id: string;
  type: AlertType;
  /** Login name of the actor (subscriber, gifter, raider, cheerer). */
  login: string;
  /** Display name of the actor. */
  displayName: string;
  /** Primary headline shown in large text. */
  headline: string;
  /** Optional secondary detail line (months, tier, viewer count, etc.). */
  detail?: string;
  /** Optional user-supplied message (resub message, announcement body, cheer text). */
  message?: string;
  /** Numeric amount associated with the alert (bits, viewers, gift count, months). */
  amount?: number;
  /** Subscription tier: 1000, 2000, 3000, or 'Prime'. */
  tier?: string;
  /** Color (e.g. announcement colour) supplied by Twitch tags. */
  color?: string;
  /** When the event was received. */
  ts: number;
}

export interface AlertsConfig {
  channel: string;
  /** Theme name (shares the chat overlay theme system). */
  theme: string;
  /** Optional base64-encoded custom theme (shared with chat overlay). */
  theme64: string;
  /** Optional proxy base URL (currently unused by alerts; kept for parity). */
  twitchApiBase: string;
  /** How long each alert is visible, in seconds. */
  durationSeconds: number;
  /** Max alerts queued at once. Older alerts are dropped. */
  maxQueue: number;
  /** Enabled alert types. */
  enabled: Record<AlertType, boolean>;
  /** Minimum bits in a single cheer to trigger a cheer alert (0 = all cheers). */
  minBits: number;
  /** Show the connection status indicator. */
  showStatus: boolean;
  /** Show the debug panel. */
  debug: boolean;
  /** Comma-separated alert types to fire as test events on load. */
  test: AlertType[];
}
