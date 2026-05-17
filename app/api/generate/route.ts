import { runPipeline, type PipelineEvent } from "@/lib/pipeline";
import { getCachedResult } from "@/lib/cache";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface GenerateBody {
  prompt?: string;
  model?: { id: string };
  useCache?: boolean;
}

function sseLine(event: PipelineEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Body must be JSON.");
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return jsonError(400, "Missing 'prompt' field.");
  }
  if (prompt.length > 2000) {
    return jsonError(400, "Prompt is too long (max 2000 chars).");
  }

  const apiKey = process.env.CURSOR_API_KEY;

  // Always check cache first — cached prompts load instantly regardless of API key.
  // Pass ?live=1 in the query string to force the live pipeline even for cached prompts.
  const forceLive = new URL(req.url).searchParams.get("live") === "1";
  if (!forceLive) {
    const cached = getCachedResult(prompt);
    if (cached) {
      return streamCachedOnly(prompt, cached.files);
    }
  }

  if (!apiKey) {
    return jsonError(
      503,
      "CURSOR_API_KEY is not configured. Add it to .env.local to enable live generation."
    );
  }

  const encoder = new TextEncoder();
  const controller = new AbortController();
  req.signal.addEventListener("abort", () => controller.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(streamCtrl) {
      const heartbeat = setInterval(() => {
        try {
          streamCtrl.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          // ignore — stream may be closed
        }
      }, 15_000);

      try {
        for await (const event of runPipeline({
          prompt,
          apiKey,
          model: body.model,
          signal: controller.signal,
          useCache: body.useCache,
        })) {
          streamCtrl.enqueue(encoder.encode(sseLine(event)));
        }
      } catch (err) {
        const failed: PipelineEvent = {
          type: "failed",
          error: err instanceof Error ? err.message : String(err),
        };
        try {
          streamCtrl.enqueue(encoder.encode(sseLine(failed)));
        } catch {
          // ignore
        }
      } finally {
        clearInterval(heartbeat);
        try {
          streamCtrl.close();
        } catch {
          // ignore
        }
      }
    },
    cancel() {
      controller.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function streamCachedOnly(
  prompt: string,
  files: import("@/lib/sandbox").SandboxFile[]
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      const phases = [
        { key: "understand", label: "Understanding your prompt" },
        { key: "draft", label: "Loading template component" },
        { key: "write", label: "Writing src/App.tsx" },
        { key: "finalize", label: "Finalizing" },
      ] as const;

      const seq: PipelineEvent[] = [
        { type: "started", requestId: "cached", prompt, cached: true },
        ...phases.flatMap((p): PipelineEvent[] => [
          { type: "phase", key: p.key, label: p.label, status: "running" },
          { type: "phase", key: p.key, label: p.label, status: "done", durationMs: 80 },
        ]),
        { type: "finished", files, totalDurationMs: 320 },
      ];
      for (const e of seq) c.enqueue(encoder.encode(sseLine(e)));
      c.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
