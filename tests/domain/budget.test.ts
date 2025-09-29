import { describe, it, expect } from 'vitest';
import { computeMonthlySummary, monthFromDate } from '../../src/domain/budget.js';
import type { Transaction } from '../../src/domain/types.js';

describe('budget domain', () => {
  it('extracts month from ISO date', () => {
    expect(monthFromDate('2025-09-17')).toBe('2025-09');
  });

  it('computes monthly summary with income and expenses', () => {
    const txs: Transaction[] = [
      { id: '1', accountId: 'a1', categoryId: 'income', amount: 2500, date: '2025-09-01' },
      { id: '2', accountId: 'a1', categoryId: 'rent', amount: -1200, date: '2025-09-02' },
      { id: '3', accountId: 'a1', categoryId: 'food', amount: -300, date: '2025-09-10' },
      { id: '4', accountId: 'a1', categoryId: 'misc', amount: -50, date: '2025-08-31' }
    ];

    const summary = computeMonthlySummary(txs, '2025-09');
    expect(summary.month).toBe('2025-09');
    expect(summary.income).toBe(2500);
    expect(summary.expenses).toBe(1500);
    expect(summary.net).toBe(1000);
    expect(summary.byCategory['rent']).toBe(-1200);
    expect(summary.byCategory['food']).toBe(-300);
    expect(summary.byCategory['income']).toBe(2500);
    expect(summary.byCategory['misc']).toBeUndefined();
  });
});
