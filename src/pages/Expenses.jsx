import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  X,
  Download,
  Upload,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Star,
  LayoutGrid,
  LayoutList,
  Wallet,
  Car,
  Home,
  ShoppingBag,
  HeartPulse,
  Smartphone,
  Clapperboard,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useBudget } from "../providers/BudgetProvider";
import BankImport from "../components/BankImport";

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

  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes spin    { to{transform:rotate(360deg)} }

  .page { display:flex; flex-direction:column; gap:18px; width:100%; animation:fadeIn 0.3s ease; }
  .page-header { display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap; animation:fadeUp 0.32s ease; }
  .page-title { font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .page-sub { font-size:0.88rem; color:var(--ink-subtle); margin-top:4px; }
  .header-actions { display:flex; gap:10px; flex-wrap:wrap; }
  .btn-primary,.btn-outline,.btn-import,.gate-btn {
    display:inline-flex; align-items:center; gap:8px; border:none; cursor:pointer;
    font-family:'Plus Jakarta Sans',sans-serif; font-weight:700; border-radius:12px; transition:all 0.18s ease;
  }
  .btn-primary { background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); padding:12px 16px; box-shadow:0 8px 24px rgba(27,67,50,0.22); }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 12px 28px rgba(27,67,50,0.3); }
  .btn-outline,.btn-import { background:var(--white); color:var(--ink); border:1.5px solid var(--border); padding:12px 16px; }
  .btn-outline:hover,.btn-import:hover { border-color:rgba(10,10,10,0.18); background:var(--cream); }
  .btn-premium { position:relative; }
  .premium-badge { display:inline-flex; align-items:center; justify-content:center; margin-left:4px; padding:2px 7px; border-radius:100px; font-size:0.62rem; font-weight:800; background:var(--amber-pale); color:var(--amber); border:1px solid rgba(212,160,23,0.18); }

  .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; animation:fadeUp 0.32s ease 0.03s both; }
  @media(max-width:920px){ .stats-row{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:520px){ .stats-row{ grid-template-columns:1fr 1fr; gap:10px; } }
  .stat-card { background:var(--white); border:1.5px solid var(--border); border-radius:18px; padding:18px 16px; min-width:0; }
  .stat-label { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-subtle); margin-bottom:8px; }
  .stat-val { display:flex; align-items:center; gap:8px; font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:800; color:var(--ink); min-width:0; }
  .stat-val.red { color:var(--red); }
  .stat-val.green { color:var(--green-mid); }
  .stat-val.amber { color:var(--amber); }
  .stat-sub { font-size:0.76rem; color:var(--ink-subtle); margin-top:8px; }

  .toolbar { display:grid; grid-template-columns:minmax(240px,1fr) auto auto; gap:12px; align-items:center; animation:fadeUp 0.32s ease 0.06s both; }
  @media(max-width:980px){ .toolbar{ grid-template-columns:1fr; } }
  .search-wrap { display:flex; align-items:center; gap:10px; background:var(--white); border:1.5px solid var(--border); border-radius:14px; padding:0 12px; min-height:48px; cursor:text; }
  .search-input { flex:1; min-width:0; border:none; outline:none; background:transparent; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.95rem; color:var(--ink); }
  .search-input::placeholder { color:rgba(10,10,10,0.35); }
  .search-clear { width:28px; height:28px; border:none; border-radius:8px; background:var(--cream-dark); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink-subtle); }

  .filter-group { display:flex; align-items:center; gap:8px; flex-wrap:wrap; background:var(--white); border:1.5px solid var(--border); border-radius:16px; padding:8px; }
  .filter-pill { display:inline-flex; align-items:center; gap:6px; padding:8px 12px; border-radius:100px; font-size:0.8rem; font-weight:700; color:var(--ink-muted); cursor:pointer; transition:all 0.18s; border:1px solid transparent; }
  .filter-pill:hover { background:var(--cream); color:var(--ink); }
  .filter-pill.active { background:var(--green-pale); color:var(--green-deep); border-color:rgba(64,145,108,0.2); }

  .view-toggle { display:flex; gap:8px; background:var(--white); border:1.5px solid var(--border); border-radius:14px; padding:6px; }
  .view-btn { width:40px; height:40px; border:none; border-radius:10px; background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink-subtle); }
  .view-btn.active { background:var(--green-pale); color:var(--green-deep); }

  .empty { background:var(--white); border:1.5px solid var(--border); border-radius:22px; padding:48px 24px; text-align:center; color:var(--ink-subtle); animation:fadeUp 0.32s ease 0.09s both; }
  .empty-icon { display:flex; justify-content:center; margin-bottom:12px; opacity:0.55; }
  .empty-title { font-family:'Playfair Display',serif; font-size:1.15rem; font-weight:700; color:var(--ink); margin-bottom:6px; }
  .empty-sub { font-size:0.9rem; line-height:1.6; }

  .expense-cards { display:grid; grid-template-columns:1fr; gap:10px; animation:fadeUp 0.32s ease 0.09s both; }
  .expense-card { background:var(--white); border:1.5px solid var(--border); border-radius:18px; padding:16px; display:grid; grid-template-columns:auto 1fr auto; gap:14px; align-items:center; }
  @media(max-width:620px){ .expense-card{ grid-template-columns:auto 1fr; } .exp-right{ grid-column:1/-1; display:flex; justify-content:space-between; align-items:center; } }
  .exp-cat-icon,.td-icon,.rec-cat-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .exp-body { min-width:0; }
  .exp-desc,.td-desc,.rec-desc { font-size:0.92rem; font-weight:700; color:var(--ink); line-height:1.4; }
  .exp-meta { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:8px; font-size:0.76rem; color:var(--ink-subtle); }
  .exp-cat-pill,.rec-freq { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:100px; font-size:0.72rem; font-weight:700; }
  .exp-date,.exp-note,.rec-next { color:var(--ink-subtle); font-size:0.76rem; }
  .exp-right { display:flex; align-items:center; gap:12px; }
  .exp-amount,.td-amount,.rec-amount { font-family:'Playfair Display',serif; font-size:1rem; font-weight:800; color:var(--red); white-space:nowrap; }
  .exp-actions,.td-actions,.rec-actions { display:flex; gap:6px; }
  .exp-act-btn,.page-btn,.gate-close { width:30px; height:30px; border:none; border-radius:9px; background:var(--cream-dark); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink-subtle); transition:all 0.16s ease; }
  .exp-act-btn:hover,.page-btn:hover,.gate-close:hover { background:rgba(10,10,10,0.1); color:var(--ink); }
  .exp-act-btn.del:hover { background:var(--red-pale); color:var(--red); }

  .table-wrap { background:var(--white); border:1.5px solid var(--border); border-radius:20px; overflow:hidden; animation:fadeUp 0.32s ease 0.09s both; }
  .table-wrap table { width:100%; border-collapse:collapse; }
  .table-wrap th { text-align:left; padding:16px 14px; font-size:0.72rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:var(--ink-subtle); background:var(--bg); border-bottom:1px solid rgba(10,10,10,0.05); }
  .table-wrap td { padding:14px; border-bottom:1px solid rgba(10,10,10,0.05); vertical-align:middle; }
  .table-wrap tr:last-child td { border-bottom:none; }
  .right { text-align:right; }
  .pagination { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 16px; border-top:1px solid rgba(10,10,10,0.05); flex-wrap:wrap; }
  .page-info { font-size:0.8rem; color:var(--ink-subtle); }
  .page-btns { display:flex; gap:6px; flex-wrap:wrap; }
  .page-btn { background:var(--white); border:1.5px solid var(--border); }
  .page-btn.active { background:var(--green-pale); color:var(--green-deep); border-color:rgba(64,145,108,0.18); }
  .page-btn:disabled { opacity:0.45; cursor:not-allowed; }

  .recurring-section { background:var(--white); border:1.5px solid var(--border); border-radius:22px; padding:18px; animation:fadeUp 0.32s ease 0.12s both; }
  .section-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
  .section-title { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; color:var(--ink); }
  .section-sub { font-size:0.8rem; color:var(--ink-subtle); margin-top:4px; }
  .recurring-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  @media(max-width:980px){ .recurring-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:620px){ .recurring-grid{ grid-template-columns:1fr; } }
  .rec-card,.rec-add-card { border:1.5px solid var(--border); border-radius:18px; padding:14px; background:var(--cream); }
  .rec-card-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:8px; }
  .rec-meta { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:10px; }
  .rec-add-card { display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; color:var(--green-deep); background:linear-gradient(135deg,var(--green-pale),var(--white)); min-height:132px; font-weight:800; }

  .premium-gate { position:absolute; inset:16px; background:rgba(250,248,243,0.88); backdrop-filter:blur(7px); border:1px solid rgba(10,10,10,0.06); border-radius:18px; padding:18px; display:flex; gap:12px; align-items:flex-start; justify-content:center; }
  .gate-close { position:absolute; top:12px; right:12px; }
  .gate-text { max-width:420px; font-size:0.9rem; color:var(--ink-muted); line-height:1.6; }
  .gate-text strong { display:block; color:var(--ink); margin-bottom:4px; }
  .gate-btn { margin-top:12px; padding:10px 16px; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); }

  .modal-overlay { position:fixed; inset:0; background:rgba(10,10,10,0.45); display:flex; align-items:center; justify-content:center; z-index:400; padding:16px; }
  .modal-card { width:100%; max-width:520px; background:#fff; border-radius:22px; padding:22px; border:1.5px solid rgba(10,10,10,0.08); box-shadow:0 20px 60px rgba(0,0,0,0.2); }
  .modal-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
  .modal-title { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:800; color:#0A0A0A; }
  .modal-sub { font-size:0.82rem; color:#6B6B6B; margin-top:4px; }
  .icon-btn { width:34px; height:34px; border:none; border-radius:10px; background:#F0EDE4; cursor:pointer; color:#6B6B6B; display:flex; align-items:center; justify-content:center; }
  .modal-form { display:grid; gap:14px; }
  .modal-label { font-size:0.8rem; font-weight:700; color:#3A3A3A; display:block; margin-bottom:6px; }
  .modal-input,.modal-textarea { width:100%; padding:12px 14px; border-radius:12px; border:1.5px solid rgba(10,10,10,0.08); background:#FAF8F3; font-size:16px; outline:none; font-family:'Plus Jakarta Sans',sans-serif; }
  .modal-textarea { resize:vertical; }
  .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .modal-cat-grid { display:flex; flex-wrap:wrap; gap:8px; }
  .modal-cat-btn { padding:8px 12px; border-radius:100px; border:1.5px solid rgba(10,10,10,0.08); background:#fff; color:#3A3A3A; cursor:pointer; font-weight:700; font-size:0.76rem; }
  .modal-cat-btn.active { border-color:rgba(64,145,108,0.3); background:#D8F3DC; color:#1B4332; }
  .modal-actions { display:flex; justify-content:space-between; gap:10px; margin-top:4px; }
  .btn-danger { display:inline-flex; align-items:center; gap:8px; padding:11px 14px; border-radius:12px; cursor:pointer; border:1.5px solid rgba(229,57,53,0.18); background:rgba(229,57,53,0.08); color:#E53935; font-weight:700; }
  .btn-secondary { padding:11px 14px; border-radius:12px; cursor:pointer; border:1.5px solid rgba(10,10,10,0.08); background:#fff; color:#3A3A3A; font-weight:700; }

  .toast { position:fixed; bottom:22px; right:22px; z-index:300; background:var(--ink); color:var(--white); padding:12px 16px; border-radius:14px; font-size:0.88rem; font-weight:700; box-shadow:0 10px 30px rgba(0,0,0,0.2); animation:scaleIn 0.25s ease; }
`;

const PAGE_SIZE = 10;

const CATEGORIES = [
  { id: "food", label: "Food", Icon: Wallet, color: "#D97706", bg: "#FFF3E0" },
  {
    id: "transport",
    label: "Transport",
    Icon: Car,
    color: "#2D6A4F",
    bg: "#E8F5E9",
  },
  { id: "bills", label: "Bills", Icon: Home, color: "#C026D3", bg: "#FCE4EC" },
  {
    id: "shopping",
    label: "Shopping",
    Icon: ShoppingBag,
    color: "#7C3AED",
    bg: "#F3E5F5",
  },
  {
    id: "health",
    label: "Health",
    Icon: HeartPulse,
    color: "#0F766E",
    bg: "#E0F7FA",
  },
  {
    id: "airtime",
    label: "Airtime",
    Icon: Smartphone,
    color: "#2563EB",
    bg: "#E3F2FD",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    Icon: Clapperboard,
    color: "#65A30D",
    bg: "#F9FBE7",
  },
  {
    id: "other",
    label: "Other",
    Icon: Briefcase,
    color: "#475569",
    bg: "#F5F5F5",
  },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG");
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeCategory(value) {
  if (!value) return "other";
  const v = String(value).toLowerCase().replace(/\s+/g, "");
  if (CAT_MAP[v]) return v;
  const aliases = {
    shop: "shopping",
    fun: "entertainment",
    data: "airtime",
    airtime: "airtime",
    bills: "bills",
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

function ExpenseModal({ expense, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    id: expense?.id || null,
    description: expense?.description || "",
    amount: expense?.amount || "",
    category: normalizeCategory(expense?.category),
    date: expense?.date
      ? new Date(expense.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    note: expense?.notes || expense?.note || "",
  });

  const isEdit = Boolean(expense?.id);

  const submit = (e) => {
    e.preventDefault();
    onSave({
      id: form.id,
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      note: form.note.trim(),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {isEdit ? "Edit Expense" : "Add Expense"}
            </div>
            <div className="modal-sub">Save your expense to Truvllo</div>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div>
            <label className="modal-label">Description</label>
            <input
              className="modal-input"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="e.g. Chicken Republic lunch"
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
              <label className="modal-label">Date</label>
              <input
                className="modal-input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="modal-label">Category</label>
            <div className="modal-cat-grid">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`modal-cat-btn${form.category === c.id ? " active" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="modal-label">Note</label>
            <textarea
              className="modal-textarea"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={3}
              placeholder="Optional note"
            />
          </div>

          <div className="modal-actions">
            <div>
              {isEdit && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => onDelete(expense.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEdit ? "Save changes" : "Add expense"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const navigate = useNavigate();
  const { isPremiumOrTrial, profile, updateProfile } = useAuth();
  const {
    expenses = [],
    recurring = [],
    addExpense,
    updateExpense,
    deleteExpense,
    deleteRecurring,
    exportCSV, // ✅ BUG FIX 3: was exportExpensesCSV — correct name is exportCSV
  } = useBudget();

  const isPremium = isPremiumOrTrial;

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [view, setView] = useState("card");
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [showGate, setShowGate] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const goToUpgrade = () => {
    setShowGate(false);
    navigate("/upgrade");
  };

  const activateTrialIfEligible = useCallback(async () => {
    if (!profile) return;
    if (profile.plan === "premium" || profile.plan === "trial") return;
    if (profile.trial_activated) return;
    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + 7);
    const { error } = await updateProfile({
      plan: "trial",
      trial_activated: true,
      trial_started_at: now.toISOString(),
      trial_ends_at: endsAt.toISOString(),
    });
    if (!error) setToast("🎉 7-day Premium trial activated");
    else console.error("Trial activation failed:", error);
  }, [profile, updateProfile]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const desc = (e.description || e.desc || "").toLowerCase();
      const category = normalizeCategory(e.category || e.cat || "other");
      return (
        (!search || desc.includes(search.toLowerCase())) &&
        (catFilter === "all" || category === catFilter)
      );
    });
  }, [expenses, search, catFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const topCat = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = normalizeCategory(e.category || e.cat || "other");
      map[cat] = (map[cat] ?? 0) + Number(e.amount || 0);
    });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return top ? CAT_MAP[top[0]] : null;
  }, [expenses]);

  const avgExpense = expenses.length
    ? Math.round(totalSpent / expenses.length)
    : 0;

  // ── BUG FIX 1: updateExpense takes (id, updates) not one object ────────────
  const saveExpense = async (data) => {
    try {
      const payload = {
        description: data.description || "",
        amount: Number(data.amount || 0),
        category: normalizeCategory(data.category),
        date: data.date || new Date().toISOString().split("T")[0],
        notes: data.note || "",
      };

      if (data.id && expenses.find((e) => e.id === data.id)) {
        // ✅ BUG FIX 1: correct signature is updateExpense(id, updates)
        await updateExpense(data.id, payload);
        setToast("Expense updated");
      } else {
        await addExpense(payload);
        setToast("Expense added");
        await activateTrialIfEligible();
      }

      setModal(null);
    } catch (error) {
      console.error("Save expense error:", error);
      setToast(error?.message || "Could not save expense");
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      setModal(null);
      setToast("Expense deleted");
    } catch (error) {
      setToast(error?.message || "Could not delete expense");
    }
  };

  const handleDeleteRecurring = async (id) => {
    try {
      await deleteRecurring(id);
      setToast("Recurring removed");
    } catch (error) {
      setToast(error?.message || "Could not delete recurring");
    }
  };

  // ── BUG FIX 3: use exportCSV from BudgetProvider ─────────────────────────
  const handleExportCSV = async () => {
    if (!isPremium) {
      setShowGate(true);
      return;
    }
    try {
      if (typeof exportCSV === "function") {
        exportCSV();
        setToast("CSV exported");
        return;
      }
      // Fallback manual CSV
      const rows = [
        ["Date", "Description", "Category", "Amount", "Note"],
        ...expenses.map((e) => [
          e.date || "",
          `"${e.description || ""}"`,
          CAT_MAP[normalizeCategory(e.category)]?.label || "Other",
          Number(e.amount || 0),
          `"${e.notes || ""}"`,
        ]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "truvllo-expenses.csv";
      a.click();
      URL.revokeObjectURL(url);
      setToast("CSV exported");
    } catch (error) {
      setToast(error?.message || "Could not export CSV");
    }
  };

  // ── BUG FIX 2: importExpenses doesn't exist — call addExpense per item ────
  const handleImport = async (transactions) => {
    try {
      let count = 0;
      for (const t of transactions) {
        await addExpense({
          description: t.description,
          category: normalizeCategory(t.category),
          amount: Number(t.amount),
          date: t.date,
          notes: "Imported from bank",
        });
        count++;
      }
      setToast(`${count} transactions imported`);
      if (count > 0) await activateTrialIfEligible();
    } catch (error) {
      console.error("Import error:", error);
      setToast(error?.message || "Could not import transactions");
    }
  };

  const searchRef = useRef(null);

  return (
    <>
      <style>{FONTS + styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {modal && (
        <ExpenseModal
          expense={modal === "add" ? null : modal}
          onSave={saveExpense}
          onDelete={handleDeleteExpense}
          onClose={() => setModal(null)}
        />
      )}

      {showImport && (
        <BankImport
          onClose={() => setShowImport(false)}
          onImport={handleImport}
          currency="NGN"
          budgetId={null}
        />
      )}

      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Expenses</div>
            <div className="page-sub">{expenses.length} transactions</div>
          </div>
          <div className="header-actions">
            <button className="btn-import" onClick={() => setShowImport(true)}>
              <Upload size={15} /> Import from bank
            </button>
            <button
              className="btn-outline btn-premium"
              onClick={handleExportCSV}
            >
              <Download size={15} /> Export CSV
              {!isPremium && <span className="premium-badge">PRO</span>}
            </button>
            <button className="btn-primary" onClick={() => setModal("add")}>
              <Plus size={16} /> Add Expense
            </button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Spent</div>
            <div className="stat-val red">₦{fmt(totalSpent)}</div>
            <div className="stat-sub">From saved expenses</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Transactions</div>
            <div className="stat-val">{expenses.length}</div>
            <div className="stat-sub">Logged expenses</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg. Expense</div>
            <div className="stat-val amber">₦{fmt(avgExpense)}</div>
            <div className="stat-sub">Per transaction</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Top Category</div>
            <div className="stat-val green">
              {topCat ? (
                <>
                  <topCat.Icon size={18} color={topCat.color} />
                  {topCat.label}
                </>
              ) : (
                "—"
              )}
            </div>
            <div className="stat-sub">By spend</div>
          </div>
        </div>

        <div className="toolbar">
          <div
            className="search-wrap"
            onClick={() => searchRef.current?.focus()}
          >
            <Search size={15} color="var(--ink-subtle)" />
            <input
              ref={searchRef}
              className="search-input"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="filter-group">
            <div
              className={`filter-pill${catFilter === "all" ? " active" : ""}`}
              onClick={() => {
                setCatFilter("all");
                setPage(1);
              }}
            >
              All
            </div>
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                className={`filter-pill${catFilter === c.id ? " active" : ""}`}
                onClick={() => {
                  setCatFilter(catFilter === c.id ? "all" : c.id);
                  setPage(1);
                }}
              >
                <c.Icon size={13} />
                {c.label}
              </div>
            ))}
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn${view === "card" ? " active" : ""}`}
              onClick={() => setView("card")}
              title="Card view"
            >
              <LayoutList size={16} />
            </button>
            <button
              className={`view-btn${view === "table" ? " active" : ""}`}
              onClick={() => setView("table")}
              title="Table view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <Search size={40} />
            </div>
            <div className="empty-title">No expenses found</div>
            <p className="empty-sub">
              {search
                ? `No results for "${search}"`
                : "Try a different filter or add a new expense."}
            </p>
          </div>
        ) : view === "card" ? (
          <div className="expense-cards">
            {paginated.map((e) => {
              const catId = normalizeCategory(e.category || e.cat || "other");
              const c = CAT_MAP[catId] ?? CAT_MAP.other;
              const rowDate = e.date || e.expense_date;
              return (
                <div key={e.id} className="expense-card">
                  <div className="exp-cat-icon" style={{ background: c.bg }}>
                    <c.Icon size={20} color={c.color} />
                  </div>
                  <div className="exp-body">
                    <div className="exp-desc">{e.description || e.desc}</div>
                    <div className="exp-meta">
                      <span
                        className="exp-cat-pill"
                        style={{ background: c.bg, color: c.color }}
                      >
                        {c.label}
                      </span>
                      <span className="exp-date">{fmtDate(rowDate)}</span>
                      {(e.notes || e.note) && (
                        <span className="exp-note">· {e.notes || e.note}</span>
                      )}
                    </div>
                  </div>
                  <div className="exp-right">
                    <div className="exp-amount">−₦{fmt(e.amount)}</div>
                    <div className="exp-actions">
                      <button
                        className="exp-act-btn"
                        onClick={() => setModal(e)}
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="exp-act-btn del"
                        onClick={() => handleDeleteExpense(e.id)}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 52 }}></th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="right">Amount</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((e) => {
                  const catId = normalizeCategory(
                    e.category || e.cat || "other",
                  );
                  const c = CAT_MAP[catId] ?? CAT_MAP.other;
                  const rowDate = e.date || e.expense_date;
                  return (
                    <tr key={e.id}>
                      <td>
                        <div className="td-icon" style={{ background: c.bg }}>
                          <c.Icon size={18} color={c.color} />
                        </div>
                      </td>
                      <td>
                        <div className="td-desc">{e.description || e.desc}</div>
                        {(e.notes || e.note) && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--ink-subtle)",
                              marginTop: 2,
                            }}
                          >
                            {e.notes || e.note}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="exp-cat-pill"
                          style={{
                            background: c.bg,
                            color: c.color,
                            padding: "3px 10px",
                            borderRadius: "100px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                          }}
                        >
                          {c.label}
                        </span>
                      </td>
                      <td
                        style={{
                          color: "var(--ink-subtle)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {fmtDate(rowDate)}
                      </td>
                      <td className="right">
                        <div className="td-amount">−₦{fmt(e.amount)}</div>
                      </td>
                      <td className="right">
                        <div className="td-actions">
                          <button
                            className="exp-act-btn"
                            onClick={() => setModal(e)}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            className="exp-act-btn del"
                            onClick={() => handleDeleteExpense(e.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <div className="page-info">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </div>
                <div className="page-btns">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`page-btn${page === p ? " active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "card" && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            <button
              className="page-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn${page === p ? " active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              →
            </button>
          </div>
        )}

        <div className="recurring-section" style={{ position: "relative" }}>
          <div className="section-header">
            <div>
              <div className="section-title">Recurring Expenses</div>
              <div className="section-sub">
                Fixed costs that repeat every month
              </div>
            </div>
            {!isPremium && (
              <span
                style={{
                  fontSize: "0.72rem",
                  background: "var(--amber-pale)",
                  color: "var(--amber)",
                  padding: "4px 12px",
                  borderRadius: "100px",
                  fontWeight: 800,
                  border: "1px solid rgba(212,160,23,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Star size={11} /> Premium
              </span>
            )}
          </div>

          <div
            className="recurring-grid"
            style={{
              opacity: isPremium ? 1 : 0.55,
              filter: isPremium ? "none" : "blur(1px)",
              pointerEvents: isPremium ? "auto" : "none",
            }}
          >
            {recurring.map((r) => {
              const catId = normalizeCategory(r.category || r.cat || "other");
              const c = CAT_MAP[catId] ?? CAT_MAP.other;
              return (
                <div key={r.id} className="rec-card">
                  <div className="rec-card-top">
                    <div className="rec-cat-icon" style={{ background: c.bg }}>
                      <c.Icon size={18} color={c.color} />
                    </div>
                    <div className="rec-actions">
                      <button
                        className="exp-act-btn del"
                        onClick={() => handleDeleteRecurring(r.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="rec-desc">{r.description || r.desc}</div>
                  <div className="rec-meta">
                    <span className="rec-freq">
                      <RefreshCw
                        size={10}
                        style={{ marginRight: 3, verticalAlign: "middle" }}
                      />
                      {r.frequency || r.freq || "Monthly"}
                    </span>
                    <span className="rec-amount">₦{fmt(r.amount)}</span>
                  </div>
                  <div className="rec-next">
                    Next: {fmtDate(r.next_date || r.next)}
                  </div>
                </div>
              );
            })}
            <div className="rec-add-card" onClick={() => setShowGate(true)}>
              <Plus size={16} /> Add recurring
            </div>
          </div>

          {(!isPremium || showGate) && (
            <div className="premium-gate">
              <button className="gate-close" onClick={() => setShowGate(false)}>
                <X size={10} />
              </button>
              <Star
                size={18}
                color="var(--amber)"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <div className="gate-text">
                <strong>Premium Feature</strong>
                Recurring expenses, CSV export, and category caps are on the
                Premium plan.
                <div>
                  <button className="gate-btn" onClick={goToUpgrade}>
                    Upgrade — ₦6,500/mo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
