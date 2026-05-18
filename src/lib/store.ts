// Simple in-memory + localStorage prototype store
import { useEffect, useState } from "react";

export type Role = "buyer" | "seller" | null;
export type OrderStatus = "Received" | "Printing" | "Ready for Pick Up" | "Completed";

export interface Printer {
  id: string;
  name: string;
  location: string;
  pricePerPage: number;
  deliveryCharge: number;
  services: string;
  online: boolean;
}

export interface Order {
  id: string;
  fileName: string;
  pages: number;
  copies: number;
  pricePerPage: number;
  printerId: string;
  printerName: string;
  location: string;
  delivery: "Self pick up" | "Delivery";
  payment: "Card" | "UPI" | "Cash";
  placedOn: string;
  status: OrderStatus;
  buyerName: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  from: "buyer" | "seller";
  text: string;
  ts: number;
}

const PRINTERS: Printer[] = [
  { id: "p1", name: "QuickPrint Hub", location: "Block A, Room 204", pricePerPage: 2, deliveryCharge: 10, services: "B&W, Color, Binding", online: true },
  { id: "p2", name: "InkSpot Studio", location: "Library Basement", pricePerPage: 1.5, deliveryCharge: 15, services: "B&W, Color", online: true },
  { id: "p3", name: "Campus Copy", location: "Hostel C Lobby", pricePerPage: 1, deliveryCharge: 0, services: "B&W only", online: false },
  { id: "p4", name: "PrintWave", location: "Cafeteria Wing", pricePerPage: 3, deliveryCharge: 20, services: "Color, Lamination", online: true },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write<T>(key: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(v));
  window.dispatchEvent(new Event("pp:update"));
}

export function getPrinters() { return PRINTERS; }
export function getPrinter(id: string) { return PRINTERS.find(p => p.id === id); }

export function useAuth() {
  const [user, setUser] = useState<{ name: string; email: string; role: Role } | null>(() => read("pp:user", null));
  useEffect(() => {
    const h = () => setUser(read("pp:user", null));
    window.addEventListener("pp:update", h); window.addEventListener("storage", h);
    return () => { window.removeEventListener("pp:update", h); window.removeEventListener("storage", h); };
  }, []);
  return {
    user,
    login: (email: string) => { const u = { name: email.split("@")[0] || "User", email, role: null as Role }; write("pp:user", u); },
    signup: (name: string, email: string) => { write("pp:user", { name, email, role: null as Role }); },
    setRole: (role: Role) => { const u = read<any>("pp:user", null); if (u) write("pp:user", { ...u, role }); },
    logout: () => write("pp:user", null),
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => read("pp:orders", []));
  useEffect(() => {
    const h = () => setOrders(read("pp:orders", []));
    window.addEventListener("pp:update", h); window.addEventListener("storage", h);
    return () => { window.removeEventListener("pp:update", h); window.removeEventListener("storage", h); };
  }, []);
  return {
    orders,
    addOrder: (o: Order) => { const cur = read<Order[]>("pp:orders", []); write("pp:orders", [o, ...cur]); },
    updateOrder: (id: string, patch: Partial<Order>) => {
      const cur = read<Order[]>("pp:orders", []);
      write("pp:orders", cur.map(o => o.id === id ? { ...o, ...patch } : o));
    },
  };
}

export function useChat(orderId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => read(`pp:chat:${orderId}`, []));
  useEffect(() => {
    const h = () => setMessages(read(`pp:chat:${orderId}`, []));
    window.addEventListener("pp:update", h);
    return () => window.removeEventListener("pp:update", h);
  }, [orderId]);
  return {
    messages,
    send: (from: "buyer" | "seller", text: string) => {
      const cur = read<ChatMessage[]>(`pp:chat:${orderId}`, []);
      const next = [...cur, { id: crypto.randomUUID(), orderId, from, text, ts: Date.now() }];
      write(`pp:chat:${orderId}`, next);
    },
  };
}

export function uid() { return Math.random().toString(36).slice(2, 9).toUpperCase(); }
