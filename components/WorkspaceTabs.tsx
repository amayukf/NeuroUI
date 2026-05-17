"use client";

import { Eye, Code as CodeIcon, Columns2, Download, ExternalLink, Share2, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { CodeView, type CodeFile } from "./CodeView";
import { Preview } from "./Preview";
import { downloadAsZip, openInStackBlitz, openInCodeSandbox } from "../lib/zip-export";

interface WorkspaceTabsProps {
  files: CodeFile[];
  hasResult: boolean;
  prompt?: string;
  shareId?: string;
  onShare?: () => Promise<void>;
}

type Mode = "split" | "preview" | "code" | "export";

export function WorkspaceTabs({ files, hasResult, prompt = "", shareId, onShare }: WorkspaceTabsProps) {
  const [mode, setMode] = useState<Mode>("split");
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    try {
      if (onShare) await onShare();
      const url = shareId
        ? `${window.location.origin}/g/${shareId}`
        : window.location.href;
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard may fail in non-secure contexts
    } finally {
      setSharing(false);
    }
  }, [sharing, shareId, onShare]);

  const handleDownloadZip = useCallback(async () => {
    if (downloading || !files.length) return;
    setDownloading(true);
    try {
      await downloadAsZip(files, prompt);
    } finally {
      setDownloading(false);
    }
  }, [downloading, files, prompt]);

  return (
    <div className="glass flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-bg-border bg-bg-soft px-3 py-2">
        <div className="flex items-center gap-1">
          <ModeButton label="Preview" icon={Eye} active={mode === "preview"} onClick={() => setMode("preview")} />
          <ModeButton label="Split" icon={Columns2} active={mode === "split"} onClick={() => setMode("split")} />
          <ModeButton label="Code" icon={CodeIcon} active={mode === "code"} onClick={() => setMode("code")} />
          {hasResult && (
            <ModeButton label="Export" icon={Download} active={mode === "export"} onClick={() => setMode("export")} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasResult && (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-white/50 hover:text-white/80 transition-colors disabled:opacity-50"
            >
              {shareCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              {shareCopied ? "Copied!" : "Share"}
            </button>
          )}
          <div className="text-xs text-white/40 font-mono">
            {hasResult ? `${files.length} files` : "Idle"}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {!hasResult ? (
          mode === "preview" ? (
            <div className="relative h-full">
              <Preview files={[]} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center">
                <EmptyState />
              </div>
            </div>
          ) : mode === "split" ? (
            <div className="grid h-full grid-cols-1 md:grid-cols-2 min-h-0">
              <div className="min-h-0 border-r border-bg-border">
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-bg-border bg-bg-soft" />
                    <h3 className="text-sm font-semibold text-white/80">Code will appear here</h3>
                    <p className="mt-1 text-xs text-white/40">
                      Generate a component to view editable source files.
                    </p>
                  </div>
                </div>
              </div>
              <div className="min-h-0 relative">
                <Preview files={[]} />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center">
                  <EmptyState />
                </div>
              </div>
            </div>
          ) : (
            <EmptyState />
          )
        ) : mode === "preview" ? (
          <Preview files={files} />
        ) : mode === "code" ? (
          <CodeView files={files} />
        ) : mode === "export" ? (
          <ExportPanel
            files={files}
            prompt={prompt}
            downloading={downloading}
            onDownloadZip={handleDownloadZip}
            onStackBlitz={() => openInStackBlitz(files, prompt)}
            onCodeSandbox={() => openInCodeSandbox(files)}
          />
        ) : (
          <div className="grid h-full grid-cols-1 md:grid-cols-2 min-h-0">
            <div className="min-h-0 border-r border-bg-border">
              <CodeView files={files} />
            </div>
            <div className="min-h-0">
              <Preview files={files} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? "bg-bg-card text-white" : "text-white/50 hover:text-white/80"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ExportPanel({
  files,
  prompt,
  downloading,
  onDownloadZip,
  onStackBlitz,
  onCodeSandbox,
}: {
  files: CodeFile[];
  prompt: string;
  downloading: boolean;
  onDownloadZip: () => void;
  onStackBlitz: () => void;
  onCodeSandbox: () => void;
}) {
  const appFile = files.find(f => f.path.includes("App.tsx"));
  const lineCount = appFile ? appFile.contents.split("\n").length : 0;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h3 className="text-sm font-semibold text-white">Export generated component</h3>
        <p className="mt-1 text-xs text-white/40">
          Download or open instantly in your favorite online IDE.
        </p>
      </div>

      {appFile && (
        <div className="rounded-xl border border-bg-border bg-bg-soft p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
              <CodeIcon className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">src/App.tsx</p>
              <p className="text-xs text-white/40">{lineCount} lines · TypeScript + Tailwind</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Files", value: String(files.length) },
              { label: "Lines", value: String(lineCount) },
              { label: "Framework", value: "React" },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-bg-border bg-bg-card p-2">
                <div className="text-sm font-semibold text-white">{s.value}</div>
                <div className="text-[10px] text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Download</h4>
        <button
          onClick={onDownloadZip}
          disabled={downloading}
          className="flex w-full items-center gap-3 rounded-xl border border-bg-border bg-bg-soft p-4 text-left hover:border-white/20 hover:bg-bg-card active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
            <Download className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Download as ZIP</p>
            <p className="text-xs text-white/40">Includes package.json, Tailwind config, Vite setup, README</p>
          </div>
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Open online</h4>
        <button
          onClick={onStackBlitz}
          className="flex w-full items-center gap-3 rounded-xl border border-bg-border bg-bg-soft p-4 text-left hover:border-white/20 hover:bg-bg-card active:scale-[0.99] transition-all"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
            <ExternalLink className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Open in StackBlitz</p>
            <p className="text-xs text-white/40">Full VS Code environment in your browser, zero install</p>
          </div>
        </button>
        <button
          onClick={onCodeSandbox}
          className="flex w-full items-center gap-3 rounded-xl border border-bg-border bg-bg-soft p-4 text-left hover:border-white/20 hover:bg-bg-card active:scale-[0.99] transition-all"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
            <ExternalLink className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Open in CodeSandbox</p>
            <p className="text-xs text-white/40">Instant cloud sandbox with hot reload and sharing</p>
          </div>
        </button>
      </div>

      <div className="rounded-xl border border-bg-border bg-bg-soft p-4">
        <p className="text-xs font-medium text-white/60 mb-2">Dependencies included in export</p>
        {["react ^18", "recharts ^2", "lucide-react ^0.460", "tailwindcss ^3", "vite ^6"].map(d => (
          <div key={d} className="flex items-center gap-2 py-0.5">
            <div className="h-1 w-1 rounded-full bg-violet-500" />
            <span className="font-mono text-xs text-white/40">{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-bg-border bg-bg-soft" />
        <h3 className="text-sm font-semibold text-white/80">Preview will appear here</h3>
        <p className="mt-1 text-xs text-white/40">
          Describe what you want above and generate. Preview engine is pre-warmed
          in the background for faster first render.
        </p>
      </div>
    </div>
  );
}
