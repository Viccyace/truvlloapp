// src/pages/AuthCallback.jsx
// Handles the redirect back from Google OAuth
// Checks if user needs onboarding or goes straight to dashboard

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically exchanges the code for a session from the URL hash
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("OAuth callback error:", error);
        navigate("/auth");
        return;
      }

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", session.user.id)
        .single();

      if (profile?.onboarding_complete) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF8F3",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "3px solid #1B4332",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#6B6B6B", fontSize: "0.9rem" }}>
          Signing you in...
        </p>
      </div>
    </div>
  );
}
