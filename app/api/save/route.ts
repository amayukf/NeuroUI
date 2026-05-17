import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { saveGeneration } from "../../../lib/share-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { prompt, files } = await req.json();
    if (!prompt || !Array.isArray(files)) {
      return NextResponse.json({ error: "prompt and files required" }, { status: 400 });
    }
    const id = randomUUID().replace(/-/g, "").slice(0, 12);
    await saveGeneration({
      id,
      prompt,
      files,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ id });
  } catch (err) {
    console.error("[save] error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
