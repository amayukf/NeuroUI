import "../sdk-init"; // MUST be first — redirects SDK data dir to /tmp on serverless
import { Agent, CursorAgentError } from "@cursor/sdk";
import type { SDKMessage } from "@cursor/sdk";
import { readSandboxFile } from "../sandbox";

export type AgentRole =
  | "interpret"
  | "design"
  | "generate"
  | "connect"
  | "validate"
  | "optimize";

export interface AgentDefinition {
  id: AgentRole;
  label: string;
  description: string;
  /** Whether this agent does real LLM work or is a lightweight pass. */
  heavy: boolean;
}

export const AGENTS: readonly AgentDefinition[] = [
  {
    id: "interpret",
    label: "Interpret",
    description: "Parses your request into a structured component spec.",
    heavy: true,
  },
  {
    id: "design",
    label: "Design",
    description: "Chooses palette, typography, and layout.",
    heavy: true,
  },
  {
    id: "generate",
    label: "Generate",
    description: "Writes clean React + Tailwind code.",
    heavy: true,
  },
  {
    id: "connect",
    label: "Connect",
    description: "Wires mock data so the UI renders end-to-end.",
    heavy: false,
  },
  {
    id: "validate",
    label: "Validate",
    description: "Scans for bugs, missing keys, and a11y issues.",
    heavy: true,
  },
  {
    id: "optimize",
    label: "Optimize",
    description: "Applies fixes and final polish.",
    heavy: true,
  },
] as const;

export interface AgentRunArgs {
  apiKey: string;
  cwd: string;
  model?: { id: string };
  /** Per-agent timeout in milliseconds. */
  timeoutMs?: number;
  onDelta?: (text: string) => void;
  onToolCall?: (name: string) => void;
}

export interface AgentRunResult {
  role: AgentRole;
  status: "finished" | "error" | "cancelled" | "timeout";
  durationMs: number;
  summary?: string;
  error?: string;
}

const DEFAULT_TIMEOUT_MS = 90_000;

/**
 * Run a single agent against the shared sandbox cwd. Disposes the agent
 * in a finally block regardless of success or failure.
 *
 * Distinguishes startup failures (CursorAgentError -> the agent never ran)
 * from in-flight failures (result.status === "error" -> the agent ran and
 * failed) per the Cursor SDK guidance.
 */
export async function runAgent(
  role: AgentRole,
  prompt: string,
  args: AgentRunArgs
): Promise<AgentRunResult> {
  const start = Date.now();
  const timeoutMs = args.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const model = args.model ?? { id: "composer-2" };

  let agent: Awaited<ReturnType<typeof Agent.create>> | undefined;
  try {
    agent = await Agent.create({
      apiKey: args.apiKey,
      model,
      local: { cwd: args.cwd },
      name: `neuroui:${role}`,
    });

    const run = await agent.send(prompt);

    // Stream so callers can see live progress. We intentionally ignore
    // stream errors — `wait()` is the source of truth for terminal state.
    const streamPromise = (async () => {
      try {
        for await (const message of run.stream() as AsyncGenerator<SDKMessage>) {
          if (message.type === "assistant") {
            for (const block of message.message.content) {
              if (block.type === "text" && args.onDelta) {
                args.onDelta(block.text);
              }
            }
          } else if (message.type === "tool_call" && args.onToolCall) {
            if (message.status === "running") {
              args.onToolCall(message.name);
            }
          }
        }
      } catch {
        // Swallow stream errors; rely on wait() for terminal status.
      }
    })();

    const timeoutPromise = new Promise<"timeout">((resolve) =>
      setTimeout(() => resolve("timeout"), timeoutMs)
    );

    const race = await Promise.race([
      run.wait().then((r) => ({ kind: "result" as const, result: r })),
      timeoutPromise.then(() => ({ kind: "timeout" as const })),
    ]);

    if (race.kind === "timeout") {
      if (run.supports("cancel")) {
        try {
          await run.cancel();
        } catch {
          // ignore
        }
      }
      return {
        role,
        status: "timeout",
        durationMs: Date.now() - start,
        error: `Agent ${role} exceeded ${timeoutMs}ms`,
      };
    }

    // Drain stream after wait() returns to avoid leaving an open async iterator.
    await streamPromise.catch(() => {});

    const result = race.result;
    return {
      role,
      status:
        result.status === "finished"
          ? "finished"
          : result.status === "cancelled"
            ? "cancelled"
            : "error",
      durationMs: result.durationMs ?? Date.now() - start,
      summary: result.result,
      error: result.status === "error" ? result.result : undefined,
    };
  } catch (err) {
    if (err instanceof CursorAgentError) {
      return {
        role,
        status: "error",
        durationMs: Date.now() - start,
        error: `startup failed: ${err.message} (retryable=${err.isRetryable})`,
      };
    }
    return {
      role,
      status: "error",
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (agent) {
      try {
        await agent[Symbol.asyncDispose]();
      } catch {
        // Best-effort dispose; never throw out of finally.
      }
    }
  }
}

/**
 * Read a JSON artifact from the sandbox safely. Returns the parsed value
 * or undefined if the file is missing or malformed.
 */
export async function readJsonArtifact<T>(
  cwd: string,
  relPath: string
): Promise<T | undefined> {
  const text = await readSandboxFile(cwd, relPath);
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Sometimes the model wraps JSON in ```json fences; try to recover.
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      try {
        return JSON.parse(fenced[1]) as T;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}
