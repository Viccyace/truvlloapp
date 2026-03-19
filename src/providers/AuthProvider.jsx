import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

const PROFILE_CACHE_KEY = "truvllo_profile";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function readCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedProfile(profile) {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

function clearCachedProfile() {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    // ignore storage errors
  }
}

function isMissingProfileError(error) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() || "";
  return (
    error.code === "PGRST116" ||
    msg.includes("0 rows") ||
    msg.includes("no rows") ||
    msg.includes("json object requested")
  );
}

function buildBaseProfile(
  authUser,
  currency = "NGN",
  onboardingComplete = false,
) {
  const firstName = authUser?.user_metadata?.first_name ?? "";
  const lastName = authUser?.user_metadata?.last_name ?? "";
  const fullName =
    authUser?.user_metadata?.full_name ||
    `${firstName} ${lastName}`.trim() ||
    authUser?.email ||
    "";

  return {
    id: authUser?.id,
    email: authUser?.email ?? "",
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    currency,
    plan: "basic",
    onboarding_complete: onboardingComplete,
    onboarding_completed: onboardingComplete,
    trial_activated: false,
    trial_ends_at: null,
    subscription_cancelled: false,
  };
}

export function AuthProvider({ children }) {
  const cachedProfile = readCachedProfile();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(cachedProfile);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  const ensureProfilePromiseRef = useRef(null);

  const setProfileState = useCallback((nextProfile) => {
    if (!mountedRef.current) return;
    setProfile(nextProfile);
    writeCachedProfile(nextProfile);
  }, []);

  const fetchProfile = useCallback(
    async (userId) => {
      if (!userId) return { data: null, error: { message: "Missing user id" } };

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[AuthProvider] fetchProfile error:", error);
        return { data: null, error };
      }

      if (data) {
        setProfileState(data);
        return { data, error: null };
      }

      return { data: null, error: null };
    },
    [setProfileState],
  );

  const createOrRepairProfile = useCallback(
    async (authUser, onboardingComplete = false) => {
      if (!authUser) {
        return { data: null, error: { message: "Missing auth user" } };
      }

      const payload = buildBaseProfile(
        authUser,
        profile?.currency || "NGN",
        onboardingComplete,
      );

      const { data, error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.error("[AuthProvider] createOrRepairProfile error:", error);
        return { data: null, error };
      }

      setProfileState(data);
      return { data, error: null };
    },
    [profile?.currency, setProfileState],
  );

  const ensureProfile = useCallback(
    async (authUser) => {
      if (!authUser) {
        return { data: null, error: { message: "Missing auth user" } };
      }

      if (ensureProfilePromiseRef.current) {
        return await ensureProfilePromiseRef.current;
      }

      ensureProfilePromiseRef.current = (async () => {
        try {
          const fetched = await fetchProfile(authUser.id);

          if (fetched.data) {
            return fetched;
          }

          if (fetched.error && !isMissingProfileError(fetched.error)) {
            return fetched;
          }

          return await createOrRepairProfile(authUser, false);
        } catch (err) {
          console.error("[AuthProvider] ensureProfile error:", err);
          return { data: null, error: err };
        }
      })();

      try {
        return await ensureProfilePromiseRef.current;
      } finally {
        ensureProfilePromiseRef.current = null;
      }
    },
    [fetchProfile, createOrRepairProfile],
  );

  useEffect(() => {
    mountedRef.current = true;

    const bootstrap = async () => {
      try {
        setLoading(true);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[AuthProvider] getSession error:", error);
        }

        const authUser = session?.user ?? null;
        if (!mountedRef.current) return;

        setUser(authUser);

        if (!authUser) {
          setProfile(null);
          clearCachedProfile();
          return;
        }

        await ensureProfile(authUser);
      } catch (err) {
        console.error("[AuthProvider] bootstrap error:", err);
        if (mountedRef.current) {
          setUser(null);
          setProfile(null);
          clearCachedProfile();
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") return;

      try {
        const authUser = session?.user ?? null;
        if (!mountedRef.current) return;

        setUser(authUser);

        if (!authUser) {
          setProfile(null);
          clearCachedProfile();
          return;
        }

        setLoading(true);
        await ensureProfile(authUser);
      } catch (err) {
        console.error("[AuthProvider] onAuthStateChange error:", err);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const signUp = useCallback(
    async ({ email, password, firstName, lastName }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
          },
        },
      });

      return { data, error };
    },
    [],
  );

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      setUser(null);
      setProfile(null);
      clearCachedProfile();
      setLoading(false);
    }

    return { error };
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error };
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return { error: { message: "Not logged in" } };

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("[AuthProvider] updateProfile error:", error);
        return { data: null, error };
      }

      setProfileState(data);
      return { data, error: null };
    },
    [user, setProfileState],
  );

  const completeOnboarding = useCallback(
    async ({ currency }) => {
      if (!user) return { error: { message: "Not logged in" } };

      const payload = {
        ...buildBaseProfile(user, currency || "NGN", true),
        plan: profile?.plan || "basic",
        trial_activated: profile?.trial_activated ?? false,
        trial_ends_at: profile?.trial_ends_at ?? null,
        avatar_url: profile?.avatar_url ?? null,
        subscription_ends_at: profile?.subscription_ends_at ?? null,
        subscription_cancelled: profile?.subscription_cancelled ?? false,
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.error("[AuthProvider] completeOnboarding error:", error);
        return { data: null, error };
      }

      setProfileState(data);
      setLoading(false);
      return { data, error: null };
    },
    [user, profile, setProfileState],
  );

  const isLoggedIn = !!user;
  const isPremium = profile?.plan === "premium";
  const isTrialing =
    profile?.plan === "trial" &&
    !!profile?.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date();

  const isBasic = !isPremium && !isTrialing;
  const isPremiumOrTrial = isPremium || isTrialing;

  const displayName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    profile?.email ||
    "";

  const initials =
    displayName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  const trialDaysLeft = (() => {
    if (!profile?.trial_ends_at) return 0;
    const diff = new Date(profile.trial_ends_at) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
    completeOnboarding,
    ensureProfile,

    isLoggedIn,
    isPremium,
    isTrialing,
    isBasic,
    isPremiumOrTrial,
    displayName,
    initials,
    trialDaysLeft,
    currency: profile?.currency ?? "NGN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
