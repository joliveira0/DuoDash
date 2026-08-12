import { useMemo, useState } from "react";
import { Check, MapPinned, Plus, Search, Trash2 } from "lucide-react";
import {
  PASSEIO_CATEGORIES,
  type Passeio,
  type PasseioCategory,
  uid,
  useLocalList,
} from "@/lib/duodash";
import { Badge, Chip, EmptyState, Sheet, inputClass } from "./ui";
import { cn } from "@/lib/utils";

const catVar: Record<PasseioCategory, string> = {
  Restaurante: "--cat-restaurante",
  "Ar Livre": "--cat-arlivre",
  Viagem: "--cat-viagem",
  Cultura: "--cat-cultura",
  Outros: "--cat-outros",
};

export function PasseiosTab() {
  const { items, setItems } = useLocalList<Passeio>("duodash.passeios");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PasseioCategory | "Todos">("Todos");
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PasseioCategory>("Restaurante");
  const [notes, setNotes] = useState("");

  const visible = useMemo(
    () =>
      items
        .filter((p) => (filter === "Todos" ? true : p.category === filter))
        .filter((p) =>
          query.trim()
            ? (p.title + " " + p.notes).toLowerCase().includes(query.trim().toLowerCase())
            : true,
        )
        .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt),
    [items, filter, query],
  );

  const save = () => {
    if (!title.trim()) return;
    setItems((prev) => [
      { id: uid(), title: title.trim(), category, notes: notes.trim(), done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setTitle("");
    setNotes("");
    setCategory("Restaurante");
    setOpen(false);
  };

  return (
    <div className="pb-4">
      <div className="sticky top-[57px] z-20 -mx-4 bg-background/85 px-4 pt-3 pb-2 backdrop-blur-md">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar passeios"
              className={cn(inputClass, "py-2.5 pl-10")}
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="tap inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lift active:scale-95"
          >
            <Plus className="size-4" /> Novo
          </button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(["Todos", ...PASSEIO_CATEGORIES] as const).map((c) => (
            <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<MapPinned className="size-7" />}
          title={items.length ? "Nada por aqui" : "Nenhum passeio ainda"}
          description={
            items.length
              ? "Tente outra busca ou mude o filtro de categoria."
              : "Guarde aquelas ideias de programa a dois antes que elas fujam da cabeça."
          }
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="tap inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lift active:scale-95"
            >
              <Plus className="size-4" /> Novo Passeio
            </button>
          }
        />
      ) : (
        <ul className="mt-3 space-y-2.5">
          {visible.map((p) => (
            <li
              key={p.id}
              className={cn(
                "tap rounded-3xl border border-border bg-card p-4 shadow-soft",
                p.done && "opacity-70",
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  aria-label={p.done ? "Desmarcar" : "Marcar como feito"}
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, done: !x.done } : x)),
                    )
                  }
                  className={cn(
                    "tap mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 active:scale-90",
                    p.done
                      ? "border-transparent bg-primary text-primary-foreground shadow-lift"
                      : "border-border text-transparent hover:border-primary",
                  )}
                >
                  <Check className="size-4" strokeWidth={3} />
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-display text-base leading-snug font-semibold transition-all",
                      p.done && "text-muted-foreground line-through decoration-2",
                    )}
                  >
                    {p.title}
                  </p>
                  <div className="mt-1.5">
                    <Badge color={catVar[p.category]}>{p.category}</Badge>
                  </div>
                  {p.notes ? (
                    <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                      {p.notes}
                    </p>
                  ) : null}
                </div>

                {confirmId === p.id ? (
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((x) => x.id !== p.id))}
                      className="tap rounded-xl bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground active:scale-95"
                    >
                      Excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="tap rounded-xl bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground active:scale-95"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label="Excluir passeio"
                    onClick={() => setConfirmId(p.id)}
                    className="tap grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground active:scale-90 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Novo Passeio">
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase">
              Título
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Jantar no restaurante japonês"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PasseioCategory)}
              className={inputClass}
            >
              {PASSEIO_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Detalhes, endereço, melhor dia..."
              className={cn(inputClass, "resize-none")}
            />
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!title.trim()}
            className="tap w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lift active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            Salvar passeio
          </button>
        </div>
      </Sheet>
    </div>
  );
}
