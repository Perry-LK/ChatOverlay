import { Overlay } from './app/overlay';
import { applyTheme, preloadTheme } from './app/theme';
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
  await applyTheme(config);

  const overlay = new Overlay(root, config);

  // Resolve user ID, then fetch badges + 7TV emotes in parallel.
  const userId = await resolveTwitchUserId(config.channel);
  const [badges, sevenTv] = await Promise.all([
    loadBadges(userId),
    loadSevenTvEmotes(userId, config.animateEmotes),
  ]);
  overlay.setBadges(badges);
  overlay.setSevenTv(sevenTv);
  let badgeSourceUserId = userId;

  // Connect to Twitch IRC.
  const irc = new TwitchIrc(config.channel);
  irc.onStatus((s) => {
    if (s === 'open') overlay.setStatus(`connected to #${config.channel}`, 'ok');
    else if (s === 'closed' || s === 'error') overlay.setStatus(`disconnected (#${config.channel})`, 'err');
    else overlay.setStatus(`connecting to #${config.channel}…`);
  });
  irc.on((msg) => {
    const roomId = msg.tags['room-id'];
    if (roomId && roomId !== badgeSourceUserId) {
      badgeSourceUserId = roomId;
      loadBadges(roomId)
        .then((updatedBadges) => overlay.setBadges(updatedBadges))
        .catch((error) => console.warn('Badge refresh failed:', error));
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
        const refreshed = await loadSevenTvEmotes(userId, config.animateEmotes);
        overlay.setSevenTv(refreshed);
      } catch (error) {
        console.warn('7TV refresh failed:', error);
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
