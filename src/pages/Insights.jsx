import { useState, useEffect, useMemo } from "react";
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
  }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes barGrow { from{width:0} }

  .page { display:flex; flex-direction:column; gap:28px; animation:fadeIn 0.3s ease; }
  .page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:14px; animation:fadeUp 0.35s ease; }
  .page-title { font-family:'Playfair Display',serif; font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .page-sub { font-size:0.875rem; color:var(--ink-subtle); margin-top:4px; }

  .stat-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; animation:fadeUp 0.35s ease 0.04s both; }
  @media(max-width:800px){ .stat-strip{ grid-template-columns:repeat(2,1fr); } }
  .stat-card { background:var(--white); border-radius:18px; padding:20px; border:1.5px solid var(--border); transition:all 0.2s; }
  .stat-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.07); transform:translateY(-2px); }
  .stat-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; margin-bottom:12px; }
  .stat-val { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:900; color:var(--ink); line-height:1; }
  .stat-val.green { color:var(--green-mid); }
  .stat-val.amber { color:var(--amber); }
  .stat-val.red { color:var(--red); }
  .stat-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-subtle); margin-bottom:6px; }
  .stat-change { font-size:0.72rem; margin-top:6px; font-weight:600; color:var(--ink-subtle); }
  .stat-change.up   { color:var(--green-light); }
  .stat-change.down { color:var(--red); }

  .chart-card { background:var(--white); border-radius:20px; border:1.5px solid var(--border); overflow:hidden; }
  .chart-header { padding:22px 24px 0; display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
  .chart-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--ink); }
  .chart-sub { font-size:0.75rem; color:var(--ink-subtle); margin-top:2px; }
  .chart-body { padding:0 24px 24px; }
  .pro-tag { display:inline-flex; align-items:center; gap:4px; background:var(--amber-pale); color:var(--amber); font-size:0.65rem; font-weight:800; padding:3px 9px; border-radius:100px; border:1px solid rgba(212,160,23,0.2); text-transform:uppercase; letter-spacing:0.06em; }

  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; animation:fadeUp 0.35s ease 0.08s both; }
  @media(max-width:900px){ .two-col{ grid-template-columns:1fr; } }

  .pie-wrap { display:flex; gap:28px; align-items:center; flex-wrap:wrap; }
  .pie-svg-wrap { position:relative; flex-shrink:0; }
  .pie-center-text { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; }
  .pie-center-val { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:900; color:var(--ink); }
  .pie-center-label { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--ink-subtle); }
  .pie-legend { flex:1; display:flex; flex-direction:column; gap:10px; min-width:160px; }
  .legend-row { display:flex; align-items:center; gap:10px; cursor:pointer; padding:6px 8px; border-radius:9px; transition:background 0.18s; }
  .legend-row:hover { background:var(--bg); }
  .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .legend-name { flex:1; font-size:0.82rem; font-weight:600; color:var(--ink-muted); }
  .legend-right { text-align:right; }
  .legend-val { font-size:0.82rem; font-weight:800; color:var(--ink); font-family:'Playfair Display',serif; }
  .legend-pct { font-size:0.68rem; color:var(--ink-subtle); }

  .bar-chart-wrap { position:relative; }
  .bar-hover-tip { position:absolute; background:var(--ink); color:var(--white); padding:7px 12px; border-radius:9px; font-size:0.75rem; font-weight:600; pointer-events:none; white-space:nowrap; z-index:10; box-shadow:0 4px 16px rgba(0,0,0,0.2); transform:translate(-50%,-100%); margin-top:-8px; }
  .bar-hover-tip::after { content:""; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:5px solid transparent; border-top-color:var(--ink); }

  .breakdown-list { display:flex; flex-direction:column; gap:14px; }
  .breakdown-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; }
  .breakdown-name { display:flex; align-items:center; gap:9px; font-size:0.875rem; font-weight:700; color:var(--ink); }
  .breakdown-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:0.85rem; }
  .breakdown-right { text-align:right; }
  .breakdown-amount { font-family:'Playfair Display',serif; font-size:0.9rem; font-weight:800; color:var(--ink); }
  .breakdown-pct { font-size:0.7rem; color:var(--ink-subtle); }
  .breakdown-bar-track { background:var(--cream-dark); border-radius:100px; height:7px; overflow:hidden; }
  .breakdown-bar-fill { height:100%; border-radius:100px; transition:width 1s cubic-bezier(0.4,0,0.2,1); }

  .mom-list { display:flex; flex-direction:column; gap:8px; }
  .mom-row { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:12px; }
  .mom-month { font-size:0.8rem; font-weight:700; color:var(--ink); min-width:90px; }
  .mom-bar-track { flex:1; background:var(--cream-dark); border-radius:100px; height:8px; overflow:hidden; }
  .mom-bar-fill { height:100%; border-radius:100px; }
  .mom-amount { font-family:'Playfair Display',serif; font-size:0.88rem; font-weight:800; color:var(--ink); min-width:80px; text-align:right; }
  .mom-change { font-size:0.7rem; font-weight:700; min-width:48px; text-align:right; }

  .insight-strip { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; animation:fadeUp 0.35s ease 0.16s both; }
  @media(max-width:900px){ .insight-strip{ grid-template-columns:1fr; } }
  .insight-card { background:var(--ink); border-radius:18px; padding:22px; border:1px solid rgba(255,255,255,0.07); position:relative; overflow:hidden; }
  .insight-glow { position:absolute; width:150px; height:150px; border-radius:50%; filter:blur(50px); pointer-events:none; top:-40px; right:-40px; opacity:0.18; }
  .insight-tag { display:flex; align-items:center; gap:5px; margin-bottom:12px; }
  .insight-dot { width:5px; height:5px; border-radius:50%; animation:pulse 2s ease infinite; }
  .insight-tag-text { font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; }
  .insight-val { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:900; color:var(--white); line-height:1; margin-bottom:6px; }
  .insight-desc { font-size:0.78rem; color:rgba(255,255,255,0.5); line-height:1.55; }
  .insight-desc strong { color:rgba(255,255,255,0.85); }

  .gate-wrap { position:relative; }
  .gate-blur { filter:blur(4px); opacity:0.45; pointer-events:none; user-select:none; }
  .gate-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:5; }
  .gate-panel { background:var(--ink); border-radius:20px; padding:28px 32px; text-align:center; box-shadow:0 16px 48px rgba(0,0,0,0.25); max-width:300px; animation:float 4s ease-in-out infinite; }
  .gate-emoji { font-size:2.2rem; margin-bottom:12px; }
  .gate-title { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; color:var(--white); margin-bottom:8px; }
  .gate-sub { font-size:0.8rem; color:rgba(255,255,255,0.5); line-height:1.6; margin-bottom:18px; }
  .gate-btn { background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); border:none; border-radius:10px; padding:11px 24px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:800; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 16px rgba(27,67,50,0.4); }
  .gate-btn:hover { transform:translateY(-1px); }
  .gate-note { font-size:0.72rem; color:rgba(255,255,255,0.3); margin-top:10px; }

  .empty-state { text-align:center; padding:48px 24px; color:var(--ink-subtle); }
  .empty-state-icon { font-size:2.5rem; margin-bottom:12px; }
  .empty-state-title { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; color:var(--ink); margin-bottom:6px; }
  .empty-state-sub { font-size:0.875rem; line-height:1.6; }
`;

const CAT_META = {
  food: { fill: "#40916C", light: "#D8F3DC", icon: "🍔", label: "Food" },
  transport: {
    fill: "#2D6A4F",
    light: "#B7E4C7",
    icon: "🚗",
    label: "Transport",
  },
  bills: { fill: "#D4A017", light: "#FFF3CD", icon: "🏠", label: "Bills" },
  shopping: {
    fill: "#7B52AB",
    light: "#EDE7F6",
    icon: "🛍️",
    label: "Shopping",
  },
  health: { fill: "#00838F", light: "#E0F7FA", icon: "💊", label: "Health" },
  airtime: { fill: "#1565C0", light: "#E3F2FD", icon: "📱", label: "Airtime" },
  entertainment: {
    fill: "#558B2F",
    light: "#F1F8E9",
    icon: "🎬",
    label: "Entertainment",
  },
  entertain: {
    fill: "#558B2F",
    light: "#F1F8E9",
    icon: "🎬",
    label: "Entertainment",
  },
  other: { fill: "#757575", light: "#F5F5F5", icon: "💼", label: "Other" },
};

const fmt = (n) => Number(n || 0).toLocaleString("en-NG");

function getCatMeta(cat) {
  return CAT_META[String(cat).toLowerCase()] ?? CAT_META.other;
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ data, size = 180, thickness = 32, sym = "₦" }) {
  const [hovered, setHovered] = useState(null);
  const [animated, setAnimated] = useState(false);
  const total = data.reduce((s, d) => s + d.amount, 0);
  const r = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const slices = data.reduce((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : null;
    const pct = d.amount / total;
    const start = prev ? prev.start + prev.pct : 0;
    return [...acc, { ...d, pct, start }];
  }, []);

  const toXY = (angle, radius) => {
    const rad = (angle - 0.25) * 2 * Math.PI;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };

  return (
    <div className="pie-svg-wrap">
      <svg width={size} height={size}>
        {slices.map((s, i) => {
          const meta = getCatMeta(s.cat);
          const isHov = hovered === i;
          const rr = isHov ? r + 4 : r;
          const sw = isHov ? thickness + 6 : thickness;
          const [x1, y1] = toXY(s.start, rr);
          const [x2, y2] = toXY(s.start + s.pct, rr);
          const large = s.pct > 0.5 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${rr} ${rr} 0 ${large} 1 ${x2} ${y2}`}
              fill="none"
              stroke={meta.fill}
              strokeWidth={sw}
              strokeLinecap="butt"
              style={{
                opacity: animated ? 1 : 0,
                transition: `opacity 0.4s ease ${i * 0.05}s`,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>
      <div className="pie-center-text">
        {hovered !== null ? (
          <>
            <div className="pie-center-val" style={{ fontSize: "0.95rem" }}>
              {sym}
              {fmt(slices[hovered].amount)}
            </div>
            <div className="pie-center-label">{slices[hovered].label}</div>
          </>
        ) : (
          <>
            <div className="pie-center-val">
              {sym}
              {fmt(total)}
            </div>
            <div className="pie-center-label">Total spent</div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data, sym = "₦" }) {
  const [tip, setTip] = useState(null);
  const [animated, setAnimated] = useState(false);
  const W = 560;
  const H = 200;
  const PAD = { t: 10, r: 10, b: 36, l: 44 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d.v), 1);
  const barW = (chartW / data.length) * 0.55;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.t + chartH * (1 - f),
    label: fmt(Math.round(maxVal * f)),
  }));

  return (
    <div className="bar-chart-wrap" style={{ position: "relative" }}>
      {tip && (
        <div className="bar-hover-tip" style={{ left: tip.x, top: tip.y }}>
          <strong>{tip.d}</strong> · {sym}
          {fmt(tip.v)}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: "visible" }}
      >
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={g.y}
              y2={g.y}
              stroke="var(--border)"
              strokeWidth={1}
            />
            {i > 0 && (
              <text
                x={PAD.l - 8}
                y={g.y + 4}
                textAnchor="end"
                fontSize={10}
                fill="var(--ink-subtle)"
                fontFamily="Plus Jakarta Sans"
              >
                {g.label}
              </text>
            )}
          </g>
        ))}
        {data.map((d, i) => {
          const x =
            PAD.l +
            (chartW / data.length) * i +
            (chartW / data.length - barW) / 2;
          const barH = d.v > 0 ? (d.v / maxVal) * chartH : 2;
          const y = PAD.t + chartH - barH;
          return (
            <g
              key={i}
              onMouseEnter={() =>
                setTip({ d: d.d, v: d.v, x: x + barW / 2, y })
              }
              onMouseLeave={() => setTip(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill="var(--green-light)"
                rx={4}
                style={{
                  transformOrigin: `${x + barW / 2}px ${PAD.t + chartH}px`,
                  transform: animated ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform 0.6s cubic-bezier(0.34,1.2,0.64,1) ${i * 0.03}s`,
                  opacity: d.v === 0 ? 0.3 : 1,
                }}
              />
              {i % Math.ceil(data.length / 10) === 0 && (
                <text
                  x={x + barW / 2}
                  y={H - PAD.b + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--ink-subtle)"
                  fontFamily="Plus Jakarta Sans"
                >
                  {d.d}
                </text>
              )}
            </g>
          );
        })}
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={PAD.t + chartH}
          y2={PAD.t + chartH}
          stroke="var(--border)"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}

// ── Category breakdown bars ───────────────────────────────────────────────────
function BudgetBreakdown({ data }) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="breakdown-list">
      {data.map((d, i) => {
        const meta = getCatMeta(d.cat);
        const pct = total > 0 ? Math.round((d.amount / total) * 100) : 0;
        return (
          <div key={d.cat}>
            <div className="breakdown-header">
              <div className="breakdown-name">
                <div
                  className="breakdown-icon"
                  style={{ background: meta.light }}
                >
                  {meta.icon}
                </div>
                {d.label}
              </div>
              <div className="breakdown-right">
                <div className="breakdown-amount">
                  {sym}
                  {fmt(d.amount)}
                </div>
                <div className="breakdown-pct">{pct}%</div>
              </div>
            </div>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: animated ? `${pct}%` : "0%",
                  background: meta.fill,
                  transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.06}s`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Month-over-month ──────────────────────────────────────────────────────────
function MoMChart({ data }) {
  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mom-list">
      {data.map((d, i) => {
        const prev = data[i - 1];
        const change = prev
          ? (((d.amount - prev.amount) / prev.amount) * 100).toFixed(0)
          : null;
        const pct = (d.amount / maxVal) * 100;
        return (
          <div
            key={d.month}
            className="mom-row"
            style={{
              background: d.current ? "var(--green-pale)" : "var(--bg)",
              border: d.current
                ? "1.5px solid rgba(64,145,108,0.2)"
                : "1.5px solid transparent",
            }}
          >
            <div
              className="mom-month"
              style={{ color: d.current ? "var(--green-deep)" : "var(--ink)" }}
            >
              {d.month} {d.current ? "🔴" : ""}
            </div>
            <div className="mom-bar-track">
              <div
                className="mom-bar-fill"
                style={{
                  width: animated ? `${pct}%` : "0%",
                  background: d.current
                    ? "var(--green-light)"
                    : "var(--ink-subtle)",
                  transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`,
                }}
              />
            </div>
            <div className="mom-amount">
              {sym}
              {fmt(d.amount)}
            </div>
            <div
              className="mom-change"
              style={{
                color: !change
                  ? "transparent"
                  : Number(change) > 0
                    ? "var(--red)"
                    : "var(--green-light)",
              }}
            >
              {change ? `${Number(change) > 0 ? "+" : ""}${change}%` : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const navigate = useNavigate();
  const { isPremiumOrTrial } = useAuth();
  const isPremium = isPremiumOrTrial;

  const {
    expenses = [],
    allBudgets = [],
    activeBudget,

    totalBudget = 0,
    daysLeft = 0,
    spendByDay = [],
  } = useBudget();

  // ── Category breakdown from real expenses ──────────────────────────────────
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = String(e.category || e.cat || "other").toLowerCase();
      map[cat] = (map[cat] ?? 0) + Number(e.amount || 0);
    });
    return Object.entries(map)
      .map(([cat, amount]) => ({ cat, amount, label: getCatMeta(cat).label }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // ── Daily spend from real spendByDay ──────────────────────────────────────
  const dailyData = useMemo(() => {
    return spendByDay
      .filter((d) => d.amount > 0 || true) // include all days
      .map((d) => ({
        d: new Date(d.date).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
        }),
        v: d.amount,
      }))
      .slice(-16); // last 16 days
  }, [spendByDay]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSpentCalc = expenses.reduce(
    (s, e) => s + Number(e.amount || 0),
    0,
  );
  const daysTracked = new Set(expenses.map((e) => e.date || e.expense_date))
    .size;
  const avgDaily =
    daysTracked > 0 ? Math.round(totalSpentCalc / daysTracked) : 0;
  const topCat = categoryData[0] ?? null;
  const highestDay = [...dailyData].sort((a, b) => b.v - a.v)[0] ?? null;
  const hasExpenses = expenses.length > 0;

  // ── Month-over-month from allBudgets ──────────────────────────────────────
  const momData = useMemo(() => {
    if (!allBudgets.length) return [];
    return allBudgets
      .slice(0, 3)
      .reverse()
      .map((b, i, arr) => ({
        month:
          b.name ||
          new Date(b.start_date).toLocaleDateString("en-NG", { month: "long" }),
        amount: Number(b.spent || 0),
        budget: Number(b.total_amount || b.amount || 0),
        current: b.is_active || i === arr.length - 1,
      }));
  }, [allBudgets]);

  // ── Auto-generated insights from real data ────────────────────────────────
  const insights = useMemo(() => {
    if (!hasExpenses) return [];
    const list = [];

    // Top category insight
    if (topCat) {
      const pct =
        totalSpentCalc > 0
          ? Math.round((topCat.amount / totalSpentCalc) * 100)
          : 0;
      list.push({
        glow: "#40916C",
        dot: "var(--green-light)",
        tag: `${getCatMeta(topCat.cat).icon} ${topCat.label}`,
        tagColor: "var(--green-light)",
        val: `${pct}%`,
        desc: `${topCat.label} is your biggest spending category at <strong>${sym}${fmt(topCat.amount)}</strong> — ${pct}% of your total spend.`,
      });
    }

    // Budget pace insight
    if (activeBudget && totalBudget > 0) {
      const pctUsed = Math.round((totalSpentCalc / totalBudget) * 100);
      const remaining = totalBudget - totalSpentCalc;
      list.push({
        glow: "#D4A017",
        dot: "var(--amber)",
        tag: "📊 Budget pace",
        tagColor: "var(--amber)",
        val: `${pctUsed}%`,
        desc: `You've used <strong>${pctUsed}% of your budget</strong>. ${sym}${fmt(Math.max(0, remaining))} remaining with ${daysLeft} days left.`,
      });
    }

    // Avg daily insight
    if (daysTracked > 0) {
      list.push({
        glow: "rgba(27,67,50,0.8)",
        dot: "rgba(255,255,255,0.5)",
        tag: "💡 Daily average",
        tagColor: "rgba(255,255,255,0.5)",
        val: `${sym}${fmt(avgDaily)}`,
        desc: `Your average daily spend over <strong>${daysTracked} days</strong> is ${sym}${fmt(avgDaily)}. At this rate, monthly spend will be ${sym}${fmt(avgDaily * 30)}.`,
      });
    }

    return list.slice(0, 3);
  }, [
    hasExpenses,
    topCat,
    totalSpentCalc,
    activeBudget,
    totalBudget,
    daysLeft,
    daysTracked,
    avgDaily,
  ]);

  const emptyChart = (
    <div className="empty-state">
      <div className="empty-state-icon">📊</div>
      <div className="empty-state-title">No data yet</div>
      <p className="empty-state-sub">Add some expenses to see your insights.</p>
    </div>
  );

  return (
    <>
      <style>{FONTS + styles}</style>
      <div className="page">
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="page-title">Insights</div>
            <div className="page-sub">
              Deep-dive into your spending patterns
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="stat-strip">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#D8F3DC" }}>
              💸
            </div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-val red">
              {sym}
              {fmt(totalSpentCalc)}
            </div>
            <div className="stat-change">{expenses.length} transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#FFF3E0" }}>
              📅
            </div>
            <div className="stat-label">Daily Average</div>
            <div className="stat-val amber">
              {sym}
              {fmt(avgDaily)}
            </div>
            <div className="stat-change">{daysTracked} days tracked</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#E8F5E9" }}>
              🏆
            </div>
            <div className="stat-label">Top Category</div>
            <div className="stat-val green">
              {topCat ? `${getCatMeta(topCat.cat).icon} ${topCat.label}` : "—"}
            </div>
            <div className="stat-change">
              {topCat ? `${sym}${fmt(topCat.amount)} spent` : "No data yet"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#FCE4EC" }}>
              📈
            </div>
            <div className="stat-label">Biggest Day</div>
            <div className="stat-val">{highestDay ? highestDay.d : "—"}</div>
            <div className="stat-change">
              {highestDay ? `${sym}${fmt(highestDay.v)} spent` : "No data yet"}
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="two-col">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Spending by Category</div>
                <div className="chart-sub">Where your money is going</div>
              </div>
              <span className="pro-tag">✦ Premium</span>
            </div>
            <div className="chart-body">
              {isPremium ? (
                categoryData.length > 0 ? (
                  <div className="pie-wrap">
                    <DonutChart
                      data={categoryData}
                      size={190}
                      thickness={36}
                      sym={sym}
                    />
                    <div className="pie-legend">
                      {categoryData.map((d, i) => {
                        const meta = getCatMeta(d.cat);
                        const pct =
                          totalSpentCalc > 0
                            ? Math.round((d.amount / totalSpentCalc) * 100)
                            : 0;
                        return (
                          <div key={i} className="legend-row">
                            <div
                              className="legend-dot"
                              style={{ background: meta.fill }}
                            />
                            <div className="legend-name">{d.label}</div>
                            <div className="legend-right">
                              <div className="legend-val">
                                {sym}
                                {fmt(d.amount)}
                              </div>
                              <div className="legend-pct">{pct}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  emptyChart
                )
              ) : (
                <div className="gate-wrap" style={{ minHeight: 260 }}>
                  <div className="gate-blur" style={{ padding: 20 }}>
                    {categoryData.length > 0 && (
                      <DonutChart
                        data={categoryData}
                        size={190}
                        thickness={36}
                        sym={sym}
                      />
                    )}
                  </div>
                  <div className="gate-overlay">
                    <div className="gate-panel">
                      <div className="gate-emoji">🥧</div>
                      <div className="gate-title">Category Breakdown</div>
                      <div className="gate-sub">
                        See exactly where your money goes with an interactive
                        chart.
                      </div>
                      <button
                        className="gate-btn"
                        onClick={() => navigate("/upgrade")}
                      >
                        Unlock Insights
                      </button>
                      <div className="gate-note">Premium</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Daily Spend</div>
                <div className="chart-sub">Last 30 days</div>
              </div>
              <span className="pro-tag">✦ Premium</span>
            </div>
            <div className="chart-body">
              {isPremium ? (
                dailyData.length > 0 ? (
                  <BarChart data={dailyData} sym={sym} />
                ) : (
                  emptyChart
                )
              ) : (
                <div className="gate-wrap" style={{ minHeight: 220 }}>
                  <div className="gate-blur" style={{ padding: 20 }}>
                    {dailyData.length > 0 && (
                      <BarChart data={dailyData} sym={sym} />
                    )}
                  </div>
                  <div className="gate-overlay">
                    <div className="gate-panel">
                      <div className="gate-emoji">📊</div>
                      <div className="gate-title">Daily Spend Chart</div>
                      <div className="gate-sub">
                        Track your spending day by day.
                      </div>
                      <button
                        className="gate-btn"
                        onClick={() => navigate("/upgrade")}
                      >
                        Unlock Insights
                      </button>
                      <div className="gate-note">Premium</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown + MoM */}
        <div
          className="two-col"
          style={{ animation: "fadeUp 0.35s ease 0.14s both" }}
        >
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Budget Breakdown</div>
                <div className="chart-sub">Spending share per category</div>
              </div>
            </div>
            <div className="chart-body">
              {isPremium ? (
                categoryData.length > 0 ? (
                  <BudgetBreakdown data={categoryData} />
                ) : (
                  emptyChart
                )
              ) : (
                <div className="gate-wrap" style={{ minHeight: 260 }}>
                  <div className="gate-blur">
                    {categoryData.length > 0 && (
                      <BudgetBreakdown data={categoryData.slice(0, 3)} />
                    )}
                  </div>
                  <div className="gate-overlay">
                    <div className="gate-panel">
                      <div className="gate-emoji">📋</div>
                      <div className="gate-title">Budget Breakdown</div>
                      <div className="gate-sub">
                        Full category-by-category breakdown of your spend.
                      </div>
                      <button
                        className="gate-btn"
                        onClick={() => navigate("/upgrade")}
                      >
                        Unlock Insights
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Month-over-Month</div>
                <div className="chart-sub">Compare your recent budgets</div>
              </div>
            </div>
            <div className="chart-body">
              {momData.length > 0 ? <MoMChart data={momData} /> : emptyChart}
            </div>
          </div>
        </div>

        {/* AI Insights strip */}
        {insights.length > 0 && (
          <div className="insight-strip">
            {insights.map((ins, i) => (
              <div key={i} className="insight-card">
                <div
                  className="insight-glow"
                  style={{ background: ins.glow }}
                />
                <div className="insight-tag">
                  <div
                    className="insight-dot"
                    style={{ background: ins.dot }}
                  />
                  <span
                    className="insight-tag-text"
                    style={{ color: ins.tagColor }}
                  >
                    {ins.tag}
                  </span>
                </div>
                <div className="insight-val">{ins.val}</div>
                <div
                  className="insight-desc"
                  dangerouslySetInnerHTML={{ __html: ins.desc }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
