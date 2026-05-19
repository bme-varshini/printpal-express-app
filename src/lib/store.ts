// Prototype store: localStorage-backed shared state
import { useEffect, useState } from "react";

export type OrderStatus =
  | "Pending"
  | "Received"
  | "Printing"
  | "Ready for Pick Up"
  | "Completed"
  | "Rejected";

export interface Printer {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  pricePerPage: number;
  deliveryCharge: number;
  services: string;
  online: boolean;
  category?: string;
}

export interface PrintOptions {
  color: "B&W" | "Color";
  sides: "Single" | "Double";
  paperSize: "A4" | "A3" | "Letter";
}

export interface Order {
  id: string;
  fileName: string;
  pages: number;
  copies: number;
  pricePerPage: number;
  options: PrintOptions;
  printerId: string;
  printerName: string;
  location: string;
  delivery: "Self pick up" | "Delivery";
  payment: "Card" | "UPI" | "Cash";
  placedOn: string;
  status: OrderStatus;
  buyerName: string;
  buyerEmail?: string;
  total: number;
  history: { status: OrderStatus; ts: number }[];
}

export interface ChatMessage {
  id: string;
  orderId: string;
  from: "buyer" | "seller";
  text: string;
  ts: number;
}

export interface MyShop {
  available: boolean;
  name: string;
  location: string;
  distance: string;
  pricePerPage: number;
  deliveryCharge: number;
  services: string;
  type: "B&W" | "Color" | "Both";
  delivery: boolean;
}

const DEFAULT_SHOP: MyShop = {
  available: false,
  name: "My Print Shop",
  location: "Block A, Room 204",
  distance: "0.2 km",
  pricePerPage: 2,
  deliveryCharge: 10,
  services: "B&W, Color",
  type: "Both",
  delivery: true,
};

const PRINTERS: Printer[] = [
  { id: "p1", name: "QuickPrint Hub", location: "Block A, Room 204", distance: "0.3 km", rating: 4.8, pricePerPage: 2, deliveryCharge: 10, services: "B&W, Color, Binding", online: true, category: "Documents" },
  { id: "p2", name: "InkSpot Studio", location: "Library Basement", distance: "0.5 km", rating: 4.6, pricePerPage: 1.5, deliveryCharge: 15, services: "B&W, Color", online: true, category: "Documents" },
  { id: "p3", name: "Campus Copy", location: "Hostel C Lobby", distance: "0.8 km", rating: 4.2, pricePerPage: 1, deliveryCharge: 0, services: "B&W only", online: false, category: "Documents" },
  { id: "p4", name: "PrintWave", location: "Cafeteria Wing", distance: "1.1 km", rating: 4.9, pricePerPage: 3, deliveryCharge: 20, services: "Color, Lamination", online: true, category: "Photos" },
  { id: "p5", name: "BindIt Pro", location: "Tech Park Gate 2", distance: "1.4 km", rating: 4.5, pricePerPage: 2.5, deliveryCharge: 25, services: "Binding, Posters", online: true, category: "Binding" },
];

export const CATEGORIES = ["All", "Documents", "Photos", "Binding", "Posters"];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write<T>(key: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(v));
  window.dispatchEvent(new Event("pp:update"));
}

function useStore<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [s, set] = useState<T>(fallback);
  useEffect(() => {
    set(read(key, fallback));
    const h = () => set(read(key, fallback));
    window.addEventListener("pp:update", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("pp:update", h); window.removeEventListener("storage", h); };
  }, [key]);
  return [s, (v: T) => write(key, v)];
}

export function useMyShop() {
  const [shop, setShop] = useStore<MyShop>("pp:myshop", DEFAULT_SHOP);
  return {
    shop,
    update: (patch: Partial<MyShop>) => setShop({ ...shop, ...patch }),
    setAvailable: (v: boolean) => setShop({ ...shop, available: v }),
  };
}

export function usePrinters() {
  const [shop, setShop] = useState<MyShop>(DEFAULT_SHOP);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const h = () => { setShop(read("pp:myshop", DEFAULT_SHOP)); setUser(read("pp:user", null)); };
    h();
    window.addEventListener("pp:update", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("pp:update", h); window.removeEventListener("storage", h); };
  }, []);
  const list: Printer[] = [...PRINTERS];
  if (shop.available && user) {
    list.unshift({
      id: "me",
      name: shop.name || user?.name || "My Shop",
      location: shop.location,
      distance: shop.distance,
      rating: 5.0,
      pricePerPage: shop.pricePerPage,
      deliveryCharge: shop.deliveryCharge,
      services: shop.services,
      online: true,
      category: "Documents",
    });
  }
  return list;
}

export function getPrinter(id: string): Printer | undefined {
  if (id === "me") {
    const shop = read<MyShop>("pp:myshop", DEFAULT_SHOP);
    const user = read<any>("pp:user", null);
    return {
      id: "me",
      name: shop.name || user?.name || "My Shop",
      location: shop.location,
      distance: shop.distance,
      rating: 5.0,
      pricePerPage: shop.pricePerPage,
      deliveryCharge: shop.deliveryCharge,
      services: shop.services,
      online: shop.available,
    };
  }
  return PRINTERS.find(p => p.id === id);
}

export function useAuth() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  useEffect(() => {
    setUser(read("pp:user", null));
    const h = () => setUser(read("pp:user", null));
    window.addEventListener("pp:update", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("pp:update", h); window.removeEventListener("storage", h); };
  }, []);
  return {
    user,
    login: (email: string) => write("pp:user", { name: email.split("@")[0] || "User", email }),
    signup: (name: string, email: string) => write("pp:user", { name, email }),
    logout: () => write("pp:user", null),
  };
}

export function useOrders() {
  const [orders, _set] = useStore<Order[]>("pp:orders", []);
  return {
    orders,
    addOrder: (o: Order) => {
      const cur = read<Order[]>("pp:orders", []);
      write("pp:orders", [o, ...cur]);
    },
    updateOrder: (id: string, patch: Partial<Order>) => {
      const cur = read<Order[]>("pp:orders", []);
      write("pp:orders", cur.map(o => {
        if (o.id !== id) return o;
        const next = { ...o, ...patch };
        if (patch.status && patch.status !== o.status) {
          next.history = [...(o.history || []), { status: patch.status, ts: Date.now() }];
        }
        return next;
      }));
    },
  };
}

export function useChat(orderId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    setMessages(read(`pp:chat:${orderId}`, []));
    const h = () => setMessages(read(`pp:chat:${orderId}`, []));
    window.addEventListener("pp:update", h);
    return () => window.removeEventListener("pp:update", h);
  }, [orderId]);
  return {
    messages,
    send: (from: "buyer" | "seller", text: string) => {
      const cur = read<ChatMessage[]>(`pp:chat:${orderId}`, []);
      write(`pp:chat:${orderId}`, [...cur, { id: crypto.randomUUID(), orderId, from, text, ts: Date.now() }]);
    },
  };
}

export function computePrice(opts: {
  pages: number; copies: number; pricePerPage: number; options: PrintOptions; delivery: "Self pick up" | "Delivery"; deliveryCharge: number;
}) {
  const colorMult = opts.options.color === "Color" ? 2 : 1;
  const sizeMult = opts.options.paperSize === "A3" ? 1.5 : 1;
  const sidesMult = opts.options.sides === "Double" ? 0.9 : 1;
  const sheets = opts.options.sides === "Double" ? Math.ceil(opts.pages / 2) : opts.pages;
  const subtotal = sheets * opts.copies * opts.pricePerPage * colorMult * sizeMult * sidesMult;
  const delivery = opts.delivery === "Delivery" ? opts.deliveryCharge : 0;
  return { subtotal: Math.round(subtotal), delivery, total: Math.round(subtotal) + delivery };
}

export function uid() { return Math.random().toString(36).slice(2, 9).toUpperCase(); }
