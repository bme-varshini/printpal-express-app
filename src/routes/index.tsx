import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin, Star, Filter } from "lucide-react";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { usePrinters, CATEGORIES } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const printers = usePrinters();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = printers.filter(p => {
    const matchQ = (p.name + p.location + p.services).toLowerCase().includes(q.toLowerCase());
    const matchC = cat === "All" || p.category === cat;
    return matchQ && matchC;
  });

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <div className="mb-1">
          <h1 className="font-display text-3xl text-primary leading-tight">Find a Printer</h1>
          <p className="text-sm text-muted-foreground">Browse nearby print shops — no login needed.</p>
        </div>

        <div className="relative mt-5 mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search shops, services, location"
            className="w-full pl-9 pr-10 py-3 text-sm rounded-xl bg-muted border border-border outline-none focus:border-primary"
          />
          <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full border transition ${cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <h2 className="font-display text-xl mb-3">Nearby Printers <span className="text-muted-foreground text-sm font-sans">({filtered.length})</span></h2>

        <div className="space-y-3">
          {filtered.map(p => (
            <Link
              key={p.id}
              to="/buyer/printer/$id"
              params={{ id: p.id }}
              className="block rounded-2xl border border-border overflow-hidden bg-card hover:shadow-md transition active:scale-[0.99]"
            >
              <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold truncate">{p.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.online ? "bg-success/15 text-success" : "bg-muted-foreground/15 text-muted-foreground"}`}>
                      {p.online ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.distance}</span>
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{p.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-muted-foreground">from</div>
                  <div className="font-display text-lg font-semibold text-primary leading-none">₹{p.pricePerPage}</div>
                  <div className="text-[10px] text-muted-foreground">/page</div>
                </div>
              </div>
              <div className="px-4 pb-3 text-xs text-muted-foreground truncate">{p.services} · {p.location}</div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">No printers match your search.</div>
          )}
        </div>
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}
