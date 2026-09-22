<div align="center">

# tg-to-wa

**Auto-forward posts from a Telegram channel to a WhatsApp group — text, photos, videos, GIFs, audio, documents, stickers, and polls.**

![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-AGPLv3%20%2B%20Commercial-00D4C8.svg)

</div>

---

## What it does

tg-to-wa listens to a Telegram channel and mirrors every post into a WhatsApp group in near real time. It's built with [`telegraf`](https://telegraf.js.org/) for the Telegram side and [`whatsapp-web.js`](https://wwebjs.dev/) for the WhatsApp side, so no official WhatsApp Business API access is required — it drives a real WhatsApp Web session headlessly via Puppeteer.

## Features

- Forwards text, photos, videos, GIFs/animations, audio, voice messages, documents, and static stickers
- Formats Telegram polls as readable WhatsApp text
- Animated stickers fall back to a text notice (`.tgs` conversion not implemented)
- QR-code login flow with a persisted session (`.wwebjs_auth/`) so you only scan once
- PM2 config (`ecosystem.config.js`) included for always-on VPS deployment

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js ≥ 18 |
| Telegram | [telegraf](https://telegraf.js.org/) |
| WhatsApp | [whatsapp-web.js](https://wwebjs.dev/) (Puppeteer-driven) |
| QR display | [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) |
| Config | [dotenv](https://github.com/motdotla/dotenv) |
| Process management | PM2 (`ecosystem.config.js`) |

## Screenshots

_Screenshots coming soon._

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/TheBooleanJulian/tg-to-wa.git
cd tg-to-wa
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHANNEL_ID=-100xxxxxxxxxx
WA_GROUP_ID=xxxxxxxxxxx@g.us
```

### 3. Get your Telegram Channel ID

Forward any message from your channel to [@username_to_id_bot](https://t.me/username_to_id_bot) — it will reply with the channel ID (a negative number like `-1001234567890`).

### 4. Get your WhatsApp Group ID

Add this temporary snippet to `src/forwarder.js`, run the bot, then send any message to your WA group. Copy the ID printed to console, then remove the snippet.

```js
// Paste into src/forwarder.js temporarily
wa.on('message', msg => {
  if (msg.from.endsWith('@g.us')) {
    console.log('Group ID:', msg.from);
  }
});
```

### 5. Add your bot as admin

In Telegram, go to your channel → **Edit Channel → Administrators → Add Administrator** → search for your bot.

### 6. Run

```bash
npm start
```

On first run, a QR code will appear in the terminal. Scan it with WhatsApp on your phone (**Linked Devices → Link a Device**). The session is saved in `.wwebjs_auth/` so you only scan once.

### VPS deployment (Hetzner / any Linux VPS)

```bash
sudo apt update
sudo apt install -y chromium-browser   # or: chromium
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed command to enable auto-start on reboot
```

Then uncomment the `executablePath` line in `src/whatsapp.js` and point it at your Chromium install (`which chromium` / `which chromium-browser`).

## Project Structure

```
tg-to-wa/
├── src/
│   ├── index.js        — entry point, wires WA + TG together
│   ├── whatsapp.js     — WhatsApp client init and QR flow
│   ├── telegram.js     — Telegraf bot, channel post listener
│   └── forwarder.js    — forwarding logic for all content types
├── ecosystem.config.js — PM2 config for VPS deployment
├── .env.example        — environment variable template
└── package.json
```

## Status / Roadmap

- [x] Forward text, photos, videos, GIFs, audio, voice, documents, static stickers
- [x] Poll forwarding (formatted as text)
- [x] QR-code login with persisted WhatsApp session
- [x] PM2 deployment config for VPS hosting
- [ ] Animated sticker (`.tgs`) conversion and forwarding
- [ ] Multi-group fan-out (currently documented as a manual code customisation)

## Changelog

- **2026-05-08** — Initial release: Telegram channel → WhatsApp group forwarder supporting text, media, stickers, and polls.

## License

This project is dual licensed.

- Community Edition — [GNU Affero General Public License v3 (AGPLv3)](LICENSE). Free to use, modify, and self-host. If you distribute a modified version or run it as a network service, you must make the corresponding source available.
- Commercial License — for organisations that want to embed, modify, or distribute this software without AGPLv3's obligations. See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).

`whatsapp-web.js` is an unofficial library and is not affiliated with WhatsApp or Meta. Use a dedicated phone number to avoid risk to your primary WhatsApp account.

---

<div align="center">
<sub>Built by <a href="https://github.com/TheBooleanJulian">@TheBooleanJulian</a></sub>
</div>
