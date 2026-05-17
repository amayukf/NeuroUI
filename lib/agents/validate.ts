import { runAgent, type AgentRunArgs, type AgentRunResult } from "./runner";

function buildValidatePrompt(): string {
  return [
    "You are the Validate agent in the NeuroUI pipeline.",
    "Audit the generated React code for bugs, accessibility issues, and React anti-patterns.",
    "",
    "Tasks:",
    "  1. Read src/App.tsx and every file under src/components/.",
    "  2. Look for:",
    "     - Missing `key` props on rendered lists",
    "     - Buttons without accessible names (icon-only buttons need aria-label)",
    "     - Form inputs without associated labels",
    "     - Images without alt text (decorative images need alt=\"\")",
    "     - Unhandled empty/loading states the spec implied",
    "     - `any` types, unused vars, unresolved imports",
    "     - Inline event handlers re-created in tight loops without need",
    "     - Hardcoded ids that prevent multiple instances",
    "  3. Write a file to the current working directory at exactly: report.md",
    "     Format:",
    "     # Validation report",
    "     ## Issues",
    "     - [severity] [file:line] short description of issue and suggested fix",
    "     ## Notes",
    "     - any non-issue observations the Optimize agent should know",
    "",
    "  4. severity is one of: critical | major | minor",
    "  5. Do NOT edit the source files. Only write report.md.",
    "  6. If there are no issues, write a report.md that says so explicitly.",
    "",
    "After writing report.md, reply with one sentence summarizing the findings.",
  ].join("\n");
}

export async function runValidateAgent(
  args: AgentRunArgs
): Promise<AgentRunResult> {
  return runAgent("validate", buildValidatePrompt(), {
    ...args,
    timeoutMs: args.timeoutMs ?? 40_000,
  });
}
