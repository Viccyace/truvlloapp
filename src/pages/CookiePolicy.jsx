import { useNavigate } from "react-router-dom";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAF8F3; font-family: 'Plus Jakarta Sans', sans-serif; color: #0A0A0A; }
  :root { --cream: #FAF8F3; --green-deep: #1B4332; --green-light: #40916C; --green-pale: #D8F3DC; --ink: #0A0A0A; --ink-muted: #3A3A3A; --amber: #D4A017; --white: #FFFFFF; --border: rgba(10,10,10,0.08); }
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--ink); padding: 0 5%; height: 68px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); display: inline-block; margin-bottom: 2px; }
  .nav-back { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: none; border-radius: 100px; padding: 8px 18px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .nav-back:hover { background: rgba(255,255,255,0.14); color: var(--white); }
  .page-hero { background: var(--ink); padding: 140px 5% 80px; }
  .page-hero-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; display: block; }
  .page-hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; color: var(--white); line-height: 1.1; max-width: 600px; }
  .page-hero-sub { margin-top: 16px; font-size: 0.95rem; color: rgba(255,255,255,0.45); max-width: 500px; line-height: 1.7; }
  .page-body { max-width: 760px; margin: 0 auto; padding: 72px 5% 100px; }
  .last-updated { font-size: 0.82rem; margin-bottom: 48px; padding: 12px 18px; background: var(--green-pale); border-radius: 10px; display: inline-block; font-weight: 600; color: var(--green-deep); }
  .policy-section { margin-bottom: 48px; }
  .policy-section h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--ink); margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1.5px solid var(--border); }
  .policy-section p { font-size: 0.95rem; color: var(--ink-muted); line-height: 1.8; margin-bottom: 14px; }
  .policy-section p:last-child { margin-bottom: 0; }
  .policy-section strong { color: var(--ink); font-weight: 600; }
  .cookie-table { width: 100%; border-collapse: collapse; margin-top: 16px; border-radius: 12px; overflow: hidden; }
  .cookie-table th { background: var(--ink); color: var(--white); padding: 12px 16px; text-align: left; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .cookie-table td { padding: 12px 16px; font-size: 0.875rem; color: var(--ink-muted); border-bottom: 1px solid var(--border); }
  .cookie-table tr:last-child td { border-bottom: none; }
  .cookie-table tr:nth-child(even) td { background: rgba(10,10,10,0.02); }
  .contact-box { background: var(--white); border: 1.5px solid var(--border); border-radius: 18px; padding: 28px; margin-top: 48px; }
  .contact-box h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; }
  .contact-box p { font-size: 0.9rem; color: var(--ink-muted); line-height: 1.7; }
  .contact-box a { color: var(--green-light); text-decoration: none; font-weight: 600; }
  .footer-mini { background: var(--ink); padding: 32px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-mini-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 6px; }
  .footer-mini-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  .footer-mini-copy { font-size: 0.82rem; color: rgba(255,255,255,0.3); }
`;

export default function CookiePolicy() {
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
        <span className="page-hero-label">Legal</span>
        <h1 className="page-hero-title">Cookie Policy</h1>
        <p className="page-hero-sub">
          We keep cookies to a minimum. Here's exactly what we use and why.
        </p>
      </section>
      <div className="page-body">
        <span className="last-updated">Last updated: March 17, 2026</span>

        <div className="policy-section">
          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help the site remember information about your visit,
            such as keeping you logged in.
          </p>
        </div>

        <div className="policy-section">
          <h2>How we use cookies</h2>
          <p>
            Truvllo uses <strong>essential cookies only</strong>. We do not use
            advertising cookies, tracking cookies, or third-party analytics
            cookies. We believe your browsing behaviour is your own business.
          </p>
        </div>

        <div className="policy-section">
          <h2>Cookies we use</h2>
          <table className="cookie-table">
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>truvllo_auth</strong>
                </td>
                <td>Keeps you logged in to your account</td>
                <td>Session / until logout</td>
              </tr>
              <tr>
                <td>
                  <strong>truvllo_install_dismissed</strong>
                </td>
                <td>Remembers if you've dismissed the PWA install prompt</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>
                  <strong>truvllo_preloader_shown</strong>
                </td>
                <td>
                  Tracks whether the app intro screen has been shown this
                  session
                </td>
                <td>Session only</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="policy-section">
          <h2>What we don't use</h2>
          <p>
            We do <strong>not</strong> use:
          </p>
          <p>— Google Analytics or any third-party analytics platform</p>
          <p>— Facebook Pixel or any advertising tracking</p>
          <p>— Any cookies that track you across other websites</p>
          <p>— Any cookies that build a profile of your browsing behaviour</p>
        </div>

        <div className="policy-section">
          <h2>Managing cookies</h2>
          <p>
            You can control cookies through your browser settings. Note that
            disabling the <strong>truvllo_auth</strong> cookie will prevent you
            from staying logged in and you'll need to sign in each time you
            visit.
          </p>
          <p>
            As a Progressive Web App (PWA), Truvllo also uses localStorage and
            sessionStorage for app functionality. These are not cookies and
            cannot be controlled via browser cookie settings, but you can clear
            them through your browser's developer tools or by clearing site
            data.
          </p>
        </div>

        <div className="contact-box">
          <h3>Questions about cookies?</h3>
          <p>
            Contact us at{" "}
            <a href="mailto:privacy@truvllo.com">privacy@truvllo.com</a> and
            we'll get back to you within 48 hours.
          </p>
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
