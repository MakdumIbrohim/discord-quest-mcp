import { CdpClient } from "../client/cdpClient.js";
import { ToolDefinition } from "../types/index.js";
import {
  LIST_QUESTS_SCRIPT,
  generateSpoofScript,
  AUTO_COMPLETE_ALL_SCRIPT,
  FAST_FORWARD_VIDEOS_SCRIPT,
  AUTO_ENROLL_ALL_SCRIPT,
} from "../scripts/questScripts.js";

export function registerTools(): ToolDefinition[] {
  return [
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
      handler: async (args) => {
        const client = new CdpClient(args?.port);
        return await client.evaluate(LIST_QUESTS_SCRIPT);
      },
    },
    {
      name: "spoof_discord_quest",
      description: "Spoof and auto-simulate game/app execution in background for a specified Discord quest ID.",
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The ID of the quest to spoof",
          },
          port: {
            type: "number",
            description: "Discord remote debugging port (default: 9222)",
          },
        },
        required: ["questId"],
      },
      handler: async (args) => {
        if (!args?.questId) throw new Error("Missing required parameter: questId");
        const client = new CdpClient(args?.port);
        return await client.evaluate(generateSpoofScript(args.questId));
      },
    },
    {
      name: "auto_complete_all_quests",
      description: "Automatically simulate and advance ALL enrolled desktop quests simultaneously in the background.",
      inputSchema: {
        type: "object",
        properties: {
          port: {
            type: "number",
            description: "Discord remote debugging port (default: 9222)",
          },
        },
      },
      handler: async (args) => {
        const client = new CdpClient(args?.port);
        return await client.evaluate(AUTO_COMPLETE_ALL_SCRIPT);
      },
    },
    {
      name: "fast_forward_video_quests",
      description: "Instantly fast-forward all video quests (watching trailers/streams) in 2-3 seconds and auto-claim rewards.",
      inputSchema: {
        type: "object",
        properties: {
          port: {
            type: "number",
            description: "Discord remote debugging port (default: 9222)",
          },
        },
      },
      handler: async (args) => {
        const client = new CdpClient(args?.port);
        return await client.evaluate(FAST_FORWARD_VIDEOS_SCRIPT);
      },
    },
    {
      name: "auto_enroll_all_quests",
      description: "Automatically enroll into ALL unaccepted active quests at once.",
      inputSchema: {
        type: "object",
        properties: {
          port: {
            type: "number",
            description: "Discord remote debugging port (default: 9222)",
          },
        },
      },
      handler: async (args) => {
        const client = new CdpClient(args?.port);
        return await client.evaluate(AUTO_ENROLL_ALL_SCRIPT);
      },
    },
  ];
}
