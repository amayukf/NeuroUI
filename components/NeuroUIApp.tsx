"use client";

import { useCallback, useRef, useState } from "react";
import { AlertCircle, Github, LogOut, User as UserIcon } from "lucide-react";
import { GenerationProgress, type PhaseState } from "./GenerationProgress";
import { PromptInput } from "./PromptInput";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { Sidebar } from "./Sidebar";
import { useAuth } from "./AuthProvider";
import { useUserHistory } from "../lib/user-history";
import type { CodeFile } from "./CodeView";

interface DemoMeta {
  label: string;
  icon?: string;
  prompt: string;
}

// Honest, pre-defined phase shells. They start "pending" and transition
// to running/done as REAL events stream in from the agent (first text
// delta, first write tool call, agent finish, file read).
function initialPhases(): PhaseState[] {
  return [
    { key: "understand", label: "Understanding your prompt", status: "pending" },
    { key: "draft", label: "Generating your React component", status: "pending" },
    { key: "write", label: "Writing src/App.tsx", status: "pending" },
    { key: "finalize", label: "Finalizing", status: "pending" },
  ];
}

type PipelineEvent =
  | { type: "started"; requestId: string; prompt: string; cached?: boolean }
  | { type: "phase"; key: string; label: string; status: "running" | "done"; durationMs?: number }
  | { type: "thought"; text: string }
  | { type: "tool_used"; tool: string; detail?: string }
  // Legacy events (only fired in ?mode=full) — we ignore them in the UI
  | { type: "agent_started"; role: string; label: string; index: number; total: number }
  | { type: "agent_delta"; role: string; text: string }
  | { type: "agent_tool"; role: string; tool: string }
  | { type: "agent_completed"; role: string; status: string; durationMs: number; summary?: string; error?: string }
  | { type: "finished"; files: CodeFile[]; totalDurationMs: number }
  | { type: "failed"; role?: string; error: string };

interface NeuroUIAppProps {
  demos: DemoMeta[];
}

export default function NeuroUIApp({ demos }: NeuroUIAppProps) {
  const [prompt, setPrompt] = useState("");
  const [phases, setPhases] = useState<PhaseState[]>(initialPhases());
  const [thought, setThought] = useState<string | undefined>();
  const [toolLog, setToolLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [totalDurationMs, setTotalDurationMs] = useState<number | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [cached, setCached] = useState(false);
  const [shareId, setShareId] = useState<string | undefined>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const { history, addToHistory, removeFromHistory } = useUserHistory();

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setBusy(false);
  }, []);

  const resetState = useCallback(() => {
    setBusy(false);
    setError(undefined);
    setFiles([]);
    setTotalDurationMs(undefined);
    setCached(false);
    setShareId(undefined);
    setPhases(initialPhases());
    setThought(undefined);
    setToolLog([]);
  }, []);

  const start = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      setPrompt(trimmed);
      setBusy(true);
      setError(undefined);
      setFiles([]);
      setTotalDurationMs(undefined);
      setCached(false);
      setShareId(undefined);
      setPhases(initialPhases());
      setThought(undefined);
      setToolLog([]);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmed }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Request failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalFiles: CodeFile[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const line = raw.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            const json = line.slice(6);
            try {
              const event = JSON.parse(json) as PipelineEvent;
              if (event.type === "finished") finalFiles = event.files;
              handleEvent(event);
            } catch {
              // ignore malformed
            }
          }
        }

        if (finalFiles.length > 0) {
          const id = await addToHistory({ prompt: trimmed, files: finalFiles });
          if (id) setShareId(id);
        }
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          setError("Cancelled");
        } else {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, addToHistory]
  );

  function handleEvent(event: PipelineEvent) {
    switch (event.type) {
      case "started":
        setCached(Boolean(event.cached));
        return;
      case "phase":
        setPhases((prev) =>
          prev.map((p) =>
            p.key === event.key
              ? {
                  ...p,
                  label: event.label || p.label,
                  status: event.status,
                  durationMs: event.durationMs ?? p.durationMs,
                }
              : p
          )
        );
        return;
      case "thought":
        setThought(event.text);
        return;
      case "tool_used":
        setToolLog((prev) => [...prev, event.tool]);
        return;
      case "finished":
        setFiles(event.files);
        setTotalDurationMs(event.totalDurationMs);
        // Mark any leftover phases as done so the UI looks complete
        setPhases((prev) =>
          prev.map((p) => (p.status === "done" ? p : { ...p, status: "done" }))
        );
        return;
      case "failed":
        setError(event.error);
        // Mark current "running" phase as done so the spinner stops
        setPhases((prev) =>
          prev.map((p) => (p.status === "running" ? { ...p, status: "pending" } : p))
        );
        return;
      // Legacy 6-agent events (only fire in ?mode=full debug path) — ignore
      case "agent_started":
      case "agent_completed":
      case "agent_delta":
      case "agent_tool":
        return;
      default:
        return;
    }
  }

  const handleShare = useCallback(async () => {
    if (!files.length || !prompt) return;
    if (shareId) return; // already saved
    const id = await addToHistory({ prompt, files });
    if (id) setShareId(id);
  }, [files, prompt, shareId, addToHistory]);

  const handleRestoreHistory = useCallback((entry: { prompt: string; files: CodeFile[] }) => {
    setPrompt(entry.prompt);
    setFiles(entry.files);
    setPhases(initialPhases().map((p) => ({ ...p, status: "done" as const, durationMs: 0 })));
    setThought(undefined);
    setToolLog([]);
    setTotalDurationMs(0);
    setCached(true);
    setError(undefined);
    setShareId(undefined);
  }, []);

  const handleSelectTemplate = useCallback((label: string) => {
    const demo = demos.find(d => d.label === label);
    if (!demo) return;
    setPrompt(demo.prompt);
    // The generate API always checks the cache first for known prompts,
    // so this returns instantly from the pre-baked fixture (~200ms).
    start(demo.prompt);
  }, [demos, start]);

  const hasResult = files.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        history={history}
        onNewGeneration={() => { setPrompt(""); resetState(); }}
        onRestoreHistory={handleRestoreHistory}
        onDeleteHistory={removeFromHistory}
        onSelectTemplate={handleSelectTemplate}
        activePrompt={prompt}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="overflow-y-auto flex-1 p-4 lg:p-5 flex flex-col gap-4">
          <Header />

          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {hasResult || busy ? "Your component" : "Describe your UI"}
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  {hasResult && !busy
                    ? "Edit the prompt to regenerate, or click any template in the sidebar."
                    : "Type what you want and hit Generate. Or pick a template from the sidebar."}
                </p>
              </div>
              {hasResult && (
                <span
                  className={
                    "chip " +
                    (cached
                      ? "text-violet-300 border-violet-500/30 bg-violet-500/5"
                      : "text-emerald-300 border-emerald-500/30 bg-emerald-500/5")
                  }
                >
                  {cached ? "Template" : "Live"}
                </span>
              )}
            </div>

            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={() => start(prompt)}
              onCancel={cancel}
              busy={busy}
            />

            {error && !busy && (
              <div className="glass border-err/40 bg-err/5 p-3 text-sm text-err animate-fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Something went wrong</div>
                    <div className="text-xs text-err/80 mt-0.5">{error}</div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="grid flex-1 min-h-[560px] grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
            <div className="lg:max-h-[calc(100vh-320px)] lg:overflow-y-auto">
              <GenerationProgress
                phases={phases}
                thought={thought}
                toolLog={toolLog}
                busy={busy}
                cached={cached}
                error={error}
                totalDurationMs={totalDurationMs}
              />
            </div>
            <div className="min-h-[560px]">
              <WorkspaceTabs
                files={files}
                hasResult={hasResult}
                prompt={prompt}
                shareId={shareId}
                onShare={handleShare}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const email = user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="text-xs text-white/40">
          One agent · React + Tailwind + Recharts · streamed live
        </p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://cursor.com/docs/api/sdk/typescript"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost"
          suppressHydrationWarning
        >
          <Github className="h-3.5 w-3.5" />
          Built on Cursor SDK
        </a>

        {user && (
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 rounded-lg border border-bg-border bg-bg-soft px-2 py-1 text-xs hover:border-white/20 transition-colors"
              aria-label="User menu"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-bold text-white">
                {initials}
              </div>
              <span className="hidden text-white/70 sm:inline">{email}</span>
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-xl border border-bg-border bg-bg-card p-1 shadow-2xl shadow-black/50">
                  <div className="border-b border-bg-border px-3 py-2">
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
                      <UserIcon className="h-3 w-3" /> Signed in
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/80">{email}</p>
                  </div>
                  <button
                    onClick={async () => { await signOut(); window.location.href = "/"; }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-white/70 hover:bg-white/5 hover:text-rose-300 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
