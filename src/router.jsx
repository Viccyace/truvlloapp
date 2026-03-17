import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";

// Layouts
import AppLayout from "./layouts/AppLayout";

// Public pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";

// App pages (behind auth)
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";

function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile?.onboarding_complete)
    return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

function PublicRoute() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (user && profile?.onboarding_complete)
    return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  // ── Public pages ─────────────────────────────────────────────────────
  { path: "/", element: <Landing /> },
  { path: "/about", element: <About /> },
  { path: "/blog", element: <Blog /> },
  { path: "/careers", element: <Careers /> },
  { path: "/contact", element: <Contact /> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/cookies", element: <CookiePolicy /> },

  // ── Auth ─────────────────────────────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [{ path: "/auth", element: <Auth /> }],
  },

  // ── Onboarding ───────────────────────────────────────────────────────
  { path: "/onboarding", element: <Onboarding /> },

  // ── Protected app ────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/expenses", element: <Expenses /> },
          { path: "/budget", element: <Budget /> },
          { path: "/insights", element: <Insights /> },
          { path: "/settings", element: <Settings /> },
          { path: "/upgrade", element: <Upgrade /> },
          { path: "*", element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);
