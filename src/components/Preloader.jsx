/**
 * Preloader.jsx  —  src/components/Preloader.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows a branded splash screen ONLY on the very first visit of a session.
 * sessionStorage is cleared on tab close, so it shows once per browser session.
 *
 * Per spec:
 *   "Show the preloader only on the very first visit using sessionStorage
 *    — never on refresh or subsequent visits."
 *
 * Usage in main.jsx:
 *   <Preloader />
 *   <RouterProvider router={router} />
 */

import { useState, useEffect } from "react";

const PRELOADER_KEY = "truvllo_preloader_shown";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@500;600&display=swap');

  .preloader-root {
    position: fixed;
    inset: 0;
    background: #1B4332;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
  }

  @keyframes preloaderFadeOut {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.04); }
  }
  @keyframes logoReveal {
    0%   { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes taglineReveal {
    0%   { opacity: 0; transform: translateY(12px); }
    100% { opacity: 0.6; transform: translateY(0); }
  }
  @keyframes barFill {
    0%   { width: 0%; }
    100% { width: 100%; }
  }
  @keyframes dotsFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes bgBlob {
    0%, 100% { transform: scale(1) translate(0, 0); }
    33%       { transform: scale(1.1) translate(20px, -20px); }
    66%       { transform: scale(0.95) translate(-15px, 15px); }
  }

  .preloader-root.exiting {
    animation: preloaderFadeOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    pointer-events: none;
  }

  .preloader-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    animation: bgBlob 6s ease-in-out infinite;
  }
  .preloader-blob-1 {
    width: 400px; height: 400px;
    top: -100px; right: -80px;
    background: radial-gradient(circle, rgba(64,145,108,0.3) 0%, transparent 70%);
    animation-delay: 0s;
  }
  .preloader-blob-2 {
    width: 300px; height: 300px;
    bottom: -80px; left: -60px;
    background: radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%);
    animation-delay: -3s;
  }

  .preloader-logo {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .preloader-logo-mark {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 900;
    color: white;
    animation: logoReveal 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 0.1s both;
    position: relative;
  }
  .preloader-logo-dot {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #D4A017;
  }

  .preloader-wordmark {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 900;
    color: white;
    letter-spacing: -0.02em;
    animation: logoReveal 0.7s cubic-bezier(0.34, 1.3, 0.64, 1) 0.25s both;
  }

  .preloader-tagline {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.02em;
    animation: taglineReveal 0.6s ease 0.5s both;
    margin-top: -4px;
  }

  .preloader-bar-wrap {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    z-index: 1;
  }
  .preloader-bar-track {
    width: 100%;
    height: 2px;
    background: rgba(255,255,255,0.1);
    border-radius: 100px;
    overflow: hidden;
  }
  .preloader-bar-fill {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, #40916C, #D4A017);
    animation: barFill 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
  }

  .preloader-dots {
    display: flex;
    gap: 6px;
    margin-top: 28px;
    animation: taglineReveal 0.4s ease 0.7s both;
  }
  .preloader-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    animation: dotsFloat 1.4s ease-in-out infinite;
  }
  .preloader-dot:nth-child(2) { animation-delay: 0.15s; }
  .preloader-dot:nth-child(3) { animation-delay: 0.30s; }
`;

export default function Preloader({ onDone }) {
  const [visible,  setVisible]  = useState(false);
  const [exiting,  setExiting]  = useState(false);

  useEffect(() => {
    // Check if this session has already seen the preloader
    const alreadyShown = sessionStorage.getItem(PRELOADER_KEY);

    if (alreadyShown) {
      // Not first visit — skip preloader entirely
      onDone?.();
      return;
    }

    // First visit — show preloader
    sessionStorage.setItem(PRELOADER_KEY, "1");
    setVisible(true);

    // Wait for the loading bar animation (~2.1s) then exit
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 2100);

    // Remove from DOM after exit animation completes (~0.5s)
    const doneTimer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2650);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{styles}</style>
      <div className={`preloader-root${exiting ? " exiting" : ""}`} role="progressbar" aria-label="Loading Truvllo">
        <div className="preloader-blob preloader-blob-1" />
        <div className="preloader-blob preloader-blob-2" />

        <div className="preloader-logo">
          <div className="preloader-logo-mark">
            T
            <div className="preloader-logo-dot" />
          </div>
          <div className="preloader-wordmark">Truvllo</div>
          <div className="preloader-tagline">Your money, finally making sense</div>
          <div className="preloader-dots">
            <div className="preloader-dot" />
            <div className="preloader-dot" />
            <div className="preloader-dot" />
          </div>
        </div>

        <div className="preloader-bar-wrap">
          <div className="preloader-bar-track">
            <div className="preloader-bar-fill" />
          </div>
        </div>
      </div>
    </>
  );
}
