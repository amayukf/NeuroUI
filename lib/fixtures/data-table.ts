import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Download, Trash2, UserCheck, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

type SortDir = "asc" | "desc" | null;
type SortKey = "name" | "department" | "salary" | "joined" | null;

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  salary: number;
  joined: string;
  status: "active" | "on leave" | "contractor";
}

const EMPLOYEES: Employee[] = [
  { id: "e01", name: "Amara Osei", department: "Engineering", role: "Staff Engineer", salary: 198000, joined: "2021-03-15", status: "active" },
  { id: "e02", name: "Dario Conti", department: "Product", role: "Product Lead", salary: 175000, joined: "2022-01-10", status: "active" },
  { id: "e03", name: "Fatima Al-Rashid", department: "Design", role: "Principal Designer", salary: 162000, joined: "2022-06-22", status: "active" },
  { id: "e04", name: "Kenji Watanabe", department: "Engineering", role: "Senior Engineer", salary: 168000, joined: "2021-11-08", status: "active" },
  { id: "e05", name: "Lila Pham", department: "Marketing", role: "Growth Lead", salary: 144000, joined: "2023-02-14", status: "active" },
  { id: "e06", name: "Marcos Reyes", department: "Sales", role: "AE — Enterprise", salary: 138000, joined: "2023-07-03", status: "active" },
  { id: "e07", name: "Nadia Petrov", department: "Engineering", role: "Senior Engineer", salary: 171000, joined: "2022-09-19", status: "active" },
  { id: "e08", name: "Omar Diallo", department: "Finance", role: "Head of Finance", salary: 182000, joined: "2021-05-27", status: "active" },
  { id: "e09", name: "Priya Sharma", department: "Engineering", role: "Engineering Manager", salary: 195000, joined: "2020-12-01", status: "active" },
  { id: "e10", name: "Rishi Mehta", department: "Legal", role: "General Counsel", salary: 215000, joined: "2021-08-30", status: "on leave" },
  { id: "e11", name: "Sofia Andersen", department: "Design", role: "Design Manager", salary: 158000, joined: "2022-04-11", status: "active" },
  { id: "e12", name: "Tariq Hassan", department: "Engineering", role: "Platform Engineer", salary: 163000, joined: "2023-01-16", status: "contractor" },
  { id: "e13", name: "Uma Krishnan", department: "Product", role: "Senior PM", salary: 168000, joined: "2022-11-29", status: "active" },
  { id: "e14", name: "Vera Kowalski", department: "Sales", role: "Sales Manager", salary: 152000, joined: "2023-05-08", status: "active" },
  { id: "e15", name: "Xavier Lopes", department: "Engineering", role: "Senior Engineer", salary: 167000, joined: "2023-09-04", status: "active" },
];

const DEPT_COLORS: Record<string, string> = {
  Engineering: "bg-violet-500/15 text-violet-300",
  Product: "bg-blue-500/15 text-blue-300",
  Design: "bg-pink-500/15 text-pink-300",
  Marketing: "bg-amber-500/15 text-amber-300",
  Sales: "bg-emerald-500/15 text-emerald-300",
  Finance: "bg-cyan-500/15 text-cyan-300",
  Legal: "bg-rose-500/15 text-rose-300",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  "on leave": "bg-amber-500/15 text-amber-400",
  contractor: "bg-violet-500/15 text-violet-400",
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 text-[#71717a]" />;
  return dir === "asc" ? <ChevronUp className="h-3.5 w-3.5 text-violet-400" /> : <ChevronDown className="h-3.5 w-3.5 text-violet-400" />;
}

const PAGE_SIZE = 8;

export default function App() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [deptFilter, setDeptFilter] = useState("All");

  const DEPTS = ["All", ...Array.from(new Set(EMPLOYEES.map(e => e.department))).sort()];

  const filtered = useMemo(() => {
    let rows = EMPLOYEES.filter(e =>
      (deptFilter === "All" || e.department === deptFilter) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
       e.role.toLowerCase().includes(search.toLowerCase()) ||
       e.department.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        const av = sortKey === "salary" ? a[sortKey] : a[sortKey as "name" | "department" | "joined"];
        const bv = sortKey === "salary" ? b[sortKey] : b[sortKey as "name" | "department" | "joined"];
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [search, sortKey, sortDir, deptFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = pageRows.length > 0 && pageRows.every(r => selected.has(r.id));

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key); setSortDir("asc");
    }
    setPage(1);
  }

  function toggleAll() {
    if (allSelected) setSelected(prev => { const n = new Set(prev); pageRows.forEach(r => n.delete(r.id)); return n; });
    else setSelected(prev => { const n = new Set(prev); pageRows.forEach(r => n.add(r.id)); return n; });
  }

  function toggleRow(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Team directory</h1>
            <p className="text-sm text-[#71717a] mt-0.5">{EMPLOYEES.length} employees · {filtered.length} shown</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-sm hover:border-[#3a3a3a] active:scale-95 transition-all">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 min-w-48 items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 focus-within:ring-2 focus-within:ring-violet-500/40 transition-all">
            <Search className="h-4 w-4 shrink-0 text-[#71717a]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, role, department…"
              className="flex-1 bg-transparent text-sm text-[#e5e5e5] placeholder:text-[#71717a] outline-none" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {DEPTS.map(d => (
              <button key={d} onClick={() => { setDeptFilter(d); setPage(1); }}
                className={"rounded-full border px-2.5 py-1 text-xs font-medium transition-colors " +
                  (deptFilter === d ? "border-violet-500 bg-violet-500/10 text-violet-300" : "border-[#2a2a2a] text-[#71717a] hover:text-[#e5e5e5]")}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {selected.size > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-500/5 px-4 py-2.5">
            <span className="text-sm font-medium text-violet-300">{selected.size} selected</span>
            <div className="h-4 w-px bg-[#3a3a3a]" />
            <button onClick={() => setSelected(new Set())} className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#e5e5e5] transition-colors">
              <Trash2 className="h-3.5 w-3.5" />Remove
            </button>
            <button className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#e5e5e5] transition-colors">
              <UserCheck className="h-3.5 w-3.5" />Change role
            </button>
            <button className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#e5e5e5] transition-colors">
              <Download className="h-3.5 w-3.5" />Export
            </button>
          </div>
        )}

        <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#111]">
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="h-4 w-4 rounded border-[#2a2a2a] bg-[#1a1a1a] accent-violet-500" />
                </th>
                {([["name", "Name"], ["department", "Department"], ["role", "Role"], ["salary", "Salary"], ["joined", "Joined"], ["status", "Status"]] as const).map(([key, label]) => (
                  <th key={key} onClick={() => ["name","department","salary","joined"].includes(key) ? toggleSort(key as SortKey) : null}
                    className={"px-4 py-3 text-left text-xs font-medium text-[#71717a] " + (["name","department","salary","joined"].includes(key) ? "cursor-pointer hover:text-[#e5e5e5] select-none" : "")}>
                    <div className="flex items-center gap-1.5">
                      {label}
                      {["name","department","salary","joined"].includes(key) &&
                        <SortIcon active={sortKey === key} dir={sortKey === key ? sortDir : null} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {pageRows.map(e => (
                <tr key={e.id} className={"hover:bg-white/5 transition-colors " + (selected.has(e.id) ? "bg-violet-500/5" : "")}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleRow(e.id)}
                      className="h-4 w-4 rounded border-[#2a2a2a] bg-[#1a1a1a] accent-violet-500" />
                  </td>
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (DEPT_COLORS[e.department] ?? "bg-[#2a2a2a] text-[#71717a]")}>{e.department}</span>
                  </td>
                  <td className="px-4 py-3 text-[#71717a] text-xs">{e.role}</td>
                  <td className="px-4 py-3 font-mono text-sm">\${e.salary.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#71717a] text-xs">{e.joined}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + STATUS_COLORS[e.status]}>{e.status}</span>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#71717a]">No results match your search.</td></tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-[#2a2a2a] bg-[#111] px-4 py-2.5">
            <p className="text-xs text-[#71717a]">
              Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} aria-label="Previous page"
                className="flex h-7 w-7 items-center justify-center rounded border border-[#2a2a2a] text-[#71717a] hover:text-[#e5e5e5] disabled:opacity-40 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={"flex h-7 w-7 items-center justify-center rounded border text-xs font-medium transition-colors " +
                    (p === page ? "border-violet-500 bg-violet-500/10 text-violet-300" : "border-[#2a2a2a] text-[#71717a] hover:text-[#e5e5e5]")}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} aria-label="Next page"
                className="flex h-7 w-7 items-center justify-center rounded border border-[#2a2a2a] text-[#71717a] hover:text-[#e5e5e5] disabled:opacity-40 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

export const DATA_TABLE_FILES: SandboxFile[] = [
  { path: "/src/App.tsx", contents: APP_TSX },
];
