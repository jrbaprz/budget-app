export type AccountId = string;
export type CategoryId = string;

export interface Account {
  id: AccountId;
  name: string;
}

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Transaction {
  id: string;
  accountId: AccountId;
  categoryId: CategoryId | null;
  amount: number; // positive for income, negative for expense
  date: string; // ISO date string (YYYY-MM-DD)
  description?: string;
}
