import { runAgent, type AgentRunArgs, type AgentRunResult } from "./runner";

export interface TurboInput {
  userPrompt: string;
}

/**
 * Single-call agent that does interpret + design + generate + connect in one shot.
 * Optimized for speed: typical run is 30–60 seconds vs 3–5 min for the full pipeline.
 *
 * Writes src/App.tsx directly. No intermediate files. No back-and-forth.
 */
function buildTurboPrompt(input: TurboInput): string {
  return [
    "You are a senior React engineer at a top-tier product studio.",
    "Your task: write a COMPLETE, polished UI component file at `src/App.tsx`.",
    "It must look like it was designed by a professional team and shipped to paying users.",
    "",
    `User's request: "${input.userPrompt}"`,
    "",
    "STEP 1 — pick the component:",
    "  Interpret the request. If it's vague, default to the most interesting interpretation",
    "  (e.g. 'a dashboard' → analytics dashboard with KPIs + chart + table).",
    "  If it's an artistic / non-UI prompt (like 'simple picture'), build a creative",
    "  themed component such as a gallery, mood board, or showcase page that fits the vibe.",
    "",
    "STEP 2 — write the file:",
    "  Path: src/App.tsx",
    "  Format: `export default function App() { ... }`",
    "  TypeScript. Single file. Under 280 lines.",
    "",
    "NON-NEGOTIABLE RULES:",
    "  1. Allowed imports — pick ONLY from this whitelist (Sandpack preview will silently fail on anything else):",
    "       import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';",
    "       import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,",
    "                XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';",
    "       // (Optional) import { Plus, Minus, Search, X, Check, ChevronDown, ... } from 'lucide-react';",
    "     - NO other npm packages. NO framer-motion, NO clsx, NO classnames, NO date-fns, NO @radix-ui.",
    "     - lucide-react is allowed but OPTIONAL — prefer inline SVG or unicode glyphs (✓, ✕, →) for simple icons.",
    "     - If you need an icon and aren't 100% sure of the lucide name, use an inline SVG instead.",
    "  2. Tailwind classes ONLY. No CSS files, no inline style= props, no styled-components.",
    "  3. Dark theme palette (use these exact hex values via arbitrary classes):",
    "     bg: bg-[#0f0f0f]   surface: bg-[#1a1a1a]   border: border-[#2a2a2a]",
    "     text: text-[#e5e5e5]   muted: text-[#71717a]",
    "     Accent: pick ONE — violet-500 / emerald-500 / amber-500 / rose-500",
    "  4. Micro-interactions:",
    "     - Buttons: hover:brightness-110 active:scale-95 transition-all",
    "     - Rows/cards: hover:bg-white/5 / hover:border-white/20 transition-colors",
    "     - Inputs: focus:ring-2 focus:ring-violet-500/40",
    "  5. Every interactive element has working useState (tabs, sort, toggle, filter, etc).",
    "  6. Realistic data. Real names, real numbers, dates from 2025–2026. No 'foo/bar/lorem'.",
    "  7. Loading skeleton: `useState(true)` + `useEffect` that flips to false after 1.2s,",
    "     show `animate-pulse bg-[#2a2a2a] rounded` placeholders while loading.",
    "  8. Semantic HTML (header/main/section/nav). aria-label on icon-only buttons.",
    "  9. Mobile-first responsive (sm:, md:, lg: breakpoints).",
    " 10. DO NOT create package.json, vite.config, index.html, or tailwind.config — the host provides them.",
    "",
    "OUTPUT FORMAT:",
    "  Use your file-writing tool to write src/App.tsx.",
    "  The file content must be PLAIN TypeScript/TSX — no markdown, no code fences, no backticks.",
    "  After writing the file, reply with ONE short sentence describing what you built. Nothing else.",
    "",
    "CRITICAL: Do NOT wrap the file content in ```tsx or any markdown fences.",
    "CRITICAL: Write the file directly using the file-writing tool. Do not print the code in chat.",
    "",
    "Begin immediately. No clarifying questions. No preamble. Just write the file.",
  ].join("\n");
}

export async function runTurboAgent(
  input: TurboInput,
  args: AgentRunArgs
): Promise<AgentRunResult> {
  return runAgent("generate", buildTurboPrompt(input), {
    ...args,
    timeoutMs: args.timeoutMs ?? 120_000,
  });
}
