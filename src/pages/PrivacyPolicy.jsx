import { useNavigate } from "react-router-dom";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAF8F3; font-family: 'Plus Jakarta Sans', sans-serif; color: #0A0A0A; }
  :root { --cream: #FAF8F3; --green-deep: #1B4332; --green-light: #40916C; --green-pale: #D8F3DC; --ink: #0A0A0A; --ink-muted: #3A3A3A; --ink-subtle: #6B6B6B; --amber: #D4A017; --white: #FFFFFF; --border: rgba(10,10,10,0.08); }

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
  .last-updated { font-size: 0.82rem; color: var(--ink-subtle); margin-bottom: 48px; padding: 12px 18px; background: var(--green-pale); border-radius: 10px; display: inline-block; font-weight: 600; color: var(--green-deep); }

  .policy-section { margin-bottom: 48px; }
  .policy-section h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--ink); margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1.5px solid var(--border); }
  .policy-section p { font-size: 0.95rem; color: var(--ink-muted); line-height: 1.8; margin-bottom: 14px; }
  .policy-section p:last-child { margin-bottom: 0; }
  .policy-section ul { padding-left: 20px; margin-bottom: 14px; }
  .policy-section ul li { font-size: 0.95rem; color: var(--ink-muted); line-height: 1.8; margin-bottom: 6px; }
  .policy-section strong { color: var(--ink); font-weight: 600; }

  .contact-box { background: var(--white); border: 1.5px solid var(--border); border-radius: 18px; padding: 28px; margin-top: 48px; }
  .contact-box h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; }
  .contact-box p { font-size: 0.9rem; color: var(--ink-muted); line-height: 1.7; }
  .contact-box a { color: var(--green-light); text-decoration: none; font-weight: 600; }

  .footer-mini { background: var(--ink); padding: 32px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-mini-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 6px; }
  .footer-mini-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--amber); }
  .footer-mini-copy { font-size: 0.82rem; color: rgba(255,255,255,0.3); }
`;

export default function PrivacyPolicy() {
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
        <h1 className="page-hero-title">Privacy Policy</h1>
        <p className="page-hero-sub">
          We take your privacy seriously. Here's exactly what data we collect,
          why, and how we protect it.
        </p>
      </section>

      <div className="page-body">
        <span className="last-updated">Last updated: March 17, 2026</span>

        <div className="policy-section">
          <h2>1. Who we are</h2>
          <p>
            Truvllo ("we", "us", "our") is a personal finance application
            available at truvlloapp.vercel.app. We provide AI-powered budgeting
            tools to help individuals manage their money more effectively.
          </p>
          <p>
            By using Truvllo, you agree to the collection and use of information
            in accordance with this policy.
          </p>
        </div>

        <div className="policy-section">
          <h2>2. Information we collect</h2>
          <p>
            <strong>Account information:</strong> When you sign up, we collect
            your name and email address. This is used solely to identify your
            account.
          </p>
          <p>
            <strong>Financial data:</strong> We collect the expense and budget
            data you enter into the app. This includes amounts, categories,
            descriptions, and dates. This data is stored securely and never
            shared with third parties.
          </p>
          <p>
            <strong>Usage data:</strong> We collect anonymised usage data (e.g.
            which features you use, session duration) to help us improve the
            product. This data cannot be used to identify you.
          </p>
          <p>
            <strong>Device data:</strong> We may collect basic device
            information (browser type, operating system) for technical
            troubleshooting purposes.
          </p>
        </div>

        <div className="policy-section">
          <h2>3. How we use your data</h2>
          <ul>
            <li>To provide and improve the Truvllo service</li>
            <li>
              To power AI features (spending analysis, savings tips, budget
              recommendations)
            </li>
            <li>To send important product updates and account notifications</li>
            <li>
              To process payments via Paystack (we do not store card details)
            </li>
            <li>To respond to your support requests</li>
          </ul>
          <p>
            We do <strong>not</strong> sell your data. We do not share your
            financial data with advertisers, data brokers, or any third party
            for commercial purposes.
          </p>
        </div>

        <div className="policy-section">
          <h2>4. AI and your data</h2>
          <p>
            Truvllo uses smart inteligence to power its AI features. When you
            use an AI feature, your relevant financial data (anonymised where
            possible) is sent to Anthropic's API to generate a response. This
            data is processed in accordance with{" "}
            <a
              href="https://www.anthropic.com/privacy"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--green-light)", fontWeight: 600 }}
            >
              Truvllo privacy policy
            </a>
            .
          </p>
          <p>We do not use your data to train AI models.</p>
        </div>

        <div className="policy-section">
          <h2>5. Data storage and security</h2>
          <p>
            Your data is stored securely using Supabase, which provides
            encrypted storage and access controls. All data is transmitted over
            HTTPS. We implement industry-standard security measures to protect
            your information from unauthorised access.
          </p>
          <p>
            We retain your data for as long as your account is active. If you
            delete your account, your data is permanently deleted within 30
            days.
          </p>
        </div>

        <div className="policy-section">
          <h2>6. Your rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Export your data at any time via CSV export</li>
            <li>Withdraw consent for data processing at any time</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at the address below.
          </p>
        </div>

        <div className="policy-section">
          <h2>7. Cookies</h2>
          <p>
            Truvllo uses essential cookies only, these are required for the app
            to function (e.g. keeping you logged in). We do not use advertising
            or tracking cookies. For more details, see our Cookie Policy.
          </p>
        </div>

        <div className="policy-section">
          <h2>8. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. We'll notify you of any
            significant changes via email or an in-app notice. Continued use of
            Truvllo after changes take effect constitutes acceptance of the
            updated policy.
          </p>
        </div>

        <div className="contact-box">
          <h3>Questions about privacy?</h3>
          <p>
            If you have any questions about this Privacy Policy or how we handle
            your data, please contact us at{" "}
            <a href="mailto:privacy@truvllo.com">privacy@truvllo.com</a>. We aim
            to respond within 48 hours.
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
