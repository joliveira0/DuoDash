import { useCallback, useEffect, useState } from "react";

export type PasseioCategory = "Restaurante" | "Ar Livre" | "Viagem" | "Cultura" | "Outros";
export type NotaTag = "Comida" | "Presente" | "Detalhe" | "Importante";

export const PASSEIO_CATEGORIES: PasseioCategory[] = [
  "Restaurante",
  "Ar Livre",
  "Viagem",
  "Cultura",
  "Outros",
];

export const NOTA_TAGS: NotaTag[] = ["Comida", "Presente", "Detalhe", "Importante"];

export type Passeio = {
  id: string;
  title: string;
  category: PasseioCategory;
  notes: string;
  done: boolean;
  createdAt: number;
};

export type Nota = {
  id: string;
  text: string;
  tag: NotaTag;
  createdAt: number;
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read<T[]>(key, []));
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, items, hydrated]);

  return { items, setItems, hydrated };
}

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = read<boolean | null>("duodash.dark", null);
    const next =
      stored ?? window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    setDark(next);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setDark((d) => {
      const next = !d;
      try {
        window.localStorage.setItem("duodash.dark", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}

export function relativeDate(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ontem";
  if (d < 30) return `há ${d} dias`;
  const m = Math.round(d / 30);
  if (m < 12) return `há ${m} ${m === 1 ? "mês" : "meses"}`;
  return `há ${Math.round(m / 12)} ano(s)`;
}
