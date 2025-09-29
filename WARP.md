# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Personal budgeting app starter focused on: tracking income/expenses, categorizing transactions, monthly summaries, and CSV import/export.

Stack and tooling
- Runtime: Node.js (TypeScript)
- Package manager: npm
- Build: TypeScript compiler (tsc)
- Test: Vitest
- Lint/format: ESLint + Prettier

Prerequisites
- Node.js >= 18 (macOS):
  - Homebrew: brew install node
  - or nvm: nvm install --lts && nvm use --lts

Commands
- Build: npm run build
- Dev (run TypeScript directly): npm run dev
- Start (run compiled CLI): npm start
- Test (all): npm test
- Test (watch): npm run test:watch
- Test (single by name): npm test -- -t "pattern"
- Test (single by file): npm test -- tests/domain/budget.test.ts
- Lint: npm run lint
- Lint (fix): npm run lint:fix
- Format (check): npm run format
- Format (write): npm run format:fix

High-level architecture
- src/domain: core types and logic
  - types.ts: Account/Category/Transaction definitions
  - budget.ts: computeMonthlySummary and helpers
- src/app: composition/entrypoints
  - cli.ts: simple CLI demo using domain logic
- tests: unit tests (Vitest); mirrors src structure

Important files
- package.json: scripts for build/dev/test/lint/format
- tsconfig.json: NodeNext ESM, ES2022 target, dist/ output
- .eslintrc.cjs and .prettierrc: lint/format configuration
- vitest.config.ts: test runner configuration

Notes
- If/when you add ingestion (CSV), reporting extensions, or persistence (file/db), prefer module folders under src/ matching domain, ingestion, reporting, persistence, and wire them from src/app.
