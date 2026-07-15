import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PhoneFrame, TopBar, PageBody, BottomNav } from "@/components/AppShell";
import { useOrders, usePrinter, useSignedUrl, submitPaymentProof } from "@/lib/store";
import { ArrowLeft, Check, Copy, Upload, X, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/buyer/payment/$id")({ component: Payment });

function Payment() {
  const { id } = Route.useParams();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const order = orders.find(o => o.id === id);
  const printer = usePrinter(order?.printerId || "");
  const qrUrl = useSignedUrl("qrcodes", printer?.qrPath);
  const [stage, setStage] = useState<"pay" | "proof" | "done">("pay");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [ref, setRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  if (!order) return <PhoneFrame><TopBar /><div className="p-6">Order not found.</div></PhoneFrame>;

  const total = order.total;
  const upiId = printer?.upiId || "";
  const shopName = printer?.name || order.printerName;

  const copyUpi = async () => {
    if (!upiId) return;
    try { await navigator.clipboard.writeText(upiId); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {}
  };

  const submit = async () => {
    if (submitting) return;
    if (!proofFile && !ref.trim()) { setErr("Upload a screenshot or enter a UPI reference number."); return; }
    setSubmitting(true); setErr("");
    try {
      await submitPaymentProof(order.id, { file: proofFile, ref: ref.trim() });
      setStage("done");
      setTimeout(() => navigate({ to: "/buyer/order/$id", params: { id: order.id } }), 1400);
    } catch (e: any) {
      setErr(e?.message || "Failed to submit"); setSubmitting(false);
    }
  };

  if (stage === "done") {
    return (
      <PhoneFrame>
        <TopBar />
        <PageBody>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-5">
              <Check className="w-10 h-10 text-success" strokeWidth={3} />
            </div>
            <h2 className="font-display text-3xl text-center">Payment Submitted</h2>
            <p className="text-muted-foreground text-sm mt-2 text-center px-6">The seller will verify shortly.</p>
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
        <p className="text-sm text-muted-foreground mb-6">Pay via UPI to complete your order</p>

        <div className="bg-primary text-primary-foreground rounded-2xl p-5 mb-5">
          <div className="text-xs opacity-80">{shopName}</div>
          <div className="font-display text-4xl mt-1">₹{total.toFixed(0)}</div>
          <div className="text-xs opacity-80 mt-2">{order.fileName} · {order.pages} pages × {order.copies}</div>
        </div>

        {stage === "pay" && (
          <>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs text-muted-foreground mb-2">Scan QR to pay</div>
              <div className="w-full aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center mb-4">
                {printer?.qrPath ? (
                  qrUrl ? (
                    <img src={qrUrl} alt="Seller UPI QR" className="w-full h-full object-contain" />
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  )
                ) : (
                  <div className="text-xs text-muted-foreground text-center px-6">Seller hasn't uploaded a QR code yet.</div>
                )}
              </div>

              <div className="text-xs text-muted-foreground mb-1">UPI ID</div>
              <button onClick={copyUpi} disabled={!upiId} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted border border-border text-sm font-medium disabled:opacity-60">
                <span className="truncate">{upiId || "Not set by seller"}</span>
                {upiId && <span className="flex items-center gap-1 text-primary text-xs shrink-0"><Copy className="w-3.5 h-3.5" />{copied ? "Copied" : "Copy"}</span>}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button onClick={() => navigate({ to: "/buyer/orders" })} className="py-3.5 rounded-xl border border-border font-medium">Cancel</button>
              <button onClick={() => setStage("proof")} className="py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition">
                I've Paid
              </button>
            </div>
          </>
        )}

        {stage === "proof" && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-display text-xl">Submit Payment Proof</h3>
            <p className="text-xs text-muted-foreground -mt-2">Upload a screenshot or share your UPI reference number.</p>

            {!proofFile ? (
              <button onClick={() => fileRef.current?.click()}
                className="w-full bg-primary-soft border-2 border-dashed border-primary/40 rounded-xl py-8 flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-primary" />
                <span className="text-sm text-primary font-medium">Upload screenshot</span>
              </button>
            ) : (
              <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                <div className="text-sm truncate">{proofFile.name}</div>
                <button onClick={() => setProofFile(null)}><X className="w-4 h-4" /></button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && setProofFile(e.target.files[0])} />

            <div>
              <label className="text-xs font-medium text-muted-foreground">UPI transaction / reference no.</label>
              <input value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. 402512345678"
                className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted outline-none focus:ring-2 focus:ring-primary/40 border border-border text-sm" />
            </div>

            {err && <p className="text-xs bg-destructive/15 text-destructive rounded p-2">{err}</p>}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStage("pay")} className="py-3 rounded-xl border border-border font-medium">Back</button>
              <button onClick={submit} disabled={submitting} className="py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}
