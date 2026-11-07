# Discord Quest MCP Server

Server Model Context Protocol (MCP) untuk mengotomasi penyelesaian misi (Quests) di aplikasi desktop Discord secara otomatis melalui Chrome DevTools Protocol (CDP).

AI dapat melihat daftar quest yang aktif, membaca progres, dan menjalankan simulasi game/software di latar belakang tanpa perlu mendownload atau memainkan gamenya.

---

## 🛠️ Fitur & Tools MCP

1. **`list_discord_quests`**
   - Mengambil seluruh daftar misi dari memori runtime Discord.
   - Menampilkan status: nama quest, tipe task (`PLAY_ON_DESKTOP`, `WATCH_VIDEO`), target durasi, dan progress detik.

2. **`spoof_discord_quest`**
   - Menjalankan spoofing proses Windows di latar belakang Discord via `RunningGameStore` dan `FluxDispatcher`.
   - Menuntaskan durasi misi tanpa perlu menginstal aplikasi aslinya.

---

## 🚀 Prasyarat Discord Desktop

Agar MCP dapat berkomunikasi dengan aplikasi Discord, Discord harus dijalankan dengan remote debugging port aktif.

### 1. Aktifkan DevTools di `~/.config/discord/settings.json`:
```json
{
  "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true
}
```

### 2. Jalankan Discord dengan flag port:
```bash
discord --remote-debugging-port=9222
```

---

## 📦 Build & Instalasi

```bash
cd /home/makdumibrohim/Projects/Coba-Coba/discord-quest-mcp
npm install
npm run build
```

---

## 🤖 Menghubungkan ke AI / MCP Client (Claude / Hermes)

Tambahkan konfigurasi berikut ke MCP config Anda (misal `~/.config/hermes/mcp.json` atau Claude Desktop):

```json
{
  "mcpServers": {
    "discord-quest": {
      "command": "node",
      "args": ["/home/makdumibrohim/Projects/Coba-Coba/discord-quest-mcp/build/index.js"]
    }
  }
}
```
