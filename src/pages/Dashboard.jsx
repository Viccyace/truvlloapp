import { useState, useEffect, useRef, useCallback } from "react";
import DOMPurify from "dompurify";
import {
  Wallet,
  ArrowUpRight,
  PiggyBank,
  CalendarDays,
  Sparkles,
  RefreshCw,
  Zap,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { useBudget } from "../providers/BudgetProvider";
import { useAI } from "../hooks/useAI";
import { supabase } from "../lib/supabase";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F3EE; color: #0A0A0A; }
  :root {
    --cream: #FAF8F3; --cream-dark: #F0EDE4; --bg: #F5F3EE;
    --green-deep: #1B4332; --green-mid: #2D6A4F; --green-light: #40916C; --green-pale: #D8F3DC;
    --ink: #0A0A0A; --ink-muted: #3A3A3A; --ink-subtle: #6B6B6B;
    --amber: #D4A017; --amber-light: #F0C040; --amber-pale: rgba(212,160,23,0.1);
    --white: #FFFFFF; --border: rgba(10,10,10,0.08);
    --red: #E53935; --red-pale: rgba(229,57,53,0.1);
  }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes barGrow { from{width:0} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .dash { display:flex; flex-direction:column; gap:24px; max-width:1200px; width:100%; overflow-x:hidden; animation:fadeIn 0.35s ease; }

  .greeting { animation:fadeUp 0.4s ease; min-width:0; }
  .greeting-time { font-size:0.78rem; color:var(--ink-subtle); font-weight:600; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
  .greeting-name { font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .greeting-name em { font-style:italic; color:var(--green-mid); }
  .greeting-sub { font-size:0.9rem; color:var(--ink-subtle); margin-top:4px; }
  @media(max-width:480px){ .greeting-name{font-size:1.5rem} .greeting-sub{font-size:0.78rem} }

  .summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; animation:fadeUp 0.4s ease 0.05s both; }
  @media(max-width:900px){ .summary-grid{grid-template-columns:repeat(2,1fr)} }
  @media(max-width:480px){ .summary-grid{grid-template-columns:repeat(2,1fr);gap:10px} }

  .sum-card { background:var(--white); border-radius:20px; padding:20px 16px; border:1.5px solid var(--border); transition:all 0.22s; position:relative; overflow:hidden; min-width:0; }
  .sum-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.08); }
  .sum-card.hero-card { background:linear-gradient(140deg,var(--green-deep) 0%,var(--green-light) 100%); border-color:transparent; box-shadow:0 8px 32px rgba(27,67,50,0.28); }
  .sum-card-bg { position:absolute; width:120px; height:120px; border-radius:50%; top:-30px; right:-30px; opacity:0.08; pointer-events:none; }
  .sum-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; flex-shrink:0; }
  .sum-icon.green { background:var(--green-pale); }
  .sum-icon.amber { background:var(--amber-pale); }
  .sum-icon.red   { background:var(--red-pale); }
  .sum-icon.white { background:rgba(255,255,255,0.15); }
  .sum-label { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-subtle); margin-bottom:5px; }
  .hero-card .sum-label { color:rgba(255,255,255,0.6); }
  .sum-value { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:900; color:var(--ink); line-height:1; word-break:break-all; }
  @media(max-width:480px){ .sum-value{font-size:1.1rem} }
  @media(max-width:360px){ .sum-value{font-size:0.95rem} }
  .hero-card .sum-value { color:var(--white); }
  .sum-value.green { color:var(--green-mid); }
  .sum-value.amber { color:var(--amber); }
  .sum-value.red   { color:var(--red); }
  .sum-change { display:flex; align-items:center; gap:4px; margin-top:6px; font-size:0.68rem; font-weight:600; flex-wrap:wrap; line-height:1.4; }
  .sum-change.up      { color:var(--green-light); }
  .sum-change.down    { color:var(--red); }
  .sum-change.neutral { color:var(--ink-subtle); }
  .hero-card .sum-change { color:rgba(255,255,255,0.65); }

  .two-col { display:grid; grid-template-columns:1fr 360px; gap:20px; animation:fadeUp 0.4s ease 0.1s both; }
  @media(max-width:1100px){ .two-col{grid-template-columns:1fr} }

  .pace-card { background:var(--white); border-radius:20px; padding:24px; border:1.5px solid var(--border); min-width:0; }
  @media(max-width:480px){ .pace-card{padding:18px 14px} }
  .card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; gap:8px; }
  .card-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--ink); }
  .card-sub { font-size:0.78rem; color:var(--ink-subtle); margin-top:2px; }
  .status-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:100px; font-size:0.7rem; font-weight:800; white-space:nowrap; flex-shrink:0; }
  .pace-meta { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:18px; }
  .pace-meta-item { background:var(--bg); border-radius:10px; padding:10px; min-width:0; }
  .pace-meta-label { font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--ink-subtle); margin-bottom:4px; }
  .pace-meta-value { font-family:'Playfair Display',serif; font-size:0.95rem; font-weight:800; color:var(--ink); word-break:break-all; }
  .pace-meta-value.green { color:var(--green-mid); }
  .pace-meta-value.amber { color:var(--amber); }
  .pace-meta-value.red   { color:var(--red); }
  .pace-bar-wrap { margin-bottom:10px; }
  .pace-bar-labels { display:flex; justify-content:space-between; font-size:0.72rem; color:var(--ink-subtle); font-weight:600; margin-bottom:8px; }
  .pace-bar-track { background:var(--cream-dark); border-radius:100px; height:10px; overflow:hidden; position:relative; }
  .pace-bar-expected { position:absolute; top:0; bottom:0; left:0; background:rgba(10,10,10,0.07); border-radius:100px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1); }
  .pace-bar-actual { height:100%; border-radius:100px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1) 0.1s; animation:barGrow 1.2s ease; }
  .pace-tick { position:absolute; top:-2px; bottom:-2px; width:2px; background:var(--ink-subtle); border-radius:1px; transform:translateX(-50%); transition:left 1.2s cubic-bezier(0.4,0,0.2,1); }
  .pace-tick-label { position:absolute; top:-20px; transform:translateX(-50%); font-size:0.62rem; font-weight:700; color:var(--ink-subtle); white-space:nowrap; }
  .pace-bar-caption { font-size:0.78rem; color:var(--ink-subtle); line-height:1.5; margin-top:12px; }

  .safe-card { background:linear-gradient(160deg,var(--green-deep),var(--green-mid)); border-radius:20px; padding:24px; display:flex; flex-direction:column; justify-content:space-between; min-height:180px; position:relative; overflow:hidden; }
  .safe-card-bg  { position:absolute; width:200px; height:200px; border-radius:50%; bottom:-60px; right:-60px; background:rgba(255,255,255,0.05); pointer-events:none; }
  .safe-card-bg2 { position:absolute; width:120px; height:120px; border-radius:50%; top:-40px; left:-20px; background:rgba(255,255,255,0.04); pointer-events:none; }
  .safe-label  { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:rgba(255,255,255,0.55); margin-bottom:8px; }
  .safe-amount { font-family:'Playfair Display',serif; font-size:2.2rem; font-weight:900; color:var(--white); line-height:1; margin-bottom:4px; }
  @media(max-width:480px){ .safe-amount{font-size:1.8rem} }
  .safe-period { font-size:0.82rem; color:rgba(255,255,255,0.5); }
  .safe-footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:16px; }
  .safe-days   { font-size:0.8rem; color:rgba(255,255,255,0.5); }
  .safe-days strong { color:rgba(255,255,255,0.85); }
  .safe-ring   { width:48px; height:48px; position:relative; flex-shrink:0; }
  .safe-ring svg { transform:rotate(-90deg); }
  .safe-ring-pct { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:800; color:rgba(255,255,255,0.7); }

  .ai-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; animation:fadeUp 0.4s ease 0.15s both; }
  @media(max-width:700px){ .ai-grid{grid-template-columns:1fr} }
  .ai-card { background:var(--ink); border-radius:20px; padding:22px; border:1px solid rgba(255,255,255,0.07); position:relative; overflow:hidden; min-width:0; }
  .ai-card-glow { position:absolute; width:200px; height:200px; border-radius:50%; filter:blur(60px); pointer-events:none; opacity:0.15; }
  .ai-tag { display:flex; align-items:center; gap:6px; margin-bottom:12px; }
  .ai-dot { width:6px; height:6px; border-radius:50%; animation:pulse 2s ease-in-out infinite; flex-shrink:0; }
  .ai-tag-text { font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; }
  .ai-card-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--white); margin-bottom:10px; }
  .ai-card-body { font-size:0.85rem; color:rgba(255,255,255,0.6); line-height:1.65; }
  .ai-card-body strong { color:rgba(255,255,255,0.9); font-weight:700; }
  .ai-card-footer { margin-top:14px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .ai-refresh-btn { background:rgba(255,255,255,0.07); border:none; border-radius:8px; padding:6px 12px; font-size:0.75rem; font-weight:600; color:rgba(255,255,255,0.5); cursor:pointer; transition:all 0.18s; font-family:'Plus Jakarta Sans',sans-serif; flex-shrink:0; display:flex; align-items:center; gap:5px; }
  .ai-refresh-btn:hover { background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.8); }
  .ai-loading { display:flex; gap:6px; align-items:center; }
  .ai-loading-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.25); animation:pulse 1.2s ease-in-out infinite; }
  .ai-loading-dot:nth-child(2){ animation-delay:0.2s; }
  .ai-loading-dot:nth-child(3){ animation-delay:0.4s; }

  .nl-card { background:var(--white); border-radius:20px; padding:22px; border:1.5px solid var(--border); animation:fadeUp 0.4s ease 0.2s both; }
  .nl-header { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .nl-icon  { width:36px; height:36px; border-radius:10px; background:var(--amber-pale); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .nl-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; }
  .nl-sub   { font-size:0.78rem; color:var(--ink-subtle); margin-top:1px; }
  .nl-input-wrap { display:flex; gap:10px; }
  @media(max-width:500px){ .nl-input-wrap{flex-direction:column} }
  .nl-input { flex:1; min-width:0; padding:12px 14px; border:1.5px solid var(--border); border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500; color:var(--ink); background:var(--bg); outline:none; transition:all 0.2s; }
  .nl-input:focus { border-color:var(--amber); box-shadow:0 0 0 3px rgba(212,160,23,0.1); background:var(--white); }
  .nl-input::placeholder { color:rgba(10,10,10,0.3); font-weight:400; }
  .nl-btn { padding:12px 18px; border-radius:12px; border:none; background:var(--amber); color:var(--ink); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:800; cursor:pointer; transition:all 0.2s; white-space:nowrap; display:flex; align-items:center; gap:6px; }
  @media(max-width:500px){ .nl-btn{width:100%;justify-content:center} }
  .nl-btn:hover { background:var(--amber-light); transform:translateY(-1px); }
  .nl-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .nl-parsed { margin-top:12px; background:var(--green-pale); border-radius:12px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; border:1px solid rgba(27,67,50,0.12); animation:scaleIn 0.3s ease; flex-wrap:wrap; }
  .nl-parsed-text { font-size:0.85rem; color:var(--green-deep); font-weight:600; }
  .nl-parsed-text span { color:var(--green-mid); font-weight:700; }
  .nl-confirm-btn { background:var(--green-light); color:var(--white); border:none; border-radius:8px; padding:7px 14px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; white-space:nowrap; transition:all 0.2s; }
  .nl-confirm-btn:hover { background:var(--green-mid); }

  .quick-card { background:var(--white); border-radius:20px; padding:22px; border:1.5px solid var(--border); animation:fadeUp 0.4s ease 0.22s both; }
  .quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px; }
  @media(max-width:500px){ .quick-grid{grid-template-columns:1fr} }
  .field-label { font-size:0.78rem; font-weight:600; color:var(--ink-muted); display:block; margin-bottom:6px; }
  .field-input { width:100%; padding:11px 14px; border:1.5px solid var(--border); border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500; color:var(--ink); background:var(--cream); outline:none; transition:all 0.2s; }
  .field-input:focus { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); background:var(--white); }
  .field-input::placeholder { color:rgba(10,10,10,0.28); font-weight:400; }
  .amount-wrap { position:relative; }
  .amount-sym { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-weight:700; color:var(--ink-muted); font-size:0.95rem; pointer-events:none; }
  .amount-wrap .field-input { padding-left:26px; }
  .cat-grid { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
  .cat-pill { padding:5px 10px; border-radius:100px; border:1.5px solid var(--border); font-size:0.76rem; font-weight:600; cursor:pointer; transition:all 0.18s; color:var(--ink-muted); background:var(--white); display:flex; align-items:center; gap:4px; }
  .cat-pill:hover { border-color:rgba(64,145,108,0.4); color:var(--green-mid); }
  .cat-pill.active { background:var(--green-pale); border-color:var(--green-light); color:var(--green-deep); }
  .quick-footer { display:flex; gap:10px; margin-top:14px; }
  .quick-btn-ghost { flex:0; padding:10px 18px; border:1.5px solid var(--border); border-radius:12px; background:transparent; color:var(--ink-muted); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.88rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .quick-btn-ghost:hover { border-color:rgba(10,10,10,0.2); color:var(--ink); }
  .quick-btn-primary { flex:1; padding:11px; border-radius:12px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:700; cursor:pointer; transition:all 0.22s; box-shadow:0 4px 16px rgba(27,67,50,0.25); display:flex; align-items:center; justify-content:center; gap:6px; }
  .quick-btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(27,67,50,0.35); }
  .quick-btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.35); border-top-color:var(--white); border-radius:50%; animation:spin 0.7s linear infinite; }

  .recent-card { background:var(--white); border-radius:20px; padding:22px; border:1.5px solid var(--border); animation:fadeUp 0.4s ease 0.25s both; min-width:0; }
  .recent-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
  .see-all-btn { font-size:0.82rem; font-weight:700; color:var(--green-mid); background:none; border:none; cursor:pointer; flex-shrink:0; }
  .see-all-btn:hover { color:var(--green-deep); }
  .expense-list { display:flex; flex-direction:column; gap:2px; }
  .expense-row { display:flex; align-items:center; gap:12px; padding:11px 8px; border-radius:12px; transition:background 0.18s; }
  .expense-row:hover { background:var(--bg); }
  .expense-cat-icon { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
  .expense-info { flex:1; min-width:0; }
  .expense-desc { font-size:0.88rem; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .expense-meta { font-size:0.72rem; color:var(--ink-subtle); margin-top:2px; }
  .expense-amount { font-family:'Playfair Display',serif; font-size:0.95rem; font-weight:800; color:var(--ink); flex-shrink:0; white-space:nowrap; }
  .expense-amount.large { color:var(--red); }
  .expense-row-actions { display:none; gap:5px; flex-shrink:0; }
  .expense-row:hover .expense-row-actions { display:flex; }
  .exp-action-btn { width:26px; height:26px; border-radius:7px; border:none; background:var(--cream-dark); color:var(--ink-subtle); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
  .exp-action-btn:hover { background:var(--border); color:var(--ink); }
  .exp-action-btn.del:hover { background:var(--red-pale); color:var(--red); }
  .empty-state { text-align:center; padding:36px 20px; color:var(--ink-subtle); }
  .empty-icon  { font-size:2.2rem; margin-bottom:10px; }
  .empty-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--ink); margin-bottom:6px; }
  .empty-sub   { font-size:0.85rem; line-height:1.6; }

  .toast { position:fixed; bottom:80px; left:50%; transform:translateX(-50%); z-index:200; background:var(--ink); color:var(--white); padding:12px 20px; border-radius:14px; font-size:0.875rem; font-weight:600; display:flex; align-items:center; gap:10px; box-shadow:0 8px 32px rgba(0,0,0,0.25); animation:scaleIn 0.3s ease; white-space:nowrap; }
`;

const CATEGORIES = [
  { id: "food", icon: "🍔", label: "Food", bg: "#FFF3E0" },
  { id: "transport", icon: "🚗", label: "Transport", bg: "#E8F5E9" },
  { id: "bills", icon: "🏠", label: "Bills", bg: "#FCE4EC" },
  { id: "shop", icon: "🛍️", label: "Shopping", bg: "#F3E5F5" },
  { id: "health", icon: "💊", label: "Health", bg: "#E0F7FA" },
  { id: "data", icon: "📱", label: "Airtime", bg: "#E3F2FD" },
  { id: "fun", icon: "🎬", label: "Entertain.", bg: "#F9FBE7" },
  { id: "other", icon: "💼", label: "Other", bg: "#F5F5F5" },
];

const NL_EXAMPLES = [
  "spent 4500 on lunch",
  "bolt ride 2800",
  "netflix 4800 entertainment",
  "bought groceries 12000",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG");
}

function defaultPaceStatus(spent, expected) {
  if (spent <= expected)
    return {
      key: "on_track",
      label: "On Track",
      color: "#52B788",
      bg: "rgba(82,183,136,0.12)",
    };
  if (spent <= expected * 1.1)
    return {
      key: "slightly_over",
      label: "Slightly Over",
      color: "#D4A017",
      bg: "rgba(212,160,23,0.12)",
    };
  return {
    key: "over_budget",
    label: "Over Budget",
    color: "#E53935",
    bg: "rgba(229,57,53,0.12)",
  };
}

function formatExpenseForDashboard(expense) {
  const categoryId = expense.category || expense.cat || "other";
  const category =
    CATEGORIES.find((c) => c.id === categoryId) ||
    CATEGORIES.find(
      (c) => c.label.toLowerCase() === String(categoryId).toLowerCase(),
    ) ||
    CATEGORIES[7];

  const rawDate =
    expense.date || expense.expense_date || expense.created_at || null;
  let dateLabel = "Recently";
  if (rawDate) {
    const d = new Date(rawDate);
    const today = new Date();
    const yest = new Date();
    yest.setDate(today.getDate() - 1);
    if (!Number.isNaN(d.getTime())) {
      if (d.toDateString() === today.toDateString()) dateLabel = "Today";
      else if (d.toDateString() === yest.toDateString())
        dateLabel = "Yesterday";
      else
        dateLabel = d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });
    }
  }
  return {
    id: expense.id,
    desc: expense.description || expense.desc || expense.note || "Expense",
    cat: category.icon,
    catName: category.label,
    amount: Number(expense.amount || 0),
    bg: category.bg,
    date: dateLabel,
  };
}

// ── Summary cards — uses sym prop ─────────────────────────────────────────────
function SummaryCards({ budget, spent, remaining, safe, daysLeft, sym }) {
  const pct =
    budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  return (
    <div className="summary-grid">
      <div className="sum-card hero-card">
        <div
          className="sum-card-bg"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        <div className="sum-icon white">
          <Wallet size={16} color="rgba(255,255,255,0.9)" />
        </div>
        <div className="sum-label">Total Budget</div>
        <div className="sum-value">
          {sym}
          {fmt(budget)}
        </div>
        <div className="sum-change neutral">This month · {pct}% used</div>
      </div>
      <div className="sum-card">
        <div className="sum-icon red">
          <ArrowUpRight size={16} color="#E53935" />
        </div>
        <div className="sum-label">Total Spent</div>
        <div className="sum-value red">
          {sym}
          {fmt(spent)}
        </div>
        <div className="sum-change neutral">Live from your records</div>
      </div>
      <div className="sum-card">
        <div className="sum-icon green">
          <PiggyBank size={16} color="#2D6A4F" />
        </div>
        <div className="sum-label">Remaining</div>
        <div className="sum-value green">
          {sym}
          {fmt(remaining)}
        </div>
        <div className="sum-change up">
          ✓ {budget > 0 ? Math.round((remaining / budget) * 100) : 0}% left
        </div>
      </div>
      <div className="sum-card">
        <div className="sum-icon amber">
          <CalendarDays size={16} color="#D4A017" />
        </div>
        <div className="sum-label">Safe-to-Spend</div>
        <div className="sum-value amber">
          {sym}
          {fmt(safe)}
        </div>
        <div className="sum-change neutral">Per day · {daysLeft} days</div>
      </div>
    </div>
  );
}

// ── Pace card — uses sym prop ─────────────────────────────────────────────────
function PaceCard({
  budget,
  spent,
  expected,
  status,
  currentDay,
  totalDays,
  sym,
}) {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRendered(true), 200);
    return () => clearTimeout(t);
  }, []);

  const spentPct =
    budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const expectedPct =
    budget > 0 ? Math.min(100, Math.round((expected / budget) * 100)) : 0;
  const barColor =
    status.key === "over_budget"
      ? "#FF8A80"
      : status.key === "slightly_over"
        ? "#F0C040"
        : "#52B788";

  return (
    <div className="pace-card">
      <div className="card-header">
        <div>
          <div className="card-title">Budget Pace</div>
          <div className="card-sub">
            Day {currentDay} of {totalDays}
          </div>
        </div>
        <span
          className="status-pill"
          style={{ background: status.bg, color: status.color }}
        >
          ● {status.label}
        </span>
      </div>
      <div className="pace-meta">
        <div className="pace-meta-item">
          <div className="pace-meta-label">Spent</div>
          <div className="pace-meta-value red">
            {sym}
            {fmt(spent)}
          </div>
        </div>
        <div className="pace-meta-item">
          <div className="pace-meta-label">Expected</div>
          <div className="pace-meta-value amber">
            {sym}
            {fmt(expected)}
          </div>
        </div>
        <div className="pace-meta-item">
          <div className="pace-meta-label">Diff.</div>
          <div
            className={`pace-meta-value ${spent <= expected ? "green" : "red"}`}
          >
            {spent <= expected ? "-" : "+"}
            {sym}
            {fmt(Math.abs(spent - expected))}
          </div>
        </div>
      </div>
      <div className="pace-bar-wrap">
        <div className="pace-bar-labels">
          <span>{sym}0</span>
          <span>
            {sym}
            {fmt(budget)}
          </span>
        </div>
        <div className="pace-bar-track">
          <div
            className="pace-bar-expected"
            style={{ width: rendered ? `${expectedPct}%` : "0%" }}
          />
          <div
            className="pace-bar-actual"
            style={{
              width: rendered ? `${spentPct}%` : "0%",
              background: `linear-gradient(90deg,${barColor}cc,${barColor})`,
            }}
          />
          <div
            className="pace-tick"
            style={{ left: rendered ? `${expectedPct}%` : "0%" }}
          >
            <div className="pace-tick-label">Expected</div>
          </div>
        </div>
      </div>
      <p className="pace-bar-caption">
        You've spent{" "}
        <strong>
          {sym}
          {fmt(spent)}
        </strong>{" "}
        against an expected{" "}
        <strong>
          {sym}
          {fmt(expected)}
        </strong>{" "}
        for day {currentDay}.{" "}
        {spent <= expected
          ? "You're ahead of pace — great discipline."
          : "Pull back slightly to avoid end-of-month pressure."}
      </p>
    </div>
  );
}

// ── Safe card — uses sym prop ─────────────────────────────────────────────────
function SafeCard({ amount, daysLeft, totalDays, currentDay, sym }) {
  const pct = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const dash = circumference - (pct / 100) * circumference;

  return (
    <div className="safe-card">
      <div className="safe-card-bg" />
      <div className="safe-card-bg2" />
      <div>
        <div className="safe-label">Safe-to-Spend Today</div>
        <div className="safe-amount">
          {sym}
          {fmt(amount)}
        </div>
        <div className="safe-period">daily allowance</div>
      </div>
      <div className="safe-footer">
        <div className="safe-days">
          <strong>{daysLeft}</strong> days remaining
        </div>
        <div className="safe-ring">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={dash}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="safe-ring-pct">{pct}%</div>
        </div>
      </div>
    </div>
  );
}

function AIPanel({ type, insight, onRefresh, loading }) {
  const isAnalyst = type === "analyst";
  const glowColor = isAnalyst ? "rgba(212,160,23,0.6)" : "rgba(64,145,108,0.6)";
  const dotColor = isAnalyst ? "var(--amber)" : "var(--green-light)";
  const tagColor = isAnalyst ? "var(--amber)" : "var(--green-light)";
  return (
    <div className="ai-card">
      <div
        className="ai-card-glow"
        style={{
          background: `radial-gradient(circle,${glowColor} 0%,transparent 70%)`,
          top: -60,
          right: -60,
        }}
      />
      <div className="ai-tag">
        <div className="ai-dot" style={{ background: dotColor }} />
        <span className="ai-tag-text" style={{ color: tagColor }}>
          {isAnalyst ? "🔍 AI Spending Analyst" : "🎯 AI Savings Coach"}
        </span>
      </div>
      <div className="ai-card-title">
        {isAnalyst ? "This month's breakdown" : "Your top savings tip"}
      </div>
      <div className="ai-card-body">
        {loading ? (
          <div className="ai-loading">
            <div className="ai-loading-dot" />
            <div className="ai-loading-dot" />
            <div className="ai-loading-dot" />
          </div>
        ) : (
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(insight, {
                ALLOWED_TAGS: ["strong", "em", "br"],
                ALLOWED_ATTR: [],
              }),
            }}
          />
        )}
      </div>
      <div className="ai-card-footer">
        <span
          style={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.25)",
            fontWeight: 600,
          }}
        >
          Powered by Claude AI
        </span>
        <button className="ai-refresh-btn" onClick={onRefresh}>
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
    </div>
  );
}

// ── Natural language entry — uses sym prop ────────────────────────────────────
function NLEntry({ onAdd, sym }) {
  const [val, setVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [placeholder, setPlaceholder] = useState(NL_EXAMPLES[0]);
  const idxRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % NL_EXAMPLES.length;
      setPlaceholder(NL_EXAMPLES[idxRef.current]);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const parse = () => {
    if (!val.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const amount = val.match(/\d[\d,]*/)?.[0]?.replace(/,/g, "") ?? "0";
      const cats = {
        lunch: "food",
        dinner: "food",
        groceries: "food",
        bolt: "transport",
        uber: "transport",
        netflix: "fun",
        entertainment: "fun",
        data: "data",
        airtime: "data",
      };
      const cat =
        Object.entries(cats).find(([k]) =>
          val.toLowerCase().includes(k),
        )?.[1] ?? "other";
      const desc = val
        .replace(/\d[\d,]*/g, "")
        .replace(/spent|on|for|at/gi, "")
        .trim();
      setParsed({ amount: parseInt(amount, 10), cat, desc: desc || val });
      setLoading(false);
    }, 900);
  };

  const confirm = async () => {
    await onAdd?.(parsed);
    setParsed(null);
    setVal("");
  };

  return (
    <div className="nl-card">
      <div className="nl-header">
        <div className="nl-icon">
          <Sparkles size={18} color="#D4A017" />
        </div>
        <div>
          <div className="nl-title">Natural Language Entry</div>
          <div className="nl-sub">
            Just type what you spent — AI parses it instantly
          </div>
        </div>
      </div>
      <div className="nl-input-wrap">
        <input
          className="nl-input"
          type="text"
          placeholder={placeholder}
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setParsed(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && parse()}
        />
        <button
          className="nl-btn"
          onClick={parse}
          disabled={!val.trim() || loading}
        >
          {loading ? (
            <div
              className="spinner"
              style={{
                borderTopColor: "var(--ink)",
                borderColor: "rgba(10,10,10,0.2)",
              }}
            />
          ) : (
            <>
              <Zap size={15} /> Parse
            </>
          )}
        </button>
      </div>
      {parsed && (
        <div className="nl-parsed">
          <div className="nl-parsed-text">
            Log{" "}
            <span>
              {sym}
              {fmt(parsed.amount)}
            </span>{" "}
            for <span>{parsed.desc}</span> under{" "}
            <span>
              {CATEGORIES.find((c) => c.id === parsed.cat)?.label || "Other"}
            </span>
            ?
          </div>
          <button className="nl-confirm-btn" onClick={confirm}>
            Log it
          </button>
        </div>
      )}
    </div>
  );
}

// ── Quick add — uses sym prop ─────────────────────────────────────────────────
function QuickAdd({ onAdd, sym }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("food");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setDesc("");
    setAmount("");
    setCat("food");
    setDate("");
  };
  const submit = async () => {
    if (!desc.trim() || !amount) return;
    setLoading(true);
    try {
      await onAdd?.({
        desc,
        amount: Number(amount),
        cat,
        date: date || new Date().toISOString(),
      });
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-card">
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <div className="card-title">Quick Add Expense</div>
          <div className="card-sub">Manual entry with full control</div>
        </div>
      </div>
      <div className="quick-grid">
        <div style={{ gridColumn: "1/-1" }}>
          <label className="field-label">Description</label>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Chicken Republic lunch"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Amount</label>
          <div className="amount-wrap">
            {/* ✅ Dynamic currency symbol */}
            <span className="amount-sym">{sym}</span>
            <input
              className="field-input"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
        </div>
        <div>
          <label className="field-label">Date</label>
          <input
            className="field-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label className="field-label">Category</label>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                className={`cat-pill${cat === c.id ? " active" : ""}`}
                onClick={() => setCat(c.id)}
              >
                {c.icon} {c.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="quick-footer">
        <button className="quick-btn-ghost" onClick={reset}>
          Clear
        </button>
        <button
          className="quick-btn-primary"
          onClick={submit}
          disabled={!desc.trim() || !amount || loading}
        >
          {loading ? (
            <div className="spinner" />
          ) : (
            <>
              <Plus size={16} /> Log Expense
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Recent expenses — uses sym prop ───────────────────────────────────────────
function RecentExpenses({ expenses, onDelete, sym }) {
  if (!expenses.length) {
    return (
      <div className="recent-card">
        <div className="recent-header">
          <div>
            <div className="card-title">Recent Expenses</div>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <div className="empty-title">No expenses yet</div>
          <p className="empty-sub">
            Log your first expense above to start tracking.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="recent-card">
      <div className="recent-header">
        <div>
          <div className="card-title">Recent Expenses</div>
          <div className="card-sub">Last {expenses.length} transactions</div>
        </div>
      </div>
      <div className="expense-list">
        {expenses.map((e) => (
          <div key={e.id} className="expense-row">
            <div className="expense-cat-icon" style={{ background: e.bg }}>
              {e.cat}
            </div>
            <div className="expense-info">
              <div className="expense-desc">{e.desc}</div>
              <div className="expense-meta">
                {e.catName} · {e.date}
              </div>
            </div>
            <div className="expense-row-actions">
              <button className="exp-action-btn">
                <Pencil size={12} />
              </button>
              <button
                className="exp-action-btn del"
                onClick={() => onDelete?.(e.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
            {/* ✅ Dynamic currency symbol */}
            <div
              className={`expense-amount${e.amount >= 10000 ? " large" : ""}`}
            >
              −{sym}
              {fmt(e.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast">
      <span style={{ color: "#52B788" }}>✓</span> {msg}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

function WhatsAppCard({ profile, onConnect }) {
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const whatsappNumber = profile?.whatsapp_number;
  const isActive = profile?.whatsapp_active;

  // Already connected and active
  if (whatsappNumber && isActive) return null;

  const handleConnect = async () => {
    if (!phone || phone.trim().length < 10) return;
    setSaving(true);
    try {
      await onConnect(phone.trim());
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Number saved but trial not started yet
  if (whatsappNumber && !isActive) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg,#1B4332,#2D6A4F)",
          borderRadius: 20,
          padding: "20px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: "2rem", flexShrink: 0 }}>💬</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "1rem",
              fontWeight: 800,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            WhatsApp ready to activate
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.5,
            }}
          >
            Log your first expense to activate your agent and 7-day trial.
          </div>
        </div>
        <div
          style={{
            background: "var(--amber)",
            color: "var(--ink)",
            fontSize: "0.8rem",
            fontWeight: 800,
            padding: "8px 16px",
            borderRadius: 100,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onClick={() =>
            document
              .querySelector('.nl-input, .modal-input, [placeholder*="spent"]')
              ?.focus()
          }
        >
          Log first expense →
        </div>
      </div>
    );
  }

  // Not connected yet
  if (saved) {
    return (
      <div
        style={{
          background: "var(--green-pale)",
          border: "1.5px solid rgba(27,67,50,0.15)",
          borderRadius: 20,
          padding: "20px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ fontSize: "1.5rem" }}>✅</div>
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "#1B4332",
            }}
          >
            Number saved!
          </div>
          <div style={{ fontSize: "0.8rem", color: "#2D6A4F", marginTop: 2 }}>
            Log your first expense to activate your WhatsApp agent.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,rgba(27,67,50,0.05),rgba(64,145,108,0.08))",
        border: "1.5px solid rgba(27,67,50,0.12)",
        borderRadius: 20,
        padding: "20px 24px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>💬</div>
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "1rem",
              fontWeight: 800,
              color: "#0A0A0A",
              marginBottom: 4,
            }}
          >
            Get budget alerts on WhatsApp
          </div>
          <div
            style={{ fontSize: "0.82rem", color: "#6B6B6B", lineHeight: 1.55 }}
          >
            Send your bank statement PDF, check your balance, and get instant
            alerts — right in WhatsApp.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1.5px solid rgba(10,10,10,0.12)",
            borderRadius: 12,
            background: "#fff",
            overflow: "hidden",
            flex: 1,
            minWidth: 200,
          }}
        >
          <span
            style={{
              padding: "0 12px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#3A3A3A",
              borderRight: "1px solid rgba(10,10,10,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            🇳🇬 +234
          </span>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="812 345 6789"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
            style={{
              flex: 1,
              padding: "12px 14px",
              border: "none",
              outline: "none",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: 15,
              background: "transparent",
            }}
          />
        </div>
        <button
          onClick={handleConnect}
          disabled={saving || phone.length < 10}
          style={{
            padding: "12px 20px",
            background: "#1B4332",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: phone.length >= 10 ? "pointer" : "not-allowed",
            opacity: phone.length >= 10 ? 1 : 0.5,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {saving ? "Saving..." : "Connect →"}
        </button>
      </div>

      <div
        style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}
      >
        {["📄 PDF import", "⚡ Instant alerts", "📊 Daily summary"].map(
          (f, i) => (
            <div
              key={i}
              style={{ fontSize: "0.72rem", fontWeight: 600, color: "#40916C" }}
            >
              {f}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { displayName, profile } = useAuth();
  const {
    activeBudget,
    expenses,
    recentExpenses,
    totalBudget,
    totalSpent,
    remaining,
    safeToSpend,
    expectedSpend,
    paceStatus,
    totalDays,
    currentDay,
    daysLeft,
    addExpense,
    deleteExpense,
    sym, // ✅ currency symbol from BudgetProvider
  } = useBudget();

  // Fallback symbol in case BudgetProvider hasn't loaded yet
  const currSym = sym || "₦";

  const [analystInsight, setAnalystInsight] = useState(
    "Your AI spending analysis will appear here once you've logged some expenses.",
  );
  const [coachTip, setCoachTip] = useState(
    "Log your first expense to activate your AI savings coach.",
  );
  const [aiLoading, setAiLoading] = useState(false);
  const { getSpendingInsight, getSavingsTip } = useAI();
  const [toast, setToast] = useState(null);

  const normalizedExpenses = Array.isArray(recentExpenses)
    ? recentExpenses.map(formatExpenseForDashboard)
    : [];

  const todayDate = new Date();
  const today = todayDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleWhatsAppConnect = async (phone) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const cached = JSON.parse(localStorage.getItem("truvllo_auth") || "{}");
    const userId = session?.user?.id || cached?.user?.id;
    if (!userId) return;
    await supabase
      .from("profiles")
      .update({ whatsapp_number: phone })
      .eq("id", userId);
    // Refresh profile in AuthProvider cache
    const updated = JSON.parse(localStorage.getItem("truvllo_profile") || "{}");
    updated.whatsapp_number = phone;
    localStorage.setItem("truvllo_profile", JSON.stringify(updated));
  };

  const refreshAI = useCallback(async () => {
    if (!expenses?.length || !activeBudget) return;
    setAiLoading(true);
    try {
      const [insightRes, tipRes] = await Promise.all([
        getSpendingInsight(expenses, activeBudget, currency),
        getSavingsTip(expenses, activeBudget, currency),
      ]);
      if (insightRes?.insight) setAnalystInsight(insightRes.insight);
      if (tipRes?.tip) setCoachTip(tipRes.tip);
    } catch (err) {
      console.error("[Dashboard] AI refresh error:", err);
    } finally {
      setAiLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBudget, expenses, getSpendingInsight, getSavingsTip]);

  // Auto-load AI insights when expenses are available
  useEffect(() => {
    if (expenses?.length > 0 && activeBudget) {
      refreshAI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBudget?.id, expenses?.length]);

  const handleAddExpense = async (data) => {
    const amount = Number(data.amount ?? 0);
    const cat =
      CATEGORIES.find((c) => c.id === (data.cat ?? data.category)) ||
      CATEGORIES[7];

    if (!amount || amount <= 0) {
      setToast("Enter a valid amount");
      return;
    }

    try {
      await addExpense({
        description: data.desc ?? data.description ?? "Expense",
        amount,
        category: cat.id,
        date: data.date || new Date().toISOString().split("T")[0],
        notes: data.note || "",
      });
      setToast(`${currSym}${fmt(amount)} logged under ${cat.label}`);
    } catch (error) {
      console.error("Add expense error:", error);
      setToast(error?.message || "Could not save expense");
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      setToast("Expense deleted");
    } catch (error) {
      setToast(error?.message || "Could not delete expense");
    }
  };

  return (
    <>
      <style>{FONTS + styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div className="dash">
        <div className="greeting">
          <div className="greeting-time">{getGreeting()}</div>
          <div className="greeting-name">
            Welcome back, <em>{displayName || "there"}</em>
          </div>
          <div className="greeting-sub">
            Here's where your money stands — {today}
          </div>
        </div>

        {/* ✅ sym passed to all components */}
        <SummaryCards
          budget={Number(
            totalBudget ||
              activeBudget?.total_amount ||
              activeBudget?.amount ||
              0,
          )}
          spent={Number(totalSpent || 0)}
          remaining={Number(remaining || 0)}
          safe={Number(safeToSpend || 0)}
          daysLeft={Number(daysLeft || 0)}
          sym={currSym}
        />

        <div className="two-col">
          <PaceCard
            budget={Number(
              totalBudget ||
                activeBudget?.total_amount ||
                activeBudget?.amount ||
                0,
            )}
            spent={Number(totalSpent || 0)}
            expected={Number(expectedSpend || 0)}
            status={paceStatus || defaultPaceStatus(0, 0)}
            currentDay={Number(currentDay || todayDate.getDate())}
            totalDays={Number(
              totalDays ||
                new Date(
                  todayDate.getFullYear(),
                  todayDate.getMonth() + 1,
                  0,
                ).getDate(),
            )}
            sym={currSym}
          />
          <SafeCard
            amount={Number(safeToSpend || 0)}
            daysLeft={Number(daysLeft || 0)}
            totalDays={Number(
              totalDays ||
                new Date(
                  todayDate.getFullYear(),
                  todayDate.getMonth() + 1,
                  0,
                ).getDate(),
            )}
            currentDay={Number(currentDay || todayDate.getDate())}
            sym={currSym}
          />
        </div>

        <div className="ai-grid">
          <AIPanel
            type="analyst"
            insight={analystInsight}
            loading={aiLoading}
            onRefresh={refreshAI}
          />
          <AIPanel
            type="coach"
            insight={coachTip}
            loading={aiLoading}
            onRefresh={refreshAI}
          />
        </div>

        <WhatsAppCard profile={profile} onConnect={handleWhatsAppConnect} />
        <NLEntry onAdd={handleAddExpense} sym={currSym} />

        <div className="two-col">
          <RecentExpenses
            expenses={normalizedExpenses}
            onDelete={handleDeleteExpense}
            sym={currSym}
          />
          <QuickAdd onAdd={handleAddExpense} sym={currSym} />
        </div>
      </div>
    </>
  );
}
