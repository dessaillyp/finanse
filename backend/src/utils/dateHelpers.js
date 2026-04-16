/**
 * Date utilities for monthly summaries and range queries.
 */

/**
 * Returns { start, end } Date objects for a given year/month.
 * Defaults to the current month if no params provided.
 */
const getMonthRange = (year, month) => {
  const now = new Date();
  const y = parseInt(year) || now.getFullYear();
  const m = parseInt(month) || now.getMonth() + 1; // 1-based

  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end   = new Date(y, m,     0, 23, 59, 59, 999); // last day of month

  return { start, end };
};

/**
 * Returns a human-readable label: "April 2026"
 */
const monthLabel = (year, month) => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

module.exports = { getMonthRange, monthLabel };
