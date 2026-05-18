import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { useOrders } from "@/lib/store";
import { Tracker } from "./buyer.orders";
import { MapPin, MessageCircle, HelpCircle, Check } from "lucide-react";

export const Route = createFileRoute("/buyer/order/$id")({ component: OrderDetail });

const STAGES = ["Received", "Printing", "Ready for Pick Up"] as const;

function OrderDetail() {
  const { id } = Route.useParams();
  const { orders, updateOrder } = useOrders();
  const order = orders.find(o => o.id === id);
  if (!order) return <PhoneFrame><div className="p-6">Order not found.</div></PhoneFrame>;

  const stageIdx = STAGES.indexOf(order.status as any);
  const total = order.pages * order.copies * order.pricePerPage;

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <h2 className="font-display text-2xl text-primary mb-4">Order Details</h2>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium">{order.fileName}</h3>
            <span className="text-xs bg-primary-soft text-primary px-2 py-1 rounded-md font-semibold">₹{total.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
            <MapPin className="w-3.5 h-3.5" />{order.location}
          </div>

          <Tracker stageIdx={stageIdx >= 0 ? stageIdx : 0} />

          <div className="mt-5 space-y-2 text-sm">
            <Row label="Pages" value={order.pages.toString()} />
            <Row label="No. of copies" value={order.copies.toString()} />
            <Row label="Price/Page" value={`₹${order.pricePerPage}`} />
            <div className="border-t border-border my-2" />
            <Row label="Order ID" value={`#${order.id}`} />
            <Row label="Placed on" value={new Date(order.placedOn).toLocaleString()} />
            <Row label="Mode of Payment" value={order.payment} />
            <Row label="Mode of Delivery" value={order.delivery} />
          </div>

          {order.status !== "Completed" && (
            <button
              onClick={() => updateOrder(order.id, { status: "Completed" })}
              className="w-full mt-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-95 transition"
            >
              <Check className="w-4 h-4" />Mark as Picked Up
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link to="/buyer/chat/$id" params={{ id: order.id }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-soft text-primary font-medium text-sm hover:bg-primary-soft/80 transition">
            <MessageCircle className="w-4 h-4" />Chat Seller
          </Link>
          <Link to="/buyer/help" search={{ orderId: order.id }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-soft text-primary font-medium text-sm hover:bg-primary-soft/80 transition">
            <HelpCircle className="w-4 h-4" />Need Help?
          </Link>
        </div>
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
