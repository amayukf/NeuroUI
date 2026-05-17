import { runAgent, type AgentRunArgs, type AgentRunResult } from "./runner";

function buildOptimizePrompt(): string {
  return [
    "You are the Optimize agent in the NeuroUI pipeline. You are the last agent before the user sees the result.",
    "",
    "Tasks:",
    "  1. Read report.md (from Validate) and the source files under src/.",
    "  2. Apply every fix listed as 'critical' or 'major'. Apply 'minor' fixes only if cheap.",
    "  3. Final polish:",
    "     - Consistent indentation (2 spaces).",
    "     - Sort imports: react first, then alphabetical relative imports.",
    "     - Remove unused imports and dead code.",
    "     - Ensure default export is the main component.",
    "     - Ensure the file ends with a single trailing newline.",
    "  4. Do NOT add new dependencies. Tailwind + react only.",
    "  5. Do NOT regenerate or restructure layout. Surgical edits only.",
    "",
    "After editing, reply with a one-sentence summary of the fixes applied.",
  ].join("\n");
}

export async function runOptimizeAgent(
  args: AgentRunArgs
): Promise<AgentRunResult> {
  return runAgent("optimize", buildOptimizePrompt(), {
    ...args,
    timeoutMs: args.timeoutMs ?? 45_000,
  });
}
