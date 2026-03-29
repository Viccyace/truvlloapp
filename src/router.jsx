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
import AuthCallback from "./pages/AuthCallback";

// Public pages
import Blog from "./pages/Blog";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function LoadingScreen() {
  return <div style={{ padding: 24 }}>Loading...</div>;
}

function ProtectedRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  const onboardingDone =
    profile?.onboarding_complete === true ||
    profile?.onboarding_completed === true;

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

function OnboardingRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;

  return <Outlet />;
}

export const router = createBrowserRouter([
  // ── Landing ──────────────────────────────────────────────────────────────
  { path: "/", element: <Landing /> },

  // ── Public marketing pages ────────────────────────────────────────────────
  { path: "/blog", element: <Blog /> },
  { path: "/about", element: <About /> },
  { path: "/careers", element: <Careers /> },
  { path: "/contact", element: <Contact /> },

  // ── Legal — canonical URLs + short aliases (both work) ───────────────────
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/privacy", element: <PrivacyPolicy /> }, // alias for Auth.jsx + Google Console
  { path: "/terms-of-service", element: <TermsOfService /> },
  { path: "/terms", element: <TermsOfService /> }, // alias for Auth.jsx + Google Console

  // ── Auth callback (Google OAuth redirect) ─────────────────────────────────
  { path: "/auth/callback", element: <AuthCallback /> },

  // ── Auth (public only — redirects logged-in users to dashboard) ──────────
  {
    element: <PublicRoute />,
    children: [{ path: "/auth", element: <Auth /> }],
  },

  // ── Onboarding ────────────────────────────────────────────────────────────
  {
    element: <OnboardingRoute />,
    children: [{ path: "/onboarding", element: <Onboarding /> }],
  },

  // ── Protected app routes ──────────────────────────────────────────────────
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

  // ── 404 ───────────────────────────────────────────────────────────────────
  { path: "*", element: <NotFound /> },
]);
