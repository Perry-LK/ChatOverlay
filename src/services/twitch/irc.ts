export interface IrcMessage {
	raw: string;
	tags: Record<string, string>;
	prefix: string;
	command: string;
	params: string[];
	trailing: string;
}

type Listener = (msg: IrcMessage) => void;

export class TwitchIrc {
	private ws: WebSocket | null = null;
	private listeners = new Set<Listener>();
	private statusListeners = new Set<(s: 'connecting' | 'open' | 'closed' | 'error') => void>();
	private channel: string;
	private reconnectAttempts = 0;
	private manuallyClosed = false;
	private nick: string;

	constructor(channel: string) {
		this.channel = channel.replace(/^#/, '').toLowerCase();
		this.nick = 'justinfan' + Math.floor(Math.random() * 90000 + 10000);
	}

	on(listener: Listener): void { this.listeners.add(listener); }

	onStatus(listener: (s: 'connecting' | 'open' | 'closed' | 'error') => void): void {
		this.statusListeners.add(listener);
	}

	connect(): void {
		this.manuallyClosed = false;
		this.emitStatus('connecting');
		const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
		this.ws = ws;

		ws.addEventListener('open', () => {
			ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
			ws.send('PASS SCHMOOPIIE');
			ws.send(`NICK ${this.nick}`);
			ws.send(`JOIN #${this.channel}`);
			this.reconnectAttempts = 0;
			this.emitStatus('open');
		});

		ws.addEventListener('message', (event) => {
			const data = typeof event.data === 'string' ? event.data : '';
			for (const line of data.split('\r\n')) {
				if (!line) continue;
				const parsed = parseIrc(line);
				if (parsed.command === 'PING') {
					ws.send(`PONG :${parsed.trailing || 'tmi.twitch.tv'}`);
					continue;
				}
				if (parsed.command === 'RECONNECT') {
					this.reconnect();
					continue;
				}
				for (const listener of this.listeners) {
					try { listener(parsed); } catch (error) { console.error(error); }
				}
			}
		});

		ws.addEventListener('error', () => {
			this.emitStatus('error');
		});

		ws.addEventListener('close', () => {
			this.emitStatus('closed');
			if (!this.manuallyClosed) this.reconnect();
		});
	}

	disconnect(): void {
		this.manuallyClosed = true;
		this.ws?.close();
		this.ws = null;
	}

	private reconnect(): void {
		this.ws?.close();
		this.ws = null;
		this.reconnectAttempts++;
		const delay = Math.min(30_000, 1_000 * 2 ** Math.min(this.reconnectAttempts, 5));
		setTimeout(() => {
			if (!this.manuallyClosed) this.connect();
		}, delay);
	}

	private emitStatus(s: 'connecting' | 'open' | 'closed' | 'error'): void {
		for (const listener of this.statusListeners) {
			try { listener(s); } catch { /* ignore */ }
		}
	}
}

const TAG_UNESCAPE: Record<string, string> = {
	'\\:': ';',
	'\\s': ' ',
	'\\\\': '\\',
	'\\r': '\r',
	'\\n': '\n',
};

function unescapeTagValue(value: string): string {
	return value.replace(/\\[:\\sn r]/g, (match) => TAG_UNESCAPE[match] ?? match);
}

export function parseIrc(line: string): IrcMessage {
	const result: IrcMessage = {
		raw: line,
		tags: {},
		prefix: '',
		command: '',
		params: [],
		trailing: '',
	};

	let index = 0;

	if (line[0] === '@') {
		const space = line.indexOf(' ');
		const tagStr = line.slice(1, space);
		for (const tag of tagStr.split(';')) {
			const eq = tag.indexOf('=');
			if (eq === -1) {
				result.tags[tag] = '';
			} else {
				result.tags[tag.slice(0, eq)] = unescapeTagValue(tag.slice(eq + 1));
			}
		}
		index = space + 1;
	}

	if (line[index] === ':') {
		const space = line.indexOf(' ', index);
		result.prefix = line.slice(index + 1, space);
		index = space + 1;
	}

	const trailingIdx = line.indexOf(' :', index);
	let paramsPart: string;
	if (trailingIdx === -1) {
		paramsPart = line.slice(index);
	} else {
		paramsPart = line.slice(index, trailingIdx);
		result.trailing = line.slice(trailingIdx + 2);
	}

	const tokens = paramsPart.split(' ').filter(Boolean);
	result.command = tokens[0] ?? '';
	result.params = tokens.slice(1);
	return result;
}