import type { BadgeMap } from '../services/twitch/badges';
import { getBadge } from '../services/twitch/badges';
import type { ChatMessage, OverlayConfig, SevenTvEmote } from '../types';

const TWITCH_EMOTE_URL = (id: string, animate: boolean) =>
	`https://static-cdn.jtvnw.net/emoticons/v2/${id}/${animate ? 'default' : 'static'}/dark/2.0`;

const FALLBACK_COLORS = [
	'#FF4A80', '#FF7F50', '#FFD700', '#7FFF00', '#00FA9A',
	'#1E90FF', '#9370DB', '#FF69B4', '#00CED1', '#FF6347',
];

function fallbackColor(login: string): string {
	let hash = 0;
	for (let i = 0; i < login.length; i++) hash = (hash * 31 + login.charCodeAt(i)) | 0;
	return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export interface RenderContext {
	config: OverlayConfig;
	badges: BadgeMap;
	sevenTv: Map<string, SevenTvEmote>;
	doc?: Document;
}

const BADGE_LABELS: Record<string, string> = {
	broadcaster: 'Broadcaster',
	moderator: 'Mod',
	vip: 'VIP',
	subscriber: 'Sub',
	founder: 'Founder',
	partner: 'Partner',
	staff: 'Staff',
	admin: 'Admin',
	global_mod: 'Global Mod',
	premium: 'Prime',
	turbo: 'Turbo',
	bits: 'Bits',
	artist: 'Artist',
	'artist-badge': 'Artist',
};

type Token =
	| { type: 'text'; value: string }
	| { type: 'twitchEmote'; id: string; name: string }
	| { type: 'sevenTv'; emote: SevenTvEmote };

function tokenizeMessage(msg: ChatMessage, sevenTv: Map<string, SevenTvEmote>): Token[] {
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

	const parts = text.split(/(\s+)/);
	for (const part of parts) {
		if (!part) continue;
		if (/^\s+$/.test(part)) {
			appendText(out, part);
			continue;
		}
		const emote = sevenTv.get(part);
		if (emote) out.push({ type: 'sevenTv', emote });
		else appendText(out, part);
	}
}

function appendText(out: Token[], text: string): void {
	const last = out[out.length - 1];
	if (last && last.type === 'text') last.value += text;
	else out.push({ type: 'text', value: text });
}

function formatBadgeLabel(setId: string, version: string): string {
	const known = BADGE_LABELS[setId];
	if (known) return known;
	const humanized = setId
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
	return version && version !== '1' ? `${humanized} ${version}` : humanized;
}

function makeBadgeFallback(doc: Document, setId: string, version: string): HTMLSpanElement {
	const pill = doc.createElement('span');
	pill.className = `badge-fallback badge-fallback--${setId.replace(/[^a-z0-9_-]/gi, '').toLowerCase()}`;
	pill.textContent = formatBadgeLabel(setId, version);
	pill.title = pill.textContent;
	return pill;
}

const CHEER_PREFIXES = [
	'Cheer', 'BitBoss', 'ShowLove', 'Party', 'SeemsGood', 'Pride', 'Kappa',
	'FrankerZ', 'HeyGuys', 'DansGame', 'EleGiggle', 'TriHard', 'Kreygasm',
	'biblethump', 'corgo', 'uni', 'showlove', 'party', 'doodlecheer',
	'streamlabs', 'anon', 'muxy',
];

const CHEER_REGEX = new RegExp(`\\b(${CHEER_PREFIXES.join('|')})(\\d+)\\b`, 'gi');

function cheerTier(amount: number): string {
	if (amount >= 10000) return '#ff1493';
	if (amount >= 5000) return '#1e90ff';
	if (amount >= 1000) return '#00bfa5';
	if (amount >= 100) return '#9b59ff';
	return '#a0a0a0';
}

function renderTextWithCheers(doc: Document, text: string, hasBits: boolean): (HTMLElement | Text)[] {
	if (!hasBits) return [doc.createTextNode(text)];
	CHEER_REGEX.lastIndex = 0;
	const out: (HTMLElement | Text)[] = [];
	let lastIdx = 0;
	let match: RegExpExecArray | null;
	while ((match = CHEER_REGEX.exec(text)) !== null) {
		if (match.index > lastIdx) out.push(doc.createTextNode(text.slice(lastIdx, match.index)));
		const span = doc.createElement('span');
		span.className = 'cheer';
		span.style.color = cheerTier(Number(match[2]));
		span.textContent = match[0];
		out.push(span);
		lastIdx = match.index + match[0].length;
	}
	if (lastIdx < text.length) out.push(doc.createTextNode(text.slice(lastIdx)));
	return out;
}

function makeEmoteImg(doc: Document, src: string, alt: string, animate: boolean): HTMLImageElement {
	const img = doc.createElement('img');
	img.className = 'emote';
	img.alt = alt;
	img.title = alt;
	img.src = src;
	img.loading = 'eager';
	img.decoding = 'async';
	if (!animate) img.dataset.static = 'true';
	return img;
}

export function renderMessage(msg: ChatMessage, ctx: RenderContext): HTMLElement {
	const { config, badges, sevenTv } = ctx;
	const doc = ctx.doc ?? document;
	const root = doc.createElement('div');
	root.className = 'msg';
	root.dataset.msgId = msg.id;
	root.dataset.userId = msg.userId;
	if (msg.isAction) root.classList.add('action');

	if (config.showReplies && msg.replyParentDisplayName && msg.replyParentMsgBody) {
		const reply = doc.createElement('span');
		reply.className = 'reply';
		reply.textContent = `@${msg.replyParentDisplayName}: ${msg.replyParentMsgBody}`;
		root.appendChild(reply);
	}

	if (config.showBadges && msg.badges.length) {
		const wrap = doc.createElement('span');
		wrap.className = 'badges';
		for (const badge of msg.badges) {
			const info = getBadge(badges, badge.setId, badge.version);
			if (!info) {
				wrap.appendChild(makeBadgeFallback(doc, badge.setId, badge.version));
				continue;
			}

			const img = doc.createElement('img');
			img.className = 'badge';
			img.src = info.imageUrl;
			img.alt = info.title;
			img.title = info.title;
			img.addEventListener('error', () => {
				img.replaceWith(makeBadgeFallback(doc, badge.setId, badge.version));
			}, { once: true });
			wrap.appendChild(img);
		}
		if (wrap.childNodes.length) root.appendChild(wrap);
	}

	const user = doc.createElement('span');
	user.className = 'username';
	user.textContent = msg.displayName;
	user.style.color = msg.color || fallbackColor(msg.login);
	root.appendChild(user);

	if (!msg.isAction) {
		const colon = doc.createElement('span');
		colon.className = 'colon';
		colon.textContent = ': ';
		root.appendChild(colon);
	} else {
		root.appendChild(doc.createTextNode(' '));
	}

	const body = doc.createElement('span');
	body.className = 'msg-text';
	if (msg.isAction && msg.color) body.style.color = msg.color;

	const tokens = tokenizeMessage(msg, sevenTv);
	const hasBits = config.showBits && msg.bits > 0;
	let lastEmoteEl: HTMLImageElement | HTMLElement | null = null;
	for (const token of tokens) {
		if (token.type === 'text') {
			lastEmoteEl = null;
			for (const node of renderTextWithCheers(doc, token.value, hasBits)) body.appendChild(node);
		} else if (token.type === 'twitchEmote') {
			const img = makeEmoteImg(doc, TWITCH_EMOTE_URL(token.id, config.animateEmotes), token.name, config.animateEmotes);
			body.appendChild(img);
			lastEmoteEl = img;
		} else {
			const img = makeEmoteImg(doc, token.emote.url, token.emote.name, config.animateEmotes);
			if (token.emote.zeroWidth && lastEmoteEl) {
				let stack: HTMLElement;
				if (lastEmoteEl.parentElement?.classList.contains('zw-stack')) {
					stack = lastEmoteEl.parentElement;
				} else {
					stack = doc.createElement('span');
					stack.className = 'zw-stack';
					body.replaceChild(stack, lastEmoteEl);
					stack.appendChild(lastEmoteEl);
				}
				stack.appendChild(img);
			} else {
				body.appendChild(img);
				lastEmoteEl = img;
			}
		}
	}

	root.appendChild(body);

	if (hasBits) {
		const bitsTag = doc.createElement('span');
		bitsTag.className = 'cheer';
		bitsTag.style.color = cheerTier(msg.bits);
		bitsTag.textContent = `  ✦ ${msg.bits} bits`;
		root.appendChild(bitsTag);
	}

	return root;
}