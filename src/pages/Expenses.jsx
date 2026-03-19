import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "../providers/AuthProvider";
import {
  Plus,
  Download,
  Search,
  X,
  Pencil,
  Trash2,
  LayoutList,
  LayoutGrid,
  Upload,
  Star,
  RefreshCw,
  UtensilsCrossed,
  Car,
  Home,
  ShoppingBag,
  Heart,
  Clapperboard,
  Smartphone,
  Briefcase,
} from "lucide-react";
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
    --red:#E53935; --red-pale:rgba(229,57,53,0.09);
    --shadow-sm:0 2px 8px rgba(0,0,0,0.06); --shadow-md:0 8px 28px rgba(0,0,0,0.09);
  }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes spin     { to{transform:rotate(360deg)} }

  .page { display:flex; flex-direction:column; gap:24px; animation:fadeIn 0.3s ease; }

  .page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; animation:fadeUp 0.35s ease; }
  .page-title  { font-family:'Playfair Display',serif; font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .page-sub    { font-size:0.875rem; color:var(--ink-subtle); margin-top:4px; }
  .header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

  .btn-primary {
    display:flex; align-items:center; gap:8px; padding:11px 20px;
    background:linear-gradient(135deg,var(--green-deep),var(--green-light));
    color:var(--white); border:none; border-radius:12px;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:700;
    cursor:pointer; transition:all 0.22s; box-shadow:0 4px 16px rgba(27,67,50,0.25);
  }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(27,67,50,0.35); }

  .btn-outline {
    display:flex; align-items:center; gap:7px; padding:10px 18px;
    background:var(--white); color:var(--ink-muted); border:1.5px solid var(--border);
    border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:600;
    cursor:pointer; transition:all 0.2s; position:relative;
  }
  .btn-outline:hover { border-color:rgba(10,10,10,0.2); color:var(--ink); }

  .btn-import {
    display:flex; align-items:center; gap:7px; padding:10px 18px;
    background:var(--green-pale); color:var(--green-deep); border:1.5px solid rgba(27,67,50,0.2);
    border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:700;
    cursor:pointer; transition:all 0.2s;
  }
  .btn-import:hover { background:#C8EDD0; border-color:var(--green-mid); }

  .premium-badge { position:absolute; top:-7px; right:-7px; background:var(--amber); color:var(--ink); font-size:0.55rem; font-weight:800; padding:2px 6px; border-radius:100px; text-transform:uppercase; letter-spacing:0.06em; }

  .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; animation:fadeUp 0.35s ease 0.05s both; }
  @media(max-width:800px){ .stats-row{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:480px){ .stats-row{ grid-template-columns:repeat(2,1fr); gap:10px; } }
  .stat-card { background:var(--white); border-radius:16px; padding:18px; border:1.5px solid var(--border); }
  .stat-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-subtle); margin-bottom:6px; }
  .stat-val   { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:900; color:var(--ink); display:flex; align-items:center; gap:7px; }
  .stat-val.green { color:var(--green-mid); }
  .stat-val.red   { color:var(--red); }
  .stat-val.amber { color:var(--amber); }
  .stat-sub  { font-size:0.72rem; color:var(--ink-subtle); margin-top:4px; }

  .toolbar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; animation:fadeUp 0.35s ease 0.08s both; }
  .search-wrap {
    flex:1; min-width:220px; display:flex; align-items:center; gap:8px;
    background:var(--white); border:1.5px solid var(--border); border-radius:12px; padding:0 14px; height:42px;
    transition:all 0.2s;
  }
  .search-wrap:focus-within { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); }
  .search-input { flex:1; border:none; outline:none; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; color:var(--ink); background:transparent; }
  .search-input::placeholder { color:rgba(10,10,10,0.32); }
  .search-clear { background:none; border:none; cursor:pointer; color:var(--ink-subtle); display:flex; align-items:center; padding:2px; transition:color 0.18s; }
  .search-clear:hover { color:var(--ink); }

  .filter-group { display:flex; gap:6px; flex-wrap:wrap; }
  .filter-pill {
    padding:8px 14px; border-radius:100px; border:1.5px solid var(--border);
    background:var(--white); color:var(--ink-muted); font-size:0.8rem; font-weight:600;
    cursor:pointer; transition:all 0.18s; white-space:nowrap; display:flex; align-items:center; gap:6px;
  }
  .filter-pill:hover { border-color:rgba(64,145,108,0.35); color:var(--green-mid); }
  .filter-pill.active { background:var(--green-pale); border-color:var(--green-light); color:var(--green-deep); }

  .view-toggle { display:flex; background:var(--cream-dark); border-radius:10px; padding:3px; gap:2px; }
  .view-btn { width:34px; height:34px; border:none; border-radius:8px; background:transparent; cursor:pointer; transition:all 0.18s; color:var(--ink-subtle); display:flex; align-items:center; justify-content:center; }
  .view-btn.active { background:var(--white); color:var(--ink); box-shadow:var(--shadow-sm); }

  .expense-cards { display:flex; flex-direction:column; gap:8px; }
  .expense-card {
    background:var(--white); border-radius:16px; padding:16px 18px;
    border:1.5px solid var(--border); display:flex; align-items:center; gap:14px;
    transition:all 0.2s;
  }
  .expense-card:hover { box-shadow:var(--shadow-sm); border-color:rgba(10,10,10,0.13); transform:translateX(2px); }
  .exp-cat-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .exp-body    { flex:1; min-width:0; }
  .exp-desc    { font-size:0.92rem; font-weight:700; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .exp-meta    { display:flex; align-items:center; gap:8px; margin-top:3px; flex-wrap:wrap; }
  .exp-cat-pill { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:100px; }
  .exp-date    { font-size:0.72rem; color:var(--ink-subtle); }
  .exp-note    { font-size:0.72rem; color:var(--ink-subtle); font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
  .exp-right   { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
  .exp-amount  { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:800; color:var(--ink); white-space:nowrap; }
  .exp-actions { display:flex; gap:6px; opacity:0; transition:opacity 0.18s; }
  .expense-card:hover .exp-actions { opacity:1; }
  .exp-act-btn { width:28px; height:28px; border-radius:8px; border:none; background:var(--cream-dark); color:var(--ink-subtle); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
  .exp-act-btn:hover { background:rgba(10,10,10,0.08); color:var(--ink); }
  .exp-act-btn.del:hover { background:var(--red-pale); color:var(--red); }

  .table-wrap { background:var(--white); border-radius:18px; border:1.5px solid var(--border); overflow:hidden; }
  table { width:100%; border-collapse:collapse; }
  thead { background:var(--bg); }
  th { padding:13px 16px; text-align:left; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-subtle); border-bottom:1.5px solid var(--border); white-space:nowrap; }
  th.right, td.right { text-align:right; }
  td { padding:14px 16px; font-size:0.875rem; color:var(--ink); border-bottom:1px solid rgba(10,10,10,0.05); vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:var(--bg); }
  .td-icon   { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .td-desc   { font-weight:600; }
  .td-amount { font-family:'Playfair Display',serif; font-weight:800; font-size:1rem; }
  .td-actions { display:flex; gap:6px; justify-content:flex-end; opacity:0; transition:opacity 0.18s; }
  tr:hover .td-actions { opacity:1; }

  .empty { text-align:center; padding:60px 20px; }
  .empty-icon  { margin-bottom:14px; color:var(--ink-subtle); display:flex; justify-content:center; }
  .empty-title { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; margin-bottom:6px; }
  .empty-sub   { font-size:0.875rem; color:var(--ink-subtle); line-height:1.6; max-width:280px; margin:0 auto; }

  .pagination { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-top:1.5px solid var(--border); flex-wrap:wrap; gap:10px; }
  .page-info  { font-size:0.8rem; color:var(--ink-subtle); font-weight:500; }
  .page-btns  { display:flex; gap:6px; }
  .page-btn   { width:34px; height:34px; border-radius:9px; border:1.5px solid var(--border); background:var(--white); color:var(--ink-muted); font-size:0.82rem; font-weight:600; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; justify-content:center; font-family:'Plus Jakarta Sans',sans-serif; }
  .page-btn:hover:not(:disabled) { border-color:var(--green-light); color:var(--green-mid); }
  .page-btn.active   { background:var(--green-light); border-color:var(--green-light); color:var(--white); }
  .page-btn:disabled { opacity:0.4; cursor:not-allowed; }

  .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
  @media(max-width:600px){ .modal-bg{ align-items:flex-end; padding:0; } }
  .modal {
    background:var(--white); border-radius:24px; padding:36px; width:100%; max-width:480px;
    box-shadow:0 24px 64px rgba(0,0,0,0.18); animation:scaleIn 0.3s cubic-bezier(0.34,1.3,0.64,1);
  }
  @media(max-width:600px){ .modal{ border-radius:24px 24px 0 0; padding:28px 24px 36px; } }
  .modal-handle { width:40px; height:4px; border-radius:100px; background:var(--border); margin:0 auto 20px; display:none; }
  @media(max-width:600px){ .modal-handle{ display:block; } }
  .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
  .modal-title  { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:800; color:var(--ink); }
  .modal-close  { width:32px; height:32px; border-radius:8px; border:none; background:var(--cream-dark); color:var(--ink-subtle); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
  .modal-close:hover { background:var(--border); color:var(--ink); }
  .modal-grid   { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .modal-grid .full { grid-column:1/-1; }
  .field-wrap   { display:flex; flex-direction:column; gap:6px; }
  .field-label  { font-size:0.78rem; font-weight:600; color:var(--ink-muted); }
  .field-input  { padding:12px 14px; border:1.5px solid var(--border); border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500; color:var(--ink); background:var(--cream); outline:none; transition:all 0.2s; width:100%; }
  .field-input:focus { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); background:var(--white); }
  .field-input.error { border-color:var(--red); }
  .field-error  { font-size:0.72rem; color:var(--red); font-weight:500; }
  .amount-prefix-wrap { display:flex; align-items:stretch; border:1.5px solid var(--border); border-radius:12px; overflow:hidden; transition:all 0.2s; background:var(--cream); }
  .amount-prefix-wrap:focus-within { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); background:var(--white); }
  .amount-prefix { padding:0 12px; background:var(--cream-dark); border-right:1.5px solid var(--border); font-weight:700; font-size:0.9rem; color:var(--ink-muted); display:flex; align-items:center; }
  .amount-prefix-wrap .field-input { border:none; box-shadow:none; background:transparent; border-radius:0; }
  .amount-prefix-wrap:focus-within .field-input { background:transparent; }
  .cat-select-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; }
  .cat-select-item { padding:8px 4px; border-radius:10px; border:1.5px solid var(--border); cursor:pointer; text-align:center; transition:all 0.18s; display:flex; flex-direction:column; align-items:center; gap:4px; }
  .cat-select-item:hover { border-color:rgba(64,145,108,0.35); }
  .cat-select-item.active { border-color:var(--green-light); background:var(--green-pale); }
  .cat-select-label { font-size:0.62rem; font-weight:700; color:var(--ink-muted); }
  .cat-select-item.active .cat-select-label { color:var(--green-deep); }
  .modal-footer  { display:flex; gap:10px; margin-top:24px; }
  .modal-cancel  { flex:0; padding:12px 20px; border:1.5px solid var(--border); border-radius:12px; background:transparent; color:var(--ink-muted); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .modal-cancel:hover { border-color:rgba(10,10,10,0.2); color:var(--ink); }
  .modal-submit  { flex:1; padding:13px; border-radius:12px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.95rem; font-weight:700; cursor:pointer; transition:all 0.22s; box-shadow:0 4px 16px rgba(27,67,50,0.25); display:flex; align-items:center; justify-content:center; gap:7px; }
  .modal-submit:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(27,67,50,0.35); }
  .modal-submit:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .modal-delete  { flex:0; padding:12px 16px; border-radius:12px; border:1.5px solid var(--red-pale); background:var(--red-pale); color:var(--red); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s; }
  .modal-delete:hover { background:rgba(229,57,53,0.15); }
  .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.35); border-top-color:var(--white); border-radius:50%; animation:spin 0.7s linear infinite; }

  .recurring-section { animation:fadeUp 0.35s ease 0.1s both; }
  .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .section-title  { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; }
  .section-sub    { font-size:0.78rem; color:var(--ink-subtle); margin-top:2px; }
  .recurring-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  @media(max-width:800px){ .recurring-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:500px){ .recurring-grid{ grid-template-columns:1fr; } }
  .rec-card { background:var(--white); border-radius:16px; padding:18px; border:1.5px solid var(--border); transition:all 0.2s; }
  .rec-card:hover { box-shadow:var(--shadow-sm); }
  .rec-card-top  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
  .rec-cat-icon  { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; }
  .rec-actions   { display:flex; gap:5px; opacity:0; transition:opacity 0.18s; }
  .rec-card:hover .rec-actions { opacity:1; }
  .rec-desc   { font-size:0.88rem; font-weight:700; color:var(--ink); margin-bottom:4px; }
  .rec-meta   { display:flex; justify-content:space-between; align-items:center; }
  .rec-freq   { font-size:0.72rem; color:var(--ink-subtle); font-weight:600; }
  .rec-amount { font-family:'Playfair Display',serif; font-size:1rem; font-weight:800; color:var(--ink); }
  .rec-next   { font-size:0.7rem; color:var(--ink-subtle); margin-top:6px; }
  .rec-add-card { background:var(--cream-dark); border-radius:16px; padding:18px; border:1.5px dashed var(--border); display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition:all 0.2s; color:var(--ink-subtle); font-size:0.875rem; font-weight:600; min-height:100px; }
  .rec-add-card:hover { border-color:var(--green-light); color:var(--green-mid); background:var(--green-pale); }

  .premium-gate { position:absolute; bottom:16px; right:16px; background:var(--ink); border-radius:14px; padding:14px 16px; display:flex; gap:10px; align-items:flex-start; box-shadow:0 8px 32px rgba(0,0,0,0.2); max-width:280px; z-index:10; animation:scaleIn 0.3s ease; }
  .gate-text    { font-size:0.78rem; color:rgba(255,255,255,0.7); line-height:1.55; }
  .gate-text strong { color:var(--white); font-weight:700; display:block; margin-bottom:2px; }
  .gate-btn     { background:var(--amber); color:var(--ink); border:none; border-radius:7px; padding:5px 12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.72rem; font-weight:800; cursor:pointer; margin-top:8px; transition:all 0.18s; }
  .gate-btn:hover { background:var(--amber-light); }
  .gate-close   { position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.1); border:none; border-radius:6px; width:20px; height:20px; color:rgba(255,255,255,0.5); cursor:pointer; font-size:0.7rem; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
  .gate-close:hover { background:rgba(255,255,255,0.18); color:var(--white); }

  .toast { position:fixed; bottom:24px; right:24px; z-index:200; background:var(--ink); color:var(--white); padding:13px 20px; border-radius:12px; font-size:0.875rem; font-weight:600; display:flex; align-items:center; gap:9px; box-shadow:0 8px 32px rgba(0,0,0,0.22); animation:scaleIn 0.3s ease; }
`;

const CATEGORIES = [
  {
    id: "food",
    Icon: UtensilsCrossed,
    label: "Food",
    bg: "#FFF3E0",
    color: "#E65100",
  },
  {
    id: "transport",
    Icon: Car,
    label: "Transport",
    bg: "#E8F5E9",
    color: "#2E7D32",
  },
  { id: "bills", Icon: Home, label: "Bills", bg: "#FCE4EC", color: "#C2185B" },
  {
    id: "shopping",
    Icon: ShoppingBag,
    label: "Shopping",
    bg: "#F3E5F5",
    color: "#7B1FA2",
  },
  {
    id: "health",
    Icon: Heart,
    label: "Health",
    bg: "#E0F7FA",
    color: "#00838F",
  },
  {
    id: "airtime",
    Icon: Smartphone,
    label: "Airtime",
    bg: "#E3F2FD",
    color: "#1565C0",
  },
  {
    id: "entertain",
    Icon: Clapperboard,
    label: "Entertain.",
    bg: "#F9FBE7",
    color: "#558B2F",
  },
  {
    id: "other",
    Icon: Briefcase,
    label: "Other",
    bg: "#F5F5F5",
    color: "#616161",
  },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const MOCK_EXPENSES = [
  {
    id: 1,
    desc: "Chicken Republic — Lunch",
    cat: "food",
    amount: 4500,
    date: "2026-03-16",
    note: "",
  },
  {
    id: 2,
    desc: "Bolt — Office commute",
    cat: "transport",
    amount: 2800,
    date: "2026-03-16",
    note: "Morning trip",
  },
  {
    id: 3,
    desc: "Netflix subscription",
    cat: "entertain",
    amount: 4800,
    date: "2026-03-15",
    note: "",
  },
  {
    id: 4,
    desc: "Shoprite groceries",
    cat: "food",
    amount: 18500,
    date: "2026-03-14",
    note: "Weekly shopping",
  },
  {
    id: 5,
    desc: "MTN Data bundle — 10GB",
    cat: "airtime",
    amount: 3000,
    date: "2026-03-13",
    note: "",
  },
  {
    id: 6,
    desc: "Chicken Republic — Dinner",
    cat: "food",
    amount: 5200,
    date: "2026-03-12",
    note: "",
  },
  {
    id: 7,
    desc: "EKEDC electricity bill",
    cat: "bills",
    amount: 15000,
    date: "2026-03-10",
    note: "March prepaid",
  },
  {
    id: 8,
    desc: "Uber — Airport pickup",
    cat: "transport",
    amount: 8500,
    date: "2026-03-09",
    note: "Client visit",
  },
  {
    id: 9,
    desc: "Zara — Work trousers",
    cat: "shopping",
    amount: 22000,
    date: "2026-03-08",
    note: "",
  },
  {
    id: 10,
    desc: "Pharmacy — Cold medicine",
    cat: "health",
    amount: 3500,
    date: "2026-03-07",
    note: "",
  },
  {
    id: 11,
    desc: "Coldstone — Date night",
    cat: "entertain",
    amount: 6500,
    date: "2026-03-06",
    note: "",
  },
  {
    id: 12,
    desc: "Bolt — Supermarket trip",
    cat: "transport",
    amount: 1900,
    date: "2026-03-05",
    note: "",
  },
  {
    id: 13,
    desc: "Mr Biggs — Breakfast",
    cat: "food",
    amount: 2100,
    date: "2026-03-04",
    note: "",
  },
  {
    id: 14,
    desc: "Airtel recharge",
    cat: "airtime",
    amount: 1500,
    date: "2026-03-03",
    note: "",
  },
  {
    id: 15,
    desc: "DSTV subscription",
    cat: "entertain",
    amount: 9500,
    date: "2026-03-02",
    note: "Monthly",
  },
];

const MOCK_RECURRING = [
  {
    id: 1,
    desc: "Netflix",
    cat: "entertain",
    amount: 4800,
    freq: "Monthly",
    next: "Apr 1",
  },
  {
    id: 2,
    desc: "DSTV Compact",
    cat: "entertain",
    amount: 9500,
    freq: "Monthly",
    next: "Apr 2",
  },
  {
    id: 3,
    desc: "Gym membership",
    cat: "health",
    amount: 15000,
    freq: "Monthly",
    next: "Apr 1",
  },
  {
    id: 4,
    desc: "iCloud 50GB",
    cat: "airtime",
    amount: 900,
    freq: "Monthly",
    next: "Apr 5",
  },
];

const PAGE_SIZE = 8;

function fmt(n) {
  return Number(n).toLocaleString("en-NG");
}
function fmtDate(d) {
  const today = new Date().toISOString().split("T")[0];
  const yest = new Date();
  yest.setDate(new Date().getDate() - 1);
  if (d === today) return "Today";
  if (d === yest.toISOString().split("T")[0]) return "Yesterday";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

function ExpenseModal({ expense, onSave, onDelete, onClose }) {
  const isEdit = !!expense?.id;
  const [desc, setDesc] = useState(expense?.desc ?? "");
  const [amount, setAmount] = useState(
    expense?.amount ? String(expense.amount) : "",
  );
  const [cat, setCat] = useState(expense?.cat ?? "food");
  const [date, setDate] = useState(
    expense?.date ?? new Date().toISOString().split("T")[0],
  );
  const [note, setNote] = useState(expense?.note ?? "");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!desc.trim()) e.desc = "Description is required";
    if (!amount || Number(amount) < 1) e.amount = "Enter a valid amount";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onSave({
        id: expense?.id ?? Date.now(),
        desc,
        amount: Number(amount),
        cat,
        date,
        note,
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">
            {isEdit ? "Edit expense" : "Add expense"}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="modal-grid">
          <div className="field-wrap full">
            <label className="field-label">Description</label>
            <input
              className={`field-input${errors.desc ? " error" : ""}`}
              type="text"
              placeholder="e.g. Chicken Republic lunch"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                setErrors((x) => ({ ...x, desc: "" }));
              }}
            />
            {errors.desc && <span className="field-error">{errors.desc}</span>}
          </div>
          <div className="field-wrap">
            <label className="field-label">Amount</label>
            <div
              className={`amount-prefix-wrap${errors.amount ? " error" : ""}`}
              style={errors.amount ? { borderColor: "var(--red)" } : {}}
            >
              <span className="amount-prefix">₦</span>
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
              <span className="field-error">{errors.amount}</span>
            )}
          </div>
          <div className="field-wrap">
            <label className="field-label">Date</label>
            <input
              className="field-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field-wrap full">
            <label className="field-label">Category</label>
            <div className="cat-select-grid">
              {CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  className={`cat-select-item${cat === c.id ? " active" : ""}`}
                  onClick={() => setCat(c.id)}
                >
                  <c.Icon size={18} color={c.color} />
                  <div className="cat-select-label">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="field-wrap full">
            <label className="field-label">Note (optional)</label>
            <input
              className="field-input"
              type="text"
              placeholder="Any extra detail..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          {isEdit && (
            <button
              className="modal-delete"
              onClick={() => onDelete(expense.id)}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-submit" onClick={submit} disabled={loading}>
            {loading ? (
              <div className="spinner" />
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Add expense"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="toast">
      <span style={{ color: "#52B788" }}>✓</span> {msg}
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [recurring, setRecurring] = useState(MOCK_RECURRING);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [view, setView] = useState("card");
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [showGate, setShowGate] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { isPremiumOrTrial, profile, updateProfile } = useAuth();
  const isPremium = isPremiumOrTrial;

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

    if (!error) {
      setToast("🎉 7-day Premium trial activated");
    } else {
      console.error("Trial activation failed:", error);
    }
  }, [profile, updateProfile]);

  const filtered = useMemo(
    () =>
      expenses.filter((e) => {
        const matchSearch =
          !search || e.desc.toLowerCase().includes(search.toLowerCase());
        const matchCat = catFilter === "all" || e.cat === catFilter;
        return matchSearch && matchCat;
      }),
    [expenses, search, catFilter],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const topCat = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.cat] = (map[e.cat] ?? 0) + e.amount;
    });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return top ? CAT_MAP[top[0]] : null;
  }, [expenses]);
  const avgExpense = expenses.length
    ? Math.round(totalSpent / expenses.length)
    : 0;

  const saveExpense = async (data) => {
    const exists = expenses.find((e) => e.id === data.id);

    if (exists) {
      setExpenses((prev) => prev.map((e) => (e.id === data.id ? data : e)));
      setToast("Expense updated");
    } else {
      setExpenses((prev) => [data, ...prev]);
      setToast("Expense added");
      await activateTrialIfEligible();
    }

    setModal(null);
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setModal(null);
    setToast("Expense deleted");
  };

  const deleteRecurring = (id) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
    setToast("Recurring removed");
  };

  const exportCSV = () => {
    if (!isPremium) {
      setShowGate(true);
      return;
    }
    const rows = [
      ["Date", "Description", "Category", "Amount", "Note"],
      ...expenses.map((e) => [
        e.date,
        `"${e.desc}"`,
        CAT_MAP[e.cat]?.label ?? e.cat,
        e.amount,
        `"${e.note ?? ""}"`,
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
  };

  const handleImport = async (transactions) => {
    const newExpenses = transactions.map((t) => ({
      id: Date.now() + Math.random(),
      desc: t.description,
      cat:
        t.category.toLowerCase().replace(/\s+/g, "") in CAT_MAP
          ? t.category.toLowerCase().replace(/\s+/g, "")
          : "other",
      amount: Number(t.amount),
      date: t.date,
      note: "Imported from bank",
    }));

    setExpenses((prev) => [...newExpenses, ...prev]);
    setToast(`${newExpenses.length} transactions imported`);

    if (newExpenses.length > 0) {
      await activateTrialIfEligible();
    }
  };

  const searchRef = useRef();

  return (
    <>
      <style>{FONTS + styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {modal && (
        <ExpenseModal
          expense={modal === "add" ? null : modal}
          onSave={saveExpense}
          onDelete={deleteExpense}
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
            <div className="page-sub">
              {expenses.length} transactions · March 2026
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-import" onClick={() => setShowImport(true)}>
              <Upload size={15} /> Import from bank
            </button>
            <div className="btn-outline btn-premium" onClick={exportCSV}>
              <Download size={15} /> Export CSV
              {!isPremium && <span className="premium-badge">PRO</span>}
            </div>
            <button className="btn-primary" onClick={() => setModal("add")}>
              <Plus size={16} /> Add Expense
            </button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Spent</div>
            <div className="stat-val red">₦{fmt(totalSpent)}</div>
            <div className="stat-sub">This month</div>
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
              {topCat && <topCat.Icon size={18} color={topCat.color} />}
              {topCat?.label ?? "—"}
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
              const c = CAT_MAP[e.cat] ?? CAT_MAP.other;
              return (
                <div key={e.id} className="expense-card">
                  <div className="exp-cat-icon" style={{ background: c.bg }}>
                    <c.Icon size={20} color={c.color} />
                  </div>
                  <div className="exp-body">
                    <div className="exp-desc">{e.desc}</div>
                    <div className="exp-meta">
                      <span
                        className="exp-cat-pill"
                        style={{ background: c.bg, color: c.color }}
                      >
                        {c.label}
                      </span>
                      <span className="exp-date">{fmtDate(e.date)}</span>
                      {e.note && <span className="exp-note">· {e.note}</span>}
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
                        onClick={() => deleteExpense(e.id)}
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
                  const c = CAT_MAP[e.cat] ?? CAT_MAP.other;
                  return (
                    <tr key={e.id}>
                      <td>
                        <div className="td-icon" style={{ background: c.bg }}>
                          <c.Icon size={18} color={c.color} />
                        </div>
                      </td>
                      <td>
                        <div className="td-desc">{e.desc}</div>
                        {e.note && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--ink-subtle)",
                              marginTop: 2,
                            }}
                          >
                            {e.note}
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
                        {fmtDate(e.date)}
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
                            onClick={() => deleteExpense(e.id)}
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
              const c = CAT_MAP[r.cat] ?? CAT_MAP.other;
              return (
                <div key={r.id} className="rec-card">
                  <div className="rec-card-top">
                    <div className="rec-cat-icon" style={{ background: c.bg }}>
                      <c.Icon size={18} color={c.color} />
                    </div>
                    <div className="rec-actions">
                      <button
                        className="exp-act-btn del"
                        onClick={() => deleteRecurring(r.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="rec-desc">{r.desc}</div>
                  <div className="rec-meta">
                    <span className="rec-freq">
                      <RefreshCw
                        size={10}
                        style={{ marginRight: 3, verticalAlign: "middle" }}
                      />
                      {r.freq}
                    </span>
                    <span className="rec-amount">₦{fmt(r.amount)}</span>
                  </div>
                  <div className="rec-next">Next: {r.next}</div>
                </div>
              );
            })}
            <div className="rec-add-card" onClick={() => {}}>
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
                  <button className="gate-btn">Upgrade — ₦6,500/mo</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
