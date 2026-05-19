import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { PrintPalLogo } from "@/components/PrintPalLogo";
import { PhoneFrame } from "@/components/AppShell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/" }),
  component: Login,
});

function Login() {
  const { user, login } = useAuth();
  const { redirect } = useSearch({ from: "/login" });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: redirect });
  }, [user, redirect, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return;
    login(email);
    navigate({ to: redirect });
  };

  return (
    <PhoneFrame>
      <div className="px-5 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-primary text-sm"><ArrowLeft className="w-4 h-4" />Browse without login</Link>
      </div>
      <div className="px-6 pt-8 pb-6">
        <PrintPalLogo />
        <p className="text-center text-sm text-muted-foreground mt-3 leading-relaxed">
          Sign in to upload, order, and chat
        </p>
      </div>

      <form onSubmit={submit} className="mx-5 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg">
        <h2 className="font-display text-2xl text-center mb-6">Welcome Back</h2>

        <label className="text-sm font-medium">Email</label>
        <div className="relative mt-1.5 mb-4">
          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@email.com"
            className="w-full pl-10 pr-3 py-3 rounded-lg bg-card text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary-foreground/50" />
        </div>

        <label className="text-sm font-medium">Password</label>
        <div className="relative mt-1.5">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={pw} onChange={e => setPw(e.target.value)} type={show ? "text" : "password"} required placeholder="••••••••"
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-card text-foreground outline-none focus:ring-2 focus:ring-primary-foreground/50" />
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-right text-xs mt-2 opacity-90">Forgot Password?</div>

        <button type="submit" className="w-full mt-5 py-3 rounded-lg bg-card text-foreground font-medium flex items-center justify-center gap-2 hover:bg-card/90 transition">
          Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account? <Link to="/signup" search={{ redirect }} className="text-primary font-semibold">Sign Up</Link>
      </p>
    </PhoneFrame>
  );
}
