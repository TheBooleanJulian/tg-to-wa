const { MessageMedia } = require('whatsapp-web.js');

const WA_GROUP_ID = process.env.WA_GROUP_ID; // e.g. xxxxxxxxxxx@g.us

/**
 * Builds the WA header from the channel title.
 */
function header(title) {
  return `📢 *${title}*`;
}

/**
 * Downloads a Telegram file and converts it to WA MessageMedia.
 * @param {import('telegraf').Context} ctx
 * @param {string} fileId
 * @param {string} mimeType  e.g. 'image/jpeg'
 * @param {string} filename
 * @returns {Promise<import('whatsapp-web.js').MessageMedia>}
 */
async function tgFileToMedia(ctx, fileId, mimeType, filename) {
  const fileLink = await ctx.telegram.getFileLink(fileId);
  return MessageMedia.fromUrl(fileLink.href, { unsafeMime: true, filename });
}

/**
 * Main dispatcher — handles all post types.
 * @param {import('telegraf').Context} ctx
 * @param {object} post  ctx.channelPost
 * @param {string} channelTitle
 * @param {import('whatsapp-web.js').Client} wa
 */
async function forwardMessage(ctx, post, channelTitle, wa) {
  const caption = post.caption || '';
  const tag = header(channelTitle);

  // ── Text ────────────────────────────────────────────────────────────────────
  if (post.text) {
    await wa.sendMessage(WA_GROUP_ID, `${tag}\n\n${post.text}`);
    log('text', post.text);
    return;
  }

  // ── Photo ───────────────────────────────────────────────────────────────────
  if (post.photo) {
    const photo = post.photo[post.photo.length - 1]; // largest size
    const media = await tgFileToMedia(ctx, photo.file_id, 'image/jpeg', 'photo.jpg');
    await wa.sendMessage(WA_GROUP_ID, media, {
      caption: caption ? `${tag}\n\n${caption}` : tag,
    });
    log('photo', caption);
    return;
  }

  // ── Video ───────────────────────────────────────────────────────────────────
  if (post.video) {
    const { file_id, mime_type, file_name } = post.video;
    const media = await tgFileToMedia(ctx, file_id, mime_type || 'video/mp4', file_name || 'video.mp4');
    await wa.sendMessage(WA_GROUP_ID, media, {
      caption: caption ? `${tag}\n\n${caption}` : tag,
    });
    log('video', caption);
    return;
  }

  // ── GIF / Animation ─────────────────────────────────────────────────────────
  if (post.animation) {
    const { file_id, mime_type, file_name } = post.animation;
    const media = await tgFileToMedia(ctx, file_id, mime_type || 'video/mp4', file_name || 'animation.mp4');
    await wa.sendMessage(WA_GROUP_ID, media, {
      caption: caption ? `${tag}\n\n${caption}` : tag,
    });
    log('animation', caption);
    return;
  }

  // ── Audio ───────────────────────────────────────────────────────────────────
  if (post.audio) {
    const { file_id, mime_type, file_name } = post.audio;
    const media = await tgFileToMedia(ctx, file_id, mime_type || 'audio/mpeg', file_name || 'audio.mp3');
    await wa.sendMessage(WA_GROUP_ID, media, {
      caption: caption ? `${tag}\n\n${caption}` : tag,
    });
    log('audio', caption);
    return;
  }

  // ── Voice message ───────────────────────────────────────────────────────────
  if (post.voice) {
    const media = await tgFileToMedia(ctx, post.voice.file_id, 'audio/ogg', 'voice.ogg');
    await wa.sendMessage(WA_GROUP_ID, media, { caption: tag });
    log('voice', '');
    return;
  }

  // ── Document / File ─────────────────────────────────────────────────────────
  if (post.document) {
    const { file_id, mime_type, file_name } = post.document;
    const media = await tgFileToMedia(
      ctx,
      file_id,
      mime_type || 'application/octet-stream',
      file_name || 'document'
    );
    await wa.sendMessage(WA_GROUP_ID, media, {
      caption: caption ? `${tag}\n\n${caption}` : tag,
      sendMediaAsDocument: true,
    });
    log('document', file_name);
    return;
  }

  // ── Sticker ─────────────────────────────────────────────────────────────────
  if (post.sticker) {
    const { file_id, is_animated, is_video } = post.sticker;
    if (!is_animated && !is_video) {
      // Static stickers only — animated .tgs not easily convertible
      const media = await tgFileToMedia(ctx, file_id, 'image/webp', 'sticker.webp');
      await wa.sendMessage(WA_GROUP_ID, media, { caption: tag });
      log('sticker', '');
    } else {
      await wa.sendMessage(WA_GROUP_ID, `${tag}\n\n[Animated sticker — not supported]`);
    }
    return;
  }

  // ── Poll ────────────────────────────────────────────────────────────────────
  if (post.poll) {
    const options = post.poll.options.map((o, i) => `  ${i + 1}. ${o.text}`).join('\n');
    await wa.sendMessage(
      WA_GROUP_ID,
      `${tag}\n\n📊 *Poll:* ${post.poll.question}\n${options}`
    );
    log('poll', post.poll.question);
    return;
  }

  // ── Fallback ─────────────────────────────────────────────────────────────────
  console.log('⚠️  Unhandled post type — skipping');
}

function log(type, preview) {
  const short = String(preview || '').slice(0, 60);
  console.log(`→ [${type}] ${short}`);
}

module.exports = { forwardMessage };
