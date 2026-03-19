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

  // authLoading controls routing boot only
  const [authLoading, setAuthLoading] = useState(true);

  // profileLoading is background hydration/repair state
  const [profileLoading, setProfileLoading] = useState(false);

  const mountedRef = useRef(true);
  const ensureProfilePromiseRef = useRef(null);

  const setProfileState = useCallback((nextProfile) => {
    if (!mountedRef.current) return;
    setProfile(nextProfile);
    writeCachedProfile(nextProfile);
  }, []);

  const clearProfileState = useCallback(() => {
    if (!mountedRef.current) return;
    setProfile(null);
    clearCachedProfile();
  }, []);

  const fetchProfile = useCallback(
    async (userId) => {
      if (!userId) {
        return { data: null, error: { message: "Missing user id" } };
      }

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
      }

      return { data: data ?? null, error: null };
    },
    [setProfileState],
  );

  const createOrRepairProfile = useCallback(
    async (authUser, onboardingComplete = false) => {
      if (!authUser) {
        return { data: null, error: { message: "Missing auth user" } };
      }

      const payload = {
        ...buildBaseProfile(
          authUser,
          profile?.currency || "NGN",
          onboardingComplete,
        ),
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
        console.error("[AuthProvider] createOrRepairProfile error:", error);
        return { data: null, error };
      }

      setProfileState(data);
      return { data, error: null };
    },
    [profile, setProfileState],
  );

  const ensureProfile = useCallback(
    async (authUser, onboardingComplete = false) => {
      if (!authUser) {
        return { data: null, error: { message: "Missing auth user" } };
      }

      if (ensureProfilePromiseRef.current) {
        return await ensureProfilePromiseRef.current;
      }

      ensureProfilePromiseRef.current = (async () => {
        if (mountedRef.current) setProfileLoading(true);

        try {
          const fetched = await fetchProfile(authUser.id);

          if (fetched.data) {
            return fetched;
          }

          return await createOrRepairProfile(authUser, onboardingComplete);
        } catch (error) {
          console.error("[AuthProvider] ensureProfile error:", error);
          return { data: null, error };
        } finally {
          if (mountedRef.current) setProfileLoading(false);
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
        setAuthLoading(true);

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

        // App boot should stop blocking once session is known
        setAuthLoading(false);

        if (!authUser) {
          clearProfileState();
          return;
        }

        // Hydrate profile in background
        ensureProfile(authUser).catch((err) => {
          console.error("[AuthProvider] bootstrap ensureProfile error:", err);
        });
      } catch (err) {
        console.error("[AuthProvider] bootstrap error:", err);

        if (!mountedRef.current) return;

        setUser(null);
        clearProfileState();
        setAuthLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // bootstrap already handles first load
      if (event === "INITIAL_SESSION") return;

      try {
        const authUser = session?.user ?? null;
        if (!mountedRef.current) return;

        setUser(authUser);

        if (!authUser) {
          clearProfileState();
          setAuthLoading(false);
          return;
        }

        // Do not block whole app during profile hydration
        setAuthLoading(false);

        ensureProfile(authUser).catch((err) => {
          console.error(
            "[AuthProvider] onAuthStateChange ensureProfile error:",
            err,
          );
        });
      } catch (err) {
        console.error("[AuthProvider] onAuthStateChange error:", err);
        if (mountedRef.current) {
          setAuthLoading(false);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile, clearProfileState]);

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

    if (!error && mountedRef.current) {
      setUser(null);
      clearProfileState();
      setAuthLoading(false);
      setProfileLoading(false);
    }

    return { error };
  }, [clearProfileState]);

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
      if (!user) return { data: null, error: { message: "Not logged in" } };

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
      if (!user) {
        return { data: null, error: { message: "Not logged in" } };
      }

      if (mountedRef.current) setProfileLoading(true);

      try {
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
        return { data, error: null };
      } finally {
        if (mountedRef.current) setProfileLoading(false);
      }
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
    loading: authLoading,
    authLoading,
    profileLoading,

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
