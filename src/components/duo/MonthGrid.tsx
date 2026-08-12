import { type ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTHS_PT, WEEKDAYS_PT, toISO, todayISO } from "@/lib/duodash";
import { cn } from "@/lib/utils";

export function MonthGrid({
  selected = [],
  onDayClick,
  renderDots,
  dayClassName,
}: {
  selected?: string[];
  onDayClick: (iso: string) => void;
  renderDots?: (iso: string) => ReactNode;
  dayClassName?: (iso: string) => string | undefined;
}) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const today = todayISO();

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const lead = first.getDay();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toISO(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
    ),
  ];

  const shift = (n: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  return (
    <div className="rounded-3xl border border-border bg-card p-3 shadow-soft">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => shift(-1)}
          className="tap grid size-9 place-items-center rounded-full text-muted-foreground active:scale-90 hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="font-display text-base font-semibold">
          {MONTHS_PT[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => shift(1)}
          className="tap grid size-9 place-items-center rounded-full text-muted-foreground active:scale-90 hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground uppercase">
        {WEEKDAYS_PT.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((iso, i) =>
          iso === null ? (
            <span key={`e${i}`} />
          ) : (
            <button
              key={iso}
              type="button"
              onClick={() => onDayClick(iso)}
              className={cn(
                "tap relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-medium active:scale-90",
                selected.includes(iso)
                  ? "bg-primary text-primary-foreground shadow-lift"
                  : "hover:bg-muted",
                iso === today && !selected.includes(iso) && "ring-2 ring-primary/40",
                dayClassName?.(iso),
              )}
            >
              <span>{Number(iso.slice(-2))}</span>
              <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                {renderDots?.(iso)}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export function Dot({ color }: { color: string }) {
  return (
    <span
      className="size-1.5 rounded-full"
      style={{ backgroundColor: `var(${color})` }}
    />
  );
}
