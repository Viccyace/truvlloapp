import { useNavigate } from "react-router-dom";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAF8F3; font-family: 'Plus Jakarta Sans', sans-serif; color: #0A0A0A; }
  :root {
    --cream: #FAF8F3; --cream-dark: #F0EDE4;
    --green-deep: #1B4332; --green-mid: #2D6A4F; --green-light: #40916C; --green-pale: #D8F3DC;
    --ink: #0A0A0A; --ink-muted: #3A3A3A; --ink-subtle: #6B6B6B;
    --amber: #D4A017; --white: #FFFFFF; --border: rgba(10,10,10,0.08);
  }
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--ink); padding: 0 5%; height: 68px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); display: inline-block; margin-bottom: 2px; }
  .nav-back { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: none; border-radius: 100px; padding: 8px 18px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .nav-back:hover { background: rgba(255,255,255,0.14); color: var(--white); }

  .page-hero { background: var(--ink); padding: 140px 5% 80px; position: relative; overflow: hidden; }
  .page-hero-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.2; pointer-events: none; width: 500px; height: 500px; top: -100px; right: -100px; background: radial-gradient(circle, #40916C 0%, transparent 70%); }
  .page-hero-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; display: block; }
  .page-hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; color: var(--white); line-height: 1.1; letter-spacing: -0.02em; max-width: 700px; }
  .page-hero-title em { font-style: italic; color: rgba(255,255,255,0.6); }
  .page-hero-sub { margin-top: 20px; font-size: 1.1rem; color: rgba(255,255,255,0.55); line-height: 1.7; max-width: 560px; }

  .page-body { max-width: 860px; margin: 0 auto; padding: 80px 5%; }
  .section-block { margin-bottom: 64px; }
  .section-block h2 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; color: var(--ink); margin-bottom: 16px; letter-spacing: -0.01em; }
  .section-block p { font-size: 1rem; color: var(--ink-muted); line-height: 1.8; margin-bottom: 16px; }
  .section-block p:last-child { margin-bottom: 0; }

  .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 32px; }
  @media(max-width:700px){ .values-grid{ grid-template-columns:1fr; } }
  .value-card { background: var(--white); border-radius: 18px; padding: 28px; border: 1.5px solid var(--border); }
  .value-icon { font-size: 1.8rem; margin-bottom: 14px; }
  .value-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
  .value-desc { font-size: 0.875rem; color: var(--ink-subtle); line-height: 1.65; }

  .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 32px; }
  @media(max-width:700px){ .team-grid{ grid-template-columns:1fr; } }
  .team-card { background: var(--white); border-radius: 18px; padding: 28px; border: 1.5px solid var(--border); text-align: center; }
  .team-avatar { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); }
  .team-name { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; margin-bottom: 4px; }
  .team-role { font-size: 0.82rem; color: var(--ink-subtle); }

  .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 32px; }
  @media(max-width:600px){ .stat-row{ grid-template-columns:1fr; } }
  .stat-card { background: var(--green-pale); border-radius: 18px; padding: 28px; text-align: center; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; color: var(--green-deep); margin-bottom: 6px; }
  .stat-label { font-size: 0.875rem; color: var(--green-mid); font-weight: 600; }

  .cta-band { background: linear-gradient(135deg, var(--green-deep), var(--green-light)); border-radius: 24px; padding: 48px; text-align: center; margin-top: 64px; }
  .cta-band h3 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; color: var(--white); margin-bottom: 12px; }
  .cta-band p { color: rgba(255,255,255,0.65); font-size: 1rem; margin-bottom: 28px; }
  .cta-band-btn { background: var(--white); color: var(--green-deep); border: none; border-radius: 100px; padding: 14px 36px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 800; cursor: pointer; transition: all 0.2s; }
  .cta-band-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

  .footer-mini { background: var(--ink); padding: 32px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-mini-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 6px; }
  .footer-mini-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  .footer-mini-copy { font-size: 0.82rem; color: rgba(255,255,255,0.3); }
`;

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <style>{FONTS + styles}</style>

      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate("/")}>
          <span className="nav-logo-dot" />
          Truvllo
        </div>
        <button className="nav-back" onClick={() => navigate("/")}>
          ← Back to home
        </button>
      </nav>

      <section className="page-hero">
        <div className="page-hero-blob" />
        <span className="page-hero-label">Our Story</span>
        <h1 className="page-hero-title">
          Built for people who want their money to <em>make sense</em>
        </h1>
        <p className="page-hero-sub">
          Truvllo started with a simple question: why is it so hard to know what
          you can actually spend today? We built the answer.
        </p>
      </section>

      <div className="page-body">
        <div className="section-block">
          <h2>Why we built Truvllo</h2>
          <p>
            Most budgeting apps tell you what you spent last month. That's
            useful, but it doesn't help you make better decisions right now,
            today, at the point of purchase.
          </p>
          <p>
            We built Truvllo around one core idea: your safe-to-spend number.
            Every morning you open the app, you know exactly how much you can
            spend today without blowing your budget. No maths, no spreadsheets,
            just a number you can act on.
          </p>
          <p>
            We then layered AI on top to make the experience smarter over time.
            The more you use Truvllo, the better it understands your habits and
            the more useful its insights become.
          </p>
        </div>

        <div className="section-block">
          <h2>The numbers so far</h2>
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-num">2,400+</div>
              <div className="stat-label">Active users</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">6</div>
              <div className="stat-label">Currencies supported</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">6</div>
              <div className="stat-label">AI-powered features</div>
            </div>
          </div>
        </div>

        <div className="section-block">
          <h2>What we believe</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <div className="value-title">Clarity over complexity</div>
              <p className="value-desc">
                Finance is already complicated enough. Truvllo makes it simple,
                one number, one decision, every day.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <div className="value-title">AI that works for you</div>
              <p className="value-desc">
                Our AI doesn't judge your spending. It understands it, explains
                it, and helps you do better, without the lecture.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <div className="value-title">Your data is yours</div>
              <p className="value-desc">
                We don't sell your financial data. We don't share it. It's
                yours, and it stays that way.
              </p>
            </div>
          </div>
        </div>

        <div className="section-block">
          <h2>Where we're headed</h2>
          <p>
            We're just getting started. On the roadmap: business accounts for
            teams, deeper AI insights, investment tracking, savings goals with
            automated contributions, and more currencies across Africa, Asia,
            and beyond.
          </p>
          <p>
            If you want to be part of building Truvllo, check out our Careers
            page. If you just want to talk money, we'd love to hear from you.
          </p>
        </div>

        <div className="cta-band">
          <h3>Start managing your money smarter</h3>
          <p>
            Free to start. No credit card. AI features unlocked on your first
            expense.
          </p>
          <button className="cta-band-btn" onClick={() => navigate("/auth")}>
            Create your free account
          </button>
        </div>
      </div>

      <footer className="footer-mini">
        <div className="footer-mini-logo">
          <span className="footer-mini-dot" />
          Truvllo
        </div>
        <span className="footer-mini-copy">
          © 2026 Truvllo. All rights reserved.
        </span>
      </footer>
    </>
  );
}
