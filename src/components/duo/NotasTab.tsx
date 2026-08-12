import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { NOTA_TAGS, type Nota, type NotaTag, relativeDate, uid, useLocalList } from "@/lib/duodash";
import { Badge, Chip, EmptyState, Sheet, inputClass } from "./ui";
import { cn } from "@/lib/utils";

const tagVar: Record<NotaTag, string> = {
  Comida: "--cat-restaurante",
  Presente: "--cat-cultura",
  Detalhe: "--cat-arlivre",
  Importante: "--cat-viagem",
};

export function NotasTab() {
  const { items, setItems } = useLocalList<Nota>("duodash.notas");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<NotaTag | "Todas">("Todas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Nota | null>(null);
  const [text, setText] = useState("");
  const [tag, setTag] = useState<NotaTag>("Detalhe");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      items
        .filter((n) => (filter === "Todas" ? true : n.tag === filter))
        .filter((n) =>
          query.trim() ? n.text.toLowerCase().includes(query.trim().toLowerCase()) : true,
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [items, filter, query],
  );

  const startNew = () => {
    setEditing(null);
    setText("");
    setTag("Detalhe");
    setOpen(true);
  };

  const startEdit = (n: Nota) => {
    setEditing(n);
    setText(n.text);
    setTag(n.tag);
    setOpen(true);
  };

  const save = () => {
    if (!text.trim()) return;
    if (editing) {
      setItems((prev) =>
        prev.map((n) => (n.id === editing.id ? { ...n, text: text.trim(), tag } : n)),
      );
    } else {
      setItems((prev) => [{ id: uid(), text: text.trim(), tag, createdAt: Date.now() }, ...prev]);
    }
    setOpen(false);
  };

  const copy = async (n: Nota) => {
    try {
      await navigator.clipboard.writeText(n.text);
      setCopiedId(n.id);
      setTimeout(() => setCopiedId((c) => (c === n.id ? null : c)), 1500);
    } catch {
      /* clipboard unavailable */
    }
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
              placeholder="Buscar notas"
              className={cn(inputClass, "py-2.5 pl-10")}
            />
          </div>
          <button
            type="button"
            onClick={startNew}
            className="tap inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lift active:scale-95"
          >
            <Plus className="size-4" /> Nova
          </button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(["Todas", ...NOTA_TAGS] as const).map((t) => (
            <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="size-7" />}
          title={items.length ? "Nenhuma nota encontrada" : "Sem notas por enquanto"}
          description={
            items.length
              ? "Ajuste a busca ou escolha outra tag."
              : "Anote gostos, tamanhos, sonhos e aquele detalhe que ela comentou de passagem."
          }
          action={
            <button
              type="button"
              onClick={startNew}
              className="tap inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lift active:scale-95"
            >
              <Plus className="size-4" /> Nova Nota
            </button>
          }
        />
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {visible.map((n) => (
            <li
              key={n.id}
              className="tap flex flex-col rounded-3xl border border-border bg-card p-4 shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{n.text}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge color={tagVar[n.tag]}>{n.tag}</Badge>
                  <span className="truncate text-xs text-muted-foreground">
                    {relativeDate(n.createdAt)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Copiar nota"
                    onClick={() => copy(n)}
                    className="tap grid size-8 place-items-center rounded-full text-muted-foreground active:scale-90 hover:bg-muted hover:text-foreground"
                  >
                    {copiedId === n.id ? (
                      <Check className="size-4 text-primary" strokeWidth={3} />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Editar nota"
                    onClick={() => startEdit(n)}
                    className="tap grid size-8 place-items-center rounded-full text-muted-foreground active:scale-90 hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  {confirmId === n.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setItems((prev) => prev.filter((x) => x.id !== n.id));
                        setConfirmId(null);
                      }}
                      onBlur={() => setConfirmId(null)}
                      autoFocus
                      className="tap rounded-xl bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground active:scale-95"
                    >
                      Confirmar
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Excluir nota"
                      onClick={() => setConfirmId(n.id)}
                      className="tap grid size-8 place-items-center rounded-full text-muted-foreground active:scale-90 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? "Editar nota" : "Nova nota"}>
        <div className="space-y-3">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Ela ama brigadeiro de pistache..."
            className={cn(inputClass, "resize-none")}
          />
          <div className="flex flex-wrap gap-2">
            {NOTA_TAGS.map((t) => (
              <Chip key={t} active={tag === t} onClick={() => setTag(t)}>
                {t}
              </Chip>
            ))}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!text.trim()}
            className="tap w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lift active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
          >
            {editing ? "Salvar alterações" : "Salvar nota"}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
