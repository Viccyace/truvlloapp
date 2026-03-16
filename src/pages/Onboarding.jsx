import { useState, useMemo } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FAF8F3; }

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
    --amber-pale: rgba(212,160,23,0.12);
    --white: #FFFFFF;
    --border: rgba(10,10,10,0.1);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
    --shadow-md: 0 8px 32px rgba(0,0,0,0.1);
    --shadow-lg: 0 20px 60px rgba(0,0,0,0.15);
  }

  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes checkPop { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.2);opacity:1} 100%{transform:scale(1)} }
  @keyframes floatUp { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
  @keyframes confettiFall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(80px) rotate(720deg);opacity:0} }

  .ob-root { min-height:100vh; display:flex; flex-direction:column; background:var(--cream); position:relative; overflow:hidden; }

  .ob-blob { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; transition:all 1s ease; }
  .ob-blob-1 { width:500px; height:500px; top:-150px; right:-100px; opacity:0.25; }
  .ob-blob-2 { width:400px; height:400px; bottom:-100px; left:-80px; opacity:0.18; }

  .ob-topbar { display:flex; align-items:center; justify-content:space-between; padding:24px 5%; position:relative; z-index:10; }
  .ob-logo { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:7px; }
  .ob-logo-dot { width:7px; height:7px; border-radius:50%; background:var(--amber); }
  .ob-skip { font-size:0.85rem; color:var(--ink-subtle); font-weight:600; cursor:pointer; background:none; border:none; }

  .ob-progress { padding:0 5%; margin-bottom:8px; position:relative; z-index:10; }

  .ob-step-circle { width:36px; height:36px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:0.82rem; font-weight:700; transition:all 0.4s ease; position:relative; z-index:1; }
  .ob-step-circle.done { background:var(--green-light); color:var(--white); box-shadow:0 4px 16px rgba(64,145,108,0.4); }
  .ob-step-circle.active { background:var(--ink); color:var(--white); box-shadow:0 4px 16px rgba(10,10,10,0.25); }
  .ob-step-circle.upcoming { background:var(--cream-dark); color:var(--ink-subtle); border:1.5px solid var(--border); }
  .ob-step-check { animation:checkPop 0.4s ease; }
  .ob-step-connector { flex:1; height:3px; background:var(--cream-dark); border-radius:100px; overflow:hidden; margin:0 6px; }
  .ob-step-connector-fill { height:100%; background:var(--green-light); border-radius:100px; transition:width 0.5s cubic-bezier(0.4,0,0.2,1); }
  .ob-step-label { font-size:0.7rem; font-weight:600; margin-top:6px; text-align:center; white-space:nowrap; transition:color 0.3s; }
  .ob-step-label.active { color:var(--ink); }
  .ob-step-label.done { color:var(--green-mid); }
  .ob-step-label.upcoming { color:var(--ink-subtle); }

  .ob-card-wrap { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:24px 5% 40px; position:relative; z-index:10; }
  .ob-card { background:var(--white); border-radius:28px; padding:48px; border:1.5px solid rgba(10,10,10,0.07); box-shadow:var(--shadow-lg); width:100%; max-width:580px; animation:scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  @media(max-width:600px){ .ob-card{ padding:32px 24px; border-radius:22px; } }

  .ob-step-tag { display:inline-flex; align-items:center; gap:7px; background:var(--cream-dark); color:var(--ink-subtle); padding:5px 14px; border-radius:100px; font-size:0.75rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:20px; }
  .ob-step-tag-dot { width:5px; height:5px; border-radius:50%; background:var(--green-light); }
  .ob-card-headline { font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:800; color:var(--ink); line-height:1.18; letter-spacing:-0.015em; margin-bottom:8px; }
  .ob-card-sub { font-size:0.9rem; color:var(--ink-subtle); line-height:1.65; margin-bottom:32px; }

  .currency-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:32px; }
  @media(max-width:480px){ .currency-grid{ grid-template-columns:repeat(2,1fr); } }
  .currency-card { border:2px solid var(--border); border-radius:16px; padding:18px 14px; cursor:pointer; transition:all 0.22s; text-align:center; background:var(--white); position:relative; overflow:hidden; }
  .currency-card:hover { border-color:rgba(64,145,108,0.4); transform:translateY(-2px); box-shadow:var(--shadow-sm); }
  .currency-card.selected { border-color:var(--green-light); background:var(--green-pale); box-shadow:0 4px 20px rgba(64,145,108,0.2); transform:translateY(-2px); }
  .currency-flag { font-size:1.8rem; margin-bottom:8px; display:block; }
  .currency-code { font-weight:800; font-size:0.95rem; color:var(--ink); margin-bottom:2px; }
  .currency-name { font-size:0.72rem; color:var(--ink-subtle); font-weight:500; }
  .currency-card.selected .currency-name { color:var(--green-mid); }
  .currency-selected-check { position:absolute; top:8px; right:8px; width:18px; height:18px; border-radius:50%; background:var(--green-light); display:flex; align-items:center; justify-content:center; font-size:0.65rem; color:var(--white); animation:checkPop 0.3s ease; }

  .field-wrap { margin-bottom:20px; }
  .field-label { display:block; font-size:0.82rem; font-weight:600; color:var(--ink-muted); margin-bottom:8px; }
  .input-prefix-wrap { display:flex; align-items:stretch; border:1.5px solid var(--border); border-radius:14px; overflow:hidden; transition:border-color 0.2s,box-shadow 0.2s; background:var(--white); }
  .input-prefix-wrap:focus-within { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); }
  .input-prefix { padding:0 16px; background:var(--cream-dark); color:var(--ink-muted); font-weight:700; font-size:0.9rem; display:flex; align-items:center; border-right:1.5px solid var(--border); white-space:nowrap; flex-shrink:0; }
  .field-input { flex:1; padding:14px 16px; border:none; outline:none; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:600; color:var(--ink); background:transparent; width:100%; }
  .field-input::placeholder { color:rgba(10,10,10,0.25); font-weight:400; }
  .plain-input { width:100%; padding:14px 16px; border:1.5px solid var(--border); border-radius:14px; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500; color:var(--ink); background:var(--white); outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .plain-input:focus { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); }
  .field-error { font-size:0.75rem; color:#C0392B; margin-top:5px; font-weight:500; }

  .period-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .period-card { border:2px solid var(--border); border-radius:14px; padding:14px 10px; cursor:pointer; transition:all 0.2s; text-align:center; background:var(--white); }
  .period-card:hover { border-color:rgba(64,145,108,0.3); }
  .period-card.selected { border-color:var(--green-light); background:var(--green-pale); }
  .period-icon { font-size:1.2rem; margin-bottom:6px; }
  .period-label { font-size:0.8rem; font-weight:700; color:var(--ink); }
  .period-desc { font-size:0.7rem; color:var(--ink-subtle); margin-top:2px; }

  .category-section { margin-top:24px; }
  .category-section-title { font-size:0.82rem; font-weight:600; color:var(--ink-muted); margin-bottom:12px; }
  .category-pills { display:flex; flex-wrap:wrap; gap:8px; }
  .category-pill { display:flex; align-items:center; gap:6px; border:1.5px solid var(--border); border-radius:100px; padding:7px 14px; cursor:pointer; transition:all 0.2s; font-size:0.82rem; font-weight:600; color:var(--ink-muted); background:var(--white); }
  .category-pill:hover { border-color:rgba(64,145,108,0.35); color:var(--green-mid); }
  .category-pill.selected { border-color:var(--green-light); background:var(--green-pale); color:var(--green-deep); }
  .category-pill-icon { font-size:0.9rem; }

  .budget-preview { background:linear-gradient(135deg,var(--green-deep),var(--green-mid)); border-radius:18px; padding:22px 24px; margin-top:24px; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center; animation:fadeUp 0.4s ease; }
  .bp-label { font-size:0.72rem; color:rgba(255,255,255,0.55); font-weight:600; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:4px; }
  .bp-value { font-family:'Playfair Display',serif; font-size:1.7rem; font-weight:900; color:var(--white); }
  .bp-period { font-size:0.78rem; color:rgba(255,255,255,0.5); margin-top:2px; }
  .bp-right { text-align:right; }
  .bp-daily-label { font-size:0.7rem; color:rgba(255,255,255,0.5); margin-bottom:4px; }
  .bp-daily { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; color:rgba(255,255,255,0.9); }

  .confirm-hero { text-align:center; margin-bottom:36px; }
  .confirm-emoji { font-size:3.5rem; display:block; margin-bottom:16px; animation:floatUp 3s ease-in-out infinite; }
  .confirm-summary { background:var(--cream-dark); border-radius:18px; padding:24px; display:flex; flex-direction:column; gap:16px; margin-bottom:28px; }
  .confirm-row { display:flex; justify-content:space-between; align-items:center; }
  .confirm-row-label { font-size:0.85rem; color:var(--ink-subtle); font-weight:500; }
  .confirm-row-value { font-size:0.9rem; font-weight:700; color:var(--ink); }
  .confirm-divider { height:1px; background:var(--border); }
  .confirm-trial { background:var(--green-pale); border:1.5px solid rgba(27,67,50,0.15); border-radius:14px; padding:16px 18px; display:flex; gap:12px; align-items:flex-start; margin-bottom:28px; }
  .confirm-trial-icon { font-size:1.2rem; flex-shrink:0; }
  .confirm-trial-text { font-size:0.85rem; color:var(--green-deep); line-height:1.6; font-weight:500; }
  .confirm-trial-text strong { font-weight:700; }

  .confetti-wrap { position:fixed; top:0; left:0; right:0; pointer-events:none; z-index:100; display:flex; justify-content:center; }
  .confetti-piece { width:10px; height:10px; border-radius:2px; position:absolute; animation:confettiFall 1.2s ease forwards; }

  .ob-nav { display:flex; gap:12px; margin-top:28px; }
  .btn-back { flex:0; padding:14px 24px; border:1.5px solid var(--border); border-radius:14px; background:transparent; color:var(--ink-muted); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.95rem; font-weight:600; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
  .btn-back:hover { border-color:rgba(10,10,10,0.25); color:var(--ink); }
  .btn-next { flex:1; padding:15px; border-radius:14px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.25s; box-shadow:0 6px 24px rgba(27,67,50,0.28); display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-next:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 10px 32px rgba(27,67,50,0.38); }
  .btn-next:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
  .spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.4); border-top-color:var(--white); border-radius:50%; animation:spin 0.7s linear infinite; }

  .success-root { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--cream); padding:40px 5%; text-align:center; animation:fadeIn 0.5s ease; }
  .success-check { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 24px; box-shadow:0 12px 40px rgba(27,67,50,0.35); animation:checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  .success-title { font-family:'Playfair Display',serif; font-size:2.4rem; font-weight:900; color:var(--ink); margin-bottom:12px; letter-spacing:-0.02em; }
  .success-sub { font-size:1rem; color:var(--ink-subtle); line-height:1.7; max-width:420px; margin:0 auto 40px; }
  .success-btn { padding:16px 48px; border-radius:14px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:1.05rem; font-weight:700; cursor:pointer; transition:all 0.25s; box-shadow:0 8px 32px rgba(27,67,50,0.3); }
  .success-btn:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(27,67,50,0.4); }
`;

const CURRENCIES = [
  { code: "NGN", symbol: "₦", flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "KES", symbol: "KSh", flag: "🇰🇪", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "₵", flag: "🇬🇭", name: "Ghanaian Cedi" },
];

const PERIODS = [
  { id: "weekly", icon: "📅", label: "Weekly", desc: "Every 7 days" },
  { id: "monthly", icon: "🗓️", label: "Monthly", desc: "1st – last day" },
  { id: "custom", icon: "✏️", label: "Custom", desc: "Pick your dates" },
];

const CATEGORIES = [
  { id: "food", icon: "🍔", label: "Food & Dining" },
  { id: "transport", icon: "🚗", label: "Transport" },
  { id: "rent", icon: "🏠", label: "Rent / Bills" },
  { id: "shopping", icon: "🛍️", label: "Shopping" },
  { id: "health", icon: "💊", label: "Health" },
  { id: "entertainment", icon: "🎬", label: "Entertainment" },
  { id: "savings", icon: "💰", label: "Savings" },
  { id: "data", icon: "📱", label: "Airtime / Data" },
];

const CONFETTI_COLORS = [
  "#40916C",
  "#D4A017",
  "#1B4332",
  "#52B788",
  "#F0C040",
  "#74C69D",
];

function ConfettiPiece({ style }) {
  return <div className="confetti-piece" style={style} />;
}

function Confetti({ show }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        animationDelay: `${Math.random() * 0.6}s`,
        animationDuration: `${0.9 + Math.random() * 0.8}s`,
        width: `${6 + Math.random() * 8}px`,
        height: `${6 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      })),
    [],
  );

  if (!show) return null;
  return (
    <div className="confetti-wrap">
      {pieces.map((s, i) => (
        <ConfettiPiece key={i} style={s} />
      ))}
    </div>
  );
}

// ─── STEP 1 ───────────────────────────────────────────────────────────────────
function Step1({ data, onChange, onNext }) {
  return (
    <>
      <div className="ob-step-tag">
        <span className="ob-step-tag-dot" />
        Step 1 of 3
      </div>
      <h2 className="ob-card-headline">
        Which currency
        <br />
        do you earn in?
      </h2>
      <p className="ob-card-sub">
        We'll use this across your entire Truvllo experience — budgets,
        insights, everything.
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

// ─── STEP 2 ───────────────────────────────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const currencyObj =
    CURRENCIES.find((c) => c.code === data.currency) || CURRENCIES[0];
  const sym = currencyObj.symbol;
  const daysInPeriod = data.period === "weekly" ? 7 : 30;
  const dailyBudget = data.monthlyBudget
    ? (parseFloat(data.monthlyBudget.replace(/,/g, "")) / daysInPeriod).toFixed(
        0,
      )
    : null;

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

  return (
    <>
      <div className="ob-step-tag">
        <span className="ob-step-tag-dot" />
        Step 2 of 3
      </div>
      <h2 className="ob-card-headline">
        Set up your
        <br />
        first budget
      </h2>
      <p className="ob-card-sub">
        This is your spending ceiling. You can always edit it later — no
        pressure to be perfect.
      </p>

      <div className="field-wrap">
        <label className="field-label">Budget name</label>
        <input
          className="plain-input"
          style={errors.budgetName ? { borderColor: "#C0392B" } : {}}
          type="text"
          placeholder="e.g. March 2026, My Monthly Budget"
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

      <div className="category-section">
        <div className="category-section-title">
          Which categories do you spend on? (optional)
        </div>
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`category-pill${data.categories.includes(cat.id) ? " selected" : ""}`}
              onClick={() => {
                const next = data.categories.includes(cat.id)
                  ? data.categories.filter((x) => x !== cat.id)
                  : [...data.categories, cat.id];
                onChange("categories", next);
              }}
            >
              <span className="category-pill-icon">{cat.icon}</span>
              {cat.label}
            </div>
          ))}
        </div>
      </div>

      {data.monthlyBudget && (
        <div className="budget-preview">
          <div>
            <div className="bp-label">Your budget</div>
            <div className="bp-value">
              {sym}
              {data.monthlyBudget}
            </div>
            <div className="bp-period">
              per{" "}
              {data.period === "weekly"
                ? "week"
                : data.period === "monthly"
                  ? "month"
                  : "period"}
            </div>
          </div>
          <div className="bp-right">
            <div className="bp-daily-label">Daily allowance</div>
            <div className="bp-daily">
              {sym}
              {parseInt(dailyBudget || 0).toLocaleString()}/day
            </div>
          </div>
        </div>
      )}

      <div className="ob-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-next" onClick={handleNext}>
          Review & Finish <span>→</span>
        </button>
      </div>
    </>
  );
}

// ─── STEP 3 ───────────────────────────────────────────────────────────────────
function Step3({ data, onBack, onFinish, loading }) {
  const currencyObj =
    CURRENCIES.find((c) => c.code === data.currency) || CURRENCIES[0];
  const sym = currencyObj.symbol;
  const daysInPeriod = data.period === "weekly" ? 7 : 30;
  const daily = data.monthlyBudget
    ? parseInt(
        parseFloat(data.monthlyBudget.replace(/,/g, "")) / daysInPeriod,
      ).toLocaleString()
    : "—";
  const selectedCats = CATEGORIES.filter((c) => data.categories.includes(c.id));

  return (
    <>
      <div className="ob-step-tag">
        <span className="ob-step-tag-dot" />
        Step 3 of 3
      </div>
      <div className="confirm-hero">
        <span className="confirm-emoji">🎯</span>
        <h2 className="ob-card-headline">
          Looks great,
          <br />
          let's confirm
        </h2>
        <p className="ob-card-sub">
          Everything looks right? You can edit any of this in Settings later.
        </p>
      </div>

      <div className="confirm-summary">
        <div className="confirm-row">
          <span className="confirm-row-label">Currency</span>
          <span className="confirm-row-value">
            {currencyObj.flag} {currencyObj.code} — {currencyObj.name}
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
          <span
            className="confirm-row-value"
            style={{ color: "var(--green-mid)" }}
          >
            {sym}
            {daily}/day
          </span>
        </div>
        {selectedCats.length > 0 && (
          <>
            <div className="confirm-divider" />
            <div className="confirm-row" style={{ alignItems: "flex-start" }}>
              <span className="confirm-row-label">Categories</span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "flex-end",
                  maxWidth: "60%",
                }}
              >
                {selectedCats.map((c) => (
                  <span
                    key={c.id}
                    style={{
                      fontSize: "0.78rem",
                      background: "var(--green-pale)",
                      color: "var(--green-deep)",
                      padding: "3px 10px",
                      borderRadius: "100px",
                      fontWeight: 600,
                    }}
                  >
                    {c.icon} {c.label}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="confirm-trial">
        <span className="confirm-trial-icon">🎁</span>
        <div className="confirm-trial-text">
          <strong>Your 7-day Premium trial activates automatically</strong> the
          moment you log your first expense — no credit card, no manual
          activation needed.
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

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [data, setData] = useState({
    currency: "NGN",
    budgetName: "",
    monthlyBudget: "",
    period: "monthly",
    categories: ["food", "transport"],
  });

  const onChange = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const blobColor =
    step === 1
      ? "rgba(64,145,108,0.22)"
      : step === 2
        ? "rgba(212,160,23,0.18)"
        : "rgba(27,67,50,0.2)";

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    }, 1800);
  };

  if (done) {
    return (
      <>
        <style>{FONTS + styles}</style>
        <Confetti show={showConfetti} />
        <div className="success-root">
          <div className="success-check">✓</div>
          <h1
            className="success-title"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            You're all set!
          </h1>
          <p className="success-sub">
            Your budget is ready. Start logging expenses to activate your 7-day
            Premium trial and unlock all AI features instantly.
          </p>
          <button className="success-btn" onClick={() => setDone(false)}>
            Go to my Dashboard →
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{FONTS + styles}</style>
      <Confetti show={showConfetti} />

      <div className="ob-root">
        <div
          className="ob-blob ob-blob-1"
          style={{
            background: `radial-gradient(circle, ${blobColor} 0%, transparent 70%)`,
          }}
        />
        <div
          className="ob-blob ob-blob-2"
          style={{
            background:
              "radial-gradient(circle, rgba(212,160,23,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="ob-topbar">
          <div className="ob-logo">
            <span className="ob-logo-dot" />
            Truvllo
          </div>
          <button className="ob-skip">Skip for now</button>
        </div>

        <div className="ob-progress">
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
              {[1, 2, 3].map((s, i) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    flex: i < 2 ? 1 : "none",
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
                      {step > s ? <span className="ob-step-check">✓</span> : s}
                    </div>
                    <div
                      className={`ob-step-label ${step > s ? "done" : step === s ? "active" : "upcoming"}`}
                    >
                      {s === 1 ? "Currency" : s === 2 ? "Budget" : "Confirm"}
                    </div>
                  </div>
                  {i < 2 && (
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

        <div className="ob-card-wrap">
          <div className="ob-card" key={step}>
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
                onBack={() => setStep(2)}
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
