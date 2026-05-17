"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowLeft, AlertCircle } from "lucide-react";
import { Preview } from "../../../components/Preview";
import { CodeView, type CodeFile } from "../../../components/CodeView";
import Link from "next/link";

interface Generation {
  id: string;
  prompt: string;
  files: CodeFile[];
  createdAt: string;
}

export function SharedGenerationView({ id }: { id: string }) {
  const [gen, setGen] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "code">("preview");

  useEffect(() => {
    fetch(`/api/generations/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("Generation not found");
        return r.json();
      })
      .then(setGen)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f0f] text-[#e5e5e5]">
      <header className="flex items-center justify-between border-b border-[#2a2a2a] px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm text-[#71717a] hover:text-[#e5e5e5] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to NeuroUI
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold">NeuroUI</span>
        </div>
      </header>

      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-violet-500" />
            <p className="mt-3 text-sm text-[#71717a]">Loading generation…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a]">
              <AlertCircle className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-base font-semibold">Generation not found</h2>
            <p className="mt-2 text-sm text-[#71717a]">
              This shared generation may have expired or the link is incorrect.
              Shared generations live in-memory and are lost when the server restarts.
            </p>
            <Link href="/" className="mt-4 inline-block rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-all">
              Generate your own
            </Link>
          </div>
        </div>
      )}

      {gen && (
        <div className="flex flex-1 flex-col">
          <div className="border-b border-[#2a2a2a] px-6 py-3">
            <p className="text-xs text-[#71717a] mb-0.5">Prompt</p>
            <p className="text-sm font-medium max-w-2xl">{gen.prompt}</p>
          </div>
          <div className="flex border-b border-[#2a2a2a] px-6">
            {(["preview", "code"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={"px-3 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px " +
                  (tab === t ? "border-violet-500 text-violet-300" : "border-transparent text-[#71717a] hover:text-[#e5e5e5]")}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-[600px]">
            {tab === "preview" ? <Preview files={gen.files} /> : <CodeView files={gen.files} />}
          </div>
        </div>
      )}
    </div>
  );
}
