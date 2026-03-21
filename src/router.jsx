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
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  return <Outlet />;
}

function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export const router = createBrowserRouter([
  // Landing — accessible to everyone
  { path: "/", element: <Landing /> },

  // Auth — redirects to dashboard if already logged in
  {
    element: <PublicRoute />,
    children: [{ path: "/auth", element: <Auth /> }],
  },

  // Protected app pages
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/onboarding", element: <Onboarding /> },
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
