const { Telegraf } = require('telegraf');
const { forwardMessage } = require('./forwarder');

const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // e.g. -100xxxxxxxxxx

/**
 * Starts the Telegram bot and wires up channel_post forwarding.
 * @param {import('whatsapp-web.js').Client} waClient
 */
function startTelegram(waClient) {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  bot.on('channel_post', async ctx => {
    const chatId = String(ctx.chat.id);

    // Guard: only handle posts from your channel
    if (chatId !== CHANNEL_ID) return;

    const post = ctx.channelPost;
    const channelTitle = ctx.chat.title || 'Telegram Channel';

    try {
      await forwardMessage(ctx, post, channelTitle, waClient);
    } catch (err) {
      console.error('Forward failed:', err.message);
    }
  });

  bot.launch();
  console.log('📡 Telegram bot listening...');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = { startTelegram };
