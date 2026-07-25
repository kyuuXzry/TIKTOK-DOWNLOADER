/*
 * © Paduka Kyuu
 * WhatsApp : 62856726744
 * Instagram : Rissxzry_
 * Jangan hapus credit, hargai creator
 *
 * Wajib install di terminal bot (Pterodactyl / Termux) sebelum plugin jalan:
 * npm install axios axios-cookiejar-support tough-cookie cheerio
 * Kemudian restart bot.
 */

const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async (m, kyuudev) => {
  const { kyuuai, Reply, text, command, isRegistered, checkLimit, addLimit } = kyuudev;

  if (!["tikdl", "tiktokdl"].includes(command)) return;

  if (!isRegistered(m.sender)) {
    return Reply(global.mess.verifikasi);
  }
  if (checkLimit && checkLimit(m.sender, false, false)) {
    return Reply(global.mess.limit);
  }

  if (!text) {
    return Reply(`Contoh: .${command} https://vt.tiktok.com/ZSXTjomdp/`);
  }

  if (!/https?:\/\/(www\.)?(tiktok|vt\.tiktok|vm\.tiktok)\.com\/\S+/i.test(text)) {
    return Reply('❌ Link TikTok tidak valid.');
  }

  await kyuuai.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  Reply('⏳ Mengambil video dari TikTok...');

  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));

  try {
    let ttToken = null;
    let debugValue = null;

    try {
      const homeRes = await client.get('https://ssstik.io/id', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
        }
      });

      const html = homeRes.data;
      const $ = cheerio.load(html);

      $('script').each((i, el) => {
        const content = $(el).html();
        if (!content) return;
        const ttMatch = content.match(/tt\s*:\s*['"]([^'"]+)['"]/);
        if (ttMatch) ttToken = ttMatch[1];
        const debugMatch = content.match(/debug\s*:\s*['"]([^'"]+)/);
        if (debugMatch) debugValue = debugMatch[1];
      });

      if (!ttToken) ttToken = $('input[name="tt"]').val();
      if (!debugValue) debugValue = $('input[name="debug"]').val();

      if (!ttToken) {
        try {
          const fileHtml = fs.readFileSync('ssstik_debug.html', 'utf8');
          const fileMatch = fileHtml.match(/tt\s*:\s*['"]([^'"]+)['"]/);
          if (fileMatch) ttToken = fileMatch[1];
          const debugFileMatch = fileHtml.match(/debug\s*:\s*['"]([^'"]+)/);
          if (debugFileMatch) debugValue = debugFileMatch[1];
        } catch (e) {}
      }
    } catch (e) {}

    if (!ttToken) ttToken = 'ZTZmMjU4';
    if (!debugValue) debugValue = 'ab=1&loc=ID';

    const payload = new URLSearchParams();
    payload.append('id', text);
    payload.append('locale', 'id');
    payload.append('tt', ttToken);
    payload.append('debug', debugValue);

    const postRes = await client.post('https://ssstik.io/abc?url=dl', payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://ssstik.io/id',
        'Origin': 'https://ssstik.io'
      }
    });

    const data = postRes.data;
    const $2 = cheerio.load(data);

    let videoUrl = null;
    $2('a').each((i, el) => {
      const text = $2(el).text().trim();
      const href = $2(el).attr('href');
      if (text === 'Tanpa tanda air' && href) {
        videoUrl = href;
        return false;
      }
    });

    if (!videoUrl) {
      return Reply('❌ Link video tidak ditemukan.');
    }

    const videoRes = await client.get(videoUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://ssstik.io/'
      }
    });

    const bufferVideo = Buffer.from(videoRes.data);
    const tmpDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const outPath = path.join(tmpDir, `tt_${Date.now()}.mp4`);
    fs.writeFileSync(outPath, bufferVideo);

    await kyuuai.sendMessage(m.chat, {
      video: bufferVideo,
      fileName: `tiktok_${Date.now()}.mp4`,
      mimetype: 'video/mp4',
      caption: '✅ Video berhasil diunduh!'
    }, { quoted: m });

    await kyuuai.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    if (addLimit) addLimit(m.sender, false, false);

  } catch (err) {
    console.error('[TIKDL ERROR]', err);
    await kyuuai.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    Reply(`❌ Gagal: ${err.message}`);
  }
};

module.exports.command = ['tikdl', 'tiktokdl'];
module.exports.tags = ['downloader'];
module.exports.help = ['tikdl <link tiktok>'];