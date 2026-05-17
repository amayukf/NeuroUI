"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import type { CodeFile } from "./CodeView";

interface PreviewProps {
  files: CodeFile[];
}

// ── Sanitise ──────────────────────────────────────────────────────────
function sanitiseCode(raw: string): string {
  if (!raw) return "";
  let s = raw;
  const fenced = s.match(/```(?:tsx?|jsx?|typescript|javascript)?\r?\n([\s\S]*?)```/);
  if (fenced) s = fenced[1];
  s = s.split("\n").filter((l) => !/^\s*```/.test(l)).join("\n");
  s = s
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"');
  const t = s.trim();
  if (!/^(import|export|const|function|class|type|interface|\/\/|\/\*|"use)/.test(t)) {
    const idx = s.search(/^(import|export|const|function|class)\s/m);
    if (idx > 0) s = s.slice(idx);
  }
  return s.trim();
}

// ── Build the module code that runs inside the iframe ─────────────────
function buildModuleCode(sanitised: string): string {
  let code = sanitised
    .replace(/^import\s+React[\s,{][^;]*from\s+['"]react['"];\s*\n/gm, "")
    .replace(/^import\s+\{[^}]+\}\s+from\s+['"]react['"];\s*\n/gm, "")
    .replace(/^import\s+type\s+\{[^}]+\}\s+from\s+['"]react['"];\s*\n/gm, "")
    .replace(/^import\s+\{[^}]+\}\s+from\s+['"]recharts['"];\s*\n/gm, "")
    .replace(/^import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"];\s*\n/gm, "")
    .replace(/^export\s+default\s+(function|class|const|let|var)\s+App/gm, "$1 App")
    .replace(/^export\s+default\s+App\s*;?\s*$/gm, "");

  return `\
import React,{useState,useEffect,useCallback,useMemo,useRef}from'react';
import{createRoot}from'react-dom/client';
import{
  LineChart,Line,AreaChart,Area,BarChart,Bar,
  PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,
  Tooltip,Legend,ResponsiveContainer,
  RadarChart,Radar,PolarGrid,PolarAngleAxis,
  ScatterChart,Scatter,ZAxis,ComposedChart,
  ReferenceLine,ReferenceArea,LabelList
}from'recharts';
import{
  TrendingUp,TrendingDown,Users,DollarSign,Activity,Settings,
  Plus,Minus,X,Check,ChevronDown,ChevronUp,ChevronRight,ChevronLeft,
  Search,Bell,Home,BarChart2,LogOut,Edit,Trash2,Eye,EyeOff,
  Download,Upload,Filter,ArrowUp,ArrowDown,ArrowRight,ArrowLeft,
  Star,Heart,Share2,Menu,Clock,Mail,Phone,Globe,Lock,Unlock,
  Info,AlertCircle,CheckCircle,XCircle,Loader2,RefreshCw,
  Zap,Shield,Code,Database,Cpu,Cloud,Server,Wifi,
  Bookmark,Calendar,Tag,Layers,Package,Box,Grid,List,
  Send,Paperclip,Image,Video,Mic,Volume2,Play,Pause,
  Github,Twitter,Linkedin,ExternalLink,Link,Copy,
  Maximize,Minimize,Sidebar,Layout,AlignLeft,AlignRight,
  Type,Hash,AtSign,MoreHorizontal,MoreVertical,
  FileText,Folder,FolderOpen,Save,PlusCircle,MinusCircle,
  User,UserPlus,UserMinus,UserCheck,Navigation,
  MessageCircle,MessageSquare,Flag,Award,Gift,Truck,
  ShoppingCart,ShoppingBag,CreditCard,Wallet,Banknote,
  Map,Compass,Bold,Italic,Slash,Dot,HelpCircle,
  ToggleLeft,ToggleRight,Sliders,Radio,CheckSquare
}from'lucide-react';

${code}

;(()=>{
  const el=document.getElementById('root');
  if(!el)return;

  class EB extends React.Component{
    constructor(p){super(p);this.state={err:null};}
    static getDerivedStateFromError(e){return{err:e};}
    componentDidCatch(e){
      window.parent?.postMessage({type:'preview-error',message:String(e.message)},'*');
    }
    render(){
      if(this.state.err){
        return React.createElement('div',{
          style:{padding:24,color:'#fca5a5',fontFamily:'ui-monospace,monospace',
                 fontSize:12,background:'#0f0f0f',minHeight:'100vh'}
        },
          React.createElement('div',{style:{color:'#fb7185',fontWeight:600,marginBottom:8}},
            'Runtime error in generated component'),
          React.createElement('pre',{
            style:{whiteSpace:'pre-wrap',color:'#fca5a5',background:'#1a1a1a',
                   padding:12,borderRadius:6,border:'1px solid #2a2a2a',overflow:'auto'}
          },String(this.state.err.stack||this.state.err.message||this.state.err)),
          React.createElement('p',{style:{marginTop:12,color:'#71717a',fontSize:11}},
            'Regenerate or check the Code tab.')
        );
      }
      return this.props.children;
    }
  }

  // Wrapper sends postMessage AFTER React's first paint (useEffect fires post-commit)
  function ReadyNotifier({children}){
    useEffect(()=>{
      window.parent?.postMessage({type:'preview-ready'},'*');
    },[]);
    return children;
  }

  const AppComp=typeof App!=='undefined'?App:
    ()=>React.createElement('div',{
      style:{color:'#71717a',padding:24,fontFamily:'ui-sans-serif,system-ui,sans-serif'}
    },'No App component found');

  const root=createRoot(el);
  root.render(
    React.createElement(EB,null,
      React.createElement(ReadyNotifier,null,
        React.createElement(AppComp)
      )
    )
  );
})();
`;
}

// ── Build the full srcdoc HTML ─────────────────────────────────────────
function buildSrcdoc(appCode: string): string {
  const moduleCode = buildModuleCode(appCode)
    .replace(/<\/script>/gi, "<\\/script>");

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
    "recharts":          "https://esm.sh/recharts@2.13.3",
    "lucide-react":      "https://esm.sh/lucide-react@0.460.0"
  }
}
</script>
<script>
window.tailwind={config:{darkMode:'class'}};
// Catch unhandled errors + rejected promises → notify parent → show error in iframe
window.addEventListener('error',function(e){
  window.parent&&window.parent.postMessage({type:'preview-error',message:String(e.message||e)},'*');
  var r=document.getElementById('root');
  if(r&&!r.innerHTML)r.innerHTML='<div style="padding:24px;color:#fca5a5;font-family:ui-monospace,monospace;font-size:12px;background:#0f0f0f;min-height:100vh"><b style="color:#fb7185">Script error</b><pre style="margin-top:8px;white-space:pre-wrap">'+String(e.message)+'</pre></div>';
});
window.addEventListener('unhandledrejection',function(e){
  var msg=e.reason&&e.reason.message?e.reason.message:String(e.reason);
  window.parent&&window.parent.postMessage({type:'preview-error',message:msg},'*');
  var r=document.getElementById('root');
  if(r&&!r.innerHTML)r.innerHTML='<div style="padding:24px;color:#fca5a5;font-family:ui-monospace,monospace;font-size:12px;background:#0f0f0f;min-height:100vh"><b style="color:#fb7185">Module error</b><pre style="margin-top:8px;white-space:pre-wrap">'+msg+'</pre></div>';
});
</script>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box}
html,body,#root{height:100%;margin:0;padding:0;background:#0f0f0f;color:#e5e5e5}
body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-type="module" data-presets="react,typescript">
${moduleCode}
</script>
</body>
</html>`;
}

// ── React component ────────────────────────────────────────────────────
export function Preview({ files }: PreviewProps) {
  const srcdoc = useMemo(() => {
    const appFile =
      files.find((f) => f.path === "/src/App.tsx") ??
      files.find((f) => f.path === "/App.tsx") ??
      files.find((f) => f.path.endsWith("App.tsx"));
    if (!appFile?.contents?.trim()) return "";
    const clean = sanitiseCode(appFile.contents);
    if (!clean) return "";
    return buildSrcdoc(clean);
  }, [files]);

  // "ready" is now set by postMessage from inside the iframe AFTER React renders,
  // not by onLoad (which fires before esm.sh packages are downloaded).
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [tookTooLong, setTookTooLong] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for messages from the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "preview-ready") {
        if (timerRef.current) clearTimeout(timerRef.current);
        setStatus("ready");
        setIframeError(null);
        setTookTooLong(false);
      }
      if (e.data?.type === "preview-error") {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIframeError(e.data.message ?? "Unknown error");
        setStatus("error");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Reset whenever code changes
  useEffect(() => {
    if (!srcdoc) { setStatus("idle"); return; }
    setStatus("loading");
    setIframeError(null);
    setTookTooLong(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTookTooLong(true), 20_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [srcdoc]);

  const handleRefresh = useCallback(() => {
    if (!iframeRef.current || !srcdoc) return;
    setStatus("loading");
    setIframeError(null);
    setTookTooLong(false);
    iframeRef.current.srcdoc = "";
    requestAnimationFrame(() => {
      if (iframeRef.current) iframeRef.current.srcdoc = srcdoc;
    });
    timerRef.current = setTimeout(() => setTookTooLong(true), 20_000);
  }, [srcdoc]);

  if (!srcdoc) {
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

  return (
    <div className="relative flex h-full flex-col bg-[#0f0f0f]">
      {/* iframe always mounted — loading happens in background */}
      <iframe
        ref={iframeRef}
        key={srcdoc.slice(0, 200)}
        srcDoc={srcdoc}
        title="Component preview"
        sandbox="allow-scripts allow-same-origin"
        className="flex-1 border-0 bg-[#0f0f0f]"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        title="Refresh preview"
        aria-label="Refresh preview"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#2a2a2a] bg-[#1a1a1a]/90 backdrop-blur text-[#71717a] hover:text-white hover:border-[#3a3a3a] active:scale-95 transition-all"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>

      {/* Loading overlay — hidden only after postMessage from iframe */}
      {status === "loading" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f0f0f]">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
          <p className="mt-3 text-sm text-[#71717a]">Rendering preview…</p>
          <p className="mt-1 text-[11px] text-[#52525b]">
            Loading React + Recharts via CDN (fast after first load)
          </p>
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

      {/* Error panel — shown when iframe sends preview-error message */}
      {status === "error" && iframeError && (
        <div className="absolute inset-0 z-20 overflow-y-auto bg-[#0f0f0f] p-6">
          <div className="mx-auto max-w-lg">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              <span className="text-sm font-semibold text-rose-300">Preview failed to render</span>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-rose-500/20 bg-[#1a1a1a] p-4 font-mono text-[11px] leading-relaxed text-rose-200/80">
              {iframeError}
            </pre>
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

      {/* Debug strip */}
      <div className="shrink-0 border-t border-[#1a1a1a] bg-[#080808] px-3 py-1 font-mono text-[10px] text-[#52525b]">
        <span className="text-[#71717a]">Files: </span>
        {files.filter((f) => f.path.endsWith(".tsx")).length}
        <span className="mx-2 text-[#1a1a1a]">|</span>
        <span className="text-[#71717a]">Renderer: </span>srcdoc+Babel+esm.sh
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
    </div>
  );
}
