"use client";

import { Check, Loader2, Sparkles, Wrench, FileCode2, Brain, X } from "lucide-react";
import { useEffect, useState } from "react";

export type PhaseStatus = "pending" | "running" | "done";

export interface PhaseState {
  key: string;
  label: string;
  status: PhaseStatus;
  durationMs?: number;
}

interface GenerationProgressProps {
  phases: PhaseState[];
  thought?: string;
  toolLog: string[];
  busy: boolean;
  cached: boolean;
  error?: string;
  totalDurationMs?: number;
}

const PHASE_ICONS: Record<string, typeof Brain> = {
  understand: Brain,
  draft: Sparkles,
  write: FileCode2,
  finalize: Check,
};

export function GenerationProgress({
  phases,
  thought,
  toolLog,
  busy,
  cached,
  error,
  totalDurationMs,
}: GenerationProgressProps) {
  // Live "elapsed" counter while busy
  const [elapsedMs, setElapsedMs] = useState(0);
  useEffect(() => {
    if (!busy) {
      setElapsedMs(0);
      return;
    }
    const start = Date.now();
    const t = setInterval(() => setElapsedMs(Date.now() - start), 100);
    return () => clearInterval(t);
  }, [busy]);

  const done = phases.filter((p) => p.status === "done").length;
  const allDone = phases.length > 0 && done === phases.length;
  const progressPct = phases.length > 0 ? Math.round((done / phases.length) * 100) : 0;

  // Headline reflects truth at every state
  let headline: string;
  let subline: string;
  if (error) {
    headline = "Generation failed";
    subline = "See details below";
  } else if (busy) {
    headline = "Generating your UI";
    subline = cached ? "Loading template…" : "One AI agent writing your component";
  } else if (allDone && totalDurationMs !== undefined) {
    headline = cached
      ? `Loaded from template in ${(totalDurationMs / 1000).toFixed(1)}s`
      : `Generated in ${(totalDurationMs / 1000).toFixed(1)}s`;
    subline = cached
      ? "Pre-baked component — no AI call needed"
      : "Click any template in the sidebar to try another";
  } else {
    headline = "Ready when you are";
    subline = "Describe what you want and hit Generate";
  }

  return (
    <div className="glass p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin text-violet-400 shrink-0" />
            ) : allDone ? (
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : error ? (
              <X className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="h-4 w-4 text-white/40 shrink-0" />
            )}
            <h2 className="text-sm font-semibold text-white/90 truncate">{headline}</h2>
          </div>
          <p className="text-xs text-white/40 mt-0.5">{subline}</p>
        </div>
        {busy && (
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-widest text-white/40">Elapsed</div>
            <div className="text-sm font-mono text-white/80">{(elapsedMs / 1000).toFixed(1)}s</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {phases.length > 0 && (
        <div className="mb-4">
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className={
                "h-full rounded-full transition-all duration-500 " +
                (error
                  ? "bg-rose-500"
                  : allDone
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-violet-500 to-fuchsia-500")
              }
              style={{ width: `${busy && !allDone ? Math.max(progressPct, 8) : progressPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/40">
            <span>
              {done} of {phases.length} steps
            </span>
            {busy && !cached && (
              <span>Typical: 30–60s</span>
            )}
          </div>
        </div>
      )}

      {/* Phase list */}
      <ol className="space-y-1.5">
        {phases.map((p) => {
          const Icon = PHASE_ICONS[p.key] ?? Sparkles;
          return (
            <li
              key={p.key}
              className={
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors " +
                (p.status === "running"
                  ? "bg-violet-500/5"
                  : p.status === "done"
                    ? ""
                    : "opacity-50")
              }
            >
              <div
                className={
                  "flex h-6 w-6 items-center justify-center rounded-md shrink-0 transition-colors " +
                  (p.status === "done"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : p.status === "running"
                      ? "bg-violet-500/15 text-violet-400"
                      : "bg-white/5 text-white/30")
                }
              >
                {p.status === "done" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : p.status === "running" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={
                    "text-xs truncate " +
                    (p.status === "pending" ? "text-white/40" : "text-white/85")
                  }
                >
                  {p.label}
                </p>
              </div>
              {p.durationMs !== undefined && p.status === "done" && (
                <span className="text-[10px] font-mono text-white/40 shrink-0">
                  {(p.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Live thought (only while busy + we have one) */}
      {busy && thought && (
        <div className="mt-4 rounded-lg border border-violet-500/15 bg-violet-500/5 p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-violet-300/60 mb-1">
            <Brain className="h-3 w-3" />
            Agent thinking
          </p>
          <p className="text-[11px] text-white/70 italic leading-relaxed line-clamp-3">
            {thought}
          </p>
        </div>
      )}

      {/* Real tool call log */}
      {toolLog.length > 0 && (
        <details className="mt-4 group" open={busy}>
          <summary className="flex items-center justify-between cursor-pointer text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors">
            <span className="flex items-center gap-1.5">
              <Wrench className="h-3 w-3" />
              Tool calls
            </span>
            <span className="font-mono text-white/40">{toolLog.length}</span>
          </summary>
          <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto rounded-md bg-black/30 p-2 font-mono text-[10px] text-white/60">
            {toolLog.slice(-10).map((tool, i) => (
              <li key={i} className="flex items-center gap-1.5 truncate">
                <span className="text-emerald-400/70">→</span>
                <span className="truncate">{tool}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-rose-300 mb-1">
            <X className="h-3 w-3" />
            Error
          </p>
          <p className="text-xs text-rose-200/80 font-mono leading-relaxed break-words">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
