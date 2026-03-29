import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0A0A; font-family: 'Plus Jakarta Sans', sans-serif; color: #0A0A0A; }
  :root { --cream: #FAF8F3; --green-deep: #1B4332; --green-mid: #2D6A4F; --green-light: #40916C; --green-pale: #D8F3DC; --ink: #0A0A0A; --ink-subtle: #6B6B6B; --amber: #D4A017; --white: #FFFFFF; --border: rgba(10,10,10,0.08); }
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--ink); padding: 0 5%; height: 68px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); display: inline-block; margin-bottom: 2px; }
  .nav-back { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: none; border-radius: 100px; padding: 8px 18px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .nav-back:hover { background: rgba(255,255,255,0.14); color: var(--white); }

  .careers-root { min-height: 100vh; background: var(--ink); display: flex; flex-direction: column; }
  .careers-hero { padding: 160px 5% 80px; position: relative; overflow: hidden; }
  .hero-blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15; pointer-events: none; }
  .hero-blob-1 { width: 600px; height: 600px; top: -200px; right: -100px; background: radial-gradient(circle, #40916C 0%, transparent 70%); }
  .hero-blob-2 { width: 400px; height: 400px; bottom: -100px; left: -100px; background: radial-gradient(circle, #D4A017 0%, transparent 70%); }
  .careers-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(212,160,23,0.12); color: var(--amber); border: 1px solid rgba(212,160,23,0.25); padding: 5px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 24px; }
  .careers-title { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; color: var(--white); line-height: 1.08; letter-spacing: -0.02em; max-width: 700px; margin-bottom: 24px; }
  .careers-title em { font-style: italic; color: rgba(255,255,255,0.5); }
  .careers-sub { font-size: 1.1rem; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 520px; margin-bottom: 48px; }

  .values-section { padding: 0 5% 80px; }
  .values-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--white); margin-bottom: 32px; }
  .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media(max-width:700px){ .values-grid{ grid-template-columns:1fr; } }
  .value-card { background: rgba(255,255,255,0.04); border-radius: 18px; padding: 24px; border: 1px solid rgba(255,255,255,0.08); }
  .value-icon { font-size: 1.5rem; margin-bottom: 12px; }
  .value-title { font-weight: 700; font-size: 0.95rem; color: var(--white); margin-bottom: 8px; }
  .value-desc { font-size: 0.85rem; color: rgba(255,255,255,0.45); line-height: 1.6; }

  .notify-section { padding: 80px 5%; background: rgba(255,255,255,0.03); border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
  .notify-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 800; color: var(--white); margin-bottom: 12px; }
  .notify-sub { font-size: 1rem; color: rgba(255,255,255,0.45); margin-bottom: 32px; line-height: 1.6; }
  .notify-form { display: flex; gap: 10px; max-width: 420px; margin: 0 auto; flex-wrap: wrap; justify-content: center; }
  .notify-input { flex: 1; min-width: 200px; padding: 14px 18px; border: 1.5px solid rgba(255,255,255,0.12); border-radius: 100px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; color: var(--white); background: rgba(255,255,255,0.06); outline: none; transition: border-color 0.2s; }
  .notify-input:focus { border-color: var(--green-light); }
  .notify-input::placeholder { color: rgba(255,255,255,0.3); }
  .notify-btn { padding: 14px 28px; border-radius: 100px; border: none; background: linear-gradient(135deg, var(--green-deep), var(--green-light)); color: var(--white); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .notify-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,67,50,0.4); }
  .success-msg { background: rgba(64,145,108,0.15); color: #52B788; padding: 12px 24px; border-radius: 100px; font-size: 0.9rem; font-weight: 600; margin-top: 12px; display: inline-block; }

  .footer-mini { background: rgba(0,0,0,0.3); padding: 32px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
  .footer-mini-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 6px; }
  .footer-mini-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  .footer-mini-copy { font-size: 0.82rem; color: rgba(255,255,255,0.2); }
`;

const VALUES = [
  {
    icon: "🚀",
    title: "Move fast, ship often",
    desc: "We build in public, iterate quickly, and trust our team to make decisions.",
  },
  {
    icon: "🌍",
    title: "Remote-first",
    desc: "Work from anywhere. We care about output, not office hours.",
  },
  {
    icon: "🤝",
    title: "User-obsessed",
    desc: "Every decision starts with one question: does this make the user's life better?",
  },
  {
    icon: "🎯",
    title: "High ownership",
    desc: "Everyone owns their domain end-to-end. No hand-offs, no waiting for permission.",
  },
  {
    icon: "💡",
    title: "Curiosity over credentials",
    desc: "We hire for how you think, not where you went to school.",
  },
  {
    icon: "🔒",
    title: "Privacy by default",
    desc: "We build with respect for user data baked into every product decision.",
  },
];

export default function Careers() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-careers-waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitted(true);
      setEmail("");
    }
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

      <div className="careers-root">
        <div className="careers-hero">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="careers-badge">✦ We're hiring soon</div>
          <h1 className="careers-title">
            Help us build the <em>future of personal finance</em>
          </h1>
          <p className="careers-sub">
            We're a small, focused team building something people actually use
            every day. If that excites you, we want to hear from you when we're
            ready to grow.
          </p>
        </div>

        <div className="values-section">
          <div className="values-title">How we work</div>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <div className="value-title">{v.title}</div>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="notify-section">
          <div className="notify-title">Be the first to know when we hire</div>
          <p className="notify-sub">
            We'll be opening roles in engineering, design, and growth. Drop your
            email and we'll reach out when positions open.
          </p>
          {submitted ? (
            <div className="success-msg">
              ✓ Got it — we'll be in touch when we're hiring!
            </div>
          ) : (
            <div className="notify-form">
              <input
                className="notify-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                className="notify-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Sending..." : "Stay in the loop"}
              </button>
            </div>
          )}
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
      </div>
    </>
  );
}

