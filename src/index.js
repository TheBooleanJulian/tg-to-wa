require('dotenv').config();
const { startWhatsApp, getWAClient } = require('./whatsapp');
const { startTelegram } = require('./telegram');

async function main() {
  console.log('🚀 Starting tg-to-wa...');

  // WhatsApp must be ready before Telegram starts forwarding
  await startWhatsApp();

  startTelegram(getWAClient());
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
