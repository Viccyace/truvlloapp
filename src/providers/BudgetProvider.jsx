/* eslint-disable react-refresh/only-export-components */
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
import { TRIAL_DAYS } from "../lib/config";
import { useAuth } from "./AuthProvider";

const BudgetContext = createContext(null);

// ── In-memory cache — stops hammering DB on tab focus/refocus ─────────────────
// Each user gets their own cache keyed by userId
// TTL: 60 seconds — stale data after that triggers a background refresh
const CACHE_TTL_MS = 60_000;
const LS_TTL_MS = 24 * 60 * 60000; // 24 hours — cache survives a full day
const _cache = new Map(); // userId → { data, timestamp } — in-memory
const LS_KEY = (uid) => `truvllo_budget_cache_${uid}`;

function getCached(userId) {
  // 1. Try in-memory first (fastest)
  const mem = _cache.get(userId);
  if (mem && Date.now() - mem.timestamp <= CACHE_TTL_MS) return mem.data;
  // 2. Fall back to localStorage (survives refresh)
  try {
    const raw = localStorage.getItem(LS_KEY(userId));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > LS_TTL_MS) {
      localStorage.removeItem(LS_KEY(userId));
      return null;
    }
    // Re-hydrate memory cache
    _cache.set(userId, entry);
    return entry.data;
  } catch {
    return null;
  }
}

function setCached(userId, data) {
  const entry = { data, timestamp: Date.now() };
  _cache.set(userId, entry);
  // Persist to localStorage so values survive hard refresh
  try {
    localStorage.setItem(LS_KEY(userId), JSON.stringify(entry));
  } catch {}
}

function invalidateCache(userId) {
  _cache.delete(userId);
  try {
    localStorage.removeItem(LS_KEY(userId));
  } catch {}
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used inside <BudgetProvider>");
  return ctx;
}

const CURRENCY_SYMBOLS = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  KES: "KSh",
  GHS: "₵",
};

export function formatCurrency(amount, currency = "NGN") {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  const num = Math.abs(amount ?? 0);
  const formatted =
    num >= 1_000_000
      ? `${(num / 1_000_000).toFixed(1)}M`
      : num >= 1_000
        ? num.toLocaleString("en-NG")
        : num.toFixed(0);
  return `${sym}${formatted}`;
}

export function calcExpectedSpend(budget) {
  if (!budget) return 0;
  const start = new Date(budget.start_date);
  const end = new Date(budget.end_date);
  const now = new Date();
  const totalDays = Math.max(1, (end - start) / 86_400_000);
  const elapsedDays = Math.max(
    0,
    Math.min(totalDays, (now - start) / 86_400_000),
  );
  return Math.round(
    (budget.total_amount ?? budget.amount ?? 0) * (elapsedDays / totalDays),
  );
}

export function calcSafeToSpend(budget, totalSpent) {
  if (!budget) return 0;
  const end = new Date(budget.end_date);
  const now = new Date();
  const amount = budget.total_amount ?? budget.amount ?? 0;
  const remaining = Math.max(0, amount - totalSpent);
  const daysLeft = Math.max(1, Math.ceil((end - now) / 86_400_000));
  return Math.round(remaining / daysLeft);
}

export function calcPaceStatus(totalSpent, expectedSpend, budget) {
  if (!budget || expectedSpend === 0) {
    return {
      key: "on_track",
      label: "On Track",
      color: "#52B788",
      bg: "rgba(82,183,136,0.12)",
    };
  }
  const ratio = totalSpent / expectedSpend;
  if (ratio <= 0.9)
    return {
      key: "ahead",
      label: "Ahead of Plan",
      color: "#52B788",
      bg: "rgba(82,183,136,0.12)",
      desc: "You're spending less than expected. Great discipline!",
    };
  if (ratio <= 1.05)
    return {
      key: "on_track",
      label: "On Track",
      color: "#52B788",
      bg: "rgba(82,183,136,0.12)",
      desc: "Spending is right in line with your budget pace.",
    };
  if (ratio <= 1.2)
    return {
      key: "slightly_over",
      label: "Slightly Over Pace",
      color: "#F0C040",
      bg: "rgba(240,192,64,0.12)",
      desc: "A little above pace — pull back slightly to stay on track.",
    };
  return {
    key: "over_budget",
    label: "Over Budget Risk",
    color: "#FF8A80",
    bg: "rgba(255,138,128,0.12)",
    desc: "You're spending significantly faster than your budget allows.",
  };
}

export function calcCategoryProgress(caps, expenses) {
  return caps.map((cap) => {
    const spent = expenses
      .filter((e) => e.category === cap.category)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      ...cap,
      spent,
      remaining: Math.max(0, cap.limit - spent),
      pct:
        cap.limit > 0
          ? Math.min(100, Math.round((spent / cap.limit) * 100))
          : 0,
      over: spent > cap.limit,
    };
  });
}

// ── Helper: calculate end_date from period + start_date ───────────────────────
function calcEndDate(period, startDate) {
  const s = new Date(startDate);
  if (period === "weekly") {
    s.setDate(s.getDate() + 7);
  }
  if (period === "monthly") {
    s.setMonth(s.getMonth() + 1);
  }
  if (period === "annual") {
    s.setFullYear(s.getFullYear() + 1);
  }
  return s.toISOString().split("T")[0];
}

// ── Auto-notification checker ─────────────────────────────────────────────────
async function checkAndInsertNotifications(supabase, userId) {
  // Get fresh derived data
  const [budgetsRes, expensesRes, capsRes] = await Promise.all([
    supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single(),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase.from("category_caps").select("*").eq("user_id", userId),
  ]);

  const budget = budgetsRes.data;
  const expenses = expensesRes.data ?? [];
  const caps = capsRes.data ?? [];

  if (!budget || !expenses.length) return;

  const totalBudget = Number(budget.total_amount || budget.amount || 0);
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const pctSpent =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const notifications = [];

  // 1. Budget pace alert — over 80% spent
  if (pctSpent >= 80 && pctSpent < 100) {
    notifications.push({
      user_id: userId,
      type: "pace_alert",
      title: "Budget running low",
      body: `You've used ${pctSpent}% of your budget. Slow down to stay on track.`,
    });
  }

  // 2. Budget exceeded
  if (pctSpent >= 100) {
    notifications.push({
      user_id: userId,
      type: "pace_alert",
      title: "Budget exceeded",
      body: `You've gone over your budget by ${Math.round(totalSpent - totalBudget).toLocaleString()}.`,
    });
  }

  // 3. Category cap alerts
  for (const cap of caps) {
    const capSpent = expenses
      .filter((e) => e.category === cap.category)
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const capPct = cap.limit > 0 ? Math.round((capSpent / cap.limit) * 100) : 0;

    if (capPct >= 90 && capPct < 100) {
      notifications.push({
        user_id: userId,
        type: "cap_alert",
        title: `${cap.category} cap almost reached`,
        body: `${capSpent.toLocaleString()} of ${cap.limit.toLocaleString()} ${cap.category} budget used.`,
      });
    } else if (capPct >= 100) {
      notifications.push({
        user_id: userId,
        type: "cap_alert",
        title: `${cap.category} cap exceeded`,
        body: `You're over your ${cap.category} cap by ${Math.round(capSpent - cap.limit).toLocaleString()}.`,
      });
    }
  }

  if (!notifications.length) return;

  // De-duplicate — don't insert if same type+title exists in last 24hrs
  const since = new Date(Date.now() - 86_400_000).toISOString();
  for (const notif of notifications) {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", notif.type)
      .eq("title", notif.title)
      .gte("created_at", since);

    if ((count ?? 0) === 0) {
      await supabase.from("notifications").insert(notif);
      // Also send WhatsApp alert if user has it connected
      fetch(`${supabase.supabaseUrl}/functions/v1/whatsapp-send-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          type: notif.type,
          title: notif.title,
          body: notif.body,
        }),
      }).catch(() => {}); // non-blocking, silent fail
    }
  }
}

export function BudgetProvider({ children }) {
  const { user, isLoggedIn, currency, signOut } = useAuth();

  const [activeBudget, setActiveBudget] = useState(null);
  // Seed initial state from localStorage cache — avoids zeros on refresh
  const _seedCache = (() => {
    try {
      // Try truvllo_auth first, then Supabase's own storage key
      const auth1 = JSON.parse(localStorage.getItem("truvllo_auth") || "{}");
      const auth2 = JSON.parse(
        localStorage.getItem("sb-ztmljabxhzfmovjsfqbk-auth-token") || "{}",
      );
      const uid = auth1?.user?.id || auth2?.user?.id;
      if (uid) return getCached(uid);
    } catch {}
    return null;
  })();

  const [allBudgets, setAllBudgets] = useState(_seedCache?.budgets ?? []);
  const [expenses, setExpenses] = useState(_seedCache?.expenses ?? []);
  const [categoryCaps, setCategoryCaps] = useState(_seedCache?.caps ?? []);
  const [recurring, setRecurring] = useState(_seedCache?.recurring ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedUid, setLastFetchedUid] = useState(null);

  const realtimeRef = useRef(null);

  const fetchAll = useCallback(async (userId, { force = false } = {}) => {
    if (!userId) return;

    // ── Serve from cache if fresh (skip DB hit) ───────────────────────────
    if (!force) {
      const cached = getCached(userId);
      if (cached) {
        setAllBudgets(cached.budgets);
        setActiveBudget(
          cached.budgets.find((b) => b.is_active) ?? cached.budgets[0] ?? null,
        );
        setExpenses(cached.expenses);
        setCategoryCaps(cached.caps);
        setRecurring(cached.recurring);
        setLastFetchedUid(userId);
        setLoading(false);
        return; // ← no DB hit
      }
    }

    setLoading(true);
    setError(null);

    try {
      const [budgetsRes, expensesRes, capsRes, recurringRes] =
        await Promise.all([
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
          supabase.from("category_caps").select("*").eq("user_id", userId),
          supabase.from("recurring_expenses").select("*").eq("user_id", userId),
        ]);

      if (budgetsRes.error) throw budgetsRes.error;
      if (expensesRes.error) throw expensesRes.error;

      const budgets = budgetsRes.data ?? [];
      const exps = expensesRes.data ?? [];
      const caps = capsRes.data ?? [];
      const rec = recurringRes.data ?? [];

      // ── Write to cache ────────────────────────────────────────────────────
      setCached(userId, { budgets, expenses: exps, caps, recurring: rec });

      setAllBudgets(budgets);
      setActiveBudget(budgets.find((b) => b.is_active) ?? budgets[0] ?? null);
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

  useEffect(() => {
    if (isLoggedIn && user?.id && user.id !== lastFetchedUid) {
      // Check if cache has expired — if so, sign out to avoid showing zeros
      const cached = getCached(user.id);
      if (!cached && lastFetchedUid === user.id) {
        // Cache expired for a user we already loaded — sign out cleanly
        signOut();
        window.location.replace("/auth");
        return;
      }
      fetchAll(user.id);
    }
    if (!isLoggedIn) {
      setActiveBudget(null);
      setAllBudgets([]);
      setExpenses([]);
      setCategoryCaps([]);
      setRecurring([]);
      setLastFetchedUid(null);
    }
  }, [isLoggedIn, user?.id, lastFetchedUid, fetchAll, signOut]);

  useEffect(() => {
    if (!user?.id) return;
    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);

    const channel = supabase
      .channel(`expenses:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT")
            setExpenses((prev) => [payload.new, ...prev]);
          if (payload.eventType === "UPDATE")
            setExpenses((prev) =>
              prev.map((e) => (e.id === payload.new.id ? payload.new : e)),
            );
          if (payload.eventType === "DELETE")
            setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id));
        },
      )
      .subscribe();

    realtimeRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // ── Expense CRUD ────────────────────────────────────────────────────────────
  const addExpense = useCallback(
    async (expenseData) => {
      if (!user?.id || !activeBudget?.id) return { error: "No active budget" };
      const newExpense = {
        ...expenseData,
        user_id: user.id,
        budget_id: activeBudget.id,
        date: expenseData.date ?? new Date().toISOString().split("T")[0],
      };
      const tempId = `temp_${Date.now()}`;
      const optimistic = { ...newExpense, id: tempId };
      setExpenses((prev) => [optimistic, ...prev]);

      const { data, error } = await supabase
        .from("expenses")
        .insert(newExpense)
        .select()
        .single();
      if (error) {
        setExpenses((prev) => prev.filter((e) => e.id !== tempId));
        return { error };
      }
      invalidateCache(user.id);
      setExpenses((prev) => prev.map((e) => (e.id === tempId ? data : e)));
      // Check notifications after adding expense (non-blocking)
      checkAndInsertNotifications(supabase, user.id).catch(() => {});
      return { data };
    },
    [user?.id, activeBudget?.id],
  );

  const updateExpense = useCallback(
    async (id, updates) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );
      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) {
        fetchAll(user.id);
        return { error };
      }
      setExpenses((prev) => prev.map((e) => (e.id === id ? data : e)));
      checkAndInsertNotifications(supabase, user.id).catch(console.error);
      return { data };
    },
    [user?.id, fetchAll],
  );

  const deleteExpense = useCallback(
    async (id) => {
      const snapshot = expenses.find((e) => e.id === id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        if (snapshot) setExpenses((prev) => [snapshot, ...prev]);
        return { error };
      }
      invalidateCache(user.id);
      checkAndInsertNotifications(supabase, user.id).catch(console.error);
      return { error: null };
    },
    [user?.id, expenses],
  );

  // ── Budget CRUD ─────────────────────────────────────────────────────────────
  // BUG FIX 1: Use correct column names (total_amount, timeframe) matching DB schema
  // BUG FIX 2: Auto-calculate end_date for weekly/monthly periods
  // BUG FIX 3: Replace undefined setActiveBudgetState with setActiveBudget
  const createBudget = useCallback(
    async (budgetData) => {
      if (!user?.id) return { error: "Not logged in" };

      const period = budgetData.period || budgetData.timeframe || "monthly";
      const start_date =
        budgetData.start_date ||
        budgetData.start ||
        new Date().toISOString().split("T")[0];

      // Auto-calculate end_date if not provided (weekly/monthly periods)
      let end_date = budgetData.end_date || budgetData.end || null;
      if (!end_date || end_date === "") {
        end_date = calcEndDate(period, start_date);
      }

      const payload = {
        user_id: user.id,
        name: budgetData.name,
        total_amount: Number(budgetData.amount || budgetData.total_amount || 0),
        timeframe: period,
        start_date,
        end_date,
        is_active: budgetData.is_active ?? true,
      };

      // Deactivate all existing active budgets before creating new one
      await supabase
        .from("budgets")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data, error } = await supabase
        .from("budgets")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Create budget error:", error);
        throw new Error(error.message);
      }

      setAllBudgets((prev) => [data, ...prev]);

      // BUG FIX 3: was calling undefined setActiveBudgetState — now uses setActiveBudget
      if (data?.is_active) {
        setActiveBudget(data);
      }

      return { data };
    },
    [user?.id],
  );

  const setActiveB = useCallback(
    async (budgetId) => {
      if (!user?.id) return;
      await supabase
        .from("budgets")
        .update({ is_active: false })
        .eq("user_id", user.id);
      const { data, error } = await supabase
        .from("budgets")
        .update({ is_active: true })
        .eq("id", budgetId)
        .select()
        .single();
      if (!error && data) {
        setAllBudgets((prev) =>
          prev.map((b) => ({ ...b, is_active: b.id === budgetId })),
        );
        setActiveBudget(data);
      }
    },
    [user?.id],
  );

  // ── Category caps CRUD ──────────────────────────────────────────────────────
  const upsertCategoryCap = useCallback(
    async ({ category, limit: capLimit }) => {
      if (!user?.id || !activeBudget?.id) return { error: "No active budget" };
      const payload = {
        user_id: user.id,
        budget_id: activeBudget.id,
        category,
        limit: capLimit,
      };
      const { data, error } = await supabase
        .from("category_caps")
        .upsert(payload, { onConflict: "user_id,budget_id,category" })
        .select()
        .single();
      if (!error && data) {
        setCategoryCaps((prev) => {
          const exists = prev.find((c) => c.category === category);
          return exists
            ? prev.map((c) => (c.category === category ? data : c))
            : [...prev, data];
        });
      }
      return { data, error };
    },
    [user?.id, activeBudget?.id],
  );

  const deleteCategoryCap = useCallback(
    async (category) => {
      await supabase
        .from("category_caps")
        .delete()
        .eq("user_id", user.id)
        .eq("budget_id", activeBudget?.id)
        .eq("category", category);
      setCategoryCaps((prev) => prev.filter((c) => c.category !== category));
    },
    [user?.id, activeBudget?.id],
  );

  // ── Recurring CRUD ──────────────────────────────────────────────────────────
  const addRecurring = useCallback(
    async (recurringData) => {
      const { data, error } = await supabase
        .from("recurring_expenses")
        .insert({ ...recurringData, user_id: user.id })
        .select()
        .single();
      if (!error && data) setRecurring((prev) => [...prev, data]);
      return { data, error };
    },
    [user?.id],
  );

  const deleteRecurring = useCallback(
    async (id) => {
      await supabase
        .from("recurring_expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      setRecurring((prev) => prev.filter((r) => r.id !== id));
    },
    [user?.id],
  );

  // ── CSV export ──────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = ["Date", "Description", "Category", "Amount", "Notes"];
    const rows = expenses.map((e) => [
      e.date,
      `"${(e.description ?? "").replace(/"/g, '""')}"`,
      e.category ?? "",
      e.amount ?? 0,
      `"${(e.notes ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truvllo-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [expenses]);

  // ── Derived calculations ────────────────────────────────────────────────────
  const derived = useMemo(() => {
    const budgetExpenses = activeBudget
      ? expenses.filter((e) => e.budget_id === activeBudget.id || !e.budget_id)
      : expenses;

    const totalSpent = budgetExpenses.reduce(
      (sum, e) => sum + (e.amount ?? 0),
      0,
    );
    const totalBudget = activeBudget?.total_amount ?? activeBudget?.amount ?? 0;
    const remaining = Math.max(0, totalBudget - totalSpent);
    const expectedSpend = calcExpectedSpend(activeBudget);
    const safeToSpend = calcSafeToSpend(activeBudget, totalSpent);
    const paceStatus = calcPaceStatus(totalSpent, expectedSpend, activeBudget);

    const now = new Date();
    const start = activeBudget ? new Date(activeBudget.start_date) : now;
    const end = activeBudget ? new Date(activeBudget.end_date) : now;
    const totalDays = Math.max(1, Math.round((end - start) / 86_400_000));
    const currentDay = Math.max(
      1,
      Math.min(totalDays, Math.round((now - start) / 86_400_000) + 1),
    );
    const daysLeft = Math.max(0, Math.ceil((end - now) / 86_400_000));
    const pctElapsed = Math.round((currentDay / totalDays) * 100);
    const pctSpent =
      totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const categoryTotals = budgetExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});

    const categoryProgress = calcCategoryProgress(categoryCaps, budgetExpenses);
    const recentExpenses = [...budgetExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
    const spendByDay = last30.map((date) => ({
      date,
      amount: budgetExpenses
        .filter((e) => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0),
    }));

    // Calculate spent per budget for allBudgets display
    const budgetSpentMap = expenses.reduce((acc, e) => {
      const bid = e.budget_id || activeBudget?.id;
      if (bid) acc[bid] = (acc[bid] ?? 0) + (e.amount ?? 0);
      return acc;
    }, {});

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
      budgetSpentMap,
      hasExpenses: budgetExpenses.length > 0,
    };
  }, [activeBudget, expenses, categoryCaps]);

  const value = {
    activeBudget,
    allBudgets,
    expenses,
    categoryCaps,
    recurring,
    loading,
    error,
    ...derived,
    currency,
    formatCurrency: (amount) => formatCurrency(amount, currency),
    sym: CURRENCY_SYMBOLS[currency] ?? "₦",
    fetchAll: () => fetchAll(user?.id),
    invalidateCache: () => {
      invalidateCache(user?.id);
      fetchAll(user?.id);
    },
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

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}
