"use client";

import { Sparkles, Plus, Clock, ChevronLeft, ChevronRight, TrendingUp, BarChart2, LogIn, Tag, Columns, ShoppingBag, MessageSquare, Users, Table, Trash2 } from "lucide-react";
import type { HistoryEntry } from "../lib/user-history";

export type { HistoryEntry };

const TEMPLATES = [
  { label: "Financial dashboard", icon: TrendingUp },
  { label: "SaaS analytics", icon: BarChart2 },
  { label: "Login page", icon: LogIn },
  { label: "Pricing page", icon: Tag },
  { label: "Kanban board", icon: Columns },
  { label: "E-commerce product", icon: ShoppingBag },
  { label: "Chat UI", icon: MessageSquare },
  { label: "Team settings", icon: Users },
  { label: "Data table", icon: Table },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  history: HistoryEntry[];
  onNewGeneration: () => void;
  onRestoreHistory: (entry: HistoryEntry) => void;
  onDeleteHistory?: (id: string) => void;
  onSelectTemplate: (label: string) => void;
  activePrompt: string;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export function Sidebar({
  collapsed,
  onToggle,
  history,
  onNewGeneration,
  onRestoreHistory,
  onDeleteHistory,
  onSelectTemplate,
  activePrompt,
}: SidebarProps) {
  return (
    <aside
      className={
        "relative flex shrink-0 flex-col border-r border-[#2a2a2a] bg-[#0a0a0a] transition-all duration-300 " +
        (collapsed ? "w-12" : "w-60")
      }
    >
      <div className={"flex items-center border-b border-[#2a2a2a] " + (collapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-3")}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight gradient-text leading-none">NeuroUI</div>
              <div className="text-[9px] uppercase tracking-widest text-white/30 leading-none mt-0.5">AI UI Generator</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#71717a] hover:bg-white/5 hover:text-[#e5e5e5] transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-4 overflow-y-auto p-3 flex-1">
          <button
            onClick={onNewGeneration}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-2 text-xs font-medium text-violet-300 hover:bg-violet-500/15 hover:border-violet-500/40 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New generation
          </button>

          <div>
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-[#71717a]">
              Templates
            </p>
            <div className="grid grid-cols-2 gap-1">
              {TEMPLATES.map(t => (
                <button
                  key={t.label}
                  onClick={() => onSelectTemplate(t.label)}
                  title={t.label}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] text-[#71717a] hover:bg-white/5 hover:text-[#e5e5e5] transition-colors truncate"
                >
                  <t.icon className="h-3 w-3 shrink-0 text-violet-400" />
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-[#71717a]">
                Recent ({history.length})
              </p>
              <div className="flex flex-col gap-0.5">
                {history.map(entry => (
                  <div
                    key={entry.id}
                    className={"group/item flex items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors cursor-pointer " +
                      (activePrompt === entry.prompt ? "bg-white/5" : "hover:bg-white/5")}
                    onClick={() => onRestoreHistory(entry)}
                    title={entry.prompt}
                  >
                    <div className={"mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full " + entry.color} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] text-[#e5e5e5]">{entry.prompt}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5 text-[#71717a]" />
                        <p className="text-[9px] text-[#71717a]">{timeAgo(entry.timestamp)}</p>
                      </div>
                    </div>
                    {onDeleteHistory && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteHistory(entry.id); }}
                        aria-label="Delete generation"
                        className="opacity-0 group-hover/item:opacity-100 text-[#71717a] hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className="flex flex-col items-center gap-2 p-2 pt-3">
          <button onClick={onNewGeneration} aria-label="New generation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717a] hover:bg-white/5 hover:text-[#e5e5e5] transition-colors">
            <Plus className="h-4 w-4" />
          </button>
          {history.slice(0, 6).map(entry => (
            <button key={entry.id} onClick={() => onRestoreHistory(entry)} title={entry.prompt} aria-label={entry.prompt}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
              <div className={"h-2.5 w-2.5 rounded-full " + entry.color} />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
