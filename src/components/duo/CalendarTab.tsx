import { useMemo, useState } from "react";
import { CalendarDays, Droplets, Heart, Settings2, Sparkles, Trash2 } from "lucide-react";
import {
  DEFAULT_CYCLE,
  type CycleConfig,
  type Intimacy,
  type Passeio,
  cyclePhase,
  formatLongPT,
  nextPeriod,
  pregnancyChance,
  todayISO,
  uid,
  useLocalList,
  useLocalValue,
} from "@/lib/duodash";
import { Badge, Chip, Sheet, inputClass } from "./ui";
import { Dot, MonthGrid } from "./MonthGrid";
import { cn } from "@/lib/utils";

type Layer = "todos" | "passeios" | "ciclo" | "intimidade";

const phaseLabel: Record<string, string> = {
  menstruacao: "Menstruação",
  fertil: "Período fértil",
  ovulacao: "Ovulação",
  normal: "Fora do período fértil",
};

const phaseVar: Record<string, string> = {
  menstruacao: "--cycle-menstruacao",
  fertil: "--cycle-fertil",
  ovulacao: "--cycle-ovulacao",
  normal: "--cat-outros",
};

export function CalendarTab() {
  const { items: passeios } = useLocalList<Passeio>("duodash.passeios");
  const { items: intimacies, setItems: setIntimacies } =
    useLocalList<Intimacy>("duodash.intimidade");
  const { value: cycle, setValue: setCycle } = useLocalValue<CycleConfig>(
    "duodash.ciclo",
    DEFAULT_CYCLE,
  );

  const [layer, setLayer] = useState<Layer>("todos");
  const [day, setDay] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);

  const show = (l: Exclude<Layer, "todos">) => layer === "todos" || layer === l;

  const passeiosByDay = useMemo(() => {
    const map = new Map<string, Passeio[]>();
    for (const p of passeios)
      for (const d of p.dates ?? []) map.set(d, [...(map.get(d) ?? []), p]);
    return map;
  }, [passeios]);

  const intimacyByDay = useMemo(() => {
    const map = new Map<string, Intimacy[]>();
    for (const i of intimacies) map.set(i.date, [...(map.get(i.date) ?? []), i]);
    return map;
  }, [intimacies]);

  const proximaMenstruacao = nextPeriod(cycle);

  return (
    <div className="pb-4">
      <div className="sticky top-[57px] z-20 -mx-4 bg-background/85 px-4 pt-3 pb-2 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {(
              [
                ["todos", "Ver todos"],
                ["passeios", "Passeios"],
                ["ciclo", "Ciclo"],
                ["intimidade", "Intimidade"],
              ] as const
            ).map(([k, label]) => (
              <Chip key={k} active={layer === k} onClick={() => setLayer(k)}>
                {label}
              </Chip>
            ))}
          </div>
          <button
            type="button"
            aria-label="Configurações do ciclo"
            onClick={() => setSettings(true)}
            className="tap grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground active:scale-90 hover:text-foreground"
          >
            <Settings2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <MonthGrid
          onDayClick={setDay}
          renderDots={(iso) => {
            const phase = cyclePhase(iso, cycle);
            return (
              <>
                {show("passeios") && passeiosByDay.has(iso) ? <Dot color="--cat-viagem" /> : null}
                {show("ciclo") && phase !== "normal" ? <Dot color={phaseVar[phase]!} /> : null}
                {show("intimidade") && intimacyByDay.has(iso) ? (
                  <Dot color="--cycle-intimidade" />
                ) : null}
              </>
            );
          }}
          dayClassName={(iso) => {
            const phase = cyclePhase(iso, cycle);
            if (!show("ciclo") || phase === "normal") return undefined;
            return phase === "menstruacao"
              ? "bg-[color-mix(in_oklab,var(--cycle-menstruacao)_16%,transparent)]"
              : phase === "ovulacao"
                ? "bg-[color-mix(in_oklab,var(--cycle-ovulacao)_18%,transparent)]"
                : "bg-[color-mix(in_oklab,var(--cycle-fertil)_14%,transparent)]";
          }}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Legend />
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Ciclo</p>
          {cycle.lastPeriod ? (
            <>
              <p className="mt-1 text-sm">
                Hoje: <strong>{phaseLabel[cyclePhase(todayISO(), cycle)]}</strong>
              </p>
              {proximaMenstruacao ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Próxima menstruação prevista: {formatLongPT(proximaMenstruacao)}
                </p>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSettings(true)}
              className="tap mt-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lift active:scale-95"
            >
              Configurar ciclo
            </button>
          )}
        </div>
      </div>

      <DaySheet
        day={day}
        onClose={() => setDay(null)}
        cycle={cycle}
        passeios={day ? (passeiosByDay.get(day) ?? []) : []}
        intimacies={day ? (intimacyByDay.get(day) ?? []) : []}
        onAddIntimacy={(rec) => setIntimacies((prev) => [rec, ...prev])}
        onRemoveIntimacy={(id) => setIntimacies((prev) => prev.filter((i) => i.id !== id))}
      />

      <CycleSettings
        open={settings}
        onClose={() => setSettings(false)}
        cycle={cycle}
        onSave={setCycle}
      />
    </div>
  );
}

function Legend() {
  const rows: [string, string][] = [
    ["--cat-viagem", "Passeios"],
    ["--cycle-menstruacao", "Menstruação"],
    ["--cycle-fertil", "Período fértil"],
    ["--cycle-ovulacao", "Ovulação"],
    ["--cycle-intimidade", "Intimidade"],
  ];
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs font-semibold text-muted-foreground uppercase">Legenda</p>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        {rows.map(([v, label]) => (
          <li key={v} className="flex items-center gap-2">
            <Dot color={v} />
            <span className="truncate text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DaySheet({
  day,
  onClose,
  cycle,
  passeios,
  intimacies,
  onAddIntimacy,
  onRemoveIntimacy,
}: {
  day: string | null;
  onClose: () => void;
  cycle: CycleConfig;
  passeios: Passeio[];
  intimacies: Intimacy[];
  onAddIntimacy: (rec: Intimacy) => void;
  onRemoveIntimacy: (id: string) => void;
}) {
  const [prot, setProt] = useState(true);
  const [notes, setNotes] = useState("");

  if (!day) return null;
  const phase = cyclePhase(day, cycle);
  const chance = pregnancyChance(day, cycle);

  const add = () => {
    onAddIntimacy({
      id: uid(),
      date: day,
      protected: prot,
      notes: notes.trim(),
      createdAt: Date.now(),
    });
    setNotes("");
  };

  return (
    <Sheet open onClose={onClose} title={formatLongPT(day)}>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto">
        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
            <CalendarDays className="size-3.5" /> Passeios do dia
          </h3>
          {passeios.length ? (
            <ul className="mt-2 space-y-1.5">
              {passeios.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl border border-border bg-surface px-3 py-2 text-sm"
                >
                  <span className="font-semibold">{p.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{p.category}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Nenhum passeio marcado.</p>
          )}
        </section>

        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
            <Droplets className="size-3.5" /> Status do ciclo
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge color={phaseVar[phase]}>{phaseLabel[phase]}</Badge>
            <span className="text-sm text-muted-foreground">
              Chance de gravidez: {chance.label} (~{chance.percent}%)
            </span>
          </div>
        </section>

        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
            <Heart className="size-3.5" /> Registro de intimidade
          </h3>

          {intimacies.length ? (
            <ul className="mt-2 space-y-1.5">
              {intimacies.map((i) => (
                <li
                  key={i.id}
                  className="flex items-start gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {i.protected ? "Com camisinha" : "Sem camisinha"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {i.protected
                        ? "Risco reduzido pelo uso de preservativo"
                        : `Probabilidade estimada: ${chance.label} (~${chance.percent}%)`}
                    </p>
                    {i.notes ? (
                      <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                        {i.notes}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Excluir registro"
                    onClick={() => onRemoveIntimacy(i.id)}
                    className="tap grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground active:scale-90 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <Chip active={prot} onClick={() => setProt(true)}>
                Com camisinha
              </Chip>
              <Chip active={!prot} onClick={() => setProt(false)}>
                Sem camisinha
              </Chip>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Sintomas, humor, observações..."
              className={cn(inputClass, "resize-none")}
            />
            <button
              type="button"
              onClick={add}
              className="tap inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lift active:scale-[0.98]"
            >
              <Sparkles className="size-4" /> Registrar relação
            </button>
          </div>
        </section>
      </div>
    </Sheet>
  );
}

function CycleSettings({
  open,
  onClose,
  cycle,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  cycle: CycleConfig;
  onSave: (c: CycleConfig) => void;
}) {
  const [last, setLast] = useState(cycle.lastPeriod ?? "");
  const [len, setLen] = useState(String(cycle.cycleLength));
  const [period, setPeriod] = useState(String(cycle.periodLength));

  return (
    <Sheet open={open} onClose={onClose} title="Configurações do ciclo">
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase">
            Primeiro dia da última menstruação
          </label>
          <input
            type="date"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase">
              Duração do ciclo
            </label>
            <input
              type="number"
              min={20}
              max={45}
              value={len}
              onChange={(e) => setLen(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase">
              Dias de fluxo
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onSave({
              lastPeriod: last || null,
              cycleLength: Number(len) || 28,
              periodLength: Number(period) || 5,
            });
            onClose();
          }}
          className="tap w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lift active:scale-[0.98]"
        >
          Salvar ciclo
        </button>
        <p className="text-xs text-muted-foreground">
          As previsões são estimativas e não substituem orientação médica ou métodos
          contraceptivos.
        </p>
      </div>
    </Sheet>
  );
}
