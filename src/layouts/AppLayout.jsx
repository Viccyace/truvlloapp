import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Target,
  BarChart2,
  Settings2,
  Home,
  TrendingUp,
  Menu,
  ArrowLeft,
  Bell,
  Plus,
  X,
  LogOut,
  Search,
  CheckCheck,
  ChevronRight,
  User,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { useBudget } from "../providers/BudgetProvider";
import InstallPrompt from "../components/InstallPrompt";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; font-family: 'Plus Jakarta Sans', sans-serif; background: #F5F3EE; color: #0A0A0A; overflow-x: hidden; }
  :root {
    --cream: #FAF8F3; --cream-dark: #F0EDE4; --bg: #F5F3EE;
    --green-deep: #1B4332; --green-mid: #2D6A4F; --green-light: #40916C; --green-pale: #D8F3DC;
    --ink: #0A0A0A; --ink-muted: #3A3A3A; --ink-subtle: #6B6B6B;
    --amber: #D4A017; --amber-pale: rgba(212,160,23,0.1);
    --white: #FFFFFF; --border: rgba(10,10,10,0.08);
    --sidebar-w: 260px; --topbar-h: 64px; --bottomnav-h: 72px;
    --danger: #C0392B; --danger-bg: rgba(192,57,43,0.12);
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }

  .shell-root { display:flex; min-height:100vh; overflow-x:hidden; max-width:100vw; }

  /* ── Sidebar ── */
  .sidebar { width:var(--sidebar-w); flex-shrink:0; background:var(--ink); height:100vh; position:fixed; top:0; left:0; z-index:50; display:flex; flex-direction:column; overflow:hidden; }
  .sidebar-bg { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; width:300px; height:300px; top:-80px; right:-80px; background:radial-gradient(circle,rgba(64,145,108,0.18) 0%,transparent 70%); }
  .sidebar-logo { padding:28px 24px 20px; display:flex; align-items:center; gap:8px; font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:700; color:var(--white); border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
  .sidebar-logo-dot { width:7px; height:7px; border-radius:50%; background:var(--amber); }
  .sidebar-section-label { padding:20px 24px 8px; font-size:0.65rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.22); flex-shrink:0; }
  .sidebar-nav { flex:1; overflow-y:auto; padding-bottom:16px; }
  .sidebar-nav::-webkit-scrollbar { display:none; }
  .nav-item { display:flex; align-items:center; gap:12px; padding:11px 24px; margin:2px 12px; border-radius:12px; cursor:pointer; transition:all 0.18s; color:rgba(255,255,255,0.5); font-size:0.9rem; font-weight:600; position:relative; }
  .nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.85); }
  .nav-item.active { background:rgba(64,145,108,0.18); color:var(--white); border:1px solid rgba(64,145,108,0.25); }
  .nav-item.active .nav-icon { color:var(--green-light); }
  .nav-icon { font-size:1.05rem; width:20px; text-align:center; flex-shrink:0; }
  .nav-badge { margin-left:auto; background:var(--amber); color:var(--ink); font-size:0.65rem; font-weight:800; padding:2px 7px; border-radius:100px; }
  .nav-active-bar { position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:60%; background:var(--green-light); border-radius:0 4px 4px 0; }
  .sidebar-bottom { padding:16px 12px; border-top:1px solid rgba(255,255,255,0.06); flex-shrink:0; }
  .sidebar-profile { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; cursor:pointer; transition:all 0.18s; }
  .sidebar-profile:hover { background:rgba(255,255,255,0.06); }
  .profile-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--green-mid),var(--green-light)); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem; color:var(--white); flex-shrink:0; }
  .profile-name { font-size:0.875rem; font-weight:700; color:var(--white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px; }
  .profile-chevron { margin-left:auto; color:rgba(255,255,255,0.3); font-size:0.7rem; }
  .premium-pill { display:inline-flex; align-items:center; gap:4px; background:var(--amber-pale); color:var(--amber); font-size:0.65rem; font-weight:800; padding:2px 8px; border-radius:100px; border:1px solid rgba(212,160,23,0.25); margin-top:2px; }
  .sidebar-upgrade { margin:0 12px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; }
  .upgrade-title { font-size:0.82rem; font-weight:700; color:var(--white); margin-bottom:4px; }
  .upgrade-sub { font-size:0.75rem; color:rgba(255,255,255,0.4); line-height:1.5; margin-bottom:12px; }
  .upgrade-btn { width:100%; padding:9px; border-radius:8px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.2s; }
  .upgrade-btn:hover { opacity:0.9; }
  .signout-btn { width:100%; margin-top:12px; padding:10px 12px; border-radius:10px; border:none; background:var(--danger-bg); color:#F8C9C4; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.84rem; font-weight:700; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .signout-btn:hover { background:rgba(192,57,43,0.18); color:#FFD6D1; }
  .signout-btn:disabled { opacity:0.65; cursor:not-allowed; }

  /* ── Main layout ── */
  .main-content { margin-left:var(--sidebar-w); flex:1; display:flex; flex-direction:column; min-height:100vh; overflow-x:hidden; max-width:100%; }

  /* ── Desktop topbar ── */
  .desktop-topbar { height:var(--topbar-h); background:var(--cream); border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 32px; position:sticky; top:0; z-index:40; flex-shrink:0; }
  .topbar-page-title { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:700; color:var(--ink); }
  .topbar-breadcrumb { font-size:0.78rem; color:var(--ink-subtle); margin-top:1px; }
  .topbar-right { display:flex; align-items:center; gap:10px; }

  /* Search */
  .topbar-search { display:flex; align-items:center; gap:8px; background:var(--white); border:1.5px solid var(--border); border-radius:10px; padding:0 12px; height:36px; transition:all 0.2s; }
  .topbar-search:focus-within { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); }
  .topbar-search input { border:none; background:transparent; outline:none; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.85rem; color:var(--ink); width:160px; transition:width 0.2s; }
  .topbar-search:focus-within input { width:200px; }
  .topbar-search input::placeholder { color:rgba(10,10,10,0.35); }
  .search-clear-btn { background:none; border:none; cursor:pointer; color:var(--ink-subtle); display:flex; align-items:center; padding:2px; border-radius:4px; }
  .search-clear-btn:hover { color:var(--ink); }

  /* Icon buttons */
  .topbar-icon-btn { width:36px; height:36px; border-radius:10px; border:1.5px solid var(--border); background:var(--white); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.18s; position:relative; color:var(--ink-muted); }
  .topbar-icon-btn:hover { border-color:rgba(10,10,10,0.2); background:var(--cream-dark); color:var(--ink); }
  .notif-dot { position:absolute; top:5px; right:5px; width:8px; height:8px; border-radius:50%; background:#E53935; border:2px solid var(--cream); }

  /* Avatar */
  .topbar-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--green-mid),var(--green-light)); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem; color:var(--white); cursor:pointer; transition:all 0.18s; border:2px solid transparent; flex-shrink:0; user-select:none; }
  .topbar-avatar:hover { border-color:var(--green-light); transform:scale(1.05); box-shadow:0 4px 12px rgba(27,67,50,0.25); }

  /* ── Notification Panel ── */
  .notif-panel { position:absolute; top:calc(100% + 8px); right:0; width:340px; background:var(--white); border:1.5px solid var(--border); border-radius:18px; box-shadow:0 16px 48px rgba(0,0,0,0.12); z-index:100; animation:slideDown 0.2s ease; overflow:hidden; }
  .notif-header { display:flex; align-items:center; justify-content:space-between; padding:16px 18px 12px; border-bottom:1px solid var(--border); }
  .notif-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--ink); }
  .notif-mark-all { font-size:0.75rem; font-weight:700; color:var(--green-mid); background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:4px; }
  .notif-mark-all:hover { color:var(--green-deep); }
  .notif-list { max-height:320px; overflow-y:auto; }
  .notif-list::-webkit-scrollbar { width:4px; }
  .notif-list::-webkit-scrollbar-track { background:transparent; }
  .notif-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
  .notif-item { display:flex; align-items:flex-start; gap:12px; padding:14px 18px; border-bottom:1px solid rgba(10,10,10,0.04); transition:background 0.15s; cursor:pointer; }
  .notif-item:last-child { border-bottom:none; }
  .notif-item:hover { background:var(--bg); }
  .notif-item.unread { background:rgba(64,145,108,0.04); }
  .notif-item-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1rem; }
  .notif-item-body { flex:1; min-width:0; }
  .notif-item-title { font-size:0.82rem; font-weight:700; color:var(--ink); margin-bottom:2px; }
  .notif-item-sub { font-size:0.75rem; color:var(--ink-subtle); line-height:1.45; }
  .notif-item-time { font-size:0.68rem; color:var(--ink-subtle); margin-top:4px; }
  .notif-unread-dot { width:7px; height:7px; border-radius:50%; background:var(--green-light); flex-shrink:0; margin-top:5px; }
  .notif-empty { padding:32px 18px; text-align:center; color:var(--ink-subtle); }
  .notif-empty-icon { font-size:2rem; margin-bottom:8px; }
  .notif-empty-text { font-size:0.85rem; }

  /* ── Avatar dropdown ── */
  .avatar-dropdown { position:absolute; top:calc(100% + 8px); right:0; width:220px; background:var(--white); border:1.5px solid var(--border); border-radius:16px; box-shadow:0 16px 48px rgba(0,0,0,0.12); z-index:100; animation:slideDown 0.2s ease; overflow:hidden; }
  .avatar-dropdown-header { padding:14px 16px; border-bottom:1px solid var(--border); }
  .avatar-dropdown-name { font-size:0.9rem; font-weight:700; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .avatar-dropdown-email { font-size:0.72rem; color:var(--ink-subtle); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .avatar-dropdown-item { display:flex; align-items:center; gap:10px; padding:11px 16px; cursor:pointer; transition:background 0.15s; font-size:0.85rem; font-weight:600; color:var(--ink-muted); }
  .avatar-dropdown-item:hover { background:var(--bg); color:var(--ink); }
  .avatar-dropdown-item.danger { color:var(--danger); }
  .avatar-dropdown-item.danger:hover { background:var(--danger-bg); }
  .avatar-dropdown-divider { height:1px; background:var(--border); margin:4px 0; }

  /* ── Mobile topbar ── */
  .mobile-topbar { display:none; height:var(--topbar-h); background:var(--cream); border-bottom:1px solid var(--border); align-items:center; justify-content:space-between; padding:0 20px; position:sticky; top:0; z-index:40; flex-shrink:0; }
  .mobile-back-btn { width:36px; height:36px; border-radius:10px; border:1.5px solid var(--border); background:var(--white); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink-muted); }
  .mobile-logo { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:6px; }
  .mobile-logo-dot { width:6px; height:6px; border-radius:50%; background:var(--amber); }
  .mobile-topbar-right { display:flex; align-items:center; gap:8px; }
  .mobile-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,var(--green-mid),var(--green-light)); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.78rem; color:var(--white); cursor:pointer; }
  .mobile-menu-btn { width:34px; height:34px; border-radius:10px; border:1.5px solid var(--border); background:var(--white); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink-muted); }

  .page-content { flex:1; padding:32px; padding-bottom:40px; animation:fadeUp 0.3s ease; overflow-x:hidden; }

  /* ── Bottom nav ── */
  .bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; height:var(--bottomnav-h); background:var(--white); border-top:1px solid var(--border); z-index:50; align-items:center; justify-content:space-around; padding:0 8px; padding-bottom:env(safe-area-inset-bottom); box-shadow:0 -4px 24px rgba(0,0,0,0.06); }
  .bottom-nav-item { display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 16px; border-radius:12px; cursor:pointer; transition:all 0.18s; flex:1; max-width:72px; }
  .bottom-nav-item.active { background:var(--green-pale); }
  .bottom-nav-label { font-size:0.65rem; font-weight:700; color:var(--ink-subtle); transition:color 0.18s; }
  .bottom-nav-item.active .bottom-nav-label { color:var(--green-deep); }

  /* ── Drawer ── */
  .drawer-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:60; animation:fadeIn 0.2s ease; }
  .drawer-overlay.open { display:block; }
  .drawer { position:fixed; top:0; left:0; bottom:0; width:280px; background:var(--ink); z-index:70; transform:translateX(-100%); transition:transform 0.3s cubic-bezier(0.4,0,0.2,1); display:flex; flex-direction:column; overflow:hidden; }
  .drawer.open { transform:translateX(0); }
  .drawer-close { position:absolute; top:20px; right:16px; width:32px; height:32px; border-radius:8px; border:none; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6); font-size:1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; }

  /* ── Trial banner ── */
  .trial-banner { background:linear-gradient(90deg,var(--green-deep),var(--green-mid)); padding:10px 32px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; flex-wrap:wrap; gap:8px; }
  .trial-banner-text { font-size:0.82rem; color:rgba(255,255,255,0.85); font-weight:500; }
  .trial-banner-text strong { color:var(--white); font-weight:700; }
  .trial-banner-cta { background:var(--amber); color:var(--ink); border:none; border-radius:100px; padding:5px 16px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.78rem; font-weight:800; cursor:pointer; white-space:nowrap; }

  /* ── Quick add modal ── */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:80; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s ease; }
  .modal-sheet { background:var(--white); border-radius:24px 24px 0 0; padding:28px 24px 40px; width:100%; max-width:480px; animation:slideInLeft 0.3s ease; }
  .modal-handle { width:40px; height:4px; border-radius:100px; background:var(--border); margin:0 auto 20px; }
  .modal-title { font-family:'Playfair Display',serif; font-size:1.25rem; font-weight:700; margin-bottom:16px; }
  .modal-field { margin-bottom:14px; }
  .modal-label { display:block; font-size:0.78rem; font-weight:600; color:var(--ink-muted); margin-bottom:6px; }
  .modal-input { width:100%; padding:13px 16px; border:1.5px solid var(--border); border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500; color:var(--ink); background:var(--cream); outline:none; transition:border-color 0.2s; }
  .modal-input:focus { border-color:var(--green-light); }
  .modal-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
  .modal-cat-grid { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:14px; }
  .modal-cat-btn { padding:7px 12px; border-radius:100px; border:1.5px solid var(--border); background:var(--white); color:var(--ink-muted); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.76rem; font-weight:700; cursor:pointer; transition:all 0.18s; }
  .modal-cat-btn.active { border-color:var(--green-light); background:var(--green-pale); color:var(--green-deep); }
  .modal-actions { display:flex; gap:10px; margin-top:4px; }
  .modal-cancel { flex:0; padding:13px 20px; border:1.5px solid var(--border); border-radius:12px; background:transparent; color:var(--ink-muted); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:600; cursor:pointer; }
  .modal-submit { flex:1; padding:14px; border-radius:12px; border:none; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.95rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
  .modal-submit:disabled { opacity:0.6; cursor:not-allowed; }
  .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.35); border-top-color:var(--white); border-radius:50%; animation:spin 0.7s linear infinite; }

  /* ── FAB ── */
  .fab { display:none; position:fixed; bottom:calc(var(--bottomnav-h) + 16px); right:20px; width:52px; height:52px; border-radius:50%; z-index:45; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); font-size:1.5rem; border:none; cursor:pointer; box-shadow:0 6px 24px rgba(27,67,50,0.4); transition:all 0.2s; align-items:center; justify-content:center; }

  /* ── Confirm logout dialog ── */
  .confirm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:999; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
  .confirm-card { background:#FAF8F3; border-radius:20px; padding:32px; width:100%; max-width:380px; box-shadow:0 24px 64px rgba(0,0,0,0.2); text-align:center; }

  /* ── Dropdown backdrop ── */
  .dropdown-backdrop { position:fixed; inset:0; z-index:90; }

  @media (max-width: 900px) {
    .sidebar { display:none; }
    .main-content { margin-left:0; }
    .desktop-topbar { display:none; }
    .mobile-topbar { display:flex; }
    .bottom-nav { display:flex; }
    .fab { display:flex; }
    .page-content { padding:20px 16px; padding-bottom:calc(var(--bottomnav-h) + 20px); }
    .trial-banner { padding:10px 16px; }
  }
`;

const QUICK_CATEGORIES = [
  "food",
  "transport",
  "bills",
  "shopping",
  "health",
  "airtime",
  "entertainment",
  "other",
];

const NAV_ITEMS = [
  {
    id: "dashboard",
    path: "/dashboard",
    Icon: LayoutDashboard,
    label: "Dashboard",
    badge: null,
  },
  {
    id: "expenses",
    path: "/expenses",
    Icon: Receipt,
    label: "Expenses",
    badge: null,
  },
  { id: "budget", path: "/budget", Icon: Target, label: "Budget", badge: null },
  {
    id: "insights",
    path: "/insights",
    Icon: BarChart2,
    label: "Insights",
    badge: "PRO",
  },
  {
    id: "settings",
    path: "/settings",
    Icon: Settings2,
    label: "Settings",
    badge: null,
  },
];

const BOTTOM_NAV = [
  { id: "dashboard", path: "/dashboard", Icon: Home, label: "Home" },
  { id: "expenses", path: "/expenses", Icon: Receipt, label: "Expenses" },
  { id: "budget", path: "/budget", Icon: Target, label: "Budget" },
  { id: "insights", path: "/insights", Icon: TrendingUp, label: "Insights" },
  { id: "settings", path: "/settings", Icon: Settings2, label: "Settings" },
];

const PAGE_META = {
  dashboard: { title: "Dashboard", breadcrumb: "Good morning 👋" },
  expenses: { title: "Expenses", breadcrumb: "Track & manage your spending" },
  budget: { title: "Budget", breadcrumb: "Manage your active budget" },
  insights: { title: "Insights", breadcrumb: "Deep-dive into your patterns" },
  settings: { title: "Settings", breadcrumb: "Preferences & account" },
  upgrade: { title: "Upgrade", breadcrumb: "Unlock Premium features" },
};

// ── Sample notifications (replace with real data later) ───────────────────────
const SAMPLE_NOTIFS = [
  {
    id: 1,
    icon: "⚠️",
    iconBg: "rgba(229,57,53,0.1)",
    title: "Budget pace alert",
    sub: "You're 15% over your expected pace for this week.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    icon: "🎯",
    iconBg: "rgba(64,145,108,0.1)",
    title: "Food cap almost reached",
    sub: "₦18,200 of ₦20,000 food budget used.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 3,
    icon: "💡",
    iconBg: "rgba(212,160,23,0.1)",
    title: "AI tip ready",
    sub: "Your savings coach has a new suggestion for you.",
    time: "Yesterday",
    unread: false,
  },
];

// ── Quick Add Modal ───────────────────────────────────────────────────────────
function QuickAddModal({ onClose, onSaved }) {
  const { addExpense } = useBudget();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!desc.trim() || !amount || Number(amount) < 1) return;
    setLoading(true);
    try {
      await addExpense({
        description: desc.trim(),
        amount: Number(amount),
        category,
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Quick add error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Quick add expense</div>

        <div className="modal-field">
          <label className="modal-label">Description</label>
          <input
            className="modal-input"
            type="text"
            placeholder='e.g. "Lunch at Chicken Republic"'
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-row">
          <div>
            <label className="modal-label">Amount (₦)</label>
            <input
              className="modal-input"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <div>
            <label className="modal-label">Date</label>
            <input
              className="modal-input"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              readOnly
            />
          </div>
        </div>

        <div className="modal-cat-grid">
          {QUICK_CATEGORIES.map((c) => (
            <button
              key={c}
              className={`modal-cat-btn${category === c ? " active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-submit"
            onClick={submit}
            disabled={loading || !desc.trim() || !amount}
          >
            {loading ? <div className="spinner" /> : "Log Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Notification Panel ────────────────────────────────────────────────────────
function NotifPanel({ onClose }) {
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS);
  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  const markRead = (id) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );

  return (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="notif-panel">
        <div className="notif-header">
          <div className="notif-title">
            Notifications{" "}
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  background: "#E53935",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: "100px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={markAllRead}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
        <div className="notif-list">
          {notifs.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon">🔔</div>
              <div className="notif-empty-text">No notifications yet</div>
            </div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                className={`notif-item${n.unread ? " unread" : ""}`}
                onClick={() => markRead(n.id)}
              >
                <div
                  className="notif-item-icon"
                  style={{ background: n.iconBg }}
                >
                  {n.icon}
                </div>
                <div className="notif-item-body">
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-sub">{n.sub}</div>
                  <div className="notif-item-time">{n.time}</div>
                </div>
                {n.unread && <div className="notif-unread-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ── Avatar Dropdown ───────────────────────────────────────────────────────────
function AvatarDropdown({
  displayName,
  email,
  isTrialing,
  onNavigate,
  onSignOut,
  onClose,
}) {
  return (
    <>
      <div className="dropdown-backdrop" onClick={onClose} />
      <div className="avatar-dropdown">
        <div className="avatar-dropdown-header">
          <div className="avatar-dropdown-name">
            {displayName || "My Account"}
          </div>
          <div className="avatar-dropdown-email">{email || ""}</div>
        </div>
        <div
          className="avatar-dropdown-item"
          onClick={() => {
            onNavigate("/settings");
            onClose();
          }}
        >
          <User size={15} /> Profile & Settings
          <ChevronRight
            size={13}
            style={{ marginLeft: "auto", opacity: 0.4 }}
          />
        </div>
        {isTrialing && (
          <div
            className="avatar-dropdown-item"
            onClick={() => {
              onNavigate("/upgrade");
              onClose();
            }}
          >
            <CreditCard size={15} /> Upgrade to Premium
            <ChevronRight
              size={13}
              style={{ marginLeft: "auto", opacity: 0.4 }}
            />
          </div>
        )}
        <div className="avatar-dropdown-item" onClick={onClose}>
          <HelpCircle size={15} /> Help & Support
          <ChevronRight
            size={13}
            style={{ marginLeft: "auto", opacity: 0.4 }}
          />
        </div>
        <div className="avatar-dropdown-divider" />
        <div
          className="avatar-dropdown-item danger"
          onClick={() => {
            onSignOut();
            onClose();
          }}
        >
          <LogOut size={15} /> Sign out
        </div>
      </div>
    </>
  );
}

// ── Main AppLayout ────────────────────────────────────────────────────────────
export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    displayName,
    initials,
    isTrialing,
    trialDaysLeft,
    signOut,
    user,
    profile,
  } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  // Unread count — drives the red dot on the bell
  const [unreadCount] = useState(SAMPLE_NOTIFS.filter((n) => n.unread).length);

  const notifRef = useRef(null);
  const avatarRef = useRef(null);

  const activePage =
    location.pathname.replace("/", "").split("/")[0] || "dashboard";
  const meta = PAGE_META[activePage] || PAGE_META.dashboard;

  // Close dropdowns on route change
  useEffect(() => {
    setNotifOpen(false);
    setAvatarOpen(false);
  }, [location.pathname]);

  // Close drawer on desktop resize
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 900) setDrawerOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const goTo = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  // ── Search: navigate to /expenses with ?search= param ─────────────────────
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchVal.trim()) {
      navigate(`/expenses?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
    }
  };

  const clearSearch = () => setSearchVal("");

  // ── Sign out ───────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    if (signingOut) return;
    try {
      setSigningOut(true);
      setConfirmLogout(false);
      const { error } = await signOut();
      if (error) {
        console.error("Sign out error:", error);
        setSigningOut(false);
        return;
      }
      navigate("/auth", { replace: true });
    } catch (err) {
      console.error("Sign out failed:", err);
      setSigningOut(false);
    }
  };

  return (
    <>
      <style>{FONTS + styles}</style>
      <InstallPrompt />

      {/* ── Confirm logout dialog ── */}
      {confirmLogout && (
        <div
          className="confirm-overlay"
          onClick={() => setConfirmLogout(false)}
        >
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>👋</div>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.2rem",
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              Sign out?
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6B6B6B",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              You'll be signed out of Truvllo on this device. Your data is safe.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1.5px solid rgba(10,10,10,0.1)",
                  borderRadius: 11,
                  background: "transparent",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#3A3A3A",
                  cursor: "pointer",
                }}
                onClick={() => setConfirmLogout(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#E53935",
                  color: "#fff",
                  border: "none",
                  borderRadius: 11,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: signingOut ? 0.65 : 1,
                }}
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={`drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`drawer${drawerOpen ? " open" : ""}`}>
        <button className="drawer-close" onClick={() => setDrawerOpen(false)}>
          <X size={14} />
        </button>
        <div className="sidebar-logo" style={{ paddingTop: 24 }}>
          <span className="sidebar-logo-dot" />
          Truvllo
        </div>
        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`nav-item${activePage === item.id ? " active" : ""}`}
              onClick={() => {
                goTo(item.path);
                setDrawerOpen(false);
              }}
            >
              {activePage === item.id && <div className="nav-active-bar" />}
              <item.Icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {isTrialing && (
            <div className="sidebar-upgrade">
              <div className="upgrade-title">
                {trialDaysLeft} days left on trial
              </div>
              <div className="upgrade-sub">
                Upgrade to keep all AI features.
              </div>
              <button
                className="upgrade-btn"
                onClick={() => {
                  goTo("/upgrade");
                  setDrawerOpen(false);
                }}
              >
                Upgrade to Premium
              </button>
            </div>
          )}
          <button
            className="signout-btn"
            onClick={() => {
              setDrawerOpen(false);
              setConfirmLogout(true);
            }}
            disabled={signingOut}
          >
            <LogOut size={15} />
            {signingOut ? "Signing out..." : "Log out"}
          </button>
        </div>
      </div>

      {/* ── Quick add modal ── */}
      {quickAddOpen && (
        <QuickAddModal
          onClose={() => setQuickAddOpen(false)}
          onSaved={() => {
            if (!location.pathname.includes("expenses")) goTo("/expenses");
          }}
        />
      )}

      <div className="shell-root">
        {/* ── Desktop sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-bg" />
          <div className="sidebar-logo">
            <span className="sidebar-logo-dot" />
            Truvllo
          </div>
          <div className="sidebar-section-label">Main</div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`nav-item${activePage === item.id ? " active" : ""}`}
                onClick={() => goTo(item.path)}
              >
                {activePage === item.id && <div className="nav-active-bar" />}
                <item.Icon size={16} style={{ flexShrink: 0 }} />
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </nav>
          {isTrialing && (
            <div className="sidebar-upgrade">
              <div className="upgrade-title">
                Trial Active — {trialDaysLeft} days left
              </div>
              <div className="upgrade-sub">
                Upgrade to keep AI features after your trial.
              </div>
              <button className="upgrade-btn" onClick={() => goTo("/upgrade")}>
                Upgrade to Premium
              </button>
            </div>
          )}
          <div className="sidebar-bottom">
            <div className="sidebar-profile" onClick={() => goTo("/settings")}>
              <div className="profile-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div className="profile-name">
                  {displayName || "My Account"}
                </div>
                <div className="premium-pill">
                  ✦ {isTrialing ? "Trial" : "Free"}
                </div>
              </div>
              <span className="profile-chevron">⋯</span>
            </div>
            <button
              className="signout-btn"
              onClick={() => setConfirmLogout(true)}
              disabled={signingOut}
            >
              <LogOut size={15} />
              {signingOut ? "Signing out..." : "Log out"}
            </button>
          </div>
        </aside>

        <div className="main-content">
          {isTrialing && (
            <div className="trial-banner">
              <div className="trial-banner-text">
                🎁 <strong>{trialDaysLeft} days left</strong> on your free
                Premium trial
              </div>
              <button
                className="trial-banner-cta"
                onClick={() => goTo("/upgrade")}
              >
                Upgrade now
              </button>
            </div>
          )}

          {/* ── Desktop topbar ── */}
          <div className="desktop-topbar">
            <div>
              <div className="topbar-page-title">{meta.title}</div>
              <div className="topbar-breadcrumb">{meta.breadcrumb}</div>
            </div>
            <div className="topbar-right">
              {/* Search — Enter navigates to /expenses?search= */}
              <div className="topbar-search">
                <Search size={14} color="var(--ink-subtle)" />
                <input
                  placeholder="Search expenses..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                {searchVal && (
                  <button className="search-clear-btn" onClick={clearSearch}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Bell — opens notification panel */}
              <div style={{ position: "relative" }} ref={notifRef}>
                <div
                  className="topbar-icon-btn"
                  title="Notifications"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setAvatarOpen(false);
                  }}
                >
                  <Bell size={15} />
                  {unreadCount > 0 && <div className="notif-dot" />}
                </div>
                {notifOpen && (
                  <NotifPanel onClose={() => setNotifOpen(false)} />
                )}
              </div>

              {/* Plus — quick add */}
              <div
                className="topbar-icon-btn"
                title="Add expense"
                onClick={() => setQuickAddOpen(true)}
              >
                <Plus size={15} />
              </div>

              {/* Avatar — opens dropdown with profile link */}
              <div style={{ position: "relative" }} ref={avatarRef}>
                <div
                  className="topbar-avatar"
                  title="My account"
                  onClick={() => {
                    setAvatarOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                >
                  {initials}
                </div>
                {avatarOpen && (
                  <AvatarDropdown
                    displayName={displayName}
                    email={user?.email || profile?.email}
                    isTrialing={isTrialing}
                    onNavigate={goTo}
                    onSignOut={() => setConfirmLogout(true)}
                    onClose={() => setAvatarOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Mobile topbar ── */}
          <div className="mobile-topbar">
            <button
              className="mobile-back-btn"
              onClick={() =>
                activePage !== "dashboard" ? goTo("/dashboard") : null
              }
              style={{ opacity: activePage === "dashboard" ? 0.3 : 1 }}
            >
              <ArrowLeft size={16} />
            </button>
            <div className="mobile-logo">
              <span className="mobile-logo-dot" />
              Truvllo
            </div>
            <div className="mobile-topbar-right">
              {/* Mobile avatar → settings */}
              <div className="mobile-avatar" onClick={() => goTo("/settings")}>
                {initials}
              </div>
              <div
                className="mobile-menu-btn"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={18} />
              </div>
            </div>
          </div>

          <div className="page-content">
            <Outlet />
          </div>
        </div>

        {/* ── Bottom nav ── */}
        <nav className="bottom-nav">
          {BOTTOM_NAV.map((item) => (
            <div
              key={item.id}
              className={`bottom-nav-item${activePage === item.id ? " active" : ""}`}
              onClick={() => goTo(item.path)}
            >
              <item.Icon
                size={22}
                color={
                  activePage === item.id
                    ? "var(--green-deep)"
                    : "var(--ink-subtle)"
                }
              />
              <span className="bottom-nav-label">{item.label}</span>
            </div>
          ))}
        </nav>

        <button className="fab" onClick={() => setQuickAddOpen(true)}>
          <Plus size={22} />
        </button>
      </div>
    </>
  );
}
