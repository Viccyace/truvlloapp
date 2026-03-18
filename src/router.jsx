import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
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

function ProtectedRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return null;

  const hasCompletedOnboarding =
    profile.onboarding_complete === true ||
    profile.onboarding_completed === true;

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  const hasCompletedOnboarding =
    profile?.onboarding_complete === true ||
    profile?.onboarding_completed === true;

  if (user && hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function OnboardingRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return null;

  const hasCompletedOnboarding =
    profile.onboarding_complete === true ||
    profile.onboarding_completed === true;

  if (hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Onboarding />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: "/auth", element: <Auth /> }],
  },
  {
    path: "/onboarding",
    element: <OnboardingRoute />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
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
  {
    path: "*",
    element: <NotFound />,
  },
]);
