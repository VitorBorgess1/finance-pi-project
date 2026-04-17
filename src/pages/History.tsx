import { useFinance } from "@/store/finance";
import { formatBRL } from "@/lib/format";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function History() {
  const transactions = useFinance((s) => s.transactions);
  const categories = useFinance((s) => s.categories);
  const remove = useFinance((s) => s.removeTransaction);

  // Group by day
  const groups = transactions.reduce<Record<string, typeof transactions>>((acc, t) => {
    const key = new Date(t.date).toDateString();
    (acc[key] ||= []).push(t);
    return acc;
  }, {});

  const dayLabel = (d: string) => {
    const date = new Date(d);
    const today = new Date().toDateString();
    const yest = new Date(Date.now() - 86400000).toDateString();
    if (d === today) return "Hoje";
    if (d === yest) return "Ontem";
    return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "short" }).format(date);
  };

  return (
    <>
      <header className="flex items-center justify-between pt-4 pb-6">
        <Link to="/" className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium">Histórico</h1>
        <div className="w-10" />
      </header>

      {Object.keys(groups).length === 0 && (
        <div className="card-soft p-10 text-center">
          <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groups).map(([day, items]) => (
          <section key={day}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-1 first-letter:capitalize">
              {dayLabel(day)}
            </p>
            <div className="card-soft divide-y divide-border">
              {items.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const isIncome = t.type === "income";
                return (
                  <div key={t.id} className="group flex items-center gap-3 px-5 py-3.5">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm shrink-0 ${isIncome ? "bg-success/10 text-success" : "bg-muted"}`}>
                      {isIncome ? <ArrowUpRight className="h-4 w-4" /> : cat?.emoji ? <span>{cat.emoji}</span> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{t.description}</p>
                      <p className="text-[11px] text-muted-foreground">{cat?.name ?? "Receita"}</p>
                    </div>
                    <p className={`text-sm font-semibold tabular-nums shrink-0 ${isIncome ? "text-success" : "text-foreground"}`}>
                      {isIncome ? "+" : "−"} {formatBRL(t.amount)}
                    </p>
                    <button
                      onClick={() => { remove(t.id); toast.success("Lançamento removido"); }}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
