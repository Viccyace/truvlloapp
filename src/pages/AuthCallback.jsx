// src/pages/AuthCallback.jsx
// Handles redirect from Google OAuth AND email confirmation links
// Uses onAuthStateChange to reliably catch session after token exchange

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state — fires when Supabase finishes exchanging the token
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete, onboarding_completed")
          .eq("id", session.user.id)
          .single();

        const onboardingDone =
          profile?.onboarding_complete === true ||
          profile?.onboarding_completed === true;

        if (onboardingDone) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } else if (
        event === "SIGNED_OUT" ||
        (!session && event !== "INITIAL_SESSION")
      ) {
        navigate("/auth", { replace: true });
      }
    });

    // Also try getSession immediately in case token was already exchanged
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("profiles")
          .select("onboarding_complete, onboarding_completed")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            const onboardingDone =
              profile?.onboarding_complete === true ||
              profile?.onboarding_completed === true;
            navigate(onboardingDone ? "/dashboard" : "/onboarding", {
              replace: true,
            });
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF8F3",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "3px solid #40916C",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      <p
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.9rem",
          color: "#6B6B6B",
        }}
      >
        Signing you in...
      </p>
    </div>
  );
}
