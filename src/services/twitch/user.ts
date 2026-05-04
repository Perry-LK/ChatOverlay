export async function resolveTwitchUserId(login: string): Promise<string | null> {
	const cleaned = login.replace(/^#/, '').toLowerCase();

	try {
		const res = await fetch(`https://decapi.me/twitch/id/${encodeURIComponent(cleaned)}`);
		if (res.ok) {
			const id = (await res.text()).trim();
			if (/^\d+$/.test(id)) return id;
		}
	} catch {
		/* fall through */
	}

	try {
		const res = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(cleaned)}`);
		if (res.ok) {
			const data = await res.json();
			const entry = Array.isArray(data) ? data[0] : data;
			const id = entry?.id;
			if (typeof id === 'string' && /^\d+$/.test(id)) return id;
		}
	} catch {
		/* ignore */
	}

	return null;
}