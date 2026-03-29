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
  .last-updated { font-size: 0.82rem; margin-bottom: 48px; padding: 12px 18px; background: var(--green-pale); border-radius: 10px; display: inline-block; font-weight: 600; color: var(--green-deep); }
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

export default function TermsOfService() {
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
        <h1 className="page-hero-title">Terms of Service</h1>
        <p className="page-hero-sub">
          Please read these terms carefully before using Truvllo. They govern
          your use of our service.
        </p>
      </section>
      <div className="page-body">
        <span className="last-updated">Last updated: March 17, 2026</span>

        <div className="policy-section">
          <h2>1. Acceptance of terms</h2>
          <p>
            By creating an account or using Truvllo, you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please
            do not use the service.
          </p>
        </div>

        <div className="policy-section">
          <h2>2. Description of service</h2>
          <p>
            Truvllo is a personal finance and budgeting application that
            provides tools including expense tracking, budget management, and
            AI-powered financial insights. The service is available via web
            browser and as a Progressive Web App (PWA).
          </p>
        </div>

        <div className="policy-section">
          <h2>3. Account registration</h2>
          <p>
            You must provide accurate and complete information when creating an
            account. You are responsible for maintaining the security of your
            account and password. You must notify us immediately of any
            unauthorised access to your account.
          </p>
          <p>You must be at least 18 years old to use Truvllo.</p>
        </div>

        <div className="policy-section">
          <h2>4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use Truvllo for any unlawful purpose</li>
            <li>
              Attempt to gain unauthorised access to any part of the service
            </li>
            <li>
              Reverse engineer, copy, or distribute any part of the service
            </li>
            <li>
              Upload malicious code or interfere with the service's operation
            </li>
            <li>
              Use the service to process financial data belonging to others
              without their consent
            </li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>5. Free plan and premium subscription</h2>
          <p>
            Truvllo offers a free plan with core features and a Premium plan
            with additional AI features. The Premium plan is billed monthly or
            annually as selected at the time of purchase.
          </p>
          <p>
            <strong>Free trial:</strong> A 7-day Premium trial activates
            automatically when you log your first expense. No credit card is
            required for the trial.
          </p>
          <p>
            <strong>Cancellation:</strong> You may cancel your Premium
            subscription at any time. You will retain access to Premium features
            until the end of your current billing period. No refunds are issued
            for partial billing periods.
          </p>
          <p>
            <strong>Price changes:</strong> We may change our pricing with 30
            days' notice. Continued use after the notice period constitutes
            acceptance of the new pricing.
          </p>
        </div>

        <div className="policy-section">
          <h2>6. Financial disclaimer</h2>
          <p>
            Truvllo is a budgeting tool, not a financial advisor. The AI
            insights and recommendations provided are for informational purposes
            only and do not constitute financial advice. Always consult a
            qualified financial professional before making significant financial
            decisions.
          </p>
          <p>
            We are not responsible for any financial decisions made based on
            information provided by Truvllo.
          </p>
        </div>

        <div className="policy-section">
          <h2>7. Intellectual property</h2>
          <p>
            All content, features, and functionality of Truvllo — including but
            not limited to the design, code, text, graphics, and AI models — are
            owned by Truvllo and protected by intellectual property laws. You
            may not copy, modify, or distribute any part of the service without
            our written permission.
          </p>
        </div>

        <div className="policy-section">
          <h2>8. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Truvllo shall not be liable
            for any indirect, incidental, special, or consequential damages
            arising from your use of the service, including but not limited to
            loss of data, loss of revenue, or financial loss.
          </p>
          <p>
            Our total liability for any claim arising from your use of Truvllo
            shall not exceed the amount you paid us in the 12 months preceding
            the claim.
          </p>
        </div>

        <div className="policy-section">
          <h2>9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account if you
            violate these terms. You may delete your account at any time from
            the Settings page. Upon deletion, your data will be permanently
            removed within 30 days.
          </p>
        </div>

        <div className="policy-section">
          <h2>10. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. We will notify you of
            significant changes via email or in-app notice. Continued use of the
            service after changes take effect constitutes acceptance of the
            updated terms.
          </p>
        </div>

        <div className="contact-box">
          <h3>Questions about these terms?</h3>
          <p>
            Contact us at{" "}
            <a href="mailto:legal@truvllo.com">legal@truvllo.com</a> and we'll
            get back to you within 48 hours.
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

