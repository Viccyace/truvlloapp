/**
 * AuthProvider.jsx  —  src/providers/AuthProvider.jsx
 *
 * Key behaviours (per spec):
 *  1. On first render, read the cached profile from localStorage SYNCHRONOUSLY
 *     so the app renders with real data immediately — no loading flash.
 *  2. Subscribe to Supabase onAuthStateChange to keep auth in sync.
 *  3. Write profile to localStorage whenever it changes.
 *  4. On logout, clear localStorage entirely.
 *  5. After onboarding completes, clear localStorage so the next load
 *     re-fetches a fresh profile with onboarding_complete = true.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase"; // your supabase client

// ─── Types / shape ────────────────────────────────────────────────────────────
/**
 * Profile shape stored in Supabase `profiles` table:
 * {
 *   id:                  string  (= auth.users.id)
 *   email:               string
 *   first_name:          string
 *   last_name:           string
 *   avatar_url:          string | null
 *   currency:            'NGN' | 'USD' | 'GBP' | 'EUR' | 'KES' | 'GHS'
 *   onboarding_complete: boolean
 *   plan:                'free' | 'trial' | 'premium'
 *   trial_ends_at:       string | null  (ISO date)
 *   trial_activated:     boolean
 *   created_at:          string
 * }
 */

const PROFILE_CACHE_KEY = "truvllo_profile";
const SESSION_CACHE_KEY = "truvllo_session";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    if (profile)
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    // storage full / private mode — silently ignore
  }
}

function clearAllCache() {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    localStorage.removeItem(SESSION_CACHE_KEY);
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  /**
   * Initialise profile from localStorage SYNCHRONOUSLY.
   * This means the very first render already has profile data —
   * no blank screen, no loading spinner on subsequent visits.
   */
  const [profile, setProfile] = useState(() => readCachedProfile());
  const [user, setUser] = useState(null);

  /**
   * loading is true only on the very first cold load when we have no
   * cached profile and haven't yet heard back from Supabase.
   * If a cached profile exists, loading starts as false.
   */
  const [loading, setLoading] = useState(() => readCachedProfile() === null);

  const profileFetchedRef = useRef(false);

  // ── Fetch full profile from Supabase ────────────────────────────────────────
  const fetchProfile = useCallback(async (userId) => {
    if (profileFetchedRef.current) return; // already fetched this session
    profileFetchedRef.current = true;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[AuthProvider] fetchProfile error:", error.message);
      // Profile doesn't exist yet — create it
      if (error.code === "PGRST116" || error.message?.includes("JSON")) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from("profiles").upsert(
            {
              id: userId,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name ?? authUser.email,
              first_name: authUser.user_metadata?.first_name ?? "",
              last_name: authUser.user_metadata?.last_name ?? "",
              currency: "NGN",
              plan: "free",
              onboarding_completed: false,
              onboarding_complete: false,
            },
            { onConflict: "id" },
          );
          // Retry fetch
          const { data: retryData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
          if (retryData) {
            setProfile(retryData);
            writeCachedProfile(retryData);
          }
        }
      }
      setLoading(false);
      return;
    }

    setProfile(data);
    writeCachedProfile(data);
  }, []);

  // ── Update profile (e.g. from settings page) ────────────────────────────────
  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return { error: "Not logged in" };

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        writeCachedProfile(data);
      }

      return { data, error };
    },
    [user],
  );

  // ── Auth state listener ──────────────────────────────────────────────────────
  useEffect(() => {
    // Get current session immediately (synchronous check inside Supabase SDK)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Subscribe to future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        profileFetchedRef.current = false;
        await fetchProfile(session.user.id);
        setLoading(false);
      }

      if (event === "INITIAL_SESSION" && session?.user) {
        setUser(session.user);
        profileFetchedRef.current = false;
        await fetchProfile(session.user.id);
        setLoading(false);
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        clearAllCache();
        profileFetchedRef.current = false;
        setLoading(false);
      }

      if (event === "USER_UPDATED" && session?.user) {
        setUser(session.user);
        profileFetchedRef.current = false;
        await fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Sign up ──────────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async ({ email, password, firstName, lastName }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });

      if (error) return { error };

      /**
       * Supabase trigger `handle_new_user` should automatically insert a row
       * into `profiles` when a new user signs up. If you haven't set that up,
       * insert it manually here:
       *
       * await supabase.from("profiles").insert({
       *   id: data.user.id,
       *   email,
       *   first_name: firstName,
       *   last_name: lastName,
       *   currency: "NGN",
       *   onboarding_complete: false,
       *   plan: "free",
       * });
       */

      return { data };
    },
    [],
  );

  // ── Sign in ──────────────────────────────────────────────────────────────────
  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  // ── Sign in with Google ──────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { data, error };
  }, []);

  // ── Sign out ─────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Clear cache immediately
      clearAllCache();
      setUser(null);
      setProfile(null);
      profileFetchedRef.current = false;
      return { error };
    } catch (err) {
      return { error: err };
    }
  }, []);

  // ── Password reset ───────────────────────────────────────────────────────────
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

  // ── Complete onboarding ──────────────────────────────────────────────────────
  /**
   * Called at the end of the onboarding flow.
   * Per spec: clear localStorage BEFORE navigating to dashboard so the app
   * re-fetches a fresh profile with onboarding_complete = true.
   */
  const completeOnboarding = useCallback(
    async ({ currency, _budgetName, _period, whatsapp_number }) => {
      if (!user) return { error: "Not logged in" };

      const profileUpdate = { currency, onboarding_complete: true };
      if (whatsapp_number) profileUpdate.whatsapp_number = whatsapp_number;
      const { error } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      if (error) return { error };

      // Clear cache so next render picks up fresh profile
      clearAllCache();
      profileFetchedRef.current = false;

      return { error: null };
    },
    [user],
  );

  // ── Derived helpers ──────────────────────────────────────────────────────────
  const isLoggedIn = !!user;
  const isPremium = profile?.plan === "premium";
  const isTrialing = profile?.plan === "trial";
  const isPremiumOrTrial = isPremium || isTrialing;
  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "";
  const initials = profile
    ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  const trialDaysLeft = (() => {
    if (!profile?.trial_ends_at) return 0;
    const diff = new Date(profile.trial_ends_at) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  // ── Context value ────────────────────────────────────────────────────────────
  const value = {
    // State
    user,
    profile,
    loading,

    // Auth actions
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    updatePassword,

    // Profile actions
    updateProfile,
    refreshProfile: async () => {
      if (!user?.id) return;
      // Bypass the fetchedRef guard for explicit refreshes
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
        writeCachedProfile(data);
      }
    },
    completeOnboarding,

    // Derived
    isLoggedIn,
    isPremium,
    isTrialing,
    isPremiumOrTrial,
    isAdmin:
      profile?.is_admin === true ||
      user?.id === "7ec55e7e-6270-436c-bfc9-323ea8971e7a",
    displayName,
    initials,
    trialDaysLeft,
    currency: profile?.currency ?? "NGN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Supabase SQL — run this in your Supabase SQL editor
 * ─────────────────────────────────────────────────────────────────────────── *

-- profiles table
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  first_name          text not null default '',
  last_name           text not null default '',
  avatar_url          text,
  currency            text not null default 'NGN',
  onboarding_complete boolean not null default false,
  plan                text not null default 'free',   -- 'free' | 'trial' | 'premium'
  trial_ends_at       timestamptz,
  trial_activated     boolean not null default false,
  created_at          timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-activate trial when user logs their FIRST expense
create or replace function public.activate_trial_on_first_expense()
returns trigger language plpgsql security definer as $$
declare
  expense_count int;
begin
  select count(*) into expense_count
  from public.expenses
  where user_id = new.user_id;

  if expense_count = 1 then
    -- This is their first expense — activate trial
    update public.profiles
    set
      plan             = 'trial',
      trial_activated  = true,
      trial_ends_at    = now() + interval '7 days'
    where id = new.user_id
      and trial_activated = false;
  end if;

  return new;
end;
$$;

create trigger on_first_expense
  after insert on public.expenses
  for each row execute procedure public.activate_trial_on_first_expense();

-- RLS
alter table public.profiles enable row level security;
create policy "Users can read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

*/
