import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload, FileText, X, Loader2 } from "lucide-react";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { getPrinter, useOrders, useAuth, uid } from "@/lib/store";
import { useRef, useState } from "react";

export const Route = createFileRoute("/buyer/printer/$id")({ component: PrinterPlace });

async function countPdfPages(file: File): Promise<number> {
  const pdfjs: any = await import("pdfjs-dist");
  // disable worker for simplicity in prototype
  pdfjs.GlobalWorkerOptions.workerSrc = "";
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf, disableWorker: true, isEvalSupported: false }).promise;
  return doc.numPages;
}

function PrinterPlace() {
  const { id } = Route.useParams();
  const printer = getPrinter(id);
  const navigate = useNavigate();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(1);
  const [counting, setCounting] = useState(false);
  const [delivery, setDelivery] = useState<"Self pick up" | "Delivery">("Self pick up");
  const [step, setStep] = useState<"upload" | "summary">("upload");

  if (!printer) return <PhoneFrame><div className="p-6">Printer not found.</div></PhoneFrame>;

  const handleFile = async (f: File) => {
    setFile(f);
    setCounting(true);
    try {
      const n = await countPdfPages(f);
      setPages(n);
    } catch { setPages(1); }
    setCounting(false);
  };

  const subtotal = pages * copies * printer.pricePerPage;
  const total = subtotal + (delivery === "Delivery" ? printer.deliveryCharge : 0);

  const place = () => {
    if (!file || !pages) return;
    const order = {
      id: uid(),
      fileName: file.name,
      pages, copies,
      pricePerPage: printer.pricePerPage,
      printerId: printer.id,
      printerName: printer.name,
      location: printer.location,
      delivery, payment: "Card" as const,
      placedOn: new Date().toISOString(),
      status: "Received" as const,
      buyerName: user?.name || "Guest",
    };
    addOrder(order);
    navigate({ to: "/buyer/payment/$id", params: { id: order.id } });
  };

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <Link to="/buyer" className="inline-flex items-center gap-1 text-primary text-sm mb-4"><ArrowLeft className="w-4 h-4" />Back</Link>
        <h1 className="font-display text-3xl">Place Order</h1>
        <p className="text-sm text-muted-foreground mb-6">with {printer.name} · {printer.location}</p>

        <h3 className="text-primary font-medium mb-2">Upload PDF</h3>

        {!file ? (
          <button onClick={() => fileRef.current?.click()}
            className="w-full bg-primary-soft border-2 border-dashed border-primary/40 rounded-xl py-14 flex flex-col items-center justify-center gap-3 hover:bg-primary-soft/80 transition">
            <Upload className="w-8 h-8 text-primary" />
            <span className="text-primary font-medium">Click to Upload PDF</span>
            <span className="text-xs text-muted-foreground">We'll count the pages automatically</span>
          </button>
        ) : (
          <div className="bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <div className="text-xs opacity-80">File</div>
                <div className="font-medium text-sm truncate max-w-[200px]">{file.name}</div>
                <div className="text-xs opacity-80 mt-0.5">
                  {counting ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />counting pages…</span> : `${pages} page${pages > 1 ? "s" : ""}`}
                </div>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPages(0); }}><X className="w-5 h-5" /></button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {file && !counting && (
          <>
            <div className="mt-5 bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-between">
              <span className="font-medium text-sm">No. of copies required</span>
              <div className="flex items-center bg-card text-foreground rounded-lg overflow-hidden">
                <button onClick={() => setCopies(Math.max(1, copies - 1))} className="px-3 py-1.5">−</button>
                <span className="px-3 font-semibold">{copies}</span>
                <button onClick={() => setCopies(copies + 1)} className="px-3 py-1.5">+</button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <ModeBtn active={delivery === "Self pick up"} onClick={() => setDelivery("Self pick up")}>Self pick up</ModeBtn>
              <ModeBtn active={delivery === "Delivery"} onClick={() => setDelivery("Delivery")}>Delivery</ModeBtn>
            </div>

            {step === "upload" ? (
              <button onClick={() => setStep("summary")} className="w-full mt-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition">
                Place Order
              </button>
            ) : (
              <div className="mt-5 rounded-2xl border border-border bg-card p-5">
                <h3 className="font-display text-xl mb-4">Order Summary</h3>
                <SummaryRow label="File" value={file.name} />
                <SummaryRow label="Pages" value={pages.toString()} />
                <SummaryRow label="Price/Page" value={`₹${printer.pricePerPage}`} />
                <SummaryRow label="No. of copies" value={copies.toString()} />
                <SummaryRow label="Mode of Delivery" value={delivery} />
                {delivery === "Delivery" && <SummaryRow label="Delivery charge" value={`₹${printer.deliveryCharge}`} />}
                <div className="border-t border-border mt-3 pt-3 flex justify-between font-display text-2xl">
                  <span>Total</span><span>₹{total.toFixed(0)}</span>
                </div>
                <button onClick={place} className="w-full mt-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition">
                  Continue to Payment
                </button>
              </div>
            )}
          </>
        )}
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}

function ModeBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} className={`py-2.5 rounded-lg text-sm font-medium border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>{children}</button>;
}
function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm py-1.5"><span className="text-muted-foreground">{label}</span><span className="font-medium text-right max-w-[55%] truncate">{value}</span></div>;
}
