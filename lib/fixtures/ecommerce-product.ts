import type { SandboxFile } from "../sandbox";

const APP_TSX = `import { useState } from "react";
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Minus, Plus, Check, Truck, Shield, RefreshCw } from "lucide-react";

const COLORS = [
  { id: "midnight", label: "Midnight Black", hex: "#111" },
  { id: "stone", label: "Warm Stone", hex: "#a8967a" },
  { id: "sage", label: "Sage Green", hex: "#6b8f71" },
  { id: "navy", label: "Navy Blue", hex: "#1e3a5f" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];

const REVIEWS = [
  { name: "Sarah K.", rating: 5, date: "May 12, 2026", text: "Absolutely love this jacket. The build quality is exceptional and it keeps me warm without being bulky. Runs true to size.", verified: true },
  { name: "Marcus T.", rating: 4, date: "Apr 28, 2026", text: "Great product, very well made. Color is exactly as shown. Only minor gripe is the zipper feels slightly stiff at first — loosens up after a week.", verified: true },
  { name: "Priya N.", rating: 5, date: "Apr 14, 2026", text: "Third time buying this brand. Never disappoints. This colorway is stunning in person, much richer than photos show.", verified: false },
];

const RELATED = [
  { name: "Merino Wool Crewneck", price: "$145", rating: 4.7, reviews: 234 },
  { name: "Technical Cargo Pants", price: "$210", rating: 4.5, reviews: 156 },
  { name: "Waxed Canvas Tote", price: "$89", rating: 4.8, reviews: 412 },
];

function Stars({ n, size = "h-4 w-4" }: { n: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={size + " " + (i <= n ? "fill-amber-400 text-amber-400" : "fill-none text-[#3a3a3a]")} />
      ))}
    </div>
  );
}

export default function App() {
  const [selectedColor, setSelectedColor] = useState("midnight");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [sizeError, setSizeError] = useState(false);

  const PLACEHOLDER_COLORS = ["#1a1a2e", "#2d1b1b", "#1a2d1a", "#1b1b2d"];

  function addToCart() {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-[#2a2a2a]" style={{ background: PLACEHOLDER_COLORS[imageIndex], aspectRatio: "4/5" }}>
              <div className="absolute inset-0 flex items-center justify-center text-[#3a3a3a] text-sm">Product image {imageIndex + 1}</div>
              <button onClick={() => setImageIndex((imageIndex - 1 + 4) % 4)} aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setImageIndex((imageIndex + 1) % 4)} aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {[0,1,2,3].map(i => <div key={i} className={"h-1.5 w-1.5 rounded-full transition-colors " + (i === imageIndex ? "bg-white" : "bg-white/40")} />)}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {PLACEHOLDER_COLORS.map((c, i) => (
                <button key={i} onClick={() => setImageIndex(i)} aria-label={"View image " + (i+1)}
                  className={"h-16 flex-1 rounded-lg border-2 transition-colors " + (imageIndex === i ? "border-violet-500" : "border-[#2a2a2a]")}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-violet-400">Outerwear Collection</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">Alpine Technical Jacket</h1>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setWishlisted(!wishlisted)} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
                  <Heart className={"h-4 w-4 transition-colors " + (wishlisted ? "fill-rose-500 text-rose-500" : "text-[#71717a]")} />
                </button>
                <button aria-label="Share product"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
                  <Share2 className="h-4 w-4 text-[#71717a]" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Stars n={5} />
              <span className="text-sm text-[#71717a]">4.8 · 847 reviews</span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-semibold">$189</span>
              <span className="text-base text-[#71717a] line-through">$240</span>
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-400">Save $51</span>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-xs font-medium text-[#e5e5e5]">Color — <span className="text-[#71717a]">{COLORS.find(c => c.id === selectedColor)?.label}</span></p>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c.id} onClick={() => setSelectedColor(c.id)} aria-label={c.label}
                    className={"h-8 w-8 rounded-full border-2 transition-all " + (selectedColor === c.id ? "border-violet-500 scale-110" : "border-transparent hover:border-[#3a3a3a]")}
                    style={{ background: c.hex }} />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className={"text-xs font-medium " + (sizeError ? "text-rose-400" : "text-[#e5e5e5]")}>
                  {sizeError ? "Please select a size" : "Size"}
                </p>
                <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Size guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(s => (
                  <button key={s} onClick={() => { setSelectedSize(s); setSizeError(false); }}
                    className={"rounded-lg border px-3 py-1.5 text-sm font-medium transition-all active:scale-95 " +
                      (selectedSize === s ? "border-violet-500 bg-violet-500/10 text-violet-300" : "border-[#2a2a2a] text-[#e5e5e5] hover:border-[#3a3a3a]")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-[#2a2a2a]">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center text-[#71717a] hover:text-[#e5e5e5] transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity"
                  className="flex h-9 w-9 items-center justify-center text-[#71717a] hover:text-[#e5e5e5] transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button onClick={addToCart}
                className={"flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-95 " +
                  (added ? "bg-emerald-500 text-white" : "bg-violet-500 text-white hover:brightness-110")}>
                {added ? <><Check className="h-4 w-4" />Added!</> : <><ShoppingCart className="h-4 w-4" />Add to cart</>}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[{ icon: Truck, label: "Free shipping", sub: "Over $150" }, { icon: Shield, label: "2-year warranty", sub: "Full coverage" }, { icon: RefreshCw, label: "Free returns", sub: "Within 60 days" }].map(f => (
                <div key={f.label} className="rounded-lg border border-[#2a2a2a] p-3 text-center">
                  <f.icon className="mx-auto h-4 w-4 text-violet-400" />
                  <p className="mt-1.5 text-xs font-medium">{f.label}</p>
                  <p className="text-[10px] text-[#71717a]">{f.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#2a2a2a] pt-6">
              <div className="flex gap-1 border-b border-[#2a2a2a]">
                {["description", "reviews", "specs"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={"px-3 py-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px " +
                      (activeTab === tab ? "border-violet-500 text-violet-300" : "border-transparent text-[#71717a] hover:text-[#e5e5e5]")}>
                    {tab === "reviews" ? "Reviews (847)" : tab}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                {activeTab === "description" && <p className="text-sm text-[#71717a] leading-relaxed">Engineered for mountain conditions and urban commutes alike. The Alpine Technical Jacket features a 3-layer Gore-Tex membrane, YKK waterproof zippers, and articulated patterning for unrestricted movement. Packable to its own chest pocket.</p>}
                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    {REVIEWS.map(r => (
                      <div key={r.name} className="border-b border-[#2a2a2a] pb-4 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">{r.name[0]}</div>
                            <div>
                              <p className="text-xs font-medium">{r.name} {r.verified && <span className="text-emerald-400">✓ Verified</span>}</p>
                              <p className="text-[10px] text-[#71717a]">{r.date}</p>
                            </div>
                          </div>
                          <Stars n={r.rating} size="h-3.5 w-3.5" />
                        </div>
                        <p className="mt-2 text-xs text-[#71717a] leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "specs" && (
                  <dl className="space-y-2 text-xs">
                    {[["Material", "3-layer Gore-Tex Pro"], ["Weight", "680g"], ["Packability", "Packs to chest pocket"], ["Waterproofing", "20,000mm HH"], ["Breathability", "20,000g/m²/24h"], ["Pockets", "5 total (3 exterior, 2 interior)"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-[#2a2a2a] py-1.5">
                        <dt className="text-[#71717a]">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-4 text-lg font-semibold">You might also like</h2>
          <div className="grid grid-cols-3 gap-4">
            {RELATED.map(p => (
              <div key={p.name} className="group cursor-pointer rounded-xl border border-[#2a2a2a] p-4 hover:border-[#3a3a3a] transition-colors">
                <div className="mb-3 h-32 rounded-lg bg-[#1a1a1a] group-hover:bg-[#222] transition-colors" />
                <p className="text-sm font-medium">{p.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Stars n={Math.round(p.rating)} size="h-3 w-3" />
                  <span className="text-[10px] text-[#71717a]">{p.reviews}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-violet-300">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

export const ECOMMERCE_PRODUCT_FILES: SandboxFile[] = [
  { path: "/src/App.tsx", contents: APP_TSX },
];
