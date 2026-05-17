import { runAgent, type AgentRunArgs, type AgentRunResult } from "./runner";

function buildDesignPrompt(): string {
  return [
    "You are the Design agent in the NeuroUI pipeline.",
    "Read spec.json from the current working directory and choose a coherent visual system.",
    "",
    "Write a single file to the current working directory at exactly: design.json",
    "",
    "design.json MUST be valid JSON with this shape:",
    "{",
    '  "palette": {',
    '    "mode": "dark" | "light",',
    '    "background": string,            // tailwind class, e.g. "bg-zinc-950"',
    '    "surface": string,               // card/panel background',
    '    "surfaceMuted": string,',
    '    "border": string,',
    '    "text": string,',
    '    "textMuted": string,',
    '    "accent": string,                // primary action color',
    '    "accentText": string,            // text on top of accent',
    '    "success": string,',
    '    "warn": string,',
    '    "error": string',
    "  },",
    '  "typography": {',
    '    "display": string,               // tailwind class combo for big headings, e.g. "text-3xl font-semibold tracking-tight"',
    '    "heading": string,',
    '    "body": string,',
    '    "label": string,',
    '    "mono": string',
    "  },",
    '  "layout": {',
    '    "container": string,             // e.g. "max-w-6xl mx-auto px-6"',
    '    "gap": string,                   // e.g. "gap-6"',
    '    "radius": string,                // e.g. "rounded-2xl"',
    '    "shadow": string,                // e.g. "shadow-lg shadow-black/30"',
    '    "density": "compact" | "comfortable" | "spacious"',
    "  },",
    '  "vibe": string                     // one short sentence describing the design intent',
    "}",
    "",
    "Rules:",
    "  - Default to dark mode unless the spec tone strongly implies light.",
    "  - Use Tailwind utility classes verbatim — the Generate agent will paste them.",
    "  - Choose a sophisticated accent (violet/indigo/emerald/amber/rose). No primary blue unless asked.",
    "  - Output ONLY the file. After writing, reply with one sentence describing the design.",
  ].join("\n");
}

export async function runDesignAgent(
  args: AgentRunArgs
): Promise<AgentRunResult> {
  return runAgent("design", buildDesignPrompt(), {
    ...args,
    timeoutMs: args.timeoutMs ?? 45_000,
  });
}
