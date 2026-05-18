import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { ArrowLeft, MessageSquare, FileWarning, RefreshCcw, CreditCard, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/buyer/help")({
  validateSearch: (s: Record<string, unknown>) => ({ orderId: (s.orderId as string) || "" }),
  component: Help,
});

const CATEGORIES = [
  { icon: FileWarning, label: "Print quality issue" },
  { icon: RefreshCcw, label: "Request a refund" },
  { icon: CreditCard, label: "Payment problem" },
  { icon: MessageSquare, label: "Something else" },
];

function Help() {
  const { orderId } = Route.useSearch();
  const [picked, setPicked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <Link to="/buyer/orders" className="inline-flex items-center gap-1 text-primary text-sm mb-4"><ArrowLeft className="w-4 h-4" />Back</Link>
        <h1 className="font-display text-3xl mb-1">Need help?</h1>
        <p className="text-sm text-muted-foreground mb-6">{orderId ? `Regarding order #${orderId}` : "Tell us what went wrong."}</p>

        {sent ? (
          <div className="text-center py-10">
            <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-3" />
            <h3 className="font-display text-2xl">We're on it</h3>
            <p className="text-sm text-muted-foreground mt-1">A support agent will reply within 24h.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2.5 mb-5">
              {CATEGORIES.map(({ icon: Icon, label }) => (
                <button key={label} onClick={() => setPicked(label)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition text-left ${picked === label ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="flex-1 text-sm font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Describe the issue…" rows={5}
              className="w-full p-4 rounded-xl bg-card border border-border outline-none focus:border-primary text-sm" />

            <button disabled={!picked || !msg.trim()} onClick={() => setSent(true)}
              className="w-full mt-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 hover:opacity-95 transition">
              Submit Complaint
            </button>
          </>
        )}
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}
