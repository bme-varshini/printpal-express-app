import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PhoneFrame, TopBar, PageBody, BottomNav } from "@/components/AppShell";
import { useOrders } from "@/lib/store";
import { CreditCard, Smartphone, Banknote, Check, ArrowLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/buyer/payment/$id")({ component: Payment });

function Payment() {
  const { id } = Route.useParams();
  const { orders, updateOrder } = useOrders();
  const navigate = useNavigate();
  const order = orders.find(o => o.id === id);
  const [method, setMethod] = useState<"Card" | "UPI" | "Cash">("UPI");
  const [done, setDone] = useState(false);

  if (!order) return <PhoneFrame><div className="p-6">Order not found.</div></PhoneFrame>;

  const total = order.pages * order.copies * order.pricePerPage;

  const pay = () => {
    updateOrder(order.id, { payment: method });
    setDone(true);
    setTimeout(() => navigate({ to: "/buyer/order/$id", params: { id: order.id } }), 1400);
  };

  if (done) {
    return (
      <PhoneFrame>
        <TopBar />
        <PageBody>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-5">
              <Check className="w-10 h-10 text-success" strokeWidth={3} />
            </div>
            <h2 className="font-display text-3xl">Payment Successful</h2>
            <p className="text-muted-foreground text-sm mt-2">Redirecting to your order…</p>
          </div>
        </PageBody>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <Link to="/buyer/printer/$id" params={{ id: order.printerId }} className="inline-flex items-center gap-1 text-primary text-sm mb-4"><ArrowLeft className="w-4 h-4" />Back</Link>
        <h1 className="font-display text-3xl mb-1">Payment</h1>
        <p className="text-sm text-muted-foreground mb-6">Choose how you'd like to pay</p>

        <div className="bg-primary text-primary-foreground rounded-2xl p-5 mb-6">
          <div className="text-xs opacity-80">Amount due</div>
          <div className="font-display text-4xl mt-1">₹{total.toFixed(0)}</div>
          <div className="text-xs opacity-80 mt-2">{order.fileName} · {order.pages} pages × {order.copies}</div>
        </div>

        <div className="space-y-3 mb-6">
          <PayOption icon={<Smartphone />} label="UPI" sub="Pay via GPay, PhonePe, Paytm" active={method === "UPI"} onClick={() => setMethod("UPI")} />
          <PayOption icon={<CreditCard />} label="Card" sub="Credit / debit card" active={method === "Card"} onClick={() => setMethod("Card")} />
          <PayOption icon={<Banknote />} label="Cash" sub="Pay on pickup" active={method === "Cash"} onClick={() => setMethod("Cash")} />
        </div>

        <button onClick={pay} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition">
          Pay ₹{total.toFixed(0)}
        </button>
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}

function PayOption({ icon, label, sub, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition text-left ${active ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}>{icon}</div>
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 ${active ? "border-primary bg-primary" : "border-border"}`}>
        {active && <Check className="w-3 h-3 text-primary-foreground m-auto" />}
      </div>
    </button>
  );
}
