# NeuroUI

**NeuroUI turns plain English into production React components in seconds.**  
Powered by 6 AI agents built on the [Cursor Agent SDK](https://cursor.com/docs/api/sdk/typescript).

> Type: *"A SaaS analytics dashboard with KPI cards and a revenue chart"*  
> Get: a fully functional, dark-themed, TypeScript + Tailwind + Recharts component — in under 90 seconds.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/neuroui)

---

## What makes it different

- **Not a template library** — every output is unique, generated fresh from your description  
- **Not a drag-and-drop builder** — it writes the code a senior frontend engineer would write  
- **Not a chatbot** — six specialized AI agents collaborate in a pipeline, each with a focused job  
- **Export-ready** — download as ZIP, open in StackBlitz or CodeSandbox, share via URL

---

## Architecture

```
User prompt
    │
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                           │
│                                                                     │
│  POST /api/generate  ──────────────────────────────────────────►   │
│                                Server-Sent Events stream            │
│          │                                                          │
│          ▼                                                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              6-Agent Pipeline  (lib/pipeline.ts)              │  │
│  │                                                               │  │
│  │  1. Interpret  →  spec.json       (what the user wants)       │  │
│  │  2. Design     →  design.json     (palette, layout, fonts)    │  │
│  │  3. Generate   →  src/App.tsx     (React + Tailwind + charts) │  │
│  │  4. Connect    →  src/App.tsx     (inject realistic mock data) │  │
│  │  5. Validate   →  report.md       (bug & a11y audit)          │  │
│  │  6. Optimize   →  src/App.tsx     (fixes + final polish)      │  │
│  │                                                               │  │
│  │  Each agent:  Agent.create() → agent.send() → run.stream()   │  │
│  │  Shared CWD:  /tmp/neuroui/<requestId>/                       │  │
│  │  Cleanup:     agent[Symbol.asyncDispose]() in finally {}      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Client receives SSE events → animates PipelineView → renders      │
│  generated code in Monaco Editor + Sandpack live preview            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Details |
|---|---|
| 9 instant demos | Financial dashboard, SaaS analytics, Login, Pricing, Kanban, E-commerce, Chat UI, Team settings, Data table |
| Left sidebar | Generation history (localStorage, last 10), template library |
| Live preview | Sandpack iframe — recharts + lucide-react included |
| Code view | Monaco Editor with full TypeScript syntax highlighting |
| Export | ZIP download (Vite + Tailwind boilerplate included) |
| Open online | StackBlitz · CodeSandbox — one click, no setup |
| Share | Unique URL `/g/[id]` with Open Graph meta tags |
| Prompt enhance | One-click AI rewrite of your rough idea into a detailed prompt |
| Health check | `GET /api/health` — version, fixture count, API key status |

---

## Setup

### Prerequisites

- Node.js 20+
- A [Cursor API key](https://cursor.com/settings)

### 1. Clone and install

```bash
git clone https://github.com/your-org/neuroui
cd neuroui
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local and add your CURSOR_API_KEY
```

### 3. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Smoke test (optional)

```bash
CURSOR_API_KEY=your_key npx tsx scripts/smoke.ts
```

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Set `CURSOR_API_KEY` in your Vercel project environment variables.

The `vercel.json` already configures:
- `/api/generate` → 300s timeout, 1024 MB RAM (for multi-agent pipeline)
- `/api/enhance` → 30s timeout, 512 MB RAM

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI components | lucide-react |
| AI agents | Cursor SDK (`@cursor/sdk`) |
| Live preview | Sandpack (`@codesandbox/sandpack-react`) |
| Code editor | Monaco Editor (`@monaco-editor/react`) |
| Charts | Recharts |
| ZIP export | JSZip |

---

## Agent system prompts

Each agent in the pipeline has a focused role:

- **Interpret** — converts natural language → structured `spec.json`
- **Design** — chooses color palette, typography, layout → `design.json`
- **Generate** — writes complete React + Tailwind + Recharts component (senior-engineer quality)
- **Connect** — injects realistic mock data (real names, real numbers, real dates)
- **Validate** — audits for bugs, missing keys, accessibility issues → `report.md`
- **Optimize** — applies all fixes, enforces consistent formatting

---

## SDK guardrails

Every agent call follows these rules:

```typescript
const agent = await Agent.create({ apiKey, model: { id: "composer-2" }, local: { cwd } });
try {
  const run = agent.send(prompt);
  for await (const event of run.stream()) { /* stream events to SSE */ }
  await run.wait();
} finally {
  await agent[Symbol.asyncDispose](); // always clean up
}
```

- Explicit `apiKey` on every call — no ambient credential leakage  
- Pinned model (`composer-2`) — deterministic behaviour  
- Isolated `cwd` per request — agents share files, not memory  
- `try/finally` with `Symbol.asyncDispose` — no zombie agents on error  
- Timeout per agent (120 s generate, 60 s others) — bounded latency  

---

## Note on sharing

Shared generations (`/g/[id]`) are stored in-memory on the server. They survive for the lifetime of the serverless instance but are lost on restart/redeploy. For production persistence, replace `lib/share-store.ts` with Vercel KV, PlanetScale, or any key-value store.

---

*Built for the Cursor SDK Hackathon 2026.*
