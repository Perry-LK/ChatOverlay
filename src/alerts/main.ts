import { TwitchIrc } from '../services/twitch/irc';
import { preloadTheme } from '../app/theme';
import { applyCustomTheme, decodeTheme } from '../customise/theme';
import { loadAlertsConfig, readEarlyAlertsTheme } from './config';
import { buildSampleAlert, privmsgToCheerAlert, userNoticeToAlert } from './parser';
import { AlertQueue } from './queue';

async function loadOptionalStylesheet(href: string, id: string): Promise<void> {
  await new Promise<void>((resolve) => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => { link.remove(); resolve(); };
    document.head.appendChild(link);
  });
}

async function main(): Promise<void> {
  const root = document.getElementById('alerts');
  if (!root) throw new Error('#alerts element not found');

  // Apply theme stylesheet before config resolves so there is no flash.
  const earlyTheme = preloadTheme(readEarlyAlertsTheme());

  const config = await loadAlertsConfig();
  await earlyTheme;

  await preloadTheme(config.theme);
  await loadOptionalStylesheet(`${import.meta.env.BASE_URL}custom.css`, 'overlay-custom');
  if (config.theme64) {
    const decoded = decodeTheme(config.theme64);
    if (decoded) applyCustomTheme(decoded);
    else console.warn('[ChatOverlay alerts] theme64 could not be decoded');
  }

  const status = document.createElement('div');
  status.className = 'status';
  status.textContent = `connecting to #${config.channel}…`;
  if (config.showStatus) document.body.appendChild(status);

  const setStatus = (text: string, kind: 'ok' | 'err' | 'neutral' = 'neutral'): void => {
    if (!config.showStatus) return;
    status.textContent = text;
    status.classList.remove('ok', 'err');
    if (kind === 'ok') status.classList.add('ok');
    if (kind === 'err') status.classList.add('err');
  };

  const queue = new AlertQueue(root, config);

  const irc = new TwitchIrc(config.channel);
  irc.onStatus((s) => {
    if (s === 'open') setStatus(`connected to #${config.channel}`, 'ok');
    else if (s === 'closed' || s === 'error') setStatus(`disconnected (#${config.channel})`, 'err');
    else setStatus(`connecting to #${config.channel}…`);
  });
  irc.on((msg) => {
    if (msg.command === 'USERNOTICE') {
      const event = userNoticeToAlert(msg);
      if (event) queue.push(event);
      return;
    }
    if (msg.command === 'PRIVMSG' && config.enabled.cheer) {
      const event = privmsgToCheerAlert(msg, config.minBits);
      if (event) queue.push(event);
    }
  });
  irc.connect();

  // Fire any requested test alerts on a short stagger so they don't all
  // collapse into the queue at once.
  config.test.forEach((type, index) => {
    window.setTimeout(() => queue.push(buildSampleAlert(type)), 500 + index * 1500);
  });

  if (config.debug) {
    console.info('[ChatOverlay alerts] config', config);
  }
}

main().catch((err) => {
  console.error('Alerts overlay failed to start:', err);
});
