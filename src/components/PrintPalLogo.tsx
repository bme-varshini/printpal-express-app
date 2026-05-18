import { Printer } from "lucide-react";

export function PrintPalLogo({ size = "lg" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`${big ? "w-12 h-12" : "w-9 h-9"} rounded-xl border-2 border-primary flex items-center justify-center bg-card`}>
        <Printer className={`${big ? "w-6 h-6" : "w-5 h-5"} text-primary`} strokeWidth={2.2} />
      </div>
      <span className={`font-display font-semibold text-primary ${big ? "text-4xl" : "text-2xl"}`}>PrintPal</span>
    </div>
  );
}
