/**
 * InstallPrompt.jsx  —  src/components/InstallPrompt.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Captures the browser's beforeinstallprompt event and shows a custom
 * branded install banner. Dismisses permanently using localStorage.
 *
 * Shows on:
 *   - Chrome/Edge on Android (most common for Nigerian users)
 *   - Chrome on desktop
 *   - Samsung Internet
 *
 * Does NOT show on:
 *   - iOS Safari (has its own "Add to Home Screen" flow)
 *   - Already installed PWAs
 *   - After user dismisses (stored in localStorage)
 *
 * Usage: render anywhere inside the app — suggestion is AppLayout.jsx
 *   <InstallPrompt />
 */

import { useState, useEffect } from "react";

const DISMISS_KEY = "truvllo_install_dismissed";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(20px); }
  }

  .install-prompt {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 300;
    width: calc(100% - 32px);
    max-width: 420px;
    background: #0A0A0A;
    border-radius: 18px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07);
    animation: slideUp 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  .install-prompt.dismissing {
    animation: slideDown 0.3s ease forwards;
  }

  /* On mobile, sit above the bottom nav */
  @media (max-width: 900px) {
    .install-prompt {
      bottom: calc(72px + 16px); /* bottomnav height + gap */
    }
  }

  .install-icon {
    width: 48px;
    height: 48px;
    border-radius: 13px;
    background: linear-gradient(135deg, #1B4332, #40916C);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    position: relative;
  }
  .install-icon-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #D4A017;
  }

  .install-body {
    flex: 1;
    min-width: 0;
  }
  .install-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
    margin-bottom: 2px;
  }
  .install-sub {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.45);
    line-height: 1.4;
  }

  .install-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;
  }
  .install-btn {
    padding: 9px 16px;
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
    border: none;
    white-space: nowrap;
  }
  .install-btn.primary {
    background: #40916C;
    color: white;
  }
  .install-btn.primary:hover { background: #2D6A4F; }
  .install-btn.ghost {
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.5);
  }
  .install-btn.ghost:hover { background: rgba(255,255,255,0.12); }

  /* iOS-specific prompt (manual instructions) */
  .ios-prompt {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 300;
    width: calc(100% - 32px);
    max-width: 380px;
    background: #0A0A0A;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07);
    animation: slideUp 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  .ios-prompt.dismissing { animation: slideDown 0.3s ease forwards; }
  .ios-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.18s;
  }
  .ios-close:hover { background: rgba(255,255,255,0.15); }
  .ios-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: white;
    margin-bottom: 12px;
    padding-right: 28px;
  }
  .ios-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ios-step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.6);
  }
  .ios-step-num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(64,145,108,0.25);
    color: #52B788;
    font-size: 0.7rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ios-step strong { color: rgba(255,255,255,0.85); }

  /* Arrow pointing down to Safari toolbar */
  .ios-prompt::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border: 8px solid transparent;
    border-top-color: #0A0A0A;
    border-bottom: none;
  }
`;

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // Don't show if already installed or user dismissed before
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    if (isIOS()) {
      // Show iOS manual instructions after a short delay
      const t = setTimeout(() => setShowIOS(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Chrome desktop — capture the native prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = (permanent = true) => {
    setDismissing(true);
    if (permanent) localStorage.setItem(DISMISS_KEY, "1");
    setTimeout(() => {
      setShowAndroid(false);
      setShowIOS(false);
      setDismissing(false);
    }, 320);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      dismiss(true);
    } else {
      dismiss(false); // dismissed in native dialog — don't store permanently
    }
    setDeferredPrompt(null);
  };

  if (!showAndroid && !showIOS) return null;

  return (
    <>
      <style>{styles}</style>

      {/* Android / Chrome prompt */}
      {showAndroid && (
        <div
          className={`install-prompt${dismissing ? " dismissing" : ""}`}
          role="dialog"
          aria-label="Install Truvllo"
        >
          <div className="install-icon">
            T
            <div className="install-icon-dot" />
          </div>
          <div className="install-body">
            <div className="install-title">Install Truvllo</div>
            <div className="install-sub">
              Add to your home screen for the full app experience
            </div>
          </div>
          <div className="install-actions">
            <button
              className="install-btn ghost"
              onClick={() => dismiss(false)}
            >
              Not now
            </button>
            <button className="install-btn primary" onClick={install}>
              Install
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari prompt */}
      {showIOS && (
        <div
          className={`ios-prompt${dismissing ? " dismissing" : ""}`}
          role="dialog"
          aria-label="Install Truvllo on iOS"
        >
          <button className="ios-close" onClick={() => dismiss(true)}>
            ✕
          </button>
          <div className="ios-title">Install Truvllo on your iPhone</div>
          <div className="ios-steps">
            <div className="ios-step">
              <div className="ios-step-num">1</div>
              <span>
                Tap the <strong>Share button</strong> (□↑) at the bottom of
                Safari
              </span>
            </div>
            <div className="ios-step">
              <div className="ios-step-num">2</div>
              <span>
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </span>
            </div>
            <div className="ios-step">
              <div className="ios-step-num">3</div>
              <span>
                Tap <strong>"Add"</strong> — Truvllo will appear on your home
                screen
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
