import { runAgent, type AgentRunArgs, type AgentRunResult } from "./runner";

export interface GenerateInput {
  userPrompt: string;
}

/**
 * Build the prompt for the Generate agent.
 *
 * Generate reads spec.json (Interpret) and design.json (Design) and writes
 * src/App.tsx plus any helper components under src/. Output is plain
 * React + Tailwind so it works inside Sandpack without extra setup.
 */
function buildGeneratePrompt(input: GenerateInput): string {
  return [
    "You are a senior React engineer at a top-tier product startup.",
    "Your task: generate a COMPLETE, stunning UI component that looks like it was built",
    "by a professional design team and shipped to thousands of paying users.",
    "",
    "Inputs in the current working directory:",
    "  - spec.json    (from Interpret) describes what the user wants",
    "  - design.json  (from Design)    describes palette, typography, and layout",
    "",
    "NON-NEGOTIABLE RULES — violating any of these is a failure:",
    "",
    "  1. Write src/App.tsx with `export default function App()`. TypeScript only.",
    "  2. Allowed imports: react, recharts, lucide-react. NOTHING else.",
    "     - Use recharts (LineChart/BarChart/AreaChart/PieChart + ResponsiveContainer) for",
    "       ALL charts. Real curved data, proper tooltips, colour fills, legends.",
    "     - Use lucide-react for ALL icons (no emoji icons).",
    "     - No CSS files, no styled-components, no inline style= objects.",
    "  3. Tailwind ONLY for styling. Dark theme base:",
    "     background #0f0f0f → bg-[#0f0f0f]",
    "     surface     #1a1a1a → bg-[#1a1a1a]",
    "     border      #2a2a2a → border-[#2a2a2a]",
    "     text        #e5e5e5 → text-[#e5e5e5]",
    "     muted       #71717a → text-[#71717a]",
    "     accent choose one: violet-500 / emerald-500 / amber-500 / rose-500",
    "  4. Micro-interactions on EVERYTHING:",
    "     - Buttons: hover:brightness-110 active:scale-95 transition-all",
    "     - Rows: hover:bg-white/5 transition-colors",
    "     - Cards: hover:border-white/20 transition-colors",
    "     - Inputs: focus:ring-2 focus:ring-violet-500/40",
    "  5. Every interactive element MUST have working state:",
    "     - Buttons: onClick with useState (tab switches, toggles, sort, select)",
    "     - Tables: column sorting with sort direction indicator",
    "     - Forms: controlled inputs + validation state (error/success styling)",
    "     - Toggles/checkboxes: controlled with useState",
    "  6. Realistic data only. Real names, real dates (2025-2026), real numbers.",
    "     No 'Lorem ipsum', no 'Item 1', no 'User A'.",
    "  7. Include loading skeleton state for data-heavy sections:",
    "     Use `animate-pulse bg-[#2a2a2a] rounded` divs as placeholders,",
    "     toggle with a `const [loading, setLoading] = useState(true)` that",
    "     auto-resolves after 1.2 s via useEffect.",
    "  8. Mobile-first responsive (sm: md: lg: breakpoints).",
    "  9. Semantic HTML: header/main/section/nav/article. ARIA labels on icon-only buttons.",
    " 10. Keep App.tsx under 300 lines. Extract complex sub-sections to src/components/*.tsx.",
    " 11. DO NOT write package.json, vite config, index.html, or tailwind config.",
    "     The renderer already provides those.",
    " 12. Return ONLY the component file(s). Zero explanation in your reply — just write the files.",
    "",
    `User's original request: "${input.userPrompt}"`,
    "",
    "Workflow:",
    "  1. Read spec.json then design.json.",
    "  2. Write src/App.tsx (and src/components/*.tsx if needed).",
    "  3. After writing, reply with exactly one sentence describing what you built.",
  ].join("\n");
}

export async function runGenerateAgent(
  input: GenerateInput,
  args: AgentRunArgs
): Promise<AgentRunResult> {
  return runAgent("generate", buildGeneratePrompt(input), {
    ...args,
    timeoutMs: args.timeoutMs ?? 90_000,
  });
}
