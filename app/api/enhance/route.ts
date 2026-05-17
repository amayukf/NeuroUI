import { NextRequest, NextResponse } from "next/server";
import { Agent } from "@cursor/sdk";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 503 });
  }

  const { prompt } = await req.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const cwd = mkdtempSync(join(tmpdir(), "neuroui-enhance-"));
  try {
    const result = await Agent.prompt(
      [
        "You are an expert at writing prompts for an AI UI generator.",
        "The user wants to generate a React UI component.",
        "Rewrite their rough prompt into a detailed, specific one that will produce a stunning result.",
        "Include: component type, key sections/features, data to show, interactions, visual style.",
        "Be specific but concise (2-4 sentences). Return ONLY the enhanced prompt — no explanation, no quotes.",
        "",
        `User's prompt: ${prompt}`,
      ].join("\n"),
      {
        apiKey,
        model: { id: "composer-2" },
        local: { cwd },
      }
    );
    return NextResponse.json({ enhanced: result.result?.trim() ?? prompt });
  } catch {
    return NextResponse.json({ enhanced: prompt });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}
