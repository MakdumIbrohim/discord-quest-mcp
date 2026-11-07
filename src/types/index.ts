export interface DiscordTarget {
  id: string;
  title: string;
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
}

export interface QuestSummary {
  id: string;
  name: string;
  enrolledAt: string | null;
  completedAt: string | null;
  taskName: string;
  targetSeconds: number;
  progressSeconds: number;
  canClaim: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}
