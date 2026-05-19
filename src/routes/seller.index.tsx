import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { useOrders, useMyShop, useAuth } from "@/lib/store";
import { FileText, ArrowRight, MessageCircle, Check, X, IndianRupee, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/seller/")({ component: SellerDash });

const NEXT: Record<string, string> = {
  Received: "Printing",
  Printing: "Ready for Pick Up",
  "Ready for Pick Up": "Completed",
};

function SellerDash() {
  const { user } = useAuth();
  const { shop, setAvailable } = useMyShop();
  const { orders, updateOrder } = useOrders();

  if (!user) {
    return (
      <PhoneFrame>
        <TopBar />
        <PageBody>
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm mb-4">Sign in to access your seller dashboard</p>
            <Link to="/login" search={{ redirect: "/seller" }} className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">Sign In</Link>
          </div>
        </PageBody>
        <BottomNav />
      </PhoneFrame>
    );
  }

  const pending = orders.filter(o => o.status === "Pending");
  const active = orders.filter(o => ["Received", "Printing", "Ready for Pick Up"].includes(o.status));
  const completed = orders.filter(o => o.status === "Completed");
  const earnings = completed.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-3xl text-primary leading-tight">Seller Dashboard</h2>
            <p className="text-sm text-muted-foreground">{shop.name}</p>
          </div>
          <button onClick={() => setAvailable(!shop.available)} className={`text-xs px-3 py-1.5 rounded-full font-medium ${shop.available ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            {shop.available ? "Online" : "Offline"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat icon={<ClipboardList className="w-4 h-4" />} label="Pending" value={pending.length} />
          <Stat icon={<FileText className="w-4 h-4" />} label="Active" value={active.length} />
          <Stat icon={<IndianRupee className="w-4 h-4" />} label="Earnings" value={`₹${earnings}`} />
        </div>

        {pending.length > 0 && (
          <>
            <SectionTitle>New Requests</SectionTitle>
            <div className="space-y-3 mb-5">
              {pending.map(o => (
                <div key={o.id} className="rounded-2xl border border-border overflow-hidden bg-card">
                  <div className="bg-primary-soft px-4 py-2.5 flex items-center justify-between">
                    <h3 className="font-medium text-primary flex items-center gap-2 text-sm"><FileText className="w-4 h-4" />New Order #{o.id}</h3>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-md font-semibold">₹{o.total}</span>
                  </div>
                  <div className="px-4 py-3">
                    <div className="text-sm font-medium truncate">{o.fileName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {o.pages} pg × {o.copies} · {o.options.color} · {o.options.sides}-sided · {o.options.paperSize}
                    </div>
                    <div className="text-xs text-muted-foreground">From {o.buyerName} · {o.delivery}</div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button onClick={() => updateOrder(o.id, { status: "Rejected" })} className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-destructive text-xs font-medium">
                        <X className="w-3.5 h-3.5" />Reject
                      </button>
                      <button onClick={() => updateOrder(o.id, { status: "Received" })} className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                        <Check className="w-3.5 h-3.5" />Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <SectionTitle>Active Orders</SectionTitle>
        {active.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm rounded-xl bg-muted/50">No active orders right now.</div>
        ) : (
          <div className="space-y-3">
            {active.map(o => (
              <div key={o.id} className="rounded-2xl border border-border overflow-hidden bg-card">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">{o.fileName}</div>
                    <span className="text-xs bg-primary-soft text-primary px-2 py-0.5 rounded-md font-semibold">₹{o.total}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.buyerName} · {o.delivery}</p>

                  <div className="mt-3 space-y-1.5">
                    {(["Received", "Printing", "Ready for Pick Up"] as const).map(s => {
                      const stages = ["Received", "Printing", "Ready for Pick Up"] as const;
                      const reached = stages.indexOf(o.status as any) >= stages.indexOf(s);
                      return (
                        <div key={s} className="flex items-center gap-2 text-xs">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${reached ? "bg-primary border-primary" : "border-border"}`} />
                          <span className={reached ? "" : "text-muted-foreground"}>{s}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
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

        {completed.length > 0 && (
          <>
            <SectionTitle>Completed</SectionTitle>
            <div className="space-y-2">
              {completed.slice(0, 5).map(o => (
                <div key={o.id} className="px-4 py-3 rounded-xl bg-muted/50 flex justify-between text-sm">
                  <span className="truncate">{o.fileName}</span>
                  <span className="text-muted-foreground">₹{o.total}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}

function Stat({ icon, label, value }: any) {
  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <div className="text-primary">{icon}</div>
      <div className="font-display text-lg leading-tight mt-1">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
function SectionTitle({ children }: any) {
  return <h3 className="font-display text-lg mt-2 mb-3">{children}</h3>;
}
