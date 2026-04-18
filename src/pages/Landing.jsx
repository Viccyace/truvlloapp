import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TRIAL_DAYS } from "../lib/config";

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #FAF8F3; font-family: 'Plus Jakarta Sans', sans-serif; color: #0A0A0A; overflow-x: hidden; }
  :root {
    --cream: #FAF8F3; --cream-dark: #F0EDE4;
    --green-deep: #1B4332; --green-mid: #2D6A4F; --green-light: #40916C; --green-pale: #D8F3DC;
    --ink: #0A0A0A; --ink-muted: #3A3A3A; --ink-subtle: #6B6B6B;
    --amber: #D4A017; --amber-light: #F0C040;
    --white: #FFFFFF; --border: rgba(10,10,10,0.08);
    --wa-green: #25D366;
  }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes barGrow  { from{width:0} }

  /* ── NAV ──────────────────────────────────────────────────────────────── */
  .nav { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); width: calc(100% - 48px); max-width: 1200px; z-index: 100; background: rgba(255,255,255,0.72); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); padding: 0 32px; height: 80px; display: flex; align-items: center; justify-content: space-between; border-radius: 24px; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset; }
  .nav-logo { display: flex; align-items: center; cursor: pointer; }
  .nav-logo-img { height: 131px; width: auto; }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); }
  .nav-links { display: flex; align-items: center; gap: 32px; }
  .nav-links a { color: var(--ink-subtle); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color 0.2s; cursor: pointer; }
  .nav-links a:hover { color: var(--ink); }
  .nav-cta { background: var(--green-deep); color: var(--white); border: none; border-radius: 8px; padding: 10px 22px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .nav-cta:hover { background: var(--green-mid); }
  .nav-mobile-btn { display: none; background: none; border: none; cursor: pointer; font-size: 1.5rem; }
  @media(max-width:768px) { .nav-links { display: none; } .nav-mobile-btn { display: block; } }

  /* ── HERO — centered, no video ────────────────────────────────────────── */
  .hero { min-height: 100vh; padding: 140px 6% 0; display: flex; flex-direction: column; align-items: center; background: var(--cream); position: relative; overflow: hidden; }
  .hero-inner { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 780px; width: 100%; animation: fadeUp 0.6s ease both; }
  .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: var(--green-pale); color: var(--green-deep); padding: 6px 14px; border-radius: 100px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 28px; border: 1px solid rgba(27,67,50,0.15); }
  .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-light); animation: pulse 2s ease infinite; }
  .hero-headline { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 900; line-height: 1.05; letter-spacing: -0.025em; color: var(--ink); margin-bottom: 24px; }
  .hero-headline em { font-style: italic; color: var(--green-mid); display: block; }
  .hero-sub { font-size: 1.1rem; color: var(--ink-subtle); line-height: 1.7; max-width: 520px; margin: 0 auto 40px; }
  .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-bottom: 64px; }
  .btn-primary { background: var(--green-deep); color: var(--white); border: none; border-radius: 8px; padding: 15px 32px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 16px rgba(27,67,50,0.25); }
  .btn-primary:hover { background: var(--green-mid); transform: translateY(-1px); }
  .btn-outline { background: transparent; color: var(--ink); border: 1.5px solid var(--border); border-radius: 8px; padding: 14px 28px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-outline:hover { border-color: var(--green-light); color: var(--green-mid); }
  /* Hero mockup — Vaultify-style centered image with radial fade */
  .hero-mockup-wrap {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    position: relative;
    background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(27,67,50,0.08) 0%, transparent 70%);
    padding: 0 24px;
  }
  .hero-mockup-wrap::after {
    content: "";
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 45%;
    background: linear-gradient(to bottom, transparent 0%, var(--cream) 100%);
    pointer-events: none;
    z-index: 2;
  }
  .hero-mockup-inner {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: relative;
  }
  .hero-mockup-img {
    width: 100%;
    max-width: 400px;
    height: auto;
    display: block;
    
    
    z-index: 1;
    margin: 0 auto;
    transition: transform 0.15s ease-out;
    will-change: transform;
    transform-origin: center bottom;
  }
  .hero-mockup-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 420px; gap: 20px; padding: 40px; width: 100%; }
  @media(max-width:640px) { .hero { padding-top: 120px; } .hero-mockup-wrap { padding: 0 12px; } .hero-mockup-img { max-width: 100%; border-radius: 16px 16px 0 0; } }

  /* ── STATS STRIP ───────────────────────────────────────────────────────── */
  .stats-strip { background: var(--cream-dark); padding: 60px 6%; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .stats-inner { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; gap: 0; align-items: center; justify-items: center; }
  @media(max-width:900px) { .stats-inner { grid-template-columns: 1fr 1fr; max-width:100%; gap:24px; justify-items:center; } .stat-divider { display:none; } }
  @media(max-width:500px) { .stats-inner { grid-template-columns: 1fr; } }
  .stat-item { text-align: center; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 900; color: var(--ink); line-height: 1; }
  .stat-val span { color: var(--green-mid); }
  .stat-label { font-size: 0.82rem; color: var(--ink-subtle); margin-top: 6px; font-weight: 500; }
  .stat-divider { width: 1px; height: 60px; background: var(--border); margin: 0 40px; }
  @media(max-width:900px) { .stat-divider { display: none; } }

  /* ── FEATURES ─────────────────────────────────────────────────────────── */
  .features-section { padding: 100px 6%; background: var(--white); }
  .section-header { text-align: center; margin-bottom: 64px; }
  .section-label { display: inline-block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green-mid); margin-bottom: 14px; }
  .section-headline { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.015em; color: var(--ink); }
  .section-sub { margin-top: 14px; color: var(--ink-subtle); font-size: 1rem; line-height: 1.7; }
  .features-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media(max-width:900px) { .features-grid { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:600px) { .features-grid { grid-template-columns: 1fr; } }
  .feature-card { background: var(--cream); border-radius: 20px; padding: 28px; border: 1.5px solid var(--border); transition: all 0.22s; display: flex; flex-direction: column; gap: 14px; position: relative; }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(10,10,10,0.08); border-color: rgba(27,67,50,0.2); }
  .feature-card.highlight { border: 2px solid var(--wa-green); overflow: visible; }
  .feature-card.highlight::before { content: "NEW"; position: absolute; top: -10px; right: 16px; background: var(--wa-green); color: #fff; font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 100px; letter-spacing: 0.08em; }
  .feature-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
  .fi-green { background: var(--green-pale); } .fi-amber { background: rgba(212,160,23,0.12); } .fi-ink { background: rgba(10,10,10,0.06); } .fi-whatsapp { background: rgba(37,211,102,0.15); }
  .feature-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; }
  .feature-desc  { font-size: 0.875rem; color: var(--ink-subtle); line-height: 1.65; }
  .feature-link  { font-size: 0.82rem; font-weight: 700; color: var(--green-mid); margin-top: auto; cursor: pointer; }

  /* ── WHATSAPP SECTION ─────────────────────────────────────────────────── */
  .wa-section { background: var(--ink); padding: 100px 6%; position: relative; overflow: hidden; }
  .wa-blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
  .wa-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  @media(max-width:900px) { .wa-inner { grid-template-columns: 1fr; gap: 48px; } }
  .wa-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(37,211,102,0.15); border: 1px solid rgba(37,211,102,0.3); border-radius: 100px; padding: 6px 16px; margin-bottom: 24px; }
  .wa-badge-text { font-size: 0.75rem; font-weight: 800; color: var(--wa-green); letter-spacing: 0.08em; text-transform: uppercase; }
  .wa-headline { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 900; color: #fff; line-height: 1.15; margin-bottom: 20px; letter-spacing: -0.02em; }
  .wa-headline span { color: var(--wa-green); }
  .wa-sub { font-size: 1rem; color: rgba(255,255,255,0.55); line-height: 1.75; margin-bottom: 36px; max-width: 440px; }
  .wa-features { display: flex; flex-direction: column; gap: 18px; margin-bottom: 40px; }
  .wa-feature { display: flex; gap: 14px; align-items: flex-start; }
  .wa-feature-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(37,211,102,0.12); border: 1px solid rgba(37,211,102,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
  .wa-feature-title { font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 3px; }
  .wa-feature-desc { font-size: 0.8rem; color: rgba(255,255,255,0.4); line-height: 1.5; }
  .wa-cta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .wa-btn { padding: 14px 28px; background: var(--wa-green); color: #fff; border: none; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px rgba(37,211,102,0.35); transition: all 0.2s; }
  .wa-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(37,211,102,0.45); }
  .wa-note { font-size: 0.8rem; color: rgba(255,255,255,0.3); }
  .wa-mockup { display: flex; justify-content: center; }
  .wa-chat { width: 100%; max-width: 320px; background: #0B141A; border-radius: 24px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.06); }
  .wa-chat-header { background: #1F2C34; padding: 14px 18px; display: flex; align-items: center; gap: 12px; }
  .wa-chat-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#1B4332,#40916C); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
  .wa-chat-name { font-size: 0.9rem; font-weight: 700; color: #fff; }
  .wa-chat-status { font-size: 0.72rem; color: var(--wa-green); }
  .wa-chat-body { padding: 16px 12px; display: flex; flex-direction: column; gap: 10px; }
  .wa-msg-out { align-self: flex-end; background: #005C4B; border-radius: 12px 12px 2px 12px; padding: 10px 14px; max-width: 85%; }
  .wa-msg-in  { align-self: flex-start; background: #1F2C34; border-radius: 12px 12px 12px 2px; padding: 10px 14px; max-width: 90%; }
  .wa-msg-text { font-size: 0.82rem; color: #fff; line-height: 1.5; }
  .wa-msg-time { font-size: 0.65rem; color: rgba(255,255,255,0.35); margin-top: 4px; }
  .wa-msg-time.right { text-align: right; }

  /* ── HOW IT WORKS ─────────────────────────────────────────────────────── */
  .how-section { padding: 100px 6%; background: var(--cream); }
  .how-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  @media(max-width:900px) { .how-inner { grid-template-columns: 1fr; gap: 48px; } }
  .how-steps { display: flex; flex-direction: column; gap: 32px; }
  .how-step { display: flex; gap: 20px; align-items: flex-start; }
  .how-step-num { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; background: var(--green-deep); color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 800; }
  .how-step-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; margin-bottom: 6px; }
  .how-step-desc  { font-size: 0.875rem; color: var(--ink-subtle); line-height: 1.65; }
  .how-headline { font-family: 'Playfair Display', serif; font-size: clamp(2.2rem, 4vw, 3.5rem); font-weight: 900; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 24px; }
  .how-headline em { font-style: italic; color: var(--green-mid); }
  .how-sub { font-size: 1rem; color: var(--ink-subtle); line-height: 1.7; margin-bottom: 32px; }

  /* ── PRICING ──────────────────────────────────────────────────────────── */
  .pricing-section { padding: 100px 6%; background: var(--white); }
  .pricing-toggle { display: inline-flex; background: var(--cream-dark); border-radius: 10px; padding: 4px; gap: 4px; margin: 32px auto 0; display: flex; justify-content: center; }
  .pricing-toggle button { padding: 8px 20px; border-radius: 8px; border: none; background: transparent; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600; color: var(--ink-subtle); cursor: pointer; transition: all 0.2s; }
  .pricing-toggle button.active { background: var(--white); color: var(--ink); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .pricing-grid { max-width: 1100px; margin: 48px auto 0; display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  @media(max-width:900px) { .pricing-grid { grid-template-columns: 1fr; max-width: 440px; } }
  .pricing-card { border: 1.5px solid var(--border); border-radius: 20px; padding: 32px; display: flex; flex-direction: column; gap: 0; background: var(--cream); }
  .pricing-card.featured { background: var(--green-deep); border-color: transparent; box-shadow: 0 20px 60px rgba(27,67,50,0.25); position: relative; }
  .pricing-badge { display: inline-block; background: var(--amber); color: var(--ink); font-size: 0.7rem; font-weight: 800; padding: 3px 10px; border-radius: 100px; margin-bottom: 16px; letter-spacing: 0.04em; text-transform: uppercase; width: fit-content; }
  .pricing-plan { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
  .featured .pricing-plan { color: rgba(255,255,255,0.7); }
  .pricing-price { font-family: 'Playfair Display', serif; font-size: 3rem; font-weight: 900; line-height: 1; color: var(--ink); margin-bottom: 8px; }
  .pricing-price span { font-size: 1rem; font-weight: 500; color: var(--ink-subtle); }
  .featured .pricing-price { color: var(--white); }
  .featured .pricing-price span { color: rgba(255,255,255,0.45); }
  .pricing-desc { font-size: 0.875rem; color: var(--ink-subtle); line-height: 1.6; margin-bottom: 24px; }
  .featured .pricing-desc { color: rgba(255,255,255,0.55); }
  .pricing-divider { height: 1px; background: var(--border); margin-bottom: 24px; }
  .featured .pricing-divider { background: rgba(255,255,255,0.1); }
  .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; flex: 1; }
  .pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: var(--ink-muted); }
  .featured .pricing-features li { color: rgba(255,255,255,0.75); }
  .pricing-features li .check { color: var(--green-light); font-weight: 800; flex-shrink: 0; }
  .featured .pricing-features li .check { color: var(--amber-light); }
  .pricing-btn { width: 100%; padding: 13px; border-radius: 10px; border: 1.5px solid var(--border); background: transparent; color: var(--ink); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: auto; }
  .pricing-btn:hover { border-color: var(--green-light); color: var(--green-mid); }
  .pricing-btn.featured-btn { background: var(--amber); color: var(--ink); border-color: transparent; box-shadow: 0 4px 16px rgba(212,160,23,0.3); }
  .pricing-btn.featured-btn:hover { background: var(--amber-light); }
  .pricing-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── TESTIMONIALS ─────────────────────────────────────────────────────── */
  .testimonials-section { padding: 100px 6%; background: var(--cream); }
  .testimonials-inner { max-width: 1200px; margin: 0 auto; }
  .testimonials-top { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; margin-bottom: 64px; }
  @media(max-width:768px) { .testimonials-top { grid-template-columns: 1fr; } }
  .testimonials-quote-mark { font-family: 'Playfair Display', serif; font-size: 8rem; line-height: 1; color: var(--green-pale); font-weight: 900; display: block; margin-bottom: -20px; }
  .testimonials-headline { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.015em; }
  .testimonials-stats { display: flex; gap: 32px; flex-wrap: wrap; }
  .t-stat-val { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; color: var(--ink); }
  .t-stat-val span { color: var(--green-mid); }
  .t-stat-label { font-size: 0.78rem; color: var(--ink-subtle); margin-top: 2px; }
  .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media(max-width:900px) { .testimonials-grid { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:600px) { .testimonials-grid { grid-template-columns: 1fr; } }
  .testimonial-card { background: var(--white); border-radius: 16px; padding: 24px; border: 1.5px solid var(--border); }
  .testimonial-stars { color: var(--amber); font-size: 0.875rem; margin-bottom: 12px; letter-spacing: 2px; }
  .testimonial-text { font-size: 0.9rem; color: var(--ink-muted); line-height: 1.7; margin-bottom: 16px; font-style: italic; }
  .testimonial-author { display: flex; align-items: center; gap: 10px; }
  .testimonial-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: var(--white); flex-shrink: 0; }
  .testimonial-name { font-size: 0.875rem; font-weight: 700; color: var(--ink); }
  .testimonial-role { font-size: 0.75rem; color: var(--ink-subtle); }

  /* ── CTA BANNER ───────────────────────────────────────────────────────── */
  .cta-banner { background: var(--green-deep); padding: 80px 6%; position: relative; overflow: hidden; }
  .cta-banner-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto; gap: 60px; align-items: center; }
  @media(max-width:768px) { .cta-banner-inner { grid-template-columns: 1fr; } }
  .cta-blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
  .cta-blob-1 { width: 400px; height: 400px; top: -100px; right: 200px; background: rgba(64,145,108,0.3); }
  .cta-blob-2 { width: 300px; height: 300px; bottom: -80px; left: 100px; background: rgba(212,160,23,0.15); }
  .cta-headline { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; color: var(--white); line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 16px; }
  .cta-headline em { font-style: italic; color: var(--amber-light); }
  .cta-sub { font-size: 1rem; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 32px; max-width: 480px; }
  .cta-btns { display: flex; gap: 14px; flex-wrap: wrap; }
  .cta-btn-primary { background: var(--white); color: var(--green-deep); border: none; border-radius: 8px; padding: 14px 28px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 800; cursor: pointer; transition: all 0.2s; }
  .cta-btn-primary:hover { background: var(--cream); transform: translateY(-1px); }
  .cta-btn-outline { background: transparent; color: rgba(255,255,255,0.8); border: 1.5px solid rgba(255,255,255,0.25); border-radius: 8px; padding: 13px 24px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .cta-btn-outline:hover { border-color: rgba(255,255,255,0.5); color: var(--white); }
  .cta-users { display: flex; align-items: center; gap: 12px; margin-top: 24px; }
  .cta-avatars { display: flex; }
  .cta-avatar { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--green-deep); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; color: var(--white); margin-left: -8px; }
  .cta-avatar:first-child { margin-left: 0; }
  .cta-users-text { font-size: 0.82rem; color: rgba(255,255,255,0.55); }
  .cta-phone-slot { width: 220px; height: 380px; border-radius: 24px; overflow: hidden; flex-shrink: 0; position: relative; box-shadow: 0 24px 60px rgba(0,0,0,0.3); }
  .cta-phone-slot::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: linear-gradient(to bottom, transparent, var(--green-deep)); pointer-events: none; }
  @media(max-width:768px) { .cta-phone-slot { display: none; } }

  /* ── FOOTER ───────────────────────────────────────────────────────────── */
  .footer { background: var(--ink); padding: 64px 6% 32px; }
  .footer-top { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  @media(max-width:900px) { .footer-top { grid-template-columns: 1fr 1fr; } }
  @media(max-width:500px) { .footer-top { grid-template-columns: 1fr; } }
  .footer-brand-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .footer-logo-svg { height: 111px; width: auto; } 
  .footer-brand-desc { font-size: 0.875rem; color: rgba(255,255,255,0.4); line-height: 1.7; max-width: 260px; }
  .footer-col-title { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px; }
  .footer-col a { display: block; color: rgba(255,255,255,0.55); font-size: 0.875rem; text-decoration: none; margin-bottom: 10px; cursor: pointer; transition: color 0.2s; }
  .footer-col a:hover { color: var(--white); }
  .footer-bottom { max-width: 1200px; margin: 28px auto 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.3); }
  .footer-wordmark { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 8vw, 7rem); font-weight: 900; color: rgba(255,255,255,0.04); text-align: center; display: block; margin-top: 48px; letter-spacing: -0.02em; line-height: 1; max-width: 1200px; margin-left: auto; margin-right: auto; }

  /* ── MOBILE ───────────────────────────────────────────────────────────── */
  @media(max-width:480px) {
    .nav { top: 10px; left: 50%; transform: translateX(-50%); width: calc(100% - 24px); height: 68px; padding: 0 20px; border-radius: 20px; }
    .nav-logo { font-size: 1.25rem; }
    .nav-cta { padding: 8px 14px; font-size: 0.8rem; }
    .hero { padding: 110px 4% 0; min-height: auto; }
    .hero-headline { font-size: 2.4rem; }
    .hero-sub { font-size: 0.95rem; }
    .hero-btns { flex-direction: row; gap: 10px; flex-wrap: nowrap; }
    .btn-primary, .btn-outline { flex: 1; text-align: center; padding: 13px 12px; font-size: 0.85rem; }
    .stats-strip { padding: 40px 4%; }
    .stats-inner { grid-template-columns: 1fr 1fr; gap: 24px; justify-items: center; }
    .stat-val { font-size: 2rem; }
    .features-section { padding: 60px 4%; }
    .section-header { margin-bottom: 40px; }
    .section-headline { font-size: 1.75rem; }
    .features-grid { grid-template-columns: 1fr; gap: 14px; }
    .feature-card { padding: 22px; }
    .wa-section { padding: 60px 4%; }
    .wa-inner { grid-template-columns: 1fr; gap: 40px; }
    .wa-headline { font-size: 2rem; }
    .wa-mockup { display: none; }
    .how-section { padding: 60px 4%; }
    .how-inner { grid-template-columns: 1fr; gap: 40px; }
    .how-right { order: -1; }
    .how-headline { font-size: 2rem; }
    .pricing-section { padding: 60px 4%; }
    .pricing-toggle { width: 100%; }
    .pricing-grid { grid-template-columns: 1fr; max-width: 100%; gap: 16px; margin-top: 32px; }
    .testimonials-section { padding: 60px 4%; }
    .testimonials-top { grid-template-columns: 1fr; gap: 24px; margin-bottom: 40px; }
    .testimonials-grid { grid-template-columns: 1fr; gap: 14px; }
    .cta-banner { padding: 60px 4%; }
    .cta-banner-inner { grid-template-columns: 1fr; }
    .cta-headline { font-size: 2rem; }
    .cta-btns { flex-direction: row; gap: 10px; }
    .cta-btn-primary, .cta-btn-outline { flex: 1; text-align: center; padding: 13px 12px; font-size: 0.85rem; }
    .footer { padding: 48px 4% 24px; }
    .footer-top { grid-template-columns: 1fr; gap: 32px; }
    .footer-wordmark { font-size: 3.5rem; margin-top: 32px; }
  }
  @media(min-width:481px) and (max-width:768px) {
    .hero { padding: 120px 5% 0; }
    .hero-headline { font-size: 2.8rem; }
    .stats-inner { grid-template-columns: 1fr 1fr; gap: 24px; justify-items: center; }
    .features-grid { grid-template-columns: 1fr 1fr; }
    .wa-inner { grid-template-columns: 1fr; }
    .wa-mockup { display: none; }
    .pricing-grid { grid-template-columns: 1fr; max-width: 480px; }
    .testimonials-grid { grid-template-columns: 1fr; }
    .how-inner { grid-template-columns: 1fr; }
    .how-right { order: -1; }
    .cta-phone-slot { display: none; }
    .footer-top { grid-template-columns: 1fr 1fr; }
  }
`;

const FEATURES = [
  {
    icon: "🤖",
    bg: "fi-green",
    title: "AI Spending Analyst",
    desc: "Claude analyses your expenses and tells you exactly where your money goes in plain English — not charts.",
  },
  {
    icon: "💬",
    bg: "fi-whatsapp",
    title: "WhatsApp AI Agent",
    desc: "Log expenses, import bank statements and get instant alerts — all from WhatsApp. No app needed.",
    highlight: true,
  },
  {
    icon: "⚡",
    bg: "fi-amber",
    title: "Instant Expense Entry",
    desc: 'Type "lunch 2500" and we log it. Natural language entry means no forms, no friction.',
  },
  {
    icon: "💰",
    bg: "fi-ink",
    title: "Safe-to-Spend Limit",
    desc: "A daily budget ceiling recalculated every morning. Always know how much you can spend today.",
  },
  {
    icon: "📊",
    bg: "fi-green",
    title: "Budget Pace Tracking",
    desc: "See if you're ahead or behind your ideal spending pace — in real time, every day.",
  },
  {
    icon: "🏦",
    bg: "fi-ink",
    title: "Bank Statement Import",
    desc: "Upload your PDF statement and AI extracts all transactions automatically. Minutes not hours.",
  },
];

const STEPS = [
  {
    title: "Create your account",
    desc: "Sign up free in 30 seconds. No credit card. No lengthy forms.",
  },
  {
    title: "Set your budget",
    desc: "Tell us your monthly income and spending limits. Our AI suggests smart defaults.",
  },
  {
    title: "Log your first expense",
    desc: `Type it in plain language. Your ${TRIAL_DAYS}-day Premium trial activates automatically — all AI features unlocked.`,
  },
];

const FREE_FEATURES = [
  "Unlimited budgets",
  "Expense logging",
  "Budget pace",
  "Safe-to-spend limit",
  "CSV export",
];
const PREMIUM_FEATURES = [
  "All AI features",
  "WhatsApp AI agent",
  "Bank statement import",
  "Category caps",
  "Recurring expenses",
  "Advanced insights",
  "Priority support",
];

const CURRENCY_CONFIG = {
  NGN: { symbol: "₦", monthly: "6,500", annual: "4,875" },
  GHS: { symbol: "₵", monthly: "6,500", annual: "4,875" },
  KES: { symbol: "KSh", monthly: "6,500", annual: "4,875" },
  ZAR: { symbol: "R", monthly: "6,500", annual: "4,875" },
  UGX: { symbol: "USh", monthly: "6,500", annual: "4,875" },
  TZS: { symbol: "TSh", monthly: "6,500", annual: "4,875" },
  USD: { symbol: "$", monthly: "14", annual: "10" },
  GBP: { symbol: "£", monthly: "11", annual: "8" },
  EUR: { symbol: "€", monthly: "13", annual: "9" },
};

const EUROPE_REGION_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "NO",
  "CH",
  "LI",
]);

const AFRICAN_FIXED_PRICE_REGIONS = {
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  UG: "UGX",
  TZ: "TZS",
};

function parseRegion(locale) {
  if (!locale) return null;
  const normalized = locale.replace(/_/g, "-");
  try {
    if (typeof Intl !== "undefined" && typeof Intl.Locale === "function") {
      const region = new Intl.Locale(normalized).region;
      if (region) return region.toUpperCase();
    }
  } catch {
    // ignore invalid locale
  }

  const match = normalized.match(/-([A-Za-z]{2})$/);
  return match ? match[1].toUpperCase() : null;
}

function detectLocalCurrency() {
  if (typeof navigator === "undefined") return "USD";
  const locale = navigator.language || navigator.languages?.[0] || "";
  const region = parseRegion(locale);
  if (region === "NG") return "NGN";
  if (AFRICAN_FIXED_PRICE_REGIONS[region])
    return AFRICAN_FIXED_PRICE_REGIONS[region];
  if (region === "US") return "USD";
  if (region === "GB") return "GBP";
  if (region && EUROPE_REGION_CODES.has(region)) return "EUR";
  return "USD";
}

function localPrice(currency, billing) {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  return billing === "monthly" ? config.monthly : config.annual;
}

const TESTIMONIALS = [
  {
    text: "Truvllo changed how I think about money. The daily safe-to-spend limit is the only budgeting tool that's actually worked for me.",
    name: "Adaeze O.",
    role: "Teacher, Lagos",
    stars: 5,
    color: "#40916C",
  },
  {
    text: "I used to wonder where my salary went every month. Now I know, within hours of receiving it. The AI insights are scary accurate.",
    name: "Chukwuemeka N.",
    role: "Engineer, Abuja",
    stars: 5,
    color: "#2D6A4F",
  },
  {
    text: "The bank import feature alone is worth it. 3 months of statements processed in 2 minutes. Incredible.",
    name: "Fatimah B.",
    role: "Entrepreneur, Kano",
    stars: 5,
    color: "#D4A017",
  },
  {
    text: "Finally a budgeting app that understands Nigerian realities — airtime, food deliveries, all categorised perfectly.",
    name: "Taiwo A.",
    role: "Student, Ibadan",
    stars: 5,
    color: "#1B4332",
  },
  {
    text: "I tried every budgeting app. Truvllo is the first one I've stuck with for more than a week. The AI coaching is different.",
    name: "Blessing I.",
    role: "Nurse, Port Harcourt",
    stars: 5,
    color: "#40916C",
  },
  {
    text: "The natural language entry is genius. I just type what I spend and it does the rest. Saves me 10 minutes every day.",
    name: "Samuel K.",
    role: "Driver, Lagos",
    stars: 5,
    color: "#2D6A4F",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToAuth = () => navigate("/auth");
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const localCurrency = detectLocalCurrency();
  const price = localPrice(localCurrency, billing);
  const period = billing === "monthly" ? "/mo" : "/mo (billed annually)";
  const currencySymbol = CURRENCY_CONFIG[localCurrency]?.symbol || "$";

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <header>
        <nav
          className="nav"
          style={{
            boxShadow: scrolled
              ? "0 12px 40px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.9) inset"
              : "0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
          }}
        >
          <div
            className="nav-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src="/logo.svg" alt="Truvllo" className="nav-logo-img" />
          </div>
          <div className="nav-links">
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("features");
              }}
            >
              Features
            </a>
            <a
              href="#whatsapp"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("whatsapp");
              }}
            >
              WhatsApp
            </a>
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("pricing");
              }}
            >
              Pricing
            </a>
            <a
              href="#how"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("how");
              }}
            >
              How it works
            </a>
          </div>
          <button className="nav-cta" onClick={goToAuth}>
            Get Started Free
          </button>
        </nav>
      </header>

      {/* HERO — centered, app mockup below, no video */}
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Now with WhatsApp AI Agent
            </div>
            <h1 className="hero-headline">
              Your Money.
              <em>Smarter Choices.</em>
              Every Day.
            </h1>
            <p className="hero-sub">
              Truvllo is a smart budgeting app that thinks with you. Track
              spending, get daily safe-to-spend limits, and let AI coach you to
              save more, even from WhatsApp.
            </p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={goToAuth}>
                Start Free — {TRIAL_DAYS} Days
              </button>
              <button
                className="btn-outline"
                onClick={() => scrollTo("features")}
              >
                View Features
              </button>
            </div>
          </div>

          {/* App mockup — 3D tilt on mouse move */}
          <div
            className="hero-mockup-wrap"
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              const img = el.querySelector(".hero-mockup-img");
              if (img)
                img.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) scale3d(1.02,1.02,1.02)`;
            }}
            onMouseLeave={(e) => {
              const img = e.currentTarget.querySelector(".hero-mockup-img");
              if (img)
                img.style.transform =
                  "perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
            }}
          >
            <div className="hero-mockup-inner">
              <img
                src="/hero-img.png"
                alt="Truvllo dashboard"
                className="hero-mockup-img"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="hero-mockup-placeholder"
                style={{ display: "none" }}
              >
                <div style={{ fontSize: "3rem" }}>📊</div>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  Your dashboard, here
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--ink-subtle)",
                    textAlign: "center",
                    maxWidth: 320,
                  }}
                >
                  Save a dashboard screenshot as{" "}
                  <code
                    style={{
                      background: "var(--cream-dark)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    /public/dashboard-preview.png
                  </code>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats-strip">
          <div className="stats-inner">
            <div className="stat-item">
              <div className="stat-val">
                2<span>K+</span>
              </div>
              <div className="stat-label">Active users</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-val">
                99<span>.9%</span>
              </div>
              <div className="stat-label">Uptime reliability</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-val">
                ₦<span>0</span>
              </div>
              <div className="stat-label">Transaction fees</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-val">
                6<span>+</span>
              </div>
              <div className="stat-label">West African currencies</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="features-section">
          <div className="section-header">
            <span className="section-label">Features</span>
            <h2 className="section-headline">Precision Financial Tools</h2>
            <p className="section-sub">
              A budgeting suite designed for speed, clarity, and real results.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`feature-card${f.highlight ? " highlight" : ""}`}
              >
                <div className={`feature-icon ${f.bg}`}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
                <div
                  className="feature-link"
                  onClick={f.highlight ? () => scrollTo("whatsapp") : goToAuth}
                >
                  {f.highlight ? "See how it works →" : "Learn more →"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHATSAPP SECTION */}
        <section id="whatsapp" className="wa-section">
          <div
            className="wa-blob"
            style={{
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle,rgba(37,211,102,0.15) 0%,transparent 70%)",
              top: -100,
              right: -100,
            }}
          />
          <div className="wa-inner">
            <div>
              <div className="wa-badge">
                <span>💬</span>
                <span className="wa-badge-text">New Feature</span>
              </div>
              <h2 className="wa-headline">
                Your budget lives
                <br />
                <span>in WhatsApp</span>
              </h2>
              <p className="wa-sub">
                No need to open the app. Send your bank statement PDF, check
                your balance, log expenses, and get instant alerts — all from
                WhatsApp.
              </p>
              <div className="wa-features">
                {[
                  [
                    "📄",
                    "Send PDF → auto-import",
                    "Forward your bank statement and AI extracts every transaction instantly",
                  ],
                  [
                    "⚡",
                    "Instant cap & pace alerts",
                    "Get notified the moment you're about to overspend",
                  ],
                  [
                    "💸",
                    "Log expenses by chat",
                    'Just type "spent 4500 on lunch" — we handle the rest',
                  ],
                  [
                    "📊",
                    "Daily 9pm summary",
                    "Your spending recap delivered every evening",
                  ],
                ].map(([icon, title, desc], i) => (
                  <div key={i} className="wa-feature">
                    <div className="wa-feature-icon">{icon}</div>
                    <div>
                      <div className="wa-feature-title">{title}</div>
                      <div className="wa-feature-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="wa-cta">
                <button className="wa-btn" onClick={goToAuth}>
                  Try it free — {TRIAL_DAYS} days
                </button>
                <span className="wa-note">
                  Premium & Trial only · No card needed
                </span>
              </div>
            </div>
            <div className="wa-mockup">
              <div className="wa-chat">
                <div className="wa-chat-header">
                  <div className="wa-chat-avatar">🤖</div>
                  <div>
                    <div className="wa-chat-name">Truvllo Agent</div>
                    <div className="wa-chat-status">● online</div>
                  </div>
                </div>
                <div className="wa-chat-body">
                  <div className="wa-msg-out">
                    <div className="wa-msg-text">spent 4500 on lunch</div>
                    <div className="wa-msg-time right">12:34 ✓✓</div>
                  </div>
                  <div className="wa-msg-in">
                    <div className="wa-msg-text">
                      ✅ <strong>₦4,500</strong> logged under Food
                      <br />
                      <br />
                      💰 Remaining: <strong>₦45,200</strong>
                      <br />
                      📅 12 days left this month
                    </div>
                    <div className="wa-msg-time">12:34</div>
                  </div>
                  <div className="wa-msg-in">
                    <div className="wa-msg-text">
                      ⚠️ <strong>Food cap alert!</strong>
                      <br />
                      ₦18,200 of ₦20,000 used
                      <br />
                      <span style={{ color: "#25D366", fontSize: "0.75rem" }}>
                        90% reached
                      </span>
                    </div>
                    <div className="wa-msg-time">18:45</div>
                  </div>
                  <div className="wa-msg-out">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        📄
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          GTB_Statement.pdf
                        </div>
                        <div
                          style={{
                            fontSize: "0.68rem",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          94.5 KB
                        </div>
                      </div>
                    </div>
                    <div className="wa-msg-time right">12:40 ✓✓</div>
                  </div>
                  <div className="wa-msg-in">
                    <div className="wa-msg-text">
                      📊 Found <strong>23 transactions</strong>
                      <br />
                      Total: ₦187,400
                      <br />
                      <br />
                      Import all? Reply <strong>YES</strong> or{" "}
                      <strong>NO</strong>
                    </div>
                    <div className="wa-msg-time">12:41</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="how-section">
          <div className="how-inner">
            <div className="how-steps">
              {STEPS.map((s, i) => (
                <div key={i} className="how-step">
                  <div className="how-step-num">{i + 1}</div>
                  <div>
                    <div className="how-step-title">{s.title}</div>
                    <p className="how-step-desc">{s.desc}</p>
                  </div>
                </div>
              ))}
              <button
                className="btn-primary"
                style={{ marginTop: 8, width: "fit-content" }}
                onClick={goToAuth}
              >
                Open an account
              </button>
            </div>
            <div className="how-right">
              <h2 className="how-headline">
                Simple.<em>Transparent.</em>Fast.
              </h2>
              <p className="how-sub">
                No complicated setup. No financial jargon. Go from signup to
                your first budget in under 3 minutes — and start seeing where
                your money goes immediately.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="pricing-section">
          <div className="section-header">
            <span className="section-label">Pricing</span>
            <h2 className="section-headline">Plans that scale with you</h2>
            <p className="section-sub">
              Choose the perfect plan for your money goals.
            </p>
          </div>
          <div className="pricing-toggle">
            <button
              className={billing === "monthly" ? "active" : ""}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </button>
            <button
              className={billing === "annual" ? "active" : ""}
              onClick={() => setBilling("annual")}
            >
              Annual{" "}
              <span style={{ color: "var(--green-mid)", fontWeight: 800 }}>
                −25%
              </span>
            </button>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-plan">Basic</div>
              <div className="pricing-price">
                ₦0<span>/month</span>
              </div>
              <p className="pricing-desc">
                The essentials to get you started. No card needed.
              </p>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i}>
                    <span className="check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="pricing-btn" onClick={goToAuth}>
                Get started free
              </button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-plan">Premium</div>
              <div className="pricing-price">
                {currencySymbol}
                {price}
                <span>{period}</span>
              </div>
              <p className="pricing-desc">
                Full AI suite + WhatsApp agent for serious money management.
              </p>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={i}>
                    <span className="check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="pricing-btn featured-btn" onClick={goToAuth}>
                Start {TRIAL_DAYS}-day free trial
              </button>
            </div>
            <div
              className="pricing-card"
              style={{ opacity: 0.75, position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "var(--amber-light)",
                  color: "var(--ink)",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "100px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Coming Soon
              </div>
              <div className="pricing-plan">Business</div>
              <div className="pricing-price" style={{ fontSize: "2rem" }}>
                Custom
              </div>
              <p className="pricing-desc">
                Team budgets, expense approvals, and financial oversight for
                organisations.
              </p>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                {[
                  "Everything in Premium",
                  "API integration",
                  "Account manager",
                  "Custom roles",
                  "Tailored solutions",
                ].map((f, i) => (
                  <li key={i}>
                    <span className="check">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="pricing-btn"
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              >
                Coming soon
              </button>
            </div>
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: 32,
              color: "var(--ink-subtle)",
              fontSize: "0.875rem",
            }}
          >
            🎉 Your <strong>{TRIAL_DAYS}-day Premium trial</strong> starts
            automatically when you log your first expense — no card required.
          </p>
        </section>

        {/* TESTIMONIALS */}
        <section className="testimonials-section">
          <div className="testimonials-inner">
            <div className="testimonials-top">
              <div>
                <span className="testimonials-quote-mark">"</span>
                <h2 className="testimonials-headline">
                  What our users are saying
                </h2>
              </div>
              <div className="testimonials-stats">
                <div>
                  <div className="t-stat-val">
                    2<span>K+</span>
                  </div>
                  <div className="t-stat-label">Active users</div>
                </div>
                <div>
                  <div className="t-stat-val">
                    4.8<span>★</span>
                  </div>
                  <div className="t-stat-label">Average rating</div>
                </div>
              </div>
            </div>
            <div className="testimonials-grid">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <div
                      className="testimonial-avatar"
                      style={{ background: t.color }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="cta-banner">
          <div className="cta-blob cta-blob-1" />
          <div className="cta-blob cta-blob-2" />
          <div className="cta-banner-inner">
            <div>
              <h2 className="cta-headline">
                Join people who<em>moved</em> <em>their money smarter.</em>
              </h2>
              <p className="cta-sub">
                Start your free account today. No credit card. No tricks. Full
                AI access for your first {TRIAL_DAYS} days automatically.
              </p>
              <div className="cta-btns">
                <button className="cta-btn-primary" onClick={goToAuth}>
                  Open an Account
                </button>
                <button
                  className="cta-btn-outline"
                  onClick={() => scrollTo("features")}
                >
                  Learn More
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 24,
                  alignItems: "center",
                }}
              >
                <div
                  style={{ position: "relative", cursor: "default" }}
                  title="Coming Soon to App Store"
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--amber)",
                      color: "var(--ink)",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "100px",
                      whiteSpace: "nowrap",
                      zIndex: 1,
                    }}
                  >
                    Coming Soon
                  </div>
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 10,
                      padding: "8px 16px",
                      opacity: 0.9,
                    }}
                  >
                    <img
                      src="/apple_store.png"
                      alt="Download on App Store"
                      style={{
                        height: 36,
                        display: "block",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{ position: "relative", cursor: "default" }}
                  title="Coming Soon to Google Play"
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--amber)",
                      color: "var(--ink)",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "100px",
                      whiteSpace: "nowrap",
                      zIndex: 1,
                    }}
                  >
                    Coming Soon
                  </div>
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 10,
                      padding: "8px 16px",
                      opacity: 0.9,
                    }}
                  >
                    <img
                      src="/google_play_store.png"
                      alt="Get it on Google Play"
                      style={{
                        height: 36,
                        display: "block",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="cta-users">
                <div className="cta-avatars">
                  {["#40916C", "#2D6A4F", "#D4A017", "#1B4332", "#52B788"].map(
                    (c, i) => (
                      <div
                        key={i}
                        className="cta-avatar"
                        style={{ background: c }}
                      >
                        {["A", "C", "F", "T", "B"][i]}
                      </div>
                    ),
                  )}
                </div>
                <div className="cta-users-text">
                  Join 2,000+ users already budgeting smarter
                </div>
              </div>
            </div>
            <div className="cta-phone-slot">
              <img
                src="/truvllo.png"
                alt="Truvllo app in use"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  display: "block",
                  borderRadius: "24px",
                }}
              />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div style={{ marginBottom: 16 }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                width="1024"
                zoomAndPan="magnify"
                viewBox="0 40 556 200"
                height="1024"
                preserveAspectRatio="xMidYMid meet"
                version="1.0"
                className="footer-logo-svg"
              >
                <defs>
                  <g />
                  <clipPath id="9128201e7f">
                    <rect x="0" width="556" y="0" height="221" />
                  </clipPath>
                </defs>
                <g>
                  <g clip-path="url(#9128201e7f)">
                    <g fill="#ffffff" fill-opacity="1">
                      <g transform="translate(1.318542, 174.548132)">
                        <g>
                          <path d="M 28.5 -124.71875 L 92.109375 -124.71875 C 94.128906 -124.71875 95.71875 -125.03125 96.875 -125.65625 C 98.039062 -126.28125 99.082031 -126.890625 100 -127.484375 C 100.914062 -128.078125 101.96875 -128.375 103.15625 -128.375 C 104.707031 -128.375 105.910156 -127.988281 106.765625 -127.21875 C 107.628906 -126.445312 108.300781 -125.171875 108.78125 -123.390625 L 114.828125 -95.328125 C 115.367188 -92.359375 114.445312 -90.632812 112.0625 -90.15625 C 109.75 -89.675781 108.03125 -90.65625 106.90625 -93.09375 C 104.769531 -98.195312 102.882812 -102.320312 101.25 -105.46875 C 99.613281 -108.625 98.007812 -111.046875 96.4375 -112.734375 C 94.863281 -114.429688 93.15625 -115.585938 91.3125 -116.203125 C 89.46875 -116.828125 87.300781 -117.140625 84.8125 -117.140625 L 70.734375 -117.140625 L 70.734375 -12.828125 C 70.734375 -10.335938 72.21875 -8.734375 75.1875 -8.015625 L 80.984375 -6.953125 C 82.222656 -6.597656 83.09375 -6.117188 83.59375 -5.515625 C 84.101562 -4.921875 84.359375 -4.179688 84.359375 -3.296875 C 84.359375 -1.097656 82.90625 0 80 0 L 40.625 0 C 37.71875 0 36.265625 -1.097656 36.265625 -3.296875 C 36.265625 -4.179688 36.515625 -4.921875 37.015625 -5.515625 C 37.515625 -6.117188 38.390625 -6.597656 39.640625 -6.953125 L 45.4375 -8.015625 C 48.40625 -8.734375 49.890625 -10.335938 49.890625 -12.828125 L 49.890625 -117.140625 L 35.8125 -117.140625 C 33.320312 -117.140625 31.15625 -116.828125 29.3125 -116.203125 C 27.46875 -115.585938 25.757812 -114.429688 24.1875 -112.734375 C 22.613281 -111.046875 21.007812 -108.625 19.375 -105.46875 C 17.738281 -102.320312 15.851562 -98.195312 13.71875 -93.09375 C 12.59375 -90.65625 10.867188 -89.675781 8.546875 -90.15625 C 6.171875 -90.632812 5.253906 -92.359375 5.796875 -95.328125 L 11.84375 -123.390625 C 12.320312 -125.171875 12.988281 -126.445312 13.84375 -127.21875 C 14.707031 -127.988281 15.910156 -128.375 17.453125 -128.375 C 18.703125 -128.375 19.769531 -128.078125 20.65625 -127.484375 C 21.550781 -126.890625 22.59375 -126.28125 23.78125 -125.65625 C 24.96875 -125.03125 26.539062 -124.71875 28.5 -124.71875 Z M 28.5 -124.71875 " />
                        </g>
                      </g>
                    </g>
                    <g fill="#ffffff" fill-opacity="1">
                      <g transform="translate(103.235475, 174.548132)">
                        <g>
                          <path d="M 36.796875 -80.265625 L 37.5 -65.484375 C 39.757812 -72.066406 43.023438 -77.082031 47.296875 -80.53125 C 51.578125 -83.976562 56.125 -85.703125 60.9375 -85.703125 C 66.34375 -85.703125 70.546875 -84.21875 73.546875 -81.25 C 76.546875 -78.28125 78.046875 -74.148438 78.046875 -68.859375 C 78.046875 -64.765625 77.164062 -61.660156 75.40625 -59.546875 C 73.65625 -57.441406 71.382812 -56.390625 68.59375 -56.390625 C 65.800781 -56.390625 63.632812 -57.175781 62.09375 -58.75 C 60.550781 -60.320312 59.78125 -62.503906 59.78125 -65.296875 L 59.78125 -68.328125 C 59.71875 -70.347656 59.210938 -71.847656 58.265625 -72.828125 C 57.316406 -73.804688 55.769531 -74.296875 53.625 -74.296875 C 51.070312 -74.296875 48.578125 -73.285156 46.140625 -71.265625 C 43.710938 -69.242188 41.722656 -66.1875 40.171875 -62.09375 C 38.628906 -58 37.859375 -52.832031 37.859375 -46.59375 L 37.859375 -12.46875 C 37.859375 -10.925781 38.195312 -9.769531 38.875 -9 C 39.5625 -8.226562 40.738281 -7.722656 42.40625 -7.484375 L 50.421875 -6.328125 C 52.921875 -5.972656 54.171875 -4.875 54.171875 -3.03125 C 54.171875 -1.007812 52.773438 0 49.984375 0 L 12.109375 0 C 9.441406 0 8.109375 -1.007812 8.109375 -3.03125 C 8.109375 -4.507812 9.144531 -5.546875 11.21875 -6.140625 L 15.40625 -7.125 C 16.59375 -7.425781 17.484375 -7.976562 18.078125 -8.78125 C 18.671875 -9.582031 18.96875 -10.785156 18.96875 -12.390625 L 18.96875 -67.34375 C 18.96875 -68.707031 18.742188 -69.703125 18.296875 -70.328125 C 17.859375 -70.953125 17.101562 -71.328125 16.03125 -71.453125 L 10.0625 -71.71875 C 8.101562 -71.957031 7.125 -72.816406 7.125 -74.296875 C 7.125 -75.066406 7.390625 -75.796875 7.921875 -76.296875 C 8.460938 -76.804688 9.382812 -77.296875 10.6875 -77.765625 L 25.125 -82.84375 C 27.5 -83.675781 29.265625 -84.238281 30.421875 -84.53125 C 31.578125 -84.832031 32.484375 -84.984375 33.140625 -84.984375 C 34.265625 -84.984375 35.125 -84.625 35.71875 -83.90625 C 36.3125 -83.195312 36.671875 -81.984375 36.796875 -80.265625 Z M 36.796875 -80.265625 " />
                        </g>
                      </g>
                    </g>
                    <g fill="#ffffff" fill-opacity="1">
                      <g transform="translate(169.873466, 174.548132)">
                        <g>
                          <path d="M 16.390625 -24.328125 L 16.390625 -67.4375 C 16.390625 -68.800781 16.164062 -69.796875 15.71875 -70.421875 C 15.28125 -71.046875 14.523438 -71.414062 13.453125 -71.53125 L 7.484375 -71.796875 C 5.523438 -72.035156 4.546875 -72.898438 4.546875 -74.390625 C 4.546875 -75.160156 4.8125 -75.796875 5.34375 -76.296875 C 5.875 -76.804688 6.796875 -77.296875 8.109375 -77.765625 L 22.8125 -82.9375 C 24.707031 -83.65625 26.25 -84.160156 27.4375 -84.453125 C 28.625 -84.753906 29.632812 -84.90625 30.46875 -84.90625 C 32.070312 -84.90625 33.273438 -84.488281 34.078125 -83.65625 C 34.878906 -82.820312 35.28125 -81.660156 35.28125 -80.171875 L 35.28125 -27.171875 C 35.28125 -21.234375 36.71875 -16.789062 39.59375 -13.84375 C 42.476562 -10.90625 46.328125 -9.4375 51.140625 -9.4375 C 54.109375 -9.4375 57.296875 -10.207031 60.703125 -11.75 C 64.117188 -13.300781 67.757812 -15.707031 71.625 -18.96875 L 72.15625 -19.421875 L 72.15625 -67.4375 C 72.15625 -68.800781 71.914062 -69.796875 71.4375 -70.421875 C 70.96875 -71.046875 70.226562 -71.414062 69.21875 -71.53125 L 63.15625 -71.796875 C 61.257812 -72.035156 60.3125 -72.898438 60.3125 -74.390625 C 60.3125 -75.160156 60.5625 -75.796875 61.0625 -76.296875 C 61.570312 -76.804688 62.507812 -77.296875 63.875 -77.765625 L 78.484375 -82.9375 C 80.378906 -83.65625 81.921875 -84.160156 83.109375 -84.453125 C 84.304688 -84.753906 85.378906 -84.90625 86.328125 -84.90625 C 87.867188 -84.90625 89.023438 -84.488281 89.796875 -83.65625 C 90.566406 -82.820312 90.953125 -81.660156 90.953125 -80.171875 L 90.953125 -12.46875 C 90.953125 -10.8125 91.265625 -9.582031 91.890625 -8.78125 C 92.515625 -7.976562 93.390625 -7.425781 94.515625 -7.125 L 98.53125 -6.234375 C 100.664062 -5.523438 101.734375 -4.457031 101.734375 -3.03125 C 101.734375 -1.007812 100.335938 0 97.546875 0 L 82.046875 0 C 79.191406 0 76.914062 -0.929688 75.21875 -2.796875 C 73.53125 -4.671875 72.6875 -7.242188 72.6875 -10.515625 L 72.6875 -13.1875 C 66.21875 -7.601562 60.503906 -3.664062 55.546875 -1.375 C 50.585938 0.90625 45.820312 2.046875 41.25 2.046875 C 36.320312 2.046875 31.984375 0.976562 28.234375 -1.15625 C 24.492188 -3.289062 21.582031 -6.332031 19.5 -10.28125 C 17.425781 -14.238281 16.390625 -18.921875 16.390625 -24.328125 Z M 16.390625 -24.328125 " />
                        </g>
                      </g>
                    </g>
                    <g fill="#ffffff" fill-opacity="1">
                      <g transform="translate(264.217862, 174.548132)">
                        <g>
                          <path d="M 52.203125 1.0625 L 45.875 1.0625 C 42.726562 1.0625 40.5625 -0.535156 39.375 -3.734375 L 12.46875 -70.734375 C 11.519531 -73.171875 10.703125 -74.757812 10.015625 -75.5 C 9.335938 -76.238281 8.492188 -76.726562 7.484375 -76.96875 L 4.1875 -77.59375 C 3.0625 -77.894531 2.257812 -78.3125 1.78125 -78.84375 C 1.300781 -79.375 1.0625 -80.023438 1.0625 -80.796875 C 1.0625 -82.816406 2.398438 -83.828125 5.078125 -83.828125 L 40.984375 -83.828125 C 42.222656 -83.828125 43.195312 -83.554688 43.90625 -83.015625 C 44.625 -82.484375 44.984375 -81.773438 44.984375 -80.890625 C 44.984375 -80.054688 44.726562 -79.382812 44.21875 -78.875 C 43.71875 -78.375 42.847656 -77.976562 41.609375 -77.6875 L 37.859375 -77.0625 C 34.953125 -76.582031 33.242188 -75.675781 32.734375 -74.34375 C 32.234375 -73.007812 32.632812 -70.585938 33.9375 -67.078125 L 54.875 -13.28125 L 75.71875 -67.078125 C 77.082031 -70.585938 77.5 -73.007812 76.96875 -74.34375 C 76.4375 -75.675781 74.6875 -76.582031 71.71875 -77.0625 L 68.0625 -77.6875 C 66.8125 -77.976562 65.929688 -78.375 65.421875 -78.875 C 64.921875 -79.382812 64.671875 -80.054688 64.671875 -80.890625 C 64.671875 -81.773438 65.023438 -82.484375 65.734375 -83.015625 C 66.453125 -83.554688 67.4375 -83.828125 68.6875 -83.828125 L 93.546875 -83.828125 C 94.734375 -83.828125 95.679688 -83.554688 96.390625 -83.015625 C 97.097656 -82.484375 97.453125 -81.742188 97.453125 -80.796875 C 97.453125 -80.023438 97.226562 -79.382812 96.78125 -78.875 C 96.34375 -78.375 95.5 -77.976562 94.25 -77.6875 L 90.953125 -77.15625 C 89.828125 -76.914062 88.832031 -76.171875 87.96875 -74.921875 C 87.113281 -73.671875 86.0625 -71.472656 84.8125 -68.328125 L 58.625 -3.296875 C 57.90625 -1.628906 57.007812 -0.488281 55.9375 0.125 C 54.875 0.75 53.628906 1.0625 52.203125 1.0625 Z M 52.203125 1.0625 " />
                        </g>
                      </g>
                    </g>
                    <g fill="#ffffff" fill-opacity="1">
                      <g transform="translate(348.49531, 174.548132)">
                        <g>
                          <path d="M 37.859375 -126.6875 L 37.859375 -12.46875 C 37.859375 -10.8125 38.15625 -9.582031 38.75 -8.78125 C 39.34375 -7.976562 40.234375 -7.425781 41.421875 -7.125 L 45.4375 -6.234375 C 47.507812 -5.523438 48.546875 -4.457031 48.546875 -3.03125 C 48.546875 -1.007812 47.179688 0 44.453125 0 L 12.109375 0 C 9.441406 0 8.109375 -1.007812 8.109375 -3.03125 C 8.109375 -4.507812 9.144531 -5.546875 11.21875 -6.140625 L 15.40625 -7.125 C 16.59375 -7.425781 17.484375 -7.976562 18.078125 -8.78125 C 18.671875 -9.582031 18.96875 -10.785156 18.96875 -12.390625 L 18.96875 -113.9375 C 18.96875 -115.300781 18.742188 -116.296875 18.296875 -116.921875 C 17.859375 -117.546875 17.101562 -117.914062 16.03125 -118.03125 L 10.0625 -118.3125 C 8.101562 -118.539062 7.125 -119.398438 7.125 -120.890625 C 7.125 -121.660156 7.390625 -122.296875 7.921875 -122.796875 C 8.460938 -123.304688 9.382812 -123.800781 10.6875 -124.28125 L 25.390625 -129.4375 C 27.285156 -130.15625 28.828125 -130.660156 30.015625 -130.953125 C 31.203125 -131.253906 32.210938 -131.40625 33.046875 -131.40625 C 34.648438 -131.40625 35.851562 -130.988281 36.65625 -130.15625 C 37.457031 -129.320312 37.859375 -128.164062 37.859375 -126.6875 Z M 37.859375 -126.6875 " />
                        </g>
                      </g>
                    </g>
                    <g fill="#ffffff" fill-opacity="1">
                      <g transform="translate(388.763207, 174.548132)">
                        <g>
                          <path d="M 37.859375 -126.6875 L 37.859375 -12.46875 C 37.859375 -10.8125 38.15625 -9.582031 38.75 -8.78125 C 39.34375 -7.976562 40.234375 -7.425781 41.421875 -7.125 L 45.4375 -6.234375 C 47.507812 -5.523438 48.546875 -4.457031 48.546875 -3.03125 C 48.546875 -1.007812 47.179688 0 44.453125 0 L 12.109375 0 C 9.441406 0 8.109375 -1.007812 8.109375 -3.03125 C 8.109375 -4.507812 9.144531 -5.546875 11.21875 -6.140625 L 15.40625 -7.125 C 16.59375 -7.425781 17.484375 -7.976562 18.078125 -8.78125 C 18.671875 -9.582031 18.96875 -10.785156 18.96875 -12.390625 L 18.96875 -113.9375 C 18.96875 -115.300781 18.742188 -116.296875 18.296875 -116.921875 C 17.859375 -117.546875 17.101562 -117.914062 16.03125 -118.03125 L 10.0625 -118.3125 C 8.101562 -118.539062 7.125 -119.398438 7.125 -120.890625 C 7.125 -121.660156 7.390625 -122.296875 7.921875 -122.796875 C 8.460938 -123.304688 9.382812 -123.800781 10.6875 -124.28125 L 25.390625 -129.4375 C 27.285156 -130.15625 28.828125 -130.660156 30.015625 -130.953125 C 31.203125 -131.253906 32.210938 -131.40625 33.046875 -131.40625 C 34.648438 -131.40625 35.851562 -130.988281 36.65625 -130.15625 C 37.457031 -129.320312 37.859375 -128.164062 37.859375 -126.6875 Z M 37.859375 -126.6875 " />
                        </g>
                      </g>
                    </g>
                    <g fill="#ffffff" fill-opacity="1">
                      <g transform="translate(429.031104, 174.548132)">
                        <g>
                          <path d="M 52.46875 -85.609375 C 59 -85.609375 64.984375 -84.539062 70.421875 -82.40625 C 75.859375 -80.269531 80.550781 -77.238281 84.5 -73.3125 C 88.445312 -69.394531 91.503906 -64.765625 93.671875 -59.421875 C 95.835938 -54.078125 96.921875 -48.164062 96.921875 -41.6875 C 96.921875 -35.394531 95.835938 -29.585938 93.671875 -24.265625 C 91.503906 -18.953125 88.414062 -14.320312 84.40625 -10.375 C 80.394531 -6.425781 75.628906 -3.367188 70.109375 -1.203125 C 64.585938 0.960938 58.5 2.046875 51.84375 2.046875 C 45.3125 2.046875 39.328125 0.976562 33.890625 -1.15625 C 28.460938 -3.289062 23.769531 -6.316406 19.8125 -10.234375 C 15.863281 -14.160156 12.804688 -18.8125 10.640625 -24.1875 C 8.472656 -29.5625 7.390625 -35.457031 7.390625 -41.875 C 7.390625 -48.226562 8.472656 -54.0625 10.640625 -59.375 C 12.804688 -64.6875 15.894531 -69.300781 19.90625 -73.21875 C 23.914062 -77.144531 28.679688 -80.191406 34.203125 -82.359375 C 39.734375 -84.523438 45.820312 -85.609375 52.46875 -85.609375 Z M 58.796875 -5.703125 C 63.722656 -6.410156 67.742188 -8.441406 70.859375 -11.796875 C 73.984375 -15.160156 76.0625 -19.675781 77.09375 -25.34375 C 78.132812 -31.019531 78.003906 -37.6875 76.703125 -45.34375 C 75.398438 -53.0625 73.257812 -59.457031 70.28125 -64.53125 C 67.3125 -69.613281 63.71875 -73.296875 59.5 -75.578125 C 55.289062 -77.867188 50.628906 -78.628906 45.515625 -77.859375 C 40.585938 -77.148438 36.566406 -75.113281 33.453125 -71.75 C 30.335938 -68.394531 28.257812 -63.894531 27.21875 -58.25 C 26.175781 -52.613281 26.304688 -45.9375 27.609375 -38.21875 C 28.921875 -30.5 31.0625 -24.097656 34.03125 -19.015625 C 37 -13.941406 40.601562 -10.273438 44.84375 -8.015625 C 49.09375 -5.753906 53.742188 -4.984375 58.796875 -5.703125 Z M 58.796875 -5.703125 " />
                        </g>
                      </g>
                    </g>
                    <g fill="#d4a017" fill-opacity="1">
                      <g transform="translate(519.100525, 174.548132)">
                        <g>
                          <path d="M 21.734375 1.609375 C 19.296875 1.609375 17.082031 0.984375 15.09375 -0.265625 C 13.101562 -1.515625 11.515625 -3.160156 10.328125 -5.203125 C 9.140625 -7.253906 8.546875 -9.46875 8.546875 -11.84375 C 8.546875 -14.34375 9.140625 -16.613281 10.328125 -18.65625 C 11.515625 -20.707031 13.101562 -22.328125 15.09375 -23.515625 C 17.082031 -24.703125 19.296875 -25.296875 21.734375 -25.296875 C 24.234375 -25.296875 26.476562 -24.703125 28.46875 -23.515625 C 30.457031 -22.328125 32.046875 -20.707031 33.234375 -18.65625 C 34.421875 -16.613281 35.015625 -14.34375 35.015625 -11.84375 C 35.015625 -9.46875 34.421875 -7.253906 33.234375 -5.203125 C 32.046875 -3.160156 30.457031 -1.515625 28.46875 -0.265625 C 26.476562 0.984375 24.234375 1.609375 21.734375 1.609375 Z M 21.734375 1.609375 " />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <p className="footer-brand-desc">
              The smart budgeting app that thinks with you. Take control of your
              money, wherever you are in Africa.
            </p>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("features");
              }}
            >
              Features
            </a>
            <a
              href="#whatsapp"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("whatsapp");
              }}
            >
              WhatsApp Agent
            </a>
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("pricing");
              }}
            >
              Pricing
            </a>
            <a
              href="#how"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("how");
              }}
            >
              How it works
            </a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                navigate("/about");
              }}
            >
              About
            </a>
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                navigate("/blog");
              }}
            >
              Blog
            </a>
            <a
              href="/careers"
              onClick={(e) => {
                e.preventDefault();
                navigate("/careers");
              }}
            >
              Careers
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                navigate("/contact");
              }}
            >
              Contact
            </a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Connect</div>
            <a
              href="https://twitter.com/truvlloapp"
              target="_blank"
              rel="noreferrer"
            >
              Twitter / X
            </a>
            <a
              href="https://instagram.com/truvlloapp"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              href="/security"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Security
            </a>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} Truvllo. All rights reserved.
          </span>
          <span className="footer-copy">Powered by Paystack</span>
        </div>
        <div className="footer-wordmark">Truvllo</div>
      </footer>
    </>
  );
}
