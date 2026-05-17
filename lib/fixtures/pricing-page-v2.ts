import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState } from "react";
import { Check, X, ChevronDown, Star, Zap, Shield, Building2 } from "lucide-react";

const PLANS = [
  {
    id: "hobby", icon: Zap, name: "Hobby", monthly: 0, annual: 0,
    description: "For side projects and personal exploration.",
    cta: "Start free", primary: false,
    features: ["5 projects", "1 GB storage", "Community support", "Public repos only", "Basic analytics"],
    unavailable: ["Team collaboration", "Custom domains", "SSO / SAML", "SLA guarantee", "Priority support"],
  },
  {
    id: "pro", icon: Shield, name: "Pro", monthly: 29, annual: 23,
    description: "For professionals shipping production apps.",
    cta: "Start 14-day trial", primary: true,
    features: ["Unlimited projects", "50 GB storage", "Email support", "Private repos", "Advanced analytics", "Team collaboration", "Custom domains"],
    unavailable: ["SSO / SAML", "SLA guarantee", "Priority support"],
  },
  {
    id: "team", icon: Building2, name: "Team", monthly: 89, annual: 71,
    description: "For growing teams with enterprise needs.",
    cta: "Contact sales", primary: false,
    features: ["Unlimited projects", "500 GB storage", "Priority support", "Private repos", "Advanced analytics", "Team collaboration", "Custom domains", "SSO / SAML", "SLA guarantee"],
    unavailable: [],
  },
];

const ALL_FEATURES = [
  "Projects", "Storage", "Support", "Private repos", "Custom domains",
  "Team members", "Analytics", "SSO / SAML", "SLA", "API rate limit",
];

const FEATURE_VALUES: Record<string, [string, string, string]> = {
  "Projects": ["5", "Unlimited", "Unlimited"],
  "Storage": ["1 GB", "50 GB", "500 GB"],
  "Support": ["Community", "Email", "Priority"],
  "Private repos": ["—", "✓", "✓"],
  "Custom domains": ["—", "✓", "✓"],
  "Team members": ["1", "Up to 10", "Unlimited"],
  "Analytics": ["Basic", "Advanced", "Advanced + export"],
  "SSO / SAML": ["—", "—", "✓"],
  "SLA": ["—", "—", "99.99%"],
  "API rate limit": ["1k/day", "50k/day", "Unlimited"],
};

const TESTIMONIALS = [
  { name: "Priya S.", role: "CTO at Quorum", rating: 5, text: "Switched from a $400/month competitor. Same features, a third of the price. The team tier's SSO alone saved us weeks of setup." },
  { name: "James L.", role: "Indie Hacker", rating: 5, text: "The Hobby plan got me through my MVP. Upgraded to Pro when I got my first 100 users. Dead simple." },
  { name: "Farah M.", role: "Engineering Manager", rating: 5, text: "I was skeptical, but the onboarding took 10 minutes. Analytics are exactly what I needed. No bloat." },
];

const FAQS = [
  { q: "Can I change plans at any time?", a: "Yes. You can upgrade, downgrade, or cancel at any point. Upgrades take effect immediately; downgrades apply at the end of your billing cycle." },
  { q: "Do you offer refunds?", a: "We offer a full refund within 14 days if you're not satisfied. No questions asked." },
  { q: "What payment methods do you accept?", a: "Visa, Mastercard, American Express, and PayPal. Annual plans can also be paid by invoice for amounts over $1,000." },
  { q: "Is my data safe if I cancel?", a: "Your data is retained for 30 days after cancellation, giving you time to export everything. After 30 days it is permanently deleted." },
  { q: "Do you offer discounts for startups or non-profits?", a: "Yes — reach out via our contact page and we'll set you up with a 50% discount if you qualify." },
];

export default function App() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            Simple, transparent pricing
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Pay for what you use.<br />Not a penny more.</h1>
          <p className="mt-4 text-[#71717a] text-lg">Start free. Upgrade when you're ready. Cancel anytime.</p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] p-1">
            <button onClick={() => setAnnual(false)}
              className={"rounded-full px-4 py-1.5 text-sm font-medium transition-all " + (!annual ? "bg-[#2a2a2a] text-[#e5e5e5]" : "text-[#71717a] hover:text-[#e5e5e5]")}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className={"flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all " + (annual ? "bg-[#2a2a2a] text-[#e5e5e5]" : "text-[#71717a] hover:text-[#e5e5e5]")}>
              Annual
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-400">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-12">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <div key={plan.id}
                className={"relative flex flex-col rounded-2xl border p-6 transition-all " +
                  (plan.primary ? "border-violet-500 bg-violet-500/5 shadow-xl shadow-violet-500/10" : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]")}>
                {plan.primary && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    Most popular
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <div className={"flex h-8 w-8 items-center justify-center rounded-lg " + (plan.primary ? "bg-violet-500/20" : "bg-[#2a2a2a]")}>
                    <plan.icon className={"h-4 w-4 " + (plan.primary ? "text-violet-400" : "text-[#71717a]")} />
                  </div>
                  <span className="text-base font-semibold">{plan.name}</span>
                </div>
                <p className="text-[#71717a] text-xs mb-5 leading-relaxed">{plan.description}</p>
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{price === 0 ? "Free" : "$" + price}</span>
                    {price > 0 && <span className="text-[#71717a] text-sm">/mo</span>}
                  </div>
                  {annual && price > 0 && <p className="text-xs text-[#71717a] mt-0.5">billed annually · \${(price * 12).toLocaleString()}/yr</p>}
                </div>
                <button className={"mb-6 w-full rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-95 " +
                  (plan.primary ? "bg-violet-500 text-white hover:brightness-110" : "border border-[#2a2a2a] text-[#e5e5e5] hover:border-[#3a3a3a]")}>
                  {plan.cta}
                </button>
                <div className="space-y-2.5 text-sm">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className={"h-4 w-4 mt-0.5 shrink-0 " + (plan.primary ? "text-violet-400" : "text-emerald-400")} />
                      <span className="text-[#e5e5e5]">{f}</span>
                    </div>
                  ))}
                  {plan.unavailable.map(f => (
                    <div key={f} className="flex items-start gap-2 opacity-40">
                      <X className="h-4 w-4 mt-0.5 shrink-0 text-[#71717a]" />
                      <span className="text-[#71717a] line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-12">
          <button onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors mx-auto">
            {showTable ? "Hide" : "Show"} full comparison table
            <ChevronDown className={"h-4 w-4 transition-transform " + (showTable ? "rotate-180" : "")} />
          </button>
          {showTable && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#2a2a2a]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a2a] bg-[#111]">
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#71717a]">Feature</th>
                    {PLANS.map(p => <th key={p.id} className={"px-5 py-3 text-center text-xs font-semibold " + (p.primary ? "text-violet-300" : "text-[#e5e5e5]")}>{p.name}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {ALL_FEATURES.map(f => (
                    <tr key={f} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-[#71717a]">{f}</td>
                      {(FEATURE_VALUES[f] ?? ["—","—","—"]).map((v, i) => (
                        <td key={i} className={"px-5 py-3 text-center text-xs " + (v === "—" ? "text-[#3a3a3a]" : v === "✓" ? "text-emerald-400" : "text-[#e5e5e5]")}>
                          {v === "✓" ? <Check className="mx-auto h-4 w-4" /> : v === "—" ? <X className="mx-auto h-4 w-4" /> : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-center text-xl font-semibold">Loved by builders</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 hover:border-[#3a3a3a] transition-colors">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-[#71717a] leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-[#71717a]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-center text-xl font-semibold">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-white/5 transition-colors">
                  {faq.q}
                  <ChevronDown className={"h-4 w-4 shrink-0 text-[#71717a] transition-transform " + (openFaq === i ? "rotate-180" : "")} />
                </button>
                {openFaq === i && (
                  <div className="border-t border-[#2a2a2a] px-5 py-4 text-sm text-[#71717a] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

export const PRICING_PAGE_V2_FILES: SandboxFile[] = [
  { path: "/src/App.tsx", contents: APP_TSX },
];
