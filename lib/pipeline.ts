import {
  AGENTS,
  runConnectAgent,
  runDesignAgent,
  runGenerateAgent,
  runInterpretAgent,
  runOptimizeAgent,
  runValidateAgent,
  runTurboAgent,
  type AgentRole,
  type AgentRunArgs,
  type AgentRunResult,
} from "./agents";
import { createSandbox, readSandboxFiles, type SandboxFile } from "./sandbox";
import { getCachedResult } from "./cache";

export type PhaseKey = "understand" | "draft" | "write" | "finalize";

export type PipelineEvent =
  | { type: "started"; requestId: string; prompt: string; cached?: boolean }
  // ── New (turbo / cached) — honest, one card UI ──
  | {
      type: "phase";
      key: PhaseKey;
      label: string;
      status: "running" | "done";
      durationMs?: number;
    }
  | { type: "thought"; text: string }
  | { type: "tool_used"; tool: string; detail?: string }
  // ── Legacy (full mode) — kept for ?live=1&mode=full debugging ──
  | {
      type: "agent_started";
      role: AgentRole;
      label: string;
      index: number;
      total: number;
    }
  | { type: "agent_delta"; role: AgentRole; text: string }
  | { type: "agent_tool"; role: AgentRole; tool: string }
  | {
      type: "agent_completed";
      role: AgentRole;
      status: AgentRunResult["status"];
      durationMs: number;
      summary?: string;
      error?: string;
    }
  | { type: "finished"; files: SandboxFile[]; totalDurationMs: number }
  | { type: "failed"; role?: AgentRole; error: string };

export interface RunPipelineOptions {
  prompt: string;
  apiKey: string;
  model?: { id: string };
  signal?: AbortSignal;
  /** Allow callers to disable demo cache fallback (default true). */
  useCache?: boolean;
  /**
   * "turbo" (default): single agent call, ~45 s, produces complete App.tsx.
   * "full":   the original 6-agent showcase, ~3 min — for advanced users.
   */
  mode?: "turbo" | "full";
}

const PHASE_LABELS: Record<PhaseKey, string> = {
  understand: "Understanding your prompt",
  draft: "Generating your React component",
  write: "Writing src/App.tsx",
  finalize: "Finalizing",
};

/**
 * Run the generation pipeline.
 *
 * In turbo mode (default), runs ONE real agent call and surfaces its real
 * progress as phase / thought / tool_used events streamed live from the
 * agent's stdout. No fake agents, no theater.
 *
 * In full mode, runs the legacy six-agent pipeline (kept for debugging /
 * showcasing the SDK's multi-agent orchestration).
 */
export async function* runPipeline(
  options: RunPipelineOptions
): AsyncGenerator<PipelineEvent, void, void> {
  const { prompt, apiKey, model, signal } = options;
  const useCache = options.useCache ?? true;
  const mode = options.mode ?? "turbo";
  const pipelineStart = Date.now();
  const sandbox = await createSandbox();

  yield {
    type: "started",
    requestId: sandbox.id,
    prompt,
  };

  // ── TURBO MODE ────────────────────────────────────────────────────────
  if (mode === "turbo") {
    yield* runTurboMode({
      prompt,
      apiKey,
      model,
      signal,
      useCache,
      sandbox,
      pipelineStart,
    });
    return;
  }

  // ── FULL MODE (legacy 6-agent showcase) ──────────────────────────────
  yield* runFullMode({
    prompt,
    apiKey,
    model,
    signal,
    useCache,
    sandbox,
    pipelineStart,
  });
}

// ── Turbo implementation ─────────────────────────────────────────────
interface ModeArgs {
  prompt: string;
  apiKey: string;
  model?: { id: string };
  signal?: AbortSignal;
  useCache: boolean;
  sandbox: Awaited<ReturnType<typeof createSandbox>>;
  pipelineStart: number;
}

async function* runTurboMode(
  args: ModeArgs
): AsyncGenerator<PipelineEvent, void, void> {
  const { prompt, apiKey, model, useCache, sandbox, pipelineStart } = args;

  // Simple async event queue so callbacks from the agent stream events
  // back through this generator in real time (the bit that was broken
  // before — events used to be drained AFTER `await` returned).
  const queue: PipelineEvent[] = [];
  let pending: ((e: PipelineEvent | null) => void) | null = null;
  let agentDone = false;

  const push = (e: PipelineEvent) => {
    if (pending) {
      const r = pending;
      pending = null;
      r(e);
    } else {
      queue.push(e);
    }
  };
  const next = (): Promise<PipelineEvent | null> => {
    if (queue.length > 0) return Promise.resolve(queue.shift()!);
    if (agentDone) return Promise.resolve(null);
    return new Promise<PipelineEvent | null>((resolve) => {
      pending = resolve;
    });
  };

  // Phase state machine — every transition is triggered by a REAL signal
  // from the agent (first text delta, first write tool call, agent finish).
  let currentPhase: PhaseKey | null = null;
  const phaseStarts = new Map<PhaseKey, number>();

  const finishPhase = (key: PhaseKey) => {
    const start = phaseStarts.get(key) ?? Date.now();
    push({
      type: "phase",
      key,
      label: PHASE_LABELS[key],
      status: "done",
      durationMs: Date.now() - start,
    });
  };
  const enterPhase = (key: PhaseKey) => {
    if (currentPhase === key) return;
    if (currentPhase) finishPhase(currentPhase);
    currentPhase = key;
    phaseStarts.set(key, Date.now());
    push({
      type: "phase",
      key,
      label: PHASE_LABELS[key],
      status: "running",
    });
  };

  // Phase 1 starts and ends in the same tick — it's literally "we got your prompt"
  enterPhase("understand");
  finishPhase("understand");
  currentPhase = null;
  // Phase 2 — agent call begins
  enterPhase("draft");

  let firstWriteSeen = false;
  let firstDeltaSeen = false;

  // Throttle thought events so we don't flood the SSE stream
  let lastThoughtAt = 0;
  const THOUGHT_THROTTLE_MS = 350;

  const agentArgs: AgentRunArgs = {
    apiKey,
    cwd: sandbox.cwd,
    model,
    onDelta: (text) => {
      if (!firstDeltaSeen) firstDeltaSeen = true;
      const now = Date.now();
      if (now - lastThoughtAt >= THOUGHT_THROTTLE_MS) {
        lastThoughtAt = now;
        // Send a trimmed snippet — UI shows the most recent one as italic caption
        const snippet = text.replace(/\s+/g, " ").trim().slice(0, 200);
        if (snippet) push({ type: "thought", text: snippet });
      }
    },
    onToolCall: (tool) => {
      const isWrite = /write|create|edit/i.test(tool);
      if (isWrite && !firstWriteSeen) {
        firstWriteSeen = true;
        enterPhase("write");
      }
      push({ type: "tool_used", tool });
    },
  };

  // Start the agent — DO NOT await yet. Drain events as they arrive.
  const agentPromise = runTurboAgent({ userPrompt: prompt }, agentArgs)
    .finally(() => {
      agentDone = true;
      if (pending) {
        const r = pending;
        pending = null;
        r(null);
      }
    });

  // Stream events live
  while (true) {
    const e = await next();
    if (e === null) break;
    yield e;
    if (agentDone && queue.length === 0) break;
  }

  // Agent has finished one way or another — get the result
  const result = await agentPromise;

  // Close whatever phase was running when the agent ended
  if (currentPhase) {
    finishPhase(currentPhase);
    currentPhase = null;
  }

  // Drain any straggler events the callback may have pushed during await
  while (queue.length > 0) yield queue.shift()!;

  try {
    if (result.status !== "finished") {
      // Try cache fallback before failing
      if (useCache) {
        const cached = getCachedResult(prompt);
        if (cached) {
          yield {
            type: "finished",
            files: cached.files,
            totalDurationMs: Date.now() - pipelineStart,
          };
          return;
        }
      }
      yield {
        type: "failed",
        role: "generate",
        error: result.error ?? `Generation ended with status ${result.status}`,
      };
      return;
    }

    // Phase 4 — read what landed on disk
    enterPhase("finalize");
    // Drain the phase event before file read
    while (queue.length > 0) yield queue.shift()!;

    const files = await readSandboxFiles(sandbox.cwd, {
      include: /^(src\/.*|spec\.json|design\.json|report\.md)$/,
    });

    finishPhase("finalize");
    while (queue.length > 0) yield queue.shift()!;

    const hasApp = files.some((f) => f.path === "/src/App.tsx");
    if (!hasApp) {
      if (useCache) {
        const cached = getCachedResult(prompt);
        if (cached) {
          yield {
            type: "finished",
            files: cached.files,
            totalDurationMs: Date.now() - pipelineStart,
          };
          return;
        }
      }
      yield {
        type: "failed",
        role: "generate",
        error: "No App.tsx was produced. Try rephrasing your prompt or use a template chip.",
      };
      return;
    }

    yield {
      type: "finished",
      files,
      totalDurationMs: Date.now() - pipelineStart,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (useCache) {
      const cached = getCachedResult(prompt);
      if (cached) {
        yield {
          type: "finished",
          files: cached.files,
          totalDurationMs: Date.now() - pipelineStart,
        };
        return;
      }
    }
    yield { type: "failed", role: "generate", error: message };
  } finally {
    sandbox.cleanup().catch(() => {});
  }
}

// ── Full mode (legacy) ────────────────────────────────────────────────
async function* runFullMode(
  args: ModeArgs
): AsyncGenerator<PipelineEvent, void, void> {
  const { prompt, apiKey, model, signal, useCache, sandbox, pipelineStart } = args;
  const queued: PipelineEvent[] = [];
  let currentRole: AgentRole = "interpret";

  const baseArgs = (role: AgentRole): AgentRunArgs => ({
    apiKey,
    cwd: sandbox.cwd,
    model,
    onDelta: (text) => {
      queued.push({ type: "agent_delta", role, text });
    },
    onToolCall: (tool) => {
      queued.push({ type: "agent_tool", role, tool });
    },
  });

  const drain = (): PipelineEvent[] => {
    const out = queued.slice();
    queued.length = 0;
    return out;
  };

  type Step = {
    role: AgentRole;
    label: string;
    critical: boolean;
    run: (a: AgentRunArgs) => Promise<AgentRunResult>;
  };

  const steps: Step[] = [
    { role: "interpret", label: "Interpret", critical: true, run: (a) => runInterpretAgent({ userPrompt: prompt }, a) },
    { role: "design", label: "Design", critical: true, run: (a) => runDesignAgent(a) },
    { role: "generate", label: "Generate", critical: true, run: (a) => runGenerateAgent({ userPrompt: prompt }, a) },
    { role: "connect", label: "Connect", critical: false, run: (a) => runConnectAgent(a) },
    { role: "validate", label: "Validate", critical: false, run: (a) => runValidateAgent(a) },
    { role: "optimize", label: "Optimize", critical: false, run: (a) => runOptimizeAgent(a) },
  ];

  try {
    for (let i = 0; i < steps.length; i++) {
      if (signal?.aborted) {
        yield { type: "failed", role: currentRole, error: "Cancelled" };
        return;
      }
      const step = steps[i];
      currentRole = step.role;
      yield { type: "agent_started", role: step.role, label: step.label, index: i, total: steps.length };
      const result = await step.run(baseArgs(step.role));
      for (const e of drain()) yield e;
      yield {
        type: "agent_completed",
        role: step.role,
        status: result.status,
        durationMs: result.durationMs,
        summary: result.summary,
        error: result.error,
      };
      if (result.status !== "finished" && step.critical) {
        if (useCache) {
          const cached = getCachedResult(prompt);
          if (cached) {
            yield { type: "finished", files: cached.files, totalDurationMs: Date.now() - pipelineStart };
            return;
          }
        }
        yield {
          type: "failed",
          role: step.role,
          error: result.error ?? `Agent ${step.role} ended with status ${result.status}`,
        };
        return;
      }
    }

    const files = await readSandboxFiles(sandbox.cwd, {
      include: /^(src\/.*|spec\.json|design\.json|report\.md)$/,
    });
    const hasApp = files.some((f) => f.path === "/src/App.tsx");
    if (!hasApp) {
      if (useCache) {
        const cached = getCachedResult(prompt);
        if (cached) {
          yield { type: "finished", files: cached.files, totalDurationMs: Date.now() - pipelineStart };
          return;
        }
      }
      yield { type: "failed", role: "generate", error: "No App.tsx produced. Try again or use a template chip." };
      return;
    }

    yield { type: "finished", files, totalDurationMs: Date.now() - pipelineStart };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (useCache) {
      const cached = getCachedResult(prompt);
      if (cached) {
        yield { type: "finished", files: cached.files, totalDurationMs: Date.now() - pipelineStart };
        return;
      }
    }
    yield { type: "failed", role: currentRole, error: message };
  } finally {
    sandbox.cleanup().catch(() => {});
  }
}

export { AGENTS };
