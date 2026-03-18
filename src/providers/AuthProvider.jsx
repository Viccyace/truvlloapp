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
const SESSION_CACHE_KEY = "truvllo_session";

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

function clearAllCache() {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    localStorage.removeItem(SESSION_CACHE_KEY);
  } catch {}
}

const isMissingProfileError = (error) => {
  if (!error) return false;
  const msg = error.message?.toLowerCase() || "";
  return (
    error.code === "PGRST116" ||
    msg.includes("0 rows") ||
    msg.includes("no rows") ||
    msg.includes("json object requested")
  );
};

export function AuthProvider({ children }) {
  const cachedProfile = readCachedProfile();

  const [profile, setProfile] = useState(cachedProfile);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => cachedProfile === null);

  const profileFetchedRef = useRef(false);

  const createProfileIfMissing = useCallback(async (userId) => {
    const {
      data: { user: authUser },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !authUser) {
      console.error("[AuthProvider] getUser error:", getUserError?.message);
      return null;
    }

    const firstName = authUser.user_metadata?.first_name ?? "";
    const lastName = authUser.user_metadata?.last_name ?? "";
    const fullName =
      authUser.user_metadata?.full_name ||
      `${firstName} ${lastName}`.trim() ||
      authUser.email ||
      "";

    const payload = {
      id: userId,
      email: authUser.email,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      currency: "NGN",
      plan: "basic",
      onboarding_completed: false,
      onboarding_complete: false,
      trial_activated: false,
      trial_ends_at: null,
    };

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (upsertError) {
      console.error(
        "[AuthProvider] createProfileIfMissing error:",
        upsertError.message,
      );
      return null;
    }

    const { data: retryData, error: retryError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (retryError) {
      console.error(
        "[AuthProvider] retry fetchProfile error:",
        retryError.message,
      );
      return null;
    }

    return retryData;
  }, []);

  const fetchProfile = useCallback(
    async (userId, force = false) => {
      if (!userId) {
        setLoading(false);
        return null;
      }

      if (profileFetchedRef.current && !force) {
        setLoading(false);
        return profile;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (isMissingProfileError(error)) {
          const newProfile = await createProfileIfMissing(userId);

          if (newProfile) {
            setProfile(newProfile);
            writeCachedProfile(newProfile);
            profileFetchedRef.current = true;
            setLoading(false);
            return newProfile;
          }
        }

        console.error("[AuthProvider] fetchProfile error:", error.message);
        setLoading(false);
        return null;
      }

      setProfile(data);
      writeCachedProfile(data);
      profileFetchedRef.current = true;
      setLoading(false);
      return data;
    },
    [createProfileIfMissing, profile],
  );

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return { error: { message: "Not logged in" } };

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        writeCachedProfile(data);
        profileFetchedRef.current = true;
      }

      return { data, error };
    },
    [user],
  );

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, true);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        profileFetchedRef.current = false;
        await fetchProfile(session.user.id, true);
        return;
      }

      if (event === "INITIAL_SESSION" && session?.user) {
        setUser(session.user);
        profileFetchedRef.current = false;
        await fetchProfile(session.user.id, true);
        return;
      }

      if (event === "USER_UPDATED" && session?.user) {
        setUser(session.user);
        profileFetchedRef.current = false;
        await fetchProfile(session.user.id, true);
        return;
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        profileFetchedRef.current = false;
        clearAllCache();
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

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

  const completeOnboarding = useCallback(
    async ({ currency }) => {
      if (!user) return { error: { message: "Not logged in" } };

      const { data, error } = await supabase
        .from("profiles")
        .update({
          currency,
          onboarding_complete: true,
          onboarding_completed: true,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) return { error };

      setProfile(data);
      writeCachedProfile(data);
      profileFetchedRef.current = true;

      return { error: null, data };
    },
    [user],
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
