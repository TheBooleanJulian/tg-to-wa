const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let waClient = null;

function createClient() {
  return new Client({
    authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // Uncomment below if running on a headless VPS without Chromium in PATH:
      // executablePath: '/usr/bin/chromium-browser',
    },
  });
}

/**
 * Initialises the WhatsApp client.
 * Resolves once the client is ready (after QR scan on first run).
 */
function startWhatsApp() {
  return new Promise((resolve, reject) => {
    waClient = createClient();

    waClient.on('qr', qr => {
      console.log('\n📱 Scan the QR code below with WhatsApp (Linked Devices):');
      qrcode.generate(qr, { small: true });
    });

    waClient.on('authenticated', () => {
      console.log('🔐 WhatsApp authenticated');
    });

    waClient.on('ready', () => {
      console.log('✅ WhatsApp client ready');
      resolve();
    });

    waClient.on('auth_failure', msg => {
      console.error('❌ WhatsApp auth failed:', msg);
      reject(new Error(msg));
    });

    waClient.on('disconnected', reason => {
      console.warn('⚠️  WhatsApp disconnected:', reason);
      // Optionally add reconnect logic here
    });

    waClient.initialize();
  });
}

function getWAClient() {
  if (!waClient) throw new Error('WhatsApp client not initialised');
  return waClient;
}

module.exports = { startWhatsApp, getWAClient };
