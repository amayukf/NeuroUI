import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useMemo, useState } from "react";

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: "t1", merchant: "Whole Foods Market", category: "Groceries", amount: -84.32, date: "2026-05-16" },
  { id: "t2", merchant: "Stripe Payout", category: "Income", amount: 2840.0, date: "2026-05-15" },
  { id: "t3", merchant: "Uber", category: "Transport", amount: -23.5, date: "2026-05-14" },
  { id: "t4", merchant: "Apple iCloud+", category: "Subscriptions", amount: -2.99, date: "2026-05-13" },
  { id: "t5", merchant: "Blue Bottle Coffee", category: "Dining", amount: -7.25, date: "2026-05-12" },
  { id: "t6", merchant: "Vanguard Transfer", category: "Investments", amount: -500, date: "2026-05-11" },
  { id: "t7", merchant: "Refund · Patagonia", category: "Refunds", amount: 64.0, date: "2026-05-10" },
  { id: "t8", merchant: "Spotify Family", category: "Subscriptions", amount: -16.99, date: "2026-05-09" },
];

const SPARK_DATA = [42, 48, 35, 60, 55, 70, 64, 78, 72, 88, 82, 95];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function App() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return TRANSACTIONS;
    if (filter === "income") return TRANSACTIONS.filter((t) => t.amount > 0);
    return TRANSACTIONS.filter((t) => t.amount < 0);
  }, [filter]);

  const totalIncome = TRANSACTIONS.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = TRANSACTIONS.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = 24817.42;
  const monthOverMonth = 12.4;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Good morning, Alex</h1>
            <p className="text-sm text-zinc-400">Here is what is happening with your money today.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-700">
              Last 30 days
            </button>
            <button className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-400">
              + Transfer
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Balance" value={formatCurrency(balance)} delta={\`+\${monthOverMonth}%\`} positive />
          <StatCard label="Income (30d)" value={formatCurrency(totalIncome)} delta="+18.2%" positive />
          <StatCard label="Spending (30d)" value={formatCurrency(totalExpense)} delta="-4.1%" positive />
          <StatCard label="Savings rate" value="38%" delta="+2.0pp" positive />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-zinc-300">Cash flow</h2>
                <p className="text-xs text-zinc-500">Daily net for the last 12 days</p>
              </div>
              <div className="flex gap-1">
                {(["all", "income", "expense"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    aria-pressed={filter === k}
                    className={\`rounded-md px-2.5 py-1 text-xs capitalize transition-colors \${
                      filter === k ? "bg-violet-500/15 text-violet-300" : "text-zinc-400 hover:text-zinc-200"
                    }\`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <Sparkline data={SPARK_DATA} />
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>May 4</span><span>May 16</span>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-sm font-medium text-zinc-300">Spending by category</h2>
            <ul className="mt-4 space-y-3">
              {[
                { name: "Groceries", pct: 32, color: "bg-violet-500" },
                { name: "Subscriptions", pct: 18, color: "bg-emerald-500" },
                { name: "Transport", pct: 14, color: "bg-amber-500" },
                { name: "Dining", pct: 11, color: "bg-rose-500" },
                { name: "Other", pct: 25, color: "bg-zinc-500" },
              ].map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-zinc-300">{c.name}</span>
                    <span className="font-mono text-zinc-500">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className={\`h-full \${c.color}\`} style={{ width: \`\${c.pct}%\` }} />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
            <h2 className="text-sm font-medium text-zinc-300">Recent transactions</h2>
            <a href="#" className="text-xs text-violet-300 hover:text-violet-200">View all</a>
          </div>
          <ul role="list" className="divide-y divide-zinc-800">
            {filtered.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-zinc-500">No transactions match this filter.</li>
            ) : (
              filtered.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-900/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
                      {t.merchant.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm text-zinc-200">{t.merchant}</div>
                      <div className="text-xs text-zinc-500">{t.category} · {formatDate(t.date)}</div>
                    </div>
                  </div>
                  <div className={\`font-mono text-sm \${t.amount > 0 ? "text-emerald-400" : "text-zinc-200"}\`}>
                    {t.amount > 0 ? "+" : ""}{formatCurrency(t.amount)}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight text-white">{value}</div>
      <div className={\`mt-1 text-xs \${positive ? "text-emerald-400" : "text-rose-400"}\`}>{delta}</div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => \`\${i * step},\${h - ((v - min) / range) * h}\`)
    .join(" ");
  return (
    <svg viewBox={\`0 0 \${w} \${h}\`} className="h-24 w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={\`0,\${h} \${points} \${w},\${h}\`} fill="url(#fill)" />
      <polyline points={points} fill="none" stroke="rgb(167 139 250)" strokeWidth="0.6" />
    </svg>
  );
}
`;

const SPEC_JSON = `{
  "componentName": "FinancialDashboard",
  "componentType": "dashboard",
  "summary": "Personal-finance overview with balance, transactions, spending breakdown, and cash-flow sparkline.",
  "sections": [
    { "id": "header", "title": "Greeting + actions", "purpose": "Personalized greeting and primary action" },
    { "id": "stats", "title": "Top-line metrics", "purpose": "Balance, income, spending, savings rate" },
    { "id": "cashflow", "title": "Cash flow chart", "purpose": "Sparkline of net flow over time" },
    { "id": "categories", "title": "Spending by category", "purpose": "Stacked breakdown of categories" },
    { "id": "transactions", "title": "Recent transactions", "purpose": "Filterable list of recent activity" }
  ],
  "interactions": ["filter transactions", "switch time range", "transfer"],
  "dataShape": [
    { "name": "balance", "type": "number", "example": 24817.42 },
    { "name": "transactions", "type": "Transaction[]", "example": "see TRANSACTIONS constant" }
  ],
  "tone": "professional"
}`;

const DESIGN_JSON = `{
  "palette": {
    "mode": "dark",
    "background": "bg-zinc-950",
    "surface": "bg-zinc-900/60",
    "surfaceMuted": "bg-zinc-900",
    "border": "border-zinc-800",
    "text": "text-zinc-100",
    "textMuted": "text-zinc-400",
    "accent": "bg-violet-500",
    "accentText": "text-white",
    "success": "text-emerald-400",
    "warn": "text-amber-400",
    "error": "text-rose-400"
  },
  "typography": {
    "display": "text-2xl font-semibold tracking-tight",
    "heading": "text-sm font-medium",
    "body": "text-sm",
    "label": "text-xs text-zinc-500",
    "mono": "font-mono"
  },
  "layout": {
    "container": "max-w-6xl mx-auto px-6",
    "gap": "gap-4",
    "radius": "rounded-2xl",
    "shadow": "shadow-none",
    "density": "comfortable"
  },
  "vibe": "Quiet, premium fintech feel — restrained palette with a single violet accent."
}`;

const REPORT_MD = `# Validation report

## Issues
- minor [src/App.tsx] sparkline SVG is decorative, marked aria-hidden=\"true\".
- minor [src/App.tsx] empty filter result handled with friendly message.

## Notes
- All buttons have accessible text content.
- Lists use stable id-based keys.
`;

export const FINANCIAL_DASHBOARD_FILES: SandboxFile[] = [
  { path: "/spec.json", contents: SPEC_JSON },
  { path: "/design.json", contents: DESIGN_JSON },
  { path: "/src/App.tsx", contents: APP_TSX },
  { path: "/report.md", contents: REPORT_MD },
];
