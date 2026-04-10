import { useState, useEffect } from "react";

const DISMISS_KEY = "truvllo_install_dismissed";
const IOS_SHOWN_KEY = "truvllo_ios_prompt_shown";

const styles = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-20px); }
  }
  @keyframes slideInBottom {
    from { opacity: 0; transform: translateY(100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideOutBottom {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(100%); }
  }

  .install-prompt {
    position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
    z-index: 9999; width: calc(100% - 32px); max-width: 420px;
    background: #0A0A0A; border-radius: 18px; padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07);
    animation: slideDown 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  .install-prompt.dismissing { animation: slideUp 0.3s ease forwards; pointer-events: none; }

  .install-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, #1B4332, #40916C);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 1.2rem;
    font-weight: 700; color: white; flex-shrink: 0; position: relative;
  }
  .install-icon-dot {
    position: absolute; top: 5px; right: 5px;
    width: 7px; height: 7px; border-radius: 50%; background: #D4A017;
  }
  .install-body { flex: 1; min-width: 0; }
  .install-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; font-weight: 700; color: white; margin-bottom: 2px; }
  .install-sub   { font-size: 0.72rem; color: rgba(255,255,255,0.45); line-height: 1.4; }
  .install-actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
  .install-btn {
    padding: 8px 14px; border-radius: 100px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.78rem;
    font-weight: 700; cursor: pointer; transition: all 0.18s;
    border: none; white-space: nowrap;
  }
  .install-btn.primary  { background: #40916C; color: white; }
  .install-btn.primary:hover { background: #2D6A4F; }
  .install-btn.ghost    { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }
  .install-btn.ghost:hover { background: rgba(255,255,255,0.14); }

  /* iOS bottom sheet */
  .ios-sheet {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
    background: #0A0A0A;
    border-radius: 24px 24px 0 0;
    padding: 12px 20px 40px;
    box-shadow: 0 -8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06);
    animation: slideInBottom 0.4s cubic-bezier(0.34, 1.1, 0.64, 1);
    max-width: 480px; margin: 0 auto;
  }
  .ios-sheet.dismissing { animation: slideOutBottom 0.3s ease forwards; pointer-events: none; }
  .ios-sheet-handle {
    width: 36px; height: 4px; border-radius: 100px;
    background: rgba(255,255,255,0.15); margin: 0 auto 16px;
  }
  .ios-sheet-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .ios-sheet-icon {
    width: 48px; height: 48px; border-radius: 13px;
    background: linear-gradient(135deg, #1B4332, #40916C);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 1.3rem;
    font-weight: 700; color: white; flex-shrink: 0;
  }
  .ios-sheet-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 700; color: white; margin-bottom: 2px; }
  .ios-sheet-sub   { font-size: 0.78rem; color: rgba(255,255,255,0.45); }
  .ios-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .ios-step  { display: flex; align-items: center; gap: 12px; }
  .ios-step-num {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: rgba(64,145,108,0.2); border: 1px solid rgba(64,145,108,0.3);
    color: #52B788; font-size: 0.72rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
  }
  .ios-step-text { font-size: 0.85rem; color: rgba(255,255,255,0.65); line-height: 1.4; font-family: 'Plus Jakarta Sans', sans-serif; }
  .ios-step-text strong { color: rgba(255,255,255,0.9); }
  .ios-dismiss {
    width: 100%; padding: 13px; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; background: transparent; color: rgba(255,255,255,0.5);
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem;
    font-weight: 600; cursor: pointer;
  }

  /* Push notification info banner for iOS */
  .ios-push-info {
    background: rgba(64,145,108,0.12); border: 1px solid rgba(64,145,108,0.2);
    border-radius: 10px; padding: 10px 14px; margin-bottom: 16px;
    font-size: 0.78rem; color: rgba(255,255,255,0.55); line-height: 1.5;
  }
  .ios-push-info strong { color: #52B788; }
`;

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isIOSSafari() {
  const ua = navigator.userAgent;
  return isIOS() && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
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
    // Already installed — don't show anything
    if (isInStandaloneMode()) return;
    // Already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;

    if (isIOS()) {
      // iOS Safari: show after 4s — only if not already shown this session
      if (!sessionStorage.getItem(IOS_SHOWN_KEY) && isIOSSafari()) {
        const t = setTimeout(() => {
          setShowIOS(true);
          sessionStorage.setItem(IOS_SHOWN_KEY, "1");
        }, 4000);
        return () => clearTimeout(t);
      }
      return;
    }

    // Android / Chrome — wait for browser install prompt
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
    dismiss(outcome === "accepted");
    setDeferredPrompt(null);
  };

  if (!showAndroid && !showIOS) return null;

  return (
    <>
      <style>{styles}</style>

      {/* Android / Chrome */}
      {showAndroid && (
        <div
          className={`install-prompt${dismissing ? " dismissing" : ""}`}
          role="dialog"
          aria-label="Install Truvllo"
        >
          <div className="install-icon">
            T<div className="install-icon-dot" />
          </div>
          <div className="install-body">
            <div className="install-title">Install Truvllo</div>
            <div className="install-sub">
              Add to home screen for the best experience
            </div>
          </div>
          <div className="install-actions">
            <button
              className="install-btn ghost"
              onClick={() => dismiss(false)}
            >
              Later
            </button>
            <button className="install-btn primary" onClick={install}>
              Install
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari — bottom sheet with clear steps */}
      {showIOS && (
        <div
          className={`ios-sheet${dismissing ? " dismissing" : ""}`}
          role="dialog"
          aria-label="Install Truvllo on iOS"
        >
          <div className="ios-sheet-handle" />
          <div className="ios-sheet-header">
            <div className="ios-sheet-icon">T</div>
            <div>
              <div className="ios-sheet-title">
                Add Truvllo to your Home Screen
              </div>
              <div className="ios-sheet-sub">
                For the best experience + notifications
              </div>
            </div>
          </div>

          {/* Push notification note */}
          <div className="ios-push-info">
            <strong>🔔 Enable notifications too:</strong> After installing, open
            the app from your Home Screen → Settings → Enable push
            notifications. iOS only supports notifications for installed PWAs.
          </div>

          <div className="ios-steps">
            <div className="ios-step">
              <div className="ios-step-num">1</div>
              <div className="ios-step-text">
                Tap the <strong>Share button</strong> <strong>⎦↑</strong> at the
                bottom of Safari
              </div>
            </div>
            <div className="ios-step">
              <div className="ios-step-num">2</div>
              <div className="ios-step-text">
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </div>
            </div>
            <div className="ios-step">
              <div className="ios-step-num">3</div>
              <div className="ios-step-text">
                Tap <strong>"Add"</strong> in the top right corner
              </div>
            </div>
          </div>

          <button className="ios-dismiss" onClick={() => dismiss(true)}>
            Maybe later
          </button>
        </div>
      )}
    </>
  );
}
