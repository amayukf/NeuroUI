import type { CodeFile } from "../components/CodeView";
import { getSupabaseClient } from "./supabase";

export interface SavedGeneration {
  id: string;
  prompt: string;
  files: CodeFile[];
  createdAt: string;
}

/** In-memory fallback when Supabase is not configured. */
const memoryStore = new Map<string, SavedGeneration>();

export async function saveGeneration(gen: SavedGeneration): Promise<void> {
  const db = getSupabaseClient();
  if (db) {
    await db.from("generations").upsert({
      id: gen.id,
      prompt: gen.prompt,
      files: gen.files,
      created_at: gen.createdAt,
    });
  } else {
    memoryStore.set(gen.id, gen);
  }
}

export async function getGeneration(id: string): Promise<SavedGeneration | undefined> {
  const db = getSupabaseClient();
  if (db) {
    const { data, error } = await db
      .from("generations")
      .select("id, prompt, files, created_at")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return {
      id: data.id,
      prompt: data.prompt,
      files: data.files as CodeFile[],
      createdAt: data.created_at,
    };
  }
  return memoryStore.get(id);
}
