import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAF8F3; font-family: 'Plus Jakarta Sans', sans-serif; color: #0A0A0A; overflow-x: hidden; }

  :root {
    --cream: #FAF8F3;
    --cream-dark: #F0EDE4;
    --green-deep: #1B4332;
    --green-mid: #2D6A4F;
    --green-light: #40916C;
    --green-pale: #D8F3DC;
    --ink: #0A0A0A;
    --ink-muted: #3A3A3A;
    --ink-subtle: #6B6B6B;
    --amber: #D4A017;
    --amber-light: #F0C040;
    --white: #FFFFFF;
  }

  .playfair { font-family: 'Playfair Display', serif; }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: var(--ink); padding: 0 5%; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .nav-logo {
    font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700;
    color: var(--white); letter-spacing: -0.01em;
    display: flex; align-items: center; gap: 8px; cursor: pointer;
  }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); display: inline-block; margin-bottom: 2px; }
  .nav-links { display: flex; align-items: center; gap: 32px; }
  .nav-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color 0.2s; cursor: pointer; }
  .nav-links a:hover { color: var(--white); }
  .nav-cta { background: var(--green-light); color: var(--white); border: none; border-radius: 100px; padding: 10px 22px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .nav-cta:hover { background: var(--green-mid); transform: translateY(-1px); }
  @media (max-width: 768px) { .nav-links { display: none; } }

  /* HERO */
  .hero {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: var(--cream); padding: 120px 5% 80px; position: relative; overflow: hidden;
  }
  .hero-bg-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35; pointer-events: none; }
  .blob-1 { width: 600px; height: 600px; background: radial-gradient(circle, #40916C 0%, transparent 70%); top: -200px; right: -100px; }
  .blob-2 { width: 400px; height: 400px; background: radial-gradient(circle, #D4A017 0%, transparent 70%); bottom: -100px; left: -50px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--ink); color: var(--white); padding: 6px 16px 6px 10px; border-radius: 100px; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em; margin-bottom: 32px; }
  .hero-badge-pill { background: var(--amber); color: var(--ink); padding: 2px 8px; border-radius: 100px; font-size: 0.7rem; font-weight: 700; }
  .hero-headline { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 6vw, 5.5rem); font-weight: 900; line-height: 1.08; letter-spacing: -0.02em; text-align: center; max-width: 900px; color: var(--ink); }
  .hero-headline em { font-style: italic; color: var(--green-mid); }
  .hero-sub { margin-top: 24px; font-size: 1.125rem; color: var(--ink-subtle); line-height: 1.7; text-align: center; max-width: 580px; font-weight: 400; }
  .hero-actions { margin-top: 40px; display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; align-items: center; }
  .btn-primary { background: linear-gradient(135deg, var(--green-deep), var(--green-light)); color: var(--white); border: none; border-radius: 100px; padding: 16px 36px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.25s; box-shadow: 0 8px 32px rgba(27,67,50,0.3); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(27,67,50,0.4); }
  .btn-ghost { background: transparent; color: var(--ink-muted); border: 1.5px solid rgba(10,10,10,0.15); border-radius: 100px; padding: 15px 28px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .btn-ghost:hover { border-color: var(--green-light); color: var(--green-mid); }
  .hero-social-proof { margin-top: 48px; display: flex; align-items: center; gap: 16px; font-size: 0.875rem; color: var(--ink-subtle); }
  .avatar-stack { display: flex; }
  .avatar-placeholder { width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--cream); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: var(--white); }

  /* DASHBOARD PREVIEW */
  .dashboard-preview { margin-top: 72px; width: 100%; max-width: 900px; background: var(--ink); border-radius: 24px; padding: 24px; box-shadow: 0 40px 100px rgba(10,10,10,0.2), 0 0 0 1px rgba(255,255,255,0.06); }
  .dp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .dp-title { font-family: 'Playfair Display', serif; color: var(--white); font-size: 1.1rem; font-weight: 600; }
  .dp-month { font-size: 0.8rem; color: rgba(255,255,255,0.4); font-weight: 500; }
  .dp-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  @media (max-width: 640px) { .dp-cards { grid-template-columns: repeat(2, 1fr); } }
  .dp-card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.07); }
  .dp-card-label { font-size: 0.7rem; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .dp-card-value { font-size: 1.3rem; font-weight: 700; color: var(--white); font-family: 'Playfair Display', serif; }
  .dp-card-value.green { color: #52B788; }
  .dp-card-value.amber { color: var(--amber-light); }
  .dp-card-value.red { color: #FF8A80; }
  .dp-pace { background: rgba(255,255,255,0.04); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 16px; }
  .dp-pace-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .dp-pace-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); font-weight: 600; }
  .dp-pace-status { font-size: 0.75rem; background: rgba(82,183,136,0.15); color: #52B788; padding: 3px 10px; border-radius: 100px; font-weight: 700; }
  .dp-bar-track { background: rgba(255,255,255,0.08); border-radius: 100px; height: 8px; overflow: hidden; }
  .dp-bar-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #40916C, #52B788); transition: width 1s ease; }
  .dp-ai-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 500px) { .dp-ai-row { grid-template-columns: 1fr; } }
  .dp-ai-card { background: rgba(255,255,255,0.04); border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.06); }
  .dp-ai-tag { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .dp-ai-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  .dp-ai-tag-label { font-size: 0.7rem; color: var(--amber); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .dp-ai-text { font-size: 0.82rem; color: rgba(255,255,255,0.65); line-height: 1.5; }

  /* SECTIONS */
  .section { padding: 100px 5%; }
  .section-label { display: inline-block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green-mid); margin-bottom: 16px; }
  .section-headline { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.015em; max-width: 600px; }
  .section-sub { margin-top: 16px; color: var(--ink-subtle); font-size: 1.05rem; line-height: 1.7; max-width: 500px; }

  /* FEATURES */
  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 64px; }
  @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) { .features-grid { grid-template-columns: 1fr; } }
  .feature-card { background: var(--white); border-radius: 20px; padding: 32px; border: 1.5px solid rgba(10,10,10,0.07); transition: all 0.25s; }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(10,10,10,0.1); border-color: rgba(27,67,50,0.2); }
  .feature-icon { width: 52px; height: 52px; border-radius: 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
  .feature-icon.green { background: var(--green-pale); }
  .feature-icon.amber { background: rgba(212,160,23,0.12); }
  .feature-icon.ink { background: rgba(10,10,10,0.06); }
  .feature-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; }
  .feature-desc { font-size: 0.9rem; color: var(--ink-subtle); line-height: 1.65; }

  /* AI SECTION */
  .ai-section { background: var(--ink); padding: 100px 5%; position: relative; overflow: hidden; }
  .ai-bg { position: absolute; top: 0; right: 0; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(64,145,108,0.15) 0%, transparent 70%); pointer-events: none; }
  .ai-section .section-label { color: var(--amber); }
  .ai-section .section-headline { color: var(--white); }
  .ai-section .section-sub { color: rgba(255,255,255,0.5); }
  .ai-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 64px; }
  @media (max-width: 900px) { .ai-features-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) { .ai-features-grid { grid-template-columns: 1fr; } }
  .ai-feature-card { background: rgba(255,255,255,0.04); border-radius: 20px; padding: 28px; border: 1px solid rgba(255,255,255,0.08); transition: all 0.25s; }
  .ai-feature-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(212,160,23,0.3); }
  .ai-feature-card .feature-icon { background: rgba(255,255,255,0.06); }
  .ai-feature-card .feature-title { color: var(--white); }
  .ai-feature-card .feature-desc { color: rgba(255,255,255,0.5); }
  .ai-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(212,160,23,0.12); color: var(--amber); padding: 4px 12px; border-radius: 100px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 16px; }

  /* TESTIMONIALS */
  .testimonials-section { background: var(--cream-dark); padding: 100px 5%; }
  .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 64px; }
  @media (max-width: 900px) { .testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) { .testimonials-grid { grid-template-columns: 1fr; } }
  .testimonial-card { background: var(--white); border-radius: 20px; padding: 28px; border: 1.5px solid rgba(10,10,10,0.06); }
  .stars { display: flex; gap: 4px; margin-bottom: 16px; color: var(--amber); font-size: 0.9rem; }
  .testimonial-quote { font-size: 0.95rem; line-height: 1.7; color: var(--ink-muted); margin-bottom: 20px; font-style: italic; font-family: 'Playfair Display', serif; }
  .testimonial-author { display: flex; align-items: center; gap: 12px; }
  .testimonial-avatar { width: 40px; height: 40px; border-radius: 50%; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; color: var(--white); flex-shrink: 0; }
  .testimonial-name { font-weight: 700; font-size: 0.9rem; }
  .testimonial-role { font-size: 0.78rem; color: var(--ink-subtle); }

  /* PRICING */
  .pricing-section { padding: 100px 5%; text-align: center; }
  .pricing-section .section-headline { margin: 0 auto; }
  .pricing-section .section-sub { margin: 16px auto 0; }
  .pricing-toggle { display: inline-flex; background: var(--cream-dark); border-radius: 100px; padding: 4px; margin: 40px auto 0; gap: 4px; }
  .pricing-toggle button { border: none; border-radius: 100px; padding: 10px 24px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--ink-subtle); }
  .pricing-toggle button.active { background: var(--white); color: var(--ink); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; max-width: 1100px; margin-left: auto; margin-right: auto; }
  @media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr; max-width: 440px; } }
  .pricing-card { background: var(--white); border-radius: 24px; padding: 36px; border: 1.5px solid rgba(10,10,10,0.08); text-align: left; position: relative; }
  .pricing-card.featured { background: linear-gradient(160deg, var(--green-deep), var(--green-mid)); border-color: transparent; box-shadow: 0 20px 60px rgba(27,67,50,0.35); transform: scale(1.03); }
  .pricing-card.coming-soon { opacity: 0.7; }
  .pricing-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--amber); color: var(--ink); padding: 4px 16px; border-radius: 100px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
  .pricing-plan { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
  .pricing-price { font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 900; line-height: 1; margin-bottom: 4px; }
  .pricing-price span { font-size: 1rem; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; opacity: 0.6; }
  .pricing-desc { font-size: 0.875rem; color: var(--ink-subtle); margin-bottom: 28px; line-height: 1.5; }
  .pricing-card.featured .pricing-desc { color: rgba(255,255,255,0.6); }
  .pricing-card.featured .pricing-plan { color: rgba(255,255,255,0.85); }
  .pricing-divider { height: 1px; background: rgba(10,10,10,0.08); margin-bottom: 24px; }
  .pricing-card.featured .pricing-divider { background: rgba(255,255,255,0.15); }
  .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
  .pricing-features li { display: flex; align-items: flex-start; gap: 10px; font-size: 0.875rem; line-height: 1.5; }
  .pricing-features li .check { color: var(--green-light); font-size: 0.85rem; flex-shrink: 0; margin-top: 2px; }
  .pricing-card.featured .pricing-features li .check { color: #74C69D; }
  .pricing-card.featured .pricing-features li { color: rgba(255,255,255,0.85); }
  .pricing-btn { width: 100%; border-radius: 100px; padding: 14px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
  .pricing-btn.outline { background: transparent; border-color: rgba(10,10,10,0.15); color: var(--ink); }
  .pricing-btn.outline:hover { border-color: var(--green-light); color: var(--green-mid); }
  .pricing-btn.white { background: var(--white); color: var(--green-deep); }
  .pricing-btn.white:hover { background: var(--cream); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
  .pricing-btn.disabled { background: var(--cream-dark); color: var(--ink-subtle); cursor: not-allowed; border: none; }

  /* HOW IT WORKS */
  .how-section { background: var(--cream-dark); padding: 100px 5%; }
  .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 64px; }
  @media (max-width: 900px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) { .steps-grid { grid-template-columns: 1fr; } }
  .step { text-align: center; }
  .step-num { width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; color: var(--white); background: linear-gradient(135deg, var(--green-deep), var(--green-light)); box-shadow: 0 8px 24px rgba(27,67,50,0.3); }
  .step-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; }
  .step-desc { font-size: 0.875rem; color: var(--ink-subtle); line-height: 1.65; }

  /* CTA */
  .cta-section { background: linear-gradient(135deg, var(--green-deep) 0%, var(--green-light) 100%); padding: 100px 5%; text-align: center; position: relative; overflow: hidden; }
  .cta-section h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: var(--white); line-height: 1.15; max-width: 600px; margin: 0 auto 20px; }
  .cta-section p { color: rgba(255,255,255,0.7); font-size: 1.05rem; max-width: 480px; margin: 0 auto 40px; line-height: 1.7; }
  .cta-btn { background: var(--white); color: var(--green-deep); border: none; border-radius: 100px; padding: 18px 44px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.05rem; font-weight: 800; cursor: pointer; transition: all 0.25s; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
  .cta-trial-note { margin-top: 16px; font-size: 0.825rem; color: rgba(255,255,255,0.55); }

  /* FOOTER */
  .footer { background: var(--ink); color: rgba(255,255,255,0.5); padding: 64px 5% 40px; }
  .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  @media (max-width: 900px) { .footer-top { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) { .footer-top { grid-template-columns: 1fr; } }
  .footer-brand-name { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--white); margin-bottom: 12px; }
  .footer-brand-desc { font-size: 0.875rem; line-height: 1.65; max-width: 260px; }
  .footer-col-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); margin-bottom: 16px; }
  .footer-col a { display: block; font-size: 0.875rem; color: rgba(255,255,255,0.5); text-decoration: none; margin-bottom: 10px; transition: color 0.2s; cursor: pointer; }
  .footer-col a:hover { color: var(--white); }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.07); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 0.825rem; }
  .footer-copy { color: rgba(255,255,255,0.3); }
  .footer-love span { color: var(--amber); }

  @media (max-width: 768px) { .section { padding: 72px 5%; } .hero { padding: 100px 5% 60px; } }
`;

const avatarColors = ["#2D6A4F", "#D4A017", "#1B4332", "#40916C"];
const avatarInitials = ["A", "K", "T", "O"];

const FEATURES = [
  {
    icon: "📊",
    color: "green",
    title: "Budget Pace",
    desc: "See if you're spending too fast or on track — with a clear expected-vs-actual comparison updated daily.",
  },
  {
    icon: "💡",
    color: "amber",
    title: "Safe-to-Spend",
    desc: "Your daily spending allowance based on what's left and how many days remain in your budget period.",
  },
  {
    icon: "🔁",
    color: "ink",
    title: "Recurring Expenses",
    desc: "Set fixed costs like rent, subscriptions, and utilities once. Truvllo accounts for them automatically every month.",
  },
  {
    icon: "📁",
    color: "green",
    title: "Category Caps",
    desc: "Set limits per category — food, transport, entertainment — and get warned before you overshoot.",
  },
  {
    icon: "📤",
    color: "amber",
    title: "CSV Export",
    desc: "Download your full expense history any time. Perfect for tax season, accountants, or your own records.",
  },
  {
    icon: "🏆",
    color: "ink",
    title: "Habit Streaks",
    desc: "Stay consistent with daily logging streaks. A small nudge that builds a real money habit over time.",
  },
];

const AI_FEATURES = [
  {
    icon: "🔍",
    title: "Spending Analyst",
    desc: "Plain-English breakdown of your spending patterns each week — no spreadsheets needed.",
  },
  {
    icon: "💬",
    title: "Natural Language Entry",
    desc: 'Just type "spent 45 on lunch" and Truvllo logs it instantly. No forms, no friction.',
  },
  {
    icon: "🎯",
    title: "Savings Coach",
    desc: "One specific, data-driven tip each week on where you can actually cut back without sacrificing your lifestyle.",
  },
  {
    icon: "🏷️",
    title: "Smart Categorisation",
    desc: "Type a merchant name and Truvllo suggests the right category instantly — learns your habits over time.",
  },
  {
    icon: "📐",
    title: "Budget Advisor",
    desc: "Enter your income and a goal. The AI suggests a realistic monthly budget breakdown tailored to your life.",
  },
  {
    icon: "⚠️",
    title: "Overspend Explainer",
    desc: "When you're over pace, Truvllo tells you exactly why — and gives you specific cuts to get back on track.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Finally a budgeting app that actually thinks with me. The AI coach spotted I was overspending on food delivery before I even noticed.",
    name: "Adaeze O.",
    role: "Product Manager",
    color: "#2D6A4F",
  },
  {
    quote:
      "The AI spending coach saved me a lot last month. I didn't realise how much I was leaking on subscriptions until Truvllo called it out.",
    name: "Korede F.",
    role: "Software Engineer",
    color: "#1B4332",
  },
  {
    quote:
      "I've tried every budgeting app. None of them stuck. Truvllo is the first one where I've logged expenses for 3 months straight without missing a day.",
    name: "Temi A.",
    role: "Healthcare Professional",
    color: "#40916C",
  },
  {
    quote:
      "The Safe-to-Spend number is genius. I check it every morning before I make any purchase.",
    name: "Oluwaseun B.",
    role: "Civil Servant",
    color: "#D4A017",
  },
  {
    quote:
      "The premium trial started automatically after my first expense. I didn't even realise I was using premium features — it just worked.",
    name: "Funmilayo K.",
    role: "Small Business Owner",
    color: "#2D6A4F",
  },
  {
    quote:
      "The interface is honestly beautiful — it feels premium in a way that most finance apps never do.",
    name: "Emeka T.",
    role: "Investment Analyst",
    color: "#1B4332",
  },
];

const FREE_FEATURES = [
  "Unlimited budgets & expense logs",
  "Budget pace indicator",
  "Safe-to-spend daily limit",
  "6 supported currencies",
  "Mobile-first PWA",
  "Basic charts & summaries",
];
const PREMIUM_FEATURES = [
  "Everything in Free",
  "All 6 AI-powered features",
  "Category spending caps",
  "Recurring expense tracking",
  "Advanced charts & trends",
  "CSV export",
  "Habit streak tracking",
  "Priority support",
];

const STEPS = [
  {
    title: "Create your account",
    desc: "Sign up in under 30 seconds. No credit card, no commitment. Your data is yours.",
  },
  {
    title: "Set your budget",
    desc: "Enter your income and choose your currency. Done. Truvllo handles the maths.",
  },
  {
    title: "Log your first expense",
    desc: "Type it naturally or use the quick-add form. This unlocks your free 7-day premium trial instantly.",
  },
  {
    title: "Watch your money make sense",
    desc: "AI insights, pace tracking, and daily spending limits — all working together from day one.",
  },
];

export default function TruvlloLanding() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly");
  const [paceWidth, setPaceWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPaceWidth(62), 800);
    return () => clearTimeout(t);
  }, []);

  const price = billing === "monthly" ? "6,500" : "4,875";
  const period = billing === "monthly" ? "/mo" : "/mo, billed annually";
  const goToAuth = () => navigate("/auth");

  return (
    <>
      <style>{FONTS + styles}</style>

      {/* NAV */}
      <nav className="nav">
        <div
          className="nav-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="nav-logo-dot" />
          Truvllo
        </div>
        <div className="nav-links">
          <a
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Features
          </a>
          <a
            onClick={() =>
              document
                .getElementById("ai")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            AI Tools
          </a>
          <a
            onClick={() =>
              document
                .getElementById("pricing")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Pricing
          </a>
          <a
            onClick={() =>
              document
                .getElementById("how")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            How it works
          </a>
        </div>
        <button className="nav-cta" onClick={goToAuth}>
          Get Started Free
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-blob blob-1" />
        <div className="hero-bg-blob blob-2" />

        <div className="hero-badge">
          <span className="hero-badge-pill">NEW</span>
          The AI budgeting app that thinks with you
        </div>

        <h1 className="hero-headline playfair">
          Your money,
          <br />
          <em>finally making sense</em>
        </h1>

        <p className="hero-sub">
          Truvllo is the AI budgeting app that thinks with you. Know exactly
          what you can spend today, get smarter with every transaction, and take
          control of your money — wherever you are.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={goToAuth}>
            Start for free — no card needed
          </button>
          <button
            className="btn-ghost"
            onClick={() =>
              document
                .getElementById("how")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>▶</span> How it works
          </button>
        </div>

        <div className="hero-social-proof">
          <div className="avatar-stack">
            {avatarColors.map((c, i) => (
              <div
                key={i}
                className="avatar-placeholder"
                style={{ background: c, marginLeft: i === 0 ? 0 : -10 }}
              >
                {avatarInitials[i]}
              </div>
            ))}
          </div>
          <span>
            <strong style={{ color: "#0A0A0A" }}>2,400+</strong> people managing
            money smarter with Truvllo
          </span>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="dashboard-preview">
          <div className="dp-header">
            <span className="dp-title">March 2026</span>
            <span className="dp-month">Budget Overview</span>
          </div>
          <div className="dp-cards">
            <div className="dp-card">
              <div className="dp-card-label">Total Budget</div>
              <div className="dp-card-value">$1,800</div>
            </div>
            <div className="dp-card">
              <div className="dp-card-label">Total Spent</div>
              <div className="dp-card-value red">$1,124</div>
            </div>
            <div className="dp-card">
              <div className="dp-card-label">Remaining</div>
              <div className="dp-card-value green">$676</div>
            </div>
            <div className="dp-card">
              <div className="dp-card-label">Safe-to-Spend</div>
              <div className="dp-card-value amber">
                $45
                <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>/day</span>
              </div>
            </div>
          </div>
          <div className="dp-pace">
            <div className="dp-pace-header">
              <span className="dp-pace-label">Budget Pace — Day 16 of 31</span>
              <span className="dp-pace-status">✓ On Track</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
              }}
            >
              <span>Spent: $1,124</span>
              <span>Expected: $929</span>
            </div>
            <div className="dp-bar-track">
              <div className="dp-bar-fill" style={{ width: `${paceWidth}%` }} />
            </div>
          </div>
          <div className="dp-ai-row">
            <div className="dp-ai-card">
              <div className="dp-ai-tag">
                <div className="dp-ai-dot" />
                <span className="dp-ai-tag-label">AI Spending Analyst</span>
              </div>
              <p className="dp-ai-text">
                Your food spending is 28% above last month — mostly weekend
                deliveries. Cooking 3x a week could save you $180 this month.
              </p>
            </div>
            <div className="dp-ai-card">
              <div className="dp-ai-tag">
                <div className="dp-ai-dot" />
                <span className="dp-ai-tag-label">AI Savings Coach</span>
              </div>
              <p className="dp-ai-text">
                Cut your ride-share usage by half this week and redirect $60 to
                your emergency fund — you're close to your 3-month goal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="section"
        style={{ background: "var(--cream)" }}
      >
        <span className="section-label">Core Features</span>
        <h2 className="section-headline playfair">
          Everything you need. Nothing you don't.
        </h2>
        <p className="section-sub">
          Built around real spending habits so you can focus on living, not
          tracking.
        </p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className={`feature-icon ${f.color}`}>{f.icon}</div>
              <div className="feature-title playfair">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI SECTION */}
      <section id="ai" className="ai-section">
        <div className="ai-bg" />
        <span className="section-label">AI Features</span>
        <h2
          className="section-headline playfair"
          style={{ color: "var(--white)" }}
        >
          Your personal
          <br />
          <em style={{ color: "rgba(255,255,255,0.6)" }}>
            financial intelligence
          </em>
        </h2>
        <p className="section-sub">
          Six AI tools that actually understand your spending — and tell you
          something useful, not generic.
        </p>
        <div className="ai-features-grid">
          {AI_FEATURES.map((f, i) => (
            <div key={i} className="ai-feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title playfair">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
              <div className="ai-chip">✦ AI Powered</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div style={{ textAlign: "center" }}>
          <span className="section-label">Testimonials</span>
          <h2
            className="section-headline playfair"
            style={{ margin: "0 auto" }}
          >
            Real people. Real results.
          </h2>
          <p className="section-sub" style={{ margin: "16px auto 0" }}>
            Here's what Truvllo users say after 90 days.
          </p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div
                  className="testimonial-avatar"
                  style={{ background: t.color }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section">
        <span className="section-label">Pricing</span>
        <h2 className="section-headline playfair">Simple, honest pricing.</h2>
        <p className="section-sub">
          Start free. Upgrade when you're ready. Cancel any time.
        </p>
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
            <div className="pricing-plan playfair">Free</div>
            <div className="pricing-price playfair">
              ₦0<span>/forever</span>
            </div>
            <p className="pricing-desc">
              For anyone ready to take their first step toward financial
              clarity.
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
            <button className="pricing-btn outline" onClick={goToAuth}>
              Get started free
            </button>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div
              className="pricing-plan playfair"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Premium
            </div>
            <div
              className="pricing-price playfair"
              style={{ color: "var(--white)" }}
            >
              ₦{price}
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{period}</span>
            </div>
            <p className="pricing-desc">
              Full AI suite + advanced tools for serious money management.
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
            <button className="pricing-btn white" onClick={goToAuth}>
              Start 7-day free trial
            </button>
          </div>
          <div className="pricing-card coming-soon">
            <div className="pricing-plan playfair">Business</div>
            <div
              className="pricing-price playfair"
              style={{ fontSize: "1.8rem" }}
            >
              Coming Soon
            </div>
            <p className="pricing-desc">
              Team budgets, expense approvals, and financial oversight for
              growing businesses.
            </p>
            <div className="pricing-divider" />
            <ul className="pricing-features">
              {[
                "Everything in Premium",
                "Team expense management",
                "Approval workflows",
                "Role-based access",
                "Finance dashboard",
                "Dedicated support",
              ].map((f, i) => (
                <li key={i}>
                  <span className="check">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="pricing-btn disabled" disabled>
              Join the waitlist
            </button>
          </div>
        </div>
        <p
          style={{
            marginTop: 32,
            color: "var(--ink-subtle)",
            fontSize: "0.875rem",
          }}
        >
          🎉 Your 7-day Premium trial starts <strong>automatically</strong> when
          you log your first expense — no card required.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-section">
        <div style={{ textAlign: "center" }}>
          <span className="section-label">How It Works</span>
          <h2
            className="section-headline playfair"
            style={{ margin: "0 auto" }}
          >
            Up and running in minutes.
          </h2>
          <p className="section-sub" style={{ margin: "16px auto 0" }}>
            No complicated setup. No financial jargon. Just clarity, fast.
          </p>
        </div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">{i + 1}</div>
              <div className="step-title playfair">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="playfair">Ready to actually understand your money?</h2>
        <p>
          Join thousands of people who've taken back control of their finances.
          Free to start, powerful from day one.
        </p>
        <button className="cta-btn" onClick={goToAuth}>
          Create your free account
        </button>
        <p className="cta-trial-note">
          No credit card · 7-day Premium trial on first expense · Cancel any
          time
        </p>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="footer-brand-name playfair">Truvllo</div>
            <p className="footer-brand-desc">
              The AI budgeting app that thinks with you. Take control of your
              money, wherever you are.
            </p>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Product</div>
            <a
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Features
            </a>
            <a
              onClick={() =>
                document
                  .getElementById("ai")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              AI Tools
            </a>
            <a
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Pricing
            </a>
            <a onClick={() => navigate("/blog")}>Blog</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a onClick={() => navigate("/about")}>About</a>
            <a onClick={() => navigate("/blog")}>Blog</a>
            <a onClick={() => navigate("/careers")}>Careers</a>
            <a onClick={() => navigate("/contact")}>Contact</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <a onClick={() => navigate("/privacy")}>Privacy Policy</a>
            <a onClick={() => navigate("/terms")}>Terms of Service</a>
            <a onClick={() => navigate("/cookies")}>Cookie Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">
            © 2026 Truvllo. All rights reserved.
          </span>
          <span className="footer-love">
            Built with <span>♥</span> for everyone
          </span>
        </div>
      </footer>
    </>
  );
}
