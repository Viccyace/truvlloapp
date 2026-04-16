import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ADMIN_ID = "7ec55e7e-6270-436c-bfc9-323ea8971e7a";

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .admin { min-height: 100vh; background: #0A0A0A; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

  /* NAV */
  .admin-nav { height: 64px; border-bottom: 1px solid rgba(250,248,243,0.08); padding: 0 40px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: rgba(10,10,10,0.9); backdrop-filter: blur(12px); z-index: 50; }
  .admin-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #FAF8F3; display: flex; align-items: center; gap: 8px; }
  .admin-logo-dot { width: 7px; height: 7px; border-radius: 50%; background: #D4A017; }
  .admin-badge { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(212,160,23,0.15); color: #D4A017; border: 1px solid rgba(212,160,23,0.3); border-radius: 100px; padding: 3px 10px; }
  .admin-back { font-size: 0.8rem; color: rgba(250,248,243,0.4); background: none; border: 1px solid rgba(250,248,243,0.1); border-radius: 8px; padding: 7px 16px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
  .admin-back:hover { color: #FAF8F3; border-color: rgba(250,248,243,0.2); }

  /* BODY */
  .admin-body { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }

  /* PAGE HEADER */
  .admin-header { margin-bottom: 40px; }
  .admin-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; color: #FAF8F3; letter-spacing: -0.025em; margin-bottom: 8px; }
  .admin-title em { font-style: italic; color: #52B788; }
  .admin-sub { font-size: 0.875rem; color: rgba(250,248,243,0.35); }
  .admin-updated { font-size: 0.75rem; color: rgba(250,248,243,0.25); margin-top: 4px; }

  /* SECTION LABEL */
  .section-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(250,248,243,0.25); margin-bottom: 16px; margin-top: 40px; }

  /* METRIC CARDS */
  .metrics-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  @media(max-width:900px) { .metrics-grid { grid-template-columns: repeat(3,1fr); } }
  @media(max-width:600px) { .metrics-grid { grid-template-columns: repeat(2,1fr); } }
  .metric-card { background: rgba(250,248,243,0.04); border: 1px solid rgba(250,248,243,0.07); border-radius: 16px; padding: 20px 18px; position: relative; overflow: hidden; }
  .metric-card.highlight { border-color: rgba(212,160,23,0.3); background: rgba(212,160,23,0.06); }
  .metric-card.green { border-color: rgba(64,145,108,0.3); background: rgba(64,145,108,0.06); }
  .metric-label { font-size: 0.72rem; font-weight: 600; color: rgba(250,248,243,0.35); letter-spacing: 0.04em; margin-bottom: 10px; }
  .metric-value { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: #FAF8F3; line-height: 1; }
  .metric-value.amber { color: #D4A017; }
  .metric-value.green { color: #52B788; }
  .metric-sub { font-size: 0.7rem; color: rgba(250,248,243,0.25); margin-top: 6px; }
  .metric-trend { font-size: 0.72rem; font-weight: 700; margin-top: 6px; }
  .trend-up { color: #52B788; }
  .trend-down { color: #E57373; }

  /* TABLE */
  .table-card { background: rgba(250,248,243,0.03); border: 1px solid rgba(250,248,243,0.07); border-radius: 16px; overflow: hidden; }
  .table-header { padding: 16px 20px; border-bottom: 1px solid rgba(250,248,243,0.07); display: flex; align-items: center; justify-content: space-between; }
  .table-title { font-size: 0.875rem; font-weight: 700; color: #FAF8F3; }
  .table-sub { font-size: 0.75rem; color: rgba(250,248,243,0.3); }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(250,248,243,0.25); padding: 12px 20px; text-align: left; border-bottom: 1px solid rgba(250,248,243,0.06); }
  td { font-size: 0.82rem; color: rgba(250,248,243,0.7); padding: 12px 20px; border-bottom: 1px solid rgba(250,248,243,0.04); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(250,248,243,0.02); }
  .td-bold { font-weight: 700; color: #FAF8F3; }
  .td-green { color: #52B788; font-weight: 600; }
  .td-amber { color: #D4A017; font-weight: 600; }
  .td-red { color: #E57373; font-weight: 600; }

  /* PLAN BADGE */
  .plan-badge { display: inline-block; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 100px; letter-spacing: 0.06em; text-transform: uppercase; }
  .plan-premium { background: rgba(212,160,23,0.2); color: #D4A017; border: 1px solid rgba(212,160,23,0.3); }
  .plan-trial   { background: rgba(64,145,108,0.2); color: #52B788; border: 1px solid rgba(64,145,108,0.3); }
  .plan-basic    { background: rgba(250,248,243,0.06); color: rgba(250,248,243,0.4); border: 1px solid rgba(250,248,243,0.1); }

  /* CHARTS */
  .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media(max-width:700px) { .charts-grid { grid-template-columns: 1fr; } }
  .chart-card { background: rgba(250,248,243,0.03); border: 1px solid rgba(250,248,243,0.07); border-radius: 16px; padding: 20px; }
  .chart-title { font-size: 0.82rem; font-weight: 700; color: #FAF8F3; margin-bottom: 4px; }
  .chart-sub { font-size: 0.7rem; color: rgba(250,248,243,0.3); margin-bottom: 16px; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .bar-day { font-size: 0.68rem; color: rgba(250,248,243,0.3); width: 28px; flex-shrink: 0; }
  .bar-track { flex: 1; height: 6px; background: rgba(250,248,243,0.06); border-radius: 100px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 100px; transition: width 0.6s ease; }
  .bar-val { font-size: 0.68rem; color: rgba(250,248,243,0.4); width: 24px; text-align: right; flex-shrink: 0; }

  /* FEATURE BARS */
  .feature-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .feature-name { font-size: 0.8rem; color: rgba(250,248,243,0.6); width: 160px; flex-shrink: 0; }
  .feature-track { flex: 1; height: 8px; background: rgba(250,248,243,0.06); border-radius: 100px; overflow: hidden; }
  .feature-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #1B4332, #40916C); }
  .feature-count { font-size: 0.75rem; font-weight: 700; color: #52B788; width: 32px; text-align: right; }

  /* LOADING */
  .spinner { width: 20px; height: 20px; border: 2px solid rgba(250,248,243,0.1); border-top-color: #40916C; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-row { display: flex; align-items: center; justify-content: center; padding: 40px; gap: 12px; color: rgba(250,248,243,0.3); font-size: 0.875rem; }

  /* REFRESH */
  .refresh-btn { font-size: 0.75rem; color: rgba(250,248,243,0.35); background: none; border: 1px solid rgba(250,248,243,0.1); border-radius: 8px; padding: 6px 14px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
  .refresh-btn:hover { color: #FAF8F3; border-color: rgba(250,248,243,0.2); }
`;

export default function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [authed, setAuthed] = useState(false);

  // Guard — check user ID directly from localStorage auth token
  useEffect(() => {
    console.log("[Admin] Auth check started");
    try {
      // Read user ID directly from stored auth — fastest, no network needed
      const raw = localStorage.getItem("truvllo_auth") || "{}";
      const auth = JSON.parse(raw);
      const userId = auth?.user?.id || auth?.user_id;
      console.log("[Admin] Stored user ID:", userId);
      console.log("[Admin] Required admin ID:", ADMIN_ID);
      if (userId === ADMIN_ID) {
        console.log("[Admin] User is admin, setting authed to true");
        // Refresh session so Supabase client has a valid token
        supabase.auth.refreshSession().catch(() => {});
        setAuthed(true);
        return;
      } else {
        console.log("[Admin] User is not admin, redirecting");
      }
    } catch (e) {
      console.error("[Admin] Error parsing auth:", e);
    }
    // Fallback: check via Supabase
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        console.log("[Admin] Supabase user:", user?.id);
        if (user?.id === ADMIN_ID) {
          console.log(
            "[Admin] User is admin (via Supabase), setting authed to true",
          );
          setAuthed(true);
        } else {
          console.log("[Admin] User is not admin (via Supabase), redirecting");
          navigate("/dashboard", { replace: true });
        }
      })
      .catch((e) => {
        console.error("[Admin] Supabase auth error:", e);
        navigate("/dashboard", { replace: true });
      });
  }, [navigate]);

  const fetchMetrics = useCallback(async () => {
    console.log("[Admin] fetchMetrics started");
    setFetching(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not logged in");

      console.log("[Admin] invoking admin-metrics function");
      const { data, error } = await supabase.functions.invoke("admin-metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) {
        throw new Error(error.message || "Failed to load admin metrics");
      }
      if (!data) {
        throw new Error("No admin metrics returned");
      }

      console.log("[Admin] admin metrics received", data);

      const plans = data.plans ?? [];
      const daily = data.daily ?? [];
      const features = data.features ?? [];
      const atRisk = data.atRisk ?? [];
      const categories = data.categories ?? [];
      const recentUsers = data.recentUsers ?? [];

      const free = plans?.filter((p) => p.plan === "basic").length ?? 0;
      const trial = plans?.filter((p) => p.plan === "trial").length ?? 0;
      const premium = plans?.filter((p) => p.plan === "premium").length ?? 0;
      const total = plans?.length ?? 0;
      const everTrialled = plans?.filter((p) => p.trial_activated).length ?? 0;
      const waConnected = plans?.filter((p) => p.whatsapp_number).length ?? 0;
      const convPct =
        everTrialled > 0 ? Math.round((premium / everTrialled) * 100) : 0;
      const todayStr = new Date().toISOString().split("T")[0];
      const todaySignups =
        plans?.filter((p) => p.created_at?.startsWith(todayStr)).length ?? 0;

      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const ds = d.toISOString().split("T")[0];
        const dayLabel = d.toLocaleDateString("en", { weekday: "short" });
        const dayExpenses =
          daily?.filter((e) => e.created_at?.startsWith(ds)) ?? [];
        const dau = new Set(dayExpenses.map((e) => e.user_id)).size;
        last7.push({ day: dayLabel, dau, expenses: dayExpenses.length });
      }

      const catMap = {};
      categories?.forEach((e) => {
        catMap[e.category] = (catMap[e.category] ?? 0) + 1;
      });
      const topCats = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      const maxCat = topCats[0]?.[1] ?? 1;

      setData({
        total,
        free,
        trial,
        premium,
        everTrialled,
        waConnected,
        convPct,
        todaySignups,
        wkExpenses: features?.length ?? 0,
        wkWA: waConnected,
        wkTrials:
          plans?.filter(
            (p) =>
              p.trial_activated &&
              p.created_at > new Date(Date.now() - 7 * 86400000).toISOString(),
          ).length ?? 0,
        last7,
        topCats,
        maxCat,
        atRisk,
        recentUsers,
        maxDau: Math.max(...last7.map((d) => d.dau), 1),
        maxExp: Math.max(...last7.map((d) => d.expenses), 1),
      });
      setLastUpdated(new Date().toLocaleTimeString());
      console.log("[Admin] data set successfully");
    } catch (err) {
      console.error("[Admin] fetch error:", err);
      console.error("Full error:", err);
      setData({
        total: 0,
        free: 0,
        trial: 0,
        premium: 0,
        everTrialled: 0,
        waConnected: 0,
        convPct: 0,
        todaySignups: 0,
        wkExpenses: 0,
        wkWA: 0,
        wkTrials: 0,
        last7: [],
        topCats: [],
        maxCat: 0,
        atRisk: [],
        recentUsers: [],
        maxDau: 1,
        maxExp: 1,
      });
    } finally {
      console.log("[Admin] finally block - setting fetching to false");
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    console.log("[Admin] useEffect check - authed:", authed);
    if (authed) {
      console.log("[Admin] authed is true, calling fetchMetrics");
      fetchMetrics();
    }
  }, [authed, fetchMetrics]);

  if (!authed)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid rgba(250,248,243,0.1)",
            borderTopColor: "#40916C",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );

  const PlanBadge = ({ plan }) => (
    <span className={`plan-badge plan-${plan}`}>{plan}</span>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="admin">
        {/* NAV */}
        <nav className="admin-nav">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="admin-logo">
              <span className="admin-logo-dot" />
              Truvllo
            </div>
            <span className="admin-badge">Admin</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="refresh-btn"
              onClick={fetchMetrics}
              disabled={fetching}
            >
              {fetching ? "Loading..." : "↺ Refresh"}
            </button>
            <button
              className="admin-back"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>
          </div>
        </nav>

        <div className="admin-body">
          {/* HEADER */}
          <div className="admin-header">
            <h1 className="admin-title">
              Analytics <em>Overview</em>
            </h1>
            <div className="admin-sub">
              Live data from your Supabase database
            </div>
            {lastUpdated && (
              <div className="admin-updated">Last updated: {lastUpdated}</div>
            )}
          </div>

          {fetching && !data ? (
            <div className="loading-row">
              <div className="spinner" />
              <span>Loading metrics...</span>
            </div>
          ) : data ? (
            <>
              {/* TOP METRICS */}
              <div className="section-label">Key metrics</div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Total users</div>
                  <div className="metric-value">{data.total}</div>
                  <div className="metric-sub">
                    {data.todaySignups > 0 && (
                      <span className="trend-up">
                        +{data.todaySignups} today
                      </span>
                    )}
                  </div>
                </div>
                <div className="metric-card green">
                  <div className="metric-label">Premium</div>
                  <div className="metric-value green">{data.premium}</div>
                  <div className="metric-sub">paying users</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">On trial</div>
                  <div className="metric-value">{data.trial}</div>
                  <div className="metric-sub">
                    {data.atRisk.length} expiring soon
                  </div>
                </div>
                <div className="metric-card highlight">
                  <div className="metric-label">Conversion</div>
                  <div className="metric-value amber">{data.convPct}%</div>
                  <div className="metric-sub">trial → premium</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">WhatsApp</div>
                  <div className="metric-value">{data.waConnected}</div>
                  <div className="metric-sub">
                    {Math.round(
                      (data.waConnected / Math.max(data.total, 1)) * 100,
                    )}
                    % of users
                  </div>
                </div>
              </div>

              {/* CHARTS ROW */}
              <div className="section-label">Activity — last 7 days</div>
              <div className="charts-grid">
                {/* DAU chart */}
                <div className="chart-card">
                  <div className="chart-title">Daily active users</div>
                  <div className="chart-sub">
                    Users who logged at least one expense
                  </div>
                  {data.last7.map((d, i) => (
                    <div key={i} className="bar-row">
                      <span className="bar-day">{d.day}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${Math.round((d.dau / data.maxDau) * 100)}%`,
                            background: "#40916C",
                          }}
                        />
                      </div>
                      <span className="bar-val">{d.dau}</span>
                    </div>
                  ))}
                </div>

                {/* Expenses chart */}
                <div className="chart-card">
                  <div className="chart-title">Expenses logged per day</div>
                  <div className="chart-sub">
                    Total log volume across all users
                  </div>
                  {data.last7.map((d, i) => (
                    <div key={i} className="bar-row">
                      <span className="bar-day">{d.day}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${Math.round((d.expenses / data.maxExp) * 100)}%`,
                            background: "#D4A017",
                          }}
                        />
                      </div>
                      <span className="bar-val">{d.expenses}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP CATEGORIES */}
              <div className="section-label">
                Top spending categories — last 30 days
              </div>
              <div className="chart-card">
                <div className="chart-title">Most logged categories</div>
                <div className="chart-sub" style={{ marginBottom: 20 }}>
                  Shows what your users actually spend on
                </div>
                {data.topCats.map(([cat, count], i) => (
                  <div key={i} className="feature-row">
                    <span className="feature-name">{cat || "Other"}</span>
                    <div className="feature-track">
                      <div
                        className="feature-fill"
                        style={{
                          width: `${Math.round((count / data.maxCat) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="feature-count">{count}</span>
                  </div>
                ))}
              </div>

              {/* AT RISK */}
              {data.atRisk.length > 0 && (
                <>
                  <div className="section-label">
                    ⚠️ Trial expiring within 3 days — reach out
                  </div>
                  <div className="table-card">
                    <div className="table-header">
                      <div>
                        <div className="table-title">At-risk users</div>
                        <div className="table-sub">
                          These users haven't converted — personal outreach
                          works best
                        </div>
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Expires</th>
                          <th>WhatsApp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.atRisk.map((u, i) => {
                          const days = Math.ceil(
                            (new Date(u.trial_ends_at) - new Date()) / 86400000,
                          );
                          return (
                            <tr key={i}>
                              <td className="td-bold">{u.first_name || "—"}</td>
                              <td>{u.email}</td>
                              <td className={days <= 1 ? "td-red" : "td-amber"}>
                                {days} day{days !== 1 ? "s" : ""}
                              </td>
                              <td>
                                {u.whatsapp_number ? (
                                  <span className="td-green">Connected</span>
                                ) : (
                                  <span
                                    style={{ color: "rgba(250,248,243,0.25)" }}
                                  >
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* RECENT SIGNUPS */}
              <div className="section-label">Recent signups</div>
              <div className="table-card">
                <div className="table-header">
                  <div>
                    <div className="table-title">Latest 10 users</div>
                    <div className="table-sub">
                      Most recently created accounts
                    </div>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Signed up</th>
                      <th>Trial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentUsers.map((u, i) => (
                      <tr key={i}>
                        <td className="td-bold">{u.first_name || "—"}</td>
                        <td
                          style={{
                            color: "rgba(250,248,243,0.5)",
                            fontSize: "0.78rem",
                          }}
                        >
                          {u.email}
                        </td>
                        <td>
                          <PlanBadge plan={u.plan || "basic"} />
                        </td>
                        <td
                          style={{
                            color: "rgba(250,248,243,0.4)",
                            fontSize: "0.75rem",
                          }}
                        >
                          {new Date(u.created_at).toLocaleDateString("en", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td>
                          {u.trial_activated ? (
                            <span className="td-green">Activated</span>
                          ) : (
                            <span style={{ color: "rgba(250,248,243,0.2)" }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PLAN BREAKDOWN */}
              <div className="section-label">Plan distribution</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Free users",
                    value: data.free,
                    sub: `${Math.round((data.free / Math.max(data.total, 1)) * 100)}% of total`,
                    color: "rgba(250,248,243,0.4)",
                  },
                  {
                    label: "Trial users",
                    value: data.trial,
                    sub: `${Math.round((data.trial / Math.max(data.total, 1)) * 100)}% of total`,
                    color: "#52B788",
                  },
                  {
                    label: "Premium users",
                    value: data.premium,
                    sub: `${Math.round((data.premium / Math.max(data.total, 1)) * 100)}% of total`,
                    color: "#D4A017",
                  },
                ].map((m, i) => (
                  <div key={i} className="metric-card">
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-value" style={{ color: m.color }}>
                      {m.value}
                    </div>
                    <div className="metric-sub">{m.sub}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="loading-row">No data available</div>
          )}
        </div>
      </div>
    </>
  );
}
