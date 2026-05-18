import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { PrintPalLogo } from "@/components/PrintPalLogo";
import { PhoneFrame } from "@/components/AppShell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return setErr("Passwords don't match");
    if (pw.length < 6) return setErr("Password must be 6+ characters");
    signup(name, email);
    navigate({ to: "/role" });
  };

  return (
    <PhoneFrame>
      <div className="px-6 pt-12 pb-6">
        <PrintPalLogo />
        <p className="text-center text-sm text-foreground mt-3">Create Your Account</p>
      </div>

      <form onSubmit={submit} className="mx-5 bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg space-y-4">
        <Field label="Full Name" icon={<User className="w-4 h-4" />} value={name} onChange={setName} placeholder="Your name" />
        <Field label="Email" icon={<Mail className="w-4 h-4" />} type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
        <Field label="Password" icon={<Lock className="w-4 h-4" />} type={show ? "text" : "password"} value={pw} onChange={setPw}
          trailing={<button type="button" onClick={() => setShow(s => !s)}>{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
        <Field label="Confirm Password" icon={<Lock className="w-4 h-4" />} type={show ? "text" : "password"} value={pw2} onChange={setPw2} />
        {err && <p className="text-xs bg-destructive/20 rounded p-2">{err}</p>}
        <button type="submit" className="w-full mt-2 py-3 rounded-lg bg-card text-foreground font-medium flex items-center justify-center gap-2 hover:bg-card/90 transition">
          Create Account <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account? <Link to="/" className="text-primary font-semibold">Sign In</Link>
      </p>
    </PhoneFrame>
  );
}

function Field({ label, icon, value, onChange, type = "text", placeholder, trailing }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative mt-1.5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input value={value} onChange={e => onChange(e.target.value)} type={type} required placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-lg bg-card text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary-foreground/50" />
        {trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{trailing}</span>}
      </div>
    </div>
  );
}
