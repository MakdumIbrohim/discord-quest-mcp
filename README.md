# discord-quest-mcp

Model Context Protocol (MCP) server to automate Discord Desktop quests via remote debugging (Chrome DevTools Protocol) without installing games.

Communicates with Discord's Electron runtime via WebSocket, inspects internal stores (`QuestsStore`, `RunningGameStore`, `FluxDispatcher`), and simulates active play status in-memory.

## Tools

- `list_discord_quests`: Lists active, enrolled, and completed quests with task types, progress, and targets.
- `spoof_discord_quest`: Simulates process execution for a specific quest ID in the background. Auto-reverts once target duration is met.
- `auto_complete_all_quests`: Concurrently spoofs all enrolled `PLAY_ON_DESKTOP` quests.

## Prerequisites

Discord Desktop must be launched with remote debugging enabled.

1. Enable DevTools in `~/.config/discord/settings.json`:
```json
{
  "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true
}
```

2. Start Discord with debug port:
```bash
discord --remote-debugging-port=9222
```

## Build

```bash
npm install
npm run build
```

## MCP Client Configuration

Add to your MCP client config (e.g., Claude Desktop, Hermes):

```json
{
  "mcpServers": {
    "discord-quest": {
      "command": "node",
      "args": ["/path/to/discord-quest-mcp/build/index.js"]
    }
  }
}
```
