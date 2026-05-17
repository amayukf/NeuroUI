import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState } from "react";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    id: "hobby",
    name: "Hobby",
    tagline: "For side projects and weekend tinkering.",
    monthly: 0,
    annual: 0,
    features: [
      "1 project",
      "Community support",
      "1 GB storage",
      "Basic analytics",
      "Up to 1k requests / month",
    ],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Everything you need to ship a real product.",
    monthly: 29,
    annual: 24,
    features: [
      "10 projects",
      "Priority email support",
      "100 GB storage",
      "Advanced analytics with exports",
      "Up to 1M requests / month",
      "Custom domains",
      "Daily backups",
    ],
    cta: "Start Pro trial",
    highlight: true,
  },
  {
    id: "team",
    name: "Team",
    tagline: "For teams shipping production workloads.",
    monthly: 99,
    annual: 79,
    features: [
      "Unlimited projects",
      "24/7 chat support",
      "1 TB storage",
      "Audit log + SSO",
      "Up to 25M requests / month",
      "Role-based access",
      "Dedicated success manager",
      "Compliance reports (SOC 2)",
    ],
    cta: "Start Team trial",
  },
];

export default function App() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-violet-300">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Simple pricing that scales with you
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Start free, upgrade when you outgrow it. Every plan includes the platform, the SDK, and unlimited collaborators.
          </p>

          <fieldset
            className="mx-auto mt-8 inline-flex rounded-full border border-zinc-800 bg-zinc-900 p-1 text-sm"
            aria-label="Billing period"
          >
            {(["monthly", "annual"] as const).map((b) => (
              <label
                key={b}
                className={\`relative cursor-pointer rounded-full px-4 py-1.5 capitalize transition-colors \${
                  billing === b ? "bg-violet-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                }\`}
              >
                <input
                  type="radio"
                  name="billing"
                  value={b}
                  checked={billing === b}
                  onChange={() => setBilling(b)}
                  className="sr-only"
                />
                {b}
                {b === "annual" && (
                  <span className="ml-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    -17%
                  </span>
                )}
              </label>
            ))}
          </fieldset>
        </header>

        <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={\`relative flex flex-col rounded-2xl border p-6 transition-colors \${
                tier.highlight
                  ? "border-violet-500/60 bg-gradient-to-b from-violet-500/10 to-zinc-900/60 shadow-xl shadow-violet-500/10"
                  : "border-zinc-800 bg-zinc-900/60"
              }\`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-6 rounded-full bg-violet-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Most popular
                </div>
              )}

              <h2 className="text-lg font-semibold text-white">{tier.name}</h2>
              <p className="mt-1 text-sm text-zinc-400">{tier.tagline}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-white">
                  \${billing === "annual" ? tier.annual : tier.monthly}
                </span>
                <span className="text-sm text-zinc-500">/ user / month</span>
              </div>
              {billing === "annual" && tier.monthly > 0 && (
                <div className="text-xs text-zinc-500">
                  billed \${tier.annual * 12}/yr
                </div>
              )}

              <button
                className={\`mt-6 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors \${
                  tier.highlight
                    ? "bg-violet-500 text-white hover:bg-violet-400"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700"
                }\`}
              >
                {tier.cta}
              </button>

              <ul role="list" className="mt-6 space-y-2.5 border-t border-zinc-800 pt-6 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-zinc-300">
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <p className="mt-10 text-center text-xs text-zinc-500">
          All prices in USD. Cancel anytime. Need a custom plan?{" "}
          <a href="#" className="text-violet-300 hover:text-violet-200">Talk to sales</a>
        </p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4L8.5 12 15.3 5.3a1 1 0 011.4 0z" clipRule="evenodd" />
    </svg>
  );
}
`;

const SPEC_JSON = `{
  "componentName": "PricingPage",
  "componentType": "landing",
  "summary": "Three-tier SaaS pricing with monthly/annual toggle and a highlighted recommended plan.",
  "sections": [
    { "id": "header", "title": "Pitch + billing toggle", "purpose": "Set context and let user switch billing period" },
    { "id": "tiers", "title": "Three pricing tiers", "purpose": "Compare Hobby vs Pro vs Team" },
    { "id": "footer", "title": "Footer reassurance", "purpose": "USD note and contact sales link" }
  ],
  "interactions": ["toggle monthly/annual", "click CTA"],
  "dataShape": [
    { "name": "tier.id", "type": "string", "example": "pro" },
    { "name": "tier.monthly", "type": "number", "example": 29 },
    { "name": "tier.features", "type": "string[]", "example": ["10 projects"] }
  ],
  "tone": "premium"
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
    "display": "text-4xl sm:text-5xl font-semibold tracking-tight",
    "heading": "text-lg font-semibold",
    "body": "text-sm",
    "label": "text-xs font-medium uppercase tracking-widest",
    "mono": "font-mono"
  },
  "layout": {
    "container": "max-w-6xl mx-auto px-6",
    "gap": "gap-6",
    "radius": "rounded-2xl",
    "shadow": "shadow-xl shadow-violet-500/10",
    "density": "spacious"
  },
  "vibe": "Modern SaaS pricing — confident headline, one clear winner, generous whitespace."
}`;

const REPORT_MD = `# Validation report

## Issues
- none

## Notes
- Billing toggle uses a real radio fieldset with sr-only inputs for accessibility.
- All feature lists have role=list to preserve list semantics across screen readers.
`;

export const PRICING_PAGE_FILES: SandboxFile[] = [
  { path: "/spec.json", contents: SPEC_JSON },
  { path: "/design.json", contents: DESIGN_JSON },
  { path: "/src/App.tsx", contents: APP_TSX },
  { path: "/report.md", contents: REPORT_MD },
];
