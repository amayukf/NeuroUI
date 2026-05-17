"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Check, Copy, FileCode, FileJson, FileText } from "lucide-react";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-white/40 text-sm">
      Loading editor...
    </div>
  ),
});

export interface CodeFile {
  path: string;
  contents: string;
}

interface CodeViewProps {
  files: CodeFile[];
  /** Optional initial selection. Defaults to /src/App.tsx if present. */
  initialPath?: string;
}

function languageFor(path: string): string {
  if (path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".jsx")) return "javascript";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  return "plaintext";
}

function iconFor(path: string) {
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return FileCode;
  if (path.endsWith(".json")) return FileJson;
  return FileText;
}

export function CodeView({ files, initialPath }: CodeViewProps) {
  const defaultPath =
    initialPath ??
    files.find((f) => f.path === "/src/App.tsx")?.path ??
    files[0]?.path;

  const [active, setActive] = useState<string | undefined>(defaultPath);
  const [copied, setCopied] = useState(false);

  const activeFile = useMemo(
    () => files.find((f) => f.path === active) ?? files[0],
    [active, files]
  );

  if (!activeFile) {
    return (
      <div className="flex h-full items-center justify-center text-white/40 text-sm">
        No files yet — run a generation.
      </div>
    );
  }

  async function copy() {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.contents);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-bg-border bg-bg-soft px-3 py-2">
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {files.map((f) => {
            const Icon = iconFor(f.path);
            const isActive = f.path === activeFile.path;
            return (
              <button
                key={f.path}
                onClick={() => setActive(f.path)}
                className={`group inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-mono transition-colors ${
                  isActive
                    ? "bg-bg-card text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.path.replace(/^\//, "")}
              </button>
            );
          })}
        </div>
        <button
          onClick={copy}
          className="btn-ghost ml-2 shrink-0"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-ok" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <Monaco
          height="100%"
          path={activeFile.path}
          value={activeFile.contents}
          language={languageFor(activeFile.path)}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily:
              '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>
    </div>
  );
}
