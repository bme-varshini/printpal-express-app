import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Printer, User, Home, Bell, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/lib/store";
import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft/40 via-background to-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-background relative shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]">
        {children}
      </div>
    </div>
  );
}

export function TopBar({ showProfile = true }: { showProfile?: boolean }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  return (
    <header className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between sticky top-0 z-20">
      <Link to="/buyer" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-primary-foreground/95 flex items-center justify-center">
          <Printer className="w-5 h-5 text-primary" strokeWidth={2.2} />
        </div>
        <span className="font-display text-2xl font-semibold tracking-tight">PrintPal</span>
      </Link>
      {showProfile && (
        <button
          onClick={() => { if (user) logout(); navigate({ to: "/" }); }}
          className="w-9 h-9 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 transition flex items-center justify-center"
          aria-label="Account"
        >
          <User className="w-5 h-5" />
        </button>
      )}
    </header>
  );
}

export function BottomNav({ variant = "buyer" }: { variant?: "buyer" | "seller" }) {
  const loc = useLocation();
  const items = variant === "buyer"
    ? [
        { to: "/buyer/orders", label: "Orders", icon: LayoutDashboard },
        { to: "/buyer", label: "Home", icon: Home },
        { to: "/buyer/notifications", label: "Alerts", icon: Bell },
      ]
    : [
        { to: "/seller", label: "Dashboard", icon: LayoutDashboard },
        { to: "/seller/profile", label: "Profile", icon: Home },
        { to: "/seller/notifications", label: "Alerts", icon: Bell },
      ];
  return (
    <nav className="sticky bottom-0 z-20 bg-card/95 backdrop-blur border-t border-border px-6 py-3 flex justify-between">
      {items.map(({ to, label, icon: Icon }) => {
        const active = loc.pathname === to;
        return (
          <Link key={to} to={to} className={`flex flex-col items-center gap-1 transition ${active ? "text-primary" : "text-muted-foreground"}`}>
            <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
            <span className={`text-[11px] ${active ? "font-semibold" : ""}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function PageBody({ children, pad = true }: { children: ReactNode; pad?: boolean }) {
  return <div className={`flex-1 ${pad ? "px-5 py-6" : ""} pb-24`}>{children}</div>;
}
