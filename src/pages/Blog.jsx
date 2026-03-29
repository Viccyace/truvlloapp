import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAF8F3; font-family: 'Plus Jakarta Sans', sans-serif; color: #0A0A0A; }
  :root { --cream: #FAF8F3; --green-deep: #1B4332; --green-light: #40916C; --green-pale: #D8F3DC; --ink: #0A0A0A; --ink-subtle: #6B6B6B; --amber: #D4A017; --white: #FFFFFF; --border: rgba(10,10,10,0.08); }
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--ink); padding: 0 5%; height: 68px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); display: inline-block; margin-bottom: 2px; }
  .nav-back { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: none; border-radius: 100px; padding: 8px 18px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .nav-back:hover { background: rgba(255,255,255,0.14); color: var(--white); }

  .coming-root { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 5% 80px; text-align: center; background: var(--cream); }
  .coming-icon { font-size: 4rem; margin-bottom: 24px; }
  .coming-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--ink); color: var(--white); padding: 5px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 24px; }
  .coming-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  .coming-title { font-family: 'Playfair Display', serif; font-size: clamp(2.2rem, 5vw, 3.8rem); font-weight: 900; color: var(--ink); line-height: 1.1; letter-spacing: -0.02em; max-width: 600px; margin-bottom: 20px; }
  .coming-title em { font-style: italic; color: var(--green-light); }
  .coming-sub { font-size: 1.05rem; color: var(--ink-subtle); line-height: 1.7; max-width: 480px; margin-bottom: 40px; }

  .notify-form { display: flex; gap: 10px; max-width: 420px; width: 100%; flex-wrap: wrap; justify-content: center; }
  .notify-input { flex: 1; min-width: 200px; padding: 14px 18px; border: 1.5px solid var(--border); border-radius: 100px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; color: var(--ink); background: var(--white); outline: none; transition: border-color 0.2s; }
  .notify-input:focus { border-color: var(--green-light); }
  .notify-input::placeholder { color: rgba(10,10,10,0.35); }
  .notify-btn { padding: 14px 28px; border-radius: 100px; border: none; background: linear-gradient(135deg, var(--green-deep), var(--green-light)); color: var(--white); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .notify-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,67,50,0.3); }

  .topics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 56px; max-width: 640px; width: 100%; }
  @media(max-width:600px){ .topics-grid{ grid-template-columns:1fr; } }
  .topic-card { background: var(--white); border-radius: 16px; padding: 20px; border: 1.5px solid var(--border); text-align: left; }
  .topic-icon { font-size: 1.3rem; margin-bottom: 10px; }
  .topic-title { font-weight: 700; font-size: 0.9rem; color: var(--ink); margin-bottom: 4px; }
  .topic-desc { font-size: 0.78rem; color: var(--ink-subtle); line-height: 1.5; }

  .success-msg { background: var(--green-pale); color: var(--green-deep); padding: 12px 20px; border-radius: 100px; font-size: 0.9rem; font-weight: 600; margin-top: 12px; }

  .footer-mini { background: var(--ink); padding: 32px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-mini-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 6px; }
  .footer-mini-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  .footer-mini-copy { font-size: 0.82rem; color: rgba(255,255,255,0.3); }
`;

const TOPICS = [
  {
    icon: "💰",
    title: "Money habits",
    desc: "How to build lasting habits around spending and saving.",
  },
  {
    icon: "🤖",
    title: "AI & finance",
    desc: "How AI is changing personal finance for everyone.",
  },
  {
    icon: "📊",
    title: "Budgeting tips",
    desc: "Practical strategies that actually work in real life.",
  },
  {
    icon: "🎯",
    title: "Savings goals",
    desc: "How to set, track, and hit your financial targets.",
  },
  {
    icon: "📱",
    title: "App deep dives",
    desc: "Getting the most out of every Truvllo feature.",
  },
  {
    icon: "🌍",
    title: "Global money",
    desc: "Personal finance insights from around the world.",
  },
];

export default function Blog() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

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

      <div className="coming-root">
        <div className="coming-icon">✍️</div>
        <div className="coming-badge">
          <span className="coming-badge-dot" />
          Coming Soon
        </div>
        <h1 className="coming-title">
          The Truvllo Blog — <em>money wisdom</em> for real life
        </h1>
        <p className="coming-sub">
          We're writing practical, honest content about money, budgeting, AI,
          and building better financial habits. No fluff, no jargon — just
          useful stuff.
        </p>

        {submitted ? (
          <div className="success-msg">
            ✓ You're on the list — we'll let you know when we launch!
          </div>
        ) : (
          <div className="notify-form">
            <input
              className="notify-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button className="notify-btn" onClick={handleSubmit}>
              Notify me
            </button>
          </div>
        )}

        <div className="topics-grid">
          {TOPICS.map((t, i) => (
            <div key={i} className="topic-card">
              <div className="topic-icon">{t.icon}</div>
              <div className="topic-title">{t.title}</div>
              <p className="topic-desc">{t.desc}</p>
            </div>
          ))}
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

