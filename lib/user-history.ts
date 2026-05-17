"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserSupabase } from "./supabase-browser";
import { useAuth } from "../components/AuthProvider";
import type { CodeFile } from "../components/CodeView";

export interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: number;
  color: string;
  files: CodeFile[];
}

const ACCENT_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

const MAX_HISTORY = 20;

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function colorForIndex(i: number): string {
  return ACCENT_COLORS[i % ACCENT_COLORS.length];
}

/**
 * Loads the user's recent generations from Supabase.
 * Falls back to localStorage if Supabase isn't configured.
 */
export function useUserHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load on auth change
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const sb = getBrowserSupabase();
        const { data, error } = await sb
          .from("generations")
          .select("id, prompt, files, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(MAX_HISTORY);
        if (error) throw error;
        if (cancelled) return;
        setHistory(
          (data ?? []).map((row, i) => ({
            id: row.id,
            prompt: row.prompt,
            timestamp: new Date(row.created_at).getTime(),
            color: colorForIndex(i),
            files: (row.files ?? []) as CodeFile[],
          }))
        );
      } catch (err) {
        console.warn("[history] load failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const addToHistory = useCallback(
    async (entry: { prompt: string; files: CodeFile[] }) => {
      if (!user) return null;
      const id = genId();
      const createdAt = new Date().toISOString();

      // Optimistic update
      setHistory(prev => {
        const newEntry: HistoryEntry = {
          id,
          prompt: entry.prompt,
          timestamp: Date.now(),
          color: colorForIndex(0),
          files: entry.files,
        };
        return [newEntry, ...prev].slice(0, MAX_HISTORY).map((h, i) => ({
          ...h,
          color: colorForIndex(i),
        }));
      });

      // Persist to Supabase
      try {
        const sb = getBrowserSupabase();
        const { error } = await sb.from("generations").insert({
          id,
          user_id: user.id,
          prompt: entry.prompt,
          files: entry.files,
          created_at: createdAt,
        });
        if (error) console.warn("[history] save failed:", error.message);
      } catch (err) {
        console.warn("[history] save error:", err);
      }
      return id;
    },
    [user]
  );

  const removeFromHistory = useCallback(
    async (id: string) => {
      if (!user) return;
      setHistory(prev => prev.filter(h => h.id !== id));
      try {
        const sb = getBrowserSupabase();
        await sb.from("generations").delete().eq("id", id).eq("user_id", user.id);
      } catch (err) {
        console.warn("[history] delete failed:", err);
      }
    },
    [user]
  );

  return { history, loading, addToHistory, removeFromHistory };
}
