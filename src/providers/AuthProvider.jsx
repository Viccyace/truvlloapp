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

// Cache helpers
const PROFILE_KEY = "truvllo_profile";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function readCache() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // New format: { data, ts }
    if (parsed && parsed.data && parsed.ts) {
      if (Date.now() - parsed.ts > CACHE_TTL) {
        localStorage.removeItem(PROFILE_KEY);
        return null;
      }
      return parsed.data;
    }
    // Old format: plain profile object with id field
    if (parsed && parsed.id) return parsed;
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

export function AuthProvider({ children }) {
  // Seed profile from cache synchronously so there is no blank flash
  const [profile, setProfile] = useState(() => readCache());
  const [user, setUser] = useState(null);
  // Start with loading=false if we have cached profile AND valid auth token
  // This prevents spinner on browser reopen when session is cached
  const [loading, setLoading] = useState(true);

  const fetchingRef = useRef(false);
  const initialised = useRef(false);

  // Fetch profile from Supabase
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
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Auth state initialisation
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && session.user) {
        setUser(session.user);
        const cached = readCache();
        if (cached && cached.id === session.user.id) {
          setProfile(cached);
        } else {
          await fetchProfile(session.user.id);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session && session.user) {
        setUser(session.user);
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

      if (event === "TOKEN_REFRESHED" && session && session.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up
  const signUp = useCallback(
    async ({ email, password, firstName, lastName }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: firstName + " " + lastName,
          },
        },
      });
      return { data, error };
    },
    [],
  );

  // Sign in
  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  // Google OAuth
  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        prompt: "select_account",
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
    return { data, error };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setUser(null);
    setProfile(null);
    clearCache();
    fetchingRef.current = false;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[signOut] error:", err);
    }
    return { error: null };
  }, []);

  // Password reset
  const sendPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth/callback?type=recovery",
    });
    return { error };
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }, []);

  // Update profile
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

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!user || !user.id) return;
    fetchingRef.current = false;
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  // Complete onboarding
  const completeOnboarding = useCallback(
    async ({ currency, _budgetName, _period, whatsapp_number }) => {
      if (!user) return { error: "Not logged in" };

      const profileData = {
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email,
        first_name:
          user.user_metadata?.first_name ||
          user.user_metadata?.given_name ||
          (user.user_metadata?.full_name || "").split(" ")[0] ||
          "",
        last_name:
          user.user_metadata?.last_name ||
          user.user_metadata?.family_name ||
          (user.user_metadata?.full_name || "").split(" ").slice(1).join(" ") ||
          "",
        currency,
        onboarding_complete: true,
        onboarding_completed: true,
      };

      // Only set plan for new users - never overwrite existing plan
      if (!profile || !profile.plan) {
        profileData.plan = "basic";
      }

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

      const finalProfile =
        upserted ||
        Object.assign({}, profileData, {
          plan: profileData.plan || (profile && profile.plan) || "basic",
        });
      setProfile(finalProfile);
      writeCache(finalProfile);

      return { error: null };
    },
    [user, profile],
  );

  // Derived state
  const isLoggedIn = !!user;
  const isPremium = profile && profile.plan === "premium";
  const isTrialing = profile && profile.plan === "trial";
  const isPremiumOrTrial = !!(isPremium || isTrialing);
  // For Google users, user_metadata has full_name/name if profile fields are empty
  const googleName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const displayName = profile
    ? ((profile.first_name || "") + " " + (profile.last_name || "")).trim() ||
      googleName ||
      profile.email ||
      ""
    : googleName;
  const initials =
    displayName && displayName !== profile?.email
      ? displayName
          .split(" ")
          .filter(Boolean)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : googleName
        ? googleName
            .split(" ")
            .filter(Boolean)
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";
  const trialDaysLeft = (() => {
    if (!profile || !profile.trial_ends_at) return 0;
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
    isAdmin:
      (profile && profile.is_admin === true) || (user && user.id === ADMIN_ID),
    displayName,
    initials,
    trialDaysLeft,
    currency: (profile && profile.currency) || "NGN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
