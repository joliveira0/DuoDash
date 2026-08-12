import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MapPinned, Moon, NotebookPen, Sun } from "lucide-react";
import { useTheme } from "@/lib/duodash";
import { PasseiosTab } from "@/components/duo/PasseiosTab";
import { NotasTab } from "@/components/duo/NotasTab";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DuoDash — Passeios e notas do casal" },
      {
        name: "description",
        content:
          "DuoDash é seu assistente de memória a dois: guarde ideias de passeios e notas sobre gostos, presentes e detalhes importantes.",
      },
      { property: "og:title", content: "DuoDash — Passeios e notas do casal" },
      {
        property: "og:description",
        content:
          "Guarde ideias de passeios e notas sobre gostos, presentes e detalhes importantes, direto no seu celular.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState<"passeios" | "notas">("passeios");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lift">
              <Heart className="size-4" fill="currentColor" />
            </span>
            <h1 className="truncate font-display text-xl font-semibold tracking-tight">DuoDash</h1>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
            className="tap grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground active:scale-90 hover:text-foreground"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-28">
        {tab === "passeios" ? <PasseiosTab /> : <NotasTab />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-1 px-4 py-2">
          <TabButton
            active={tab === "passeios"}
            onClick={() => setTab("passeios")}
            icon={<MapPinned className="size-5" />}
            label="Passeios"
          />
          <TabButton
            active={tab === "notas"}
            onClick={() => setTab("notas")}
            icon={<NotebookPen className="size-5" />}
            label="Notas"
          />
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "tap flex flex-col items-center gap-0.5 rounded-2xl py-2 text-xs font-semibold active:scale-95",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
