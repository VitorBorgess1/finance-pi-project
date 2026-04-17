import { useState } from "react";
import { useFinance, monthlyTotal, totalSpentToday, monthlyExpensesByCategory } from "@/store/finance";
import { formatBRL, todayLabel } from "@/lib/format";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Fab } from "@/components/Fab";
import { TransactionModal } from "@/components/TransactionModal";
import { ProgressBar } from "@/components/ProgressBar";
import { getBudgetState, useBudgetAlerts } from "@/hooks/use-budget-alerts";
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  useBudgetAlerts();
  const [open, setOpen] = useState(false);
  const transactions = useFinance((s) => s.transactions);
  const categories = useFinance((s) => s.categories);
  const investments = useFinance((s) => s.investments);

  const incomeM = monthlyTotal(transactions, "income");
  const expenseM = monthlyTotal(transactions, "expense");
  const balance = incomeM - expenseM;
  const today = totalSpentToday(transactions);

  const recent = transactions.slice(0, 4);

  // top category by spending
  const topCat = [...categories]
    .map((c) => ({ ...c, spent: monthlyExpensesByCategory(transactions, c.id) }))
    .sort((a, b) => b.spent - a.spent)[0];

  const insight =
    today > 0
      ? `Você gastou ${formatBRL(today)} hoje.`
      : "Nenhum gasto registrado hoje. Bom controle.";

  return (
    <>
      <header className="flex items-center justify-between pt-4 pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{todayLabel()}</p>
          <h1 className="text-2xl font-semibold tracking-tight mt-0.5">Olá 👋</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Balance card */}
      <section className="card-soft p-6 animate-slide-up">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Saldo do mês</p>
        <p className="text-4xl font-semibold tracking-tight tabular-nums mt-1">
          {formatBRL(balance)}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-success/10 text-success flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Entradas</p>
              <p className="text-sm font-medium tabular-nums truncate">{formatBRL(incomeM)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Saídas</p>
              <p className="text-sm font-medium tabular-nums truncate">{formatBRL(expenseM)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="mt-4 card-soft p-5 flex items-start gap-3 animate-slide-up">
        <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Insight</p>
          <p className="text-base font-medium mt-0.5 text-balance leading-snug">{insight}</p>
        </div>
      </section>

      {/* Investments + top category */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="card-soft p-5 animate-slide-up">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <p className="text-[11px] uppercase tracking-widest">Investido</p>
          </div>
          <p className="text-xl font-semibold tabular-nums mt-2">{formatBRL(investments)}</p>
        </div>
        {topCat && (
          <Link to="/categorias" className="card-soft p-5 animate-slide-up block">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Mais gasta</p>
            <p className="text-xl font-semibold mt-2">
              <span className="mr-1.5">{topCat.emoji}</span>{topCat.name}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
              {formatBRL(topCat.spent)}
            </p>
          </Link>
        )}
      </div>

      {/* Categories quick view */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Orçamentos</h2>
          <Link to="/categorias" className="text-xs text-muted-foreground hover:text-foreground">Ver tudo</Link>
        </div>
        <div className="space-y-3">
          {categories.slice(0, 4).map((c) => {
            const spent = monthlyExpensesByCategory(transactions, c.id);
            const { state, ratio } = getBudgetState(spent, c.budget);
            return (
              <div key={c.id} className="card-soft px-5 py-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{c.emoji}</span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  <span className={`text-xs tabular-nums ${state === "danger" ? "text-destructive font-semibold" : state === "warning" ? "text-warning font-medium" : "text-muted-foreground"}`}>
                    {formatBRL(spent)} / {formatBRL(c.budget)}
                  </span>
                </div>
                <ProgressBar value={ratio * 100} state={state} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent transactions */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Recentes</h2>
          <Link to="/lancamentos" className="text-xs text-muted-foreground hover:text-foreground">Ver tudo</Link>
        </div>
        <div className="card-soft divide-y divide-border">
          {recent.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground text-center">Sem lançamentos ainda.</p>
          )}
          {recent.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            const isIncome = t.type === "income";
            return (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm shrink-0 ${isIncome ? "bg-success/10 text-success" : "bg-muted"}`}>
                  {isIncome ? <ArrowUpRight className="h-4 w-4" /> : (cat?.emoji ?? "•")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <p className="text-[11px] text-muted-foreground">{cat?.name ?? "Receita"}</p>
                </div>
                <p className={`text-sm font-semibold tabular-nums shrink-0 ${isIncome ? "text-success" : "text-foreground"}`}>
                  {isIncome ? "+" : "−"} {formatBRL(t.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <Fab onClick={() => setOpen(true)} />
      <TransactionModal open={open} onOpenChange={setOpen} />
    </>
  );
}
