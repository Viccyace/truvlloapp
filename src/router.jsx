import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Budget from "./pages/Budget";
import Expenses from "./pages/Expenses";
import Insights from "./pages/Insights";
import Upgrade from "./pages/Upgrade";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Security from "./pages/Security";
import AdminPage from "./pages/AdminPage";
import AuthCallback from "./pages/AuthCallback";
import { useAuth } from "./providers/AuthProvider";

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(27,67,50,0.15)",
          borderTopColor: "#1B4332",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <p
        style={{
          fontFamily: "\'Plus Jakarta Sans\', sans-serif",
          fontSize: "0.82rem",
          color: "#9B9B9B",
        }}
      >
        Loading Truvllo...
      </p>
    </div>
  );
}

function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  const [profileTimeout, setProfileTimeout] = React.useState(false);

  // If profile is null after loading, give it 4 seconds then redirect to onboarding
  React.useEffect(() => {
    if (!loading && user && !profile) {
      const t = setTimeout(() => setProfileTimeout(true), 4000);
      return () => clearTimeout(t);
    }
    setProfileTimeout(false);
  }, [loading, user, profile]);

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) {
    if (profileTimeout) return <Navigate to="/onboarding" replace />;
    return <LoadingScreen />;
  }

  const done =
    profile.onboarding_complete === true ||
    profile.onboarding_completed === true;
  if (!done) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}

function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function OnboardingRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  // Profile loaded and onboarding complete — go to dashboard
  // Only redirect when profile is FULLY loaded — not while null
  if (profile) {
    const done =
      profile.onboarding_complete === true ||
      profile.onboarding_completed === true;
    if (done) return <Navigate to="/dashboard" replace />;
  }

  // Profile null or onboarding not done — show onboarding
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/security", element: <Security /> },
  { path: "/admin", element: <AdminPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },

  {
    element: <PublicRoute />,
    children: [{ path: "/auth", element: <Auth /> }],
  },

  {
    element: <OnboardingRoute />,
    children: [{ path: "/onboarding", element: <Onboarding /> }],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/budget", element: <Budget /> },
          { path: "/expenses", element: <Expenses /> },
          { path: "/insights", element: <Insights /> },
          { path: "/upgrade", element: <Upgrade /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
]);
