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
  } catch {}
}

function clearCachedProfile() {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {}
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
  const [profileLoading, setProfileLoading] = useState(false);

  const mountedRef = useRef(true);
  const ensureProfilePromiseRef = useRef(null);
  const profileRef = useRef(cachedProfile);

  const setProfileState = useCallback((nextProfile) => {
    if (!mountedRef.current) return;
    profileRef.current = nextProfile;
    setProfile(nextProfile);
    writeCachedProfile(nextProfile);
  }, []);

  const clearProfileState = useCallback(() => {
    if (!mountedRef.current) return;
    profileRef.current = null;
    setProfile(null);
    clearCachedProfile();
  }, []);

  const fetchProfile = useCallback(async (userId) => {
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

    return { data: data ?? null, error: null };
  }, []);

  const createOrRepairProfile = useCallback(
    async (authUser, onboardingComplete = false, forcedCurrency) => {
      if (!authUser) {
        return { data: null, error: { message: "Missing auth user" } };
      }

      const currentProfile = profileRef.current;

      const payload = {
        ...buildBaseProfile(
          authUser,
          forcedCurrency || currentProfile?.currency || "NGN",
          onboardingComplete,
        ),
        plan: currentProfile?.plan || "basic",
        trial_activated: currentProfile?.trial_activated ?? false,
        trial_ends_at: currentProfile?.trial_ends_at ?? null,
        avatar_url: currentProfile?.avatar_url ?? null,
        subscription_ends_at: currentProfile?.subscription_ends_at ?? null,
        subscription_cancelled: currentProfile?.subscription_cancelled ?? false,
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
    [setProfileState],
  );

  const ensureProfile = useCallback(
    async (authUser) => {
      if (!authUser) {
        if (mountedRef.current) {
          clearProfileState();
          setProfileLoading(false);
        }
        return { data: null, error: { message: "Missing auth user" } };
      }

      if (ensureProfilePromiseRef.current) {
        return ensureProfilePromiseRef.current;
      }

      ensureProfilePromiseRef.current = (async () => {
        if (mountedRef.current) setProfileLoading(true);

        try {
          const fetched = await fetchProfile(authUser.id);

          if (fetched.error) {
            return fetched;
          }

          if (fetched.data) {
            setProfileState(fetched.data);
            return fetched;
          }

          return await createOrRepairProfile(authUser, false);
        } catch (error) {
          console.error("[AuthProvider] ensureProfile error:", error);
          return { data: null, error };
        } finally {
          if (mountedRef.current) {
            setProfileLoading(false);
          }
          ensureProfilePromiseRef.current = null;
        }
      })();

      return ensureProfilePromiseRef.current;
    },
    [fetchProfile, createOrRepairProfile, clearProfileState, setProfileState],
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

        // IMPORTANT: auth loading ends here
        setLoading(false);

        if (!authUser) {
          clearProfileState();
          return;
        }

        ensureProfile(authUser).catch((err) => {
          console.error("[AuthProvider] bootstrap ensureProfile error:", err);
        });
      } catch (err) {
        console.error("[AuthProvider] bootstrap error:", err);

        if (!mountedRef.current) return;

        setUser(null);
        clearProfileState();
        setLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (event === "INITIAL_SESSION") return;

      const authUser = session?.user ?? null;
      setUser(authUser);

      if (!authUser) {
        clearProfileState();
        setProfileLoading(false);
        setLoading(false);
        return;
      }

      // IMPORTANT: auth already known, don't block app here
      setLoading(false);

      ensureProfile(authUser).catch((err) => {
        console.error(
          "[AuthProvider] onAuthStateChange ensureProfile error:",
          err,
        );
      });
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile, clearProfileState]);

  const signUp = useCallback(
    async ({ email, password, firstName, lastName }) => {
      return await supabase.auth.signUp({
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
    },
    [],
  );

  const signIn = useCallback(async ({ email, password }) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (!error && mountedRef.current) {
      setUser(null);
      clearProfileState();
      setProfileLoading(false);
      setLoading(false);
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
        return await createOrRepairProfile(user, true, currency || "NGN");
      } finally {
        if (mountedRef.current) setProfileLoading(false);
      }
    },
    [user, createOrRepairProfile],
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
