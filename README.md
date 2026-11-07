# Discord Quest MCP Server

Model Context Protocol (MCP) server for automating Discord Desktop quests via Chrome DevTools Protocol (CDP) using a clean, modular architecture.

---

## Architecture

```text
discord-quest-mcp/
├── src/
│   ├── client/          # Infrastructure layer: CDP WebSocket client
│   │   └── cdpClient.ts
│   ├── config/          # Server configuration and constants
│   │   └── constants.ts
│   ├── scripts/         # In-memory runtime scripts (Webpack extraction and spoofing)
│   │   ├── bootstrap.ts
│   │   └── questScripts.ts
│   ├── tools/           # Application layer: MCP tool definitions and handlers
│   │   └── questTools.ts
│   ├── types/           # Domain models and data contracts
│   │   └── index.ts
│   └── index.ts         # Presentation layer: stdio server entrypoint
├── build/               # Compiled JavaScript artifacts
├── tsconfig.json
└── package.json
```

---

## Tools

1. `list_discord_quests`: Retrieves all active quests, task types, target duration, and current progress.
2. `auto_enroll_all_quests`: Enrolls into all available, unaccepted active quests in a single call.
3. `fast_forward_video_quests`: Instantly fast-forwards all video/stream quests to their target duration and triggers reward claims.
4. `auto_complete_all_quests`: Simulates running processes for all active desktop game quests simultaneously in the background.
5. `spoof_discord_quest`: Emulates process execution for a specific quest ID.

---

## Discord Client Prerequisites

Discord Desktop must be running with remote debugging enabled:

1. Enable DevTools in `~/.config/discord/settings.json`:
```json
{
  "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true
}
```

2. Start Discord with the remote debugging flag:
```bash
discord --remote-debugging-port=9222
```

---

## Installation and Build

```bash
git clone <repository-url>
cd discord-quest-mcp
npm install
npm run build
```

---

## MCP Client Configuration

Register the server in your MCP client configuration (such as Hermes or Claude Desktop):

```json
{
  "mcpServers": {
    "discord-quest": {
      "command": "node",
      "args": [
        "/path/to/discord-quest-mcp/build/index.js"
      ]
    }
  }
}
```
