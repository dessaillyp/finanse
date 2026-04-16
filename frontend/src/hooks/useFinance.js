/**
 * hooks/useFinance.js
 * Central React hook — fetches summary + lists, exposes create/delete actions.
 * All screens use this; no component calls the API directly.
 */
import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/finance';

const now = new Date();

export function useFinance() {
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [summary,  setSummary]  = useState(null);
  const [income,   setIncome]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, inc, exp] = await Promise.all([
        api.getSummary({ year, month }),
        api.getIncome({ year, month, limit: 50 }),
        api.getExpenses({ year, month, limit: 50 }),
      ]);
      setSummary(s);
      setIncome(inc.records || []);
      setExpenses(exp.records || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const addIncome = async (body) => {
    const result = await api.createIncome(body);
    await fetchAll();
    return result;
  };

  const addExpense = async (body) => {
    const result = await api.createExpense(body);
    await fetchAll();
    return result;
  };

  const removeIncome = async (id) => {
    await api.deleteIncome(id);
    await fetchAll();
  };

  const removeExpense = async (id) => {
    await api.deleteExpense(id);
    await fetchAll();
  };

  return {
    // State
    year, month, setYear, setMonth,
    summary, income, expenses,
    loading, error,
    // Actions
    addIncome, addExpense, removeIncome, removeExpense,
    refresh: fetchAll,
  };
}
