import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";

// Layouts
import AppLayout from "./layouts/AppLayout";

// Pages
import Landing    from "./pages/Landing";
import Auth       from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard  from "./pages/Dashboard";
import Expenses   from "./pages/Expenses";
import Budget     from "./pages/Budget";
import Insights   from "./pages/Insights";
import Settings   from "./pages/Settings";
import Upgrade    from "./pages/Upgrade";

function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile?.onboarding_complete) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

function PublicRoute() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (user && profile?.onboarding_complete) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  {
    element: <PublicRoute />,
    children: [{ path: "/auth", element: <Auth /> }],
  },
  { path: "/onboarding", element: <Onboarding /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/expenses",  element: <Expenses /> },
          { path: "/budget",    element: <Budget /> },
          { path: "/insights",  element: <Insights /> },
          { path: "/settings",  element: <Settings /> },
          { path: "/upgrade",   element: <Upgrade /> },
          { path: "*",          element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);
