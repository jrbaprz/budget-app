import type { Transaction, CategoryId } from './types.js';

export interface MonthlySummary {
  month: string; // YYYY-MM
  income: number;
  expenses: number; // absolute value sum of negatives
  net: number; // income - expenses
  byCategory: Record<string, number>; // categoryId -> total (negative values for expenses)
}

export function monthFromDate(date: string): string {
  // Assumes ISO format YYYY-MM-DD
  return date.slice(0, 7);
}

export function computeMonthlySummary(
  transactions: Transaction[],
  month: string
): MonthlySummary {
  const inMonth = transactions.filter((t) => monthFromDate(t.date) === month);

  let income = 0;
  let expenses = 0;
  const byCategory: Record<CategoryId, number> = {} as Record<CategoryId, number>;

  for (const t of inMonth) {
    if (t.amount >= 0) {
      income += t.amount;
    } else {
      expenses += Math.abs(t.amount);
    }
    if (t.categoryId) {
      byCategory[t.categoryId] = (byCategory[t.categoryId] ?? 0) + t.amount;
    }
  }

  return {
    month,
    income,
    expenses,
    net: income - expenses,
    byCategory
  };
}
