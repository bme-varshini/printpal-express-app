import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { useOrders } from "@/lib/store";
import { FileText, MapPin, ShoppingCart, Smartphone } from "lucide-react";

export const Route = createFileRoute("/buyer/orders")({ component: BuyerOrders });

const STAGES = ["Received", "Printing", "Ready for Pick Up"] as const;

function BuyerOrders() {
  const { orders } = useOrders();

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <div className="flex gap-3 mb-6">
          <Link to="/buyer" className="flex-1"><Pill icon={<ShoppingCart className="w-4 h-4" />}>Find Printers</Pill></Link>
          <Pill active icon={<Smartphone className="w-4 h-4" />}>My Orders</Pill>
        </div>

        <h2 className="font-display text-2xl text-primary mb-4">My Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No orders yet. <Link to="/buyer" className="text-primary font-semibold">Find a printer →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => {
              const stageIdx = STAGES.indexOf(o.status as any);
              return (
                <Link key={o.id} to="/buyer/order/$id" params={{ id: o.id }} className="block rounded-2xl border border-border bg-card p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-medium">{o.fileName}</span>
                    </div>
                    <span className="text-xs bg-primary-soft text-primary px-2 py-1 rounded-md font-semibold">₹{(o.pages * o.copies * o.pricePerPage).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5" />{o.location}
                  </div>

                  <Tracker stageIdx={stageIdx >= 0 ? stageIdx : 2} />

                  <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex justify-between">
                    <span>Order #{o.id}</span>
                    <span>{new Date(o.placedOn).toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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

export function Tracker({ stageIdx }: { stageIdx: number }) {
  return (
    <div className="relative flex justify-between items-start mt-1">
      <div className="absolute top-2 left-2 right-2 h-0.5 bg-border" />
      <div className="absolute top-2 left-2 h-0.5 bg-primary transition-all" style={{ width: `calc((100% - 1rem) * ${stageIdx / (STAGES.length - 1)})` }} />
      {STAGES.map((s, i) => (
        <div key={s} className="flex flex-col items-center relative z-10 w-1/3">
          <div className={`w-4 h-4 rounded-full border-2 ${i <= stageIdx ? "bg-primary border-primary" : "bg-card border-border"}`} />
          <span className={`text-[10px] text-center mt-1.5 leading-tight ${i <= stageIdx ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
        </div>
      ))}
    </div>
  );
}
