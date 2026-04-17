import { useEffect } from "react";
import { toast } from "sonner";
import { useFinance, monthlyExpensesByCategory } from "@/store/finance";

/**
 * Watches every category's spending and triggers toast/modal alerts.
 * Thresholds: 76–90% → warning toast. >90% → destructive toast.
 * Uses alertsDismissed map so we don't spam the same key in a session.
 */
export function useBudgetAlerts() {
  const categories = useFinance((s) => s.categories);
  const transactions = useFinance((s) => s.transactions);
  const dismissed = useFinance((s) => s.alertsDismissed);
  const dismiss = useFinance((s) => s.dismissAlert);

  useEffect(() => {
    const monthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;

    categories.forEach((cat) => {
      if (!cat.budget) return;
      const spent = monthlyExpensesByCategory(transactions, cat.id);
      const ratio = spent / cat.budget;

      if (ratio > 0.9) {
        const key = `${monthKey}:${cat.id}:over`;
        if (!dismissed[key]) {
          toast.error(`Teto rompido em ${cat.name}`, {
            description: `Você ultrapassou o orçamento desta categoria.`,
            duration: 6000,
          });
          dismiss(key);
        }
      } else if (ratio > 0.75) {
        const key = `${monthKey}:${cat.id}:warn`;
        if (!dismissed[key]) {
          toast.warning(`Atenção: ${cat.name} está quase no limite`, {
            description: `Você já usou ${Math.round(ratio * 100)}% do orçamento.`,
            duration: 5000,
          });
          dismiss(key);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, categories]);
}

export function getBudgetState(spent: number, budget: number) {
  const ratio = budget > 0 ? spent / budget : 0;
  if (ratio > 0.9) return { state: "danger" as const, ratio };
  if (ratio > 0.75) return { state: "warning" as const, ratio };
  return { state: "ok" as const, ratio };
}
