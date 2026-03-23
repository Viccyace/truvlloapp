// src/hooks/useAIUsage.js
// Fetches and caches the user's AI usage counts per feature
// Use this to show "3/10 imports used" in the UI

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

const FEATURES = [
  "bank_import",
  "spending_analyst",
  "savings_coach",
  "nl_entry",
  "budget_advisor",
  "smart_categorise",
];

export function useAIUsage() {
  const { user, profile } = useAuth();
  const [usage, setUsage] = useState({});
  const [limits, setLimits] = useState({});
  const [loading, setLoading] = useState(true);

  const plan = profile?.plan || "free";

  const fetchUsage = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Get plan limits
      const { data: planLimits } = await supabase
        .from("ai_plan_limits")
        .select("*")
        .eq("plan", plan);

      // Get current month usage
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: usageRows } = await supabase
        .from("ai_usage")
        .select("feature, created_at")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString());

      // Build usage map per feature
      const usageMap = {};
      const limitsMap = {};

      for (const feature of FEATURES) {
        const featureRows =
          usageRows?.filter((r) => r.feature === feature) || [];
        const monthlyCount = featureRows.length;
        const dailyCount = featureRows.filter(
          (r) => new Date(r.created_at) >= todayStart,
        ).length;

        const featureLimit = planLimits?.find((l) => l.feature === feature);

        usageMap[feature] = { monthlyCount, dailyCount };
        limitsMap[feature] = {
          dailyLimit: featureLimit?.daily_limit ?? null,
          monthlyLimit: featureLimit?.monthly_limit ?? null,
        };
      }

      setUsage(usageMap);
      setLimits(limitsMap);
    } catch (err) {
      console.error("useAIUsage error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, plan]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  /**
   * Check if a feature is allowed client-side (quick check before API call)
   */
  const isAllowed = useCallback(
    (feature) => {
      const u = usage[feature];
      const l = limits[feature];
      if (!u || !l) return plan !== "free";

      if (l.dailyLimit === 0 || l.monthlyLimit === 0) return false;
      if (l.dailyLimit !== null && u.dailyCount >= l.dailyLimit) return false;
      if (l.monthlyLimit !== null && u.monthlyCount >= l.monthlyLimit)
        return false;
      return true;
    },
    [usage, limits, plan],
  );

  /**
   * Get a human-readable usage string e.g. "3 / 10 this month"
   */
  const getUsageLabel = useCallback(
    (feature) => {
      const u = usage[feature];
      const l = limits[feature];
      if (!u || !l) return null;
      if (l.monthlyLimit !== null)
        return `${u.monthlyCount} / ${l.monthlyLimit} this month`;
      if (l.dailyLimit !== null)
        return `${u.dailyCount} / ${l.dailyLimit} today`;
      return "Unlimited";
    },
    [usage, limits],
  );

  return {
    usage,
    limits,
    loading,
    isAllowed,
    getUsageLabel,
    refresh: fetchUsage,
  };
}
