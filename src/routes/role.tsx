import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Store, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/AppShell";
import { PrintPalLogo } from "@/components/PrintPalLogo";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/role")({ component: RolePicker });

function RolePicker() {
  const { setRole } = useAuth();
  const navigate = useNavigate();
  const pick = (r: "buyer" | "seller") => { setRole(r); navigate({ to: r === "buyer" ? "/buyer" : "/seller" }); };

  return (
    <PhoneFrame>
      <div className="px-6 pt-16">
        <PrintPalLogo />
        <h1 className="font-display text-3xl text-center mt-10 mb-2">How will you use PrintPal?</h1>
        <p className="text-center text-sm text-muted-foreground mb-8">You can switch later from your profile.</p>

        <div className="space-y-4">
          <RoleCard onClick={() => pick("buyer")} title="I need to print" desc="Find printers near you, upload PDFs and track orders." Icon={ShoppingCart} />
          <RoleCard onClick={() => pick("seller")} title="I offer printing" desc="Manage incoming orders, set prices, and earn from your printer." Icon={Store} />
        </div>
      </div>
    </PhoneFrame>
  );
}

function RoleCard({ onClick, title, desc, Icon }: any) {
  return (
    <button onClick={onClick} className="w-full text-left p-5 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-md transition group flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
        <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
    </button>
  );
}
