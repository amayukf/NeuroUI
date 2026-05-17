import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState } from "react";
import { Plus, MoreHorizontal, Clock, AlertCircle, CheckCircle2, Circle, ChevronRight } from "lucide-react";

type Priority = "low" | "medium" | "high";
type Column = "backlog" | "progress" | "review" | "done";

interface Task {
  id: string;
  title: string;
  priority: Priority;
  tags: string[];
  assignee: string;
  color: string;
  estimate: string;
}

const COLUMNS: { id: Column; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "text-[#71717a]" },
  { id: "progress", label: "In Progress", color: "text-amber-400" },
  { id: "review", label: "In Review", color: "text-violet-400" },
  { id: "done", label: "Done", color: "text-emerald-400" },
];

const INITIAL: Record<Column, Task[]> = {
  backlog: [
    { id: "t1", title: "Redesign onboarding flow for new B2B customers", priority: "high", tags: ["Design", "UX"], assignee: "SR", color: "bg-rose-500", estimate: "5d" },
    { id: "t2", title: "Implement SSO with Okta provider", priority: "high", tags: ["Auth", "Backend"], assignee: "ML", color: "bg-blue-500", estimate: "3d" },
    { id: "t3", title: "Add CSV export to analytics dashboard", priority: "medium", tags: ["Feature"], assignee: "KP", color: "bg-amber-500", estimate: "1d" },
    { id: "t4", title: "Write API documentation for v2 endpoints", priority: "low", tags: ["Docs"], assignee: "AT", color: "bg-violet-500", estimate: "2d" },
  ],
  progress: [
    { id: "t5", title: "Build multi-tenant billing with Stripe", priority: "high", tags: ["Billing", "Backend"], assignee: "ML", color: "bg-blue-500", estimate: "8d" },
    { id: "t6", title: "Mobile responsive fixes for dashboard", priority: "medium", tags: ["Frontend"], assignee: "SR", color: "bg-rose-500", estimate: "2d" },
    { id: "t7", title: "Set up datadog monitoring + alerts", priority: "medium", tags: ["DevOps"], assignee: "KP", color: "bg-amber-500", estimate: "1d" },
  ],
  review: [
    { id: "t8", title: "Dark mode support across all pages", priority: "medium", tags: ["Design", "Frontend"], assignee: "AT", color: "bg-violet-500", estimate: "3d" },
    { id: "t9", title: "Optimize slow dashboard queries (>2s)", priority: "high", tags: ["Performance", "Backend"], assignee: "ML", color: "bg-blue-500", estimate: "2d" },
  ],
  done: [
    { id: "t10", title: "Launch invite-only beta program", priority: "high", tags: ["Growth"], assignee: "SR", color: "bg-rose-500", estimate: "4d" },
    { id: "t11", title: "Fix auth token refresh race condition", priority: "high", tags: ["Bug", "Auth"], assignee: "ML", color: "bg-blue-500", estimate: "1d" },
    { id: "t12", title: "Add workspace switcher to sidebar", priority: "medium", tags: ["Feature"], assignee: "KP", color: "bg-amber-500", estimate: "2d" },
  ],
};

const PRIORITY_CONFIG: Record<Priority, { label: string; cls: string; icon: React.ElementType }> = {
  high: { label: "High", cls: "text-rose-400 bg-rose-400/10", icon: AlertCircle },
  medium: { label: "Med", cls: "text-amber-400 bg-amber-400/10", icon: Clock },
  low: { label: "Low", cls: "text-emerald-400 bg-emerald-400/10", icon: Circle },
};

function TaskCard({ task }: { task: Task }) {
  const [hovered, setHovered] = useState(false);
  const P = PRIORITY_CONFIG[task.priority];
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={"rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-3.5 cursor-pointer transition-all " + (hovered ? "border-[#3a3a3a] shadow-lg shadow-black/40 -translate-y-0.5" : "")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-[#e5e5e5] leading-snug">{task.title}</p>
        <button className="shrink-0 rounded p-0.5 text-[#71717a] hover:text-[#e5e5e5] transition-colors" aria-label="Task options">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {task.tags.map(tag => (
          <span key={tag} className="rounded-full bg-[#2a2a2a] px-2 py-0.5 text-[10px] font-medium text-[#71717a]">{tag}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className={"flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium " + P.cls}>
          <P.icon className="h-3 w-3" />
          {P.label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#71717a]">{task.estimate}</span>
          <div className={"flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white " + task.color}>
            {task.assignee}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tasks] = useState(INITIAL);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <div className="px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sprint 24 · May 2026</h1>
            <p className="text-sm text-[#71717a] mt-0.5">12 tasks · 4 in progress</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:brightness-110 active:scale-95 transition-all">
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={"text-sm font-medium " + col.color}>{col.label}</span>
                  <span className="rounded-full bg-[#2a2a2a] px-2 py-0.5 text-[10px] font-medium text-[#71717a]">
                    {tasks[col.id].length}
                  </span>
                </div>
                <button aria-label={"Add task to " + col.label} className="rounded p-0.5 text-[#71717a] hover:text-[#e5e5e5] transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {tasks[col.id].map(task => <TaskCard key={task.id} task={task} />)}
              </div>
              <button className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#2a2a2a] p-3 text-xs text-[#71717a] hover:border-[#3a3a3a] hover:text-[#e5e5e5] transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add task
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

export const KANBAN_BOARD_FILES: SandboxFile[] = [
  { path: "/src/App.tsx", contents: APP_TSX },
];
