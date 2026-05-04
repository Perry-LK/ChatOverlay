import { Overlay } from './app/overlay';
import { applyTheme, preloadTheme } from './app/theme';
import { DebugPanel } from './app/debug';
import { loadConfig, readEarlyTheme } from './config';
import { loadSevenTvEmotes } from './services/emotes/sevenTv';
import { loadBadges } from './services/twitch/badges';
import { TwitchIrc } from './services/twitch/irc';
import { resolveTwitchUserId } from './services/twitch/user';

/* -------------------------------------------------------------------------- */
/*  Bootstrap                                                                  */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const root = document.getElementById('chat');
  if (!root) throw new Error('#chat element not found');

  // Apply the chosen theme immediately so there is no flash of un-themed base
  // styles while config.json / config.local.json are still being fetched.
  const earlyThemeReady = preloadTheme(readEarlyTheme());

  const config = await loadConfig();
  await earlyThemeReady;
  const themeResult = await applyTheme(config);
  Object.assign(config, themeResult.visibilityOverrides);

  const debug = config.debug ? new DebugPanel({
    channel: config.channel,
    themeName: config.theme,
    customThemeApplied: themeResult.customThemeApplied,
    twitchApiBase: config.twitchApiBase,
  }) : null;

  const overlay = new Overlay(root, config);

  const userId = await resolveTwitchUserId(config.channel, config.twitchApiBase);
  debug?.update({ userId });
  if (!userId) debug?.warn(`could not resolve userId for #${config.channel}`);

  const [badgesResult, sevenTv] = await Promise.all([
    loadBadges(userId, config.twitchApiBase),
    loadSevenTvEmotes(userId, config.animateEmotes).catch((error: Error) => {
      debug?.warn(`7TV load failed: ${error.message}`);
      return new Map();
    }),
  ]);
  overlay.setBadges(badgesResult.map);
  overlay.setSevenTv(sevenTv);
  debug?.update({
    badgeCount: badgesResult.map.size,
    badgeSource: badgesResult.source,
    badgeError: badgesResult.error,
    badgeSampleKeys: Array.from(badgesResult.map.keys()).sort(),
    sevenTvCount: sevenTv.size,
  });
  let badgeSourceUserId = userId;

  // Connect to Twitch IRC.
  const irc = new TwitchIrc(config.channel);
  irc.onStatus((s) => {
    debug?.update({ ircState: s });
    if (s === 'open') overlay.setStatus(`connected to #${config.channel}`, 'ok');
    else if (s === 'closed' || s === 'error') overlay.setStatus(`disconnected (#${config.channel})`, 'err');
    else overlay.setStatus(`connecting to #${config.channel}…`);
  });
  irc.on((msg) => {
    const roomId = msg.tags['room-id'];
    if (roomId && roomId !== badgeSourceUserId) {
      badgeSourceUserId = roomId;
      loadBadges(roomId, config.twitchApiBase)
        .then((updated) => {
          overlay.setBadges(updated.map);
          debug?.update({
            userId: roomId,
            badgeCount: updated.map.size,
            badgeSource: updated.source,
            badgeError: updated.error,
            badgeSampleKeys: Array.from(updated.map.keys()).sort(),
          });
          if (updated.error) debug?.warn(`badge refresh: ${updated.error}`);
        })
        .catch((error: Error) => debug?.warn(`badge refresh failed: ${error.message}`));
    }

    overlay.handleIrc(msg);
  });
  irc.connect();

  // Periodically refresh 7TV channel emotes so additions/removals appear
  // without a reload. Uses a chained timeout instead of setInterval so a slow
  // refresh cannot overlap with the next tick.
  const REFRESH_MS = 10 * 60 * 1000;
  const scheduleRefresh = (): void => {
    window.setTimeout(async () => {
      try {
        const refreshed = await loadSevenTvEmotes(badgeSourceUserId, config.animateEmotes);
        overlay.setSevenTv(refreshed);
        debug?.update({ sevenTvCount: refreshed.size });
      } catch (error) {
        const msg = (error as Error).message ?? '7TV refresh failed';
        console.warn('7TV refresh failed:', error);
        debug?.warn(`7TV refresh: ${msg}`);
      } finally {
        scheduleRefresh();
      }
    }, REFRESH_MS);
  };
  scheduleRefresh();
}

main().catch((err) => {
  console.error('Chat overlay failed to start:', err);
});
