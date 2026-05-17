import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../../lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const supabase = getSupabaseClient();
  let dbStatus = "memory";
  if (supabase) {
    try {
      await supabase.from("generations").select("id").limit(1);
      dbStatus = "supabase";
    } catch {
      dbStatus = "supabase-error";
    }
  }

  return NextResponse.json({
    status: "ok",
    version: "2.0.0",
    fixtures: 9,
    apiKeyConfigured: Boolean(process.env.CURSOR_API_KEY),
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
