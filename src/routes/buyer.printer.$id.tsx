import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload, FileText, X, Loader2, MapPin, Star } from "lucide-react";
import { PhoneFrame, TopBar, PageBody } from "@/components/AppShell";
import { usePrinter, useAuth, computePrice, createOrder, PrintOptions, OrderExtras } from "@/lib/store";
import { useRef, useState } from "react";

export const Route = createFileRoute("/buyer/printer/$id")({ component: PrinterPage });

async function countPdfPages(file: File): Promise<number> {
  const buf = await file.arrayBuffer();
  // Try pdfjs first
  try {
    const pdfjs: any = await import("pdfjs-dist");
    if (pdfjs.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = "";
    const doc = await pdfjs.getDocument({ data: buf, disableWorker: true, isEvalSupported: false }).promise;
    if (doc?.numPages) return doc.numPages;
  } catch {}
  // Fallback: scan raw bytes for /Type /Page entries (not /Pages)
  const text = new TextDecoder("latin1").decode(buf);
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  if (matches && matches.length) return matches.length;
  // Last resort: /Count entry from /Pages object
  const count = text.match(/\/Count\s+(\d+)/);
  return count ? parseInt(count[1], 10) : 1;
}

function PrinterPage() {
  const { id } = Route.useParams();
  const printer = usePrinter(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [counting, setCounting] = useState(false);
  const [copies, setCopies] = useState(1);
  const [delivery, setDelivery] = useState<"Self pick up" | "Delivery">("Self pick up");
  const [opts, setOpts] = useState<PrintOptions>({ color: "B&W", sides: "Single", paperSize: "A4" });
  const [extras, setExtras] = useState<OrderExtras>({ orientation: "Portrait", stapling: false, lamination: false, spiralBinding: false, notes: "" });
  const [step, setStep] = useState<"upload" | "summary">("upload");
  const [placing, setPlacing] = useState(false);
  const [placeErr, setPlaceErr] = useState("");

  if (printer === undefined) return <PhoneFrame><TopBar /><div className="p-6 text-sm text-muted-foreground">Loading printer…</div></PhoneFrame>;
  if (!printer) return <PhoneFrame><TopBar /><div className="p-6 text-sm">Printer not found. <Link to="/" className="text-primary">Back to home</Link></div></PhoneFrame>;

  const requireAuth = (next: () => void) => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/buyer/printer/${id}` } });
      return;
    }
    next();
  };

  const openPicker = () => requireAuth(() => fileRef.current?.click());

  const handleFile = async (f: File) => {
    setFile(f);
    setCounting(true);
    try { setPages(await countPdfPages(f)); } catch { setPages(1); }
    setCounting(false);
  };

  const price = pages
    ? computePrice({ pages, copies, pricePerPage: printer.pricePerPage, options: opts, delivery, deliveryCharge: printer.deliveryCharge })
    : { subtotal: 0, delivery: 0, total: 0 };

  const place = () => requireAuth(async () => {
    if (!file || !pages || placing) return;
    setPlacing(true); setPlaceErr("");
    try {
      const order = await createOrder({
        file, printer, pages, copies, options: opts, extras,
        delivery, payment: "UPI", total: price.total,
      });
      navigate({ to: "/buyer/payment/$id", params: { id: order.id } });
    } catch (e: any) {
      setPlaceErr(e?.message || "Failed to place order");
      setPlacing(false);
    }
  });

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <Link to="/" className="inline-flex items-center gap-1 text-primary text-sm mb-4"><ArrowLeft className="w-4 h-4" />Back</Link>

        <div className="rounded-2xl bg-primary text-primary-foreground p-5 mb-5">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl">{printer.name}</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${printer.online ? "bg-primary-foreground/25" : "bg-destructive/40"}`}>
              {printer.online ? "Open now" : "Closed"}
            </span>
          </div>
          <div className="flex gap-3 text-xs opacity-90 mt-2">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{printer.location}</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />{printer.rating.toFixed(1)}</span>
            <span>· ₹{printer.pricePerPage}/page</span>
          </div>
          <div className="text-xs opacity-85 mt-2">{printer.services}</div>
        </div>

        <h3 className="text-primary font-medium mb-2">Upload PDF</h3>

        {!file ? (
          <button onClick={openPicker}
            className="w-full bg-primary-soft border-2 border-dashed border-primary/40 rounded-xl py-12 flex flex-col items-center justify-center gap-2 hover:bg-primary-soft/80 transition">
            <Upload className="w-8 h-8 text-primary" />
            <span className="text-primary font-medium">Tap to Upload PDF</span>
            <span className="text-xs text-muted-foreground">{user ? "Pages will be counted automatically" : "You'll be asked to sign in"}</span>
          </button>
        ) : (
          <div className="bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-6 h-6 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs opacity-80">File</div>
                <div className="font-medium text-sm truncate">{file.name}</div>
                <div className="text-xs opacity-80 mt-0.5">
                  {counting ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />counting pages…</span> : `${pages} page${pages > 1 ? "s" : ""}`}
                </div>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPages(0); setStep("upload"); }}><X className="w-5 h-5" /></button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {file && !counting && (
          <div className="mt-5 space-y-4">
            <OptionGroup label="Color">
              {(["B&W", "Color"] as const).map(v => (
                <Pill key={v} active={opts.color === v} onClick={() => setOpts({ ...opts, color: v })}>{v}</Pill>
              ))}
            </OptionGroup>

            <OptionGroup label="Sides">
              {(["Single", "Double"] as const).map(v => (
                <Pill key={v} active={opts.sides === v} onClick={() => setOpts({ ...opts, sides: v })}>{v}-sided</Pill>
              ))}
            </OptionGroup>

            <OptionGroup label="Paper">
              {(["A4", "A3", "Letter"] as const).map(v => (
                <Pill key={v} active={opts.paperSize === v} onClick={() => setOpts({ ...opts, paperSize: v })}>{v}</Pill>
              ))}
            </OptionGroup>

            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="font-medium text-sm">Number of copies</span>
              <div className="flex items-center bg-muted rounded-lg overflow-hidden">
                <button onClick={() => setCopies(Math.max(1, copies - 1))} className="px-3 py-1.5">−</button>
                <span className="px-3 font-semibold">{copies}</span>
                <button onClick={() => setCopies(copies + 1)} className="px-3 py-1.5">+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Pill active={delivery === "Self pick up"} onClick={() => setDelivery("Self pick up")}>Self pick up</Pill>
              <Pill active={delivery === "Delivery"} onClick={() => setDelivery("Delivery")}>Delivery</Pill>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h3 className="font-display text-lg">Order Instructions</h3>

              <OptionGroup label="Orientation">
                {(["Portrait", "Landscape"] as const).map(v => (
                  <Pill key={v} active={extras.orientation === v} onClick={() => setExtras({ ...extras, orientation: v })}>{v}</Pill>
                ))}
              </OptionGroup>

              <div className="grid grid-cols-3 gap-2">
                <Pill active={extras.stapling} onClick={() => setExtras({ ...extras, stapling: !extras.stapling })}>Stapling</Pill>
                <Pill active={extras.lamination} onClick={() => setExtras({ ...extras, lamination: !extras.lamination })}>Lamination</Pill>
                <Pill active={extras.spiralBinding} onClick={() => setExtras({ ...extras, spiralBinding: !extras.spiralBinding })}>Spiral</Pill>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1.5">Notes for seller</div>
                <textarea
                  value={extras.notes}
                  onChange={e => setExtras({ ...extras, notes: e.target.value })}
                  rows={3}
                  placeholder="E.g. print first 10 pages in color, staple top-left…"
                  className="w-full px-3 py-2.5 rounded-lg bg-muted outline-none focus:ring-2 focus:ring-primary/40 border border-border text-sm"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-primary-soft p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Estimated total</div>
                <div className="font-display text-2xl text-primary">₹{price.total}</div>
                <div className="text-[11px] text-muted-foreground">{pages} pg × {copies} · {opts.color} · {opts.sides}-sided · {opts.paperSize}{delivery === "Delivery" ? ` · +₹${price.delivery} delivery` : ""}</div>
              </div>
            </div>

            {step === "upload" ? (
              <button onClick={() => setStep("summary")} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition">
                Review Order
              </button>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-display text-xl mb-4">Order Summary</h3>
                <Row label="File" value={file.name} />
                <Row label="Pages" value={String(pages)} />
                <Row label="Copies" value={String(copies)} />
                <Row label="Color" value={opts.color} />
                <Row label="Sides" value={`${opts.sides}-sided`} />
                <Row label="Paper" value={opts.paperSize} />
                <Row label="Orientation" value={extras.orientation} />
                {(extras.stapling || extras.lamination || extras.spiralBinding) && (
                  <Row label="Finishing" value={[extras.stapling && "Stapling", extras.lamination && "Lamination", extras.spiralBinding && "Spiral"].filter(Boolean).join(", ")} />
                )}
                {extras.notes && <Row label="Notes" value={extras.notes} />}
                <Row label="Subtotal" value={`₹${price.subtotal}`} />
                {delivery === "Delivery" && <Row label="Delivery" value={`₹${price.delivery}`} />}
                <div className="border-t border-border mt-3 pt-3 flex justify-between font-display text-2xl">
                  <span>Total</span><span>₹{price.total}</span>
                </div>
                {placeErr && <p className="mt-3 text-xs bg-destructive/15 text-destructive rounded p-2">{placeErr}</p>}
                <button onClick={place} disabled={placing} className="w-full mt-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-95 transition disabled:opacity-60">
                  {placing ? "Uploading…" : user ? "Continue to Payment" : "Sign in & Continue"}
                </button>
              </div>
            )}
          </div>
        )}
      </PageBody>
    </PhoneFrame>
  );
}

function Pill({ children, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>
      {children}
    </button>
  );
}
function OptionGroup({ label, children }: any) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm py-1.5"><span className="text-muted-foreground">{label}</span><span className="font-medium text-right max-w-[55%] truncate">{value}</span></div>;
}
