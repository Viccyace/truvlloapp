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
  return <div style={{ padding: 24 }}>Loading...</div>;
}

function ProtectedRoute() {
  const { user, profile, loading } = useAuth();

  // Always show loading screen while session is being verified
  // Never redirect while loading — avoids flash redirect on hard refresh
  if (loading) return <LoadingScreen />;

  // No session after loading — go to auth
  if (!user) return <Navigate to="/auth" replace />;

  // Profile still loading — show loading screen, do NOT redirect yet
  if (!profile) return <LoadingScreen />;

  // Check both column names since DB has both
  const onboardingDone =
    profile.onboarding_complete === true ||
    profile.onboarding_completed === true;

  if (!onboardingDone) {
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
  { path: "/security", element: <Security /> },
  { path: "/admin", element: <AdminPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },

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
