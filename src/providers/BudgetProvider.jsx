/* eslint-disable react-refresh/only-export-components */
/**
 * BudgetProvider.jsx  —  src/providers/BudgetProvider.jsx
 *
 * Key behaviours (per spec):
 *  1. Fetches ALL budget data once on login — active budget, all expenses,
 *     category caps, recurring expenses — in a single batched load.
 *  2. Individual pages NEVER fetch data themselves. They only read from context.
 *     This eliminates all loading flashes on navigation.
 *  3. Exposes all core budget calculations:
 *     - expectedSpend    how much should have been spent by today
 *     - safeToSpend      daily spending allowance going forward
 *     - paceStatus       ahead | on_track | slightly_over | over_budget
 *  4. Optimistic updates for expense add/edit/delete so the UI feels instant.
 *  5. Realtime subscription via Supabase so multiple devices stay in sync.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthProvider";

// ─── Context ──────────────────────────────────────────────────────────────────
const BudgetContext = createContext(null);

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used inside <BudgetProvider>");
  return ctx;
}

// ─── Currency formatting ──────────────────────────────────────────────────────
const CURRENCY_SYMBOLS = {
  NGN: "₦", USD: "$", GBP: "£", EUR: "€", KES: "KSh", GHS: "₵",
};

export function formatCurrency(amount, currency = "NGN") {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  const num = Math.abs(amount ?? 0);
  const formatted = num >= 1_000_000
    ? `${(num / 1_000_000).toFixed(1)}M`
    : num >= 1_000
    ? num.toLocaleString("en-NG")
    : num.toFixed(0);
  return `${sym}${formatted}`;
}

// ─── Budget calculations ──────────────────────────────────────────────────────
/**
 * expectedSpend
 * How much the user *should* have spent by today based on the fraction
 * of the budget period that has elapsed.
 */
export function calcExpectedSpend(budget) {
  if (!budget) return 0;
  const start = new Date(budget.start_date);
  const end   = new Date(budget.end_date);
  const now   = new Date();

  const totalDays   = Math.max(1, (end - start) / 86_400_000);
  const elapsedDays = Math.max(0, Math.min(totalDays, (now - start) / 86_400_000));
  const fraction    = elapsedDays / totalDays;

  return Math.round(budget.amount * fraction);
}

/**
 * safeToSpend
 * Remaining budget divided by days remaining = daily spending allowance.
 */
export function calcSafeToSpend(budget, totalSpent) {
  if (!budget) return 0;
  const end       = new Date(budget.end_date);
  const now       = new Date();
  const remaining = Math.max(0, budget.amount - totalSpent);
  const daysLeft  = Math.max(1, Math.ceil((end - now) / 86_400_000));
  return Math.round(remaining / daysLeft);
}

/**
 * paceStatus
 * Compares actual spending to expected spending.
 * Returns one of four states with label, color, and description.
 */
export function calcPaceStatus(totalSpent, expectedSpend, budget) {
  if (!budget || expectedSpend === 0) {
    return { key: "on_track", label: "On Track", color: "#52B788", bg: "rgba(82,183,136,0.12)" };
  }

  const ratio = totalSpent / expectedSpend;

  if (ratio <= 0.9) {
    return {
      key: "ahead",
      label: "Ahead of Plan",
      color: "#52B788",
      bg: "rgba(82,183,136,0.12)",
      desc: "You're spending less than expected. Great discipline!",
    };
  }
  if (ratio <= 1.05) {
    return {
      key: "on_track",
      label: "On Track",
      color: "#52B788",
      bg: "rgba(82,183,136,0.12)",
      desc: "Spending is right in line with your budget pace.",
    };
  }
  if (ratio <= 1.2) {
    return {
      key: "slightly_over",
      label: "Slightly Over Pace",
      color: "#F0C040",
      bg: "rgba(240,192,64,0.12)",
      desc: "A little above pace — pull back slightly to stay on track.",
    };
  }
  return {
    key: "over_budget",
    label: "Over Budget Risk",
    color: "#FF8A80",
    bg: "rgba(255,138,128,0.12)",
    desc: "You're spending significantly faster than your budget allows.",
  };
}

/**
 * categoryProgress
 * For each category cap, calculate how much has been spent and the % used.
 */
export function calcCategoryProgress(caps, expenses) {
  return caps.map(cap => {
    const spent = expenses
      .filter(e => e.category === cap.category)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      ...cap,
      spent,
      remaining: Math.max(0, cap.limit - spent),
      pct: cap.limit > 0 ? Math.min(100, Math.round((spent / cap.limit) * 100)) : 0,
      over: spent > cap.limit,
    };
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function BudgetProvider({ children }) {
  const { user, isLoggedIn, currency } = useAuth();

  // ── Core state ─────────────────────────────────────────────────────────────
  const [activeBudget,   setActiveBudget]   = useState(null);
  const [allBudgets,     setAllBudgets]     = useState([]);
  const [expenses,       setExpenses]       = useState([]);
  const [categoryCaps,   setCategoryCaps]   = useState([]);
  const [recurring,      setRecurring]      = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [lastFetchedUid, setLastFetchedUid] = useState(null);

  const realtimeRef = useRef(null);

  // ── Fetch all budget data in one shot ──────────────────────────────────────
  const fetchAll = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      // Parallel fetch — all four tables at once
      const [budgetsRes, expensesRes, capsRes, recurringRes] = await Promise.all([
        supabase
          .from("budgets")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),

        supabase
          .from("expenses")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false }),

        supabase
          .from("category_caps")
          .select("*")
          .eq("user_id", userId),

        supabase
          .from("recurring_expenses")
          .select("*")
          .eq("user_id", userId),
      ]);

      if (budgetsRes.error)   throw budgetsRes.error;
      if (expensesRes.error)  throw expensesRes.error;
      // caps and recurring are premium — ignore errors gracefully
      const budgets   = budgetsRes.data   ?? [];
      const exps      = expensesRes.data  ?? [];
      const caps      = capsRes.data      ?? [];
      const rec       = recurringRes.data ?? [];

      setAllBudgets(budgets);
      setActiveBudget(budgets.find(b => b.is_active) ?? budgets[0] ?? null);
      setExpenses(exps);
      setCategoryCaps(caps);
      setRecurring(rec);
      setLastFetchedUid(userId);
    } catch (err) {
      console.error("[BudgetProvider] fetchAll error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch on login / user change ───────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && user?.id && user.id !== lastFetchedUid) {
      fetchAll(user.id);
    }
    if (!isLoggedIn) {
      // Clear everything on logout
      setActiveBudget(null);
      setAllBudgets([]);
      setExpenses([]);
      setCategoryCaps([]);
      setRecurring([]);
      setLastFetchedUid(null);
    }
  }, [isLoggedIn, user?.id, lastFetchedUid, fetchAll]);

  // ── Realtime subscription for expenses ────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    // Unsubscribe from any previous channel
    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);

    const channel = supabase
      .channel(`expenses:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setExpenses(prev => [payload.new, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setExpenses(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
          }
          if (payload.eventType === "DELETE") {
            setExpenses(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    realtimeRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // ── Expense CRUD ───────────────────────────────────────────────────────────
  const addExpense = useCallback(async (expenseData) => {
    if (!user?.id || !activeBudget?.id) return { error: "No active budget" };

    const newExpense = {
      ...expenseData,
      user_id:   user.id,
      budget_id: activeBudget.id,
      date:      expenseData.date ?? new Date().toISOString().split("T")[0],
    };

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimistic = { ...newExpense, id: tempId };
    setExpenses(prev => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("expenses")
      .insert(newExpense)
      .select()
      .single();

    if (error) {
      // Rollback
      setExpenses(prev => prev.filter(e => e.id !== tempId));
      return { error };
    }

    // Replace temp with real record
    setExpenses(prev => prev.map(e => e.id === tempId ? data : e));
    return { data };
  }, [user?.id, activeBudget?.id]);

  const updateExpense = useCallback(async (id, updates) => {
    // Optimistic update
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

    const { data, error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      // Rollback — re-fetch
      fetchAll(user.id);
      return { error };
    }

    setExpenses(prev => prev.map(e => e.id === id ? data : e));
    return { data };
  }, [user?.id, fetchAll]);

  const deleteExpense = useCallback(async (id) => {
    // Optimistic update
    const snapshot = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      // Rollback
      if (snapshot) setExpenses(prev => [snapshot, ...prev]);
      return { error };
    }

    return { error: null };
  }, [user?.id, expenses]);

  // ── Budget CRUD ────────────────────────────────────────────────────────────
  const createBudget = useCallback(async (budgetData) => {
    if (!user?.id) return { error: "Not logged in" };

    const { data, error } = await supabase
      .from("budgets")
      .insert({ ...budgetData, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setAllBudgets(prev => [data, ...prev]);
      if (budgetData.is_active) setActiveBudget(data);
    }

    return { data, error };
  }, [user?.id]);

  const setActiveB = useCallback(async (budgetId) => {
    if (!user?.id) return;

    // Deactivate all, activate selected
    await supabase.from("budgets").update({ is_active: false }).eq("user_id", user.id);
    const { data, error } = await supabase
      .from("budgets")
      .update({ is_active: true })
      .eq("id", budgetId)
      .select()
      .single();

    if (!error && data) {
      setAllBudgets(prev => prev.map(b => ({ ...b, is_active: b.id === budgetId })));
      setActiveBudget(data);
    }
  }, [user?.id]);

  // ── Category caps CRUD ─────────────────────────────────────────────────────
  const upsertCategoryCap = useCallback(async ({ category, limit: capLimit }) => {
    if (!user?.id || !activeBudget?.id) return { error: "No active budget" };

    const payload = {
      user_id:   user.id,
      budget_id: activeBudget.id,
      category,
      limit:     capLimit,
    };

    const { data, error } = await supabase
      .from("category_caps")
      .upsert(payload, { onConflict: "user_id,budget_id,category" })
      .select()
      .single();

    if (!error && data) {
      setCategoryCaps(prev => {
        const exists = prev.find(c => c.category === category);
        return exists
          ? prev.map(c => c.category === category ? data : c)
          : [...prev, data];
      });
    }

    return { data, error };
  }, [user?.id, activeBudget?.id]);

  const deleteCategoryCap = useCallback(async (category) => {
    await supabase
      .from("category_caps")
      .delete()
      .eq("user_id", user.id)
      .eq("budget_id", activeBudget?.id)
      .eq("category", category);

    setCategoryCaps(prev => prev.filter(c => c.category !== category));
  }, [user?.id, activeBudget?.id]);

  // ── Recurring expenses CRUD ────────────────────────────────────────────────
  const addRecurring = useCallback(async (recurringData) => {
    const { data, error } = await supabase
      .from("recurring_expenses")
      .insert({ ...recurringData, user_id: user.id })
      .select()
      .single();

    if (!error && data) setRecurring(prev => [...prev, data]);
    return { data, error };
  }, [user?.id]);

  const deleteRecurring = useCallback(async (id) => {
    await supabase
      .from("recurring_expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    setRecurring(prev => prev.filter(r => r.id !== id));
  }, [user?.id]);

  // ── CSV export ─────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = ["Date", "Description", "Category", "Amount", "Notes"];
    const rows = expenses.map(e => [
      e.date,
      `"${(e.description ?? "").replace(/"/g, '""')}"`,
      e.category ?? "",
      e.amount ?? 0,
      `"${(e.notes ?? "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `truvllo-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [expenses]);

  // ── Derived calculations (memoised) ───────────────────────────────────────
  const derived = useMemo(() => {
    const budgetExpenses = activeBudget
      ? expenses.filter(e => e.budget_id === activeBudget.id)
      : expenses;

    const totalSpent    = budgetExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    const totalBudget   = activeBudget?.amount ?? 0;
    const remaining     = Math.max(0, totalBudget - totalSpent);
    const expectedSpend = calcExpectedSpend(activeBudget);
    const safeToSpend   = calcSafeToSpend(activeBudget, totalSpent);
    const paceStatus    = calcPaceStatus(totalSpent, expectedSpend, activeBudget);

    // Days info
    const now      = new Date();
    const start    = activeBudget ? new Date(activeBudget.start_date) : now;
    const end      = activeBudget ? new Date(activeBudget.end_date)   : now;
    const totalDays   = Math.max(1, Math.round((end - start) / 86_400_000));
    const currentDay  = Math.max(1, Math.min(totalDays, Math.round((now - start) / 86_400_000) + 1));
    const daysLeft    = Math.max(0, Math.ceil((end - now) / 86_400_000));
    const pctElapsed  = Math.round((currentDay / totalDays) * 100);
    const pctSpent    = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // Category breakdown
    const categoryTotals = budgetExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});

    // Category cap progress
    const categoryProgress = calcCategoryProgress(categoryCaps, budgetExpenses);

    // Recent expenses (last 5)
    const recentExpenses = [...budgetExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Spend by day (last 30 days for chart)
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
    const spendByDay = last30.map(date => ({
      date,
      amount: budgetExpenses
        .filter(e => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0),
    }));

    return {
      budgetExpenses,
      totalSpent,
      totalBudget,
      remaining,
      expectedSpend,
      safeToSpend,
      paceStatus,
      totalDays,
      currentDay,
      daysLeft,
      pctElapsed,
      pctSpent,
      categoryTotals,
      categoryProgress,
      recentExpenses,
      spendByDay,
      hasExpenses: budgetExpenses.length > 0,
    };
  }, [activeBudget, expenses, categoryCaps]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    // Raw state
    activeBudget,
    allBudgets,
    expenses,
    categoryCaps,
    recurring,
    loading,
    error,

    // Derived (memoised — never triggers re-fetch)
    ...derived,

    // Currency helpers
    currency,
    formatCurrency: (amount) => formatCurrency(amount, currency),
    sym: CURRENCY_SYMBOLS[currency] ?? "₦",

    // Actions
    fetchAll: () => fetchAll(user?.id),
    addExpense,
    updateExpense,
    deleteExpense,
    createBudget,
    setActiveBudget: setActiveB,
    upsertCategoryCap,
    deleteCategoryCap,
    addRecurring,
    deleteRecurring,
    exportCSV,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}


/* ─────────────────────────────────────────────────────────────────────────────
 * Supabase SQL — run in SQL editor
 * ─────────────────────────────────────────────────────────────────────────── *

-- budgets
create table public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  amount      numeric(12,2) not null,
  start_date  date not null,
  end_date    date not null,
  period      text not null default 'monthly',  -- 'weekly' | 'monthly' | 'custom'
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.budgets enable row level security;
create policy "Own budgets" on public.budgets for all using (auth.uid() = user_id);

-- expenses
create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  budget_id   uuid not null references public.budgets(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null,
  category    text not null,
  date        date not null default current_date,
  notes       text,
  is_recurring boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.expenses enable row level security;
create policy "Own expenses" on public.expenses for all using (auth.uid() = user_id);

-- category_caps (premium)
create table public.category_caps (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  budget_id   uuid not null references public.budgets(id) on delete cascade,
  category    text not null,
  "limit"     numeric(12,2) not null,
  unique (user_id, budget_id, category)
);
alter table public.category_caps enable row level security;
create policy "Own caps" on public.category_caps for all using (auth.uid() = user_id);

-- recurring_expenses (premium)
create table public.recurring_expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null,
  category    text not null,
  frequency   text not null,  -- 'daily' | 'weekly' | 'monthly'
  next_date   date,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.recurring_expenses enable row level security;
create policy "Own recurring" on public.recurring_expenses for all using (auth.uid() = user_id);

*/
