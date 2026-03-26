// src/components/InstallPrompt.jsx
// Handles two things:
// 1. PWA "Add to Home Screen" install prompt
// 2. Push notification permission request
//
// Shows after user has been on the app for 30 seconds (not intrusive)
// Remembers dismissals in localStorage so it doesn't spam

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const styles = `
  @keyframes slideUpPrompt { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeInPrompt  { from{opacity:0} to{opacity:1} }

  .prompt-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:300;
    display:flex; align-items:flex-end; justify-content:center;
    padding:0 0 env(safe-area-inset-bottom,0);
    animation:fadeInPrompt 0.2s ease;
  }
  @media(min-width:600px){
    .prompt-overlay { align-items:center; }
    .prompt-sheet   { border-radius:24px !important; max-width:400px !important; }
  }

  .prompt-sheet {
    background:#FFFFFF; border-radius:20px 20px 0 0;
    width:100%; max-width:480px; padding:16px 18px 20px;
    animation:slideUpPrompt 0.35s cubic-bezier(0.34,1.2,0.64,1);
    position:relative;
  }

  .prompt-handle {
    width:36px; height:3px; background:rgba(10,10,10,0.1);
    border-radius:100px; margin:0 auto 14px;
  }

  .prompt-icon {
    width:36px; height:36px; border-radius:10px; margin:0 auto 10px;
    background:linear-gradient(135deg,#1B4332,#40916C);
    display:flex; align-items:center; justify-content:center;
    font-size:1rem;
  }

  .prompt-title {
    font-family:'Playfair Display',serif; font-size:1rem; font-weight:800;
    color:#0A0A0A; text-align:center; margin-bottom:4px; letter-spacing:-0.01em;
  }

  .prompt-desc {
    font-size:0.78rem; color:#6B6B6B; text-align:center;
    line-height:1.4; margin-bottom:12px;
  }

  .prompt-bullets {
    display:flex; flex-direction:column; gap:6px; margin-bottom:12px;
  }

  .prompt-bullet {
    display:flex; align-items:center; gap:8px;
    background:#F5F3EE; border-radius:8px; padding:7px 10px;
  }

  .prompt-bullet-icon {
    font-size:0.85rem; flex-shrink:0;
    width:24px; height:24px; border-radius:6px;
    background:#D8F3DC; display:flex; align-items:center; justify-content:center;
  }

  .prompt-bullet-text {
    font-size:0.78rem; font-weight:600; color:#3A3A3A; line-height:1.3;
  }

  .prompt-btn-primary {
    width:100%; padding:10px; border-radius:10px; border:none;
    background:linear-gradient(135deg,#1B4332,#40916C);
    color:#FFFFFF; font-family:'Plus Jakarta Sans',sans-serif;
    font-size:0.95rem; font-weight:700; cursor:pointer;
    transition:all 0.2s; box-shadow:0 4px 16px rgba(27,67,50,0.3);
    display:flex; align-items:center; justify-content:center; gap:8px;
    margin-bottom:10px;
  }
  .prompt-btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(27,67,50,0.4); }

  .prompt-btn-ghost {
    width:100%; padding:8px; border-radius:10px;
    border:1.5px solid rgba(10,10,10,0.1); background:transparent;
    color:#6B6B6B; font-family:'Plus Jakarta Sans',sans-serif;
    font-size:0.875rem; font-weight:600; cursor:pointer; transition:all 0.2s;
  }
  .prompt-btn-ghost:hover { border-color:rgba(10,10,10,0.2); color:#3A3A3A; }

  .prompt-note {
    text-align:center; font-size:0.68rem; color:#9B9B9B;
    margin-top:6px; line-height:1.4;
  }

  /* Toast for after permission granted */
  .notif-toast {
    position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
    z-index:400; background:#1B4332; color:#FFFFFF;
    padding:12px 20px; border-radius:14px; font-size:0.875rem; font-weight:600;
    display:flex; align-items:center; gap:9px;
    box-shadow:0 8px 32px rgba(0,0,0,0.2);
    animation:slideUpPrompt 0.3s ease; white-space:nowrap;
  }
`;

// ── Storage helpers ────────────────────────────────────────────────────────────
const INSTALL_DISMISSED_KEY = "truvllo_install_dismissed";
const NOTIF_DISMISSED_KEY = "truvllo_notif_dismissed";
const NOTIF_ASKED_KEY = "truvllo_notif_asked";

function wasDismissedRecently(key, days = 7) {
  const ts = localStorage.getItem(key);
  if (!ts) return false;
  return Date.now() - Number(ts) < days * 86400000;
}

function dismiss(key) {
  localStorage.setItem(key, String(Date.now()));
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function InstallPrompt() {
  const { user } = useAuth();
  const location = useLocation();

  const [installEvent, setInstallEvent] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifGranted, setNotifGranted] = useState(false);

  // ── Capture the beforeinstallprompt event ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Decide which prompt to show after 30s ─────────────────────────────────
  useEffect(() => {
    // Only show to logged-in users AND only on app pages (not landing/auth)
    // Only show on core app pages — never on landing, auth, or onboarding
    const appRoutes = [
      "/dashboard",
      "/expenses",
      "/budget",
      "/insights",
      "/settings",
      "/upgrade",
    ];
    const isAppPage = appRoutes.some((r) => location.pathname.startsWith(r));

    if (!user || !isAppPage) return;

    const timer = setTimeout(() => {
      const notifPermission = Notification.permission;
      const alreadyAsked = localStorage.getItem(NOTIF_ASKED_KEY);

      // Priority 1: notification permission (if not asked yet and not blocked)
      if (
        notifPermission === "default" &&
        !alreadyAsked &&
        !wasDismissedRecently(NOTIF_DISMISSED_KEY, 3)
      ) {
        setShowNotif(true);
        return;
      }

      // Priority 2: install prompt (if available and not dismissed recently)
      if (installEvent && !wasDismissedRecently(INSTALL_DISMISSED_KEY, 14)) {
        setShowInstall(true);
      }
    }, 45000); // 45 seconds — give user time to settle in

    return () => clearTimeout(timer);
  }, [user, installEvent, location.pathname]);

  // ── Also show notification prompt after install prompt is dismissed ────────
  useEffect(() => {
    if (!showInstall && notifGranted === false) {
      // check if we should now show notif prompt
      const notifPermission = Notification.permission;
      const alreadyAsked = localStorage.getItem(NOTIF_ASKED_KEY);
      if (
        notifPermission === "default" &&
        !alreadyAsked &&
        !wasDismissedRecently(NOTIF_DISMISSED_KEY, 3)
      ) {
        setTimeout(() => setShowNotif(true), 500);
      }
    }
  }, [showInstall, notifGranted]);

  // ── Notification permission request ───────────────────────────────────────
  const requestNotifPermission = useCallback(async () => {
    localStorage.setItem(NOTIF_ASKED_KEY, "1");
    setShowNotif(false);

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setNotifGranted(true);
        setToast("🔔 Notifications enabled! We'll keep you updated.");
        setTimeout(() => setToast(null), 4000);

        // Register push subscription if SW is active
        const reg = await navigator.serviceWorker.ready;
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (vapidKey && reg.pushManager) {
          try {
            await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });
          } catch (e) {
            console.warn("[Push] Subscription failed:", e);
          }
        }
      } else {
        dismiss(NOTIF_DISMISSED_KEY);
      }
    } catch (err) {
      console.warn("[Notif] Permission request failed:", err);
    }
  }, []);

  // ── PWA install ───────────────────────────────────────────────────────────
  const handleInstall = useCallback(async () => {
    if (!installEvent) return;
    setShowInstall(false);
    installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      setToast("✅ Truvllo added to your home screen!");
      setTimeout(() => setToast(null), 4000);
    }
    setInstallEvent(null);
  }, [installEvent]);

  const dismissInstall = useCallback(() => {
    dismiss(INSTALL_DISMISSED_KEY);
    setShowInstall(false);
  }, []);

  const dismissNotif = useCallback(() => {
    dismiss(NOTIF_DISMISSED_KEY);
    localStorage.setItem(NOTIF_ASKED_KEY, "1");
    setShowNotif(false);
  }, []);

  if (!showInstall && !showNotif && !toast) return null;

  return (
    <>
      <style>{styles}</style>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && <div className="notif-toast">{toast}</div>}

      {/* ── Notification permission prompt ────────────────────────────────── */}
      {showNotif && (
        <div className="prompt-overlay" onClick={dismissNotif}>
          <div className="prompt-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="prompt-handle" />
            <div className="prompt-icon">🔔</div>
            <div className="prompt-title">Stay on top of your budget</div>
            <div className="prompt-desc">
              Get smart alerts so you never overspend without knowing.
            </div>

            <div className="prompt-bullets">
              <div className="prompt-bullet">
                <div className="prompt-bullet-icon">⚡</div>
                <div className="prompt-bullet-text">
                  Over-pace alerts when you're spending too fast
                </div>
              </div>
              <div className="prompt-bullet">
                <div className="prompt-bullet-icon">📅</div>
                <div className="prompt-bullet-text">
                  Daily spending summary every evening
                </div>
              </div>
              <div className="prompt-bullet">
                <div className="prompt-bullet-icon">🎯</div>
                <div className="prompt-bullet-text">
                  AI savings tips personalised for you
                </div>
              </div>
            </div>

            <button
              className="prompt-btn-primary"
              onClick={requestNotifPermission}
            >
              🔔 Enable notifications
            </button>
            <button className="prompt-btn-ghost" onClick={dismissNotif}>
              Not now
            </button>
            <div className="prompt-note">
              You can change this any time in Settings · No spam, ever
            </div>
          </div>
        </div>
      )}

      {/* ── PWA install prompt ─────────────────────────────────────────────── */}
      {showInstall && (
        <div className="prompt-overlay" onClick={dismissInstall}>
          <div className="prompt-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="prompt-handle" />
            <div className="prompt-icon">📱</div>
            <div className="prompt-title">Add Truvllo to your home screen</div>
            <div className="prompt-desc">
              Get the full app experience — faster, offline-ready, and always
              one tap away.
            </div>

            <div className="prompt-bullets">
              <div className="prompt-bullet">
                <div className="prompt-bullet-icon">⚡</div>
                <div className="prompt-bullet-text">
                  Loads instantly — no browser needed
                </div>
              </div>
              <div className="prompt-bullet">
                <div className="prompt-bullet-icon">📶</div>
                <div className="prompt-bullet-text">
                  Works offline — view budget even without data
                </div>
              </div>
              <div className="prompt-bullet">
                <div className="prompt-bullet-icon">🏠</div>
                <div className="prompt-bullet-text">
                  Lives on your home screen like a native app
                </div>
              </div>
            </div>

            <button className="prompt-btn-primary" onClick={handleInstall}>
              📲 Add to Home Screen
            </button>
            <button className="prompt-btn-ghost" onClick={dismissInstall}>
              Maybe later
            </button>
            <div className="prompt-note">
              Free · No app store needed · Works on Android & iOS
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── VAPID key helper ───────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
