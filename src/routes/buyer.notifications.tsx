import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { useOrders } from "@/lib/store";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/buyer/notifications")({ component: Notifs });

function Notifs() {
  const { orders } = useOrders();
  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <h1 className="font-display text-3xl mb-5">Notifications</h1>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="flex gap-3 p-4 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center"><Bell className="w-4 h-4" /></div>
                <div className="flex-1">
                  <p className="text-sm"><span className="font-medium">{o.fileName}</span> is now <span className="text-primary font-semibold">{o.status}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(o.placedOn).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}
