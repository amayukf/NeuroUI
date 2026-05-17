import type { SandboxFile } from "./sandbox";
import { DEMO_PROMPTS } from "./demo-prompts";

export interface CachedResult {
  prompt: string;
  files: SandboxFile[];
}

/**
 * Lookup a pre-baked demo result by prompt.
 *
 * The matching is intentionally loose: we normalize whitespace, lowercase,
 * and compare a hash of the first 80 characters. This makes it forgiving
 * of minor punctuation/whitespace differences while staying deterministic.
 */
export function getCachedResult(prompt: string): CachedResult | undefined {
  const key = normalize(prompt);
  for (const demo of DEMO_PROMPTS) {
    if (normalize(demo.prompt) === key && demo.files) {
      return { prompt: demo.prompt, files: demo.files };
    }
  }
  return undefined;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 80);
}
