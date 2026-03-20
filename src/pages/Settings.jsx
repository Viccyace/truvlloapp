import { useState, useEffect, useMemo } from "react";
/* eslint-disable no-unused-vars -- sub-components are used in JSX */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

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
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }

  .page { display:flex; flex-direction:column; gap:28px; max-width:860px; animation:fadeIn 0.3s ease; }

  .page-header { animation:fadeUp 0.35s ease; }
  .page-title { font-family:'Playfair Display',serif; font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .page-sub   { font-size:0.875rem; color:var(--ink-subtle); margin-top:4px; }

  .settings-card {
    background:var(--white); border-radius:20px; border:1.5px solid var(--border);
    overflow:hidden; animation:fadeUp 0.35s ease var(--delay,0s) both;
  }
  .card-header { padding:22px 28px 0; display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
  .card-title  { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--ink); }
  .card-sub    { font-size:0.78rem; color:var(--ink-subtle); margin-top:2px; }
  .card-body   { padding:0 28px 28px; }
  .card-divider { height:1px; background:var(--border); margin:0 28px; }

  .avatar-section { display:flex; align-items:center; gap:20px; margin-bottom:24px; }
  .avatar-circle  {
    width:80px; height:80px; border-radius:50%; flex-shrink:0; position:relative;
    background:linear-gradient(135deg,var(--green-deep),var(--green-light));
    display:flex; align-items:center; justify-content:center;
    font-family:'Playfair Display',serif; font-size:2rem; font-weight:800; color:var(--white);
    overflow:hidden; cursor:pointer;
  }
  .avatar-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center;
    opacity:0; transition:opacity 0.2s; border-radius:50%;
  }
  .avatar-circle:hover .avatar-overlay { opacity:1; }
  .avatar-overlay-text { color:var(--white); font-size:0.7rem; font-weight:700; text-align:center; line-height:1.4; }
  .avatar-name  { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; color:var(--ink); }
  .avatar-email { font-size:0.82rem; color:var(--ink-subtle); margin-top:2px; }
  .avatar-plan  {
    display:inline-flex; align-items:center; gap:5px; margin-top:8px;
    background:var(--amber-pale); color:var(--amber); border:1px solid rgba(212,160,23,0.25);
    padding:3px 10px; border-radius:100px; font-size:0.7rem; font-weight:800;
    text-transform:uppercase; letter-spacing:0.06em;
  }

  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:600px){ .form-grid{ grid-template-columns:1fr; } }
  .form-grid .full { grid-column:1/-1; }
  .field-wrap { display:flex; flex-direction:column; gap:6px; }
  .field-label { font-size:0.78rem; font-weight:600; color:var(--ink-muted); }
  .field-input {
    padding:12px 14px; border:1.5px solid var(--border); border-radius:12px;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:16px; font-weight:500;
    color:var(--ink); background:var(--cream); outline:none; transition:all 0.2s; width:100%;
  }
  .field-input:focus { border-color:var(--green-light); box-shadow:0 0 0 3px rgba(64,145,108,0.1); background:var(--white); }
  .field-input.error { border-color:var(--red); }
  .field-error { font-size:0.72rem; color:var(--red); font-weight:500; }
  .field-hint  { font-size:0.72rem; color:var(--ink-subtle); }
  .password-wrap { position:relative; }
  .password-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--ink-subtle); font-size:0.75rem; font-weight:700; padding:4px; transition:color 0.18s; }
  .password-toggle:hover { color:var(--ink); }
  .password-strength { display:flex; gap:4px; margin-top:6px; align-items:center; }
  .strength-bar { flex:1; height:3px; border-radius:100px; background:var(--cream-dark); transition:background 0.3s; }

  .save-row { display:flex; align-items:center; justify-content:flex-end; gap:12px; margin-top:20px; flex-wrap:wrap; }
  .btn-ghost { padding:10px 20px; border:1.5px solid var(--border); border-radius:11px; background:transparent; color:var(--ink-muted); font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .btn-ghost:hover { border-color:rgba(10,10,10,0.2); color:var(--ink); }
  .btn-save { padding:11px 24px; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); border:none; border-radius:11px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:700; cursor:pointer; transition:all 0.22s; box-shadow:0 4px 16px rgba(27,67,50,0.25); display:flex; align-items:center; gap:7px; }
  .btn-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(27,67,50,0.35); }
  .btn-save:disabled { opacity:0.65; cursor:not-allowed; transform:none; }
  .saved-badge { display:flex; align-items:center; gap:6px; color:var(--green-mid); font-size:0.82rem; font-weight:700; animation:scaleIn 0.3s ease; }
  .saved-check { width:20px; height:20px; border-radius:50%; background:var(--green-pale); display:flex; align-items:center; justify-content:center; font-size:0.7rem; animation:checkPop 0.4s ease; }
  .spinner { width:15px; height:15px; border:2px solid rgba(255,255,255,0.35); border-top-color:var(--white); border-radius:50%; animation:spin 0.7s linear infinite; }

  .currency-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  @media(max-width:480px){ .currency-grid{ grid-template-columns:repeat(2,1fr); } }
  .currency-tile {
    border:1.5px solid var(--border); border-radius:14px; padding:14px 10px;
    cursor:pointer; text-align:center; transition:all 0.2s; background:var(--white);
    position:relative;
  }
  .currency-tile:hover { border-color:rgba(64,145,108,0.35); transform:translateY(-1px); }
  .currency-tile.active { border-color:var(--green-light); background:var(--green-pale); }
  .currency-flag   { font-size:1.6rem; margin-bottom:6px; }
  .currency-code   { font-weight:800; font-size:0.9rem; color:var(--ink); margin-bottom:2px; }
  .currency-name   { font-size:0.68rem; color:var(--ink-subtle); font-weight:500; }
  .currency-tile.active .currency-name { color:var(--green-mid); }
  .currency-check  { position:absolute; top:7px; right:7px; width:16px; height:16px; border-radius:50%; background:var(--green-light); color:var(--white); font-size:0.6rem; display:flex; align-items:center; justify-content:center; font-weight:800; animation:checkPop 0.3s ease; }

  .toggle-list { display:flex; flex-direction:column; }
  .toggle-row {
    display:flex; align-items:center; justify-content:space-between; gap:16px;
    padding:16px 0; border-bottom:1px solid var(--border);
  }
  .toggle-row:last-child { border-bottom:none; padding-bottom:0; }
  .toggle-left { flex:1; }
  .toggle-title { font-size:0.9rem; font-weight:700; color:var(--ink); margin-bottom:2px; }
  .toggle-desc  { font-size:0.75rem; color:var(--ink-subtle); line-height:1.5; }
  .toggle-switch {
    width:44px; height:24px; border-radius:100px; position:relative;
    cursor:pointer; transition:background 0.25s; flex-shrink:0; border:none; padding:0;
  }
  .toggle-switch.on  { background:var(--green-light); }
  .toggle-switch.off { background:rgba(10,10,10,0.15); }
  .toggle-knob {
    position:absolute; top:3px; width:18px; height:18px; border-radius:50%;
    background:var(--white); transition:left 0.25s cubic-bezier(0.4,0,0.2,1);
    box-shadow:0 1px 4px rgba(0,0,0,0.2);
  }
  .toggle-switch.on  .toggle-knob { left:23px; }
  .toggle-switch.off .toggle-knob { left:3px; }

  .plan-hero {
    background:linear-gradient(140deg,var(--green-deep),var(--green-mid));
    border-radius:18px; padding:24px; margin-bottom:16px; position:relative; overflow:hidden;
  }
  .plan-hero-blob { position:absolute; border-radius:50%; filter:blur(50px); pointer-events:none; width:200px; height:200px; top:-60px; right:-40px; background:rgba(255,255,255,0.08); }
  .plan-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.18); color:rgba(255,255,255,0.9); padding:4px 12px; border-radius:100px; font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:12px; }
  .plan-badge-dot { width:5px; height:5px; border-radius:50%; background:var(--amber-light); }
  .plan-name { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:800; color:var(--white); margin-bottom:4px; }
  .plan-desc { font-size:0.82rem; color:rgba(255,255,255,0.55); line-height:1.5; }
  .plan-trial-bar { margin-top:16px; }
  .plan-trial-label { display:flex; justify-content:space-between; font-size:0.72rem; color:rgba(255,255,255,0.55); font-weight:600; margin-bottom:6px; gap:8px; flex-wrap:wrap; }
  .plan-bar-track { background:rgba(255,255,255,0.12); border-radius:100px; height:6px; overflow:hidden; }
  .plan-bar-fill  { height:100%; border-radius:100px; background:var(--amber-light); transition:width 1s ease; }

  .plan-features { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px; }
  @media(max-width:500px){ .plan-features{ grid-template-columns:1fr; } }
  .plan-feature-row { display:flex; align-items:center; gap:8px; font-size:0.82rem; color:var(--ink-muted); }
  .plan-feature-row .check { color:var(--green-light); font-weight:800; }
  .plan-feature-row .lock  { color:var(--ink-subtle); font-size:0.75rem; }
  .plan-upgrade-btn { width:100%; padding:13px; background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); border:none; border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.95rem; font-weight:800; cursor:pointer; transition:all 0.22s; box-shadow:0 4px 16px rgba(27,67,50,0.25); }
  .plan-upgrade-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(27,67,50,0.35); }
  .plan-renew-btn { width:100%; padding:12px; background:var(--white); color:var(--green-deep); border:1.5px solid rgba(64,145,108,0.25); border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:700; cursor:pointer; transition:all 0.2s; margin-top:8px; }
  .plan-renew-btn:hover { border-color:var(--green-light); background:var(--green-pale); }

  .danger-section { border-top:1px solid var(--border); padding:20px 28px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  .danger-title { font-size:0.875rem; font-weight:700; color:var(--ink); }
  .danger-sub   { font-size:0.75rem; color:var(--ink-subtle); margin-top:2px; }
  .danger-btn   { padding:9px 18px; background:var(--red-pale); color:var(--red); border:1.5px solid rgba(229,57,53,0.2); border-radius:10px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
  .danger-btn:hover { background:rgba(229,57,53,0.15); border-color:rgba(229,57,53,0.35); }

  .toast { position:fixed; bottom:24px; right:24px; z-index:200; background:var(--ink); color:var(--white); padding:13px 20px; border-radius:12px; font-size:0.875rem; font-weight:600; display:flex; align-items:center; gap:9px; box-shadow:0 8px 32px rgba(0,0,0,0.22); animation:scaleIn 0.3s ease; }

  .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
  .confirm-modal { background:var(--white); border-radius:20px; padding:32px; width:100%; max-width:400px; box-shadow:0 24px 64px rgba(0,0,0,0.18); animation:scaleIn 0.3s cubic-bezier(0.34,1.3,0.64,1); text-align:center; }
  .confirm-icon  { font-size:2.5rem; margin-bottom:14px; }
  .confirm-title { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:800; color:var(--ink); margin-bottom:8px; }
  .confirm-desc  { font-size:0.875rem; color:var(--ink-subtle); line-height:1.6; margin-bottom:24px; }
  .confirm-btns  { display:flex; gap:10px; }
  .confirm-cancel { flex:1; padding:12px; border:1.5px solid var(--border); border-radius:11px; background:transparent; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:600; color:var(--ink-muted); cursor:pointer; }
  .confirm-ok    { flex:1; padding:12px; background:var(--red); color:var(--white); border:none; border-radius:11px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem; font-weight:700; cursor:pointer; transition:opacity 0.2s; }
  .confirm-ok:hover { opacity:0.88; }
`;

const CURRENCIES = [
  { code: "NGN", symbol: "₦", flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "KES", symbol: "KSh", flag: "🇰🇪", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "₵", flag: "🇬🇭", name: "Ghanaian Cedi" },
];

const PLAN_FEATURES_FREE = [
  "Unlimited budgets",
  "Expense logging",
  "Budget pace",
  "Safe-to-spend",
];
const PLAN_FEATURES_PREMIUM = [
  "All AI features",
  "Category caps",
  "Recurring expenses",
  "Advanced charts",
  "CSV export",
  "Habit streaks",
];

function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_COLORS = [
  "var(--border)",
  "var(--red)",
  "var(--amber)",
  "var(--amber-light)",
  "var(--green-light)",
];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      className={`toggle-switch ${on ? "on" : "off"}`}
      onClick={() => onChange(!on)}
    >
      <div className="toggle-knob" />
    </button>
  );
}

function SaveRow({ loading, saved, onSave, onReset }) {
  return (
    <div className="save-row">
      {saved && (
        <div className="saved-badge">
          <div className="saved-check">✓</div>
          Saved successfully
        </div>
      )}
      <button type="button" className="btn-ghost" onClick={onReset}>
        Reset
      </button>
      <button
        type="button"
        className="btn-save"
        onClick={onSave}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner" /> Saving…
          </>
        ) : (
          "Save changes"
        )}
      </button>
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    displayName,
    initials,
    isPremium,
    isTrialing,
    trialDaysLeft,
    currency: authCurrency,
    updateProfile,
    updatePassword,
    signOut,
  } = useAuth();

  const firstNameFromProfile =
    profile?.first_name || displayName?.split(" ").filter(Boolean)[0] || "";

  const lastNameFromProfile =
    profile?.last_name ||
    displayName?.split(" ").filter(Boolean).slice(1).join(" ") ||
    "";

  const [firstName, setFirstName] = useState(firstNameFromProfile);
  const [lastName, setLastName] = useState(lastNameFromProfile);
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setFirstName(firstNameFromProfile);
    setLastName(lastNameFromProfile);
    setEmail(profile?.email || user?.email || "");
    setPhone(profile?.phone || "");
  }, [
    firstNameFromProfile,
    lastNameFromProfile,
    profile?.email,
    user?.email,
    profile?.phone,
  ]);

  const saveProfile = async () => {
    setProfileLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: fullName,
      phone: phone.trim() || null,
    });

    setProfileLoading(false);

    if (error) {
      return;
    }

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const resetProfile = () => {
    setFirstName(firstNameFromProfile);
    setLastName(lastNameFromProfile);
    setEmail(profile?.email || user?.email || "");
    setPhone(profile?.phone || "");
  };

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState({ cur: false, new: false, con: false });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const strength = strengthScore(newPw);

  const savePassword = async () => {
    const e = {};
    if (!currentPw) e.cur = "Current password is required";
    if (!newPw || newPw.length < 8)
      e.new = "Password must be at least 8 characters";
    if (newPw !== confirmPw) e.con = "Passwords don't match";

    if (Object.keys(e).length) {
      setPwErrors(e);
      return;
    }

    setPwErrors({});
    setPwLoading(true);

    const { error } = await updatePassword(newPw);

    setPwLoading(false);

    if (error) {
      setPwErrors({ new: error.message || "Could not update password" });
      return;
    }

    setPwSaved(true);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setPwSaved(false), 3000);
  };

  const [currency, setCurrency] = useState(authCurrency || "NGN");
  const [currLoading, setCurrLoading] = useState(false);
  const [currSaved, setCurrSaved] = useState(false);

  useEffect(() => {
    setCurrency(authCurrency || "NGN");
  }, [authCurrency]);

  const saveCurrency = async () => {
    setCurrLoading(true);
    const { error } = await updateProfile({ currency });
    setCurrLoading(false);

    if (error) {
      return;
    }

    setCurrSaved(true);
    setTimeout(() => setCurrSaved(false), 3000);
  };

  const [notifs, setNotifs] = useState({
    daily_summary: true,
    over_pace_alert: true,
    trial_reminder: true,
    weekly_report: false,
    tips_and_advice: true,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const saveNotifs = () => {
    setNotifLoading(true);
    setTimeout(() => {
      setNotifLoading(false);
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 3000);
    }, 700);
  };

  const NOTIF_OPTIONS = [
    {
      key: "daily_summary",
      title: "Daily spending summary",
      desc: "A quick recap of your spending sent every evening.",
    },
    {
      key: "over_pace_alert",
      title: "Over-pace alerts",
      desc: "Get notified immediately when your spending exceeds expected pace.",
    },
    {
      key: "trial_reminder",
      title: "Trial expiry reminder",
      desc: "A heads-up before your free trial ends.",
    },
    {
      key: "weekly_report",
      title: "Weekly budget report",
      desc: "Full spending breakdown delivered every Monday morning.",
    },
    {
      key: "tips_and_advice",
      title: "AI tips & savings advice",
      desc: "Personalised saving tips from your AI coach.",
    },
  ];

  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleConfirm = async () => {
    if (confirmModal === "logout") {
      setSigningOut(true);
      const { error } = await signOut();
      setSigningOut(false);

      if (!error) {
        setConfirmModal(null);
        navigate("/auth", { replace: true });
        return;
      }
    }

    if (confirmModal === "delete") {
      setToast("Account deletion request submitted");
      setConfirmModal(null);
    }
  };

  const planLabel = isTrialing
    ? "Premium Trial"
    : isPremium
      ? "Premium"
      : "Free";

  const trialEndDate = useMemo(() => {
    if (!isTrialing || !trialDaysLeft) return null;
    return new Date(
      new Date().setDate(new Date().getDate() + trialDaysLeft),
    ).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  }, [isTrialing, trialDaysLeft]);

  return (
    <>
      <style>{FONTS + styles}</style>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {confirmModal && (
        <div className="modal-bg" onClick={() => setConfirmModal(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              {confirmModal === "logout" ? "👋" : "⚠️"}
            </div>
            <div className="confirm-title">
              {confirmModal === "logout" ? "Sign out?" : "Delete account?"}
            </div>
            <div className="confirm-desc">
              {confirmModal === "logout"
                ? "You'll be signed out of Truvllo on this device. Your data is safe."
                : "This will permanently delete your account and all your budget data. This action cannot be undone."}
            </div>
            <div className="confirm-btns">
              <button
                type="button"
                className="confirm-cancel"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-ok"
                onClick={handleConfirm}
                disabled={signingOut}
              >
                {confirmModal === "logout"
                  ? signingOut
                    ? "Signing out..."
                    : "Sign out"
                  : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page">
        <div className="page-header">
          <div className="page-title">Settings</div>
          <div className="page-sub">
            Manage your account, preferences, and plan
          </div>
        </div>

        <div className="settings-card" style={{ "--delay": "0.04s" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Profile</div>
              <div className="card-sub">
                Your name, email, and contact details
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="avatar-section">
              <div className="avatar-circle">
                {initials || "?"}
                <div className="avatar-overlay">
                  <div className="avatar-overlay-text">
                    Profile
                    <br />
                    photo
                  </div>
                </div>
              </div>
              <div className="avatar-info">
                <div className="avatar-name">{displayName || "My Account"}</div>
                <div className="avatar-email">
                  {profile?.email || user?.email || "No email"}
                </div>
                <div className="avatar-plan">✦ {planLabel}</div>
              </div>
            </div>

            <div className="form-grid">
              <div className="field-wrap">
                <label className="field-label">First name</label>
                <input
                  className="field-input"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="field-wrap">
                <label className="field-label">Last name</label>
                <input
                  className="field-input"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="field-wrap full">
                <label className="field-label">Email address</label>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  disabled
                />
                <div className="field-hint">
                  Email is managed by your login provider.
                </div>
              </div>
              <div className="field-wrap full">
                <label className="field-label">Phone number (optional)</label>
                <input
                  className="field-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                />
              </div>
            </div>

            <SaveRow
              loading={profileLoading}
              saved={profileSaved}
              onSave={saveProfile}
              onReset={resetProfile}
            />
          </div>
        </div>

        <div className="settings-card" style={{ "--delay": "0.07s" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Password</div>
              <div className="card-sub">Change your login password</div>
            </div>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field-wrap full">
                <label className="field-label">Current password</label>
                <div className="password-wrap">
                  <input
                    className={`field-input${pwErrors.cur ? " error" : ""}`}
                    type={showPw.cur ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPw}
                    onChange={(e) => {
                      setCurrentPw(e.target.value);
                      setPwErrors((x) => ({ ...x, cur: "" }));
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPw((s) => ({ ...s, cur: !s.cur }))}
                  >
                    {showPw.cur ? "Hide" : "Show"}
                  </button>
                </div>
                {pwErrors.cur && (
                  <div className="field-error">{pwErrors.cur}</div>
                )}
              </div>

              <div className="field-wrap">
                <label className="field-label">New password</label>
                <div className="password-wrap">
                  <input
                    className={`field-input${pwErrors.new ? " error" : ""}`}
                    type={showPw.new ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={newPw}
                    onChange={(e) => {
                      setNewPw(e.target.value);
                      setPwErrors((x) => ({ ...x, new: "" }));
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPw((s) => ({ ...s, new: !s.new }))}
                  >
                    {showPw.new ? "Hide" : "Show"}
                  </button>
                </div>
                {newPw && (
                  <div className="password-strength">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{
                          background:
                            i <= strength
                              ? STRENGTH_COLORS[strength]
                              : "var(--cream-dark)",
                        }}
                      />
                    ))}
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: STRENGTH_COLORS[strength],
                        marginLeft: 4,
                      }}
                    >
                      {STRENGTH_LABELS[strength]}
                    </span>
                  </div>
                )}
                {pwErrors.new && (
                  <div className="field-error">{pwErrors.new}</div>
                )}
              </div>

              <div className="field-wrap">
                <label className="field-label">Confirm new password</label>
                <div className="password-wrap">
                  <input
                    className={`field-input${pwErrors.con ? " error" : ""}`}
                    type={showPw.con ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPw}
                    onChange={(e) => {
                      setConfirmPw(e.target.value);
                      setPwErrors((x) => ({ ...x, con: "" }));
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPw((s) => ({ ...s, con: !s.con }))}
                  >
                    {showPw.con ? "Hide" : "Show"}
                  </button>
                </div>
                {pwErrors.con && (
                  <div className="field-error">{pwErrors.con}</div>
                )}
              </div>
            </div>

            <SaveRow
              loading={pwLoading}
              saved={pwSaved}
              onSave={savePassword}
              onReset={() => {
                setCurrentPw("");
                setNewPw("");
                setConfirmPw("");
                setPwErrors({});
              }}
            />
          </div>
        </div>

        <div className="settings-card" style={{ "--delay": "0.1s" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Currency</div>
              <div className="card-sub">
                Used across all budgets, expenses, and AI insights
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="currency-grid">
              {CURRENCIES.map((c) => (
                <div
                  key={c.code}
                  className={`currency-tile${currency === c.code ? " active" : ""}`}
                  onClick={() => setCurrency(c.code)}
                >
                  {currency === c.code && (
                    <div className="currency-check">✓</div>
                  )}
                  <div className="currency-flag">{c.flag}</div>
                  <div className="currency-code">{c.code}</div>
                  <div className="currency-name">{c.name}</div>
                </div>
              ))}
            </div>
            <SaveRow
              loading={currLoading}
              saved={currSaved}
              onSave={saveCurrency}
              onReset={() => setCurrency(authCurrency || "NGN")}
            />
          </div>
        </div>

        <div className="settings-card" style={{ "--delay": "0.13s" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Notifications</div>
              <div className="card-sub">
                Control what Truvllo sends you and when
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="toggle-list">
              {NOTIF_OPTIONS.map((opt) => (
                <div key={opt.key} className="toggle-row">
                  <div className="toggle-left">
                    <div className="toggle-title">{opt.title}</div>
                    <div className="toggle-desc">{opt.desc}</div>
                  </div>
                  <Toggle
                    on={notifs[opt.key]}
                    onChange={(v) => setNotifs((n) => ({ ...n, [opt.key]: v }))}
                  />
                </div>
              ))}
            </div>
            <SaveRow
              loading={notifLoading}
              saved={notifSaved}
              onSave={saveNotifs}
              onReset={() =>
                setNotifs({
                  daily_summary: true,
                  over_pace_alert: true,
                  trial_reminder: true,
                  weekly_report: false,
                  tips_and_advice: true,
                })
              }
            />
          </div>
        </div>

        <div className="settings-card" style={{ "--delay": "0.16s" }}>
          <div className="card-header">
            <div>
              <div className="card-title">Your Plan</div>
              <div className="card-sub">Subscription status and features</div>
            </div>
          </div>
          <div className="card-body">
            {isTrialing ? (
              <>
                <div className="plan-hero">
                  <div className="plan-hero-blob" />
                  <div className="plan-badge">
                    <span className="plan-badge-dot" />
                    Premium Trial Active
                  </div>
                  <div className="plan-name">7-Day Free Trial</div>
                  <div className="plan-desc">
                    You're enjoying full Premium access. Upgrade before your
                    trial ends to keep all features.
                  </div>
                  <div className="plan-trial-bar">
                    <div className="plan-trial-label">
                      <span>{trialDaysLeft} days remaining</span>
                      <span>
                        {trialEndDate ? `Trial ends ${trialEndDate}` : ""}
                      </span>
                    </div>
                    <div className="plan-bar-track">
                      <div
                        className="plan-bar-fill"
                        style={{
                          width: `${Math.max(0, Math.min(100, (trialDaysLeft / 7) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="plan-features">
                  {PLAN_FEATURES_PREMIUM.map((f) => (
                    <div key={f} className="plan-feature-row">
                      <span className="check">✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                <button type="button" className="plan-upgrade-btn">
                  Upgrade to Premium — ₦6,500/mo
                </button>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "var(--ink-subtle)",
                    marginTop: 10,
                  }}
                >
                  Cancel any time
                </div>
              </>
            ) : isPremium ? (
              <>
                <div className="plan-hero">
                  <div className="plan-hero-blob" />
                  <div className="plan-badge">
                    <span className="plan-badge-dot" />
                    Active
                  </div>
                  <div className="plan-name">Premium Plan</div>
                  <div className="plan-desc">
                    Your Premium features are active.
                  </div>
                </div>
                <div className="plan-features">
                  {PLAN_FEATURES_PREMIUM.map((f) => (
                    <div key={f} className="plan-feature-row">
                      <span className="check">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button type="button" className="plan-renew-btn">
                  Manage subscription
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 13,
                        background: "var(--cream-dark)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.3rem",
                      }}
                    >
                      🎯
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        Free Plan
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--ink-subtle)",
                          marginTop: 2,
                        }}
                      >
                        Core features included · AI features locked
                      </div>
                    </div>
                  </div>
                  <div className="plan-features">
                    {PLAN_FEATURES_FREE.map((f) => (
                      <div key={f} className="plan-feature-row">
                        <span className="check">✓</span>
                        {f}
                      </div>
                    ))}
                    {PLAN_FEATURES_PREMIUM.map((f) => (
                      <div
                        key={f}
                        className="plan-feature-row"
                        style={{ opacity: 0.45 }}
                      >
                        <span className="lock">🔒</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" className="plan-upgrade-btn">
                  Upgrade to Premium — ₦6,500/mo
                </button>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "var(--ink-subtle)",
                    marginTop: 10,
                  }}
                >
                  7-day free trial · No card needed
                </div>
              </>
            )}
          </div>

          <div className="card-divider" />
          <div className="danger-section">
            <div>
              <div className="danger-title">Sign out</div>
              <div className="danger-sub">
                Sign out of Truvllo on this device
              </div>
            </div>
            <button
              type="button"
              className="danger-btn"
              onClick={() => setConfirmModal("logout")}
            >
              Sign out
            </button>
          </div>

          <div className="card-divider" />
          <div className="danger-section">
            <div>
              <div className="danger-title">Delete account</div>
              <div className="danger-sub">
                Permanently delete your account and all data. This cannot be
                undone.
              </div>
            </div>
            <button
              type="button"
              className="danger-btn"
              onClick={() => setConfirmModal("delete")}
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
