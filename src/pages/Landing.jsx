import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
`;

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
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(250,248,243,0.92); backdrop-filter: blur(12px);
    padding: 0 6%; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); }
  .nav-links { display: flex; align-items: center; gap: 32px; }
  .nav-links a { color: var(--ink-subtle); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color 0.2s; cursor: pointer; }
  .nav-links a:hover { color: var(--ink); }
  .nav-cta { background: var(--green-deep); color: var(--white); border: none; border-radius: 8px; padding: 10px 22px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .nav-cta:hover { background: var(--green-mid); }
  .nav-mobile-btn { display: none; background: none; border: none; cursor: pointer; font-size: 1.5rem; }
  @media(max-width:768px) { .nav-links { display: none; } .nav-mobile-btn { display: block; } }

  /* ── HERO ─────────────────────────────────────────────────────────────── */
  .hero { min-height: 100vh; padding: 120px 6% 80px; display: flex; flex-direction: column; justify-content: center; background: var(--cream); position: relative; overflow: hidden; }
  .hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; max-width: 1200px; margin: 0 auto; width: 100%; }
  @media(max-width:900px) { .hero-inner { grid-template-columns: 1fr; } }
  .hero-left { animation: fadeUp 0.6s ease both; }
  .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: var(--green-pale); color: var(--green-deep); padding: 6px 14px; border-radius: 100px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 28px; border: 1px solid rgba(27,67,50,0.15); }
  .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-light); animation: pulse 2s ease infinite; }
  .hero-headline { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 5vw, 4.5rem); font-weight: 900; line-height: 1.08; letter-spacing: -0.02em; color: var(--ink); margin-bottom: 24px; }
  .hero-headline em { font-style: italic; color: var(--green-mid); display: block; }
  .hero-sub { font-size: 1.1rem; color: var(--ink-subtle); line-height: 1.7; max-width: 480px; margin-bottom: 40px; }
  .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary { background: var(--green-deep); color: var(--white); border: none; border-radius: 8px; padding: 14px 28px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 16px rgba(27,67,50,0.25); }
  .btn-primary:hover { background: var(--green-mid); transform: translateY(-1px); }
  .btn-outline { background: transparent; color: var(--ink); border: 1.5px solid var(--border); border-radius: 8px; padding: 13px 24px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-outline:hover { border-color: var(--green-light); color: var(--green-mid); }
  .hero-right { display: flex; align-items: center; justify-content: center; animation: fadeUp 0.6s ease 0.2s both; }
  .hero-phone-slot { width: 100%; max-width: 420px; aspect-ratio: 9/16; background: linear-gradient(135deg, var(--cream-dark) 0%, rgba(64,145,108,0.08) 100%); border-radius: 32px; border: 2px dashed rgba(27,67,50,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--ink-subtle); font-size: 0.875rem; font-weight: 500; position: relative; overflow: hidden; }
  .hero-phone-slot::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 60% 40%, rgba(64,145,108,0.12) 0%, transparent 60%); }
  .hero-phone-icon { font-size: 3rem; opacity: 0.4; }
  .hero-phone-text { opacity: 0.6; text-align: center; line-height: 1.5; font-size: 0.82rem; }
  @media(max-width:900px) { .hero-right { display: none; } }

  /* ── STATS STRIP ───────────────────────────────────────────────────────── */
  .stats-strip { background: var(--cream-dark); padding: 60px 6%; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 40px; align-items: center; }
  @media(max-width:900px) { .stats-inner { grid-template-columns: 1fr 1fr; } }
  @media(max-width:500px) { .stats-inner { grid-template-columns: 1fr; } }
  .stat-item { text-align: center; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 900; color: var(--ink); line-height: 1; }
  .stat-val span { color: var(--green-mid); }
  .stat-label { font-size: 0.82rem; color: var(--ink-subtle); margin-top: 6px; font-weight: 500; }
  .stat-divider { width: 1px; height: 60px; background: var(--border); margin: 0 auto; }
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
  .fi-green { background: var(--green-pale); }
  .fi-amber { background: rgba(212,160,23,0.12); }
  .fi-ink   { background: rgba(10,10,10,0.06); }
  .fi-whatsapp { background: rgba(37,211,102,0.15); }
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

  /* WhatsApp chat mockup */
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
  .cta-phone-slot { width: 220px; aspect-ratio: 9/18; background: rgba(255,255,255,0.06); border-radius: 24px; border: 1px dashed rgba(255,255,255,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: rgba(255,255,255,0.3); font-size: 0.75rem; text-align: center; flex-shrink: 0; }
  @media(max-width:768px) { .cta-phone-slot { display: none; } }

  /* ── FOOTER ───────────────────────────────────────────────────────────── */
  .footer { background: var(--ink); padding: 64px 6% 32px; }
  .footer-top { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  @media(max-width:900px) { .footer-top { grid-template-columns: 1fr 1fr; } }
  @media(max-width:500px) { .footer-top { grid-template-columns: 1fr; } }
  .footer-brand-name { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .footer-brand-desc { font-size: 0.875rem; color: rgba(255,255,255,0.4); line-height: 1.7; max-width: 260px; }
  .footer-col-title { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px; }
  .footer-col a { display: block; color: rgba(255,255,255,0.55); font-size: 0.875rem; text-decoration: none; margin-bottom: 10px; cursor: pointer; transition: color 0.2s; }
  .footer-col a:hover { color: var(--white); }
  .footer-bottom { max-width: 1200px; margin: 28px auto 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.3); }
  .footer-wordmark { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 8vw, 7rem); font-weight: 900; color: rgba(255,255,255,0.04); text-align: center; display: block; margin-top: 48px; letter-spacing: -0.02em; line-height: 1; max-width: 1200px; margin-left: auto; margin-right: auto; }

  /* ── MOBILE ───────────────────────────────────────────────────────────── */
  @media(max-width:480px) {
    .nav { padding: 0 4%; height: 60px; }
    .nav-logo { font-size: 1.25rem; }
    .nav-cta { padding: 8px 14px; font-size: 0.8rem; }
    .hero { padding: 90px 4% 60px; min-height: auto; }
    .hero-headline { font-size: 2.2rem; margin-bottom: 18px; }
    .hero-sub { font-size: 0.95rem; margin-bottom: 28px; max-width: 100%; }
    .hero-btns { flex-direction: row; gap: 10px; flex-wrap: nowrap; }
    .btn-primary, .btn-outline { flex: 1; text-align: center; padding: 13px 12px; font-size: 0.85rem; }
    .hero-right { display: none; }
    .stats-strip { padding: 40px 4%; }
    .stats-inner { grid-template-columns: 1fr 1fr; gap: 24px; }
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
    .hero { padding: 100px 5% 60px; }
    .hero-headline { font-size: 2.8rem; }
    .hero-right { display: none; }
    .stats-inner { grid-template-columns: 1fr 1fr; gap: 24px; }
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
    desc: "Type it in plain language. Your 14-day Premium trial activates automatically — all AI features unlocked.",
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

  const price = billing === "monthly" ? "6,500" : "4,875";
  const period = billing === "monthly" ? "/mo" : "/mo (billed annually)";

  return (
    <>
      <style>{FONTS + styles}</style>

      {/* NAV */}
      <nav
        className="nav"
        style={{ boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none" }}
      >
        <div
          className="nav-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="nav-logo-dot" />
          Truvllo
        </div>
        <div className="nav-links">
          <a onClick={() => scrollTo("features")}>Features</a>
          <a onClick={() => scrollTo("whatsapp")}>WhatsApp</a>
          <a onClick={() => scrollTo("pricing")}>Pricing</a>
          <a onClick={() => scrollTo("how")}>How it works</a>
        </div>
        <button className="nav-cta" onClick={goToAuth}>
          Get Started Free
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
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
              save more — even from WhatsApp.
            </p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={goToAuth}>
                Start Free — 14 Days
              </button>
              <button
                className="btn-outline"
                onClick={() => scrollTo("features")}
              >
                View Features
              </button>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-phone-slot">
              <div className="hero-phone-icon">📱</div>
              <div className="hero-phone-text">
                Add your phone
                <br />
                hand image here
              </div>
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
              No need to open the app. Send your bank statement PDF, check your
              balance, log expenses, and get instant alerts — all from WhatsApp.
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
                Try it free — 14 days
              </button>
              <span className="wa-note">
                Premium & Trial only · No card needed
              </span>
            </div>
          </div>

          {/* Chat mockup */}
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
              No complicated setup. No financial jargon. Go from signup to your
              first budget in under 3 minutes — and start seeing where your
              money goes immediately.
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
              ₦{price}
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
              Start 14-day free trial
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
          🎉 Your <strong>14-day Premium trial</strong> starts automatically
          when you log your first expense — no card required.
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
              Start your free account today. No credit card. No tricks. Full AI
              access for your first 14 days automatically.
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
            <div style={{ fontSize: "2rem", opacity: 0.4 }}>📱</div>
            <div>Add phone image here</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="footer-brand-name">
              <span
                className="nav-logo-dot"
                style={{ background: "var(--amber)" }}
              />
              Truvllo
            </div>
            <p className="footer-brand-desc">
              The smart budgeting app that thinks with you. Take control of your
              money, wherever you are in Africa.
            </p>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <a onClick={() => scrollTo("features")}>Features</a>
            <a onClick={() => scrollTo("whatsapp")}>WhatsApp Agent</a>
            <a onClick={() => scrollTo("pricing")}>Pricing</a>
            <a onClick={() => scrollTo("how")}>How it works</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a onClick={() => navigate("/about")}>About</a>
            <a onClick={() => navigate("/blog")}>Blog</a>
            <a onClick={() => navigate("/careers")}>Careers</a>
            <a onClick={() => navigate("/contact")}>Contact</a>
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
