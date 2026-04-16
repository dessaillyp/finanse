/**
 * api/finance.js
 * All API calls for the finance app, one place.
 * Screens import from here — never call fetch() directly in components.
 */
import { get, post, del } from './client';

// ── Summary ───────────────────────────────────────────────────────────────────
export const getSummary = ({ year, month } = {}) =>
  get('/summary', { year, month });

// ── Income ────────────────────────────────────────────────────────────────────
export const getIncome = ({ year, month, source, page, limit } = {}) =>
  get('/income', { year, month, source, page, limit });

export const createIncome = (body) =>
  post('/income', body);

export const deleteIncome = (id) =>
  del(`/income/${id}`);

// ── Expenses ─────────────────────────────────────────────────────────────────
export const getExpenses = ({ year, month, category, page, limit } = {}) =>
  get('/expenses', { year, month, category, page, limit });

export const createExpense = (body) =>
  post('/expenses', body);

export const deleteExpense = (id) =>
  del(`/expenses/${id}`);

export const getCategories = () =>
  get('/expenses/categories');
