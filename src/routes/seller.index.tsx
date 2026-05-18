import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { useOrders } from "@/lib/store";
import { FileText, ArrowRight, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/seller/")({ component: SellerDash });

const NEXT: Record<string, string> = { Received: "Printing", Printing: "Ready for Pick Up", "Ready for Pick Up": "Completed" };

function SellerDash() {
  const { orders, updateOrder } = useOrders();
  const active = orders.filter(o => o.status !== "Completed");

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <h2 className="font-display text-3xl text-primary mb-1">Seller Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-5">{active.length} active order{active.length === 1 ? "" : "s"}</p>

        {active.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No incoming orders.</div>
        ) : (
          <div className="space-y-4">
            {active.map(o => (
              <div key={o.id} className="rounded-2xl border border-border overflow-hidden bg-card">
                <div className="bg-primary-soft px-4 py-2.5 flex items-center justify-between">
                  <h3 className="font-medium text-primary flex items-center gap-2"><FileText className="w-4 h-4" />Incoming Order</h3>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-md font-semibold">₹{(o.pages * o.copies * o.pricePerPage).toFixed(0)}</span>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium">{o.fileName}</span>
                    <span className="text-muted-foreground text-xs">· {o.pages} pages × {o.copies}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">From {o.buyerName} · {o.delivery}</p>

                  <div className="mt-4 space-y-2">
                    {(["Received", "Printing", "Ready for Pick Up"] as const).map(s => {
                      const reached = ["Received", "Printing", "Ready for Pick Up"].indexOf(o.status) >= ["Received", "Printing", "Ready for Pick Up"].indexOf(s);
                      return (
                        <div key={s} className="flex items-center gap-2 text-sm">
                          <div className={`w-4 h-4 rounded-full border-2 ${reached ? "bg-primary border-primary" : "border-border"}`} />
                          <span className={reached ? "" : "text-muted-foreground"}>{s}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Link to="/buyer/chat/$id" params={{ id: o.id }} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary-soft text-primary text-xs font-medium">
                      <MessageCircle className="w-3.5 h-3.5" />Chat
                    </Link>
                    <button onClick={() => updateOrder(o.id, { status: NEXT[o.status] as any })}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-95">
                      Advance <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>
      <BottomNav variant="seller" />
    </PhoneFrame>
  );
}
