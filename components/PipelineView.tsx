"use client";

import { Check, Loader2, Pause, X, type LucideIcon } from "lucide-react";
import {
  Brain,
  Palette,
  Code2,
  Database,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";

export type AgentStatus =
  | "pending"
  | "running"
  | "finished"
  | "error"
  | "cancelled"
  | "timeout";

export interface PipelineAgentState {
  role: string;
  label: string;
  description: string;
  status: AgentStatus;
  durationMs?: number;
  summary?: string;
  error?: string;
}

const ROLE_ICONS: Record<string, LucideIcon> = {
  interpret: Brain,
  design: Palette,
  generate: Code2,
  connect: Database,
  validate: ShieldCheck,
  optimize: Sparkles,
};

const STATUS_RING: Record<AgentStatus, string> = {
  pending: "border-bg-border bg-bg-soft text-white/40",
  running: "border-accent bg-accent/10 text-accent-glow animate-pulse-glow",
  finished: "border-ok/60 bg-ok/10 text-ok",
  error: "border-err/60 bg-err/10 text-err",
  cancelled: "border-white/30 bg-bg-soft text-white/40",
  timeout: "border-warn/60 bg-warn/10 text-warn",
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  pending: "Queued",
  running: "Running",
  finished: "Done",
  error: "Failed",
  cancelled: "Cancelled",
  timeout: "Timed out",
};

interface PipelineViewProps {
  agents: PipelineAgentState[];
  totalDurationMs?: number;
}

export function PipelineView({ agents, totalDurationMs }: PipelineViewProps) {
  const progress = useMemo(() => {
    const done = agents.filter(
      (a) =>
        a.status === "finished" ||
        a.status === "error" ||
        a.status === "cancelled" ||
        a.status === "timeout"
    ).length;
    return { done, total: agents.length };
  }, [agents]);

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white/80">
            Agent pipeline
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Cursor SDK agents collaborating on one sandbox
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">Progress</div>
          <div className="text-sm font-mono text-white/80">
            {progress.done} / {progress.total}
            {totalDurationMs !== undefined && (
              <span className="ml-2 text-white/40">
                · {(totalDurationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>
      </div>

      <ol className="space-y-2">
        {agents.map((a, i) => {
          const Icon = ROLE_ICONS[a.role] ?? Code2;
          const isLast = i === agents.length - 1;
          return (
            <li key={a.role} className="relative">
              <div className="flex items-stretch gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${STATUS_RING[a.status]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isLast && (
                    <div
                      className={`mt-1 w-px flex-1 transition-colors ${
                        a.status === "finished"
                          ? "bg-ok/40"
                          : a.status === "running"
                            ? "bg-accent/40"
                            : "bg-bg-border"
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {a.label}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                    {a.durationMs !== undefined && (
                      <span className="text-xs font-mono text-white/40">
                        {(a.durationMs / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    {a.description}
                  </p>
                  {a.summary && a.status === "finished" && (
                    <p className="text-xs text-white/60 mt-1.5 italic line-clamp-2">
                      “{a.summary.trim()}”
                    </p>
                  )}
                  {a.error && (
                    <p className="text-xs text-err mt-1.5 font-mono">
                      {a.error}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const cls =
    status === "finished"
      ? "bg-ok/15 text-ok"
      : status === "running"
        ? "bg-accent/15 text-accent-glow"
        : status === "error"
          ? "bg-err/15 text-err"
          : status === "timeout"
            ? "bg-warn/15 text-warn"
            : "bg-white/5 text-white/40";
  const Icon =
    status === "finished"
      ? Check
      : status === "running"
        ? Loader2
        : status === "error"
          ? X
          : status === "timeout"
            ? Pause
            : null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cls}`}
    >
      {Icon && (
        <Icon
          className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`}
        />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}
