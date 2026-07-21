import{n as e,r as t,t as n}from"./theme-DdXN4zvX.js";import{i as r,n as i,r as a,t as o}from"./user-DwhJZPxd.js";var s=`:root {
	--co-font: 'Inter', 'Segoe UI', system-ui, sans-serif;
	--co-font-size: 20px;
	--co-line-height: 1.35;
	--co-font-weight: 400;
	--co-letter-spacing: normal;

	--co-text: #ffffff;
	--co-text-shadow:
		0 0 2px #000,
		0 0 4px #000,
		1px 1px 2px #000;

	--co-username-weight: 700;
	--co-username-transform: none;
	--co-username-letter-spacing: normal;

	--co-message-gap: 6px;
	--co-padding: 6px 10px;
	--co-radius: 6px;

	--co-emote-size: 1.6em;
	--co-badge-size: 1em;
	--co-badge-gap: 3px;

	--co-chat-padding: 12px;
	--co-chat-align: flex-end;

	--co-card-bg: transparent;
	--co-card-border: 0 solid transparent;
	--co-card-shadow: none;
	--co-card-backdrop: none;
	--co-card-max-width: 100%;

	--co-reply-opacity: 0.75;
	--co-reply-style: normal;
	--co-reply-color: inherit;

	--co-fade-duration: 400ms;
	--co-enter-duration: 220ms;
	--co-enter-translate: 6px;
	--co-enter-easing: ease-out;
}

html,
body {
	margin: 0;
	padding: 0;
	background: transparent;
	color: var(--co-text);
	font-family: var(--co-font);
	font-size: var(--co-font-size);
	font-weight: var(--co-font-weight);
	letter-spacing: var(--co-letter-spacing);
	line-height: var(--co-line-height);
	overflow: hidden;
	text-shadow: var(--co-text-shadow);
	-webkit-font-smoothing: antialiased;
}

.chat {
	display: flex;
	flex-direction: column;
	justify-content: var(--co-chat-align);
	gap: var(--co-message-gap);
	width: 100vw;
	height: 100vh;
	padding: var(--co-chat-padding);
	box-sizing: border-box;
	overflow: hidden;
	word-wrap: break-word;
	overflow-wrap: anywhere;
}

.msg {
	padding: var(--co-padding);
	border-radius: var(--co-radius);
	background: var(--co-card-bg);
	border: var(--co-card-border);
	box-shadow: var(--co-card-shadow);
	backdrop-filter: var(--co-card-backdrop);
	-webkit-backdrop-filter: var(--co-card-backdrop);
	max-width: var(--co-card-max-width);
	animation: co-enter var(--co-enter-duration) var(--co-enter-easing);
	transition: opacity var(--co-fade-duration) ease;
}

.msg.fade-out {
	opacity: 0;
}

.msg.action .msg-text,
.msg.action .username {
	font-style: italic;
}

.msg.deleted .msg-text {
	text-decoration: line-through;
	opacity: 0.55;
}

.msg.highlighted {
	background: rgba(120, 80, 220, 0.25);
	border-left: 3px solid #a78bfa;
}

.badges {
	display: inline-flex;
	align-items: center;
	vertical-align: middle;
	gap: var(--co-badge-gap);
	margin-right: 4px;
}

.badge {
	width: var(--co-badge-size);
	height: var(--co-badge-size);
	vertical-align: middle;
}

.badge-fallback {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 1.3em;
	padding: 0 0.42em;
	border-radius: 999px;
	font-size: 0.62em;
	font-weight: 700;
	line-height: 1;
	text-transform: uppercase;
	letter-spacing: 0.03em;
	background: rgba(255, 255, 255, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.28);
	color: var(--co-text);
	vertical-align: middle;
}

.badge-fallback--broadcaster {
	background: rgba(225, 38, 83, 0.85);
	border-color: rgba(255, 181, 199, 0.65);
}

.badge-fallback--moderator {
	background: rgba(52, 160, 72, 0.82);
	border-color: rgba(183, 242, 193, 0.6);
}

.badge-fallback--vip {
	background: rgba(207, 70, 255, 0.82);
	border-color: rgba(240, 194, 255, 0.6);
}

.badge-fallback--subscriber,
.badge-fallback--founder {
	background: rgba(44, 118, 255, 0.82);
	border-color: rgba(186, 211, 255, 0.6);
}

.username {
	font-weight: var(--co-username-weight);
	letter-spacing: var(--co-username-letter-spacing);
	text-transform: var(--co-username-transform);
	margin-right: 2px;
}

.colon {
	margin-right: 4px;
}

.msg-text {
	vertical-align: middle;
}

.emote {
	height: var(--co-emote-size);
	vertical-align: middle;
	margin: -0.2em 1px;
}

.zw-stack {
	position: relative;
	display: inline-block;
	vertical-align: middle;
	height: var(--co-emote-size);
}

.zw-stack .emote {
	position: absolute;
	top: 0;
	left: 0;
}

.zw-stack .emote:first-child {
	position: relative;
}

.reply {
	display: block;
	font-size: 0.75em;
	opacity: var(--co-reply-opacity);
	font-style: var(--co-reply-style);
	color: var(--co-reply-color);
	margin-bottom: 2px;
}

.reply::before {
	content: '↪ ';
}

.cheer {
	font-weight: 700;
}

@keyframes co-enter {
	from { opacity: 0; transform: translateY(var(--co-enter-translate)); }
	to { opacity: 1; transform: translateY(0); }
}

.status {
	position: fixed;
	bottom: 4px;
	right: 6px;
	font-size: 11px;
	opacity: 0.5;
	pointer-events: none;
}

.status.ok { color: #6ee7a8; }
.status.err { color: #ff8a8a; }`,c=[{id:`system-sans`,label:`System sans`,category:`system`,family:`system-ui, 'Segoe UI', sans-serif`},{id:`inter`,label:`Inter`,category:`sans`,family:`'Inter', system-ui, sans-serif`,importUrl:`https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800&display=swap`},{id:`roboto`,label:`Roboto`,category:`sans`,family:`'Roboto', system-ui, sans-serif`,importUrl:`https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap`},{id:`plex-sans`,label:`IBM Plex Sans`,category:`sans`,family:`'IBM Plex Sans', system-ui, sans-serif`,importUrl:`https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;700&display=swap`},{id:`nunito`,label:`Nunito`,category:`sans`,family:`'Nunito', system-ui, sans-serif`,importUrl:`https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap`},{id:`trebuchet`,label:`Trebuchet MS`,category:`sans`,family:`'Trebuchet MS', 'Avenir Next', system-ui, sans-serif`},{id:`merriweather`,label:`Merriweather`,category:`serif`,family:`'Merriweather', Georgia, serif`,importUrl:`https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap`},{id:`georgia`,label:`Georgia`,category:`serif`,family:`Georgia, 'Times New Roman', serif`},{id:`playfair`,label:`Playfair Display`,category:`serif`,family:`'Playfair Display', Georgia, serif`,importUrl:`https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap`},{id:`jetbrains-mono`,label:`JetBrains Mono`,category:`mono`,family:`'JetBrains Mono', ui-monospace, monospace`,importUrl:`https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap`},{id:`fira-code`,label:`Fira Code`,category:`mono`,family:`'Fira Code', ui-monospace, monospace`,importUrl:`https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap`},{id:`mono-system`,label:`System mono`,category:`mono`,family:`ui-monospace, 'SF Mono', Menlo, monospace`},{id:`orbitron`,label:`Orbitron (futurist)`,category:`display`,family:`'Orbitron', system-ui, sans-serif`,importUrl:`https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap`},{id:`press-start`,label:`Press Start 2P (arcade)`,category:`display`,family:`'Press Start 2P', ui-monospace, monospace`,importUrl:`https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap`},{id:`bangers`,label:`Bangers (comic)`,category:`display`,family:`'Bangers', 'Comic Sans MS', cursive`,importUrl:`https://fonts.googleapis.com/css2?family=Bangers&display=swap`},{id:`bungee`,label:`Bungee (bold display)`,category:`display`,family:`'Bungee', system-ui, sans-serif`,importUrl:`https://fonts.googleapis.com/css2?family=Bungee&display=swap`},{id:`audiowide`,label:`Audiowide (sci-fi)`,category:`display`,family:`'Audiowide', system-ui, sans-serif`,importUrl:`https://fonts.googleapis.com/css2?family=Audiowide&display=swap`},{id:`caveat`,label:`Caveat (hand-written)`,category:`handwriting`,family:`'Caveat', 'Comic Sans MS', cursive`,importUrl:`https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap`},{id:`permanent-marker`,label:`Permanent Marker`,category:`handwriting`,family:`'Permanent Marker', 'Comic Sans MS', cursive`,importUrl:`https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap`},{id:`shadows-into-light`,label:`Shadows Into Light`,category:`handwriting`,family:`'Shadows Into Light', cursive`,importUrl:`https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap`},{id:`comic-sans`,label:`Comic Sans MS`,category:`handwriting`,family:`'Comic Sans MS', 'Comic Neue', cursive`}];function l(e){if(!e)return;let t=e.trim();return c.find(e=>e.family===t||e.label===t)}function u(e){let t=new Set,n=[];for(let[r,i]of Object.entries(e)){if(!r.startsWith(`--co-font`))continue;let e=l(i);e?.importUrl&&(t.has(e.importUrl)||(t.add(e.importUrl),n.push(`@import url("${e.importUrl}");`)))}return n.join(`
`)}var d=null,f=0;function p(e,t,n,r,i){let a=++f,o=w(n,t);d&&URL.revokeObjectURL(d);let s=new Blob([o],{type:`text/html`});d=URL.createObjectURL(s),e.src=d,e.addEventListener(`load`,()=>{m(e,t,r,i,a)},{once:!0})}async function m(e,t,r,a,o){let s=e.contentDocument;if(!s)return;n(t,s);let[c,l]=await Promise.all([h(r,a),i(null,!0)]);o!==f||e.contentDocument!==s||_(s,t,c,l)}async function h(e,t){let n=g(t);return(await r(e.trim()?await o(e,n):null,n)).map}function g(e){try{return new URL(e||`/`,window.location.href).searchParams.get(`twitchApiBase`)?.trim().replace(/\/+$/,``)??``}catch{return``}}function _(e,t,n,r){let i=e.getElementById(`chat`);if(!i)return;i.replaceChildren();let o=v(t),s=y(r);for(let c of s)c.bits&&t.show?.bits===!1||i.appendChild(a(c,{config:o,badges:n,sevenTv:r,doc:e}))}function v(e){return{channel:`preview`,theme:`none`,twitchApiBase:``,theme64:``,debug:!1,fadeOutSeconds:0,maxMessages:12,showBadges:e.show?.badges??!0,showReplies:e.show?.replies??!0,showBits:e.show?.bits??!0,showDeleted:!1,showStatus:e.show?.status??!1,ignoredUsers:[],ignoreCommands:!1,animateEmotes:!0}}function y(e){let[t,n]=b(e);return[C({id:`preview-1`,login:`streamerhost`,displayName:`StreamerHost`,color:`#ff5e7a`,badges:[{setId:`broadcaster`,version:`1`},{setId:`partner`,version:`1`}],text:`GG everyone Kappa Keepo welcome in!`,emotes:x(`GG everyone Kappa Keepo welcome in!`,[{name:`Kappa`,id:`25`},{name:`Keepo`,id:`1902`}])}),C({id:`preview-2`,login:`mod_kira`,displayName:`mod_kira`,color:`#52c878`,badges:[{setId:`moderator`,version:`1`},{setId:`subscriber`,version:`1`}],text:t&&n?`Global 7TV picks for this preview: ${t} ${n}`:`Global 7TV emotes will appear here when the 7TV API responds.`}),C({id:`preview-3`,login:`vipfan`,displayName:`VIPFan`,color:`#cf46ff`,badges:[{setId:`vip`,version:`1`},{setId:`subscriber`,version:`1`}],text:t?`That combo of Kappa with ${t} is dangerously spammy.`:`That combo of Kappa with a 7TV global is dangerously spammy.`,emotes:x(t?`That combo of Kappa with ${t} is dangerously spammy.`:`That combo of Kappa with a 7TV global is dangerously spammy.`,[{name:`Kappa`,id:`25`}])}),C({id:`preview-4`,login:`sub_tier3`,displayName:`sub_tier3`,color:`#1e90ff`,badges:[{setId:`subscriber`,version:`1`}],text:`just resubbed for 12 months :)`,replyParentDisplayName:`StreamerHost`,replyParentMsgBody:`thanks for being here!`}),C({id:`preview-5`,login:`cheermaster`,displayName:`cheermaster`,color:`#f4b400`,badges:[{setId:`bits`,version:`100`}],text:`Cheer500 incredible play`,bits:500}),C({id:`preview-6`,login:`casual_viewer`,displayName:`casual_viewer`,color:`#a0a0a0`,badges:[],text:n?`first time here ${n} really enjoying the stream`:`first time here really enjoying the stream`,isAction:!0})]}function b(e){let t=[...e.values()].filter(e=>!e.zeroWidth&&/^\S+$/.test(e.name)).slice(0,2).map(e=>e.name);return[t[0]??``,t[1]??``]}function x(e,t){let n=Array.from(e),r=[];for(let e of t){let t=Array.from(e.name),i=S(n,t);i<0||r.push({id:e.id,start:i,end:i+t.length-1})}return r.sort((e,t)=>e.start-t.start)}function S(e,t){outer:for(let n=0;n<=e.length-t.length;n++){for(let r=0;r<t.length;r++)if(e[n+r]!==t[r])continue outer;return n}return-1}function C(e){return{id:e.id,userId:e.login,login:e.login,displayName:e.displayName,color:e.color,badges:e.badges??[],text:e.text,emotes:e.emotes??[],isAction:e.isAction??!1,bits:e.bits??0,replyParentDisplayName:e.replyParentDisplayName,replyParentMsgBody:e.replyParentMsgBody,tmiSentTs:Date.now()}}function w(e,t){let n=e.replace(/[^a-z0-9_-]/gi,``),r=`${window.location.origin}/ChatOverlay/`,i=n&&n!==`none`?`<link rel="stylesheet" href="${T(`${r}themes/${n}.css`)}" />`:``,a=u(t.vars??{});return`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${a?`<style>${a}</style>`:``}
  <style>${s}</style>
  ${i}
  <style>
    html, body { background: transparent; }
    body { padding: 0; }
    .badge-fallback { display: inline-flex; align-items: center; padding: 0 0.5em; min-height: 1.3em;
      border-radius: 999px; font-size: 0.62em; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.04em; border: 1px solid rgba(255,255,255,0.35); color: #fff; vertical-align: middle; }
  </style>
</head>
<body>
  <div id="chat" class="chat" aria-live="polite"></div>
</body>
</html>`}function T(e){return e.replace(/"/g,`&quot;`)}var E=[{id:`overlay-default`,label:`Overlay default`,description:`Transparent overlay with a soft text outline. Matches the base look.`,swatch:[`#1d2540`,`#0c1224`],vars:{"--co-font":`'Inter', system-ui, sans-serif`,"--co-font-size":`20px`,"--co-font-weight":`400`,"--co-letter-spacing":`normal`,"--co-text":`#ffffff`,"--co-text-shadow":`0 0 2px #000, 0 0 4px #000, 1px 1px 2px #000`,"--co-username-weight":`700`,"--co-username-transform":`none`,"--co-username-letter-spacing":`normal`,"--co-card-bg":`transparent`,"--co-card-border":`0 solid transparent`,"--co-card-shadow":`none`,"--co-card-backdrop":`none`,"--co-card-max-width":`100%`,"--co-radius":`6px`,"--co-padding":`6px 10px`,"--co-message-gap":`6px`,"--co-reply-opacity":`0.75`,"--co-reply-style":`normal`,"--co-reply-color":`inherit`,"--co-enter-translate":`6px`,"--co-enter-easing":`ease-out`}},{id:`glass`,label:`Glass card`,description:`Frosted translucent card with a soft drop shadow. Great over busy gameplay.`,swatch:[`#5b6f9a`,`#1d2540`],vars:{"--co-font":`'Inter', system-ui, sans-serif`,"--co-font-size":`20px`,"--co-font-weight":`500`,"--co-text":`#f8fbff`,"--co-text-shadow":`0 1px 0 rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.85)`,"--co-card-bg":`linear-gradient(180deg, rgba(25, 34, 58, 0.72), rgba(14, 20, 36, 0.66))`,"--co-card-border":`1px solid rgba(194,219,255,0.16)`,"--co-card-shadow":`inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 24px rgba(0,0,0,0.28)`,"--co-card-backdrop":`blur(12px) saturate(120%)`,"--co-card-max-width":`min(92%, 760px)`,"--co-radius":`14px`,"--co-padding":`10px 14px`,"--co-message-gap":`10px`}},{id:`sleek-futurist`,label:`Sleek futurist`,description:`Sharp edges, low-emission neon, mono-influenced display font.`,swatch:[`#00e5ff`,`#0a1a2a`],vars:{"--co-font":`'Orbitron', system-ui, sans-serif`,"--co-font-size":`20px`,"--co-font-weight":`500`,"--co-letter-spacing":`0.04em`,"--co-text":`#dffaff`,"--co-text-shadow":`0 0 6px rgba(0, 229, 255, 0.55)`,"--co-username-weight":`700`,"--co-username-letter-spacing":`0.08em`,"--co-username-transform":`uppercase`,"--co-card-bg":`linear-gradient(180deg, rgba(8,18,32,0.85), rgba(4,8,16,0.85))`,"--co-card-border":`1px solid rgba(0,229,255,0.6)`,"--co-card-shadow":`0 0 14px rgba(0,229,255,0.35)`,"--co-card-backdrop":`blur(6px)`,"--co-card-max-width":`min(92%, 720px)`,"--co-radius":`4px`,"--co-padding":`8px 12px`,"--co-message-gap":`8px`,"--co-enter-easing":`cubic-bezier(0.2, 0.8, 0.2, 1)`}},{id:`neon-arcade`,label:`Neon arcade`,description:`Magenta/cyan glow, pixel-display username, perfect for retro streams.`,swatch:[`#ff3df0`,`#00e5ff`],vars:{"--co-font":`'Press Start 2P', ui-monospace, monospace`,"--co-font-size":`15px`,"--co-line-height":`1.6`,"--co-text":`#ffffff`,"--co-text-shadow":`0 0 6px #ff3df0, 0 0 14px #ff3df0`,"--co-username-weight":`400`,"--co-username-transform":`uppercase`,"--co-card-bg":`rgba(10, 5, 25, 0.7)`,"--co-card-border":`2px solid #ff3df0`,"--co-card-shadow":`0 0 14px rgba(0,229,255,0.55), 0 0 28px rgba(255,61,240,0.35)`,"--co-card-max-width":`min(92%, 700px)`,"--co-radius":`4px`,"--co-padding":`10px 14px`,"--co-message-gap":`10px`,"--co-enter-translate":`0px`}},{id:`comic-pop`,label:`Comic pop`,description:`Heavy ink outlines, bold display font, comic-book offset shadow.`,swatch:[`#fff3a0`,`#111111`],vars:{"--co-font":`'Bangers', 'Comic Sans MS', cursive`,"--co-font-size":`22px`,"--co-line-height":`1.25`,"--co-letter-spacing":`0.03em`,"--co-text":`#111111`,"--co-text-shadow":`none`,"--co-username-weight":`700`,"--co-username-transform":`uppercase`,"--co-card-bg":`#fff3a0`,"--co-card-border":`3px solid #111`,"--co-card-shadow":`4px 4px 0 #111`,"--co-card-backdrop":`none`,"--co-card-max-width":`min(92%, 680px)`,"--co-radius":`14px`,"--co-padding":`8px 14px`,"--co-message-gap":`12px`,"--co-reply-opacity":`1`,"--co-reply-color":`#444`,"--co-enter-translate":`0px`,"--co-enter-easing":`cubic-bezier(0.34, 1.56, 0.64, 1)`}},{id:`newspaper`,label:`Newspaper`,description:`Serif headlines on a cream card. Calm, editorial vibe.`,swatch:[`#f7eedd`,`#1c1a14`],vars:{"--co-font":`'Merriweather', Georgia, serif`,"--co-font-size":`19px`,"--co-line-height":`1.5`,"--co-text":`#1c1a14`,"--co-text-shadow":`none`,"--co-username-weight":`900`,"--co-username-letter-spacing":`0.02em`,"--co-card-bg":`#f7eedd`,"--co-card-border":`1px solid rgba(0,0,0,0.12)`,"--co-card-shadow":`0 1px 0 rgba(0,0,0,0.05)`,"--co-card-max-width":`min(92%, 760px)`,"--co-radius":`4px`,"--co-padding":`10px 14px`,"--co-message-gap":`8px`,"--co-reply-style":`italic`,"--co-reply-color":`#5b554a`}},{id:`hand-written`,label:`Hand-written`,description:`Casual marker handwriting on a translucent card.`,swatch:[`#fff7c2`,`#3a2a14`],vars:{"--co-font":`'Caveat', 'Comic Sans MS', cursive`,"--co-font-size":`24px`,"--co-line-height":`1.3`,"--co-text":`#3a2a14`,"--co-text-shadow":`none`,"--co-username-weight":`700`,"--co-card-bg":`rgba(255, 247, 194, 0.85)`,"--co-card-border":`1px dashed rgba(58, 42, 20, 0.45)`,"--co-card-shadow":`0 2px 6px rgba(0,0,0,0.18)`,"--co-card-max-width":`min(92%, 640px)`,"--co-radius":`12px`,"--co-padding":`6px 12px`,"--co-message-gap":`6px`}},{id:`minimal-line`,label:`Minimal line`,description:`No card. Tightly packed text, perfect for clean OBS captures.`,swatch:[`#ffffff`,`#222222`],vars:{"--co-font":`'IBM Plex Sans', system-ui, sans-serif`,"--co-font-size":`19px`,"--co-line-height":`1.28`,"--co-text":`#ffffff`,"--co-text-shadow":`0 0 2px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.75)`,"--co-card-bg":`transparent`,"--co-card-border":`0 solid transparent`,"--co-card-shadow":`none`,"--co-card-backdrop":`none`,"--co-card-max-width":`100%`,"--co-radius":`0`,"--co-padding":`2px 0`,"--co-message-gap":`4px`,"--co-enter-translate":`4px`}}];function D(e){if(e)return E.find(t=>t.id===e)}var ee=typeof window<`u`?`${window.location.origin}/ChatOverlay/`:``;function O(){let t=new URLSearchParams(window.location.search),n=t.get(`theme64`),r=n?e(n):null,i=t.get(`base`)||t.get(`baseUrl`)||``,a=ee.replace(/\/customise\/?$/,`/`).replace(/\/$/,``)+`/chat/`;return{baseUrl:i||a,channel:t.get(`channel`)||`PerryLK`,theme:t.get(`theme`)||`comfy`,themePack:r?.meta?.themePack??``,show:{badges:r?.show?.badges??!0,replies:r?.show?.replies??!0,bits:r?.show?.bits??!0,status:r?.show?.status??!1},vars:{...r?.vars??{}},css:r?.css??``}}function k(e){let t=[u(e.vars),e.css.trim()].filter(Boolean).join(`

`)||void 0;return{vars:A(e.vars),css:t,show:{...e.show},meta:{name:e.channel||`overlay`,createdAt:new Date().toISOString(),themePack:e.themePack||void 0}}}function A(e){let t={};for(let[n,r]of Object.entries(e))r&&r.trim()&&(t[n]=r.trim());return t}function j(e){let n=k(e),r=Object.keys(n.vars??{}).length===0&&!n.css&&e.show.badges&&e.show.replies&&e.show.bits&&!e.show.status,i=e.baseUrl||`/`,a=new URL(i,window.location.href);return e.channel&&a.searchParams.set(`channel`,e.channel),e.theme&&e.theme!==`comfy`&&a.searchParams.set(`theme`,e.theme),r||a.searchParams.set(`theme64`,t(n)),a.toString()}function M(e,t){let n={...e.vars,...t.vars};return{...e,themePack:t.id,vars:n}}function N(e){for(let t of E)if(Object.entries(t.vars).every(([t,n])=>e[t]?.trim()===n))return t}var P=[{name:`--co-font`,label:`Font family`,group:`message`,type:`font`,description:`Applies to all chat text. Google Fonts presets are auto-imported into the exported theme.`,presets:c.map(e=>({id:`font-${e.id}`,label:e.label,value:e.family}))},{name:`--co-font-size`,label:`Font size`,group:`message`,type:`length`,presets:[{id:`xs`,label:`Tight (16px)`,value:`16px`},{id:`sm`,label:`Small (18px)`,value:`18px`},{id:`md`,label:`Medium (20px)`,value:`20px`},{id:`lg`,label:`Large (24px)`,value:`24px`},{id:`xl`,label:`Huge (28px)`,value:`28px`}]},{name:`--co-font-weight`,label:`Font weight`,group:`message`,type:`number`,presets:[{id:`light`,label:`Light (300)`,value:`300`},{id:`regular`,label:`Regular (400)`,value:`400`},{id:`medium`,label:`Medium (500)`,value:`500`},{id:`bold`,label:`Bold (700)`,value:`700`},{id:`black`,label:`Black (900)`,value:`900`}]},{name:`--co-line-height`,label:`Line height`,group:`message`,type:`number`,presets:[{id:`snug`,label:`Snug (1.2)`,value:`1.2`},{id:`normal`,label:`Normal (1.35)`,value:`1.35`},{id:`roomy`,label:`Roomy (1.55)`,value:`1.55`}]},{name:`--co-letter-spacing`,label:`Letter spacing`,group:`message`,type:`length`,presets:[{id:`tight`,label:`Tight (-0.02em)`,value:`-0.02em`},{id:`normal`,label:`Normal`,value:`normal`},{id:`wide`,label:`Wide (0.04em)`,value:`0.04em`},{id:`extra-wide`,label:`Extra wide (0.1em)`,value:`0.1em`}]},{name:`--co-text`,label:`Text colour`,group:`message`,type:`color`,presets:[{id:`white`,label:`White`,value:`#ffffff`},{id:`cream`,label:`Cream`,value:`#f7eedd`},{id:`lemon`,label:`Lemon`,value:`#fff2a1`},{id:`sky`,label:`Sky blue`,value:`#cfe6ff`},{id:`mint`,label:`Mint`,value:`#c5f0d6`},{id:`ink`,label:`Ink`,value:`#0c1224`}]},{name:`--co-text-shadow`,label:`Text shadow`,group:`message`,type:`shadow`,presets:[{id:`soft`,label:`Soft outline`,value:`0 0 2px #000, 0 0 4px #000, 1px 1px 2px #000`},{id:`hard`,label:`Hard outline`,value:`-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`},{id:`neon-cyan`,label:`Neon cyan glow`,value:`0 0 6px #00e5ff, 0 0 14px #00e5ff`},{id:`neon-magenta`,label:`Neon magenta glow`,value:`0 0 6px #ff3df0, 0 0 14px #ff3df0`},{id:`paper`,label:`Paper (none)`,value:`none`}]},{name:`--co-username-weight`,label:`Username weight`,group:`username`,type:`number`,presets:[{id:`regular`,label:`Regular (400)`,value:`400`},{id:`semibold`,label:`Semibold (600)`,value:`600`},{id:`bold`,label:`Bold (700)`,value:`700`},{id:`black`,label:`Black (900)`,value:`900`}]},{name:`--co-username-letter-spacing`,label:`Username letter spacing`,group:`username`,type:`length`,presets:[{id:`normal`,label:`Normal`,value:`normal`},{id:`wide`,label:`Wide (0.04em)`,value:`0.04em`},{id:`extra-wide`,label:`Extra wide (0.12em)`,value:`0.12em`}]},{name:`--co-username-transform`,label:`Username case`,group:`username`,type:`select`,presets:[{id:`none`,label:`As-is`,value:`none`},{id:`upper`,label:`UPPERCASE`,value:`uppercase`},{id:`lower`,label:`lowercase`,value:`lowercase`},{id:`small-caps`,label:`Small caps`,value:`small-caps`}]},{name:`--co-badge-size`,label:`Badge size`,group:`badges`,type:`length`,presets:[{id:`sm`,label:`Small (0.9em)`,value:`0.9em`},{id:`md`,label:`Medium (1em)`,value:`1em`},{id:`lg`,label:`Large (1.2em)`,value:`1.2em`}]},{name:`--co-badge-gap`,label:`Badge gap`,group:`badges`,type:`length`,presets:[{id:`tight`,label:`Tight (2px)`,value:`2px`},{id:`normal`,label:`Normal (3px)`,value:`3px`},{id:`wide`,label:`Wide (6px)`,value:`6px`}]},{name:`--co-emote-size`,label:`Emote size`,group:`emote`,type:`length`,presets:[{id:`sm`,label:`Small (1.3em)`,value:`1.3em`},{id:`md`,label:`Medium (1.6em)`,value:`1.6em`},{id:`lg`,label:`Large (2em)`,value:`2em`},{id:`xl`,label:`Huge (2.5em)`,value:`2.5em`}]},{name:`--co-card-bg`,label:`Card background`,group:`card`,type:`background`,description:"Accepts colours, gradients, or `transparent`.",presets:[{id:`none`,label:`None (transparent)`,value:`transparent`},{id:`glass`,label:`Glass`,value:`rgba(20, 28, 48, 0.55)`},{id:`dark`,label:`Dark solid`,value:`rgba(0, 0, 0, 0.78)`},{id:`comic`,label:`Comic yellow`,value:`#fff3a0`},{id:`paper`,label:`Paper cream`,value:`#f7eedd`},{id:`neon-gradient`,label:`Neon gradient`,value:`linear-gradient(135deg, rgba(255,61,240,0.32), rgba(0,229,255,0.32))`},{id:`sleek-gradient`,label:`Sleek gradient`,value:`linear-gradient(180deg, rgba(25, 34, 58, 0.78), rgba(14, 20, 36, 0.66))`}]},{name:`--co-card-border`,label:`Card border`,group:`card`,type:`border`,description:`CSS shorthand: width style colour.`,presets:[{id:`none`,label:`None`,value:`0 solid transparent`},{id:`hairline`,label:`Hairline`,value:`1px solid rgba(255,255,255,0.18)`},{id:`glass`,label:`Glass edge`,value:`1px solid rgba(194,219,255,0.16)`},{id:`comic`,label:`Comic ink`,value:`3px solid #111`},{id:`neon-cyan`,label:`Neon cyan`,value:`1px solid #00e5ff`},{id:`neon-magenta`,label:`Neon magenta`,value:`1px solid #ff3df0`}]},{name:`--co-card-shadow`,label:`Card shadow`,group:`card`,type:`shadow`,presets:[{id:`none`,label:`None`,value:`none`},{id:`soft`,label:`Soft drop`,value:`0 8px 20px rgba(0,0,0,0.28)`},{id:`inset`,label:`Inset highlight`,value:`inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 24px rgba(0,0,0,0.28)`},{id:`comic`,label:`Comic offset`,value:`4px 4px 0 #111`},{id:`neon`,label:`Neon glow`,value:`0 0 14px rgba(0,229,255,0.55), 0 0 28px rgba(255,61,240,0.35)`}]},{name:`--co-card-backdrop`,label:`Card backdrop blur`,group:`card`,type:`select`,description:"CSS `backdrop-filter`. Requires a translucent card background to be visible.",presets:[{id:`none`,label:`None`,value:`none`},{id:`soft`,label:`Soft (blur 6px)`,value:`blur(6px)`},{id:`glass`,label:`Glass (blur 12px)`,value:`blur(12px) saturate(120%)`},{id:`heavy`,label:`Heavy (blur 20px)`,value:`blur(20px) saturate(140%)`}]},{name:`--co-radius`,label:`Card radius`,group:`card`,type:`length`,presets:[{id:`square`,label:`Square (0)`,value:`0`},{id:`small`,label:`Small (6px)`,value:`6px`},{id:`medium`,label:`Medium (12px)`,value:`12px`},{id:`large`,label:`Large (20px)`,value:`20px`},{id:`pill`,label:`Pill (999px)`,value:`999px`}]},{name:`--co-padding`,label:`Card padding`,group:`card`,type:`text`,presets:[{id:`tight`,label:`Tight (2px 6px)`,value:`2px 6px`},{id:`cozy`,label:`Cozy (6px 10px)`,value:`6px 10px`},{id:`roomy`,label:`Roomy (10px 14px)`,value:`10px 14px`},{id:`spacious`,label:`Spacious (14px 18px)`,value:`14px 18px`}]},{name:`--co-card-max-width`,label:`Card max width`,group:`card`,type:`length`,presets:[{id:`full`,label:`Full width`,value:`100%`},{id:`compact`,label:`Compact (560px)`,value:`min(92%, 560px)`},{id:`wide`,label:`Wide (760px)`,value:`min(92%, 760px)`}]},{name:`--co-message-gap`,label:`Gap between messages`,group:`card`,type:`length`,presets:[{id:`tight`,label:`Tight (2px)`,value:`2px`},{id:`normal`,label:`Normal (6px)`,value:`6px`},{id:`roomy`,label:`Roomy (12px)`,value:`12px`}]},{name:`--co-chat-padding`,label:`Chat padding`,group:`layout`,type:`length`,presets:[{id:`tight`,label:`Tight (4px)`,value:`4px`},{id:`normal`,label:`Normal (12px)`,value:`12px`},{id:`roomy`,label:`Roomy (24px)`,value:`24px`}]},{name:`--co-chat-align`,label:`Chat alignment`,group:`layout`,type:`select`,presets:[{id:`bottom`,label:`Bottom up`,value:`flex-end`},{id:`top`,label:`Top down`,value:`flex-start`},{id:`center`,label:`Centered`,value:`center`}]},{name:`--co-reply-opacity`,label:`Reply line opacity`,group:`reply`,type:`number`,presets:[{id:`faint`,label:`Faint (0.45)`,value:`0.45`},{id:`soft`,label:`Soft (0.75)`,value:`0.75`},{id:`full`,label:`Full (1)`,value:`1`}]},{name:`--co-reply-style`,label:`Reply style`,group:`reply`,type:`select`,presets:[{id:`normal`,label:`Normal`,value:`normal`},{id:`italic`,label:`Italic`,value:`italic`}]},{name:`--co-reply-color`,label:`Reply colour`,group:`reply`,type:`color`,presets:[{id:`inherit`,label:`Inherit`,value:`inherit`},{id:`cool`,label:`Cool blue`,value:`#d4e4ff`},{id:`muted`,label:`Muted grey`,value:`#a8a8a8`}]},{name:`--co-fade-duration`,label:`Fade duration`,group:`animation`,type:`length`,presets:[{id:`fast`,label:`Fast (200ms)`,value:`200ms`},{id:`normal`,label:`Normal (400ms)`,value:`400ms`},{id:`slow`,label:`Slow (800ms)`,value:`800ms`}]},{name:`--co-enter-duration`,label:`Enter duration`,group:`animation`,type:`length`,presets:[{id:`snap`,label:`Snap (120ms)`,value:`120ms`},{id:`normal`,label:`Normal (220ms)`,value:`220ms`},{id:`lazy`,label:`Lazy (420ms)`,value:`420ms`}]},{name:`--co-enter-translate`,label:`Enter translate`,group:`animation`,type:`length`,description:`How far new messages slide in from.`,presets:[{id:`none`,label:`None (0)`,value:`0px`},{id:`small`,label:`Small (6px)`,value:`6px`},{id:`big`,label:`Big (16px)`,value:`16px`}]},{name:`--co-enter-easing`,label:`Enter easing`,group:`animation`,type:`select`,presets:[{id:`ease-out`,label:`Ease-out`,value:`ease-out`},{id:`linear`,label:`Linear`,value:`linear`},{id:`snappy`,label:`Snappy`,value:`cubic-bezier(0.2, 0.8, 0.2, 1)`},{id:`bouncy`,label:`Bouncy`,value:`cubic-bezier(0.34, 1.56, 0.64, 1)`}]}],F={message:`Message text`,username:`Username`,badges:`Badges`,emote:`Emotes`,card:`Message card`,reply:`Replies`,animation:`Animation`,layout:`Layout`};function I(e,t){if(!e.presets)return;let n=t.trim();return e.presets.find(e=>e.value.trim()===n)}function L(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Customise: missing element ${e}`);return n}function R(e,t){let n=document.querySelector(e);if(!n)return;let r=n.textContent;n.textContent=t,setTimeout(()=>{n.textContent=r},1200)}function z(e){let t=e.trim();return/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)?t.length===4?`#`+t.slice(1).split(``).map(e=>e+e).join(``).toLowerCase():t.toLowerCase():null}var B=`__custom__`,V=`__reset__`;function H({def:e,value:t,onChange:n}){let r=document.createElement(`label`);r.className=`cu__var`;let i=document.createElement(`span`);if(i.className=`cu__var-header`,i.innerHTML=`<span class="cu__var-label">${e.label}</span><code class="cu__var-name">${e.name}</code>`,r.appendChild(i),e.description){let t=document.createElement(`span`);t.className=`cu__var-help`,t.textContent=e.description,r.appendChild(t)}let a=document.createElement(`div`);a.className=`cu__var-controls`,r.appendChild(a);let o=document.createElement(`select`);o.className=`cu__var-select`,o.dataset.varSelect=e.name,U(o,e.presets??[]),a.appendChild(o);let s=null;e.type===`color`&&(s=document.createElement(`input`),s.type=`color`,s.className=`cu__var-color`,a.appendChild(s));let c=document.createElement(`input`);c.type=`text`,c.className=`cu__var-input`,c.dataset.var=e.name,c.placeholder=G(e.type),a.appendChild(c);let l=t=>{if(c.value=t,s){let e=z(t);e&&(s.value=e)}o.value=W(e,t)};return l(t),o.addEventListener(`change`,()=>{let t=o.value;if(t===V){l(``),n(``);return}if(t===B){c.focus();return}let r=e.presets?.find(e=>e.id===t);r&&(l(r.value),n(r.value))}),c.addEventListener(`input`,()=>{let t=c.value;if(o.value=W(e,t),s){let e=z(t);e&&(s.value=e)}n(t)}),s&&s.addEventListener(`input`,()=>{c.value=s.value,c.dispatchEvent(new Event(`input`,{bubbles:!0}))}),{element:r,setValue:l}}function U(e,t){let n=document.createElement(`option`);n.value=V,n.textContent=`— use overlay default —`,e.appendChild(n);for(let n of t){let t=document.createElement(`option`);t.value=n.id,t.textContent=n.label,e.appendChild(t)}let r=document.createElement(`option`);r.value=B,r.textContent=`Custom value…`,e.appendChild(r)}function W(e,t){if(!t.trim())return V;let n=I(e,t);return n?n.id:B}function G(e){switch(e){case`length`:return`e.g. 22px / 1.6em`;case`number`:return`e.g. 700`;case`color`:return`#fff, rgba(...) or named`;case`font`:return`'Inter', sans-serif`;case`shadow`:return`0 0 6px #000`;case`background`:return`transparent / colour / gradient`;case`border`:return`1px solid #fff`;case`select`:return`CSS value`;default:return`CSS value`}}function K({mount:e,groupMounts:t,getValue:n,onVariableChange:r}){e.replaceChildren();for(let e of Object.values(t??{}))e?.replaceChildren();let i=new Map,a=q(P,e=>e.group);for(let[o,s]of a){let a=document.createElement(`fieldset`);a.className=`cu__vars`,a.dataset.group=o;let c=document.createElement(`legend`);c.textContent=F[o]??o,a.appendChild(c);for(let e of s){let t=H({def:e,value:n(e.name),onChange:t=>r(e.name,t)});a.appendChild(t.element),i.set(e.name,t)}(t?.[o]??e).appendChild(a)}return{refresh(){for(let[e,t]of i)t.setValue(n(e))}}}function q(e,t){let n=new Map;for(let r of e){let e=t(r),i=n.get(e);i?i.push(r):n.set(e,[r])}return n}function J({mount:e,onPick:t}){e.replaceChildren(),e.classList.add(`cu__pack-grid`);let n=new Map;for(let r of E){let i=document.createElement(`button`);i.type=`button`,i.className=`cu__pack`,i.dataset.packId=r.id,i.innerHTML=`
      <span class="cu__pack-swatch" style="background: linear-gradient(135deg, ${r.swatch[0]}, ${r.swatch[1]})" aria-hidden="true"></span>
      <span class="cu__pack-body">
        <span class="cu__pack-label">${r.label}</span>
        <span class="cu__pack-desc">${r.description}</span>
      </span>
    `,i.addEventListener(`click`,()=>t(r)),e.appendChild(i),n.set(r.id,i)}return{highlight(e){for(let[t,r]of n)r.classList.toggle(`cu__pack--active`,t===e)}}}var Y=O(),X=J({mount:L(`#cu-theme-packs`),onPick:e=>{Object.assign(Y,M(Y,e)),Z.refresh(),X.highlight(Y.themePack),$()}}),Z=K({mount:L(`#cu-vars-style`),groupMounts:{message:L(`#cu-vars-text`),username:L(`#cu-vars-text`),badges:L(`#cu-vars-style`),emote:L(`#cu-vars-style`),card:L(`#cu-vars-style`),reply:L(`#cu-vars-style`),animation:L(`#cu-vars-style`),layout:L(`#cu-vars-style`)},getValue:e=>Y.vars[e]??``,onVariableChange:(e,t)=>{t.trim()?Y.vars[e]=t.trim():delete Y.vars[e],Y.themePack=``,X.highlight(null),$()}});L(`#cu-baseUrl`).value=Y.baseUrl,L(`#cu-channel`).value=Y.channel,L(`#cu-theme`).value=Y.theme,L(`#cu-showBadges`).checked=Y.show.badges,L(`#cu-showReplies`).checked=Y.show.replies,L(`#cu-showBits`).checked=Y.show.bits,L(`#cu-showStatus`).checked=Y.show.status,L(`#cu-css`).value=Y.css,re();var Q=Y.themePack?D(Y.themePack):N(Y.vars);Q&&(Y.themePack=Q.id,X.highlight(Q.id)),document.getElementById(`cu-form`).addEventListener(`input`,e=>{e.target?.closest(`.cu__var`)||(te(),$())}),L(`#cu-copy`).addEventListener(`click`,async()=>{let e=L(`#cu-output`).value;try{await navigator.clipboard.writeText(e),R(`#cu-copy`,`Copied!`)}catch{L(`#cu-output`).select(),document.execCommand(`copy`),R(`#cu-copy`,`Copied!`)}}),L(`#cu-open`).addEventListener(`click`,()=>{let e=L(`#cu-output`).value;e&&window.open(e,`_blank`,`noopener`)}),L(`#cu-export`).addEventListener(`click`,()=>{let e=new Blob([JSON.stringify(k(Y),null,2)],{type:`application/json`}),t=document.createElement(`a`);t.href=URL.createObjectURL(e),t.download=`chat-overlay-theme.json`,t.click(),URL.revokeObjectURL(t.href)}),L(`#cu-import`).addEventListener(`click`,()=>{L(`#cu-import-file`).click()}),L(`#cu-import-file`).addEventListener(`change`,async e=>{let t=e.target,n=t.files?.[0];if(n)try{let e=await n.text(),t=JSON.parse(e);Y.vars={...Y.vars,...t.vars??{}},t.css&&(Y.css=t.css),t.show&&(Y.show={...Y.show,...t.show}),t.meta?.themePack&&(Y.themePack=t.meta.themePack),Z.refresh(),L(`#cu-css`).value=Y.css,ne(),X.highlight(Y.themePack||null),$()}catch(e){alert(`Could not import theme: ${e.message}`)}finally{t.value=``}}),L(`#cu-reset`).addEventListener(`click`,()=>{confirm(`Clear every customisation and start from defaults?`)&&(Y.vars={},Y.css=``,Y.themePack=``,L(`#cu-css`).value=``,Z.refresh(),X.highlight(null),$())}),$();function te(){Y.baseUrl=L(`#cu-baseUrl`).value.trim(),Y.channel=L(`#cu-channel`).value.trim(),Y.theme=L(`#cu-theme`).value,Y.show.badges=L(`#cu-showBadges`).checked,Y.show.replies=L(`#cu-showReplies`).checked,Y.show.bits=L(`#cu-showBits`).checked,Y.show.status=L(`#cu-showStatus`).checked,Y.css=L(`#cu-css`).value}function ne(){L(`#cu-showBadges`).checked=Y.show.badges,L(`#cu-showReplies`).checked=Y.show.replies,L(`#cu-showBits`).checked=Y.show.bits,L(`#cu-showStatus`).checked=Y.show.status}function $(){let e=j(Y),t=k(Y);L(`#cu-output`).value=e,L(`#cu-json`).textContent=JSON.stringify(t,null,2),p(L(`#cu-preview`),t,Y.theme,Y.channel,Y.baseUrl)}function re(){let e=[...document.querySelectorAll(`[data-tab]`)],t=[...document.querySelectorAll(`[data-tab-panel]`)];if(!e.length||!t.length)return;let n=n=>{for(let t of e){let e=t.dataset.tab===n;t.classList.toggle(`is-active`,e),t.setAttribute(`aria-selected`,String(e)),t.tabIndex=e?0:-1}for(let e of t){let t=e.dataset.tabPanel===n;e.classList.toggle(`is-active`,t),e.hidden=!t}};e.forEach((t,r)=>{t.addEventListener(`click`,()=>n(t.dataset.tab||``)),t.addEventListener(`keydown`,t=>{if(t.key!==`ArrowRight`&&t.key!==`ArrowLeft`)return;t.preventDefault();let i=e[(r+(t.key===`ArrowRight`?1:-1)+e.length)%e.length];i.focus(),n(i.dataset.tab||``)})}),n(e[0]?.dataset.tab||`setup`)}