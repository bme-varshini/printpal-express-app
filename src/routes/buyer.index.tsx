import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart, Smartphone, MapPin, DollarSign, Palette, Search } from "lucide-react";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { getPrinters } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/buyer/")({ component: BuyerHome });

function BuyerHome() {
  const printers = getPrinters();
  const [q, setQ] = useState("");
  const filtered = printers.filter(p => (p.name + p.location).toLowerCase().includes(q.toLowerCase()));

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <div className="flex gap-3 mb-6">
          <Pill active icon={<ShoppingCart className="w-4 h-4" />}>Find Printers</Pill>
          <Link to="/buyer/orders" className="flex-1"><Pill icon={<Smartphone className="w-4 h-4" />}>My Orders</Pill></Link>
        </div>

        <div className="relative mb-5">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or location"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-muted border border-border outline-none focus:border-primary" />
        </div>

        <h2 className="font-display text-2xl text-primary mb-4">Available Printers</h2>

        <div className="space-y-3">
          {filtered.map(p => (
            <Link key={p.id} to="/buyer/printer/$id" params={{ id: p.id }} className="block rounded-2xl border border-border overflow-hidden bg-card hover:shadow-md transition">
              <div className="bg-primary-soft px-4 py-2.5 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.online ? "bg-success/15 text-success" : "bg-muted-foreground/15 text-muted-foreground"}`}>
                  {p.online ? "Online" : "Offline"}
                </span>
              </div>
              <div className="px-4 py-3 space-y-1.5 text-sm">
                <Row icon={<MapPin className="w-4 h-4 text-primary" />} label={p.location} />
                <div className="flex justify-between">
                  <Row icon={<DollarSign className="w-4 h-4 text-primary" />} label={`₹${p.pricePerPage}/page`} />
                  <span className="text-xs text-muted-foreground">Delivery ₹{p.deliveryCharge}</span>
                </div>
                <Row icon={<Palette className="w-4 h-4 text-primary" />} label={p.services} />
              </div>
            </Link>
          ))}
        </div>
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}

function Pill({ children, icon, active }: any) {
  return (
    <div className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}>
      {icon}{children}
    </div>
  );
}
function Row({ icon, label }: any) {
  return <div className="flex items-center gap-2 text-foreground/90">{icon}<span>{label}</span></div>;
}
