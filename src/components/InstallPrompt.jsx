import { useState, useEffect } from "react";

const DISMISS_KEY = "truvllo_install_dismissed";

const styles = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-20px); }
  }

  .install-prompt {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    width: calc(100% - 32px);
    max-width: 420px;
    background: #0A0A0A;
    border-radius: 18px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07);
    animation: slideDown 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  .install-prompt.dismissing {
    animation: slideUp 0.3s ease forwards;
    pointer-events: none;
  }

  .install-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #1B4332, #40916C);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    position: relative;
  }
  .install-icon-dot {
    position: absolute;
    top: 5px;
    right: 5px;
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
    font-size: 0.82rem;
    font-weight: 700;
    color: white;
    margin-bottom: 2px;
  }
  .install-sub {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.45);
    line-height: 1.4;
  }

  .install-actions {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }
  .install-btn {
    padding: 8px 14px;
    border-radius: 100px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.78rem;
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
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.5);
  }
  .install-btn.ghost:hover { background: rgba(255,255,255,0.14); }

  /* iOS prompt */
  .ios-prompt {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    width: calc(100% - 32px);
    max-width: 380px;
    background: #0A0A0A;
    border-radius: 18px;
    padding: 18px 18px 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07);
    animation: slideDown 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
  }
  .ios-prompt.dismissing {
    animation: slideUp 0.3s ease forwards;
    pointer-events: none;
  }
  .ios-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 0.7rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ios-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    padding-right: 28px;
  }
  .ios-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: linear-gradient(135deg, #1B4332, #40916C);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }
  .ios-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: white;
  }
  .ios-steps {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .ios-step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.78rem;
    color: rgba(255,255,255,0.55);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .ios-step-num {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(64,145,108,0.25);
    color: #52B788;
    font-size: 0.68rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ios-step strong { color: rgba(255,255,255,0.85); }
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
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    if (isIOS()) {
      const t = setTimeout(() => setShowIOS(true), 3000);
      return () => clearTimeout(t);
    }

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
      dismiss(false);
    }
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
            T
            <div className="install-icon-dot" />
          </div>
          <div className="install-body">
            <div className="install-title">Install Truvllo</div>
            <div className="install-sub">
              Add to your home screen for the best experience
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

      {/* iOS Safari */}
      {showIOS && (
        <div
          className={`ios-prompt${dismissing ? " dismissing" : ""}`}
          role="dialog"
          aria-label="Install Truvllo on iOS"
        >
          <button className="ios-close" onClick={() => dismiss(true)}>
            ✕
          </button>
          <div className="ios-header">
            <div className="ios-icon">T</div>
            <div className="ios-title">Add Truvllo to your home screen</div>
          </div>
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
                Tap <strong>"Add to Home Screen"</strong>
              </span>
            </div>
            <div className="ios-step">
              <div className="ios-step-num">3</div>
              <span>
                Tap <strong>"Add"</strong> to confirm
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
