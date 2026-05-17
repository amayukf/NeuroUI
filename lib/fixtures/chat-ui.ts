import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, Search, MoreVertical, Phone, Video, ChevronLeft } from "lucide-react";

interface Message {
  id: string;
  text: string;
  from: "me" | "them";
  time: string;
}

interface Convo {
  id: string;
  name: string;
  initials: string;
  color: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const CONVOS: Convo[] = [
  {
    id: "c1", name: "Sarah Rodriguez", initials: "SR", color: "bg-rose-500", online: true,
    lastMsg: "Can you review the PR before EOD?", time: "2m", unread: 3,
    messages: [
      { id: "m1", text: "Hey! Do you have a moment?", from: "them", time: "10:12 AM" },
      { id: "m2", text: "Sure, what's up?", from: "me", time: "10:13 AM" },
      { id: "m3", text: "I pushed the new auth flow. Can you review the PR before EOD? There's a tricky part around the token refresh logic I want a second pair of eyes on.", from: "them", time: "10:14 AM" },
      { id: "m4", text: "Absolutely, I'll take a look now. Any specific areas you're worried about?", from: "me", time: "10:15 AM" },
      { id: "m5", text: "Can you review the PR before EOD?", from: "them", time: "10:16 AM" },
    ],
  },
  {
    id: "c2", name: "Marcus Liu", initials: "ML", color: "bg-blue-500", online: true,
    lastMsg: "The deploy went smooth! 🚀", time: "18m", unread: 0,
    messages: [
      { id: "m1", text: "Deploy starting now", from: "me", time: "9:45 AM" },
      { id: "m2", text: "Roger. Monitoring datadog", from: "them", time: "9:46 AM" },
      { id: "m3", text: "The deploy went smooth! 🚀", from: "them", time: "10:02 AM" },
    ],
  },
  {
    id: "c3", name: "Product Team", initials: "PT", color: "bg-violet-500", online: false,
    lastMsg: "Sprint planning is moved to Thu", time: "1h", unread: 1,
    messages: [
      { id: "m1", text: "Sprint planning is moved to Thu", from: "them", time: "9:00 AM" },
    ],
  },
  {
    id: "c4", name: "Kai Patel", initials: "KP", color: "bg-amber-500", online: false,
    lastMsg: "Thanks for the feedback!", time: "3h", unread: 0,
    messages: [
      { id: "m1", text: "Thanks for the feedback!", from: "them", time: "7:30 AM" },
    ],
  },
  {
    id: "c5", name: "Aisha Thompson", initials: "AT", color: "bg-emerald-500", online: true,
    lastMsg: "Can we sync tomorrow morning?", time: "1d", unread: 0,
    messages: [
      { id: "m1", text: "Can we sync tomorrow morning?", from: "them", time: "Yesterday" },
    ],
  },
];

export default function App() {
  const [activeId, setActiveId] = useState("c1");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>(
    Object.fromEntries(CONVOS.map(c => [c.id, c.messages]))
  );
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = CONVOS.find(c => c.id === activeId)!;
  const activeMessages = messages[activeId] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const msg: Message = { id: Date.now().toString(), text, from: "me", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }));
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply: Message = { id: (Date.now() + 1).toString(), text: "Got it! I'll follow up shortly.", from: "them", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), reply] }));
    }, 1800);
  }

  const filtered = CONVOS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <div className="flex w-72 shrink-0 flex-col border-r border-[#2a2a2a]">
        <div className="border-b border-[#2a2a2a] p-4">
          <h1 className="mb-3 text-base font-semibold">Messages</h1>
          <div className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-[#71717a]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="flex-1 bg-transparent text-sm text-[#e5e5e5] placeholder:text-[#71717a] outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={"flex w-full items-center gap-3 px-4 py-3 text-left transition-colors " + (activeId === c.id ? "bg-violet-500/10 border-r-2 border-violet-500" : "hover:bg-white/5")}>
              <div className="relative shrink-0">
                <div className={"flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white " + c.color}>{c.initials}</div>
                {c.online && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0f0f0f] bg-emerald-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  <span className="shrink-0 text-[10px] text-[#71717a] ml-1">{c.time}</span>
                </div>
                <p className="truncate text-xs text-[#71717a] mt-0.5">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && <div className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white">{c.unread}</div>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className={"flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white " + active.color}>{active.initials}</div>
            <div>
              <p className="text-sm font-semibold">{active.name}</p>
              <p className="text-[11px] text-[#71717a]">{active.online ? "Online" : "Offline"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button aria-label="Voice call" className="rounded-lg p-2 text-[#71717a] hover:bg-white/5 hover:text-[#e5e5e5] transition-colors"><Phone className="h-4 w-4" /></button>
            <button aria-label="Video call" className="rounded-lg p-2 text-[#71717a] hover:bg-white/5 hover:text-[#e5e5e5] transition-colors"><Video className="h-4 w-4" /></button>
            <button aria-label="More options" className="rounded-lg p-2 text-[#71717a] hover:bg-white/5 hover:text-[#e5e5e5] transition-colors"><MoreVertical className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeMessages.map(m => (
            <div key={m.id} className={"flex " + (m.from === "me" ? "justify-end" : "justify-start")}>
              <div className={"max-w-xs lg:max-w-md " + (m.from === "me" ? "items-end" : "items-start") + " flex flex-col gap-1"}>
                <div className={"rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                  (m.from === "me" ? "bg-violet-500 text-white rounded-br-sm" : "bg-[#1a1a1a] text-[#e5e5e5] rounded-bl-sm border border-[#2a2a2a]")}>
                  {m.text}
                </div>
                <span className="text-[10px] text-[#71717a] px-1">{m.time}</span>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3">
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} className="h-2 w-2 rounded-full bg-[#71717a] animate-bounce" style={{ animationDelay: d + "s" }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[#2a2a2a] p-4">
          <div className="flex items-end gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2.5 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
            <button aria-label="Attach file" className="shrink-0 text-[#71717a] hover:text-[#e5e5e5] transition-colors pb-0.5">
              <Paperclip className="h-4.5 w-4.5" />
            </button>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type a message…" rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-[#e5e5e5] placeholder:text-[#71717a] outline-none" />
            <button aria-label="Emoji" className="shrink-0 text-[#71717a] hover:text-[#e5e5e5] transition-colors pb-0.5">
              <Smile className="h-4.5 w-4.5" />
            </button>
            <button onClick={send} aria-label="Send message"
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 text-white hover:brightness-110 active:scale-95 transition-all">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

export const CHAT_UI_FILES: SandboxFile[] = [
  { path: "/src/App.tsx", contents: APP_TSX },
];
