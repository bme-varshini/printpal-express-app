import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { MapPin, Save, LogOut, Store, ArrowRight, HelpCircle, Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth, useMyShop, useSignedUrl } from "@/lib/store";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const { user, logout } = useAuth();
  const { shop, update, save: persist, setAvailable, uploadQr } = useMyShop();
  const qrUrl = useSignedUrl("qrcodes", shop.qrPath);
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const qrRef = useRef<HTMLInputElement>(null);
  const save = async () => { await persist(); setSaved(true); setTimeout(() => setSaved(false), 1400); };
  const handleQr = async (f: File) => {
    setUploadingQr(true);
    try { await uploadQr(f); } finally { setUploadingQr(false); }
  };

  if (!user) {
    return (
      <PhoneFrame>
        <TopBar />
        <PageBody>
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm mb-4">Sign in to manage your profile</p>
            <Link to="/login" search={{ redirect: "/profile" }} className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">Sign In</Link>
          </div>
        </PageBody>
        <BottomNav />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <h1 className="font-display text-3xl text-primary mb-1">Profile</h1>
        <p className="text-sm text-muted-foreground mb-5">{user.name} · {user.email}</p>

        <div className="bg-primary text-primary-foreground rounded-2xl p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center"><Store className="w-5 h-5" /></div>
              <div>
                <div className="font-medium">Available for Printing Services</div>
                <div className="text-xs opacity-85 mt-0.5">{shop.available ? "You appear in the printers list" : "Turn on to start receiving orders"}</div>
              </div>
            </div>
            <Toggle checked={shop.available} onChange={setAvailable} />
          </div>
        </div>

        {shop.available && (
          <Link to="/seller" className="flex items-center justify-between p-4 mb-4 rounded-xl bg-primary-soft text-primary font-medium">
            Open Seller Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Your Printing Profile</h3>

          <Input label="Shop name" value={shop.name} onChange={(v: string) => update({ name: v })} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Location" value={shop.location} onChange={(v: string) => update({ location: v })} />
            <Input label="Price per page (₹)" type="number" value={String(shop.pricePerPage)} onChange={(v: string) => update({ pricePerPage: Number(v) || 0 })} />
          </div>

          <div>
            <label className="text-sm font-medium">Printing Type</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["B&W", "Color", "Both"] as const).map(t => (
                <button key={t} onClick={() => update({ type: t })}
                  className={`py-2 rounded-lg text-sm border-2 transition ${shop.type === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary-soft rounded-lg px-3 py-2.5 flex items-center justify-between">
            <span className="text-sm font-medium">Offer delivery?</span>
            <Toggle checked={shop.delivery} onChange={v => update({ delivery: v })} />
          </div>

          {shop.delivery && (
            <Input label="Delivery charge (₹)" type="number" value={String(shop.deliveryCharge)} onChange={(v: string) => update({ deliveryCharge: Number(v) || 0 })} />
          )}

          <div className="border-t border-border pt-4 space-y-3">
            <h4 className="font-medium text-sm">UPI Payments</h4>
            <Input label="UPI ID" value={shop.upiId} onChange={(v: string) => update({ upiId: v })} />
            <div>
              <label className="text-sm font-medium">Payment QR code</label>
              <div className="mt-1.5 flex items-start gap-3">
                <div className="w-24 h-24 rounded-lg bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                  {uploadingQr ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    : qrUrl ? <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                    : <span className="text-[10px] text-muted-foreground text-center px-1">No QR uploaded</span>}
                </div>
                <button type="button" onClick={() => qrRef.current?.click()}
                  className="flex-1 bg-primary-soft border-2 border-dashed border-primary/40 rounded-lg py-4 flex flex-col items-center gap-1">
                  <Upload className="w-5 h-5 text-primary" />
                  <span className="text-xs text-primary font-medium">{shop.qrPath ? "Replace QR" : "Upload QR"}</span>
                </button>
                <input ref={qrRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleQr(e.target.files[0])} />
              </div>
            </div>
          </div>

          <button onClick={save}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:opacity-95 transition">
            <Save className="w-4 h-4" />{saved ? "Saved!" : "Save Profile"}
          </button>
        </div>

        <Link to="/buyer/help" className="mt-4 flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <span className="flex items-center gap-3 text-sm font-medium"><HelpCircle className="w-4 h-4 text-primary" />Help & Complaints</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Link>

        <button onClick={async () => { await logout(); navigate({ to: "/" }); }}
          className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-xl text-destructive text-sm font-medium border border-border">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </PageBody>
      <BottomNav />
    </PhoneFrame>
  );
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type}
        className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted outline-none focus:ring-2 focus:ring-primary/40 border border-border" />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-success" : "bg-muted-foreground/40"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
