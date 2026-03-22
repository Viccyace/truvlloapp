import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useBudget } from "../providers/BudgetProvider";

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
    --red:#E53935; --red-pale:rgba(229,57,53,0.1);
  }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }

  .page { display:flex; flex-direction:column; gap:22px; width:100%; animation:fadeIn .3s ease; }
  .page-header { display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap; animation:fadeUp .32s ease; }
  .page-title { font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .page-sub { font-size:.9rem; color:var(--ink-subtle); margin-top:4px; }

  .btn-primary, .hero-edit-btn, .gate-upgrade-btn, .cap-add-btn, .rec-add-btn {
    border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-weight:700;
    transition:all .18s ease;
  }
  .btn-primary {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,var(--green-deep),var(--green-light));
    color:var(--white); padding:12px 16px; border-radius:12px;
    box-shadow:0 8px 24px rgba(27,67,50,.22);
  }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 12px 28px rgba(27,67,50,.3); }

  .active-hero {
    position:relative; overflow:hidden; border-radius:28px; padding:28px;
    background:linear-gradient(145deg,var(--green-deep) 0%,var(--green-mid) 55%,#52B788 100%);
    animation:fadeUp .34s ease .03s both;
  }
  .hero-blob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
  .hero-blob-1 { width:320px; height:320px; top:-120px; right:-80px; background:rgba(255,255,255,.08); }
  .hero-blob-2 { width:240px; height:240px; left:-60px; bottom:-80px; background:rgba(212,160,23,.12); }

  .hero-top { position:relative; z-index:1; display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap; }
  .hero-badge { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.92); padding:6px 14px; border-radius:100px; font-size:.72rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
  .hero-badge-dot { width:7px; height:7px; border-radius:50%; background:var(--amber-light); }
  .hero-name { font-family:'Playfair Display',serif; font-size:2rem; font-weight:900; color:var(--white); line-height:1.1; }
  .hero-period { color:rgba(255,255,255,.65); font-size:.88rem; margin-top:6px; }
  .hero-edit-btn {
    background:rgba(255,255,255,.12); color:var(--white); border:1px solid rgba(255,255,255,.18);
    padding:10px 14px; border-radius:12px;
  }
  .hero-edit-btn:hover { background:rgba(255,255,255,.18); }

  .hero-stats {
    position:relative; z-index:1; display:grid; grid-template-columns:repeat(4,1fr); gap:14px;
    margin-top:24px;
  }
  @media(max-width:920px){ .hero-stats{ grid-template-columns:repeat(2,1fr); } }
  .hero-stat {
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
    border-radius:18px; padding:16px;
  }
  .hero-stat-label { font-size:.72rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.58); margin-bottom:8px; }
  .hero-stat-val { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:900; color:var(--white); }
  .hero-stat-val.amber { color:#FFE08A; }
  .hero-stat-val.muted { color:rgba(255,255,255,.9); }

  .hero-bar-label {
    position:relative; z-index:1; margin-top:20px; display:flex; justify-content:space-between;
    color:rgba(255,255,255,.72); font-size:.76rem; font-weight:700;
  }
  .hero-bar-track {
    position:relative; z-index:1; margin-top:10px; height:12px; border-radius:100px;
    background:rgba(255,255,255,.15); overflow:hidden;
  }
  .hero-bar-fill { height:100%; border-radius:100px; transition:width .3s ease; }

  .two-col { display:grid; grid-template-columns:1.25fr .9fr; gap:20px; animation:fadeUp .34s ease .07s both; }
  @media(max-width:1100px){ .two-col{ grid-template-columns:1fr; } }

  .section-card {
    background:var(--white); border:1.5px solid var(--border); border-radius:22px; overflow:hidden;
  }
  .section-card-header {
    display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding:20px 20px 0; flex-wrap:wrap;
  }
  .section-title { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:800; color:var(--ink); }
  .section-sub { font-size:.82rem; color:var(--ink-subtle); margin-top:4px; }
  .section-card-body { padding:18px 20px 20px; }

  .pro-tag {
    display:inline-flex; align-items:center; gap:6px; padding:5px 11px;
    border-radius:100px; background:var(--amber-pale); color:var(--amber);
    border:1px solid rgba(212,160,23,.18); font-size:.72rem; font-weight:800;
  }

  .cap-list { display:flex; flex-direction:column; }
  .cap-divider { height:1px; background:rgba(10,10,10,.06); margin:14px 0; }
  .cap-row { display:flex; flex-direction:column; gap:12px; }
  .cap-top { display:flex; justify-content:space-between; gap:12px; align-items:center; }
  .cap-left { display:flex; align-items:center; gap:10px; min-width:0; }
  .cap-icon {
    width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.05rem;
    flex-shrink:0;
  }
  .cap-name { font-size:.92rem; font-weight:700; color:var(--ink); }
  .cap-meta { font-size:.76rem; color:var(--ink-subtle); margin-top:3px; }
  .cap-right { display:flex; align-items:center; gap:8px; }
  .cap-limit-input {
    width:110px; padding:10px 12px; border:1.5px solid var(--border); border-radius:10px;
    font-size:.9rem; font-family:'Plus Jakarta Sans',sans-serif; background:var(--cream);
  }
  .cap-del-btn {
    width:32px; height:32px; border:none; border-radius:10px; background:var(--red-pale); color:var(--red);
    cursor:pointer; font-weight:800;
  }
  .bar-track {
    width:100%; height:10px; border-radius:100px; background:var(--cream-dark); overflow:hidden;
  }
  .bar-fill { height:100%; border-radius:100px; background:linear-gradient(90deg,var(--green-mid),var(--green-light)); }

  .cap-add-btn, .rec-add-btn {
    width:100%; padding:12px 14px; border-radius:14px; background:var(--cream);
    color:var(--green-deep); border:1.5px dashed rgba(64,145,108,.25); margin-top:16px;
  }
  .cap-add-btn:hover, .rec-add-btn:hover { background:var(--green-pale); }

  .gate-wrap { position:relative; min-height:220px; }
  .gate-blur { filter:blur(1.5px); opacity:.55; pointer-events:none; }
  .gate-overlay {
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    background:linear-gradient(to bottom, rgba(250,248,243,.45), rgba(250,248,243,.85));
  }
  .gate-card {
    max-width:360px; text-align:center; background:rgba(255,255,255,.86);
    backdrop-filter:blur(7px); border:1px solid rgba(10,10,10,.06); border-radius:18px; padding:22px;
    box-shadow:0 12px 30px rgba(0,0,0,.08);
  }
  .gate-icon { font-size:1.8rem; margin-bottom:10px; }
  .gate-title { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:800; color:var(--ink); }
  .gate-sub { font-size:.86rem; color:var(--ink-subtle); margin-top:8px; line-height:1.6; }
  .gate-upgrade-btn {
    margin-top:14px; padding:11px 16px; border-radius:12px;
    background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white);
  }

  .rec-list { display:flex; flex-direction:column; gap:10px; }
  .rec-item {
    display:grid; grid-template-columns:auto 1fr auto auto; gap:12px; align-items:center;
    padding:12px; border:1.5px solid var(--border); border-radius:16px; background:var(--cream);
  }
  @media(max-width:640px){ .rec-item{ grid-template-columns:auto 1fr; } .rec-right,.rec-del-btn{ justify-self:end; } }
  .rec-icon {
    width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center;
    font-size:1rem; flex-shrink:0;
  }
  .rec-name { font-size:.92rem; font-weight:700; color:var(--ink); }
  .rec-meta { font-size:.76rem; color:var(--ink-subtle); margin-top:3px; }
  .rec-right { text-align:right; }
  .rec-amount { font-family:'Playfair Display',serif; font-size:1rem; font-weight:900; color:var(--ink); }
  .rec-freq-pill {
    display:inline-flex; margin-top:6px; padding:4px 10px; border-radius:100px;
    background:var(--green-pale); color:var(--green-deep); font-size:.72rem; font-weight:800;
  }
  .rec-del-btn {
    width:30px; height:30px; border:none; border-radius:10px; background:var(--red-pale); color:var(--red); cursor:pointer;
  }

  .budget-list { display:flex; flex-direction:column; gap:12px; }
  .budget-item, .budget-add-card {
    display:grid; grid-template-columns:auto 1fr auto auto; gap:12px; align-items:center;
    padding:14px; border-radius:18px; border:1.5px solid var(--border); background:var(--cream);
  }
  .budget-item { cursor:pointer; transition:all .18s ease; }
  .budget-item:hover { transform:translateY(-1px); background:var(--white); }
  .active-budget {
    background:rgba(64,145,108,.08); border-color:rgba(64,145,108,.2);
  }
  .budget-item-icon {
    width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center;
    background:var(--white); font-size:1rem;
  }
  .budget-item-body { min-width:0; }
  .budget-item-name { font-size:.94rem; font-weight:800; color:var(--ink); }
  .budget-item-meta { font-size:.76rem; color:var(--ink-subtle); margin-top:4px; }
  .budget-item-right { text-align:right; }
  .budget-item-amount { font-family:'Playfair Display',serif; font-size:1rem; font-weight:900; color:var(--ink); }
  .budget-item-pct { font-size:.76rem; margin-top:4px; }
  .active-check {
    width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    background:var(--green-light); color:var(--white); font-size:.82rem; font-weight:900;
  }
  .budget-add-card {
    justify-content:center; min-height:82px; background:linear-gradient(135deg,var(--green-pale),var(--white));
    color:var(--green-deep); font-weight:800; cursor:pointer;
  }

  .modal-overlay {
    position:fixed; inset:0; background:rgba(10,10,10,.48); display:flex; align-items:center; justify-content:center;
    z-index:400; padding:16px;
  }
  .modal-card {
    width:100%; max-width:520px; background:var(--white); border-radius:24px; padding:22px;
    box-shadow:0 20px 60px rgba(0,0,0,.22); animation:scaleIn .2s ease;
  }
  .modal-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:18px; }
  .modal-title { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:800; color:var(--ink); }
  .modal-sub { font-size:.82rem; color:var(--ink-subtle); margin-top:4px; }
  .modal-close {
    width:34px; height:34px; border:none; border-radius:10px; background:var(--cream-dark); color:var(--ink-subtle); cursor:pointer;
  }
  .modal-form { display:flex; flex-direction:column; gap:14px; }
  .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(max-width:560px){ .modal-grid{ grid-template-columns:1fr; } }
  .modal-label { display:block; font-size:.8rem; font-weight:700; color:var(--ink-muted); margin-bottom:6px; }
  .modal-input, .modal-select {
    width:100%; padding:12px 14px; border:1.5px solid var(--border); border-radius:12px; background:var(--cream);
    font-family:'Plus Jakarta Sans',sans-serif; font-size:.95rem; outline:none;
  }
  .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:6px; }
  .btn-secondary {
    padding:11px 14px; border-radius:12px; border:1.5px solid var(--border); background:var(--white); color:var(--ink-muted); cursor:pointer;
  }

  .toast {
    position:fixed; bottom:22px; right:22px; z-index:300; background:var(--ink); color:var(--white);
    padding:12px 16px; border-radius:14px; font-size:.88rem; font-weight:700;
    box-shadow:0 10px 30px rgba(0,0,0,.2); animation:scaleIn .25s ease;
  }
`;

const CATS = [
  { id: "food", label: "Food", icon: "🍔", bg: "#FFF3E0" },
  { id: "transport", label: "Transport", icon: "🚗", bg: "#E8F5E9" },
  { id: "bills", label: "Bills", icon: "🏠", bg: "#FCE4EC" },
  { id: "shopping", label: "Shopping", icon: "🛍️", bg: "#F3E5F5" },
  { id: "health", label: "Health", icon: "💊", bg: "#E0F7FA" },
  { id: "airtime", label: "Airtime", icon: "📱", bg: "#E3F2FD" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", bg: "#F9FBE7" },
  { id: "other", label: "Other", icon: "💼", bg: "#F5F5F5" },
];

const CAT_MAP = Object.fromEntries(CATS.map((c) => [c.id, c]));

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG");
}

function normalizeCategory(value) {
  if (!value) return "other";
  const v = String(value).toLowerCase().replace(/\s+/g, "");
  if (CAT_MAP[v]) return v;
  const aliases = {
    data: "airtime",
    fun: "entertainment",
    shop: "shopping",
    bill: "bills",
  };
  return aliases[v] || "other";
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return <div className="toast">✓ {msg}</div>;
}

function BudgetModal({ budget, onSave, onClose }) {
  const [form, setForm] = useState({
    id: budget?.id || null,
    name: budget?.name || "",
    amount: budget?.amount || "",
    period: budget?.period || "monthly",
    start: budget?.start || "",
    end: budget?.end || "",
  });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      id: form.id,
      name: form.name.trim(),
      amount: Number(form.amount),
      period: form.period,
      start: form.start,
      end: form.end,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {budget ? "Edit Budget" : "Create Budget"}
            </div>
            <div className="modal-sub">Set up a budget period and amount</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div>
            <label className="modal-label">Budget name</label>
            <input
              className="modal-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. April Budget"
            />
          </div>

          <div className="modal-grid">
            <div>
              <label className="modal-label">Amount</label>
              <input
                className="modal-input"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                inputMode="numeric"
                placeholder="0"
              />
            </div>

            <div>
              <label className="modal-label">Period</label>
              <select
                className="modal-select"
                value={form.period}
                onChange={(e) =>
                  setForm((f) => ({ ...f, period: e.target.value }))
                }
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="modal-grid">
            <div>
              <label className="modal-label">Start date</label>
              <input
                className="modal-input"
                type="date"
                value={form.start}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="modal-label">End date</label>
              <input
                className="modal-input"
                type="date"
                value={form.end}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {budget ? "Save changes" : "Create budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecurringModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    cat: "bills",
    freq: "monthly",
  });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      amount: Number(form.amount),
      cat: form.cat,
      freq: form.freq,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-title">Add Recurring Expense</div>
            <div className="modal-sub">Save a fixed monthly or weekly cost</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div>
            <label className="modal-label">Name</label>
            <input
              className="modal-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Netflix"
            />
          </div>

          <div className="modal-grid">
            <div>
              <label className="modal-label">Amount</label>
              <input
                className="modal-input"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                inputMode="numeric"
                placeholder="0"
              />
            </div>

            <div>
              <label className="modal-label">Frequency</label>
              <select
                className="modal-select"
                value={form.freq}
                onChange={(e) =>
                  setForm((f) => ({ ...f, freq: e.target.value }))
                }
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="modal-label">Category</label>
            <select
              className="modal-select"
              value={form.cat}
              onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))}
            >
              {CATS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add recurring
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CapRow({ cap, onUpdate, onDelete }) {
  const category = CAT_MAP[normalizeCategory(cap.cat)] || CAT_MAP.other;
  const [value, setValue] = useState(String(cap.limit || ""));

  useEffect(() => {
    setValue(String(cap.limit || ""));
  }, [cap.limit]);

  const usedPct =
    Number(cap.limit) > 0
      ? Math.min(
          100,
          Math.round((Number(cap.spent || 0) / Number(cap.limit || 0)) * 100),
        )
      : 0;

  return (
    <div className="cap-row">
      <div className="cap-top">
        <div className="cap-left">
          <div className="cap-icon" style={{ background: category.bg }}>
            {category.icon}
          </div>
          <div>
            <div className="cap-name">{category.label}</div>
            <div className="cap-meta">
              ₦{fmt(cap.spent)} spent of ₦{fmt(cap.limit)}
            </div>
          </div>
        </div>

        <div className="cap-right">
          <input
            className="cap-limit-input"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={() => {
              if (Number(value) !== Number(cap.limit)) {
                onUpdate(cap.id, value);
              }
            }}
          />
          <button className="cap-del-btn" onClick={() => onDelete(cap.id)}>
            ✕
          </button>
        </div>
      </div>

      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: `${usedPct}%`,
            background:
              usedPct >= 100
                ? "linear-gradient(90deg,#E53935,#FF8A80)"
                : usedPct >= 80
                  ? "linear-gradient(90deg,#D4A017,#F0C040)"
                  : "linear-gradient(90deg,#2D6A4F,#40916C)",
          }}
        />
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const { isPremiumOrTrial } = useAuth();
  const {
    activeBudget,
    budgets = [],
    categoryCaps = [],
    recurring = [],
    setActiveBudget,
    addBudget,
    updateBudget,
    addCategoryCap,
    updateCategoryCap,
    deleteCategoryCap,
    addRecurringExpense,
    deleteRecurringExpense,
    totalSpent,
    remaining,
    daysLeft,
  } = useBudget();

  const isPremium = isPremiumOrTrial;

  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const currentBudget =
    activeBudget || budgets.find((b) => b.is_active) || null;

  const budgetAmount = Number(currentBudget?.amount || 0);
  const spentAmount = Number(totalSpent || 0);
  const remainingAmount = Number(
    remaining || Math.max(0, budgetAmount - spentAmount),
  );
  const daysLeftCount = Number(daysLeft || 0);

  const spentPct =
    budgetAmount > 0
      ? Math.min(100, Math.round((spentAmount / budgetAmount) * 100))
      : 0;

  const saveBudget = async (data) => {
    try {
      if (data.id && budgets.find((b) => b.id === data.id)) {
        await updateBudget(data.id, {
          name: data.name,
          amount: Number(data.amount),
          period: data.period,
          start: data.start,
          end: data.end,
        });
        setToast("Budget updated");
      } else {
        await addBudget({
          name: data.name,
          amount: Number(data.amount),
          period: data.period,
          start: data.start,
          end: data.end,
        });
        setToast("Budget created");
      }
      setModal(null);
    } catch (error) {
      console.error("Save budget error:", error);
      setToast(error?.message || "Could not save budget");
    }
  };

  const switchBudget = async (id) => {
    try {
      await setActiveBudget(id);
      const b = budgets.find((item) => item.id === id);
      setToast(b ? `Switched to "${b.name}"` : "Budget switched");
    } catch (error) {
      console.error("Switch budget error:", error);
      setToast(error?.message || "Could not switch budget");
    }
  };

  const updateCap = async (id, newLimit) => {
    try {
      await updateCategoryCap(id, Number(newLimit));
      setToast("Cap updated");
    } catch (error) {
      console.error("Update cap error:", error);
      setToast(error?.message || "Could not update cap");
    }
  };

  const deleteCap = async (id) => {
    try {
      await deleteCategoryCap(id);
      setToast("Cap removed");
    } catch (error) {
      console.error("Delete cap error:", error);
      setToast(error?.message || "Could not remove cap");
    }
  };

  const addCap = async () => {
    try {
      const usedCats = categoryCaps.map((c) =>
        normalizeCategory(c.cat || c.category),
      );
      const available = CATS.filter((c) => !usedCats.includes(c.id));
      if (!available.length) return;

      const first = available[0];
      await addCategoryCap({
        category: first.id,
        limit: 20000,
      });
      setToast(`${first.label} cap added`);
    } catch (error) {
      console.error("Add cap error:", error);
      setToast(error?.message || "Could not add cap");
    }
  };

  const addRecurring = async (data) => {
    try {
      await addRecurringExpense({
        category: data.cat,
        description: data.name,
        amount: Number(data.amount),
        frequency: data.freq,
      });
      setModal(null);
      setToast(`${data.name} added as recurring`);
    } catch (error) {
      console.error("Add recurring error:", error);
      setToast(error?.message || "Could not add recurring expense");
    }
  };

  const handleDeleteRecurring = async (id) => {
    try {
      await deleteRecurringExpense(id);
      setToast("Recurring expense removed");
    } catch (error) {
      console.error("Delete recurring error:", error);
      setToast(error?.message || "Could not remove recurring expense");
    }
  };

  const totalRecurring = recurring.reduce(
    (s, r) => s + Number(r.amount || 0),
    0,
  );

  return (
    <>
      <style>{FONTS + styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {modal === "new_budget" && (
        <BudgetModal onSave={saveBudget} onClose={() => setModal(null)} />
      )}
      {modal === "edit_budget" && currentBudget && (
        <BudgetModal
          budget={currentBudget}
          onSave={saveBudget}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "new_recurring" && (
        <RecurringModal onSave={addRecurring} onClose={() => setModal(null)} />
      )}

      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Budget</div>
            <div className="page-sub">
              Manage your active budget, caps, and fixed expenses
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => setModal("new_budget")}
          >
            + New Budget
          </button>
        </div>

        <div className="active-hero">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-top">
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Active Budget
              </div>
              <div className="hero-name" style={{ marginTop: 10 }}>
                {currentBudget?.name || "No active budget"}
              </div>
              <div className="hero-period">
                {currentBudget?.start || "—"}{" "}
                {currentBudget?.end ? `– ${currentBudget.end}` : ""} ·{" "}
                {currentBudget?.period || "—"}
              </div>
            </div>
            {currentBudget && (
              <button
                className="hero-edit-btn"
                onClick={() => setModal("edit_budget")}
              >
                ✎ Edit
              </button>
            )}
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-label">Total Budget</div>
              <div className="hero-stat-val">₦{fmt(budgetAmount)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Spent</div>
              <div className="hero-stat-val amber">₦{fmt(spentAmount)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Remaining</div>
              <div className="hero-stat-val muted">₦{fmt(remainingAmount)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Days Left</div>
              <div className="hero-stat-val muted">{daysLeftCount}</div>
            </div>
          </div>

          <div className="hero-bar-label">
            <span>₦0</span>
            <span>{spentPct}% used</span>
            <span>₦{fmt(budgetAmount)}</span>
          </div>
          <div className="hero-bar-track">
            <div
              className="hero-bar-fill"
              style={{
                width: `${spentPct}%`,
                background: "rgba(255,255,255,0.75)",
              }}
            />
          </div>
        </div>

        <div className="two-col">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="section-title">Category Spending Caps</div>
                  <div className="section-sub">
                    Set limits per category and track usage
                  </div>
                </div>
                <span className="pro-tag">✦ Premium</span>
              </div>
              <div className="section-card-body">
                {isPremium ? (
                  <div className="cap-list">
                    {categoryCaps.map((cap, i) => (
                      <div key={cap.id}>
                        {i > 0 && <div className="cap-divider" />}
                        <CapRow
                          cap={{
                            ...cap,
                            cat: normalizeCategory(cap.cat || cap.category),
                            spent: Number(cap.spent || 0),
                            limit: Number(cap.limit || 0),
                          }}
                          onUpdate={updateCap}
                          onDelete={deleteCap}
                        />
                      </div>
                    ))}
                    {categoryCaps.length < CATS.length && (
                      <button className="cap-add-btn" onClick={addCap}>
                        + Add category cap
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="gate-wrap">
                    <div className="gate-blur">
                      <div className="cap-list">
                        {categoryCaps.slice(0, 3).map((cap, i) => (
                          <div key={cap.id}>
                            {i > 0 && <div className="cap-divider" />}
                            <CapRow
                              cap={{
                                ...cap,
                                cat: normalizeCategory(cap.cat || cap.category),
                                spent: Number(cap.spent || 0),
                                limit: Number(cap.limit || 0),
                              }}
                              onUpdate={() => {}}
                              onDelete={() => {}}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="gate-overlay">
                      <div className="gate-card">
                        <div className="gate-icon">⭐</div>
                        <div className="gate-title">Premium Feature</div>
                        <div className="gate-sub">
                          Set per-category spending caps and get warned before
                          you overshoot.
                        </div>
                        <button className="gate-upgrade-btn">
                          Upgrade — ₦6,500/mo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="section-title">Recurring Expenses</div>
                  <div className="section-sub">
                    ₦{fmt(totalRecurring)}/mo in fixed costs
                  </div>
                </div>
                <span className="pro-tag">✦ Premium</span>
              </div>
              <div className="section-card-body">
                {isPremium ? (
                  <>
                    <div className="rec-list">
                      {recurring.map((r) => {
                        const catKey = normalizeCategory(
                          r.cat || r.category || "other",
                        );
                        const c = CAT_MAP[catKey] ?? CAT_MAP.other;
                        return (
                          <div key={r.id} className="rec-item">
                            <div
                              className="rec-icon"
                              style={{ background: c.bg }}
                            >
                              {c.icon}
                            </div>
                            <div className="rec-body">
                              <div className="rec-name">
                                {r.name || r.description}
                              </div>
                              <div className="rec-meta">
                                Next: {r.next || r.next_date || "—"}
                              </div>
                            </div>
                            <div className="rec-right">
                              <div className="rec-amount">₦{fmt(r.amount)}</div>
                              <div className="rec-freq-pill">
                                {r.freq || r.frequency || "Monthly"}
                              </div>
                            </div>
                            <button
                              className="rec-del-btn"
                              onClick={() => handleDeleteRecurring(r.id)}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      className="rec-add-btn"
                      onClick={() => setModal("new_recurring")}
                    >
                      + Add recurring expense
                    </button>
                  </>
                ) : (
                  <div className="gate-wrap">
                    <div className="gate-blur">
                      <div className="rec-list">
                        {recurring.slice(0, 3).map((r) => {
                          const catKey = normalizeCategory(
                            r.cat || r.category || "other",
                          );
                          const c = CAT_MAP[catKey] ?? CAT_MAP.other;
                          return (
                            <div key={r.id} className="rec-item">
                              <div
                                className="rec-icon"
                                style={{ background: c.bg }}
                              >
                                {c.icon}
                              </div>
                              <div className="rec-body">
                                <div className="rec-name">
                                  {r.name || r.description}
                                </div>
                              </div>
                              <div className="rec-right">
                                <div className="rec-amount">
                                  ₦{fmt(r.amount)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="gate-overlay">
                      <div className="gate-card">
                        <div className="gate-icon">🔁</div>
                        <div className="gate-title">Recurring Expenses</div>
                        <div className="gate-sub">
                          Set fixed costs once and Truvllo accounts for them
                          automatically every month.
                        </div>
                        <button className="gate-upgrade-btn">
                          Upgrade — ₦6,500/mo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="section-title">All Budgets</div>
                  <div className="section-sub">
                    {budgets.length} budgets created
                  </div>
                </div>
              </div>
              <div className="section-card-body">
                <div className="budget-list">
                  {budgets.map((b) => {
                    const usedPct =
                      Number(b.amount) > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (Number(b.spent || 0) / Number(b.amount)) * 100,
                            ),
                          )
                        : 0;
                    const isActive = b.is_active || currentBudget?.id === b.id;

                    return (
                      <div
                        key={b.id}
                        className={`budget-item${isActive ? " active-budget" : ""}`}
                        onClick={() => !isActive && switchBudget(b.id)}
                      >
                        <div className="budget-item-icon">
                          {isActive ? "🟢" : "📋"}
                        </div>
                        <div className="budget-item-body">
                          <div className="budget-item-name">{b.name}</div>
                          <div className="budget-item-meta">
                            {String(b.period || "")
                              .charAt(0)
                              .toUpperCase() +
                              String(b.period || "").slice(1)}{" "}
                            · {usedPct}% used
                          </div>
                          <div
                            className="bar-track"
                            style={{ marginTop: 7, height: 4 }}
                          >
                            <div
                              className="bar-fill"
                              style={{
                                width: `${usedPct}%`,
                                background: isActive
                                  ? "var(--green-light)"
                                  : "var(--ink-subtle)",
                              }}
                            />
                          </div>
                        </div>
                        <div className="budget-item-right">
                          <div className="budget-item-amount">
                            ₦{fmt(b.amount)}
                          </div>
                          <div
                            className="budget-item-pct"
                            style={{
                              color:
                                usedPct >= 100
                                  ? "var(--red)"
                                  : usedPct >= 80
                                    ? "var(--amber)"
                                    : "var(--ink-subtle)",
                            }}
                          >
                            ₦{fmt(b.spent || 0)} spent
                          </div>
                        </div>
                        {isActive ? (
                          <div className="active-check">✓</div>
                        ) : (
                          <span
                            style={{
                              fontSize: ".7rem",
                              color: "var(--ink-subtle)",
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            Switch →
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div
                    className="budget-add-card"
                    onClick={() => setModal("new_budget")}
                  >
                    + Create new budget
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
