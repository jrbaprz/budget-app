import { computeMonthlySummary } from '../domain/budget.js';
import type { Transaction } from '../domain/types.js';

// Sample data
const sampleTransactions: Transaction[] = [
  { id: '1', accountId: 'acc1', categoryId: 'cat1', amount: 2000, date: '2025-09-15', description: 'Salary' },
  { id: '2', accountId: 'acc1', categoryId: 'cat2', amount: -500, date: '2025-09-16', description: 'Rent' },
  { id: '3', accountId: 'acc1', categoryId: 'cat3', amount: -50, date: '2025-09-17', description: 'Groceries' }
];

function main() {
  console.log('Budget App - Personal Finance Tracker');
  console.log('=====================================');

  const summary = computeMonthlySummary(sampleTransactions, '2025-09');
  console.log('September 2025 Summary:', summary);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}