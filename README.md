# Discord Quest MCP Server

Server Model Context Protocol (MCP) untuk otomatisasi Discord Desktop Quests melalui Chrome DevTools Protocol (CDP) dengan struktur modular terisolasi.

---

## Arsitektur

```text
discord-quest-mcp/
├── src/
│   ├── client/          # Lapisan infrastruktur: CDP WebSocket client
│   │   └── cdpClient.ts
│   ├── config/          # Konfigurasi dan konstanta server
│   │   └── constants.ts
│   ├── scripts/         # Skrip runtime in-memory (ekstraksi Webpack dan spoofing)
│   │   ├── bootstrap.ts
│   │   └── questScripts.ts
│   ├── tools/           # Lapisan aplikasi: Definisi dan handler tool MCP
│   │   └── questTools.ts
│   ├── types/           # Model domain dan kontrak data
│   │   └── index.ts
│   └── index.ts         # Lapisan presentasi: Entrypoint stdio server
├── build/               # Hasil kompilasi JavaScript
├── tsconfig.json
└── package.json
```

---

## Daftar Tools

1. `list_discord_quests`: Mengambil seluruh daftar quest aktif, tipe task, target durasi, dan progres saat ini.
2. `auto_enroll_all_quests`: Menerima (Accept) seluruh quest aktif yang belum diambil dalam satu panggilan.
3. `fast_forward_video_quests`: Mempercepat progres quest video/trailer langsung ke target durasi dan mengeksekusi klaim reward.
4. `auto_complete_all_quests`: Mensimulasikan eksekusi seluruh quest game desktop secara simultan di latar belakang.
5. `spoof_discord_quest`: Menjalankan emulasi proses game untuk satu ID quest tertentu.

---

## Prasyarat Klien Discord

Discord Desktop harus dijalankan dengan port remote debugging aktif:

1. Aktifkan DevTools di `~/.config/discord/settings.json`:
```json
{
  "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true
}
```

2. Jalankan Discord dengan flag debugging:
```bash
discord --remote-debugging-port=9222
```

---

## Instalasi dan Kompilasi

```bash
cd /home/makdumibrohim/Projects/Coba-Coba/discord-quest-mcp
npm install
npm run build
```

---

## Konfigurasi MCP Client

Daftarkan server ke konfigurasi client MCP (misal Hermes atau Claude Desktop):

```json
{
  "mcpServers": {
    "discord-quest": {
      "command": "node",
      "args": [
        "/home/makdumibrohim/Projects/Coba-Coba/discord-quest-mcp/build/index.js"
      ]
    }
  }
}
```
