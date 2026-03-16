import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Plus Jakarta Sans',sans-serif; background:#F5F3EE; color:#0A0A0A; }
  :root {
    --cream:#FAF8F3; --cream-dark:#F0EDE4; --bg:#F5F3EE;
    --green-deep:#1B4332; --green-mid:#2D6A4F; --green-light:#40916C; --green-pale:#D8F3DC;
    --ink:#0A0A0A; --ink-muted:#3A3A3A; --ink-subtle:#6B6B6B;
    --amber:#D4A017; --amber-light:#F0C040; --amber-pale:rgba(212,160,23,0.1);
    --white:#FFFFFF; --border:rgba(10,10,10,0.08);
    --red:#E53935;
  }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes slideDown { from{opacity:0;max-height:0;transform:translateY(-8px)} to{opacity:1;max-height:600px;transform:translateY(0)} }

  .page { display:flex; flex-direction:column; gap:0; animation:fadeIn 0.3s ease; }

  /* ── HERO ─────────────────────────────────── */
  .hero {
    background:linear-gradient(145deg,var(--green-deep) 0%,var(--green-mid) 55%,#52B788 100%);
    border-radius:24px; padding:60px 48px; position:relative; overflow:hidden;
    margin-bottom:32px; animation:fadeUp 0.4s ease;
  }
  @media(max-width:700px){ .hero{ padding:40px 24px; } }
  .hero-blob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
  .hero-blob-1 { width:400px; height:400px; top:-120px; right:-80px; background:rgba(255,255,255,0.08); }
  .hero-blob-2 { width:300px; height:300px; bottom:-100px; left:-60px; background:rgba(212,160,23,0.12); }
  .hero-blob-3 { width:200px; height:200px; top:40px; left:40%; background:rgba(255,255,255,0.04); }

  .hero-inner { position:relative; z-index:1; display:grid; grid-template-columns:1fr auto; gap:40px; align-items:center; }
  @media(max-width:800px){ .hero-inner{ grid-template-columns:1fr; } }

  .hero-badge { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); color:rgba(255,255,255,0.9); padding:5px 14px; border-radius:100px; font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.09em; margin-bottom:16px; }
  .hero-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--amber-light); animation:pulse 2s ease infinite; }
  .hero-headline { font-family:'Playfair Display',serif; font-size:clamp(2rem,4vw,3rem); font-weight:900; color:var(--white); line-height:1.1; letter-spacing:-0.02em; margin-bottom:16px; }
  .hero-headline em { font-style:italic; color:rgba(255,255,255,0.65); }
  .hero-sub { font-size:1rem; color:rgba(255,255,255,0.65); line-height:1.7; max-width:480px; margin-bottom:32px; }

  .hero-price-card { background:rgba(255,255,255,0.1); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.18); border-radius:20px; padding:28px 32px; text-align:center; flex-shrink:0; min-width:220px; }
  .hero-price-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:rgba(255,255,255,0.5); margin-bottom:8px; }
  .hero-price { font-family:'Playfair Display',serif; font-size:2.8rem; font-weight:900; color:var(--white); line-height:1; }
  .hero-price sup { font-size:1.2rem; vertical-align:top; margin-top:6px; display:inline-block; }
  .hero-price sub { font-size:0.9rem; font-weight:500; color:rgba(255,255,255,0.5); font-family:'Plus Jakarta Sans',sans-serif; }
  .hero-price-annual { font-size:0.75rem; color:rgba(255,255,255,0.45); margin-top:4px; }
  .hero-price-annual strong { color:var(--amber-light); }
  .hero-cta-btn { width:100%; margin-top:18px; padding:14px; background:var(--white); color:var(--green-deep); border:none; border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.95rem; font-weight:800; cursor:pointer; transition:all 0.22s; box-shadow:0 4px 20px rgba(0,0,0,0.15); }
  .hero-cta-btn:hover { background:var(--cream); transform:translateY(-1px); box-shadow:0 8px 28px rgba(0,0,0,0.2); }
  .hero-cta-note { font-size:0.68rem; color:rgba(255,255,255,0.4); margin-top:8px; text-align:center; }

  .hero-cta-main { display:flex; flex-direction:column; gap:10px; }
  .hero-btn-primary { display:inline-flex; align-items:center; gap:10px; padding:15px 32px; background:var(--white); color:var(--green-deep); border:none; border-radius:14px; font-family:'Plus Jakarta Sans',sans-serif; font-size:1rem; font-weight:800; cursor:pointer; transition:all 0.22s; box-shadow:0 6px 24px rgba(0,0,0,0.18); width:fit-content; }
  .hero-btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(0,0,0,0.25); }
  .hero-btn-primary:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
  .hero-btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:13px 28px; background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.8); border:1px solid rgba(255,255,255,0.2); border-radius:14px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:600; cursor:pointer; transition:all 0.2s; width:fit-content; }
  .hero-btn-ghost:hover { background:rgba(255,255,255,0.16); color:var(--white); }
  .hero-notes { display:flex; gap:16px; flex-wrap:wrap; }
  .hero-note { display:flex; align-items:center; gap:6px; font-size:0.78rem; color:rgba(255,255,255,0.55); }
  .hero-note-check { color:rgba(255,255,255,0.8); font-weight:800; }
  .spinner { width:18px; height:18px; border:2.5px solid rgba(27,67,50,0.2); border-top-color:var(--green-deep); border-radius:50%; animation:spin 0.7s linear infinite; }

  /* ── BILLING TOGGLE ──────────────────────── */
  .billing-toggle-wrap { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:40px; animation:fadeUp 0.35s ease 0.05s both; }
  .billing-label { font-size:0.875rem; font-weight:600; color:var(--ink-subtle); }
  .billing-label.active { color:var(--ink); }
  .billing-switch { width:48px; height:26px; border-radius:100px; background:var(--green-light); position:relative; cursor:pointer; border:none; padding:0; transition:background 0.2s; }
  .billing-knob { position:absolute; top:3px; width:20px; height:20px; border-radius:50%; background:var(--white); box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:left 0.25s cubic-bezier(0.4,0,0.2,1); }
  .billing-switch.monthly .billing-knob { left:3px; }
  .billing-switch.annual  .billing-knob { left:25px; }
  .billing-save-pill { background:var(--amber-pale); color:var(--amber); border:1px solid rgba(212,160,23,0.25); padding:3px 10px; border-radius:100px; font-size:0.7rem; font-weight:800; }

  /* ── FEATURES GRID ───────────────────────── */
  .features-section { margin-bottom:48px; animation:fadeUp 0.35s ease 0.08s both; }
  .section-label { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; color:var(--green-mid); margin-bottom:12px; }
  .section-headline { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; margin-bottom:6px; }
  .section-sub { font-size:0.9rem; color:var(--ink-subtle); line-height:1.6; margin-bottom:32px; }
  .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  @media(max-width:900px){ .features-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:560px){ .features-grid{ grid-template-columns:1fr; } }
  .feature-card { background:var(--white); border-radius:18px; padding:24px; border:1.5px solid var(--border); transition:all 0.22s; }
  .feature-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(0,0,0,0.08); border-color:rgba(64,145,108,0.2); }
  .feature-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.15rem; margin-bottom:14px; }
  .feature-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--ink); margin-bottom:7px; }
  .feature-desc { font-size:0.82rem; color:var(--ink-subtle); line-height:1.65; }

  /* ── COMPARISON TABLE ────────────────────── */
  .compare-section { margin-bottom:48px; animation:fadeUp 0.35s ease 0.1s both; }
  .compare-table { width:100%; border-collapse:collapse; background:var(--white); border-radius:20px; overflow:hidden; border:1.5px solid var(--border); }
  .compare-table th { padding:16px 20px; text-align:left; font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-subtle); background:var(--bg); border-bottom:1.5px solid var(--border); }
  .compare-table th.plan-col { text-align:center; }
  .compare-table th.premium-col { background:linear-gradient(135deg,var(--green-deep),var(--green-mid)); color:rgba(255,255,255,0.8); }
  .compare-table td { padding:14px 20px; font-size:0.875rem; color:var(--ink-muted); border-bottom:1px solid rgba(10,10,10,0.05); }
  .compare-table tr:last-child td { border-bottom:none; }
  .compare-table tr:hover td { background:var(--bg); }
  .compare-table td.plan-col { text-align:center; }
  .compare-table td.feature-name { font-weight:600; color:var(--ink); }
  .check-yes { color:var(--green-light); font-size:1rem; font-weight:800; }
  .check-no  { color:rgba(10,10,10,0.2); font-size:1rem; }
  .compare-cat-row td { background:var(--bg); font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.09em; color:var(--ink-subtle); padding:10px 20px; }
  .premium-highlight { background:rgba(27,67,50,0.04) !important; }

  /* ── FAQ ─────────────────────────────────── */
  .faq-section { margin-bottom:48px; animation:fadeUp 0.35s ease 0.14s both; }
  .faq-list { display:flex; flex-direction:column; gap:10px; }
  .faq-item { background:var(--white); border-radius:16px; border:1.5px solid var(--border); overflow:hidden; transition:border-color 0.2s; }
  .faq-item.open { border-color:rgba(64,145,108,0.25); }
  .faq-q { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; cursor:pointer; gap:12px; }
  .faq-q-text { font-size:0.92rem; font-weight:700; color:var(--ink); line-height:1.4; }
  .faq-chevron { width:28px; height:28px; border-radius:8px; background:var(--cream-dark); display:flex; align-items:center; justify-content:center; font-size:0.8rem; color:var(--ink-subtle); flex-shrink:0; transition:all 0.25s; }
  .faq-item.open .faq-chevron { background:var(--green-pale); color:var(--green-deep); transform:rotate(180deg); }
  .faq-a { padding:0 22px 18px; font-size:0.875rem; color:var(--ink-subtle); line-height:1.7; animation:fadeUp 0.25s ease; }
  .faq-a strong { color:var(--ink); font-weight:700; }

  /* ── BOTTOM CTA ──────────────────────────── */
  .bottom-cta { background:var(--ink); border-radius:24px; padding:56px 48px; text-align:center; position:relative; overflow:hidden; margin-bottom:8px; animation:fadeUp 0.35s ease 0.16s both; }
  @media(max-width:600px){ .bottom-cta{ padding:40px 24px; } }
  .bottom-cta-blob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
  .bottom-cta-blob-1 { width:350px; height:350px; top:-100px; right:-80px; background:rgba(64,145,108,0.2); }
  .bottom-cta-blob-2 { width:250px; height:250px; bottom:-80px; left:-40px; background:rgba(212,160,23,0.12); }
  .bottom-cta-icon { font-size:2.5rem; margin-bottom:16px; animation:float 3s ease infinite; display:block; }
  .bottom-cta-title { font-family:'Playfair Display',serif; font-size:clamp(1.6rem,3vw,2.4rem); font-weight:900; color:var(--white); margin-bottom:12px; letter-spacing:-0.015em; position:relative; z-index:1; }
  .bottom-cta-sub { font-size:0.95rem; color:rgba(255,255,255,0.55); max-width:460px; margin:0 auto 32px; line-height:1.7; position:relative; z-index:1; }
  .bottom-cta-btn { display:inline-flex; align-items:center; gap:10px; padding:16px 40px; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); border:none; border-radius:14px; font-family:'Plus Jakarta Sans',sans-serif; font-size:1.05rem; font-weight:800; cursor:pointer; transition:all 0.22s; box-shadow:0 8px 32px rgba(27,67,50,0.5); position:relative; z-index:1; }
  .bottom-cta-btn:hover { transform:translateY(-2px); box-shadow:0 14px 44px rgba(27,67,50,0.6); }
  .bottom-cta-notes { display:flex; justify-content:center; gap:20px; margin-top:16px; flex-wrap:wrap; position:relative; z-index:1; }
  .bottom-cta-note { font-size:0.75rem; color:rgba(255,255,255,0.35); display:flex; align-items:center; gap:5px; }
  .bottom-cta-note::before { content:"✓"; color:rgba(255,255,255,0.5); font-weight:800; }

  /* ── PAYSTACK TRUST ──────────────────────── */
  .paystack-trust { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:20px; }
  .paystack-logo { background:var(--white); border-radius:8px; padding:4px 12px; font-size:0.72rem; font-weight:800; color:#00C3F7; letter-spacing:0.02em; }
  .paystack-text { font-size:0.72rem; color:rgba(255,255,255,0.3); }
`;

const FEATURES = [
  { icon:"🤖", bg:"#D8F3DC", title:"AI Spending Analyst",     desc:"Plain-English breakdown of your spending patterns — every week, automatically." },
  { icon:"💬", bg:"#FFF3E0", title:"Natural Language Entry",   desc:"Type \"spent 4500 on lunch\" and Truvllo logs it instantly. No forms, no friction." },
  { icon:"🎯", bg:"#E3F2FD", title:"AI Savings Coach",         desc:"One specific, actionable tip each week based on your actual spending data." },
  { icon:"🏷️", bg:"#F3E5F5", title:"Smart Categorisation",     desc:"Type a merchant and Truvllo suggests the right category — learns your habits." },
  { icon:"📐", bg:"#FCE4EC", title:"AI Budget Advisor",         desc:"Tell us your income and goal. Get a realistic monthly budget breakdown instantly." },
  { icon:"⚠️", bg:"#FFF8E1", title:"Overspend Explainer",       desc:"When you're over pace, AI tells you exactly why — with specific cuts to get back." },
  { icon:"🎯", bg:"#E8F5E9", title:"Category Spending Caps",   desc:"Set per-category limits. Get warned before you overshoot food, transport, and more." },
  { icon:"🔁", bg:"#E0F7FA", title:"Recurring Expenses",       desc:"Set rent, subscriptions, and bills once — automatically deducted each cycle." },
  { icon:"📊", bg:"#F9FBE7", title:"Advanced Charts",          desc:"Pie charts, bar charts, trend lines, and month-over-month comparisons." },
  { icon:"📤", bg:"#E8EAF6", title:"CSV Export",               desc:"Download your full expense history any time — perfect for tax season." },
  { icon:"🏆", bg:"#FFF3E0", title:"Habit Streaks",            desc:"Daily logging streaks that build a real money habit over time." },
  { icon:"⚡", bg:"#F1F8E9", title:"Priority Support",         desc:"Email support with a response within 24 hours — guaranteed." },
];

const COMPARE = [
  { cat:"Core", rows:[
    { f:"Unlimited budgets",           free:true,  premium:true  },
    { f:"Expense logging",             free:true,  premium:true  },
    { f:"Budget pace indicator",       free:true,  premium:true  },
    { f:"Safe-to-spend daily limit",   free:true,  premium:true  },
    { f:"6 supported currencies",      free:true,  premium:true  },
    { f:"Mobile PWA",                  free:true,  premium:true  },
  ]},
  { cat:"AI Features", rows:[
    { f:"AI Spending Analyst",         free:false, premium:true  },
    { f:"Natural Language Entry",      free:false, premium:true  },
    { f:"AI Savings Coach",            free:false, premium:true  },
    { f:"Smart Categorisation",        free:false, premium:true  },
    { f:"AI Budget Advisor",           free:false, premium:true  },
    { f:"Overspend Explainer",         free:false, premium:true  },
  ]},
  { cat:"Advanced Tools", rows:[
    { f:"Category Spending Caps",      free:false, premium:true  },
    { f:"Recurring Expenses",          free:false, premium:true  },
    { f:"Advanced Charts & Insights",  free:false, premium:true  },
    { f:"CSV Export",                  free:false, premium:true  },
    { f:"Habit Streaks",               free:false, premium:true  },
    { f:"Priority Support",            free:false, premium:true  },
  ]},
];

const FAQS = [
  { q:"Do I need a credit card to start?",
    a:"No. You can sign up and use Truvllo's free plan forever without a card. Your 7-day Premium trial also activates automatically when you log your first expense — no card required for the trial either." },
  { q:"How does the 7-day free trial work?",
    a:"The moment you log your very first expense, Truvllo automatically activates a full 7-day Premium trial on your account. No buttons to click, no card to enter. You just start using the app and Premium unlocks instantly." },
  { q:"What happens when my trial ends?",
    a:"You'll automatically revert to the Free plan. All your data — budgets, expenses, history — stays safe. You just lose access to AI features and premium tools until you upgrade. You'll get a reminder 2 days before." },
  { q:"How does payment work?",
    a:"Payments are processed securely by <strong>Paystack</strong>, Nigeria's most trusted payment infrastructure. You can pay with your Nigerian debit card, credit card, or bank transfer. All transactions are encrypted." },
  { q:"Can I cancel any time?",
    a:"Yes, completely. Cancel from your Settings page at any time — no questions asked, no penalty. You'll keep Premium access until the end of your billing period." },
  { q:"Is my financial data safe?",
    a:"Yes. Truvllo never stores your bank credentials. All expense data is encrypted at rest and in transit. We use Supabase with row-level security so only you can ever access your data. We never sell or share your information." },
  { q:"Does Truvllo connect to my bank account?",
    a:"No — and that's by design. Truvllo is a manual tracker. You log what you spend. This means no bank connections, no Open Banking permissions, and no risk of your financial accounts being accessed." },
  { q:"Is there a Business plan?",
    a:"A Business plan is coming soon with team expense management, approval workflows, and shared budget dashboards. Join the waitlist from the pricing page and we'll notify you when it launches." },
];

export default function UpgradePage() {
  const [billing,     setBilling]     = useState("monthly");
  const [faqOpen,     setFaqOpen]     = useState(null);
  const [loading,     setLoading]     = useState(false);

  const price        = billing === "monthly" ? "6,500" : "4,875";
  const annualTotal  = billing === "annual"  ? "58,500" : null;

  const handlePaystack = (_plan) => {
    const setter = setLoading;
    setter(true);
    // In real app: call Supabase Edge Function → get Paystack URL → redirect
    // const res = await fetch("/functions/v1/paystack-init", { method:"POST", body: JSON.stringify({ plan }) });
    // const { payment_url } = await res.json();
    // window.location.href = payment_url;
    setTimeout(() => setter(false), 1500); // mock
  };

  return (
    <>
      <style>{FONTS + styles}</style>
      <div className="page">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div className="hero">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
          <div className="hero-inner">
            <div>
              <div className="hero-badge"><span className="hero-badge-dot" />Premium Plan</div>
              <h1 className="hero-headline">
                Your money deserves<br /><em>better than guessing</em>
              </h1>
              <p className="hero-sub">
                Unlock six AI-powered tools, advanced charts, category caps, and habit streaks. Everything you need to actually stick to a budget.
              </p>
              <div className="hero-cta-main">
                <button className="hero-btn-primary" onClick={() => handlePaystack("monthly")} disabled={loading}>
                  {loading ? <><div className="spinner" />Processing…</> : <>Start 7-day free trial →</>}
                </button>
                <div className="hero-notes">
                  {["No card required", "Cancel any time", "Instant activation"].map(n => (
                    <div key={n} className="hero-note"><span className="hero-note-check">✓</span>{n}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price card */}
            <div className="hero-price-card">
              <div className="hero-price-label">Premium Plan</div>
              <div className="hero-price">
                <sup>₦</sup>{price}<sub>{billing === "monthly" ? "/mo" : "/mo"}</sub>
              </div>
              {billing === "annual"
                ? <div className="hero-price-annual">₦{annualTotal}/yr · <strong>Save 25%</strong></div>
                : <div className="hero-price-annual">or <strong style={{color:"var(--amber-light)"}}>₦4,875/mo</strong> billed annually</div>
              }
              <button className="hero-cta-btn" onClick={() => handlePaystack("monthly")} disabled={loading}>
                {loading ? "Processing…" : "Upgrade now"}
              </button>
              <div className="hero-cta-note">Secured by Paystack · SSL encrypted</div>
            </div>
          </div>
        </div>

        {/* ── BILLING TOGGLE ────────────────────────────────────────────── */}
        <div className="billing-toggle-wrap">
          <span className={`billing-label${billing === "monthly" ? " active" : ""}`}>Monthly</span>
          <button className={`billing-switch ${billing}`}
            onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}>
            <div className="billing-knob" />
          </button>
          <span className={`billing-label${billing === "annual" ? " active" : ""}`}>Annual</span>
          <span className="billing-save-pill">Save 25%</span>
        </div>

        {/* ── FEATURES GRID ─────────────────────────────────────────────── */}
        <div className="features-section">
          <div className="section-label">What you unlock</div>
          <div className="section-headline">12 features. One price.</div>
          <div className="section-sub">Everything in the Free plan, plus all of this.</div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
        <div className="compare-section">
          <div className="section-label">Compare plans</div>
          <div className="section-headline">Free vs Premium</div>
          <div className="section-sub" style={{ marginBottom: 24 }}>See exactly what each plan includes.</div>
          <div style={{ overflowX: "auto" }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{ width: "55%" }}>Feature</th>
                  <th className="plan-col" style={{ width: "20%" }}>Free</th>
                  <th className="plan-col premium-col" style={{ width: "25%" }}>✦ Premium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(cat => (
                  <>
                    <tr key={cat.cat} className="compare-cat-row">
                      <td colSpan={3}>{cat.cat}</td>
                    </tr>
                    {cat.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="feature-name">{row.f}</td>
                        <td className="plan-col">{row.free  ? <span className="check-yes">✓</span> : <span className="check-no">—</span>}</td>
                        <td className="plan-col premium-highlight">{row.premium ? <span className="check-yes">✓</span> : <span className="check-no">—</span>}</td>
                      </tr>
                    ))}
                  </>
                ))}
                <tr>
                  <td></td>
                  <td className="plan-col" style={{ paddingTop: 20, paddingBottom: 20 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink-subtle)" }}>Free forever</div>
                  </td>
                  <td className="plan-col premium-highlight" style={{ paddingTop: 20, paddingBottom: 20 }}>
                    <button
                      onClick={() => handlePaystack("monthly")}
                      disabled={loading}
                      style={{ background: "linear-gradient(135deg,var(--green-deep),var(--green-light))", color: "var(--white)", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(27,67,50,0.3)", display: "flex", alignItems: "center", gap: 7, margin: "0 auto" }}>
                      {loading ? <div className="spinner" style={{ borderTopColor: "var(--white)", borderColor: "rgba(255,255,255,0.25)" }} /> : <>Upgrade — ₦{price}/mo</>}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <div className="faq-section">
          <div className="section-label">FAQs</div>
          <div className="section-headline">Common questions</div>
          <div className="section-sub" style={{ marginBottom: 24 }}>Everything you need to know before upgrading.</div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item${faqOpen === i ? " open" : ""}`}>
                <div className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <div className="faq-q-text">{faq.q}</div>
                  <div className="faq-chevron">▾</div>
                </div>
                {faqOpen === i && (
                  <div className="faq-a" dangerouslySetInnerHTML={{ __html: faq.a }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
        <div className="bottom-cta">
          <div className="bottom-cta-blob bottom-cta-blob-1" />
          <div className="bottom-cta-blob bottom-cta-blob-2" />
          <span className="bottom-cta-icon">🚀</span>
          <h2 className="bottom-cta-title">Ready to take control?</h2>
          <p className="bottom-cta-sub">
            Join thousands of Nigerians who finally understand their money. Start your free trial today — no card, no commitment.
          </p>
          <button className="bottom-cta-btn" onClick={() => handlePaystack("monthly")} disabled={loading}>
            {loading ? <><div className="spinner" style={{ borderTopColor: "var(--white)", borderColor: "rgba(255,255,255,0.25)" }} />Processing…</> : <>Start free trial — ₦{price}/mo after</>}
          </button>
          <div className="bottom-cta-notes">
            {["7-day free trial", "No credit card needed", "Cancel any time", "Instant activation"].map(n => (
              <div key={n} className="bottom-cta-note">{n}</div>
            ))}
          </div>
          <div className="paystack-trust">
            <span className="paystack-text">Payments secured by</span>
            <span className="paystack-logo">Paystack</span>
            <span className="paystack-text">· SSL encrypted · PCI DSS compliant</span>
          </div>
        </div>

      </div>
    </>
  );
}
