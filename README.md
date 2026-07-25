# TikDL - TikTok Downloader Plugin for WhatsApp Bot

Plugin ini memungkinkan bot WhatsApp (berbasis `@whiskeysockets/baileys`) untuk mendownload video TikTok tanpa watermark menggunakan layanan [ssstik.io](https://ssstik.io).

---

## ✨ Fitur
- Mendownload video TikTok dari link `vt.tiktok.com`, `vm.tiktok.com`, atau `tiktok.com`.
- Menggunakan metode **CookieJar** untuk menjaga sesi dan menghindari error 0 KB.
- **Anti-blokir** dengan token hardcode cadangan (`tt` dan `debug`) jika halaman berubah.
- Terintegrasi dengan **limit harian** dan **registrasi user** bawaan bot.

---

## 📦 Persyaratan
- Bot WhatsApp menggunakan **CommonJS ESM** dan **Baileys**.
- Node.js versi **16+**.

---

## 🔧 Instalasi

1. **Copy** file `tikdl.js` ke folder `plugins` bot Anda.
2. **Install** dependensi yang diperlukan (jalankan di terminal/console bot):
   ```bash
   npm install axios axios-cookiejar-support tough-cookie cheerio
