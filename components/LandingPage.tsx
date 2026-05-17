"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  Sparkles, ArrowRight, Code2, Palette, Shield, Github,
  Check, Star, ChevronRight, Wand2, Cpu, Box, Clock,
  Twitter, MessageCircle,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────
const TYPING_PROMPTS = [
  "A SaaS analytics dashboard with KPI cards and charts…",
  "A login page with Google OAuth and form validation…",
  "A kanban board with drag columns and priority labels…",
  "A pricing page with 3 tiers and feature comparison…",
];

const FEATURES = [
  { icon: Wand2, title: "Natural language → production code",
    desc: "Type what you want. Get a real React + TypeScript + Tailwind component back in seconds. Not a wireframe. Not a template." },
  { icon: Cpu, title: "6 AI agents, 1 shared sandbox",
    desc: "Interpret · Design · Generate · Connect · Validate · Optimize — collaborating through files on disk via the Cursor SDK." },
  { icon: Palette, title: "Beautiful by default",
    desc: "Dark theme, micro-interactions, recharts for data viz, lucide icons. Every output looks like a senior engineer wrote it." },
  { icon: Box, title: "9 instant templates",
    desc: "SaaS dashboards, login pages, pricing, kanban, chat, data tables — click to load. Customize from there." },
  { icon: Code2, title: "Export anywhere",
    desc: "Download as ZIP with Vite + Tailwind config, or open in StackBlitz / CodeSandbox with one click." },
  { icon: Shield, title: "Yours to keep",
    desc: "Save generations to your account. Share via unique URLs. No vendor lock-in — every file is plain React." },
  { icon: Clock, title: "From prompt to preview in 8 seconds",
    desc: "Faster than explaining what you want to a designer. The six-agent pipeline runs in parallel where possible, cutting generation time without cutting quality." },
];

const TEMPLATES = [
  { label: "Analytics dashboard", color: "from-violet-500 to-fuchsia-500" },
  { label: "Login page", color: "from-emerald-500 to-cyan-500" },
  { label: "Pricing page", color: "from-amber-500 to-rose-500" },
  { label: "Kanban board", color: "from-blue-500 to-indigo-500" },
  { label: "E-commerce", color: "from-pink-500 to-violet-500" },
  { label: "Chat UI", color: "from-cyan-500 to-blue-500" },
  { label: "Data table", color: "from-rose-500 to-amber-500" },
  { label: "Team settings", color: "from-indigo-500 to-violet-500" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Engineering Lead, Quorum", rating: 5,
    text: "We use NeuroUI to mock up internal tools before backend work starts. What used to take a designer + frontend dev a full sprint now takes the PM an afternoon." },
  { name: "Marcus Liu", role: "Indie Hacker", rating: 5,
    text: "I shipped 4 SaaS landing pages in a weekend. All real code, all stuff I'd actually deploy. Not a template-builder — it writes the React I'd write." },
  { name: "Aisha Thompson", role: "Frontend Engineer, Linear", rating: 5,
    text: "The recharts integration alone is worth it. Dashboards that took me a day are now 90 seconds. Code quality is genuinely surprising." },
];

const LOGOS = ["Stripe", "Linear", "Vercel", "Figma", "Notion", "Anthropic", "Shopify", "GitHub"];

// ── Main ─────────────────────────────────────────────────────────────
export function LandingPage() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-[#0a0a0a] text-[#e5e5e5]">
      <Nav scrolled={scrolled} user={user} loading={loading} />
      <main>
        <Hero user={user} loading={loading} />
        <LogoMarquee />
        <FeaturesSection />
        <LiveDemoSection />
        <TemplatesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection user={user} loading={loading} />
        <Footer />
      </main>
    </div>
  );
}

// ── Reveal-on-scroll hook ────────────────────────────────────────────
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "-50px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={"reveal " + className} style={{ transitionDelay: delay + "ms" }}>
      {children}
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────
function Nav({ scrolled, user, loading }: { scrolled: boolean; user: unknown; loading: boolean }) {
  return (
    <header className={"sticky top-0 z-40 transition-all " + (scrolled ? "border-b border-[#1a1a1a] bg-[#0a0a0a]/85 backdrop-blur-md" : "bg-transparent")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">NeuroUI</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[#71717a] md:flex">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#templates" className="hover:text-white transition-colors">Templates</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          {!loading && (user ? (
            <Link href="/dashboard" className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black hover:bg-white/90 active:scale-95 transition-all">
              Open dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm text-[#71717a] hover:text-white transition-colors px-3 py-1.5 sm:block">Log in</Link>
              <Link href="/signup" className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black hover:bg-white/90 active:scale-95 transition-all">
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ))}
        </div>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────
function Hero({ user, loading }: { user: unknown; loading: boolean }) {
  const [counter, setCounter] = useState(0);
  const target = 2847;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setCounter(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
      <div className="absolute inset-0 -z-10 animated-gradient" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        <div className="absolute left-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-rose-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <a href="#how-it-works" className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 hover:bg-violet-500/15 transition-colors">
          <Sparkles className="h-3 w-3" />
          Powered by the Cursor Agent SDK
          <ChevronRight className="h-3 w-3" />
        </a>
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
          Plain English in.
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
            Production React out.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-[#a1a1aa] sm:text-lg leading-relaxed">
          NeuroUI is six AI agents that write the React component you&apos;d hire a senior engineer to build — in under 60 seconds. Tailwind, TypeScript, charts, micro-interactions. Ready to ship.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {loading ? (
            <div className="h-11 w-40 animate-pulse rounded-xl bg-[#1a1a1a]" />
          ) : user ? (
            <Link href="/dashboard" className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 active:scale-[0.98] transition-all">
              Open your dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <>
              <Link href="/signup" className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 active:scale-[0.98] transition-all shadow-2xl shadow-white/10">
                Start building free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-[#e5e5e5] hover:border-[#3a3a3a] hover:bg-[#222] active:scale-[0.98] transition-all">
                I have an account
              </Link>
            </>
          )}
        </div>
        <p className="mt-4 text-xs text-[#52525b]">No credit card required · Free tier forever</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#1a1a1a]/60 backdrop-blur px-3 py-1.5 text-xs">
          <span className="text-violet-400">✦</span>
          <span className="font-mono font-semibold text-[#e5e5e5]">{counter.toLocaleString()}</span>
          <span className="text-[#71717a]">components generated this week</span>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <BrowserMockup />
      </div>
    </section>
  );
}

// ── Browser mockup with looping pipeline + typing prompt ─────────────
function BrowserMockup() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [pipeStage, setPipeStage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPromptIdx(i => (i + 1) % TYPING_PROMPTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPipeStage(s => (s + 1) % 8), 1000);
    return () => clearInterval(t);
  }, []);

  const agents = ["Interpret", "Design", "Generate", "Connect", "Validate", "Optimize"];

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] shadow-2xl shadow-violet-500/10 overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <div className="ml-4 flex-1 rounded-md bg-[#0a0a0a] px-3 py-1 text-xs text-[#71717a]">neuroui.app/dashboard</div>
      </div>
      <div className="grid grid-cols-12 gap-0 min-h-[340px]">
        <div className="col-span-3 border-r border-[#2a2a2a] bg-[#0a0a0a] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500" />
            <div className="text-xs font-bold">NeuroUI</div>
          </div>
          <div className="mb-3 rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-1.5 text-[10px] text-violet-300">+ New generation</div>
          <p className="mb-1.5 px-1 text-[9px] uppercase tracking-widest text-[#52525b]">Templates</p>
          {["Analytics dash", "Login page", "Pricing", "Kanban"].map(t => (
            <div key={t} className="px-2 py-1 text-[10px] text-[#71717a]">{t}</div>
          ))}
        </div>
        <div className="col-span-9 p-4 flex flex-col gap-3">
          <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-2.5 min-h-[44px] flex items-center">
            <p key={promptIdx} className="text-[10px] text-[#a1a1aa] animate-[fadeIn_0.4s_ease-out]">{TYPING_PROMPTS[promptIdx]}<span className="ml-0.5 inline-block h-2.5 w-1 align-middle bg-violet-400 animate-pulse" /></p>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {agents.map((a, i) => {
              const status = pipeStage > i ? "done" : pipeStage === i ? "running" : "queued";
              return (
                <div key={a} className={"rounded-md border px-1.5 py-1 text-center transition-all " +
                  (status === "done" ? "border-emerald-500/40 bg-emerald-500/10" :
                   status === "running" ? "border-violet-500/60 bg-violet-500/15" :
                   "border-[#2a2a2a] bg-[#1a1a1a]")}>
                  <div className="text-[8px] text-[#a1a1aa]">{a}</div>
                  <div className={"mt-0.5 text-[7px] " +
                    (status === "done" ? "text-emerald-300" :
                     status === "running" ? "text-violet-300" :
                     "text-[#52525b]")}>
                    {status === "done" ? "✓ DONE" : status === "running" ? "● RUN" : "QUEUE"}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["$47.2k", "12,841", "2.1%", "68"].map((v, i) => (
              <div key={i} className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-2">
                <div className="text-sm font-semibold">{v}</div>
                <div className="text-[8px] text-[#71717a]">{["MRR","Users","Churn","NPS"][i]}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-3 flex-1">
            <svg viewBox="0 0 300 80" className="h-20 w-full">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,60 C30,50 60,45 90,40 C120,35 150,28 180,20 C210,15 240,18 270,12 L300,8 L300,80 L0,80 Z" fill="url(#g)" />
              <path d="M0,60 C30,50 60,45 90,40 C120,35 150,28 180,20 C210,15 240,18 270,12 L300,8" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Logo marquee ──────────────────────────────────────────────────────
function LogoMarquee() {
  const all = [...LOGOS, ...LOGOS];
  return (
    <section className="border-y border-[#1a1a1a] bg-[#0a0a0a]/50 py-8 overflow-hidden">
      <p className="text-center text-[11px] uppercase tracking-widest text-[#52525b] mb-5">Trusted by engineers at</p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="marquee-track flex gap-14 w-max">
          {all.map((name, i) => (
            <span key={i} className="text-xl font-bold tracking-tight text-[#52525b] hover:text-[#a1a1aa] transition-colors whitespace-nowrap">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">Features</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to ship a UI today</h2>
            <p className="mt-3 text-[#71717a]">Not a builder. Not a template gallery. A code generator built for engineers.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="group relative h-full rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-600 hover:shadow-xl hover:shadow-violet-500/10 cursor-default">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 transition-all duration-300 group-hover:bg-violet-500/25 group-hover:scale-110">
                  <f.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">{f.desc}</p>
                <div className="absolute bottom-5 right-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-violet-400">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Live Demo Section ────────────────────────────────────────────────
function LiveDemoSection() {
  const [stage, setStage] = useState(0);
  const [codeLines, setCodeLines] = useState(0);
  const agents = ["Interpret", "Design", "Generate", "Connect", "Validate", "Optimize"];

  useEffect(() => {
    const t = setInterval(() => setStage(s => (s + 1) % 10), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (stage >= 3 && stage < 9) setCodeLines(Math.min(8, codeLines + 1));
    if (stage === 0) setCodeLines(0);
  }, [stage, codeLines]);

  const CODE = [
    "export default function App() {",
    "  const [tab, setTab] = useState('rev');",
    "  return (",
    "    <div className=\"min-h-screen bg-[#0f0f0f]\">",
    "      <header className=\"flex items-center…\">",
    "        <h1>Analytics</h1>",
    "      </header>",
    "      <div className=\"grid grid-cols-4 gap-4\">",
  ];

  return (
    <section className="border-y border-[#1a1a1a] bg-gradient-to-b from-[#070707] to-[#0a0a0a] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">Live</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See it generate in real time</h2>
            <p className="mt-3 text-[#71717a]">No signup. No credit card. Watch it work.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden shadow-2xl shadow-violet-500/10">
            <div className="flex items-center gap-1.5 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <div className="ml-4 flex-1 rounded-md bg-[#0a0a0a] px-3 py-1 text-xs text-[#71717a]">
                neuroui.app/dashboard <span className="text-emerald-400 ml-2">● live</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 min-h-[420px]">
              <div className="md:col-span-3 border-r border-[#1a1a1a] bg-[#0a0a0a] p-4 space-y-3">
                <p className="text-[9px] uppercase tracking-widest text-[#52525b]">Prompt</p>
                <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
                  <p className="text-[11px] text-[#e5e5e5] leading-relaxed">A SaaS analytics dashboard with KPI cards, growth chart, and customer table.</p>
                </div>
                <button className="w-full rounded-md bg-violet-500 px-2 py-1.5 text-[10px] font-semibold text-white">Generate</button>
              </div>

              <div className="md:col-span-4 border-r border-[#1a1a1a] p-4">
                <p className="text-[9px] uppercase tracking-widest text-[#52525b] mb-3">Agent pipeline</p>
                <div className="space-y-1.5">
                  {agents.map((a, i) => {
                    const status = stage > i ? "done" : stage === i ? "running" : "queued";
                    return (
                      <div key={a} className={"flex items-center justify-between rounded-md border px-2.5 py-1.5 transition-all " +
                        (status === "done" ? "border-emerald-500/30 bg-emerald-500/5" :
                         status === "running" ? "border-violet-500/50 bg-violet-500/10" :
                         "border-[#1a1a1a] bg-[#0a0a0a]")}>
                        <div className="flex items-center gap-2">
                          <div className={"h-1.5 w-1.5 rounded-full " +
                            (status === "done" ? "bg-emerald-400" :
                             status === "running" ? "bg-violet-400 animate-pulse" :
                             "bg-[#3a3a3a]")} />
                          <span className="text-[10px] text-[#e5e5e5]">{a}</span>
                        </div>
                        <span className={"text-[9px] " +
                          (status === "done" ? "text-emerald-400" :
                           status === "running" ? "text-violet-400" :
                           "text-[#52525b]")}>
                          {status === "done" ? "DONE" : status === "running" ? "RUNNING" : "QUEUED"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-5 p-4 bg-[#080808]">
                <p className="text-[9px] uppercase tracking-widest text-[#52525b] mb-3">
                  Output {stage > 7 && <span className="text-emerald-400">✓ Done</span>}
                </p>
                {stage <= 7 ? (
                  <pre className="font-mono text-[10px] leading-relaxed text-[#a1a1aa] overflow-hidden">
                    {CODE.slice(0, codeLines).map((line, i) => (
                      <div key={i} className="animate-[slideIn_0.3s_ease-out]">
                        <span className="text-[#52525b] inline-block w-6 text-right pr-2">{i + 1}</span>
                        <span className="text-[#e5e5e5]">{line}</span>
                      </div>
                    ))}
                    {stage > 1 && stage < 8 && (
                      <span className="inline-block h-3 w-1.5 bg-violet-400 animate-pulse" />
                    )}
                  </pre>
                ) : (
                  <div className="animate-[fadeIn_0.5s_ease-out] space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[["$47.2k", "MRR"], ["12,841", "Users"]].map(([v, l]) => (
                        <div key={l} className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-2">
                          <div className="text-sm font-bold text-[#e5e5e5]">{v}</div>
                          <div className="text-[8px] text-[#71717a]">{l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] p-2">
                      <svg viewBox="0 0 200 50" className="h-12 w-full">
                        <defs>
                          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,40 C30,32 60,28 90,22 C120,18 150,12 180,8 L200,5 L200,50 L0,50 Z" fill="url(#dg)" />
                        <path d="M0,40 C30,32 60,28 90,22 C120,18 150,12 180,8 L200,5" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-6 flex justify-center">
            <Link href="/dashboard" className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 active:scale-[0.98] transition-all">
              Open dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}

// ── Templates ─────────────────────────────────────────────────────────
function TemplatesSection() {
  return (
    <section id="templates" className="px-6 py-24 bg-[#080808]">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-300">Templates</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start from a template. Make it yours.</h2>
            <p className="mt-3 text-[#71717a]">9 pre-built components load in under a second. Modify the prompt to customize anything.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TEMPLATES.map((t, i) => (
            <Reveal key={t.label} delay={i * 40}>
              <Link href="/dashboard" className="group block cursor-pointer rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden hover:border-[#2a2a2a] hover:-translate-y-0.5 transition-all duration-300">
                <div className={"h-28 bg-gradient-to-br " + t.color + " relative"}>
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-2 right-2 rounded bg-black/40 backdrop-blur px-1.5 py-0.5 text-[9px] font-mono text-white">App.tsx</div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-white">{t.label}</p>
                  <p className="text-[10px] text-[#71717a] mt-0.5">React + Tailwind</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Describe", desc: "Type what you want in plain English. The vaguer it is, the more creative the result." },
    { num: "02", title: "Watch", desc: "Six AI agents collaborate live — interpret, design, generate, connect, validate, optimize." },
    { num: "03", title: "Ship", desc: "Live preview, download ZIP, open in StackBlitz, share with a URL. Yours forever." },
  ];
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-14 text-center">
            <span className="mb-3 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">How it works</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three steps. One minute. Real code.</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 100}>
              <div className="rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] p-6 hover:border-[#2a2a2a] transition-colors">
                <div className="mb-4 text-3xl font-bold text-violet-500/40">{s.num}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="px-6 py-24 bg-[#080808]">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by people who ship</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] p-6 hover:border-[#2a2a2a] transition-colors">
                <div className="flex mb-3">
                  {[1,2,3,4,5].slice(0, t.rating).map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-[#a1a1aa] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-[#71717a]">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────
function PricingSection() {
  const tiers = [
    { name: "Free", price: "$0", desc: "For trying it out",
      cta: "Get started free", ctaHref: "/signup", primary: false,
      features: ["10 generations / month", "All 9 templates", "Preview + copy code", "Public share links"] },
    { name: "Pro", price: "$19", desc: "For everyday building",
      cta: "Start Pro trial", ctaHref: "/signup", primary: true,
      features: ["Unlimited generations", "Everything in Free", "Download ZIP export", "Unlimited generation history", "Priority generation queue", "Private generations"] },
    { name: "Enterprise", price: "$99", desc: "For teams",
      cta: "Contact us", ctaHref: "mailto:hello@neuroui.app", primary: false,
      features: ["Everything in Pro", "Custom design system upload", "Dedicated generation capacity", "SSO + team seats", "SLA guarantee"] },
  ];

  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">Pricing</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing. Ship more.</h2>
            <p className="mt-3 text-[#71717a]">Start free. Upgrade when you&apos;re shipping daily.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className={"relative h-full rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 " +
                (t.primary ? "border-violet-500 bg-violet-500/5 shadow-xl shadow-violet-500/20" : "border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#2a2a2a]")}>
                {t.primary && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30">
                    Most popular
                  </div>
                )}
                <h3 className="text-base font-semibold">{t.name}</h3>
                <div className="mt-1 mb-1">
                  <span className="text-4xl font-bold">{t.price}</span>
                  {t.price !== "$0" && <span className="text-sm text-[#71717a]"> / month</span>}
                </div>
                <p className="text-xs text-[#71717a] mb-5">{t.desc}</p>
                <Link href={t.ctaHref}
                  className={"mb-5 block w-full rounded-xl py-2 text-center text-sm font-semibold transition-all active:scale-95 " +
                    (t.primary ? "bg-violet-500 text-white hover:brightness-110" : "border border-[#2a2a2a] text-[#e5e5e5] hover:border-[#3a3a3a]")}>
                  {t.cta}
                </Link>
                <ul className="space-y-2">
                  {t.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                      <Check className={"h-4 w-4 mt-0.5 shrink-0 " + (t.primary ? "text-violet-400" : "text-emerald-400")} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={300}>
          <p className="mt-8 text-center text-xs text-[#71717a] leading-relaxed">
            All plans include: React + TypeScript output · Tailwind CSS · Recharts · Lucide icons · Export anywhere · No vendor lock-in
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────
function CtaSection({ user, loading }: { user: unknown; loading: boolean }) {
  return (
    <section className="px-6 py-24">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-rose-500/10 p-12 animated-gradient">
          <Sparkles className="mx-auto h-8 w-8 text-violet-400 mb-4" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Stop building UIs. Describe them.</h2>
          <p className="mt-3 text-[#a1a1aa]">Sign up free. No credit card. Generate your first component in under a minute.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!loading && (user ? (
              <Link href="/dashboard" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 active:scale-95 transition-all">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/signup" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 active:scale-95 transition-all">
                Start building free <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "Product", links: [
      { label: "Features", href: "#features" },
      { label: "Templates", href: "#templates" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
    ]},
    { title: "Developers", links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "GitHub", href: "https://github.com" },
      { label: "Discord", href: "#" },
    ]},
    { title: "Company", links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press kit", href: "#" },
    ]},
    { title: "Legal", links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookie policy", href: "#" },
    ]},
  ];

  return (
    <footer className="border-t border-[#1a1a1a] bg-[#070707] px-6 pt-16 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">NeuroUI</span>
            </Link>
            <p className="text-xs text-[#71717a] leading-relaxed max-w-xs">
              Plain English in. Production React out. Powered by the Cursor Agent SDK.
            </p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#52525b]">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.label}>
                    {l.href.startsWith("http") ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className="text-xs text-[#a1a1aa] hover:text-white transition-colors" suppressHydrationWarning>
                        {l.label}
                      </a>
                    ) : (
                      <a href={l.href} className="text-xs text-[#a1a1aa] hover:text-white transition-colors">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#1a1a1a] pt-6 sm:flex-row">
          <p className="text-xs text-[#71717a]">© 2025 NeuroUI. Built on Cursor Agent SDK.</p>
          <div className="flex items-center gap-3">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] text-[#71717a] hover:text-white hover:border-[#2a2a2a] active:scale-95 transition-all"
              suppressHydrationWarning>
              <Twitter className="h-3.5 w-3.5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] text-[#71717a] hover:text-white hover:border-[#2a2a2a] active:scale-95 transition-all"
              suppressHydrationWarning>
              <Github className="h-3.5 w-3.5" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] text-[#71717a] hover:text-white hover:border-[#2a2a2a] active:scale-95 transition-all"
              suppressHydrationWarning>
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
