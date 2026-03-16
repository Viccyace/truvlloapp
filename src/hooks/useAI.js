/**
 * useAI.js  —  src/hooks/useAI.js
 *
 * Wraps all six Supabase Edge Function AI calls with per-function
 * loading and error state.
 *
 * Usage:
 *   const { getSpendingInsight, loading, errors } = useAI();
 */

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

async function callEdgeFunction(name, body) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const { data, error } = await supabase.functions.invoke(name, {
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (error) throw new Error(error.message);
  return data;
}

export function useAI() {
  const [loading, setLoading] = useState({});
  const [errors,  setErrors]  = useState({});

  const call = useCallback(async (fnName, body) => {
    setLoading(l => ({ ...l, [fnName]: true  }));
    setErrors (e => ({ ...e, [fnName]: null  }));
    try {
      return await callEdgeFunction(fnName, body);
    } catch (err) {
      setErrors(e => ({ ...e, [fnName]: err.message }));
      return null;
    } finally {
      setLoading(l => ({ ...l, [fnName]: false }));
    }
  }, []);

  return {
    loading,
    errors,

    /** 1. Plain-English breakdown of spending patterns */
    getSpendingInsight: (expenses, budget, currency) =>
      call("ai-spending-analyst", { expenses, budget, currency }),

    /** 2. One specific actionable savings tip */
    getSavingsTip: (expenses, budget, currency) =>
      call("ai-savings-coach", { expenses, budget, currency }),

    /** 3. Parse "spent 4500 on lunch" → structured expense */
    parseExpense: (text, currency) =>
      call("ai-nl-entry", { text, currency }),

    /** 4. Suggest category from merchant/description text */
    suggestCategory: (description) =>
      call("ai-smart-categorise", { description }),

    /** 5. Suggest realistic budget from income + goal */
    getBudgetAdvice: (income, goal, currency, dependents = 0) =>
      call("ai-budget-advisor", { income, goal, currency, dependents }),

    /** 6. Explain overspend and suggest specific cuts */
    explainOverspend: (expenses, budget, expectedSpend, currency) =>
      call("ai-overspend-explainer", { expenses, budget, expectedSpend, currency }),
  };
}

// ─── Wiring examples ──────────────────────────────────────────────────────────

/*
// Dashboard.jsx — load insights when budget data is ready
import { useAI } from "../hooks/useAI";
import { useBudget } from "../providers/BudgetProvider";

const { getSpendingInsight, getSavingsTip, explainOverspend, loading } = useAI();
const { expenses, activeBudget, currency, paceStatus, expectedSpend } = useBudget();

useEffect(() => {
  if (!activeBudget || !expenses.length) return;

  getSpendingInsight(expenses, activeBudget, currency)
    .then(res => res?.insight && setAnalystText(res.insight));

  getSavingsTip(expenses, activeBudget, currency)
    .then(res => res?.tip && setCoachText(res.tip));

  if (paceStatus.key === "over_budget") {
    explainOverspend(expenses, activeBudget, expectedSpend, currency)
      .then(res => res && setOverspendData(res));
  }
}, [activeBudget?.id, expenses.length]);

// Dashboard.jsx — NL entry
const { parseExpense } = useAI();

const handleNLSubmit = async (text) => {
  const parsed = await parseExpense(text, currency);
  if (parsed?.amount > 0) setParsedExpense(parsed); // show confirm card
};

// ExpenseModal.jsx — auto-categorise on description blur
const { suggestCategory } = useAI();

const handleDescriptionBlur = async (desc) => {
  if (desc.length < 3) return;
  const res = await suggestCategory(desc);
  if (res?.confidence > 0.7) setCat(res.category);
};
*/
