import { useNavigate } from "react-router-dom";

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0A0A0A; color: #FAF8F3; overflow-x: hidden; }
  :root {
    --green-deep:#1B4332; --green-mid:#2D6A4F; --green-light:#40916C; --green-pale:#D8F3DC;
    --amber:#D4A017; --amber-light:#F0C040;
    --cream:#FAF8F3; --cream-dark:#F0EDE4;
    --ink:#0A0A0A; --ink-subtle:#6B6B6B;
    --border-light:rgba(250,248,243,0.08); --border-green:rgba(64,145,108,0.25);
  }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lineGrow { from{width:0} to{width:100%} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* NAV */
  .sec-nav { position:fixed;top:0;left:0;right:0;z-index:100;height:72px;padding:0 6%;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-light);background:rgba(10,10,10,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px); }
  .sec-logo { font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--cream);display:flex;align-items:center;gap:8px;cursor:pointer; }
  .sec-logo-dot { width:7px;height:7px;border-radius:50%;background:var(--amber);animation:pulse 3s ease infinite; }
  .sec-back { display:flex;align-items:center;gap:8px;color:rgba(250,248,243,0.5);font-size:0.875rem;font-weight:600;background:none;border:1px solid var(--border-light);border-radius:100px;padding:8px 20px;cursor:pointer;transition:all 0.2s;font-family:'Plus Jakarta Sans',sans-serif; }
  .sec-back:hover { color:var(--cream);border-color:rgba(250,248,243,0.25); }

  /* HERO */
  .sec-hero { min-height:100vh;padding:0 6%;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:80px;position:relative;overflow:hidden;background:var(--ink); }
  .sec-hero-circle-1 { position:absolute;width:600px;height:600px;top:-200px;right:-100px;border-radius:50%;background:radial-gradient(circle,rgba(27,67,50,0.6) 0%,transparent 70%);pointer-events:none; }
  .sec-hero-circle-2 { position:absolute;width:400px;height:400px;bottom:-100px;left:10%;background:radial-gradient(circle,rgba(212,160,23,0.12) 0%,transparent 70%);pointer-events:none; }
  .sec-hero-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(250,248,243,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,248,243,0.03) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse 80% 60% at 50% 50%,black,transparent);pointer-events:none; }
  .sec-hero-content { position:relative;z-index:10;max-width:800px;animation:fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both; }
  .sec-hero-label { display:inline-flex;align-items:center;gap:10px;color:var(--amber);font-size:0.72rem;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:28px; }
  .sec-hero-label-line { width:32px;height:1px;background:var(--amber); }
  .sec-hero-title { font-family:'Playfair Display',serif;font-size:clamp(3rem,6vw,5.5rem);font-weight:900;line-height:1.02;letter-spacing:-0.03em;color:var(--cream);margin-bottom:28px; }
  .sec-hero-title em { font-style:italic;color:var(--green-light);display:block; }
  .sec-hero-sub { font-size:1.1rem;line-height:1.75;color:rgba(250,248,243,0.5);max-width:520px; }

  /* GUARANTEE BAR */
  .sec-guarantee { background:var(--green-deep);border-top:1px solid rgba(64,145,108,0.3);border-bottom:1px solid rgba(64,145,108,0.3); }
  .sec-guarantee-inner { max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr); }
  @media(max-width:900px){ .sec-guarantee-inner{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:500px){ .sec-guarantee-inner{ grid-template-columns:1fr; } }
  .sec-guarantee-item { padding:36px 28px;border-right:1px solid rgba(64,145,108,0.25);display:flex;align-items:flex-start;gap:16px;transition:background 0.2s; }
  .sec-guarantee-item:last-child { border-right:none; }
  .sec-guarantee-item:hover { background:rgba(64,145,108,0.15); }
  .sec-guarantee-icon { width:44px;height:44px;border-radius:12px;background:rgba(64,145,108,0.2);border:1px solid rgba(64,145,108,0.3);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0; }
  .sec-guarantee-label { font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--green-light);margin-bottom:5px; }
  .sec-guarantee-value { font-size:0.875rem;font-weight:600;color:rgba(250,248,243,0.85);line-height:1.4; }

  /* BODY */
  .sec-body { background:var(--cream);padding:80px 6% 120px; }
  .sec-body-inner { max-width:860px;margin:0 auto; }
  .sec-section { margin-bottom:72px; }
  .sec-section-header { display:flex;align-items:center;gap:16px;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid var(--ink); }
  .sec-section-number { font-family:'Playfair Display',serif;font-size:0.75rem;font-weight:900;color:var(--ink);opacity:0.2;letter-spacing:0.04em; }
  .sec-section-title { font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:800;color:var(--ink);letter-spacing:-0.02em; }
  .sec-section-accent { margin-left:auto;width:32px;height:3px;background:var(--green-light);border-radius:100px; }

  /* STORE CARDS */
  .sec-card-grid { display:flex;flex-direction:column;gap:12px; }
  .sec-card { background:#fff;border-radius:16px;border:1.5px solid rgba(10,10,10,0.06);padding:24px 28px;display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:flex-start;transition:all 0.2s;position:relative;overflow:hidden; }
  .sec-card::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--green-light);transform:scaleY(0);transform-origin:bottom;transition:transform 0.25s ease; }
  .sec-card:hover { border-color:rgba(64,145,108,0.2);transform:translateX(4px);box-shadow:0 4px 24px rgba(10,10,10,0.06); }
  .sec-card:hover::before { transform:scaleY(1); }
  .sec-card-icon { width:44px;height:44px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.2rem; }
  .sec-card-icon.green { background:var(--green-pale); }
  .sec-card-icon.amber { background:rgba(212,160,23,0.1); }
  .sec-card-icon.ink   { background:rgba(10,10,10,0.06); }
  .sec-card-title { font-size:0.95rem;font-weight:700;color:var(--ink);margin-bottom:6px; }
  .sec-card-body  { font-size:0.875rem;color:#555;line-height:1.7; }

  /* NEVER CARDS */
  .sec-never-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  @media(max-width:600px){ .sec-never-grid{ grid-template-columns:1fr; } }
  .sec-never-card { background:var(--ink);border-radius:16px;padding:24px;position:relative;overflow:hidden;transition:transform 0.2s; }
  .sec-never-card:hover { transform:translateY(-3px); }
  .sec-never-card::after { content:'✗';position:absolute;bottom:-10px;right:12px;font-size:5rem;font-weight:900;line-height:1;color:rgba(250,248,243,0.03);font-family:'Playfair Display',serif; }
  .sec-never-title { font-size:0.875rem;font-weight:700;color:var(--cream);margin-bottom:8px; }
  .sec-never-body  { font-size:0.8rem;color:rgba(250,248,243,0.45);line-height:1.65; }

  /* AI CARD */
  .sec-ai-card { background:linear-gradient(135deg,var(--green-deep) 0%,#0D2B1C 100%);border-radius:20px;padding:36px;position:relative;overflow:hidden; }
  .sec-ai-card::before { content:'';position:absolute;top:-100px;right:-100px;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(64,145,108,0.3) 0%,transparent 70%); }
  .sec-ai-header { display:flex;align-items:center;gap:14px;margin-bottom:20px; }
  .sec-ai-icon { width:52px;height:52px;border-radius:14px;background:rgba(64,145,108,0.25);border:1px solid rgba(64,145,108,0.4);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0; }
  .sec-ai-label { font-size:0.7rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--green-light);margin-bottom:4px; }
  .sec-ai-title { font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:var(--cream); }
  .sec-ai-body  { font-size:0.9rem;color:rgba(250,248,243,0.6);line-height:1.75;margin-bottom:20px;position:relative;z-index:1; }
  .sec-ai-badges { display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:1; }
  .sec-ai-badge { display:inline-flex;align-items:center;gap:6px;background:rgba(64,145,108,0.2);border:1px solid rgba(64,145,108,0.3);color:var(--green-light);font-size:0.75rem;font-weight:700;padding:6px 14px;border-radius:100px; }

  /* DELETE CARD */
  .sec-delete-card { border:2px dashed rgba(10,10,10,0.12);border-radius:20px;padding:36px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:center; }
  @media(max-width:600px){ .sec-delete-card{ grid-template-columns:1fr; } }
  .sec-delete-title { font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:800;color:var(--ink);margin-bottom:12px; }
  .sec-delete-body  { font-size:0.875rem;color:#555;line-height:1.7; }
  .sec-delete-body a { color:var(--green-mid);font-weight:700;text-decoration:none; }
  .sec-delete-body a:hover { text-decoration:underline; }
  .sec-delete-steps { display:flex;flex-direction:column;gap:8px;margin-top:16px; }
  .sec-delete-step  { display:flex;align-items:center;gap:10px;font-size:0.8rem;color:#555; }
  .sec-delete-step-dot { width:6px;height:6px;border-radius:50%;background:var(--green-light);flex-shrink:0; }
  .sec-delete-cta { background:var(--ink);color:var(--cream);border:none;border-radius:12px;padding:14px 24px;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;font-size:0.875rem;font-weight:700;cursor:pointer;transition:all 0.2s; }
  .sec-delete-cta:hover { background:#333; }

  /* CONTACT */
  .sec-contact { background:var(--ink);border-radius:20px;padding:40px 36px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-top:72px; }
  .sec-contact-label { font-size:0.72rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--amber);margin-bottom:10px; }
  .sec-contact-title { font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:800;color:var(--cream);margin-bottom:10px; }
  .sec-contact-sub { font-size:0.875rem;color:rgba(250,248,243,0.45);line-height:1.6;max-width:380px; }
  .sec-contact-btn { background:var(--amber);color:var(--ink);border:none;border-radius:12px;padding:14px 28px;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;font-size:0.9rem;font-weight:800;cursor:pointer;transition:all 0.2s;flex-shrink:0;text-decoration:none;display:inline-block; }
  .sec-contact-btn:hover { background:var(--amber-light);transform:translateY(-2px); }

  /* FOOTER */
  .sec-footer { background:var(--ink);padding:28px 6%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border-top:1px solid var(--border-light); }
  .sec-footer-logo { font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:var(--cream);display:flex;align-items:center;gap:7px;cursor:pointer; }
  .sec-footer-dot { width:6px;height:6px;border-radius:50%;background:var(--amber); }
  .sec-footer-copy { font-size:0.8rem;color:rgba(250,248,243,0.3); }

  @media(max-width:768px){
    .sec-hero { padding-bottom:60px;min-height:80vh; }
    .sec-hero-title { font-size:2.8rem; }
    .sec-body { padding:60px 5% 80px; }
    .sec-guarantee-item { padding:24px 18px; }
    .sec-contact { padding:28px 24px; }
    .sec-ai-card,.sec-delete-card { padding:24px; }
  }
`;

const GUARANTEES = [
  {
    icon: "🏦",
    label: "Bank access",
    value: "We never connect to your bank. Ever.",
  },
  {
    icon: "💸",
    label: "Money movement",
    value: "We cannot send, receive, or hold your money.",
  },
  {
    icon: "📄",
    label: "Bank statements",
    value: "PDFs are read, then permanently deleted.",
  },
  {
    icon: "🔑",
    label: "Your passwords",
    value: "We never ask for bank PINs or passwords.",
  },
];

const STORES = [
  {
    icon: "👤",
    color: "green",
    title: "Your profile",
    body: "Your name, email address, and currency selection. That's it for personal information.",
  },
  {
    icon: "💳",
    color: "amber",
    title: "Your expenses",
    body: "Description, amount, date, and category — only what you log. Edit or delete anything from Settings, anytime.",
  },
  {
    icon: "🎯",
    color: "green",
    title: "Your budget",
    body: "The name, amount, and period you set up. Nothing beyond what you enter.",
  },
  {
    icon: "💬",
    color: "ink",
    title: "WhatsApp number (optional)",
    body: "Only if you connect it. Used to route agent messages to your account. Remove it from Settings at any time.",
  },
];

const NEVERS = [
  {
    title: "Bank login credentials",
    body: "We don't ask for them. We don't want them.",
  },
  { title: "BVN or NIN", body: "Not required, not requested, not stored." },
  {
    title: "Bank statement PDF",
    body: "AI reads the numbers, then the file is gone. We keep only the extracted transactions.",
  },
  {
    title: "Card details",
    body: "Payments go through Paystack. We never see your card number.",
  },
  {
    title: "Your location",
    body: "We don't track where you are or where you spend.",
  },
  {
    title: "Device identifiers",
    body: "No fingerprinting, no advertising IDs, no cross-app tracking.",
  },
];

export default function Security() {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>

      <nav className="sec-nav">
        <div className="sec-logo" onClick={() => navigate("/")}>
          <span className="sec-logo-dot" />
          Truvllo
        </div>
        <button className="sec-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </nav>

      <section className="sec-hero">
        <div className="sec-hero-circle-1" />
        <div className="sec-hero-circle-2" />
        <div className="sec-hero-grid" />
        <div className="sec-hero-content">
          <div className="sec-hero-label">
            <span className="sec-hero-label-line" />
            Security & Privacy
          </div>
          <h1 className="sec-hero-title">
            Your money data,
            <em>explained plainly.</em>
          </h1>
          <p className="sec-hero-sub">
            No legal jargon. No fine print. Just a clear, honest explanation of
            what we store, what we don't, and exactly why.
          </p>
        </div>
      </section>

      <div className="sec-guarantee">
        <div className="sec-guarantee-inner">
          {GUARANTEES.map((g, i) => (
            <div key={i} className="sec-guarantee-item">
              <div className="sec-guarantee-icon">{g.icon}</div>
              <div>
                <div className="sec-guarantee-label">{g.label}</div>
                <div className="sec-guarantee-value">{g.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec-body">
        <div className="sec-body-inner">
          <div className="sec-section">
            <div className="sec-section-header">
              <span className="sec-section-number">01</span>
              <div className="sec-section-title">What we actually store</div>
              <div className="sec-section-accent" />
            </div>
            <div className="sec-card-grid">
              {STORES.map((s, i) => (
                <div key={i} className="sec-card">
                  <div className={`sec-card-icon ${s.color}`}>{s.icon}</div>
                  <div>
                    <div className="sec-card-title">{s.title}</div>
                    <div className="sec-card-body">{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec-section">
            <div className="sec-section-header">
              <span className="sec-section-number">02</span>
              <div className="sec-section-title">What we never store</div>
              <div
                className="sec-section-accent"
                style={{ background: "#DC2626" }}
              />
            </div>
            <div className="sec-never-grid">
              {NEVERS.map((n, i) => (
                <div key={i} className="sec-never-card">
                  <div className="sec-never-title">{n.title}</div>
                  <div className="sec-never-body">{n.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec-section">
            <div className="sec-section-header">
              <span className="sec-section-number">03</span>
              <div className="sec-section-title">How AI uses your data</div>
              <div
                className="sec-section-accent"
                style={{ background: "var(--amber)" }}
              />
            </div>
            <div className="sec-ai-card">
              <div className="sec-ai-header">
                <div className="sec-ai-icon">🤖</div>
                <div>
                  <div className="sec-ai-label">Anthropic Claude API</div>
                  <div className="sec-ai-title">
                    What gets sent, and what doesn't
                  </div>
                </div>
              </div>
              <p className="sec-ai-body">
                When you use AI features, we send your anonymised expense totals
                and category breakdown to Anthropic's Claude API. We send{" "}
                <strong style={{ color: "var(--cream)" }}>numbers</strong>, not
                names, descriptions, or any personally identifiable information.
                <br />
                <br />
                Anthropic's API does not train on your data. Every request is
                stateless — Claude has no memory of previous conversations with
                you.
              </p>
              <div className="sec-ai-badges">
                <span className="sec-ai-badge">
                  ✓ No AI training on your data
                </span>
                <span className="sec-ai-badge">
                  ✓ Stateless — no memory between sessions
                </span>
                <span className="sec-ai-badge">✓ Anonymised numbers only</span>
              </div>
            </div>
          </div>

          <div className="sec-section">
            <div className="sec-section-header">
              <span className="sec-section-number">04</span>
              <div className="sec-section-title">Deleting your data</div>
              <div className="sec-section-accent" />
            </div>
            <div className="sec-delete-card">
              <div>
                <div className="sec-delete-title">
                  You own your data. Delete it anytime.
                </div>
                <div className="sec-delete-body">
                  We permanently remove your profile, all expenses, your budget,
                  and your WhatsApp number on request. No questions asked.
                  <br />
                  <br />
                  Or email us at{" "}
                  <a href="mailto:privacy@truvllo.app">privacy@truvllo.app</a> —
                  we respond within 48 hours on business days.
                </div>
                <div className="sec-delete-steps">
                  <div className="sec-delete-step">
                    <span className="sec-delete-step-dot" />
                    Go to{" "}
                    <strong style={{ margin: "0 4px" }}>
                      Settings → Account → Delete Account
                    </strong>
                  </div>
                  <div className="sec-delete-step">
                    <span className="sec-delete-step-dot" />
                    All data is wiped immediately
                  </div>
                  <div className="sec-delete-step">
                    <span className="sec-delete-step-dot" />
                    Backups are purged within 7 days
                  </div>
                </div>
              </div>
              <button
                className="sec-delete-cta"
                onClick={() => navigate("/settings")}
              >
                Go to Settings →
              </button>
            </div>
          </div>

          <div className="sec-contact">
            <div>
              <div className="sec-contact-label">Still have questions?</div>
              <div className="sec-contact-title">
                We're a real team.
                <br />
                We read every email.
              </div>
              <p className="sec-contact-sub">
                If anything here is unclear, email us directly. We respond to
                every message within 48 hours on business days.
              </p>
            </div>
            <a href="mailto:privacy@truvllo.app" className="sec-contact-btn">
              privacy@truvllo.app →
            </a>
          </div>
        </div>
      </div>

      <footer className="sec-footer">
        <div className="sec-footer-logo" onClick={() => navigate("/")}>
          <span className="sec-footer-dot" />
          Truvllo
        </div>
        <span className="sec-footer-copy">
          © {new Date().getFullYear()} Truvllo. All rights reserved.
        </span>
      </footer>
    </>
  );
}
