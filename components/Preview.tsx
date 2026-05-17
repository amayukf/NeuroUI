"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import type { CodeFile } from "./CodeView";

// ── Babel (loaded once in the parent window, not in the iframe) ──────────
declare global { interface Window { Babel: { transform(code: string, opts: object): { code: string } }; } }

let _babelPromise: Promise<void> | null = null;
function ensureBabel(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Babel) return Promise.resolve();
  if (_babelPromise) return _babelPromise;
  _babelPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js";
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Babel"));
    document.head.appendChild(s);
  });
  return _babelPromise;
}

async function transformTSX(code: string): Promise<{ js: string; error?: string }> {
  try {
    await ensureBabel();
    const result = window.Babel.transform(code, {
      presets: ["react", "typescript"],
      filename: "App.tsx",
      sourceType: "module",
    });
    return { js: result.code ?? "" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { js: "", error: msg };
  }
}

// ── Sanitise raw agent output ────────────────────────────────────────────
function sanitiseCode(raw: string): string {
  if (!raw) return "";
  let s = raw;
  // Extract from fenced code block if present
  const fenced = s.match(/```(?:tsx?|jsx?|typescript|javascript)?\r?\n([\s\S]*?)```/);
  if (fenced) s = fenced[1];
  s = s.split("\n").filter((l) => !/^\s*```/.test(l)).join("\n");
  // Fix smart quotes
  s = s
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"');
  // Skip leading prose before first import/export/function/const
  const t = s.trim();
  if (!/^(import|export|const|function|class|type|interface|\/\/|\/\*|"use)/.test(t)) {
    const idx = s.search(/^(import|export|const|function|class)\s/m);
    if (idx > 0) s = s.slice(idx);
  }
  return s.trim();
}

// ── Build the module code to be compiled ────────────────────────────────
function buildModuleCode(sanitised: string): string {
  // Strip any imports the agent wrote — we inject canonical ones
  let code = sanitised
    .replace(/^import\s+React[\s,{][^;]*from\s+['"]react['"];\s*\n/gm, "")
    .replace(/^import\s+\{[^}]+\}\s+from\s+['"]react['"];\s*\n/gm, "")
    .replace(/^import\s+type\s+\{[^}]+\}\s+from\s+['"]react['"];\s*\n/gm, "")
    .replace(/^import\s+\{[^}]+\}\s+from\s+['"]recharts['"];\s*\n/gm, "")
    .replace(/^import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"];\s*\n/gm, "")
    .replace(/^export\s+default\s+(function|class|const|let|var)\s+App/gm, "$1 App")
    .replace(/^export\s+default\s+App\s*;?\s*$/gm, "");

  return `\
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ScatterChart, Scatter, ZAxis, ComposedChart,
  ReferenceLine, ReferenceArea, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Activity, Settings,
  Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  Search, Bell, Home, BarChart2, LogOut, Edit, Trash2, Eye, EyeOff,
  Download, Upload, Filter, ArrowUp, ArrowDown, ArrowRight, ArrowLeft,
  Star, Heart, Share2, Menu, Clock, Mail, Phone, Globe, Lock, Unlock,
  Info, AlertCircle, CheckCircle, XCircle, Loader2, RefreshCw,
  Zap, Shield, Code, Database, Cpu, Cloud, Server, Wifi,
  Bookmark, Calendar, Tag, Layers, Package, Box, Grid, List,
  Send, Paperclip, Image, Video, Mic, Volume2, Play, Pause,
  Github, Twitter, Linkedin, ExternalLink, Link, Copy,
  Maximize, Minimize, Sidebar, Layout, AlignLeft, AlignRight,
  Type, Hash, AtSign, MoreHorizontal, MoreVertical,
  FileText, Folder, FolderOpen, Save, PlusCircle, MinusCircle,
  User, UserPlus, UserMinus, UserCheck, Navigation,
  MessageCircle, MessageSquare, Flag, Award, Gift, Truck,
  ShoppingCart, ShoppingBag, CreditCard, Wallet, Banknote,
  Map, Compass, Bold, Italic, Slash, Dot, HelpCircle,
  ToggleLeft, ToggleRight, Sliders, Radio, CheckSquare
} from 'lucide-react';

${code}

;(function mount() {
  const el = document.getElementById('root');
  if (!el) return;

  class EB extends React.Component {
    constructor(p) { super(p); this.state = { err: null }; }
    static getDerivedStateFromError(e) { return { err: e }; }
    componentDidCatch(e, info) {
      window.parent && window.parent.postMessage({
        type: 'preview-error',
        message: String(e.message || e),
        stack: String(e.stack || ''),
        componentStack: String((info && info.componentStack) || ''),
        source: 'EB',
        reactVersion: React && React.version,
      }, '*');
    }
    render() {
      if (this.state.err) {
        return React.createElement('div', {
          style: { padding: 24, color: '#fca5a5', fontFamily: 'ui-monospace,monospace', fontSize: 12, background: '#0f0f0f', minHeight: '100vh' }
        },
          React.createElement('div', { style: { color: '#fb7185', fontWeight: 600, marginBottom: 8 } }, 'Runtime error'),
          React.createElement('pre', {
            style: { whiteSpace: 'pre-wrap', color: '#fca5a5', background: '#1a1a1a', padding: 12, borderRadius: 6, border: '1px solid #2a2a2a', overflow: 'auto' }
          }, String(this.state.err.stack || this.state.err.message || this.state.err)),
          React.createElement('p', { style: { marginTop: 12, color: '#71717a', fontSize: 11 } }, 'Regenerate or check the Code tab.')
        );
      }
      return this.props.children;
    }
  }

  // ReadyNotifier fires postMessage AFTER React's first paint
  function ReadyNotifier({ children }) {
    useEffect(function() {
      window.parent && window.parent.postMessage({ type: 'preview-ready' }, '*');
    }, []);
    return children;
  }

  const AppComp = typeof App !== 'undefined' ? App
    : function() { return React.createElement('div', { style: { color: '#71717a', padding: 24 } }, 'No App component found'); };

  createRoot(el).render(
    React.createElement(EB, null,
      React.createElement(ReadyNotifier, null,
        React.createElement(AppComp)
      )
    )
  );
})();
`;
}

// ── Build full iframe HTML (no Babel inside — receives compiled JS) ───────
function buildSrcdoc(compiledJS: string): string {
  // Escape </script> inside the injected JS
  const safe = compiledJS.replace(/<\/script>/gi, "<\\/script>");

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script type="importmap">
{
  "imports": {
    "react":             "https://esm.sh/react@18.3.1",
    "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
    "react-dom":         "https://esm.sh/react-dom@18.3.1",
    "react-dom/client":  "https://esm.sh/react-dom@18.3.1/client",
    "recharts":          "https://esm.sh/recharts@2.13.3?external=react,react-dom",
    "lucide-react":      "https://esm.sh/lucide-react@0.460.0?external=react"
  }
}
</script>
<script>
// Catch errors in cross-origin module imports (esm.sh) before React mounts
window.addEventListener('error', function(e) {
  var stack = (e.error && e.error.stack) ? String(e.error.stack) : '';
  var msg = String(e.message || (e.error && e.error.message) || e);
  var r = document.getElementById('root');
  if (r && !r.hasChildNodes()) {
    r.innerHTML = '<div style="padding:24px;color:#fca5a5;font-family:ui-monospace,monospace;font-size:12px;background:#0f0f0f;min-height:100vh">' +
      '<b style="color:#fb7185">Error loading preview</b>' +
      '<pre style="margin-top:8px;white-space:pre-wrap;background:#1a1a1a;padding:12px;border-radius:6px">' +
      msg + (stack ? '\\n\\n' + stack : '') + '</pre></div>';
  }
  window.parent && window.parent.postMessage({ type: 'preview-error', message: msg, stack: stack, source: 'window.error' }, '*');
});
window.addEventListener('unhandledrejection', function(e) {
  var msg = e.reason && e.reason.message ? e.reason.message : String(e.reason);
  var stack = (e.reason && e.reason.stack) ? String(e.reason.stack) : '';
  var r = document.getElementById('root');
  if (r && !r.hasChildNodes()) {
    r.innerHTML = '<div style="padding:24px;color:#fca5a5;font-family:ui-monospace,monospace;font-size:12px;background:#0f0f0f;min-height:100vh">' +
      '<b style="color:#fb7185">Module error</b>' +
      '<pre style="margin-top:8px;white-space:pre-wrap;background:#1a1a1a;padding:12px;border-radius:6px">' + msg + (stack ? '\\n\\n' + stack : '') + '</pre></div>';
  }
  window.parent && window.parent.postMessage({ type: 'preview-error', message: msg, stack: stack, source: 'unhandledrejection' }, '*');
});
</script>
<script>window.tailwind = { config: { darkMode: 'class' } };</script>
<script src="https://cdn.tailwindcss.com"></script>
<style>
*,*::before,*::after { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; padding: 0; background: #0f0f0f; color: #e5e5e5; }
body { font-family: ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; -webkit-font-smoothing: antialiased; }
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
${safe}
</script>
</body>
</html>`;
}

// ── React component ────────────────────────────────────────────────────────
interface PreviewProps { files: CodeFile[]; }

export function Preview({ files }: PreviewProps) {
  const [compiledJS, setCompiledJS] = useState<string | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [iframeStack, setIframeStack] = useState<string | null>(null);
  const [tookTooLong, setTookTooLong] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Extract App.tsx from files
  const rawCode = useMemo(() => {
    const f =
      files.find((f) => f.path === "/src/App.tsx") ??
      files.find((f) => f.path === "/App.tsx") ??
      files.find((f) => f.path.endsWith("App.tsx"));
    return f?.contents?.trim() ?? "";
  }, [files]);

  // Compile when rawCode changes (runs Babel in parent window)
  useEffect(() => {
    if (!rawCode) {
      setCompiledJS(null);
      setCompileError(null);
      setStatus("idle");
      return;
    }
    setCompileError(null);
    setStatus("loading");
    setIframeError(null);
    setTookTooLong(false);

    const sanitised = sanitiseCode(rawCode);
    const moduleCode = buildModuleCode(sanitised);

    transformTSX(moduleCode).then(({ js, error }) => {
      if (error) {
        setCompileError(error);
        setStatus("error");
      } else {
        setCompiledJS(js);
      }
    });
  }, [rawCode]);

  // Start timeout once we have compiled JS
  useEffect(() => {
    if (!compiledJS) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTookTooLong(true), 20_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [compiledJS, refreshKey]);

  // Listen for postMessage from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "preview-ready") {
        if (timerRef.current) clearTimeout(timerRef.current);
        setStatus("ready");
        setIframeError(null);
        setIframeStack(null);
        setTookTooLong(false);
      }
      if (e.data?.type === "preview-error") {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIframeError(e.data.message ?? "Unknown error");
        setIframeStack(
          [e.data.stack, e.data.componentStack].filter(Boolean).join("\n\n") || null
        );
        setStatus("error");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const srcdoc = useMemo(
    () => (compiledJS ? buildSrcdoc(compiledJS) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compiledJS, refreshKey]
  );

  const handleRefresh = useCallback(() => {
    setStatus("loading");
    setIframeError(null);
    setTookTooLong(false);
    setRefreshKey((k) => k + 1);
  }, []);

  // ── Empty state ──────────────────────────────────────────────────────
  if (!rawCode) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0f0f0f] p-8 text-center">
        <div>
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a]" />
          <p className="text-sm font-medium text-[#71717a]">Preview will appear here</p>
          <p className="mt-1 text-xs text-[#52525b]">Generate a component to see it live.</p>
        </div>
      </div>
    );
  }

  // ── Compile error (Babel failed — syntax error in generated code) ────
  if (compileError) {
    return (
      <div className="flex h-full flex-col bg-[#0f0f0f]">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-lg">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              <span className="text-sm font-semibold text-rose-300">Syntax error in generated code</span>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-rose-500/20 bg-[#1a1a1a] p-4 font-mono text-[11px] leading-relaxed text-rose-200/80">
              {compileError}
            </pre>
            <p className="mt-3 text-xs text-[#71717a]">
              Try regenerating — the AI occasionally produces minor syntax errors.
            </p>
          </div>
        </div>
        <DebugStrip files={files} status="error" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-[#0f0f0f]">
      {/* iframe — compiled JS injected, no Babel needed inside */}
      {srcdoc && (
        <iframe
          ref={iframeRef}
          key={`${rawCode.slice(0, 80)}-${refreshKey}`}
          srcDoc={srcdoc}
          title="Component preview"
          sandbox="allow-scripts allow-same-origin"
          className="flex-1 border-0"
          style={{ width: "100%", height: "100%", background: "#0f0f0f" }}
        />
      )}

      {/* Refresh */}
      <button
        onClick={handleRefresh}
        title="Refresh preview"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#2a2a2a] bg-[#1a1a1a]/90 backdrop-blur text-[#71717a] hover:text-white hover:border-[#3a3a3a] active:scale-95 transition-all"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>

      {/* Loading overlay — hidden after postMessage from iframe */}
      {(status === "loading" || status === "idle") && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f0f0f]">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
          <p className="mt-3 text-sm text-[#71717a]">
            {status === "idle" ? "Compiling…" : "Rendering preview…"}
          </p>
          <p className="mt-1 text-[11px] text-[#52525b]">Loading React via CDN (fast after first load)</p>
          {tookTooLong && (
            <button
              onClick={handleRefresh}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-white active:scale-95 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Taking too long? Retry
            </button>
          )}
        </div>
      )}

      {/* Runtime error overlay */}
      {status === "error" && iframeError && (
        <div className="absolute inset-0 z-20 overflow-y-auto bg-[#0f0f0f] p-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              <span className="text-sm font-semibold text-rose-300">Preview runtime error</span>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-rose-500/20 bg-[#1a1a1a] p-4 font-mono text-[11px] leading-relaxed text-rose-200/80">
              {iframeError}
            </pre>
            {iframeStack && (
              <details className="mt-3" open>
                <summary className="cursor-pointer text-xs text-[#71717a] hover:text-[#a1a1aa]">Full stack / component stack</summary>
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-3 font-mono text-[10px] leading-relaxed text-[#a1a1aa]">
                  {iframeStack}
                </pre>
              </details>
            )}
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-white active:scale-95 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      <DebugStrip files={files} status={status} />
    </div>
  );
}

function DebugStrip({ files, status }: { files: CodeFile[]; status: string }) {
  return (
    <div className="shrink-0 border-t border-[#1a1a1a] bg-[#080808] px-3 py-1 font-mono text-[10px] text-[#52525b]">
      <span className="text-[#71717a]">Files: </span>
      {files.filter((f) => f.path.endsWith(".tsx")).length}
      <span className="mx-2 text-[#1a1a1a]">|</span>
      <span className="text-[#71717a]">Renderer: </span>Babel(parent)+esm.sh
      <span className="mx-2 text-[#1a1a1a]">|</span>
      <span className="text-[#71717a]">Status: </span>
      <span className={
        status === "ready" ? "text-emerald-400" :
        status === "error" ? "text-rose-400" :
        status === "loading" ? "text-violet-400" : "text-[#52525b]"
      }>
        {status}
      </span>
    </div>
  );
}
