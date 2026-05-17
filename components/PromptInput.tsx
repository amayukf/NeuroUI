"use client";

import { Sparkles, Square, Wand2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

const MAX_CHARS = 1000;
const LINE_HEIGHT = 24;
const MAX_LINES = 6;

interface PromptInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  busy: boolean;
  disabled?: boolean;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  busy,
  disabled,
}: PromptInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, LINE_HEIGHT * MAX_LINES) + "px";
  }, [value]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!busy && value.trim()) onSubmit();
    }
  }

  const enhance = useCallback(async () => {
    if (!value.trim() || enhancing) return;
    setEnhancing(true);
    setEnhanced(false);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value }),
      });
      if (res.ok) {
        const { enhanced: text } = await res.json();
        if (text) {
          onChange(text);
          setEnhanced(true);
          setTimeout(() => setEnhanced(false), 2000);
        }
      }
    } catch {
      // silently fail — just keep the original prompt
    } finally {
      setEnhancing(false);
    }
  }, [value, enhancing, onChange]);

  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.8;
  const overLimit = charCount > MAX_CHARS;

  return (
    <div className="glass p-3">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) onChange(e.target.value);
        }}
        onKeyDown={handleKey}
        placeholder="Describe the UI you want. E.g. 'A SaaS analytics dashboard with KPI cards, charts, and a data table.'"
        rows={3}
        disabled={busy || disabled}
        className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 outline-none disabled:opacity-60"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/40">
            <kbd className="rounded border border-bg-border bg-bg-soft px-1 py-0.5 text-[10px] font-mono">⌘</kbd>
            {" + "}
            <kbd className="rounded border border-bg-border bg-bg-soft px-1 py-0.5 text-[10px] font-mono">↵</kbd>
            {" generate"}
          </div>
          {value.trim() && !busy && (
            <button
              onClick={enhance}
              disabled={enhancing || disabled}
              title="Enhance your prompt with AI"
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 active:scale-95 transition-all disabled:opacity-50"
            >
              {enhancing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : enhanced ? (
                <Sparkles className="h-3 w-3 text-emerald-400" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
              {enhancing ? "Enhancing…" : enhanced ? "Enhanced!" : "Enhance"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={"text-[10px] font-mono transition-colors " + (overLimit ? "text-rose-400" : nearLimit ? "text-amber-400" : "text-white/30")}>
            {charCount}/{MAX_CHARS}
          </span>
          {busy ? (
            <button onClick={onCancel} className="btn-ghost">
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!value.trim() || disabled || overLimit}
              className="btn-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
