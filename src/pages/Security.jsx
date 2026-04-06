import { useNavigate } from "react-router-dom";

const styles = `
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Plus Jakarta Sans',sans-serif; background:#FAF8F3; color:#0A0A0A; }
  :root { --green-deep:#1B4332; --green-mid:#2D6A4F; --green-light:#40916C; --green-pale:#D8F3DC; --amber:#D4A017; --ink:#0A0A0A; --ink-subtle:#6B6B6B; --cream:#FAF8F3; --cream-dark:#F0EDE4; --border:rgba(10,10,10,0.08); }
  .nav { position:fixed; top:0; left:0; right:0; z-index:100; background:#0A0A0A; padding:0 5%; height:68px; display:flex; align-items:center; justify-content:space-between; }
  .nav-logo { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px; cursor:pointer; }
  .nav-logo-dot { width:8px; height:8px; border-radius:50%; background:var(--amber); }
  .nav-back { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); border:none; border-radius:100px; padding:8px 18px; font-family:'Plus Jakarta Sans',sans-serif; font-size:0.875rem; font-weight:600; cursor:pointer; }
  .hero { background:#0A0A0A; padding:120px 5% 64px; }
  .hero-label { font-size:0.75rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--amber); margin-bottom:16px; display:block; }
  .hero-title { font-family:'Playfair Display',serif; font-size:clamp(2rem,4vw,3rem); font-weight:900; color:#fff; line-height:1.1; max-width:540px; }
  .hero-sub { margin-top:16px; font-size:1rem; color:rgba(255,255,255,0.5); max-width:480px; line-height:1.7; }
  .body { max-width:760px; margin:0 auto; padding:64px 5% 100px; }
  .section { margin-bottom:48px; }
  .section-title { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; color:var(--ink); margin-bottom:20px; display:flex; align-items:center; gap:12px; }
  .card { background:#fff; border-radius:18px; padding:24px; border:1.5px solid var(--border); margin-bottom:14px; }
  .card-title { font-size:0.95rem; font-weight:700; color:var(--ink); margin-bottom:8px; }
  .card-body { font-size:0.875rem; color:var(--ink-subtle); line-height:1.7; }
  .badge { display:inline-flex; align-items:center; gap:6px; background:var(--green-pale); color:var(--green-deep); padding:4px 12px; border-radius:100px; font-size:0.75rem; font-weight:700; margin-top:10px; }
  .fact-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:600px){ .fact-grid{ grid-template-columns:1fr; } }
  .fact { background:var(--cream-dark); border-radius:14px; padding:20px; }
  .fact-emoji { font-size:1.5rem; margin-bottom:10px; }
  .fact-label { font-size:0.78rem; font-weight:700; color:var(--ink-subtle); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px; }
  .fact-value { font-size:0.95rem; font-weight:700; color:var(--ink); line-height:1.4; }
  .footer { background:var(--ink); padding:32px 5%; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
  .footer-logo { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px; }
  .footer-dot { width:6px; height:6px; border-radius:50%; background:var(--amber); }
  .footer-copy { font-size:0.82rem; color:rgba(255,255,255,0.3); }
`;

export default function Security() {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>

      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate("/")}>
          <span className="nav-logo-dot" />
          Truvllo
        </div>
        <button className="nav-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </nav>

      <section className="hero">
        <span className="hero-label">Security & Privacy</span>
        <h1 className="hero-title">Your money data, explained plainly</h1>
        <p className="hero-sub">
          No legal jargon. Just a clear explanation of what we store, what we
          don't, and why.
        </p>
      </section>

      <div className="body">
        {/* The big three */}
        <div className="section">
          <div className="fact-grid">
            <div className="fact">
              <div className="fact-emoji">🏦</div>
              <div className="fact-label">Bank access</div>
              <div className="fact-value">
                We never connect to your bank account. Ever.
              </div>
            </div>
            <div className="fact">
              <div className="fact-emoji">💸</div>
              <div className="fact-label">Money movement</div>
              <div className="fact-value">
                We cannot send, receive, or hold your money.
              </div>
            </div>
            <div className="fact">
              <div className="fact-emoji">📄</div>
              <div className="fact-label">Bank statements</div>
              <div className="fact-value">
                PDFs are read and deleted. We store only the transaction
                numbers.
              </div>
            </div>
            <div className="fact">
              <div className="fact-emoji">🔑</div>
              <div className="fact-label">Passwords</div>
              <div className="fact-value">
                We never ask for your bank PIN, password, or token.
              </div>
            </div>
          </div>
        </div>

        {/* What we store */}
        <div className="section">
          <div className="section-title">📦 What we actually store</div>
          <div className="card">
            <div className="card-title">Your profile</div>
            <div className="card-body">
              Your name, email address, and the currency you selected. That's it
              for personal information.
            </div>
          </div>
          <div className="card">
            <div className="card-title">Your expenses</div>
            <div className="card-body">
              The description, amount, date, and category of expenses you log.
              You control every entry — you can edit or delete any of them at
              any time from your account settings.
            </div>
          </div>
          <div className="card">
            <div className="card-title">Your budget</div>
            <div className="card-body">
              The name, amount, and period of the budget you set up. Nothing
              else.
            </div>
          </div>
          <div className="card">
            <div className="card-title">Your WhatsApp number (optional)</div>
            <div className="card-body">
              Only if you choose to connect it. We store your number to route
              messages from the WhatsApp agent to your account. You can
              disconnect and delete it from Settings at any time.
            </div>
          </div>
        </div>

        {/* What we don't store */}
        <div className="section">
          <div className="section-title">🚫 What we never store</div>
          {[
            [
              "Your bank login credentials",
              "We don't ask for them. We don't want them.",
            ],
            ["Your BVN or NIN", "Not required, not requested, not stored."],
            [
              "Your bank statement PDF",
              "When you send a PDF, our AI reads the numbers and then the file is gone. We keep only the extracted transactions.",
            ],
            [
              "Your card details",
              "Payments are handled by Paystack. We never see your card number.",
            ],
            [
              "Your location",
              "We don't track where you are or where you spend.",
            ],
          ].map(([title, body]) => (
            <div className="card" key={title}>
              <div className="card-title">{title}</div>
              <div className="card-body">{body}</div>
            </div>
          ))}
        </div>

        {/* AI section */}
        <div className="section">
          <div className="section-title">🤖 How AI uses your data</div>
          <div className="card">
            <div className="card-title">
              Your expense data is sent to Claude (Anthropic) for analysis
            </div>
            <div className="card-body">
              When you use AI features, we send your anonymised expense totals
              and category breakdown to Anthropic's Claude API to generate
              insights. We send numbers, not names, descriptions, or any
              personally identifiable information.
              <br />
              <br />
              Anthropic's API does not train on your data. Every request is
              stateless — Claude doesn't remember your previous conversations.
            </div>
            <span className="badge">✓ No AI training on your data</span>
          </div>
        </div>

        {/* Delete */}
        <div className="section">
          <div className="section-title">🗑️ Deleting your data</div>
          <div className="card">
            <div className="card-title">You can delete everything, anytime</div>
            <div className="card-body">
              Go to <strong>Settings → Account → Delete Account</strong>. This
              permanently removes your profile, all expenses, your budget, and
              your WhatsApp number from our database. We don't keep backups of
              deleted accounts beyond 30 days.
              <br />
              <br />
              You can also email us at{" "}
              <a
                href="mailto:privacy@truvllo.app"
                style={{ color: "var(--green-mid)", fontWeight: 600 }}
              >
                privacy@truvllo.app
              </a>{" "}
              and we'll handle it within 48 hours.
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="section">
          <div className="section-title">💬 Questions?</div>
          <div className="card">
            <div className="card-body">
              If anything on this page is unclear or you have a specific
              question about your data, email us directly at{" "}
              <a
                href="mailto:privacy@truvllo.app"
                style={{ color: "var(--green-mid)", fontWeight: 600 }}
              >
                privacy@truvllo.app
              </a>
              . We respond to every message within 48 hours on business days.
              <br />
              <br />
              We're a small team and we take this seriously.
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-logo">
          <span className="footer-dot" />
          Truvllo
        </div>
        <span className="footer-copy">
          © {new Date().getFullYear()} Truvllo. All rights reserved.
        </span>
      </footer>
    </>
  );
}
