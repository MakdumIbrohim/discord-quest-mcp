import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { registerTools } from "./tools/questTools.js";
import { DEFAULT_CONFIG } from "./config/constants.js";

const server = new Server(
  {
    name: DEFAULT_CONFIG.SERVER_NAME,
    version: DEFAULT_CONFIG.SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools = registerTools();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = tools.find((t) => t.name === name);

  if (!tool) {
    return {
      isError: true,
      content: [{ type: "text", text: `Tool not found: ${name}` }],
    };
  }

  try {
    const result = await tool.handler(args);
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Execution Error: ${error.message || String(error)}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${DEFAULT_CONFIG.SERVER_NAME} v${DEFAULT_CONFIG.SERVER_VERSION} running on stdio`);
}

main().catch((err) => {
  console.error("Fatal error starting MCP Server:", err);
  process.exit(1);
});
