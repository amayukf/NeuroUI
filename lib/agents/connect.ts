import { runAgent, type AgentRunArgs, type AgentRunResult } from "./runner";

function buildConnectPrompt(): string {
  return [
    "You are the Connect agent in the NeuroUI pipeline.",
    "The Generate agent already wrote src/App.tsx with inline mock data. Your job is to make that data feel real.",
    "",
    "Tasks:",
    "  1. Read src/App.tsx and any files under src/components/.",
    "  2. Read spec.json to understand the canonical dataShape.",
    "  3. Expand or replace placeholder mock data so it looks plausible and varied:",
    "     - Real-sounding names, dates within the last 90 days, varied amounts, realistic categories.",
    "     - At least 5-8 rows for list-style data, fewer for cards.",
    "  4. If the file does NOT have a clear MOCK_DATA / mockX constant block, do nothing.",
    "  5. Do not change layout, styles, or component structure. Only mock data and helper constants.",
    "  6. Keep the file under 250 lines.",
    "",
    "After editing, reply with a one-sentence summary of what you changed.",
  ].join("\n");
}

export async function runConnectAgent(
  args: AgentRunArgs
): Promise<AgentRunResult> {
  return runAgent("connect", buildConnectPrompt(), {
    ...args,
    timeoutMs: args.timeoutMs ?? 40_000,
  });
}
