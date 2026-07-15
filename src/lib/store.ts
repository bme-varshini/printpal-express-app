// Supabase-backed store for PrintPal
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OrderStatus =
  | "Pending"
  | "Received"
  | "Printing"
  | "Ready for Pick Up"
  | "Completed"
  | "Rejected";

export interface Printer {
  id: string; // seller user_id
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
  filePath: string;
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
  buyerId: string;
  sellerId: string;
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
  location: "",
  distance: "0.2 km",
  pricePerPage: 2,
  deliveryCharge: 10,
  services: "B&W, Color",
  type: "Both",
  delivery: true,
};

export const CATEGORIES = ["All", "Documents", "Photos", "Binding", "Posters"];

function mapOrder(r: any): Order {
  return {
    id: r.id,
    fileName: r.file_name,
    filePath: r.file_path,
    pages: r.pages,
    copies: r.copies,
    pricePerPage: Number(r.price_per_page),
    options: { color: r.color, sides: r.sides, paperSize: r.paper_size },
    printerId: r.seller_id,
    printerName: r.printer_name,
    location: r.location,
    delivery: r.delivery,
    payment: r.payment,
    placedOn: r.placed_on,
    status: r.status,
    buyerName: r.buyer_name,
    buyerEmail: r.buyer_email,
    buyerId: r.buyer_id,
    sellerId: r.seller_id,
    total: Number(r.total),
    history: r.history || [],
  };
}

function mapPrinter(r: any): Printer {
  return {
    id: r.user_id,
    name: r.name,
    location: r.location,
    distance: r.distance,
    rating: Number(r.rating),
    pricePerPage: Number(r.price_per_page),
    deliveryCharge: Number(r.delivery_charge),
    services: r.services,
    online: r.available,
    category: r.category,
  };
}

export function useAuth() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  useEffect(() => {
    let mounted = true;
    const hydrate = async (u: any) => {
      if (!u) { if (mounted) setUser(null); return; }
      const { data: p } = await supabase.from("profiles").select("name,email").eq("id", u.id).maybeSingle();
      if (!mounted) return;
      setUser({
        id: u.id,
        name: p?.name || (u.email as string | undefined)?.split("@")[0] || "User",
        email: p?.email || u.email || "",
      });
    };
    supabase.auth.getSession().then(({ data }) => hydrate(data.session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => hydrate(session?.user));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);
  return {
    user,
    login: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signup: async (name: string, email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    },
    logout: async () => { await supabase.auth.signOut(); },
  };
}

export function useMyShop() {
  const { user } = useAuth();
  const [shop, setShop] = useState<MyShop>(DEFAULT_SHOP);

  useEffect(() => {
    let mounted = true;
    if (!user) { setShop(DEFAULT_SHOP); return; }
    supabase.from("seller_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!mounted) return;
      if (data) {
        setShop({
          available: data.available,
          name: data.name,
          location: data.location,
          distance: data.distance,
          pricePerPage: Number(data.price_per_page),
          deliveryCharge: Number(data.delivery_charge),
          services: data.services,
          type: data.type as MyShop["type"],
          delivery: data.delivery,
        });
      } else {
        setShop({ ...DEFAULT_SHOP, name: user.name ? `${user.name}'s Shop` : DEFAULT_SHOP.name });
      }
    });
    return () => { mounted = false; };
  }, [user?.id]);

  const persist = useCallback(async (next: MyShop) => {
    if (!user) return;
    await supabase.from("seller_profiles").upsert({
      user_id: user.id,
      name: next.name,
      location: next.location,
      distance: next.distance,
      price_per_page: next.pricePerPage,
      delivery_charge: next.deliveryCharge,
      services: next.services,
      type: next.type,
      delivery: next.delivery,
      available: next.available,
    });
  }, [user?.id]);

  return {
    shop,
    // Local update; call save() to persist. Keeps typing fast in forms.
    update: (patch: Partial<MyShop>) => setShop(prev => ({ ...prev, ...patch })),
    // Persist current shop state (used by Save button).
    save: async () => { await persist(shop); },
    // Toggle availability — persists immediately.
    setAvailable: async (v: boolean) => {
      const next = { ...shop, available: v };
      setShop(next);
      await persist(next);
    },
  };
}

export function usePrinters() {
  const [list, setList] = useState<Printer[]>([]);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("available", true);
      if (mounted) setList((data || []).map(mapPrinter));
    };
    load();
    const ch = supabase
      .channel("seller_profiles_pub")
      .on("postgres_changes", { event: "*", schema: "public", table: "seller_profiles" }, load)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, []);
  return list;
}

// undefined = loading, null = not found
export function usePrinter(id: string): Printer | null | undefined {
  const [p, setP] = useState<Printer | null | undefined>(undefined);
  useEffect(() => {
    let mounted = true;
    setP(undefined);
    supabase.from("seller_profiles").select("*").eq("user_id", id).maybeSingle().then(({ data }) => {
      if (mounted) setP(data ? mapPrinter(data) : null);
    });
    return () => { mounted = false; };
  }, [id]);
  return p;
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const uidRef = useRef<string | null>(null);
  uidRef.current = user?.id ?? null;

  useEffect(() => {
    if (!user) { setOrders([]); return; }
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("placed_on", { ascending: false });
      if (mounted) setOrders((data || []).map(mapOrder));
    };
    load();
    const ch = supabase
      .channel(`orders_${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [user?.id]);

  return {
    orders,
    updateOrder: async (id: string, patch: Partial<Order>) => {
      const dbPatch: Record<string, any> = {};
      const current = orders.find(o => o.id === id);
      if (patch.status && patch.status !== current?.status) {
        dbPatch.status = patch.status;
        dbPatch.history = [...(current?.history || []), { status: patch.status, ts: Date.now() }];
      }
      if (patch.payment) dbPatch.payment = patch.payment;
      if (Object.keys(dbPatch).length === 0) return;
      await supabase.from("orders").update(dbPatch as any).eq("id", id);
    },
  };
}

export async function createOrder(input: {
  file: File;
  printer: Printer;
  pages: number;
  copies: number;
  options: PrintOptions;
  delivery: "Self pick up" | "Delivery";
  payment: "Card" | "UPI" | "Cash";
  total: number;
}): Promise<Order> {
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) throw new Error("Not signed in");
  const path = `${user.id}/${crypto.randomUUID()}-${input.file.name}`;
  const up = await supabase.storage.from("pdfs").upload(path, input.file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (up.error) throw up.error;
  const { data: profile } = await supabase.from("profiles").select("name,email").eq("id", user.id).maybeSingle();
  const row = {
    buyer_id: user.id,
    seller_id: input.printer.id,
    file_name: input.file.name,
    file_path: path,
    pages: input.pages,
    copies: input.copies,
    price_per_page: input.printer.pricePerPage,
    color: input.options.color,
    sides: input.options.sides,
    paper_size: input.options.paperSize,
    delivery: input.delivery,
    payment: input.payment,
    total: input.total,
    status: "Pending",
    history: [{ status: "Pending", ts: Date.now() }] as any,
    printer_name: input.printer.name,
    location: input.printer.location,
    buyer_name: profile?.name || user.email?.split("@")[0] || "User",
    buyer_email: profile?.email || user.email || "",
  };
  const { data, error } = await supabase.from("orders").insert(row).select("*").single();
  if (error) throw error;
  return mapOrder(data);
}

export function useChat(orderId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at");
      if (mounted) {
        setMessages((data || []).map((m: any) => ({
          id: m.id,
          orderId: m.order_id,
          from: m.sender_role,
          text: m.text,
          ts: new Date(m.created_at).getTime(),
        })));
      }
    };
    load();
    const ch = supabase
      .channel(`msg_${orderId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` }, load)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [orderId]);
  return {
    messages,
    send: async (from: "buyer" | "seller", text: string) => {
      if (!user) return;
      await supabase.from("messages").insert({
        order_id: orderId,
        sender_role: from,
        sender_id: user.id,
        text,
      });
    },
  };
}

export function computePrice(opts: {
  pages: number;
  copies: number;
  pricePerPage: number;
  options: PrintOptions;
  delivery: "Self pick up" | "Delivery";
  deliveryCharge: number;
}) {
  const colorMult = opts.options.color === "Color" ? 2 : 1;
  const sizeMult = opts.options.paperSize === "A3" ? 1.5 : 1;
  const sidesMult = opts.options.sides === "Double" ? 0.9 : 1;
  const sheets = opts.options.sides === "Double" ? Math.ceil(opts.pages / 2) : opts.pages;
  const subtotal = sheets * opts.copies * opts.pricePerPage * colorMult * sizeMult * sidesMult;
  const delivery = opts.delivery === "Delivery" ? opts.deliveryCharge : 0;
  return { subtotal: Math.round(subtotal), delivery, total: Math.round(subtotal) + delivery };
}

export function uid() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}
