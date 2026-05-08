# tg-to-wa

Auto-forward posts from a **Telegram channel** to a **WhatsApp group** — text, photos, videos, GIFs, audio, documents, stickers, and polls.

Built with [`telegraf`](https://telegraf.js.org/) + [`whatsapp-web.js`](https://wwebjs.dev/).

---

## Features

| Content type | Forwarded? |
|---|---|
| Text | ✅ |
| Photo (with caption) | ✅ |
| Video (with caption) | ✅ |
| GIF / Animation | ✅ |
| Audio | ✅ |
| Voice message | ✅ |
| Document / File | ✅ |
| Static sticker | ✅ |
| Animated sticker | ⚠️ Fallback text |
| Poll | ✅ (formatted as text) |

---

## Prerequisites

- Node.js ≥ 18
- A Telegram bot token (from [@BotFather](https://t.me/BotFather))
- Your Telegram channel ID
- Your WhatsApp group ID
- Chromium installed (for Puppeteer — see [VPS Deployment](#vps-deployment))

---

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
TELEGRAM_BOT_TOKEN=your_bot_token_here
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

---

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
├── .gitignore
└── package.json
```

---

## VPS Deployment (Hetzner / Any Linux VPS)

### Install Chromium dependencies

```bash
sudo apt update
sudo apt install -y chromium-browser
```

If `chromium-browser` isn't found, try:

```bash
sudo apt install -y chromium
```

Then uncomment the `executablePath` line in `src/whatsapp.js` and update the path to match (`which chromium` or `which chromium-browser`).

### Install PM2 and run

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed command to enable auto-start on reboot
```

### Useful PM2 commands

```bash
pm2 status              # check if running
pm2 logs tg-to-wa       # live logs
pm2 restart tg-to-wa    # restart
pm2 stop tg-to-wa       # stop
```

---

## Customisation

### Change the message header format

Edit the `header()` function in `src/forwarder.js`:

```js
function header(title) {
  return `📢 *${title}*`;  // ← change this
}
```

### Filter specific keywords

In `src/telegram.js`, add a check before forwarding:

```js
bot.on('channel_post', async ctx => {
  const post = ctx.channelPost;
  if (post.text && post.text.includes('#skip')) return; // skip tagged posts
  // ...
});
```

### Forward to multiple WA groups

In `src/forwarder.js`, replace `WA_GROUP_ID` with an array and loop:

```js
const WA_GROUPS = process.env.WA_GROUP_IDS.split(',');

for (const groupId of WA_GROUPS) {
  await wa.sendMessage(groupId, ...);
}
```

And update `.env`:

```env
WA_GROUP_IDS=group1@g.us,group2@g.us
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| QR code won't scan | Delete `.wwebjs_auth/` and restart to regenerate |
| WhatsApp disconnects | Reconnect in WhatsApp → Linked Devices; restart the bot |
| Bot not receiving TG posts | Confirm bot is an admin of the channel |
| `Session closed` Puppeteer error | Install missing Chromium deps: `apt install -y libgbm1 libasound2` |
| Large files fail | Telegram limits file downloads to 20MB via bot API — larger files silently fail |
| Animated stickers not forwarded | `.tgs` format requires conversion; not currently implemented |

---

## Tech Stack

- [telegraf](https://telegraf.js.org/) — Telegram bot framework
- [whatsapp-web.js](https://wwebjs.dev/) — WhatsApp Web automation
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) — terminal QR rendering
- [dotenv](https://github.com/motdotla/dotenv) — env config

---

## Disclaimer

`whatsapp-web.js` is an unofficial library and is not affiliated with WhatsApp or Meta. Use a dedicated phone number to avoid risk to your primary WhatsApp account.
