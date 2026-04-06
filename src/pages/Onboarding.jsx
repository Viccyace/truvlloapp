import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useBudget } from "../providers/BudgetProvider";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FAF8F3; }
  :root {
    --cream: #FAF8F3; --cream-dark: #F0EDE4;
    --green-deep: #1B4332; --green-mid: #2D6A4F; --green-light: #40916C; --green-pale: #D8F3DC;
    --ink: #0A0A0A; --ink-muted: #3A3A3A; --ink-subtle: #6B6B6B;
    --amber: #D4A017; --white: #FFFFFF; --border: rgba(10,10,10,0.1);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.06); --shadow-lg: 0 20px 60px rgba(0,0,0,0.15);
  }
  @keyframes fadeUp       { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn      { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes spin         { to{transform:rotate(360deg)} }
  @keyframes checkPop     { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.2);opacity:1} 100%{transform:scale(1)} }
  @keyframes floatUp      { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
  @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(80px) rotate(720deg);opacity:0} }
  @keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .ob-root { min-height:100vh; display:flex; flex-direction:column; background:var(--cream); position:relative; overflow:hidden; }
  .ob-blob { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; transition:all 1s ease; }
  .ob-blob-1 { width:500px; height:500px; top:-150px; right:-100px; opacity:0.25; }
  .ob-blob-2 { width:400px; height:400px; bottom:-100px; left:-80px; opacity:0.18; }

  .ob-topbar { display:flex; align-items:center; justify-content:space-between; padding:24px 5%; position:relative; z-index:10; }
  .ob-logo { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:7px; }
  .ob-logo-dot { width:7px; height:7px; border-radius:50%; background:var(--amber); }
  .ob-skip { font-size:0.85rem; color:var(--ink-subtle); font-weight:600; cursor:pointer; background:none; border:none; font-family:'Plus Jakarta Sans',sans-serif; }
  .ob-skip:disabled { opacity:0.5; cursor:not-allowed; }

  .ob-progress { padding:0 5%; margin-bottom:8px; position:relative; z-index:10; }
  .ob-step-circle { width:36px; height:36px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:0.82rem; font-weight:700; transition:all 0.4s ease; }
  .ob-step-circle.done     { background:var(--green-light); color:var(--white); box-shadow:0 4px 16px rgba(64,145,108,0.4); }
  .ob-step-circle.active   { background:var(--ink); color:var(--white); box-shadow:0 4px 16px rgba(10,10,10,0.25); }
  .ob-step-circle.upcoming { background:var(--cream-dark); color:var(--ink-subtle); border:1.5px solid var(--border); }
  .ob-step-check { animation:checkPop 0.4s ease; }
  .ob-step-connector { flex:1; height:3px; background:var(--cream-dark); border-radius:100px; overflow:hidden; margin:0 6px; }
  .ob-step-connector-fill { height:100%; background:var(--green-light); border-radius:100px; transition:width 0.5s cubic-bezier(0.4,0,0.2,1); }
  .ob-step-label { font-size:0.7rem; font-weight:600; margin-top:6px; text-align:center; white-space:nowrap; }
  .ob-step-label.active   { color:var(--ink); }
  .ob-step-label.done     { color:var(--green-mid); }
  .ob-step-label.upcoming { color:var(--ink-subtle); }

  .ob-card-wrap { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:24px 5% 40px; position:relative; z-index:10; }
  .ob-card { background:var(--white); border-radius:28px; padding:48px; border:1.5px solid rgba(10,10,10,0.07); box-shadow:var(--shadow-lg); width:100%; max-width:580px; animation:scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  @media(max-width:600px){ .ob-card{ padding:32px 24px; border-radius:22px; } }

  .ob-step-tag { display:inline-flex; align-items:center; gap:7px; background:var(--cream-dark); color:var(--ink-subtle); padding:5px 14px; border-radius:100px; font-size:0.75rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:20px; }
  .ob-step-tag-dot { width:5px; height:5px; border-radius:50%; background:var(--green-light); animation:pulse 2s ease-in-out infinite; }
  .ob-card-headline { font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:800; color:var(--ink); line-height:1.18; letter-spacing:-0.015em; margin-bottom:8px; }
  .ob-card-sub { font-size:0.9rem; color:var(--ink-subtle); line-height:1.65; margin-bottom:32px; }

  /* Trust screen */
  .trust-list { display:flex; flex-direction:column; gap:14px; margin-bottom:36px; }
  .trust-item { display:flex; gap:14px; align-items:flex-start; background:var(--green-pale); border-radius:14px; padding:14px 16px; }
  .trust-icon  { font-size:1.3rem; flex-shrink:0; }
  .trust-title { font-size:0.9rem; font-weight:700; color:var(--green-deep); margin-bottom:3px; }
  .trust-desc  { font-size:0.8rem; color:var(--green-mid); line-height:1.5; }

  /* Currency */
  .currency-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:32px; }
  @media(max-width:480px){ .currency-grid{ grid-template-columns:repeat(2,1fr); } }
  .currency-card { border:2px solid var(--border); border-radius:16px; padding:18px 14px; cursor:pointer; transition:all 0.22s; text-align:center; background:var(--white); position:relative; overflow:hidden; }
  .currency-card:hover { border-color:rgba(64,145,108,0.4); transform:translateY(-2px); box-shadow:var(--shadow-sm); }
  .currency-card.selected { border-color:var(--green-light); background:var(--green-pale); box-shadow:0 4px 20px rgba(64,145,108,0.2); transform:translateY(-2px); }
  .currency-flag { font-size:1.8rem; margin-bottom:8px; display:block; }
  .currency-code { font-weight:800; font-size:0.95rem; color:var(--ink); margin-bottom:2px; }
  .currency-name { font-size:0.72rem; color:var(--ink-subtle); font-weight:500; }
  .currency-selected-check { position:absolute; top:8px; right:8px; width:18px; height:18px; border-radius:50%; background:var(--green-light); display:flex; align-items:center; justify-content:center; font-size:0.65rem; color:var(--white); animation:checkPop 0.3s ease; }

  /* Form fields */
  .field-wrap { margin-bottom:20px; }
  .field-label { display:block; font-size:0.82rem; font-weight:600; color:var(--ink-muted); margin-bottom:8px; }
  .input-prefix-wrap { display:flex; align-items:stretch; border:1.5px solid var(--border); border-radius:14px; overflow:hidden; transition:border-color 0.2s,box-shadow 0.2s; background:var(--white); }
  .input-prefix-wrap:focus-within { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); }
  .input-prefix { padding:0 16px; background:var(--cream-dark); color:var(--ink-muted); font-weight:700; font-size:0.9rem; display:flex; align-items:center; border-right:1.5px solid var(--border); white-space:nowrap; flex-shrink:0; }
  .field-input { flex:1; padding:14px 16px; border:none; outline:none; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:600; color:var(--ink); background:transparent; width:100%; }
  .plain-input { width:100%; padding:14px 16px; border:1.5px solid var(--border); border-radius:14px; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500; color:var(--ink); background:var(--white); outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .plain-input:focus { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); }
  .field-error { font-size:0.75rem; color:#C0392B; margin-top:5px; font-weight:500; }

  /* Period */
  .period-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .period-card { border:2px solid var(--border); border-radius:14px; padding:14px 10px; cursor:pointer; transition:all 0.2s; text-align:center; background:var(--white); }
  .period-card:hover { border-color:rgba(64,145,108,0.3); }
  .period-card.selected { border-color:var(--green-light); background:var(--green-pale); }
  .period-icon  { font-size:1.2rem; margin-bottom:6px; }
  .period-label { font-size:0.8rem; font-weight:700; color:var(--ink); }
  .period-desc  { font-size:0.7rem; color:var(--ink-subtle); margin-top:2px; }

  /* WhatsApp benefits */
  .wa-benefits { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
  .wa-benefit { display:flex; gap:12px; align-items:flex-start; background:#F5F3EE; border-radius:12px; padding:12px 14px; }
  .wa-benefit-icon  { font-size:1.2rem; flex-shrink:0; }
  .wa-benefit-title { font-size:0.85rem; font-weight:700; color:#0A0A0A; margin-bottom:2px; }
  .wa-benefit-desc  { font-size:0.78rem; color:#6B6B6B; }

  /* Confirm */
  .confirm-hero { text-align:center; margin-bottom:28px; }
  .confirm-emoji { font-size:3.5rem; display:block; margin-bottom:16px; animation:floatUp 3s ease-in-out infinite; }
  .confirm-summary { background:var(--cream-dark); border-radius:18px; padding:24px; display:flex; flex-direction:column; gap:16px; margin-bottom:28px; }
  .confirm-row { display:flex; justify-content:space-between; align-items:center; }
  .confirm-row-label { font-size:0.85rem; color:var(--ink-subtle); font-weight:500; }
  .confirm-row-value { font-size:0.9rem; font-weight:700; color:var(--ink); }
  .confirm-row-value.wa-connected { color:var(--green-mid); }
  .confirm-row-value.wa-skipped   { color:var(--ink-subtle); font-weight:500; font-style:italic; }
  .confirm-divider { height:1px; background:var(--border); }
  .confirm-trial { background:var(--green-pale); border:1.5px solid rgba(27,67,50,0.15); border-radius:14px; padding:16px 18px; display:flex; gap:12px; align-items:flex-start; margin-bottom:28px; }
  .confirm-trial-icon { font-size:1.2rem; flex-shrink:0; }
  .confirm-trial-text { font-size:0.85rem; color:var(--green-deep); line-height:1.6; font-weight:500; }

  /* Confetti */
  .confetti-wrap { position:fixed; top:0; left:0; right:0; pointer-events:none; z-index:100; display:flex; justify-content:center; }
  .confetti-piece { width:10px; height:10px; border-radius:2px; position:absolute; animation:confettiFall 1.2s ease forwards; }

  /* Navigation buttons */
  .ob-nav { display:flex; gap:12px; margin-top:28px; }
  .btn-back { flex:0; padding:14px 24px; border:1.5px solid var(--border); border-radius:14px; background:transparent; color:var(--ink-muted); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.95rem; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
  .btn-back:hover { border-color:rgba(10,10,10,0.2); }
  .btn-next { flex:1; padding:15px; border-radius:14px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.25s; box-shadow:0 6px 24px rgba(27,67,50,0.28); display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-next:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(27,67,50,0.35); }
  .btn-next:disabled { opacity:0.55; cursor:not-allowed; }
  .btn-skip-wa { padding:13px 20px; border:1.5px solid rgba(10,10,10,0.1); border-radius:14px; background:transparent; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:600; color:#6B6B6B; cursor:pointer; transition:all 0.2s; flex-shrink:0; }
  .btn-skip-wa:hover { border-color:rgba(10,10,10,0.2); color:var(--ink); }

  .spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.4); border-top-color:var(--white); border-radius:50%; animation:spin 0.7s linear infinite; }

  /* Success */
  .success-root { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--cream); padding:40px 5%; text-align:center; animation:fadeIn 0.5s ease; }
  .success-check { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 24px; box-shadow:0 12px 40px rgba(27,67,50,0.35); animation:checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  .success-title { font-family:'Playfair Display',serif; font-size:2.4rem; font-weight:900; color:var(--ink); margin-bottom:12px; letter-spacing:-0.02em; }
  .success-sub { font-size:1rem; color:var(--ink-subtle); line-height:1.7; max-width:420px; margin:0 auto 40px; }
  .success-btn { padding:16px 48px; border-radius:14px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:1.05rem; font-weight:700; cursor:pointer; box-shadow:0 8px 32px rgba(27,67,50,0.3); }

  .error-box { margin-bottom:18px; background:rgba(192,57,43,0.08); border:1.5px solid rgba(192,57,43,0.2); border-radius:12px; padding:12px 16px; font-size:0.875rem; color:#C0392B; line-height:1.5; }
`;

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENCIES = [
  { code: "NGN", symbol: "₦", flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "KES", symbol: "KSh", flag: "🇰🇪", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "₵", flag: "🇬🇭", name: "Ghanaian Cedi" },
];

const CURRENCY_PHONE = {
  NGN: { flag: "🇳🇬", dialCode: "+234" },
  USD: { flag: "🇺🇸", dialCode: "+1" },
  GBP: { flag: "🇬🇧", dialCode: "+44" },
  EUR: { flag: "🇪🇺", dialCode: "" },
  KES: { flag: "🇰🇪", dialCode: "+254" },
  GHS: { flag: "🇬🇭", dialCode: "+233" },
};

const PERIODS = [
  { id: "weekly", icon: "📅", label: "Weekly", desc: "Every 7 days" },
  { id: "monthly", icon: "🗓️", label: "Monthly", desc: "1st – last day" },
  { id: "custom", icon: "✏️", label: "Custom", desc: "Pick your dates" },
];

const CONFETTI_COLORS = [
  "#40916C",
  "#D4A017",
  "#1B4332",
  "#52B788",
  "#F0C040",
  "#74C69D",
];

// Progress labels for steps 1–4
const STEP_LABELS = ["Currency", "Budget", "WhatsApp", "Confirm"];

// ── Confetti ──────────────────────────────────────────────────────────────────

function Confetti({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    animationDelay: `${Math.random() * 0.6}s`,
    animationDuration: `${0.9 + Math.random() * 0.8}s`,
    width: `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 8}px`,
    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
  }));
  return (
    <div className="confetti-wrap">
      {pieces.map((p, i) => (
        <div key={i} className="confetti-piece" style={p} />
      ))}
    </div>
  );
}

// ── Step 0: Trust / welcome screen ───────────────────────────────────────────

function Step0({ onNext }) {
  return (
    <>
      <div className="ob-step-tag">
        <span className="ob-step-tag-dot" />
        Welcome to Truvllo
      </div>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
        <h2 className="ob-card-headline" style={{ fontSize: "1.6rem" }}>
          We never touch
          <br />
          your money
        </h2>
        <p className="ob-card-sub" style={{ marginBottom: 0 }}>
          Truvllo is a budgeting tracker — not a bank, wallet, or payment app.
        </p>
      </div>

      <div className="trust-list">
        {[
          [
            "📝",
            "You tell us what you spend",
            "You log expenses manually or send your bank PDF. We read the numbers.",
          ],
          [
            "🔍",
            "We help you understand it",
            "AI analyses your spending and shows you where your money goes.",
          ],
          [
            "🚫",
            "We never access your bank",
            "No login credentials, no direct bank connection, no stored PDFs.",
          ],
          [
            "🛡️",
            "Your data stays yours",
            "We store only what you give us. You can delete everything anytime.",
          ],
        ].map(([icon, title, desc], i) => (
          <div key={i} className="trust-item">
            <div className="trust-icon">{icon}</div>
            <div>
              <div className="trust-title">{title}</div>
              <div className="trust-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ob-nav">
        <button className="btn-next" onClick={onNext}>
          Got it — let's set up my budget →
        </button>
      </div>
    </>
  );
}

// ── Step 1: Currency ──────────────────────────────────────────────────────────

function Step1({ data, onChange, onNext }) {
  return (
    <>
      <div className="ob-step-tag">
        <span className="ob-step-tag-dot" />
        Step 1 of 4
      </div>
      <h2 className="ob-card-headline">
        Which currency
        <br />
        do you earn in?
      </h2>
      <p className="ob-card-sub">
        We'll use this across your entire Truvllo experience.
      </p>

      <div className="currency-grid">
        {CURRENCIES.map((c) => (
          <div
            key={c.code}
            className={`currency-card${data.currency === c.code ? " selected" : ""}`}
            onClick={() => onChange("currency", c.code)}
          >
            {data.currency === c.code && (
              <div className="currency-selected-check">✓</div>
            )}
            <span className="currency-flag">{c.flag}</span>
            <div className="currency-code">{c.code}</div>
            <div className="currency-name">{c.name}</div>
          </div>
        ))}
      </div>

      <div className="ob-nav">
        <button className="btn-next" onClick={onNext} disabled={!data.currency}>
          Continue <span>→</span>
        </button>
      </div>
    </>
  );
}

// ── Step 2: Budget setup ──────────────────────────────────────────────────────

function Step2({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const currencyObj =
    CURRENCIES.find((c) => c.code === data.currency) || CURRENCIES[0];
  const sym = currencyObj.symbol;
  const daysInPeriod = data.period === "weekly" ? 7 : 30;

  const formatNum = (val) => {
    const raw = val.replace(/[^0-9]/g, "");
    return raw ? parseInt(raw, 10).toLocaleString() : "";
  };

  const handleNext = () => {
    const e = {};
    if (!data.budgetName.trim()) e.budgetName = "Give your budget a name";
    if (
      !data.monthlyBudget ||
      parseFloat(data.monthlyBudget.replace(/,/g, "")) < 1
    )
      e.monthlyBudget = "Enter a budget amount";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onNext();
  };

  const dailyBudget = data.monthlyBudget
    ? (parseFloat(data.monthlyBudget.replace(/,/g, "")) / daysInPeriod).toFixed(
        0,
      )
    : null;

  return (
    <>
      <div className="ob-step-tag">
        <span className="ob-step-tag-dot" />
        Step 2 of 4
      </div>
      <h2 className="ob-card-headline">
        Set up your
        <br />
        first budget
      </h2>
      <p className="ob-card-sub">
        This is your spending ceiling. You can always edit it later.
      </p>

      <div className="field-wrap">
        <label className="field-label">Budget name</label>
        <input
          className="plain-input"
          style={errors.budgetName ? { borderColor: "#C0392B" } : {}}
          type="text"
          placeholder="e.g. April 2026 Budget"
          value={data.budgetName}
          onChange={(e) => {
            onChange("budgetName", e.target.value);
            setErrors((x) => ({ ...x, budgetName: "" }));
          }}
        />
        {errors.budgetName && (
          <div className="field-error">{errors.budgetName}</div>
        )}
      </div>

      <div className="field-wrap">
        <label className="field-label">Total budget amount</label>
        <div
          className="input-prefix-wrap"
          style={errors.monthlyBudget ? { borderColor: "#C0392B" } : {}}
        >
          <span className="input-prefix">{sym}</span>
          <input
            className="field-input"
            type="text"
            inputMode="numeric"
            placeholder="150,000"
            value={data.monthlyBudget}
            onChange={(e) => {
              onChange("monthlyBudget", formatNum(e.target.value));
              setErrors((x) => ({ ...x, monthlyBudget: "" }));
            }}
          />
        </div>
        {errors.monthlyBudget && (
          <div className="field-error">{errors.monthlyBudget}</div>
        )}
      </div>

      <div className="field-wrap">
        <label className="field-label">Budget period</label>
        <div className="period-grid">
          {PERIODS.map((p) => (
            <div
              key={p.id}
              className={`period-card${data.period === p.id ? " selected" : ""}`}
              onClick={() => onChange("period", p.id)}
            >
              <div className="period-icon">{p.icon}</div>
              <div className="period-label">{p.label}</div>
              <div className="period-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live budget preview */}
      {data.monthlyBudget && (
        <div
          style={{
            background:
              "linear-gradient(135deg,var(--green-deep),var(--green-mid))",
            borderRadius: 18,
            padding: "20px 22px",
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Your budget
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1.6rem",
                  color: "#fff",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {sym}
                {parseInt(
                  data.monthlyBudget.replace(/,/g, "") || 0,
                ).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Daily allowance
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1.2rem",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {sym}
                {parseInt(dailyBudget || 0, 10).toLocaleString()}/day
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ob-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-next" onClick={handleNext}>
          Continue <span>→</span>
        </button>
      </div>
    </>
  );
}

// ── Step 3: WhatsApp ──────────────────────────────────────────────────────────

function Step3({ data, onChange, onNext, onBack }) {
  const phoneInfo = CURRENCY_PHONE[data.currency] || {
    flag: "🇳🇬",
    dialCode: "+234",
  };
  const isEUR = data.currency === "EUR";

  const [dialCode, setDialCode] = useState(isEUR ? "" : phoneInfo.dialCode);
  const [phone, setPhone] = useState(
    // strip previously stored dial prefix so input shows local digits only
    data.whatsappNumber ? data.whatsappNumber.replace(/^\+\d{1,4}/, "") : "",
  );
  const [error, setError] = useState("");

  const handleNext = () => {
    if (phone.trim() && phone.trim().length < 7) {
      setError("Enter a valid WhatsApp number");
      return;
    }
    onChange(
      "whatsappNumber",
      phone.trim() ? `${dialCode}${phone.trim()}` : "",
    );
    onNext();
  };

  const handleSkip = () => {
    onChange("whatsappNumber", "");
    onNext();
  };

  return (
    <>
      <div className="ob-step-tag">
        <span className="ob-step-tag-dot" />
        Step 3 of 4
      </div>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>💬</div>
        <h2 className="ob-card-headline" style={{ fontSize: "1.6rem" }}>
          Connect WhatsApp
        </h2>
        <p className="ob-card-sub" style={{ marginBottom: 0 }}>
          Get instant budget alerts and log expenses directly from WhatsApp.
          Optional — you can skip and add this later.
        </p>
      </div>

      <div className="wa-benefits">
        {[
          [
            "📄",
            "Send your bank statement PDF",
            "We import all transactions automatically",
          ],
          [
            "⚡",
            "Instant spending alerts",
            "Know when you hit 80% of any budget cap",
          ],
          ["📊", "Daily summary at 9pm", "Your spending recap every evening"],
        ].map(([icon, title, desc], i) => (
          <div key={i} className="wa-benefit">
            <div className="wa-benefit-icon">{icon}</div>
            <div>
              <div className="wa-benefit-title">{title}</div>
              <div className="wa-benefit-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="field-wrap" style={{ marginBottom: 8 }}>
        <label className="field-label">WhatsApp number (optional)</label>
        <div style={{ display: "flex", gap: 8 }}>
          {isEUR ? (
            <input
              type="text"
              placeholder="+49"
              value={dialCode}
              onChange={(e) => setDialCode(e.target.value)}
              style={{
                width: 72,
                padding: "13px 10px",
                border: "1.5px solid rgba(10,10,10,0.12)",
                borderRadius: 12,
                background: "#fff",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontSize: "0.9rem",
                fontWeight: 600,
                outline: "none",
                textAlign: "center",
              }}
            />
          ) : (
            <div
              style={{
                padding: "13px 14px",
                border: "1.5px solid rgba(10,10,10,0.12)",
                borderRadius: 12,
                background: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#3A3A3A",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {phoneInfo.flag} {phoneInfo.dialCode}
            </div>
          )}
          <input
            type="tel"
            inputMode="numeric"
            placeholder="812 345 6789"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/[^0-9]/g, ""));
              setError("");
            }}
            style={{
              flex: 1,
              padding: "13px 16px",
              border: `1.5px solid ${error ? "#C0392B" : "rgba(10,10,10,0.12)"}`,
              borderRadius: 12,
              background: "#fff",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: 16,
              outline: "none",
            }}
          />
        </div>
        {error && <div className="field-error">{error}</div>}
      </div>

      <div
        style={{
          fontSize: "0.72rem",
          color: "#9B9B9B",
          marginBottom: 28,
          lineHeight: 1.5,
        }}
      >
        📱 We'll send a quick verification when your trial activates. Standard
        WhatsApp rates apply.
      </div>

      <div className="ob-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-skip-wa" onClick={handleSkip}>
          Skip
        </button>
        <button
          className="btn-next"
          onClick={handleNext}
          style={{ flex: "none", padding: "13px 24px" }}
        >
          Continue →
        </button>
      </div>
    </>
  );
}

// ── Step 4: Confirm everything ────────────────────────────────────────────────

function Step4({ data, onBack, onFinish, loading }) {
  const currencyObj =
    CURRENCIES.find((c) => c.code === data.currency) || CURRENCIES[0];
  const sym = currencyObj.symbol;
  const daysInPeriod = data.period === "weekly" ? 7 : 30;
  const daily = data.monthlyBudget
    ? parseInt(
        parseFloat(data.monthlyBudget.replace(/,/g, "")) / daysInPeriod,
        10,
      ).toLocaleString()
    : "—";

  const hasWhatsApp = !!data.whatsappNumber;
  const maskedPhone = hasWhatsApp
    ? `${data.whatsappNumber.slice(0, Math.min(7, data.whatsappNumber.length))}****`
    : null;

  return (
    <>
      <div className="ob-step-tag">
        <span className="ob-step-tag-dot" />
        Step 4 of 4
      </div>

      <div className="confirm-hero">
        <span className="confirm-emoji">🎯</span>
        <h2 className="ob-card-headline">
          Looks great,
          <br />
          let's confirm
        </h2>
        <p className="ob-card-sub">
          Everything looks right? You can edit this later.
        </p>
      </div>

      <div className="confirm-summary">
        <div className="confirm-row">
          <span className="confirm-row-label">Currency</span>
          <span className="confirm-row-value">
            {currencyObj.flag} {currencyObj.code}
          </span>
        </div>
        <div className="confirm-divider" />
        <div className="confirm-row">
          <span className="confirm-row-label">Budget name</span>
          <span className="confirm-row-value">{data.budgetName || "—"}</span>
        </div>
        <div className="confirm-divider" />
        <div className="confirm-row">
          <span className="confirm-row-label">Budget amount</span>
          <span className="confirm-row-value">
            {sym}
            {data.monthlyBudget} / {data.period === "weekly" ? "week" : "month"}
          </span>
        </div>
        <div className="confirm-divider" />
        <div className="confirm-row">
          <span className="confirm-row-label">Daily allowance</span>
          <span className="confirm-row-value">
            {sym}
            {daily}/day
          </span>
        </div>
        <div className="confirm-divider" />
        <div className="confirm-row">
          <span className="confirm-row-label">WhatsApp</span>
          {hasWhatsApp ? (
            <span className="confirm-row-value wa-connected">
              ✓ {maskedPhone}
            </span>
          ) : (
            <span className="confirm-row-value wa-skipped">Not connected</span>
          )}
        </div>
      </div>

      <div className="confirm-trial">
        <span className="confirm-trial-icon">🎁</span>
        <div className="confirm-trial-text">
          <strong>Your 14-day Premium trial activates automatically</strong>{" "}
          when you log your first expense.
        </div>
      </div>

      <div className="ob-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-next" onClick={onFinish} disabled={loading}>
          {loading ? <div className="spinner" /> : <>Launch Truvllo 🚀</>}
        </button>
      </div>
    </>
  );
}

// ── Main Onboarding shell ─────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const { createBudget } = useBudget();

  // 0 = trust screen, 1-4 = setup steps
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [data, setData] = useState({
    currency: "NGN",
    budgetName: "",
    monthlyBudget: "",
    period: "monthly",
    whatsappNumber: "",
  });

  const onChange = (key, val) => {
    setData((d) => ({ ...d, [key]: val }));
    if (errorMsg) setErrorMsg("");
  };

  const blobColor =
    step === 0
      ? "rgba(27,67,50,0.2)"
      : step === 1
        ? "rgba(64,145,108,0.22)"
        : step === 2
          ? "rgba(212,160,23,0.18)"
          : step === 3
            ? "rgba(37,99,235,0.15)"
            : "rgba(27,67,50,0.2)";

  // ── Finish ────────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const { error: profileError } = await completeOnboarding({
        currency: data.currency,
        _budgetName: data.budgetName,
        _period: data.period,
        whatsapp_number: data.whatsappNumber || null,
      });

      if (profileError) {
        setErrorMsg(
          profileError.message ||
            "Could not complete onboarding. Please try again.",
        );
        setLoading(false);
        return;
      }

      const amountRaw = parseFloat(
        (data.monthlyBudget || "0").replace(/,/g, ""),
      );
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = (() => {
        const s = new Date(startDate);
        if (data.period === "weekly") s.setDate(s.getDate() + 7);
        else s.setMonth(s.getMonth() + 1);
        return s.toISOString().split("T")[0];
      })();

      if (amountRaw > 0 && data.budgetName.trim()) {
        await createBudget({
          name: data.budgetName.trim(),
          amount: amountRaw,
          period: data.period,
          start_date: startDate,
          end_date: endDate,
          is_active: true,
        });
      }

      setShowConfetti(true);
      setDone(true);
      setTimeout(() => setShowConfetti(false), 1800);
    } catch (err) {
      console.error("Onboarding error:", err);
      setErrorMsg(
        err?.message || "Something went wrong while finishing onboarding.",
      );
      setLoading(false);
    }
  };

  // ── Skip entire onboarding (visible from step 1 onwards) ─────────────────
  const handleSkip = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await completeOnboarding({
        currency: data.currency || "NGN",
        _budgetName: "",
        _period: "monthly",
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Skip error:", err);
      setLoading(false);
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <>
        <style>{FONTS + styles}</style>
        <Confetti show={showConfetti} />
        <div className="success-root">
          <div className="success-check">✓</div>
          <h1 className="success-title">You're all set!</h1>
          <p className="success-sub">
            Your budget is ready. Start logging expenses to activate your 14-day
            Premium trial and unlock all AI features instantly.
          </p>
          <button
            className="success-btn"
            onClick={() => navigate("/dashboard", { replace: true })}
          >
            Go to my Dashboard →
          </button>
        </div>
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{FONTS + styles}</style>
      <Confetti show={showConfetti} />

      <div className="ob-root">
        {/* Blobs */}
        <div
          className="ob-blob ob-blob-1"
          style={{
            background: `radial-gradient(circle,${blobColor} 0%,transparent 70%)`,
          }}
        />
        <div
          className="ob-blob ob-blob-2"
          style={{
            background:
              "radial-gradient(circle,rgba(212,160,23,0.12) 0%,transparent 70%)",
          }}
        />

        {/* Top bar */}
        <div className="ob-topbar">
          <div className="ob-logo">
            <span className="ob-logo-dot" />
            Truvllo
          </div>
          {/* Skip only visible from step 1 onwards */}
          {step >= 1 && (
            <button className="ob-skip" onClick={handleSkip} disabled={loading}>
              {loading ? "Please wait…" : "Skip for now"}
            </button>
          )}
        </div>

        {/* Progress bar — only on steps 1–4 */}
        {step >= 1 && (
          <div className="ob-progress">
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 0 }}
              >
                {[1, 2, 3, 4].map((s, i) => (
                  <div
                    key={s}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      flex: i < 3 ? 1 : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className={`ob-step-circle ${step > s ? "done" : step === s ? "active" : "upcoming"}`}
                      >
                        {step > s ? (
                          <span className="ob-step-check">✓</span>
                        ) : (
                          s
                        )}
                      </div>
                      <div
                        className={`ob-step-label ${step > s ? "done" : step === s ? "active" : "upcoming"}`}
                      >
                        {STEP_LABELS[i]}
                      </div>
                    </div>
                    {i < 3 && (
                      <div
                        style={{
                          flex: 1,
                          paddingBottom: 22,
                          margin: "0 6px",
                          marginTop: 16,
                        }}
                      >
                        <div className="ob-step-connector">
                          <div
                            className="ob-step-connector-fill"
                            style={{ width: step > s ? "100%" : "0%" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="ob-card-wrap">
          <div className="ob-card" key={step}>
            {errorMsg && <div className="error-box">{errorMsg}</div>}

            {step === 0 && <Step0 onNext={() => setStep(1)} />}
            {step === 1 && (
              <Step1
                data={data}
                onChange={onChange}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <Step2
                data={data}
                onChange={onChange}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <Step3
                data={data}
                onChange={onChange}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <Step4
                data={data}
                onBack={() => setStep(3)}
                onFinish={handleFinish}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
