import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BudgetSplit, Category, Transaction } from "@/lib/types";

interface FinanceState {
  income: number;
  split: BudgetSplit;
  categories: Category[];
  transactions: Transaction[];
  investments: number;
  alertsDismissed: Record<string, boolean>; // key: category id + bucket

  setIncome: (n: number) => void;
  setSplit: (s: BudgetSplit) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  setInvestments: (n: number) => void;
  dismissAlert: (key: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const seedCategories: Category[] = [
  { id: "mercado", name: "Mercado", emoji: "🛒", budget: 1200 },
  { id: "transporte", name: "Transporte", emoji: "🚗", budget: 400 },
  { id: "lazer", name: "Lazer", emoji: "🎬", budget: 500 },
  { id: "casa", name: "Casa", emoji: "🏠", budget: 1800 },
  { id: "saude", name: "Saúde", emoji: "🩺", budget: 300 },
];

const seedTx = (): Transaction[] => {
  const now = new Date();
  const d = (off: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - off).toISOString();
  return [
    { id: uid(), type: "income", amount: 7500, categoryId: null, description: "Salário", date: d(10) },
    { id: uid(), type: "expense", amount: 850, categoryId: "mercado", description: "Compra do mês", date: d(8) },
    { id: uid(), type: "expense", amount: 220, categoryId: "transporte", description: "Combustível", date: d(5) },
    { id: uid(), type: "expense", amount: 180, categoryId: "lazer", description: "Cinema + jantar", date: d(3) },
    { id: uid(), type: "expense", amount: 1800, categoryId: "casa", description: "Aluguel", date: d(2) },
    { id: uid(), type: "expense", amount: 95, categoryId: "mercado", description: "Padaria", date: d(1) },
    { id: uid(), type: "expense", amount: 320, categoryId: "lazer", description: "Show", date: d(0) },
  ];
};

export const useFinance = create<FinanceState>()(
  persist(
    (set) => ({
      income: 7500,
      split: { fixed: 50, lifestyle: 30, invest: 20 },
      categories: seedCategories,
      transactions: seedTx(),
      investments: 12450,
      alertsDismissed: {},

      setIncome: (n) => set({ income: n }),
      setSplit: (split) => set({ split }),
      addCategory: (c) =>
        set((s) => ({ categories: [...s.categories, { ...c, id: uid() }] })),
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          transactions: s.transactions.filter((t) => t.categoryId !== id),
        })),
      addTransaction: (t) =>
        set((s) => ({ transactions: [{ ...t, id: uid() }, ...s.transactions] })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      setInvestments: (n) => set({ investments: n }),
      dismissAlert: (key) =>
        set((s) => ({ alertsDismissed: { ...s.alertsDismissed, [key]: true } })),
    }),
    { name: "pierre-finance" }
  )
);

// Selectors
export const monthlyExpensesByCategory = (
  txs: Transaction[],
  categoryId: string
) => {
  const now = new Date();
  return txs
    .filter(
      (t) =>
        t.type === "expense" &&
        t.categoryId === categoryId &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
    )
    .reduce((sum, t) => sum + t.amount, 0);
};

export const totalSpentToday = (txs: Transaction[]) => {
  const today = new Date().toDateString();
  return txs
    .filter((t) => t.type === "expense" && new Date(t.date).toDateString() === today)
    .reduce((s, t) => s + t.amount, 0);
};

export const monthlyTotal = (txs: Transaction[], type: "income" | "expense") => {
  const now = new Date();
  return txs
    .filter(
      (t) =>
        t.type === type &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
    )
    .reduce((s, t) => s + t.amount, 0);
};
