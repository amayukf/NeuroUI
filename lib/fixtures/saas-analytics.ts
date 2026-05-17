import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

const MONTHLY = [
  { month: "Jun", mrr: 32400, users: 8210, churn: 2.8 },
  { month: "Jul", mrr: 35100, users: 8890, churn: 2.6 },
  { month: "Aug", mrr: 37800, users: 9540, churn: 2.4 },
  { month: "Sep", mrr: 39200, users: 10100, churn: 2.3 },
  { month: "Oct", mrr: 41500, users: 10780, churn: 2.2 },
  { month: "Nov", mrr: 43100, users: 11350, churn: 2.0 },
  { month: "Dec", mrr: 44800, users: 11920, churn: 1.9 },
  { month: "Jan", mrr: 45200, users: 12100, churn: 2.1 },
  { month: "Feb", mrr: 45900, users: 12380, churn: 2.0 },
  { month: "Mar", mrr: 46400, users: 12590, churn: 1.8 },
  { month: "Apr", mrr: 46900, users: 12720, churn: 1.9 },
  { month: "May", mrr: 47200, users: 12841, churn: 2.1 },
];

const CUSTOMERS = [
  { name: "Stripe", plan: "Enterprise", mrr: 4200, seats: 48, joined: "Mar 2024" },
  { name: "Linear", plan: "Enterprise", mrr: 3800, seats: 41, joined: "Jan 2024" },
  { name: "Vercel", plan: "Business", mrr: 2100, seats: 22, joined: "Jun 2024" },
  { name: "Figma", plan: "Business", mrr: 1900, seats: 19, joined: "Aug 2024" },
  { name: "Notion", plan: "Business", mrr: 1700, seats: 17, joined: "Oct 2024" },
];

const TOOLTIP_STYLE = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 };

function KPI({ icon: Icon, label, value, delta, positive }: {
  icon: React.ElementType; label: string; value: string; delta: string; positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 hover:border-[#3a3a3a] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
          <Icon className="h-4 w-4 text-violet-400" />
        </div>
        <div className={"flex items-center gap-1 text-xs font-medium " + (positive ? "text-emerald-400" : "text-rose-400")}>
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {delta}
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-[#e5e5e5]">{value}</div>
      <div className="mt-0.5 text-xs text-[#71717a]">{label}</div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("revenue");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={"animate-pulse rounded bg-[#2a2a2a] " + className} />
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-sm text-[#71717a] mt-0.5">May 2026 · Updated 3 minutes ago</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-sm text-[#e5e5e5] hover:border-[#3a3a3a] active:scale-95 transition-all">
              Last 12 months
            </button>
            <button className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:brightness-110 active:scale-95 transition-all">
              Export report
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            <KPI icon={DollarSign} label="Monthly Recurring Revenue" value="$47,200" delta="+12.4%" positive />
            <KPI icon={Users} label="Active Users" value="12,841" delta="+8.1%" positive />
            <KPI icon={Activity} label="Churn Rate" value="2.1%" delta="-0.3pp" positive />
            <KPI icon={TrendingUp} label="Net Promoter Score" value="68" delta="+4 pts" positive />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-medium text-[#e5e5e5]">Growth trends</h2>
                <p className="text-xs text-[#71717a]">Revenue and users over 12 months</p>
              </div>
              <div className="flex gap-1">
                {["revenue", "users", "churn"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={"rounded-md px-2.5 py-1 text-xs capitalize transition-colors " +
                      (activeTab === tab ? "bg-violet-500/15 text-violet-300" : "text-[#71717a] hover:text-[#e5e5e5]")}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {loading ? <Skeleton className="h-48" /> : (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={MONTHLY}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={v => activeTab === "revenue" ? "$" + (v/1000).toFixed(0) + "k" : activeTab === "churn" ? v + "%" : (v/1000).toFixed(0) + "k"} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => activeTab === "revenue" ? ["$" + v.toLocaleString(), "MRR"] : activeTab === "churn" ? [v + "%", "Churn"] : [v.toLocaleString(), "Users"]} />
                  <Area type="monotone" dataKey={activeTab === "revenue" ? "mrr" : activeTab === "users" ? "users" : "churn"} stroke="#8b5cf6" fill="url(#grad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
            <h2 className="text-sm font-medium text-[#e5e5e5] mb-1">Monthly churn</h2>
            <p className="text-xs text-[#71717a] mb-4">% users churned per month</p>
            {loading ? <Skeleton className="h-48" /> : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={MONTHLY.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={v => v + "%"} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v + "%", "Churn"]} />
                  <Bar dataKey="churn" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
            <h2 className="text-sm font-medium text-[#e5e5e5]">Top customers by MRR</h2>
            <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all</button>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  {["Company", "Plan", "MRR", "Seats", "Customer since"].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-[#71717a]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {CUSTOMERS.map(c => (
                  <tr key={c.name} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-300">
                          {c.name[0]}
                        </div>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300">{c.plan}</span></td>
                    <td className="px-5 py-3 font-mono text-emerald-400">\${c.mrr.toLocaleString()}</td>
                    <td className="px-5 py-3 text-[#71717a]">{c.seats}</td>
                    <td className="px-5 py-3 text-[#71717a]">{c.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
`;

export const SAAS_ANALYTICS_FILES: SandboxFile[] = [
  { path: "/src/App.tsx", contents: APP_TSX },
];
