import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { useChat, useOrders } from "@/lib/store";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/buyer/chat/$id")({ component: Chat });

function Chat() {
  const { id } = Route.useParams();
  const { orders } = useOrders();
  const order = orders.find(o => o.id === id);
  const { messages, send } = useChat(id);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const isSeller = order?.sellerId && order?.buyerId
      ? (await import("@/integrations/supabase/client")).supabase.auth.getUser().then(({ data }) => data.user?.id === order.sellerId)
      : Promise.resolve(false);
    const from: "buyer" | "seller" = (await isSeller) ? "seller" : "buyer";
    send(from, text.trim());
    setText("");
  };

  return (
    <PhoneFrame>
      <TopBar />
      <div className="px-5 py-3 border-b border-border flex items-center gap-3">
        <Link to="/buyer/order/$id" params={{ id }} className="text-primary"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <div className="font-medium">{order?.printerName || "Seller"}</div>
          <div className="text-xs text-muted-foreground">Order #{id}</div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto" style={{ minHeight: "60vh" }}>
        {messages.length === 0 && <div className="text-center text-xs text-muted-foreground mt-10">Start the conversation — no phone numbers needed.</div>}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.from === "buyer" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${m.from === "buyer" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
              {m.text}
              <div className={`text-[10px] mt-1 ${m.from === "buyer" ? "opacity-70" : "text-muted-foreground"}`}>{new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="px-4 py-3 border-t border-border flex items-center gap-2 bg-card sticky bottom-[68px] z-10">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 rounded-full bg-muted text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        <button type="submit" className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-95 transition">
          <Send className="w-4 h-4" />
        </button>
      </form>
      <BottomNav />
    </PhoneFrame>
  );
}
