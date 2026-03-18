import { useState, useEffect } from "react";
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
  }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes drawLine  { from{stroke-dashoffset:var(--len)} to{stroke-dashoffset:0} }
  @keyframes barRise   { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }
  @keyframes arcSpin   { from{stroke-dashoffset:var(--full)} to{stroke-dashoffset:var(--offset)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

  .page { display:flex; flex-direction:column; gap:28px; animation:fadeIn 0.3s ease; }

  /* ── HEADER ──────────────────────────── */
  .page-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:14px; animation:fadeUp 0.35s ease; }
  .page-title  { font-family:'Playfair Display',serif; font-size:1.75rem; font-weight:800; color:var(--ink); letter-spacing:-0.015em; }
  .page-sub    { font-size:0.875rem; color:var(--ink-subtle); margin-top:4px; }
  .period-tabs { display:flex; background:var(--cream-dark); border-radius:12px; padding:4px; gap:3px; }
  .period-tab  { padding:8px 16px; border-radius:9px; border:none; background:transparent; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.82rem; font-weight:600; color:var(--ink-subtle); cursor:pointer; transition:all 0.2s; }
  .period-tab.active { background:var(--white); color:var(--ink); box-shadow:0 2px 8px rgba(0,0,0,0.08); }

  /* ── STAT STRIP ──────────────────────── */
  .stat-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; animation:fadeUp 0.35s ease 0.04s both; }
  @media(max-width:800px){ .stat-strip{ grid-template-columns:repeat(2,1fr); } }
  .stat-card { background:var(--white); border-radius:18px; padding:20px; border:1.5px solid var(--border); transition:all 0.2s; }
  .stat-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.07); transform:translateY(-2px); }
  .stat-icon  { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; margin-bottom:12px; }
  .stat-val   { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:900; color:var(--ink); line-height:1; }
  .stat-val.green  { color:var(--green-mid); }
  .stat-val.amber  { color:var(--amber); }
  .stat-val.red    { color:var(--red); }
  .stat-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-subtle); margin-bottom:6px; }
  .stat-change { font-size:0.72rem; margin-top:6px; font-weight:600; }
  .stat-change.up   { color:var(--green-light); }
  .stat-change.down { color:var(--red); }
  .stat-change.flat { color:var(--ink-subtle); }

  /* ── CHART CARD ──────────────────────── */
  .chart-card { background:var(--white); border-radius:20px; border:1.5px solid var(--border); overflow:hidden; }
  .chart-header { padding:22px 24px 0; display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
  .chart-title { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:var(--ink); }
  .chart-sub   { font-size:0.75rem; color:var(--ink-subtle); margin-top:2px; }
  .chart-body  { padding:0 24px 24px; }
  .pro-tag { display:inline-flex; align-items:center; gap:4px; background:var(--amber-pale); color:var(--amber); font-size:0.65rem; font-weight:800; padding:3px 9px; border-radius:100px; border:1px solid rgba(212,160,23,0.2); text-transform:uppercase; letter-spacing:0.06em; }

  /* ── TWO-COL ─────────────────────────── */
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; animation:fadeUp 0.35s ease 0.08s both; }
  @media(max-width:900px){ .two-col{ grid-template-columns:1fr; } }
  .three-col { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; animation:fadeUp 0.35s ease 0.12s both; }
  @media(max-width:900px){ .three-col{ grid-template-columns:1fr; } }

  /* ── PIE CHART ───────────────────────── */
  .pie-wrap  { display:flex; gap:28px; align-items:center; flex-wrap:wrap; }
  .pie-svg-wrap { position:relative; flex-shrink:0; }
  .pie-center-text { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; }
  .pie-center-val  { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:900; color:var(--ink); }
  .pie-center-label{ font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--ink-subtle); }
  .pie-legend { flex:1; display:flex; flex-direction:column; gap:10px; min-width:160px; }
  .legend-row { display:flex; align-items:center; gap:10px; cursor:pointer; padding:6px 8px; border-radius:9px; transition:background 0.18s; }
  .legend-row:hover { background:var(--bg); }
  .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .legend-name  { flex:1; font-size:0.82rem; font-weight:600; color:var(--ink-muted); }
  .legend-right { text-align:right; }
  .legend-val   { font-size:0.82rem; font-weight:800; color:var(--ink); font-family:'Playfair Display',serif; }
  .legend-pct   { font-size:0.68rem; color:var(--ink-subtle); }

  /* ── BAR CHART ───────────────────────── */
  .bar-chart-wrap { position:relative; }
  .bar-chart-svg  { overflow:visible; }
  .bar-hover-tip  {
    position:absolute; background:var(--ink); color:var(--white);
    padding:7px 12px; border-radius:9px; font-size:0.75rem; font-weight:600;
    pointer-events:none; white-space:nowrap; z-index:10;
    box-shadow:0 4px 16px rgba(0,0,0,0.2);
    transform:translate(-50%,-100%); margin-top:-8px;
  }
  .bar-hover-tip::after { content:""; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:5px solid transparent; border-top-color:var(--ink); }

  /* ── LINE CHART ──────────────────────── */
  .line-chart-wrap { position:relative; overflow:visible; }
  .line-dot-tip {
    position:absolute; background:var(--ink); color:var(--white);
    padding:6px 11px; border-radius:8px; font-size:0.72rem; font-weight:600;
    pointer-events:none; white-space:nowrap; z-index:10;
    box-shadow:0 4px 14px rgba(0,0,0,0.18);
    transform:translate(-50%,-100%); margin-top:-10px;
  }

  /* ── BUDGET BREAKDOWN ────────────────── */
  .breakdown-list { display:flex; flex-direction:column; gap:14px; }
  .breakdown-row  { }
  .breakdown-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; }
  .breakdown-name  { display:flex; align-items:center; gap:9px; font-size:0.875rem; font-weight:700; color:var(--ink); }
  .breakdown-icon  { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:0.85rem; }
  .breakdown-right { text-align:right; }
  .breakdown-amount { font-family:'Playfair Display',serif; font-size:0.9rem; font-weight:800; color:var(--ink); }
  .breakdown-pct   { font-size:0.7rem; color:var(--ink-subtle); }
  .breakdown-bar-track { background:var(--cream-dark); border-radius:100px; height:7px; overflow:hidden; }
  .breakdown-bar-fill  { height:100%; border-radius:100px; transition:width 1s cubic-bezier(0.4,0,0.2,1); }

  /* ── MOM COMPARISON ──────────────────── */
  .mom-list { display:flex; flex-direction:column; gap:8px; }
  .mom-row  { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:12px; background:var(--bg); }
  .mom-month { font-size:0.8rem; font-weight:700; color:var(--ink); min-width:90px; }
  .mom-bar-track { flex:1; background:var(--cream-dark); border-radius:100px; height:8px; overflow:hidden; }
  .mom-bar-fill  { height:100%; border-radius:100px; }
  .mom-amount { font-family:'Playfair Display',serif; font-size:0.88rem; font-weight:800; color:var(--ink); min-width:80px; text-align:right; }
  .mom-change { font-size:0.7rem; font-weight:700; min-width:48px; text-align:right; }

  /* ── INSIGHT CARDS ───────────────────── */
  .insight-strip { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; animation:fadeUp 0.35s ease 0.16s both; }
  @media(max-width:900px){ .insight-strip{ grid-template-columns:1fr; } }
  .insight-card  { background:var(--ink); border-radius:18px; padding:22px; border:1px solid rgba(255,255,255,0.07); position:relative; overflow:hidden; }
  .insight-glow  { position:absolute; width:150px; height:150px; border-radius:50%; filter:blur(50px); pointer-events:none; top:-40px; right:-40px; opacity:0.18; }
  .insight-tag   { display:flex; align-items:center; gap:5px; margin-bottom:12px; }
  .insight-dot   { width:5px; height:5px; border-radius:50%; animation:pulse 2s ease infinite; }
  .insight-tag-text { font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; }
  .insight-val   { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:900; color:var(--white); line-height:1; margin-bottom:6px; }
  .insight-desc  { font-size:0.78rem; color:rgba(255,255,255,0.5); line-height:1.55; }
  .insight-desc strong { color:rgba(255,255,255,0.85); }

  /* ── PREMIUM GATE ────────────────────── */
  .gate-wrap    { position:relative; }
  .gate-blur    { filter:blur(4px); opacity:0.45; pointer-events:none; user-select:none; }
  .gate-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:5; }
  .gate-panel   {
    background:var(--ink); border-radius:20px; padding:28px 32px; text-align:center;
    box-shadow:0 16px 48px rgba(0,0,0,0.25); max-width:300px;
    animation:float 4s ease-in-out infinite;
  }
  .gate-emoji  { font-size:2.2rem; margin-bottom:12px; }
  .gate-title  { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; color:var(--white); margin-bottom:8px; }
  .gate-sub    { font-size:0.8rem; color:rgba(255,255,255,0.5); line-height:1.6; margin-bottom:18px; }
  .gate-btn    { background:linear-gradient(135deg,var(--green-deep),var(--green-light)); color:var(--white); border:none; border-radius:10px; padding:11px 24px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:800; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 16px rgba(27,67,50,0.4); }
  .gate-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(27,67,50,0.5); }
  .gate-note   { font-size:0.72rem; color:rgba(255,255,255,0.3); margin-top:10px; }
`;

// ── Palette ───────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  food: { fill: "#40916C", light: "#D8F3DC", icon: "🍔" },
  transport: { fill: "#2D6A4F", light: "#B7E4C7", icon: "🚗" },
  bills: { fill: "#D4A017", light: "#FFF3CD", icon: "🏠" },
  shopping: { fill: "#7B52AB", light: "#EDE7F6", icon: "🛍️" },
  health: { fill: "#00838F", light: "#E0F7FA", icon: "💊" },
  airtime: { fill: "#1565C0", light: "#E3F2FD", icon: "📱" },
  entertain: { fill: "#558B2F", light: "#F1F8E9", icon: "🎬" },
  other: { fill: "#757575", light: "#F5F5F5", icon: "💼" },
};

const SPENDING = [
  { cat: "food", label: "Food & Dining", amount: 28700 },
  { cat: "bills", label: "Bills & Rent", amount: 15000 },
  { cat: "transport", label: "Transport", amount: 22100 },
  { cat: "shopping", label: "Shopping", amount: 22000 },
  { cat: "entertain", label: "Entertainment", amount: 14300 },
  { cat: "health", label: "Health", amount: 3500 },
  { cat: "airtime", label: "Airtime / Data", amount: 4500 },
  { cat: "other", label: "Other", amount: 2300 },
];

const DAILY_SPEND = [
  { d: "Mar 1", v: 8200 },
  { d: "Mar 2", v: 1500 },
  { d: "Mar 3", v: 3000 },
  { d: "Mar 4", v: 2100 },
  { d: "Mar 5", v: 1900 },
  { d: "Mar 6", v: 6500 },
  { d: "Mar 7", v: 3500 },
  { d: "Mar 8", v: 22000 },
  { d: "Mar 9", v: 8500 },
  { d: "Mar 10", v: 15000 },
  { d: "Mar 11", v: 0 },
  { d: "Mar 12", v: 5200 },
  { d: "Mar 13", v: 3000 },
  { d: "Mar 14", v: 18500 },
  { d: "Mar 15", v: 7600 },
  { d: "Mar 16", v: 7300 },
];

const MOM = [
  { month: "January", amount: 148200, budget: 160000 },
  { month: "February", amount: 165000, budget: 165000 },
  { month: "March", amount: 112400, budget: 180000, current: true },
];

const fmt = (n) => Number(n).toLocaleString("en-NG");

// ── Donut chart (pure SVG) ────────────────────────────────────────────────────
function DonutChart({ data, size = 180, thickness = 32 }) {
  const [hovered, setHovered] = useState(null);
  const [animated, setAnimated] = useState(false);
  const total = data.reduce((s, d) => s + d.amount, 0);
  const r = size / 2 - thickness / 2;
  const _circ = 2 * Math.PI * r;
  const cx = size / 2,
    cy = size / 2;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Calculate slices outside render cycle using reduce (avoids reassignment lint error)
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
          const color = CAT_COLORS[s.cat]?.fill ?? "#999";
          const startAngle = s.start;
          const endAngle = s.start + s.pct;
          const large = s.pct > 0.5 ? 1 : 0;
          const [_x1, _y1] = toXY(startAngle, r);
          const [_x2, _y2] = toXY(endAngle, r);
          const isHov = hovered === i;
          const rr = isHov ? r + 4 : r;
          const [hx1, hy1] = toXY(startAngle, rr);
          const [hx2, hy2] = toXY(endAngle, rr);
          const sw = isHov ? thickness + 6 : thickness;

          return (
            <path
              key={i}
              d={`M ${hx1} ${hy1} A ${rr} ${rr} 0 ${large} 1 ${hx2} ${hy2}`}
              fill="none"
              stroke={color}
              strokeWidth={sw}
              strokeLinecap="butt"
              style={{
                opacity: animated ? 1 : 0,
                transition: `opacity 0.4s ease ${i * 0.05}s, stroke-width 0.2s, d 0.2s`,
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
              ₦{fmt(slices[hovered].amount)}
            </div>
            <div className="pie-center-label">
              {slices[hovered].label.split(" ")[0]}
            </div>
          </>
        ) : (
          <>
            <div className="pie-center-val">₦{fmt(total)}</div>
            <div className="pie-center-label">Total spent</div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Bar chart (pure SVG) ──────────────────────────────────────────────────────
function BarChart({ data }) {
  const [tip, setTip] = useState(null);
  const [animated, setAnimated] = useState(false);
  const W = 560,
    H = 200,
    PAD = { t: 10, r: 10, b: 36, l: 44 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d.v));
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
          <strong>{tip.d}</strong> · ₦{fmt(tip.v)}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="bar-chart-svg"
        style={{ overflow: "visible" }}
      >
        {/* Grid */}
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

        {/* Bars */}
        {data.map((d, i) => {
          const x =
            PAD.l +
            (chartW / data.length) * i +
            (chartW / data.length - barW) / 2;
          const barH = d.v > 0 ? (d.v / maxVal) * chartH : 2;
          const y = PAD.t + chartH - barH;
          const isWeekend = i % 7 === 5 || i % 7 === 6;

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
                fill={isWeekend ? "var(--amber)" : "var(--green-light)"}
                rx={4}
                style={{
                  transformOrigin: `${x + barW / 2}px ${PAD.t + chartH}px`,
                  transform: animated ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform 0.6s cubic-bezier(0.34,1.2,0.64,1) ${i * 0.03}s`,
                  opacity: d.v === 0 ? 0.3 : 1,
                }}
              />
              {i % 3 === 0 && (
                <text
                  x={x + barW / 2}
                  y={H - PAD.b + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--ink-subtle)"
                  fontFamily="Plus Jakarta Sans"
                >
                  {d.d.replace("Mar ", "")}
                </text>
              )}
            </g>
          );
        })}

        {/* X axis */}
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

// ── Line / area chart (pure SVG) ──────────────────────────────────────────────
function LineChart({ data }) {
  const [tip, setTip] = useState(null);
  const [animated, setAnimated] = useState(false);
  const W = 560,
    H = 180,
    PAD = { t: 16, r: 16, b: 32, l: 48 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d.v)) * 1.15;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const pts = data.map((d, i) => ({
    x: PAD.l + (chartW / (data.length - 1)) * i,
    y: PAD.t + chartH - (d.v / maxVal) * chartH,
    ...d,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PAD.t + chartH} L ${pts[0].x} ${PAD.t + chartH} Z`;

  const pathLen = 1200; // approximate

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.t + chartH * (1 - f),
    label: f > 0 ? fmt(Math.round(maxVal * f)) : "0",
  }));

  return (
    <div className="line-chart-wrap" style={{ position: "relative" }}>
      {tip && (
        <div className="line-dot-tip" style={{ left: tip.x, top: tip.y }}>
          {tip.d} · ₦{fmt(tip.v)}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--green-light)"
              stopOpacity="0.2"
            />
            <stop
              offset="100%"
              stopColor="var(--green-light)"
              stopOpacity="0.01"
            />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--green-deep)" />
            <stop offset="100%" stopColor="var(--green-light)" />
          </linearGradient>
        </defs>

        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={g.y}
              y2={g.y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray={i === 0 ? "none" : "4 4"}
            />
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
          </g>
        ))}

        {/* Area */}
        <path
          d={areaPath}
          fill="url(#areaGrad)"
          style={{
            opacity: animated ? 1 : 0,
            transition: "opacity 0.8s ease 0.4s",
          }}
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth={2.5}
          strokeDasharray={pathLen}
          strokeDashoffset={animated ? 0 : pathLen}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {pts.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setTip(p)}
            onMouseLeave={() => setTip(null)}
            style={{ cursor: "pointer" }}
          >
            <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r={tip?.d === p.d ? 5 : 3}
              fill={tip?.d === p.d ? "var(--green-deep)" : "var(--green-light)"}
              stroke="var(--white)"
              strokeWidth={2}
              style={{
                opacity: animated ? 1 : 0,
                transition: `opacity 0.4s ease ${0.6 + i * 0.04}s, r 0.15s`,
              }}
            />
          </g>
        ))}

        {/* X labels */}
        {pts
          .filter((_, i) => i % 4 === 0)
          .map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={H - PAD.b + 14}
              textAnchor="middle"
              fontSize={10}
              fill="var(--ink-subtle)"
              fontFamily="Plus Jakarta Sans"
            >
              {p.d.replace("Mar ", "")}
            </text>
          ))}
      </svg>
    </div>
  );
}

// ── Budget breakdown ──────────────────────────────────────────────────────────
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
        const c = CAT_COLORS[d.cat];
        const pct = Math.round((d.amount / total) * 100);
        return (
          <div key={d.cat} className="breakdown-row">
            <div className="breakdown-header">
              <div className="breakdown-name">
                <div className="breakdown-icon" style={{ background: c.light }}>
                  {c.icon}
                </div>
                {d.label}
              </div>
              <div className="breakdown-right">
                <div className="breakdown-amount">₦{fmt(d.amount)}</div>
                <div className="breakdown-pct">{pct}%</div>
              </div>
            </div>
            <div className="breakdown-bar-track">
              <div
                className="breakdown-bar-fill"
                style={{
                  width: animated ? `${pct}%` : "0%",
                  background: c.fill,
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
  const maxVal = Math.max(...data.map((d) => d.budget));
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
        const color = d.current ? "var(--green-light)" : "var(--ink-subtle)";

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
                  background: color,
                  transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`,
                }}
              />
            </div>
            <div className="mom-amount">₦{fmt(d.amount)}</div>
            <div
              className="mom-change"
              style={{
                color:
                  change === null
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const { isPremiumOrTrial } = useAuth();
  const isPremium = isPremiumOrTrial; // swap with useAuth().isPremiumOrTrial — set true to preview all charts
  const [period, setPeriod] = useState("This Month");
  const total = SPENDING.reduce((s, d) => s + d.amount, 0);
  const avgDaily = Math.round(
    DAILY_SPEND.reduce((s, d) => s + d.v, 0) /
      DAILY_SPEND.filter((d) => d.v > 0).length,
  );
  const topCat = [...SPENDING].sort((a, b) => b.amount - a.amount)[0];
  const highestDay = [...DAILY_SPEND].sort((a, b) => b.v - a.v)[0];

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
          <div className="period-tabs">
            {["This Month", "Last 3 Months", "This Year"].map((p) => (
              <button
                key={p}
                className={`period-tab${period === p ? " active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stat strip */}
        <div className="stat-strip">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#D8F3DC" }}>
              💸
            </div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-val red">₦{fmt(total)}</div>
            <div className="stat-change down">↑ 12% vs last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#FFF3E0" }}>
              📅
            </div>
            <div className="stat-label">Daily Average</div>
            <div className="stat-val amber">₦{fmt(avgDaily)}</div>
            <div className="stat-change flat">16 days tracked</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#E8F5E9" }}>
              🏆
            </div>
            <div className="stat-label">Top Category</div>
            <div className="stat-val green">
              {CAT_COLORS[topCat.cat].icon} {topCat.label.split(" ")[0]}
            </div>
            <div className="stat-change down">₦{fmt(topCat.amount)} spent</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#FCE4EC" }}>
              📈
            </div>
            <div className="stat-label">Biggest Day</div>
            <div className="stat-val">{highestDay.d}</div>
            <div className="stat-change down">₦{fmt(highestDay.v)} spent</div>
          </div>
        </div>

        {/* Pie + Bar row */}
        <div className="two-col">
          {/* Pie */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Spending by Category</div>
                <div className="chart-sub">
                  Where your money is going this month
                </div>
              </div>
              <span className="pro-tag">✦ Premium</span>
            </div>
            <div className="chart-body">
              {isPremium ? (
                <div className="pie-wrap">
                  <DonutChart data={SPENDING} size={190} thickness={36} />
                  <div className="pie-legend">
                    {SPENDING.map((d, i) => {
                      const c = CAT_COLORS[d.cat];
                      const pct = Math.round((d.amount / total) * 100);
                      return (
                        <div key={i} className="legend-row">
                          <div
                            className="legend-dot"
                            style={{ background: c.fill }}
                          />
                          <div className="legend-name">{d.label}</div>
                          <div className="legend-right">
                            <div className="legend-val">₦{fmt(d.amount)}</div>
                            <div className="legend-pct">{pct}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="gate-wrap" style={{ minHeight: 260 }}>
                  <div className="gate-blur" style={{ padding: 20 }}>
                    <div className="pie-wrap">
                      <DonutChart data={SPENDING} size={190} thickness={36} />
                    </div>
                  </div>
                  <div className="gate-overlay">
                    <div className="gate-panel">
                      <div className="gate-emoji">🥧</div>
                      <div className="gate-title">Category Breakdown</div>
                      <div className="gate-sub">
                        See exactly where your money goes with an interactive
                        pie chart breakdown.
                      </div>
                      <button className="gate-btn">Unlock Insights</button>
                      <div className="gate-note">Premium · ₦6,500/mo</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bar */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Daily Spend</div>
                <div className="chart-sub">March 1–16 · 🟡 = weekend</div>
              </div>
              <span className="pro-tag">✦ Premium</span>
            </div>
            <div className="chart-body">
              {isPremium ? (
                <BarChart data={DAILY_SPEND} />
              ) : (
                <div className="gate-wrap" style={{ minHeight: 220 }}>
                  <div className="gate-blur" style={{ padding: 20 }}>
                    <BarChart data={DAILY_SPEND} />
                  </div>
                  <div className="gate-overlay">
                    <div className="gate-panel">
                      <div className="gate-emoji">📊</div>
                      <div className="gate-title">Daily Spend Chart</div>
                      <div className="gate-sub">
                        Track your spending day by day and spot your most
                        expensive days.
                      </div>
                      <button className="gate-btn">Unlock Insights</button>
                      <div className="gate-note">Premium · ₦6,500/mo</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line trend */}
        <div
          className="chart-card"
          style={{ animation: "fadeUp 0.35s ease 0.1s both" }}
        >
          <div className="chart-header">
            <div>
              <div className="chart-title">Spending Trend</div>
              <div className="chart-sub">
                Cumulative daily spend over March · hover for details
              </div>
            </div>
            <span className="pro-tag">✦ Premium</span>
          </div>
          <div className="chart-body">
            {isPremium ? (
              <LineChart data={DAILY_SPEND} />
            ) : (
              <div className="gate-wrap" style={{ minHeight: 200 }}>
                <div className="gate-blur" style={{ padding: 20 }}>
                  <LineChart data={DAILY_SPEND} />
                </div>
                <div className="gate-overlay">
                  <div className="gate-panel">
                    <div className="gate-emoji">📈</div>
                    <div className="gate-title">Trend Line Chart</div>
                    <div className="gate-sub">
                      See how your spending evolves over the month with an
                      animated trend line.
                    </div>
                    <button className="gate-btn">Unlock Insights</button>
                    <div className="gate-note">Premium · ₦6,500/mo</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Budget breakdown + MoM */}
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
                <BudgetBreakdown data={SPENDING} />
              ) : (
                <div className="gate-wrap" style={{ minHeight: 260 }}>
                  <div className="gate-blur">
                    <BudgetBreakdown data={SPENDING.slice(0, 3)} />
                  </div>
                  <div className="gate-overlay">
                    <div className="gate-panel">
                      <div className="gate-emoji">📋</div>
                      <div className="gate-title">Budget Breakdown</div>
                      <div className="gate-sub">
                        Full category-by-category breakdown of your monthly
                        spend.
                      </div>
                      <button className="gate-btn">Unlock Insights</button>
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
                <div className="chart-sub">Compare your last 3 months</div>
              </div>
            </div>
            <div className="chart-body">
              <MoMChart data={MOM} />
            </div>
          </div>
        </div>

        {/* Insight cards */}
        <div className="insight-strip">
          <div className="insight-card">
            <div
              className="insight-glow"
              style={{ background: "rgba(64,145,108,0.8)" }}
            />
            <div className="insight-tag">
              <div
                className="insight-dot"
                style={{ background: "var(--green-light)" }}
              />
              <span
                className="insight-tag-text"
                style={{ color: "var(--green-light)" }}
              >
                🍔 Food
              </span>
            </div>
            <div className="insight-val">28%</div>
            <div className="insight-desc">
              Food is your biggest category at <strong>₦28,700</strong>. That's
              ₦8,200 above the recommended 20% budget allocation.
            </div>
          </div>
          <div className="insight-card">
            <div
              className="insight-glow"
              style={{ background: "rgba(212,160,23,0.8)" }}
            />
            <div className="insight-tag">
              <div
                className="insight-dot"
                style={{ background: "var(--amber)" }}
              />
              <span
                className="insight-tag-text"
                style={{ color: "var(--amber)" }}
              >
                📅 Weekend spend
              </span>
            </div>
            <div className="insight-val">₦29,000</div>
            <div className="insight-desc">
              You spent <strong>₦29,000 over 2 weekends</strong> — that's 26% of
              your monthly budget in just 4 days.
            </div>
          </div>
          <div className="insight-card">
            <div
              className="insight-glow"
              style={{ background: "rgba(27,67,50,0.8)" }}
            />
            <div className="insight-tag">
              <div
                className="insight-dot"
                style={{ background: "rgba(255,255,255,0.5)" }}
              />
              <span
                className="insight-tag-text"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                💡 Opportunity
              </span>
            </div>
            <div className="insight-val">₦18,200</div>
            <div className="insight-desc">
              Cutting food delivery by half and skipping one shopping trip could
              save you <strong>₦18,200</strong> this month.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
