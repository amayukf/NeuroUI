import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState } from "react";
import { Shield, Users, CreditCard, AlertTriangle, Mail, ChevronDown, Trash2, MoreHorizontal, Check, X, Loader2 } from "lucide-react";

type Role = "Owner" | "Admin" | "Member" | "Viewer";
type Tab = "members" | "permissions" | "billing" | "danger";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  color: string;
  joined: string;
  status: "active" | "pending";
}

const MEMBERS: Member[] = [
  { id: "m1", name: "Sarah Rodriguez", email: "sarah@acme.com", role: "Owner", initials: "SR", color: "bg-rose-500", joined: "Jan 2024", status: "active" },
  { id: "m2", name: "Marcus Liu", email: "marcus@acme.com", role: "Admin", initials: "ML", color: "bg-blue-500", joined: "Mar 2024", status: "active" },
  { id: "m3", name: "Kai Patel", email: "kai@acme.com", role: "Member", initials: "KP", color: "bg-amber-500", joined: "Jun 2024", status: "active" },
  { id: "m4", name: "Aisha Thompson", email: "aisha@acme.com", role: "Member", initials: "AT", color: "bg-violet-500", joined: "Sep 2024", status: "active" },
  { id: "m5", name: "invite@partner.io", email: "invite@partner.io", role: "Viewer", initials: "?", color: "bg-[#2a2a2a]", joined: "—", status: "pending" },
];

const FEATURES = ["View reports", "Edit projects", "Manage members", "Billing access", "API keys", "Delete workspace"];
const ROLE_ACCESS: Record<Role, boolean[]> = {
  "Owner":  [true, true, true, true, true, true],
  "Admin":  [true, true, true, false, true, false],
  "Member": [true, true, false, false, false, false],
  "Viewer": [true, false, false, false, false, false],
};
const ROLE_ORDER: Role[] = ["Owner", "Admin", "Member", "Viewer"];

const ROLE_COLORS: Record<Role, string> = {
  "Owner": "bg-violet-500/15 text-violet-300",
  "Admin": "bg-blue-500/15 text-blue-300",
  "Member": "bg-[#2a2a2a] text-[#71717a]",
  "Viewer": "bg-[#1a1a1a] text-[#71717a]",
};

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "members", label: "Members", icon: Users },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState(MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Member");
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function sendInvite() {
    if (!inviteEmail) return;
    setInviting(true);
    await new Promise(r => setTimeout(r, 900));
    setInviting(false);
    setInviteSent(true);
    setInviteEmail("");
    setTimeout(() => setInviteSent(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 1500));
    setDeleting(false);
  }

  function removeMember(id: string) {
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  function changeRole(id: string, role: Role) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Team settings</h1>
        <p className="mb-7 text-sm text-[#71717a]">Manage your workspace members, roles, and permissions.</p>

        <div className="flex gap-1 border-b border-[#2a2a2a] mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={"flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px " +
                (tab === t.id ? "border-violet-500 text-violet-300" : "border-transparent text-[#71717a] hover:text-[#e5e5e5]") +
                (t.id === "danger" ? " ml-auto text-rose-400/70 hover:text-rose-400" : "")}>
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "members" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    {["Member", "Role", "Joined", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-[#71717a]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={"flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white " + m.color}>{m.initials}</div>
                          <div>
                            <p className="font-medium text-sm">{m.name}</p>
                            <p className="text-[11px] text-[#71717a]">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {m.role === "Owner" ? (
                          <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + ROLE_COLORS[m.role]}>{m.role}</span>
                        ) : (
                          <select value={m.role} onChange={e => changeRole(m.id, e.target.value as Role)}
                            className="rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1 text-xs text-[#e5e5e5] outline-none focus:ring-2 focus:ring-violet-500/40">
                            {ROLE_ORDER.filter(r => r !== "Owner").map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#71717a] text-xs">{m.joined}</td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-[10px] font-medium " + (m.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400")}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.role !== "Owner" && (
                          <button onClick={() => removeMember(m.id)} aria-label={"Remove " + m.name}
                            className="text-[#71717a] hover:text-rose-400 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
              <h2 className="mb-4 text-sm font-semibold">Invite team member</h2>
              <div className="flex gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-3 focus-within:ring-2 focus-within:ring-violet-500/40 transition-all">
                  <Mail className="h-4 w-4 shrink-0 text-[#71717a]" />
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com" type="email"
                    className="flex-1 bg-transparent py-2 text-sm text-[#e5e5e5] placeholder:text-[#71717a] outline-none" />
                </div>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)}
                  className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] px-2 text-sm text-[#e5e5e5] outline-none focus:ring-2 focus:ring-violet-500/40">
                  {ROLE_ORDER.filter(r => r !== "Owner").map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button onClick={sendInvite} disabled={!inviteEmail || inviting}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110 active:scale-95 disabled:opacity-60 transition-all">
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : inviteSent ? <Check className="h-4 w-4" /> : null}
                  {inviteSent ? "Sent!" : inviting ? "Sending…" : "Invite"}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "permissions" && (
          <div className="rounded-xl border border-[#2a2a2a] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="px-5 py-3 text-left text-xs font-medium text-[#71717a]">Feature</th>
                  {ROLE_ORDER.map(r => <th key={r} className="px-5 py-3 text-center text-xs font-medium text-[#71717a]">{r}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {FEATURES.map((f, fi) => (
                  <tr key={f} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-sm">{f}</td>
                    {ROLE_ORDER.map(r => (
                      <td key={r} className="px-5 py-3 text-center">
                        {ROLE_ACCESS[r][fi]
                          ? <Check className="mx-auto h-4 w-4 text-emerald-400" />
                          : <X className="mx-auto h-4 w-4 text-[#3a3a3a]" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "billing" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#71717a]">Current plan</p>
                  <p className="mt-1 text-xl font-semibold">Business · $99/month</p>
                  <p className="text-xs text-[#71717a] mt-0.5">Renews Jun 1, 2026 · 5 seats included</p>
                </div>
                <button className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-sm hover:border-[#3a3a3a] transition-colors">Change plan</button>
              </div>
            </div>
            <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
              <h2 className="mb-3 text-sm font-semibold">Payment method</h2>
              <div className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-[#2a2a2a] px-2 py-1 text-xs font-bold">VISA</div>
                  <div>
                    <p className="text-sm">•••• •••• •••• 4242</p>
                    <p className="text-xs text-[#71717a]">Expires 08/2028</p>
                  </div>
                </div>
                <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Update</button>
              </div>
            </div>
          </div>
        )}

        {tab === "danger" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-rose-300">Delete workspace</h2>
                  <p className="mt-1 text-xs text-[#71717a] leading-relaxed">
                    Permanently delete the Acme workspace and all associated data including members, projects, and billing history. This action cannot be undone.
                  </p>
                  {!deleteConfirm ? (
                    <button onClick={() => setDeleteConfirm(true)}
                      className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all">
                      Delete workspace
                    </button>
                  ) : (
                    <div className="mt-4 flex items-center gap-2">
                      <button onClick={handleDelete} disabled={deleting}
                        className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110 active:scale-95 disabled:opacity-60 transition-all">
                        {deleting ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting…</> : "Yes, delete everything"}
                      </button>
                      <button onClick={() => setDeleteConfirm(false)} className="text-xs text-[#71717a] hover:text-[#e5e5e5] transition-colors">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`;

export const TEAM_SETTINGS_FILES: SandboxFile[] = [
  { path: "/src/App.tsx", contents: APP_TSX },
];
