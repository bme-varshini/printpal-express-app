import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame, TopBar, BottomNav, PageBody } from "@/components/AppShell";
import { MapPin, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/seller/profile")({ component: SellerProfile });

function SellerProfile() {
  const [online, setOnline] = useState(true);
  const [loc, setLoc] = useState("Block A, Room 204");
  const [price, setPrice] = useState("2");
  const [type, setType] = useState<"B&W" | "Color" | "Both">("Both");
  const [delivery, setDelivery] = useState(true);
  const [charge, setCharge] = useState("10");
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 1500); };

  return (
    <PhoneFrame>
      <TopBar />
      <PageBody>
        <h1 className="font-display text-3xl text-primary mb-5">Profile</h1>

        <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3.5 flex items-center justify-between mb-4">
          <span className="font-medium">Availability</span>
          <div className="flex items-center gap-2">
            <Toggle checked={online} onChange={setOnline} />
            <span className="text-xs bg-card text-foreground px-2 py-0.5 rounded">{online ? "Online" : "Offline"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Your Printing Profile</h3>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Classroom/Location" value={loc} onChange={setLoc} />
            <Input label="Price per Page (₹)" value={price} onChange={setPrice} type="number" />
          </div>

          <div>
            <label className="text-sm font-medium">Printing Type</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["B&W", "Color", "Both"] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`py-2 rounded-lg text-sm border-2 transition ${type === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary-soft rounded-lg px-3 py-2.5 flex items-center justify-between">
            <span className="text-sm font-medium">Do you offer delivery?</span>
            <Toggle checked={delivery} onChange={setDelivery} />
          </div>

          {delivery && <Input label="Delivery charge (₹)" value={charge} onChange={setCharge} type="number" />}

          <button onClick={save}
            className="w-full bg-primary-soft text-primary py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-primary-soft/80 transition">
            <Save className="w-4 h-4" />{saved ? "Saved!" : "Save Profile"}
          </button>
        </div>
      </PageBody>
      <BottomNav variant="seller" />
    </PhoneFrame>
  );
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type}
        className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-primary-soft outline-none focus:ring-2 focus:ring-primary/40" />
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
