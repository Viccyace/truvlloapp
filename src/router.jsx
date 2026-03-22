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
import { useAuth } from "./providers/AuthProvider";

function LoadingScreen() {
  return <div style={{ padding: 24 }}>Loading...</div>;
}

function ProtectedRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  // ── New user: redirect to onboarding if not completed ─────────────────────
  // Check both column names since DB has both onboarding_complete and onboarding_completed
  const onboardingDone =
    profile?.onboarding_complete === true ||
    profile?.onboarding_completed === true;

  // Only redirect if profile is loaded and onboarding is not done
  if (profile && !onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

// Onboarding route — accessible to logged-in users regardless of onboarding status
function OnboardingRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  return <Outlet />;
}

export const router = createBrowserRouter([
  // Landing — accessible to everyone
  { path: "/", element: <Landing /> },

  // Auth — redirect to dashboard if already logged in
  {
    element: <PublicRoute />,
    children: [{ path: "/auth", element: <Auth /> }],
  },

  // Onboarding — needs login but doesn't require onboarding to be complete
  {
    element: <OnboardingRoute />,
    children: [{ path: "/onboarding", element: <Onboarding /> }],
  },

  // Protected app pages — requires login AND completed onboarding
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
