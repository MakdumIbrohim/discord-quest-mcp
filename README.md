# Discord Quest MCP Server

Server Model Context Protocol (MCP) untuk otomatisasi Discord Desktop Quests via Chrome DevTools Protocol (CDP) dengan arsitektur bersih terisolasi.

---

## 🏗️ Clean Architecture Structure

```text
discord-quest-mcp/
├── src/
│   ├── client/          # Infrastructure layer: CDP WebSocket client
│   │   └── cdpClient.ts
│   ├── config/          # Configuration & constants
│   │   └── constants.ts
│   ├── scripts/         # In-memory runtime scripts (Webpack extraction & spoofing)
│   │   ├── bootstrap.ts
│   │   └── questScripts.ts
│   ├── tools/           # Application layer: MCP tool definitions & handlers
│   │   └── questTools.ts
│   ├── types/           # Domain models, request/response contracts
│   │   └── index.ts
│   └── index.ts         # Presentation layer: Entrypoint stdio server
├── build/               # Compiled JavaScript artifacts
├── tsconfig.json
└── package.json
```

---

## 🛠️ Tools Tersedia untuk AI

1. **`list_discord_quests`**: Menampilkan seluruh quest aktif, tipe task, target detik, dan progres terkini.
2. **`auto_enroll_all_quests`**: Meng-enroll (Accept) semua quest baru yang belum diambil secara otomatis.
3. **`fast_forward_video_quests`**: Menyelesaikan semua quest video/trailer dan klaim reward dalam hitungan detik.
4. **`auto_complete_all_quests`**: Menjalankan seluruh quest game PC desktop secara bersamaan di latar belakang.
5. **`spoof_discord_quest`**: Menjalankan simulasi spesifik untuk satu quest ID tertentu.

---

## 🚀 Penggunaan

### 1. Build
```bash
cd /home/makdumibrohim/Projects/Coba-Coba/discord-quest-mcp
npm install
npm run build
```

### 2. Konfigurasi Client MCP (Hermes / Claude)
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
