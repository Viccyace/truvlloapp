import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    --red:#E53935; --red-pale:rgba(229,57,53,0.09);
    --shadow-sm:0 2px 8px rgba(0,0,0,0.06); --shadow-md:0 8px 28px rgba(0,0,0,0.09);
  }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes barGrow { from{width:0} }
  @keyframes spin    { to{transform:rotate(360deg)} }

  .page { display:flex; flex-direction:column; gap:28px; animation:fadeIn 0.3s ease; }

  .page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:14px; animation:fadeUp 0.35s ease; }
  .page-title { font-family:'Playfair Display',serif; font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .page-sub { font-size:0.875rem; color:var(--ink-subtle); margin-top:4px; }
  .btn-primary {
    display:flex; align-items:center; gap:7px; padding:11px 20px;
    background:linear-gradient(135deg,var(--green-deep),var(--green-light));
    color:var(--white); border:none; border-radius:12px;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:700;
    cursor:pointer; transition:all 0.22s; box-shadow:0 4px 16px rgba(27,67,50,0.25);
  }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(27,67,50,0.35); }

  .active-hero {
    background:linear-gradient(140deg,var(--green-deep) 0%,var(--green-mid) 60%,var(--green-light) 100%);
    border-radius:24px; padding:32px; position:relative; overflow:hidden;
    animation:fadeUp 0.35s ease 0.04s both;
  }
  .hero-blob { position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none; }
  .hero-blob-1 { width:300px; height:300px; top:-100px; right:-60px; background:rgba(255,255,255,0.07); }
  .hero-blob-2 { width:200px; height:200px; bottom:-80px; left:20px; background:rgba(212,160,23,0.1); }
  .hero-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px; position:relative; z-index:1; }
  .hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.18); color:rgba(255,255,255,0.9); padding:5px 14px; border-radius:100px; font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; }
  .hero-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--amber-light); }
  .hero-edit-btn {
    background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.18);
    color:rgba(255,255,255,0.8); border-radius:10px; padding:8px 16px;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:0.82rem; font-weight:600;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:6px;
  }
  .hero-edit-btn:hover { background:rgba(255,255,255,0.18); color:var(--white); }
  .hero-name { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:800; color:var(--white); margin-bottom:4px; }
  .hero-period { font-size:0.82rem; color:rgba(255,255,255,0.55); }
  .hero-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; position:relative; z-index:1; }
  @media(max-width:700px){ .hero-stats{ grid-template-columns:repeat(2,1fr); } }
  .hero-stat-label { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:rgba(255,255,255,0.45); margin-bottom:5px; }
  .hero-stat-val { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:900; color:var(--white); line-height:1; }
  .hero-stat-val.amber { color:var(--amber-light); }
  .hero-stat-val.muted { color:rgba(255,255,255,0.7); }
  .hero-bar-label { display:flex; justify-content:space-between; font-size:0.72rem; color:rgba(255,255,255,0.5); margin-bottom:8px; font-weight:600; position:relative; z-index:1; }
  .hero-bar-track { background:rgba(255,255,255,0.12); border-radius:100px; height:8px; overflow:hidden; position:relative; z-index:1; }
  .hero-bar-fill { height:100%; border-radius:100px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1); animation:barGrow 1.2s ease; }

  .two-col { display:grid; grid-template-columns:1fr 340px; gap:20px; }
  @media(max-width:1050px){ .two-col{ grid-template-columns:1fr; } }

  .section-card { background:var(--white); border-radius:20px; border:1.5px solid var(--border); overflow:hidden; }
  .section-card-header { padding:22px 24px 0; display:flex; justify-content:space-between; align-items:flex-start; }
  .section-card-body { padding:20px 24px 24px; }
  .section-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--ink); }
  .section-sub { font-size:0.78rem; color:var(--ink-subtle); margin-top:2px; }
  .pro-tag {
    display:inline-flex; align-items:center; gap:4px; background:var(--amber-pale); color:var(--amber);
    font-size:0.65rem; font-weight:800; padding:3px 9px; border-radius:100px;
    border:1px solid rgba(212,160,23,0.2); text-transform:uppercase; letter-spacing:0.06em;
  }
  .btn-sm {
    padding:8px 14px; border-radius:9px; font-size:0.8rem; font-weight:700; cursor:pointer;
    transition:all 0.18s; font-family:'Plus Jakarta Sans',sans-serif; border:none;
  }
  .btn-sm.outline { background:transparent; border:1.5px solid var(--border); color:var(--ink-muted); }
  .btn-sm.outline:hover { border-color:rgba(10,10,10,0.2); color:var(--ink); }

  .cap-list { display:flex; flex-direction:column; gap:16px; }
  .cap-item-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .cap-left { display:flex; align-items:center; gap:10px; }
  .cap-icon { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:0.9rem; }
  .cap-name { font-size:0.875rem; font-weight:700; color:var(--ink); }
  .cap-spent-of { font-size:0.72rem; color:var(--ink-subtle); margin-top:1px; }
  .cap-right { text-align:right; }
  .cap-pct { font-size:0.82rem; font-weight:800; }
  .cap-pct.safe { color:var(--green-mid); }
  .cap-pct.warn { color:var(--amber); }
  .cap-pct.over { color:var(--red); }
  .cap-remaining { font-size:0.7rem; color:var(--ink-subtle); margin-top:1px; }
  .bar-track { background:var(--cream-dark); border-radius:100px; height:7px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:100px; animation:barGrow 1s ease; transition:width 1s cubic-bezier(0.4,0,0.2,1); }
  .cap-edit-row { display:flex; gap:8px; margin-top:10px; align-items:center; }
  .cap-input-wrap { flex:1; display:flex; align-items:stretch; border:1.5px solid var(--border); border-radius:10px; overflow:hidden; transition:all 0.2s; }
  .cap-input-wrap:focus-within { border-color:var(--green-light); }
  .cap-prefix {
    padding:0 10px; background:var(--cream-dark); border-right:1.5px solid var(--border);
    font-size:0.82rem; font-weight:700; color:var(--ink-muted); display:flex; align-items:center;
  }
  .cap-input {
    border:none; outline:none; padding:8px 10px; font-family:'Plus Jakarta Sans',sans-serif;
    font-size:15px; font-weight:600; color:var(--ink); background:transparent; width:100%;
  }
  .cap-save-btn {
    padding:8px 14px; background:var(--green-light); color:var(--white); border:none;
    border-radius:9px; font-size:0.8rem; font-weight:700; cursor:pointer; transition:all 0.18s; white-space:nowrap;
  }
  .cap-save-btn:hover { background:var(--green-mid); }
  .cap-add-btn {
    width:100%; padding:12px; border:1.5px dashed var(--border); border-radius:12px; background:transparent;
    color:var(--ink-subtle); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.85rem; font-weight:600;
    cursor:pointer; transition:all 0.2s; margin-top:16px;
  }
  .cap-add-btn:hover { border-color:var(--green-light); color:var(--green-mid); background:var(--green-pale); }
  .cap-divider { height:1px; background:var(--border); margin:4px 0; }

  .budget-list { display:flex; flex-direction:column; gap:10px; }
  .budget-item {
    display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:14px;
    border:1.5px solid var(--border); background:var(--white); transition:all 0.2s; cursor:pointer;
  }
  .budget-item:hover { border-color:rgba(64,145,108,0.3); box-shadow:var(--shadow-sm); }
  .budget-item.active-budget { border-color:var(--green-light); background:var(--green-pale); }
  .budget-item-icon {
    width:38px; height:38px; border-radius:11px; background:var(--cream-dark);
    display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0;
  }
  .budget-item.active-budget .budget-item-icon { background:rgba(64,145,108,0.2); }
  .budget-item-body { flex:1; min-width:0; }
  .budget-item-name { font-size:0.9rem; font-weight:700; color:var(--ink); }
  .budget-item-meta { font-size:0.72rem; color:var(--ink-subtle); margin-top:2px; }
  .budget-item-right { text-align:right; }
  .budget-item-amount { font-family:'Playfair Display',serif; font-size:0.95rem; font-weight:800; color:var(--ink); }
  .budget-item-pct { font-size:0.72rem; margin-top:2px; }
  .active-check {
    width:20px; height:20px; border-radius:50%; background:var(--green-light); color:var(--white);
    font-size:0.7rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:800;
  }
  .budget-add-card {
    display:flex; align-items:center; justify-content:center; gap:8px; padding:14px;
    border:1.5px dashed var(--border); border-radius:14px; cursor:pointer; transition:all 0.2s;
    color:var(--ink-subtle); font-size:0.875rem; font-weight:600; background:transparent;
  }
  .budget-add-card:hover { border-color:var(--green-light); color:var(--green-mid); background:var(--green-pale); }

  .rec-list { display:flex; flex-direction:column; gap:10px; }
  .rec-item { display:flex; align-items:center; gap:12px; padding:14px; border-radius:14px; border:1.5px solid var(--border); transition:all 0.2s; }
  .rec-item:hover { border-color:rgba(10,10,10,0.13); box-shadow:var(--shadow-sm); }
  .rec-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0; }
  .rec-body { flex:1; min-width:0; }
  .rec-name { font-size:0.875rem; font-weight:700; color:var(--ink); }
  .rec-meta { font-size:0.72rem; color:var(--ink-subtle); margin-top:2px; }
  .rec-right { text-align:right; }
  .rec-amount { font-family:'Playfair Display',serif; font-size:0.95rem; font-weight:800; color:var(--ink); }
  .rec-freq-pill {
    font-size:0.65rem; font-weight:700; padding:2px 8px; border-radius:100px;
    background:var(--cream-dark); color:var(--ink-subtle); margin-top:4px; display:inline-block;
  }
  .rec-del-btn {
    width:28px; height:28px; border-radius:8px; border:none; background:var(--cream-dark);
    color:var(--ink-subtle); cursor:pointer; font-size:0.75rem; display:flex; align-items:center;
    justify-content:center; transition:all 0.18s; flex-shrink:0;
  }
  .rec-del-btn:hover { background:var(--red-pale); color:var(--red); }
  .rec-add-btn {
    width:100%; padding:11px; border:1.5px dashed var(--border); border-radius:12px; background:transparent;
    color:var(--ink-subtle); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.82rem; font-weight:600;
    cursor:pointer; transition:all 0.2s; margin-top:4px;
  }
  .rec-add-btn:hover { border-color:var(--green-light); color:var(--green-mid); background:var(--green-pale); }

  .gate-wrap { position:relative; }
  .gate-blur { filter:blur(3px); opacity:0.5; pointer-events:none; user-select:none; }
  .gate-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:5; }
  .gate-card {
    background:var(--ink); border-radius:16px; padding:20px 24px; text-align:center;
    box-shadow:0 8px 32px rgba(0,0,0,0.22); max-width:260px;
  }
  .gate-icon { font-size:1.6rem; margin-bottom:10px; }
  .gate-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--white); margin-bottom:6px; }
  .gate-sub { font-size:0.78rem; color:rgba(255,255,255,0.5); line-height:1.55; margin-bottom:14px; }
  .gate-upgrade-btn {
    background:var(--amber); color:var(--ink); border:none; border-radius:9px; padding:9px 20px;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:0.82rem; font-weight:800; cursor:pointer; transition:all 0.2s;
  }
  .gate-upgrade-btn:hover { background:var(--amber-light); }

  .modal-bg {
    position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:100; display:flex;
    align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease;
  }
  @media(max-width:600px){ .modal-bg{ align-items:flex-end; padding:0; } }
  .modal {
    background:var(--white); border-radius:24px; padding:36px; width:100%; max-width:460px;
    box-shadow:0 24px 64px rgba(0,0,0,0.18); animation:scaleIn 0.3s cubic-bezier(0.34,1.3,0.64,1);
  }
  @media(max-width:600px){ .modal{ border-radius:24px 24px 0 0; padding:28px 24px 36px; } }
  .modal-handle { width:40px; height:4px; border-radius:100px; background:var(--border); margin:0 auto 20px; display:none; }
  @media(max-width:600px){ .modal-handle{ display:block; } }
  .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }
  .modal-title { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:800; color:var(--ink); }
  .modal-close {
    width:30px; height:30px; border-radius:8px; border:none; background:var(--cream-dark);
    color:var(--ink-subtle); cursor:pointer; font-size:0.85rem; display:flex; align-items:center; justify-content:center;
  }
  .modal-close:hover { background:var(--border); }
  .field-wrap { margin-bottom:16px; }
  .field-label { display:block; font-size:0.78rem; font-weight:600; color:var(--ink-muted); margin-bottom:6px; }
  .field-input {
    width:100%; padding:12px 14px; border:1.5px solid var(--border); border-radius:12px;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500; color:var(--ink);
    background:var(--cream); outline:none; transition:all 0.2s;
  }
  .field-input:focus { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); background:var(--white); }
  .field-input.error { border-color:var(--red); }
  .field-error { font-size:0.72rem; color:var(--red); margin-top:4px; font-weight:500; }
  .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .prefix-wrap {
    display:flex; align-items:stretch; border:1.5px solid var(--border); border-radius:12px;
    overflow:hidden; transition:all 0.2s; background:var(--cream);
  }
  .prefix-wrap:focus-within { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); background:var(--white); }
  .prefix-sym {
    padding:0 12px; background:var(--cream-dark); border-right:1.5px solid var(--border);
    font-weight:700; font-size:0.9rem; color:var(--ink-muted); display:flex; align-items:center;
  }
  .prefix-wrap .field-input { border:none; box-shadow:none; background:transparent; border-radius:0; }
  .period-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .period-item { padding:10px 8px; border-radius:11px; border:1.5px solid var(--border); cursor:pointer; text-align:center; transition:all 0.18s; }
  .period-item:hover { border-color:rgba(64,145,108,0.3); }
  .period-item.active { border-color:var(--green-light); background:var(--green-pale); }
  .period-item-icon { font-size:1.1rem; }
  .period-item-label { font-size:0.75rem; font-weight:700; color:var(--ink); margin-top:4px; }
  .period-item-desc { font-size:0.65rem; color:var(--ink-subtle); margin-top:2px; }
  .period-item.active .period-item-label { color:var(--green-deep); }
  .modal-footer { display:flex; gap:10px; margin-top:22px; }
  .modal-cancel {
    flex:0; padding:12px 20px; border:1.5px solid var(--border); border-radius:12px; background:transparent;
    color:var(--ink-muted); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:600;
    cursor:pointer; transition:all 0.2s; white-space:nowrap;
  }
  .modal-cancel:hover { border-color:rgba(10,10,10,0.2); color:var(--ink); }
  .modal-submit {
    flex:1; padding:13px; border-radius:12px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light));
    color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.95rem; font-weight:700; cursor:pointer;
    transition:all 0.22s; box-shadow:0 4px 16px rgba(27,67,50,0.25); display:flex; align-items:center; justify-content:center; gap:7px;
  }
  .modal-submit:hover { transform:translateY(-1px); }
  .modal-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.35); border-top-color:var(--white); border-radius:50%; animation:spin 0.7s linear infinite; }

  .toast {
    position:fixed; bottom:24px; right:24px; z-index:200; background:var(--ink); color:var(--white);
    padding:13px 20px; border-radius:12px; font-size:0.875rem; font-weight:600; display:flex; align-items:center;
    gap:9px; box-shadow:0 8px 32px rgba(0,0,0,0.22); animation:scaleIn 0.3s ease;
  }
`;

const CATS = [
  { id: "food", icon: "🍔", label: "Food", bg: "#FFF3E0" },
  { id: "transport", icon: "🚗", label: "Transport", bg: "#E8F5E9" },
  { id: "bills", icon: "🏠", label: "Bills", bg: "#FCE4EC" },
  { id: "shopping", icon: "🛍️", label: "Shopping", bg: "#F3E5F5" },
  { id: "health", icon: "💊", label: "Health", bg: "#E0F7FA" },
  { id: "airtime", icon: "📱", label: "Airtime", bg: "#E3F2FD" },
  { id: "entertainment", icon: "🎬", label: "Entertain.", bg: "#F9FBE7" },
  { id: "other", icon: "💼", label: "Other", bg: "#F5F5F5" },
];
const CAT_MAP = Object.fromEntries(CATS.map((c) => [c.id, c]));

const fmt = (n) => Number(n || 0).toLocaleString("en-NG");

function normalizeCategory(value) {
  if (!value) return "other";
  const v = String(value).toLowerCase().replace(/\s+/g, "");
  const aliases = {
    entertain: "entertainment",
    entertainment: "entertainment",
    data: "airtime",
    shop: "shopping",
    bill: "bills",
  };
  return CAT_MAP[v] ? v : aliases[v] || "other";
}

function formatPeriodLabel(period) {
  if (!period) return "Budget";
  return period.charAt(0).toUpperCase() + period.slice(1);
}

function formatDateRange(start, end, period) {
  if (period === "monthly") return "Monthly budget";
  if (period === "weekly") return "Weekly budget";
  if (start && end) {
    const s = new Date(start).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const e = new Date(end).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${s} – ${e}`;
  }
  return "Custom budget";
}

function BudgetModal({ budget, onSave, onClose }) {
  const isEdit = !!budget?.id;
  const [name, setName] = useState(budget?.name ?? "");
  const [amount, setAmount] = useState(
    budget?.amount ? String(budget.amount) : "",
  );
  const [period, setPeriod] = useState(budget?.period ?? "monthly");
  const [start, setStart] = useState(
    budget?.start_date ??
      budget?.start ??
      new Date().toISOString().split("T")[0],
  );
  const [end, setEnd] = useState(budget?.end_date ?? budget?.end ?? "");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Budget name is required";
    if (!amount || Number(amount) < 1) e.amount = "Enter a valid amount";
    if (period === "custom" && !start) e.start = "Start date is required";
    if (period === "custom" && !end) e.end = "End date is required";
    if (
      period === "custom" &&
      start &&
      end &&
      new Date(end) < new Date(start)
    ) {
      e.end = "End date cannot be before start date";
    }
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: budget?.id ?? null,
        name: name.trim(),
        amount: Number(amount),
        period,
        start,
        end,
      });
    } finally {
      setLoading(false);
    }
  };

  const PERIODS = [
    { id: "weekly", icon: "📅", label: "Weekly", desc: "Every 7 days" },
    { id: "monthly", icon: "🗓️", label: "Monthly", desc: "Full month" },
    { id: "custom", icon: "✏️", label: "Custom", desc: "Pick dates" },
  ];

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">
            {isEdit ? "Edit budget" : "New budget"}
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="field-wrap">
          <label className="field-label">Budget name</label>
          <input
            className={`field-input${errors.name ? " error" : ""}`}
            type="text"
            placeholder="e.g. April 2026"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((x) => ({ ...x, name: "" }));
            }}
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        <div className="field-wrap">
          <label className="field-label">Total budget amount</label>
          <div
            className={`prefix-wrap${errors.amount ? " error" : ""}`}
            style={errors.amount ? { borderColor: "var(--red)" } : {}}
          >
            <span className="prefix-sym">₦</span>
            <input
              className="field-input"
              type="text"
              inputMode="numeric"
              placeholder="180,000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^0-9]/g, ""));
                setErrors((x) => ({ ...x, amount: "" }));
              }}
            />
          </div>
          {errors.amount && <div className="field-error">{errors.amount}</div>}
        </div>

        <div className="field-wrap">
          <label className="field-label">Budget period</label>
          <div className="period-grid">
            {PERIODS.map((p) => (
              <div
                key={p.id}
                className={`period-item${period === p.id ? " active" : ""}`}
                onClick={() => setPeriod(p.id)}
              >
                <div className="period-item-icon">{p.icon}</div>
                <div className="period-item-label">{p.label}</div>
                <div className="period-item-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {period === "custom" && (
          <div className="field-row">
            <div className="field-wrap" style={{ marginBottom: 0 }}>
              <label className="field-label">Start date</label>
              <input
                className={`field-input${errors.start ? " error" : ""}`}
                type="date"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setErrors((x) => ({ ...x, start: "" }));
                }}
              />
              {errors.start && (
                <div className="field-error">{errors.start}</div>
              )}
            </div>
            <div className="field-wrap" style={{ marginBottom: 0 }}>
              <label className="field-label">End date</label>
              <input
                className={`field-input${errors.end ? " error" : ""}`}
                type="date"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setErrors((x) => ({ ...x, end: "" }));
                }}
              />
              {errors.end && <div className="field-error">{errors.end}</div>}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-submit" onClick={submit} disabled={loading}>
            {loading ? (
              <div className="spinner" />
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create budget"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecurringModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("bills");
  const [freq, setFreq] = useState("monthly");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = {};
    if (!name.trim()) e.name = "Required";
    if (!amount || Number(amount) < 1) e.amount = "Required";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        cat,
        name: name.trim(),
        amount: Number(amount),
        freq,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">Add recurring expense</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="field-wrap">
          <label className="field-label">Name</label>
          <input
            className={`field-input${errors.name ? " error" : ""}`}
            type="text"
            placeholder="e.g. Netflix, Gym membership"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((x) => ({ ...x, name: "" }));
            }}
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        <div className="field-row">
          <div className="field-wrap" style={{ marginBottom: 0 }}>
            <label className="field-label">Amount</label>
            <div
              className="prefix-wrap"
              style={errors.amount ? { borderColor: "var(--red)" } : {}}
            >
              <span className="prefix-sym">₦</span>
              <input
                className="field-input"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^0-9]/g, ""));
                  setErrors((x) => ({ ...x, amount: "" }));
                }}
              />
            </div>
            {errors.amount && (
              <div className="field-error">{errors.amount}</div>
            )}
          </div>

          <div className="field-wrap" style={{ marginBottom: 0 }}>
            <label className="field-label">Frequency</label>
            <select
              className="field-input"
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="field-wrap" style={{ marginTop: 14 }}>
          <label className="field-label">Category</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 7,
            }}
          >
            {CATS.map((c) => (
              <div
                key={c.id}
                onClick={() => setCat(c.id)}
                style={{
                  padding: "8px 4px",
                  borderRadius: 10,
                  border: `1.5px solid ${cat === c.id ? "var(--green-light)" : "var(--border)"}`,
                  background:
                    cat === c.id ? "var(--green-pale)" : "var(--white)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.18s",
                }}
              >
                <div style={{ fontSize: "1.05rem" }}>{c.icon}</div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color:
                      cat === c.id ? "var(--green-deep)" : "var(--ink-muted)",
                    marginTop: 2,
                  }}
                >
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-submit" onClick={submit} disabled={loading}>
            {loading ? <div className="spinner" /> : "Add recurring"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CapRow({ cap, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(cap.limit || 0));
  const c =
    CAT_MAP[normalizeCategory(cap.cat || cap.category)] ?? CAT_MAP.other;
  const spent = Number(cap.spent || 0);
  const limit = Number(cap.limit || 0);
  const rawPct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const pct = Math.min(100, rawPct);
  const status = rawPct >= 100 ? "over" : rawPct >= 80 ? "warn" : "safe";
  const barColor =
    rawPct >= 100
      ? "var(--red)"
      : rawPct >= 80
        ? "var(--amber)"
        : "var(--green-light)";
  const remaining = Math.max(0, limit - spent);

  const save = async () => {
    if (Number(val) > 0) {
      await onUpdate(cap, Number(val));
      setEditing(false);
    }
  };

  return (
    <div className="cap-item">
      <div className="cap-item-header">
        <div className="cap-left">
          <div className="cap-icon" style={{ background: c.bg }}>
            {c.icon}
          </div>
          <div>
            <div className="cap-name">{c.label}</div>
            <div className="cap-spent-of">
              ₦{fmt(spent)} of ₦{fmt(limit)}
            </div>
          </div>
        </div>
        <div className="cap-right">
          <div className={`cap-pct ${status}`}>{rawPct}%</div>
          <div className="cap-remaining">
            {rawPct >= 100 ? (
              <span style={{ color: "var(--red)" }}>
                ₦{fmt(spent - limit)} over
              </span>
            ) : (
              `₦${fmt(remaining)} left`
            )}
          </div>
        </div>
      </div>

      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {editing ? (
        <div className="cap-edit-row">
          <div className="cap-input-wrap">
            <span className="cap-prefix">₦</span>
            <input
              className="cap-input"
              type="text"
              inputMode="numeric"
              value={val}
              onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
            />
          </div>
          <button className="cap-save-btn" onClick={save}>
            Save
          </button>
          <button
            className="btn-sm outline"
            onClick={() => {
              setEditing(false);
              setVal(String(limit));
            }}
          >
            Cancel
          </button>
          <button
            className="btn-sm"
            style={{
              color: "var(--red)",
              background: "var(--red-pale)",
              border: "none",
              borderRadius: 9,
              padding: "8px 10px",
              cursor: "pointer",
            }}
            onClick={() => onDelete(cap)}
          >
            🗑
          </button>
        </div>
      ) : (
        <button
          className="btn-sm outline"
          style={{ marginTop: 8, fontSize: "0.75rem" }}
          onClick={() => setEditing(true)}
        >
          Edit cap
        </button>
      )}
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return <div className="toast">✓ {msg}</div>;
}

export default function BudgetPage() {
  const navigate = useNavigate();
  const { isPremiumOrTrial } = useAuth();
  const isPremium = isPremiumOrTrial;

  const {
    activeBudget,
    allBudgets = [],
    categoryCaps = [],
    recurring = [],
    totalSpent = 0,
    remaining = 0,
    daysLeft = 0,
    createBudget,
    setActiveBudget,
    upsertCategoryCap,
    deleteCategoryCap,
    addRecurring,
    deleteRecurring,
  } = useBudget();

  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const budgets = allBudgets;
  const caps = categoryCaps.map((cap) => ({
    ...cap,
    cat: normalizeCategory(cap.category || cap.cat),
    spent: Number(cap.spent || 0),
    limit: Number(cap.limit || 0),
  }));

  const currentBudget = useMemo(() => {
    return (
      activeBudget || budgets.find((b) => b.is_active) || budgets[0] || null
    );
  }, [activeBudget, budgets]);

  const spentAmount = Number(totalSpent || currentBudget?.spent || 0);
  const budgetAmount = Number(
    currentBudget?.total_amount || currentBudget?.amount || 0,
  );
  const remainingAmount = Number(
    remaining || Math.max(0, budgetAmount - spentAmount),
  );
  const spentPct =
    budgetAmount > 0
      ? Math.min(100, Math.round((spentAmount / budgetAmount) * 100))
      : 0;

  const saveBudget = async (data) => {
    try {
      await createBudget({
        name: data.name,
        amount: Number(data.amount),
        period: data.period,
        start_date: data.start,
        end_date: data.end,
        is_active: true,
      });
      setToast(data.id ? "Budget updated" : "Budget created");
      setModal(null);
    } catch (error) {
      console.error("Save budget error:", error);
      setToast(error?.message || "Could not save budget");
    }
  };

  const switchBudget = async (id) => {
    try {
      await setActiveBudget(id);
      const selected = budgets.find((b) => b.id === id);
      if (selected) setToast(`Switched to "${selected.name}"`);
    } catch (error) {
      console.error("Switch budget error:", error);
      setToast(error?.message || "Could not switch budget");
    }
  };

  const updateCap = async (cap, newLimit) => {
    try {
      await upsertCategoryCap({
        category: normalizeCategory(cap.category || cap.cat),
        limit: Number(newLimit),
      });
      setToast("Cap updated");
    } catch (error) {
      console.error("Update cap error:", error);
      setToast(error?.message || "Could not update cap");
    }
  };

  const removeCap = async (cap) => {
    try {
      await deleteCategoryCap(normalizeCategory(cap.category || cap.cat));
      setToast("Cap removed");
    } catch (error) {
      console.error("Delete cap error:", error);
      setToast(error?.message || "Could not remove cap");
    }
  };

  const addCap = async () => {
    try {
      const usedCats = caps.map((c) => normalizeCategory(c.cat));
      const available = CATS.filter((c) => !usedCats.includes(c.id));
      if (!available.length) return;

      const first = available[0];
      await upsertCategoryCap({
        category: first.id,
        limit: 20000,
      });
      setToast(`${first.label} cap added`);
    } catch (error) {
      console.error("Add cap error:", error);
      setToast(error?.message || "Could not add cap");
    }
  };

  const addRecurringItem = async (data) => {
    try {
      await addRecurring({
        category: normalizeCategory(data.cat),
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

  const removeRecurring = async (id) => {
    try {
      await deleteRecurring(id);
      setToast("Recurring expense removed");
    } catch (error) {
      console.error("Delete recurring error:", error);
      setToast(error?.message || "Could not remove recurring expense");
    }
  };

  const recurringItems = recurring.map((r) => ({
    ...r,
    cat: normalizeCategory(r.category || r.cat),
    name: r.name || r.description,
    freq: r.freq || r.frequency || "monthly",
    next: r.next || r.next_date || "Upcoming",
  }));

  const totalRecurring = recurringItems.reduce(
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
        <RecurringModal
          onSave={addRecurringItem}
          onClose={() => setModal(null)}
        />
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

        {currentBudget && (
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
                  {currentBudget.name}
                </div>
                <div className="hero-period">
                  {formatDateRange(
                    currentBudget.start_date || currentBudget.start,
                    currentBudget.end_date || currentBudget.end,
                    currentBudget.period,
                  )}{" "}
                  · {formatPeriodLabel(currentBudget.period)}
                </div>
              </div>

              <button
                className="hero-edit-btn"
                onClick={() => setModal("edit_budget")}
              >
                ✎ Edit
              </button>
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
                <div className="hero-stat-val muted">
                  ₦{fmt(remainingAmount)}
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">Days Left</div>
                <div className="hero-stat-val muted">{daysLeft}</div>
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
        )}

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
                    {caps.map((cap, i) => (
                      <div key={cap.id || cap.cat}>
                        {i > 0 && <div className="cap-divider" />}
                        <CapRow
                          cap={cap}
                          onUpdate={updateCap}
                          onDelete={removeCap}
                        />
                      </div>
                    ))}
                    {caps.length < CATS.length && (
                      <button className="cap-add-btn" onClick={addCap}>
                        + Add category cap
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="gate-wrap">
                    <div className="gate-blur">
                      <div className="cap-list">
                        {caps.slice(0, 3).map((cap, i) => (
                          <div key={cap.id || cap.cat}>
                            {i > 0 && <div className="cap-divider" />}
                            <CapRow
                              cap={cap}
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
                        <button
                          className="gate-upgrade-btn"
                          onClick={() => navigate("/upgrade")}
                        >
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
                      {recurringItems.map((r) => {
                        const c = CAT_MAP[r.cat] ?? CAT_MAP.other;
                        return (
                          <div key={r.id} className="rec-item">
                            <div
                              className="rec-icon"
                              style={{ background: c.bg }}
                            >
                              {c.icon}
                            </div>
                            <div className="rec-body">
                              <div className="rec-name">{r.name}</div>
                              <div className="rec-meta">Next: {r.next}</div>
                            </div>
                            <div className="rec-right">
                              <div className="rec-amount">₦{fmt(r.amount)}</div>
                              <div className="rec-freq-pill">
                                {String(r.freq).replace(/^./, (m) =>
                                  m.toUpperCase(),
                                )}
                              </div>
                            </div>
                            <button
                              className="rec-del-btn"
                              onClick={() => removeRecurring(r.id)}
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
                        {recurringItems.slice(0, 3).map((r) => {
                          const c = CAT_MAP[r.cat] ?? CAT_MAP.other;
                          return (
                            <div key={r.id} className="rec-item">
                              <div
                                className="rec-icon"
                                style={{ background: c.bg }}
                              >
                                {c.icon}
                              </div>
                              <div className="rec-body">
                                <div className="rec-name">{r.name}</div>
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
                        <button
                          className="gate-upgrade-btn"
                          onClick={() => navigate("/upgrade")}
                        >
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
                      Number(b.total_amount || b.amount || 0) > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (Number(b.spent || 0) /
                                Number(b.total_amount || b.amount || 0)) *
                                100,
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
                            {formatPeriodLabel(b.period)} · {usedPct}% used
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
                            ₦{fmt(b.total_amount || b.amount || 0)}
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
                              fontSize: "0.7rem",
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
