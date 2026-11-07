import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { executeInDiscord } from "./cdp.js";
import { LIST_QUESTS_SCRIPT, generateSpoofScript, AUTO_COMPLETE_ALL_SCRIPT } from "./scripts.js";

const server = new Server(
  {
    name: "discord-quest-mcp",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_discord_quests",
        description: "List all active, enrolled, and completed Discord quests with their task types, targets, and progress.",
        inputSchema: {
          type: "object",
          properties: {
            port: {
              type: "number",
              description: "Discord remote debugging port (default: 9222)",
            },
          },
        },
      },
      {
        name: "spoof_discord_quest",
        description: "Spoof and auto-simulate game/app execution in background for a specified Discord quest ID without installing or playing it.",
        inputSchema: {
          type: "object",
          properties: {
            questId: {
              type: "string",
              description: "The ID of the quest to spoof (obtained from list_discord_quests)",
            },
            port: {
              type: "number",
              description: "Discord remote debugging port (default: 9222)",
            },
          },
          required: ["questId"],
        },
      },
      {
        name: "auto_complete_all_quests",
        description: "Automatically simulate and advance ALL enrolled desktop quests at the same time in the background.",
        inputSchema: {
          type: "object",
          properties: {
            port: {
              type: "number",
              description: "Discord remote debugging port (default: 9222)",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const port = (args?.port as number) || 9222;

  try {
    if (name === "list_discord_quests") {
      const result = await executeInDiscord(LIST_QUESTS_SCRIPT, port);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === "spoof_discord_quest") {
      const questId = args?.questId as string;
      if (!questId) {
        throw new Error("Missing required parameter: questId");
      }

      const script = generateSpoofScript(questId);
      const result = await executeInDiscord(script, port);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === "auto_complete_all_quests") {
      const result = await executeInDiscord(AUTO_COMPLETE_ALL_SCRIPT, port);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error: ${error.message || String(error)}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Discord Quest MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
