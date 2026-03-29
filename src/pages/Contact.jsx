import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAF8F3; font-family: 'Plus Jakarta Sans', sans-serif; color: #0A0A0A; }
  :root { --cream: #FAF8F3; --cream-dark: #F0EDE4; --green-deep: #1B4332; --green-mid: #2D6A4F; --green-light: #40916C; --green-pale: #D8F3DC; --ink: #0A0A0A; --ink-muted: #3A3A3A; --ink-subtle: #6B6B6B; --amber: #D4A017; --white: #FFFFFF; --border: rgba(10,10,10,0.08); }
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--ink); padding: 0 5%; height: 68px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); display: inline-block; margin-bottom: 2px; }
  .nav-back { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: none; border-radius: 100px; padding: 8px 18px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .nav-back:hover { background: rgba(255,255,255,0.14); color: var(--white); }

  .page-hero { background: var(--ink); padding: 140px 5% 80px; position: relative; overflow: hidden; }
  .page-hero-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; pointer-events: none; width: 500px; height: 500px; top: -100px; right: -100px; background: radial-gradient(circle, #40916C 0%, transparent 70%); }
  .page-hero-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; display: block; }
  .page-hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; color: var(--white); line-height: 1.1; max-width: 560px; }
  .page-hero-sub { margin-top: 16px; font-size: 0.95rem; color: rgba(255,255,255,0.45); max-width: 480px; line-height: 1.7; }

  .page-body { max-width: 960px; margin: 0 auto; padding: 80px 5% 100px; display: grid; grid-template-columns: 1fr 420px; gap: 60px; align-items: start; }
  @media(max-width:800px){ .page-body{ grid-template-columns:1fr; } }

  /* Contact cards */
  .contact-cards { display: flex; flex-direction: column; gap: 16px; }
  .contact-card { background: var(--white); border-radius: 18px; padding: 24px; border: 1.5px solid var(--border); display: flex; align-items: flex-start; gap: 16px; transition: all 0.2s; }
  .contact-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .contact-card-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--green-pale); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
  .contact-card-title { font-weight: 700; font-size: 0.95rem; color: var(--ink); margin-bottom: 4px; }
  .contact-card-desc { font-size: 0.82rem; color: var(--ink-subtle); line-height: 1.5; margin-bottom: 8px; }
  .contact-card-link { font-size: 0.85rem; font-weight: 600; color: var(--green-light); text-decoration: none; }
  .contact-card-link:hover { color: var(--green-deep); }

  .response-note { background: var(--cream-dark); border-radius: 14px; padding: 16px 18px; font-size: 0.85rem; color: var(--ink-subtle); line-height: 1.6; margin-top: 24px; }
  .response-note strong { color: var(--ink); }

  /* Form */
  .form-card { background: var(--white); border-radius: 24px; padding: 36px; border: 1.5px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.06); }
  .form-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; margin-bottom: 24px; }
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--ink-muted); margin-bottom: 7px; }
  .form-input { width: 100%; padding: 12px 16px; border: 1.5px solid var(--border); border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 500; color: var(--ink); background: var(--cream); outline: none; transition: all 0.2s; }
  .form-input:focus { border-color: var(--green-light); box-shadow: 0 0 0 3px rgba(64,145,108,0.1); background: var(--white); }
  .form-input::placeholder { color: rgba(10,10,10,0.28); font-weight: 400; }
  textarea.form-input { resize: vertical; min-height: 130px; line-height: 1.6; }
  .form-select { width: 100%; padding: 12px 16px; border: 1.5px solid var(--border); border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 500; color: var(--ink); background: var(--cream); outline: none; cursor: pointer; transition: border-color 0.2s; }
  .form-select:focus { border-color: var(--green-light); }
  .form-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--green-deep), var(--green-light)); color: var(--white); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.22s; box-shadow: 0 4px 16px rgba(27,67,50,0.25); margin-top: 4px; }
  .form-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(27,67,50,0.35); }
  .form-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .success-card { background: var(--green-pale); border-radius: 18px; padding: 36px; text-align: center; border: 1.5px solid rgba(27,67,50,0.15); }
  .success-icon { font-size: 2.5rem; margin-bottom: 16px; }
  .success-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--green-deep); margin-bottom: 8px; }
  .success-sub { font-size: 0.9rem; color: var(--green-mid); line-height: 1.6; }

  .footer-mini { background: var(--ink); padding: 32px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-mini-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 6px; }
  .footer-mini-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  .footer-mini-copy { font-size: 0.82rem; color: rgba(255,255,255,0.3); }
`;

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setLoading(true);
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      // Still show success to user — don't block on email failure
      setSubmitted(true);
    } finally {
      setLoading(false);
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

      <section className="page-hero">
        <div className="page-hero-blob" />
        <span className="page-hero-label">Get in touch</span>
        <h1 className="page-hero-title">We'd love to hear from you</h1>
        <p className="page-hero-sub">
          Whether it's a question, a bug, feedback, or just a hello — we read
          every message and reply to all of them.
        </p>
      </section>

      <div className="page-body">
        <div>
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-card-icon">💬</div>
              <div>
                <div className="contact-card-title">General enquiries</div>
                <p className="contact-card-desc">
                  Questions about Truvllo, the product, or anything else.
                </p>
                <a
                  className="contact-card-link"
                  href="mailto:hello@truvllo.com"
                >
                  hello@truvllo.com
                </a>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-card-icon">🛠️</div>
              <div>
                <div className="contact-card-title">Technical support</div>
                <p className="contact-card-desc">
                  Bugs, errors, or something not working as expected.
                </p>
                <a
                  className="contact-card-link"
                  href="mailto:support@truvllo.com"
                >
                  support@truvllo.com
                </a>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-card-icon">🔒</div>
              <div>
                <div className="contact-card-title">Privacy & data</div>
                <p className="contact-card-desc">
                  Data requests, account deletion, or privacy concerns.
                </p>
                <a
                  className="contact-card-link"
                  href="mailto:privacy@truvllo.com"
                >
                  privacy@truvllo.com
                </a>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-card-icon">🤝</div>
              <div>
                <div className="contact-card-title">Partnerships</div>
                <p className="contact-card-desc">
                  Business partnerships, integrations, or media enquiries.
                </p>
                <a
                  className="contact-card-link"
                  href="mailto:partners@truvllo.com"
                >
                  partners@truvllo.com
                </a>
              </div>
            </div>
          </div>

          <div className="response-note">
            <strong>Response time:</strong> We aim to respond to all messages
            within 24–48 hours on business days. For urgent issues, include
            "URGENT" in your subject line.
          </div>
        </div>

        <div>
          {submitted ? (
            <div className="success-card">
              <div className="success-icon">✅</div>
              <div className="success-title">Message sent!</div>
              <p className="success-sub">
                Thanks for reaching out. We'll get back to you within 24–48
                hours. Keep an eye on your inbox.
              </p>
            </div>
          ) : (
            <div className="form-card">
              <div className="form-title">Send us a message</div>
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Adaeze Okafor"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Topic</label>
                <select
                  className="form-select"
                  value={form.topic}
                  onChange={(e) => update("topic", e.target.value)}
                >
                  <option value="">Select a topic</option>
                  <option value="general">General enquiry</option>
                  <option value="support">Technical support</option>
                  <option value="billing">Billing / subscription</option>
                  <option value="privacy">Privacy / data request</option>
                  <option value="feedback">Product feedback</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input"
                  placeholder="Tell us what's on your mind..."
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                />
              </div>
              <button
                className="form-btn"
                onClick={handleSubmit}
                disabled={
                  !form.name.trim() ||
                  !form.email.trim() ||
                  !form.message.trim() ||
                  loading
                }
              >
                {loading ? "Sending..." : "Send message →"}
              </button>
            </div>
          )}
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

