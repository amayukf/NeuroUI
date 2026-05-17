import { NextRequest, NextResponse } from "next/server";
import { getGeneration } from "../../../../lib/share-store";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gen = await getGeneration(id);
  if (!gen) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(gen);
}
