// The core fix: single source of truth for loading state
// loading = true ONLY while the initial session check is in progress
// After that, profile updates happen silently without affecting loading

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ─── Cache helpers ─────────────────────────────────────────────────────────────
const PROFILE_KEY = "truvllo_profile";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function readCache() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Handle both new format { data, ts } and old format (plain profile object)
    if (parsed?.data && parsed?.ts) {
      if (Date.now() - parsed.ts > CACHE_TTL) {
        localStorage.removeItem(PROFILE_KEY);
        return null;
      }
      return parsed.data;
    }
    // Old format — plain profile object with id field
    if (parsed?.id) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function clearCache() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    Object.keys(localStorage)
      .filter((k) => k.startsWith("truvllo_budget_cache_"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

const ADMIN_ID = "7ec55e7e-6270-436c-bfc9-323ea8971e7a";

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Seed profile synchronously from cache — no flash on refresh
  const [profile, setProfile] = useState(() => readCache());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until first session check done

  const fetchingRef = useRef(false); // prevents concurrent fetches
  const initialised = useRef(false); // prevents double-init from StrictMode

  // ── Fetch profile from Supabase ──────────────────────────────────────────────
  const fetchProfile = useCallback(async (userId) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[AuthProvider] fetchProfile error:", error.message);
        return;
      }

      if (data) {
        setProfile(data);
        writeCache(data);
      }
      // If data is null — new user, no profile yet. Leave profile as null.
      // ProtectedRoute will send them to onboarding.
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // ── Auth state init ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    // 1. Check existing session immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Use cached profile if available and matches user
        const cached = readCache();
        if (cached?.id === session.user.id) {
          setProfile(cached); // set from cache immediately
        } else {
          await fetchProfile(session.user.id);
        }
      }
      setLoading(false); // always set loading false, no mounted check
    });

    // 2. Listen for future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        // Fetch fresh profile on sign in (not from cache)
        fetchingRef.current = false;
        await fetchProfile(session.user.id);
        setLoading(false);
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        clearCache();
        fetchingRef.current = false;
        setLoading(false);
      }

      if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ── Sign up ───────────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async ({ email, password, firstName, lastName }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });
      return { data, error };
    },
    [],
  );

  // ── Sign in ───────────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  // ── Google OAuth ──────────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        prompt: "select_account",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  }, []);

  // ── Sign out ──────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    // Clear local state immediately so UI responds
    setUser(null);
    setProfile(null);
    clearCache();
    fetchingRef.current = false;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[signOut] Supabase error:", err);
    }
    return { error: null };
  }, []);

  // ── Password reset ────────────────────────────────────────────────────────────
  const sendPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    return { error };
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }, []);

  // ── Update profile ────────────────────────────────────────────────────────────
  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return { error: "Not logged in" };
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
      if (data) {
        setProfile(data);
        writeCache(data);
      }
      return { error };
    },
    [user],
  );

  // ── Refresh profile ───────────────────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    fetchingRef.current = false;
    await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  // ── Complete onboarding ───────────────────────────────────────────────────────
  const completeOnboarding = useCallback(
    async ({ currency, _budgetName, _period, whatsapp_number }) => {
      if (!user) return { error: "Not logged in" };

      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? user.email,
        first_name: user.user_metadata?.first_name ?? "",
        last_name: user.user_metadata?.last_name ?? "",
        currency,
        onboarding_complete: true,
        onboarding_completed: true,
      };
      // Only set plan for new users — don't overwrite existing plan
      if (!profile?.plan) profileData.plan = "basic";
      if (whatsapp_number) {
        profileData.whatsapp_number = whatsapp_number;
        profileData.whatsapp_active = true;
      }

      const { data: upserted, error } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "id" })
        .select()
        .maybeSingle();

      if (error) {
        console.error("[completeOnboarding] upsert error:", error);
        return { error };
      }

      // If select returns null (RLS may block it), build from what we sent
      const finalProfile = upserted ?? {
        ...profileData,
        plan: profileData.plan ?? profile?.plan ?? "basic",
      };
      setProfile(finalProfile);
      writeCache(finalProfile);

      return { error: null };
    },
    [user, profile?.plan],
  );

  // ── Derived state ─────────────────────────────────────────────────────────────
  const isLoggedIn = !!user;
  const isPremium = profile?.plan === "premium";
  const isTrialing = profile?.plan === "trial";
  const isPremiumOrTrial = isPremium || isTrialing;
  const displayName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
      profile.email
    : "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  const trialDaysLeft = (() => {
    if (!profile?.trial_ends_at) return 0;
    const diff = new Date(profile.trial_ends_at) - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
  })();

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    updatePassword,
    updateProfile,
    refreshProfile,
    completeOnboarding,
    isLoggedIn,
    isPremium,
    isTrialing,
    isPremiumOrTrial,
    isAdmin: profile?.is_admin === true || user?.id === ADMIN_ID,
    displayName,
    initials,
    trialDaysLeft,
    currency: profile?.currency ?? "NGN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
