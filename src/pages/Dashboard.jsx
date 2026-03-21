import { useState, useEffect, useRef } from "react";
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

  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  @keyframes barGrow { from { width:0; } to { } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50%{ opacity:0.4; } }

  .dash {
    display:flex; flex-direction:column; gap:24px;
    max-width:1200px; width:100%; overflow-x:hidden;
    animation:fadeIn 0.35s ease;
  }

  /* GREETING */
  .greeting { animation:fadeUp 0.4s ease; min-width:0; }
  .greeting-time { font-size:0.78rem; color:var(--ink-subtle); font-weight:600; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
  .greeting-name { font-family:'Playfair Display',serif; font-size:1.9rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .greeting-name em { font-style:italic; color:var(--green-mid); }
  .greeting-sub { font-size:0.9rem; color:var(--ink-subtle); margin-top:4px; }
  @media(max-width:480px){
    .greeting-name { font-size:1.5rem; }
    .greeting-sub  { font-size:0.78rem; }
  }

  /* SUMMARY GRID */
  .summary-grid {
    display:grid; grid-template-columns:repeat(4,1fr); gap:16px;
    animation:fadeUp 0.4s ease 0.05s both;
  }
  @media(max-width:900px){ .summary-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:480px){ .summary-grid{ grid-template-columns:repeat(2,1fr); gap:10px; } }

  .sum-card {
    background:var(--white); border-radius:20px; padding:20px 16px;
    border:1.5px solid var(--border); transition:all 0.22s;
    position:relative; overflow:hidden; min-width:0;
  }
  .sum-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.08); }
  .sum-card.hero-card {
    background:linear-gradient(140deg, var(--green-deep) 0%, var(--green-light) 100%);
    border-color:transparent; box-shadow:0 8px 32px rgba(27,67,50,0.28);
  }
  .sum-card-bg { position:absolute; width:120px; height:120px; border-radius:50%; top:-30px; right:-30px; opacity:0.08; pointer-events:none; }
  .sum-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; flex-shrink:0; }
  .sum-icon.green { background:var(--green-pale); }
  .sum-icon.amber { background:var(--amber-pale); }
  .sum-icon.red   { background:var(--red-pale); }
  .sum-icon.white { background:rgba(255,255,255,0.15); }
  .sum-label { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-subtle); margin-bottom:5px; }
  .hero-card .sum-label { color:rgba(255,255,255,0.6); }
  .sum-value { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:900; color:var(--ink); line-height:1; word-break:break-all; }
  @media(max-width:480px){ .sum-value{ font-size:1.1rem; } }
  @media(max-width:360px){ .sum-value{ font-size:0.95rem; } }
  .hero-card .sum-value { color:var(--white); }
  .sum-value.green { color:var(--green-mid); }
  .sum-value.amber { color:var(--amber); }
  .sum-value.red   { color:var(--red); }
  .sum-change { display:flex; align-items:center; gap:4px; margin-top:6px; font-size:0.68rem; font-weight:600; flex-wrap:wrap; line-height:1.4; }
  .sum-change.up      { color:var(--green-light); }
  .sum-change.down    { color:var(--red); }
  .sum-change.neutral { color:var(--ink-subtle); }
  .hero-card .sum-change { color:rgba(255,255,255,0.65); }

  /* TWO COL */
  .two-col { display:grid; grid-template-columns:1fr 360px; gap:20px; animation:fadeUp 0.4s ease 0.1s both; }
  @media(max-width:1100px){ .two-col{ grid-template-columns:1fr; } }

  /* PACE CARD */
  .pace-card { background:var(--white); border-radius:20px; padding:24px; border:1.5px solid var(--border); min-width:0; }
  @media(max-width:480px){ .pace-card{ padding:18px 14px; } }
  .card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; gap:8px; }
  .card-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--ink); }
  .card-sub { font-size:0.78rem; color:var(--ink-subtle); margin-top:2px; }
  .status-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:100px; font-size:0.7rem; font-weight:800; white-space:nowrap; flex-shrink:0; }
  .pace-meta { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:18px; }
  .pace-meta-item { background:var(--bg); border-radius:10px; padding:10px 10px; min-width:0; }
  .pace-meta-label { font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--ink-subtle); margin-bottom:4px; }
  .pace-meta-value { font-family:'Playfair Display',serif; font-size:0.95rem; font-weight:800; color:var(--ink); word-break:break-all; }
  .pace-meta-value.green { color:var(--green-mid); }
  .pace-meta-value.amber { color:var(--amber); }
  .pace-bar-wrap { margin-bottom:10px; }
  .pace-bar-labels { display:flex; justify-content:space-between; font-size:0.72rem; color:var(--ink-subtle); font-weight:600; margin-bottom:8px; }
  .pace-bar-track { background:var(--cream-dark); border-radius:100px; height:10px; overflow:hidden; position:relative; }
  .pace-bar-expected { position:absolute; top:0; bottom:0; left:0; background:rgba(10,10,10,0.07); border-radius:100px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1); }
  .pace-bar-actual { height:100%; border-radius:100px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1) 0.1s; animation:barGrow 1.2s ease; }
  .pace-tick { position:absolute; top:-2px; bottom:-2px; width:2px; background:var(--ink-subtle); border-radius:1px; transform:translateX(-50%); transition:left 1.2s cubic-bezier(0.4,0,0.2,1); }
  .pace-tick-label { position:absolute; top:-20px; transform:translateX(-50%); font-size:0.62rem; font-weight:700; color:var(--ink-subtle); white-space:nowrap; }
  .pace-bar-caption { font-size:0.78rem; color:var(--ink-subtle); line-height:1.5; margin-top:12px; }

  /* SAFE CARD */
  .safe-card {
    background:linear-gradient(160deg, var(--green-deep), var(--green-mid));
    border-radius:20px; padding:24px; display:flex; flex-direction:column; justify-content:space-between;
    min-height:180px; position:relative; overflow:hidden;
  }
  .safe-card-bg  { position:absolute; width:200px; height:200px; border-radius:50%; bottom:-60px; right:-60px; background:rgba(255,255,255,0.05); pointer-events:none; }
  .safe-card-bg2 { position:absolute; width:120px; height:120px; border-radius:50%; top:-40px; left:-20px; background:rgba(255,255,255,0.04); pointer-events:none; }
  .safe-label  { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:rgba(255,255,255,0.55); margin-bottom:8px; }
  .safe-amount { font-family:'Playfair Display',serif; font-size:2.2rem; font-weight:900; color:var(--white); line-height:1; margin-bottom:4px; }
  @media(max-width:480px){ .safe-amount{ font-size:1.8rem; } }
  .safe-period { font-size:0.82rem; color:rgba(255,255,255,0.5); }
  .safe-footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:16px; }
  .safe-days   { font-size:0.8rem; color:rgba(255,255,255,0.5); }
  .safe-days strong { color:rgba(255,255,255,0.85); }
  .safe-ring   { width:48px; height:48px; position:relative; flex-shrink:0; }
  .safe-ring svg { transform:rotate(-90deg); }
  .safe-ring-pct { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:800; color:rgba(255,255,255,0.7); }

  /* AI GRID */
  .ai-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; animation:fadeUp 0.4s ease 0.15s both; }
  @media(max-width:700px){ .ai-grid{ grid-template-columns:1fr; } }
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

  /* NL ENTRY */
  .nl-card { background:var(--white); border-radius:20px; padding:22px; border:1.5px solid var(--border); animation:fadeUp 0.4s ease 0.2s both; }
  .nl-header { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
  .nl-icon  { width:36px; height:36px; border-radius:10px; background:var(--amber-pale); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .nl-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; }
  .nl-sub   { font-size:0.78rem; color:var(--ink-subtle); margin-top:1px; }
  .nl-input-wrap { display:flex; gap:10px; }
  @media(max-width:500px){ .nl-input-wrap{ flex-direction:column; } }
  .nl-input { flex:1; min-width:0; padding:12px 14px; border:1.5px solid var(--border); border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500; color:var(--ink); background:var(--bg); outline:none; transition:all 0.2s; }
  .nl-input:focus { border-color:var(--amber); box-shadow:0 0 0 3px rgba(212,160,23,0.1); background:var(--white); }
  .nl-input::placeholder { color:rgba(10,10,10,0.3); font-weight:400; }
  .nl-btn { padding:12px 18px; border-radius:12px; border:none; background:var(--amber); color:var(--ink); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:800; cursor:pointer; transition:all 0.2s; white-space:nowrap; display:flex; align-items:center; gap:6px; }
  @media(max-width:500px){ .nl-btn{ width:100%; justify-content:center; } }
  .nl-btn:hover { background:var(--amber-light); transform:translateY(-1px); }
  .nl-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .nl-parsed { margin-top:12px; background:var(--green-pale); border-radius:12px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; border:1px solid rgba(27,67,50,0.12); animation:scaleIn 0.3s ease; flex-wrap:wrap; }
  .nl-parsed-text { font-size:0.85rem; color:var(--green-deep); font-weight:600; }
  .nl-parsed-text span { color:var(--green-mid); font-weight:700; }
  .nl-confirm-btn { background:var(--green-light); color:var(--white); border:none; border-radius:8px; padding:7px 14px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; white-space:nowrap; transition:all 0.2s; }
  .nl-confirm-btn:hover { background:var(--green-mid); }

  /* QUICK ADD */
  .quick-card { background:var(--white); border-radius:20px; padding:22px; border:1.5px solid var(--border); animation:fadeUp 0.4s ease 0.22s both; }
  .quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px; }
  @media(max-width:500px){ .quick-grid{ grid-template-columns:1fr; } }
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

  /* RECENT */
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

  /* TOAST */
  .toast { position:fixed; bottom:80px; left:50%; transform:translateX(-50%); z-index:200; background:var(--ink); color:var(--white); padding:12px 20px; border-radius:14px; font-size:0.875rem; font-weight:600; display:flex; align-items:center; gap:10px; box-shadow:0 8px 32px rgba(0,0,0,0.25); animation:scaleIn 0.3s ease; white-space:nowrap; }
`;

const MOCK = {
  name: "Adaeze",
  budget: 180000,
  spent: 112400,
  safeToSpend: 4507,
  totalDays: 31,
  currentDay: 16,
  daysLeft: 15,
  expectedSpend: 92900,
  paceStatus: {
    key: "on_track",
    label: "On Track",
    color: "#52B788",
    bg: "rgba(82,183,136,0.12)",
  },
  expenses: [
    {
      id: 1,
      desc: "Chicken Republic — Lunch",
      cat: "🍔",
      catName: "Food",
      amount: 4500,
      date: "Today",
      bg: "#FFF3E0",
    },
    {
      id: 2,
      desc: "Bolt — Office trip",
      cat: "🚗",
      catName: "Transport",
      amount: 2800,
      date: "Today",
      bg: "#E8F5E9",
    },
    {
      id: 3,
      desc: "Netflix subscription",
      cat: "🎬",
      catName: "Entertain.",
      amount: 4800,
      date: "Yesterday",
      bg: "#F3E5F5",
    },
    {
      id: 4,
      desc: "Chicken Republic — Dinner",
      cat: "🍔",
      catName: "Food",
      amount: 5200,
      date: "Yesterday",
      bg: "#FFF3E0",
    },
    {
      id: 5,
      desc: "MTN Data bundle",
      cat: "📱",
      catName: "Airtime",
      amount: 3000,
      date: "2 days ago",
      bg: "#E3F2FD",
    },
  ],
};

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

const AI_INSIGHTS = [
  "Your <strong>food spending is 28% above</strong> last month — mostly weekend deliveries. Cooking 3× a week could save you <strong>₦18,000</strong> this month.",
  "You've spent <strong>₦22,400 on food</strong> so far — that's your biggest category. Consider a weekly grocery budget to control costs.",
  "Transport costs are <strong>on track</strong>. Your Bolt usage dropped 15% compared to last month — great progress.",
];

const AI_TIPS = [
  "Cut your <strong>Bolt usage by half</strong> this week and redirect <strong>₦6,000</strong> to your emergency fund — you're 73% of the way to your 3-month goal.",
  "Skip one takeout order this weekend and you'll <strong>stay under pace</strong> for the rest of the month.",
  "Your Netflix and Showmax subscriptions overlap. Cancelling one saves <strong>₦4,800/month</strong>.",
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
  return n.toLocaleString("en-NG");
}

function SummaryCards({ budget, spent, remaining, safe }) {
  const pct = Math.min(100, Math.round((spent / budget) * 100));
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
        <div className="sum-value">₦{fmt(budget)}</div>
        <div className="sum-change neutral">March · {pct}% used</div>
      </div>
      <div className="sum-card">
        <div className="sum-icon red">
          <ArrowUpRight size={16} color="#E53935" />
        </div>
        <div className="sum-label">Total Spent</div>
        <div className="sum-value red">₦{fmt(spent)}</div>
        <div className="sum-change down">↑ ₦8,200 vs last week</div>
      </div>
      <div className="sum-card">
        <div className="sum-icon green">
          <PiggyBank size={16} color="#2D6A4F" />
        </div>
        <div className="sum-label">Remaining</div>
        <div className="sum-value green">₦{fmt(remaining)}</div>
        <div className="sum-change up">
          ✓ {Math.round((remaining / budget) * 100)}% left
        </div>
      </div>
      <div className="sum-card">
        <div className="sum-icon amber">
          <CalendarDays size={16} color="#D4A017" />
        </div>
        <div className="sum-label">Safe-to-Spend</div>
        <div className="sum-value amber">₦{fmt(safe)}</div>
        <div className="sum-change neutral">Per day · 15 days</div>
      </div>
    </div>
  );
}

function PaceCard({ budget, spent, expected, status, currentDay, totalDays }) {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRendered(true), 200);
    return () => clearTimeout(t);
  }, []);
  const spentPct = Math.min(100, Math.round((spent / budget) * 100));
  const expectedPct = Math.min(100, Math.round((expected / budget) * 100));
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
          <div className="pace-meta-value red">₦{fmt(spent)}</div>
        </div>
        <div className="pace-meta-item">
          <div className="pace-meta-label">Expected</div>
          <div className="pace-meta-value amber">₦{fmt(expected)}</div>
        </div>
        <div className="pace-meta-item">
          <div className="pace-meta-label">Diff.</div>
          <div
            className={`pace-meta-value ${spent <= expected ? "green" : "red"}`}
          >
            {spent <= expected ? "-" : "+"}₦{fmt(Math.abs(spent - expected))}
          </div>
        </div>
      </div>
      <div className="pace-bar-wrap">
        <div className="pace-bar-labels">
          <span>₦0</span>
          <span>₦{fmt(budget)}</span>
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
              background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
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
        You've spent <strong>₦{fmt(spent)}</strong> against an expected{" "}
        <strong>₦{fmt(expected)}</strong> for day {currentDay}.{" "}
        {spent <= expected
          ? "You're ahead of pace — great discipline."
          : "Pull back slightly to avoid end-of-month pressure."}
      </p>
    </div>
  );
}

function SafeCard({ amount, daysLeft, totalDays, currentDay }) {
  const pct = Math.round((currentDay / totalDays) * 100);
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const dash = circumference - (pct / 100) * circumference;
  return (
    <div className="safe-card">
      <div className="safe-card-bg" />
      <div className="safe-card-bg2" />
      <div>
        <div className="safe-label">Safe-to-Spend Today</div>
        <div className="safe-amount">₦{fmt(amount)}</div>
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
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
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
          <span dangerouslySetInnerHTML={{ __html: insight }} />
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

function NLEntry({ onAdd }) {
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
        lunch: "Food",
        dinner: "Food",
        bolt: "Transport",
        uber: "Transport",
        netflix: "Entertainment",
        groceries: "Food",
        data: "Airtime",
        airtime: "Airtime",
      };
      const cat =
        Object.entries(cats).find(([k]) =>
          val.toLowerCase().includes(k),
        )?.[1] ?? "Other";
      const desc = val
        .replace(/\d[\d,]*/g, "")
        .replace(/spent|on|for|at/gi, "")
        .trim();
      setParsed({
        amount: parseInt(amount),
        category: cat,
        description: desc || val,
      });
      setLoading(false);
    }, 900);
  };
  const confirm = () => {
    onAdd?.(parsed);
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
            Log <span>₦{fmt(parsed.amount)}</span> for{" "}
            <span>{parsed.description}</span> under{" "}
            <span>{parsed.category}</span>?
          </div>
          <button className="nl-confirm-btn" onClick={confirm}>
            Log it
          </button>
        </div>
      )}
    </div>
  );
}

function QuickAdd({ onAdd }) {
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
  const submit = () => {
    if (!desc.trim() || !amount) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAdd?.({ desc, amount, cat });
      reset();
    }, 700);
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
            <span className="amount-sym">₦</span>
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

function RecentExpenses({ expenses, onDelete }) {
  if (!expenses.length)
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
  return (
    <div className="recent-card">
      <div className="recent-header">
        <div>
          <div className="card-title">Recent Expenses</div>
          <div className="card-sub">Last {expenses.length} transactions</div>
        </div>
        <button className="see-all-btn">See all →</button>
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
                onClick={() => onDelete(e.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div
              className={`expense-amount${e.amount >= 10000 ? " large" : ""}`}
            >
              −₦{fmt(e.amount)}
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

export default function Dashboard() {
  const [expenses, setExpenses] = useState(MOCK.expenses);
  const [analystIdx, setAnalystIdx] = useState(0);
  const [coachIdx, setCoachIdx] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [spent, setSpent] = useState(MOCK.spent);

  const refreshAI = (type) => {
    setAiLoading(true);
    setTimeout(() => {
      if (type === "analyst")
        setAnalystIdx((i) => (i + 1) % AI_INSIGHTS.length);
      else setCoachIdx((i) => (i + 1) % AI_TIPS.length);
      setAiLoading(false);
    }, 900);
  };

  const addExpense = (data) => {
    const amount = parseInt(data.amount ?? 0);
    const cat =
      CATEGORIES.find((c) => c.id === (data.cat ?? data.category)) ??
      CATEGORIES[7];
    setExpenses((prev) => [
      {
        id: Date.now(),
        desc: data.desc ?? data.description ?? "Expense",
        cat: cat.icon,
        catName: cat.label,
        amount,
        bg: cat.bg,
        date: "Just now",
      },
      ...prev.slice(0, 4),
    ]);
    setSpent((s) => s + amount);
    setToast(`₦${fmt(amount)} logged under ${cat.label}`);
  };

  const deleteExpense = (id) => {
    const exp = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (exp) setSpent((s) => Math.max(0, s - exp.amount));
    setToast("Expense deleted");
  };

  const remaining = Math.max(0, MOCK.budget - spent);
  const safe = Math.max(0, Math.round(remaining / MOCK.daysLeft));
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <style>{FONTS + styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      <div className="dash">
        <div className="greeting">
          <div className="greeting-time">{getGreeting()}</div>
          <div className="greeting-name">
            Welcome back, <em>{MOCK.name}</em>
          </div>
          <div className="greeting-sub">
            Here's where your money stands — {today}
          </div>
        </div>
        <SummaryCards
          budget={MOCK.budget}
          spent={spent}
          remaining={remaining}
          safe={safe}
        />
        <div className="two-col">
          <PaceCard
            budget={MOCK.budget}
            spent={spent}
            expected={MOCK.expectedSpend}
            status={MOCK.paceStatus}
            currentDay={MOCK.currentDay}
            totalDays={MOCK.totalDays}
          />
          <SafeCard
            amount={safe}
            daysLeft={MOCK.daysLeft}
            totalDays={MOCK.totalDays}
            currentDay={MOCK.currentDay}
          />
        </div>
        <div className="ai-grid">
          <AIPanel
            type="analyst"
            insight={AI_INSIGHTS[analystIdx]}
            loading={aiLoading}
            onRefresh={() => refreshAI("analyst")}
          />
          <AIPanel
            type="coach"
            insight={AI_TIPS[coachIdx]}
            loading={aiLoading}
            onRefresh={() => refreshAI("coach")}
          />
        </div>
        <NLEntry onAdd={addExpense} />
        <div className="two-col">
          <RecentExpenses expenses={expenses} onDelete={deleteExpense} />
          <QuickAdd onAdd={addExpense} />
        </div>
      </div>
    </>
  );
}
