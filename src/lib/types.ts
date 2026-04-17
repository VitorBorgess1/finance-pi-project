export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null; // null for income
  description: string;
  date: string; // ISO
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  budget: number;
}

export interface BudgetSplit {
  fixed: number; // %
  lifestyle: number; // %
  invest: number; // %
}
