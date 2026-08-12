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
  dates: string[];
  done: boolean;
  createdAt: number;
};

export type Nota = {
  id: string;
  title: string;
  details: string;
  tag: NotaTag;
  pinned: boolean;
  createdAt: number;
};

export type CycleConfig = {
  lastPeriod: string | null;
  cycleLength: number;
  periodLength: number;
};

export const DEFAULT_CYCLE: CycleConfig = {
  lastPeriod: null,
  cycleLength: 28,
  periodLength: 5,
};

export type Intimacy = {
  id: string;
  date: string;
  protected: boolean;
  notes: string;
  createdAt: number;
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ---------- date helpers (ISO yyyy-mm-dd, local time) ---------- */

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

export const todayISO = () => toISO(new Date());

export const addDays = (iso: string, n: number) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const daysBetween = (a: string, b: string) =>
  Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000);

export const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const WEEKDAYS_PT = ["D", "S", "T", "Q", "Q", "S", "S"];

export const formatDatePT = (iso: string) => {
  const d = fromISO(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const formatLongPT = (iso: string) => {
  const d = fromISO(iso);
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
};

/* ---------- cycle ---------- */

export type CyclePhase = "menstruacao" | "fertil" | "ovulacao" | "normal";

export function cyclePhase(iso: string, cfg: CycleConfig): CyclePhase {
  if (!cfg.lastPeriod) return "normal";
  const len = Math.max(20, Math.min(45, cfg.cycleLength || 28));
  const diff = daysBetween(cfg.lastPeriod, iso);
  const idx = ((diff % len) + len) % len;
  const ovulation = len - 14;
  if (idx < Math.max(1, cfg.periodLength || 5)) return "menstruacao";
  if (idx === ovulation) return "ovulacao";
  if (idx >= ovulation - 5 && idx <= ovulation + 1) return "fertil";
  return "normal";
}

export function nextPeriod(cfg: CycleConfig) {
  if (!cfg.lastPeriod) return null;
  const len = Math.max(20, Math.min(45, cfg.cycleLength || 28));
  let date = cfg.lastPeriod;
  const today = todayISO();
  let guard = 0;
  while (daysBetween(date, today) >= 0 && guard++ < 120) date = addDays(date, len);
  return date;
}

/** Rough conception probability for intercourse on a given day. */
export function pregnancyChance(iso: string, cfg: CycleConfig) {
  if (!cfg.lastPeriod) return { label: "Sem dados do ciclo", percent: 0 };
  const len = Math.max(20, Math.min(45, cfg.cycleLength || 28));
  const diff = daysBetween(cfg.lastPeriod, iso);
  const idx = ((diff % len) + len) % len;
  const ovulation = len - 14;
  const delta = idx - ovulation;
  const table: Record<number, number> = {
    [-5]: 10,
    [-4]: 16,
    [-3]: 22,
    [-2]: 28,
    [-1]: 32,
    0: 30,
    1: 12,
  };
  const percent = table[delta] ?? 2;
  const label = percent >= 25 ? "Alta" : percent >= 10 ? "Moderada" : "Baixa";
  return { label, percent };
}

/* ---------- storage ---------- */

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function migrate<T>(key: string, items: unknown[]): T[] {
  if (key.endsWith("notas")) {
    return items.map((raw) => {
      const n = raw as Partial<Nota> & { text?: string };
      const legacy = typeof n.text === "string" ? n.text : "";
      return {
        id: n.id ?? uid(),
        title: n.title ?? legacy.split("\n")[0]?.slice(0, 60) ?? "Nota",
        details: n.details ?? (n.title ? legacy : legacy.split("\n").slice(1).join("\n")),
        tag: n.tag ?? "Detalhe",
        pinned: Boolean(n.pinned),
        createdAt: n.createdAt ?? Date.now(),
      } as T;
    });
  }
  if (key.endsWith("passeios")) {
    return items.map((raw) => {
      const p = raw as Partial<Passeio>;
      return { ...p, dates: Array.isArray(p.dates) ? p.dates : [] } as T;
    });
  }
  return items as T[];
}

export function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(migrate<T>(key, read<unknown[]>(key, [])));
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

export function useLocalValue<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, hydrated]);

  return { value, setValue, hydrated };
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
