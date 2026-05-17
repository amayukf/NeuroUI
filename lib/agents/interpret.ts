import { runAgent, type AgentRunArgs, type AgentRunResult } from "./runner";

export interface InterpretInput {
  userPrompt: string;
}

function buildInterpretPrompt(input: InterpretInput): string {
  return [
    "You are the Interpret agent in the NeuroUI pipeline.",
    "Your only job is to convert the user's natural-language request into a precise component spec.",
    "",
    `User request: "${input.userPrompt}"`,
    "",
    "Write a single file to the current working directory at exactly: spec.json",
    "",
    "spec.json MUST be valid JSON with this shape:",
    "{",
    '  "componentName": string,            // PascalCase, e.g. "FinancialDashboard"',
    '  "componentType": string,            // "dashboard" | "form" | "card" | "table" | "landing" | "settings" | "list" | ...',
    '  "summary": string,                  // 1 sentence elevator pitch',
    '  "sections": [                       // top-level layout regions',
    '    { "id": string, "title": string, "purpose": string }',
    "  ],",
    '  "interactions": string[],           // e.g. ["search", "filter by date", "click row to expand"]',
    '  "dataShape": [                      // canonical data the UI displays',
    '    { "name": string, "type": string, "example": unknown }',
    "  ],",
    '  "tone": string                      // e.g. "professional", "playful", "minimal", "premium"',
    "}",
    "",
    "Rules:",
    "  - Output ONLY the file. Do not write anything else.",
    "  - Be concrete: avoid vague labels like 'data' or 'info'. Real names, real shapes.",
    "  - 3 to 6 sections is the sweet spot for a single component.",
    "  - When the user is vague, make tasteful inferences. Do not ask questions.",
    "  - After writing the file, reply with one sentence describing the component.",
  ].join("\n");
}

export async function runInterpretAgent(
  input: InterpretInput,
  args: AgentRunArgs
): Promise<AgentRunResult> {
  return runAgent("interpret", buildInterpretPrompt(input), {
    ...args,
    timeoutMs: args.timeoutMs ?? 45_000,
  });
}
