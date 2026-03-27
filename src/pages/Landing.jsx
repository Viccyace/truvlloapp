import { Link, useNavigate } from "react-router-dom";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #FAF8F3;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0A0A0A;
  }

  :root {
    --cream: #FAF8F3;
    --cream-2: #F5F1E8;
    --green-deep: #1B4332;
    --green-mid: #2D6A4F;
    --green-light: #40916C;
    --green-pale: #D8F3DC;
    --ink: #0A0A0A;
    --ink-subtle: #6B6B6B;
    --amber: #D4A017;
    --amber-soft: #F1E0A6;
    --white: #FFFFFF;
    --border: rgba(10,10,10,0.08);
    --shadow: 0 12px 40px rgba(0,0,0,0.08);
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .page {
    min-height: 100vh;
    background: var(--cream);
  }

  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 76px;
    padding: 0 5%;
    background: rgba(10,10,10,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--white);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .nav-logo-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--amber);
    display: inline-block;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
    color: rgba(255,255,255,0.78);
    font-size: 0.95rem;
    font-weight: 600;
  }

  .nav-links button {
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .btn-ghost {
    padding: 11px 18px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.14);
    color: var(--white);
    background: transparent;
    font-weight: 700;
    cursor: pointer;
  }

  .btn-primary {
    padding: 12px 20px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, var(--amber), #E6B325);
    color: #111;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(212,160,23,0.24);
  }

  .hero {
    padding: 80px 5% 56px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 36px;
    align-items: center;
  }

  .hero-copy {
    max-width: 680px;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #111;
    color: #fff;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .hero-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--amber);
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.8rem, 6vw, 5.1rem);
    line-height: 0.98;
    letter-spacing: -0.03em;
    margin-bottom: 18px;
    color: var(--ink);
  }

  .hero-title em {
    font-style: italic;
    color: var(--green-light);
  }

  .hero-sub {
    font-size: 1.08rem;
    line-height: 1.8;
    color: var(--ink-subtle);
    max-width: 620px;
    margin-bottom: 28px;
  }

  .hero-cta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 18px;
  }

  .hero-trust {
    color: #4B4B4B;
    font-size: 0.92rem;
    line-height: 1.7;
  }

  .hero-card {
    background: linear-gradient(180deg, #1B4332, #143326);
    color: white;
    border-radius: 28px;
    padding: 24px;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
    min-height: 420px;
  }

  .hero-card::after {
    content: "";
    position: absolute;
    inset: auto -40px -60px auto;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(212,160,23,0.35), transparent 70%);
    border-radius: 50%;
  }

  .dashboard-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }

  .dashboard-brand {
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .dashboard-chip {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 0.8rem;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 16px;
  }

  .stat-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px;
    padding: 16px;
  }

  .stat-label {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.7);
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 1.35rem;
    font-weight: 800;
  }

  .chart-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px;
    padding: 18px;
    margin-bottom: 16px;
  }

  .chart-title {
    font-size: 0.88rem;
    color: rgba(255,255,255,0.78);
    margin-bottom: 14px;
  }

  .bars {
    display: flex;
    align-items: end;
    gap: 10px;
    height: 120px;
  }

  .bar {
    flex: 1;
    border-radius: 12px 12px 6px 6px;
    background: linear-gradient(180deg, var(--amber), #F1D27A);
  }

  .bar:nth-child(1) { height: 38%; }
  .bar:nth-child(2) { height: 52%; }
  .bar:nth-child(3) { height: 74%; }
  .bar:nth-child(4) { height: 58%; }
  .bar:nth-child(5) { height: 88%; }

  .mini-list {
    display: grid;
    gap: 10px;
  }

  .mini-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 0.9rem;
  }

  .section {
    padding: 72px 5%;
  }

  .section-head {
    max-width: 720px;
    margin-bottom: 28px;
  }

  .eyebrow {
    display: inline-block;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--green-light);
    margin-bottom: 10px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 1.08;
    margin-bottom: 12px;
  }

  .section-sub {
    color: var(--ink-subtle);
    line-height: 1.8;
    font-size: 1rem;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .feature-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.03);
  }

  .feature-icon {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }

  .feature-title {
    font-size: 1.05rem;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .feature-desc {
    color: var(--ink-subtle);
    line-height: 1.7;
    font-size: 0.95rem;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .step-card {
    background: linear-gradient(180deg, #FFF, #F8F4EB);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 24px;
  }

  .step-no {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #111;
    color: white;
    display: grid;
    place-items: center;
    font-weight: 800;
    margin-bottom: 14px;
  }

  .step-title {
    font-size: 1rem;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .step-desc {
    color: var(--ink-subtle);
    line-height: 1.7;
  }

  .pricing-wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }

  .price-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 26px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.04);
  }

  .price-card.featured {
    background: linear-gradient(180deg, #1B4332, #143326);
    color: white;
    border: none;
  }

  .price-name {
    font-size: 1rem;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .price-value {
    font-size: 2.4rem;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .price-sub {
    font-size: 0.95rem;
    line-height: 1.7;
    margin-bottom: 18px;
    color: inherit;
    opacity: 0.8;
  }

  .price-list {
    display: grid;
    gap: 12px;
    margin-bottom: 22px;
  }

  .price-item {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .cta-band {
    margin: 0 5% 72px;
    background: linear-gradient(135deg, #111, #1B4332);
    color: white;
    border-radius: 32px;
    padding: 34px 28px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: center;
  }

  .cta-band h3 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 4vw, 2.7rem);
    margin-bottom: 10px;
  }

  .cta-band p {
    color: rgba(255,255,255,0.78);
    line-height: 1.7;
    max-width: 680px;
  }

  .footer {
    background: #111;
    color: white;
    padding: 56px 5% 24px;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
    gap: 24px;
    margin-bottom: 28px;
  }

  .footer-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .footer-brand p {
    color: rgba(255,255,255,0.68);
    line-height: 1.8;
    max-width: 320px;
  }

  .footer-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .footer-col-title {
    font-size: 0.95rem;
    font-weight: 800;
    color: white;
    margin-bottom: 4px;
  }

  .footer-col a, .footer-col button {
    color: rgba(255,255,255,0.68);
    background: none;
    border: none;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .footer-col a:hover, .footer-col button:hover {
    color: white;
  }

  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 18px;
    color: rgba(255,255,255,0.45);
    font-size: 0.88rem;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  @media (max-width: 980px) {
    .hero,
    .pricing-wrap,
    .footer-grid,
    .feature-grid,
    .steps {
      grid-template-columns: 1fr;
    }

    .nav-links {
      display: none;
    }

    .cta-band {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 640px) {
    .nav {
      padding: 0 4%;
    }

    .nav-actions {
      gap: 8px;
    }

    .btn-ghost,
    .btn-primary {
      padding: 10px 14px;
      font-size: 0.9rem;
    }

    .hero,
    .section,
    .footer {
      padding-left: 4%;
      padding-right: 4%;
    }

    .cta-band {
      margin-left: 4%;
      margin-right: 4%;
      padding: 26px 20px;
    }

    .hero-card {
      min-height: auto;
    }

    .stat-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const FEATURES = [
  {
    icon: "💸",
    title: "Track spending with clarity",
    desc: "See where your money goes, spot patterns quickly, and stay in control without stress.",
  },
  {
    icon: "🎯",
    title: "Set budgets that fit real life",
    desc: "Create flexible budgets for monthly living, savings goals, and everyday expenses.",
  },
  {
    icon: "📈",
    title: "Get insights that guide better decisions",
    desc: "Understand your habits, improve your choices, and build confidence with money.",
  },
  {
    icon: "🧠",
    title: "Build stronger money habits",
    desc: "Stay consistent with routines that make budgeting easier and more sustainable.",
  },
  {
    icon: "🔒",
    title: "Private and secure",
    desc: "Your data stays protected while you focus on building a healthier financial life.",
  },
  {
    icon: "✨",
    title: "Simple by design",
    desc: "A clean experience that feels easy to use from the very first time you log in.",
  },
];

const STEPS = [
  {
    title: "Create your account",
    desc: "Sign up in minutes and start setting up your personal money dashboard.",
  },
  {
    title: "Add your budget and expenses",
    desc: "Enter your budget, track expenses, and organize your money in one place.",
  },
  {
    title: "Review your progress",
    desc: "Use insights and trends to improve your spending and stay on course.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGetStarted = () => navigate("/auth");
  const handleUpgradeClick = () => navigate("/auth");

  return (
    <>
      <style>{FONTS + styles}</style>

      <div className="page">
        <nav className="nav">
          <div className="nav-logo" onClick={() => navigate("/")}>
            <span className="nav-logo-dot" />
            Truvllo
          </div>

          <div className="nav-links">
            <button onClick={() => scrollToSection("features")}>
              Features
            </button>
            <button onClick={() => scrollToSection("how")}>How it works</button>
            <button onClick={() => scrollToSection("pricing")}>Pricing</button>
            <Link to="/blog">Blog</Link>
          </div>

          <div className="nav-actions">
            <button className="btn-ghost" onClick={() => navigate("/auth")}>
              Sign in
            </button>
            <button className="btn-primary" onClick={handleGetStarted}>
              Get started
            </button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-copy">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Smarter budgeting for real life
            </div>

            <h1 className="hero-title">
              Take control of your money with <em>clarity</em> and calm
            </h1>

            <p className="hero-sub">
              Truvllo helps you track expenses, plan your budget, and understand
              your spending habits with a clean, beautiful experience built for
              everyday life.
            </p>

            <div className="hero-cta">
              <button className="btn-primary" onClick={handleGetStarted}>
                Start free
              </button>
              <button
                className="btn-ghost"
                style={{ color: "#111", borderColor: "rgba(10,10,10,0.12)" }}
                onClick={() => scrollToSection("pricing")}
              >
                View pricing
              </button>
            </div>

            <div className="hero-trust">
              Built for people who want a simpler way to budget, track expenses,
              and make better money decisions.
            </div>
          </div>

          <div className="hero-card">
            <div className="dashboard-top">
              <div className="dashboard-brand">Truvllo Dashboard</div>
              <div className="dashboard-chip">This month</div>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Budget set</div>
                <div className="stat-value">₦350,000</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Spent so far</div>
                <div className="stat-value">₦218,400</div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">Weekly spending trend</div>
              <div className="bars">
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
              </div>
            </div>

            <div className="mini-list">
              <div className="mini-item">
                <span>Food & groceries</span>
                <strong>₦68,000</strong>
              </div>
              <div className="mini-item">
                <span>Transport</span>
                <strong>₦24,500</strong>
              </div>
              <div className="mini-item">
                <span>Utilities</span>
                <strong>₦18,300</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-head">
            <div className="eyebrow">Features</div>
            <h2 className="section-title">
              Everything you need to manage money better
            </h2>
            <p className="section-sub">
              From expense tracking to budget planning and financial insights,
              Truvllo gives you the essentials in one simple experience.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-title">{feature.title}</div>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="how">
          <div className="section-head">
            <div className="eyebrow">How it works</div>
            <h2 className="section-title">
              A simple flow that keeps you consistent
            </h2>
            <p className="section-sub">
              Start quickly, stay organized, and use your data to build better
              money habits over time.
            </p>
          </div>

          <div className="steps">
            {STEPS.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-no">{index + 1}</div>
                <div className="step-title">{step.title}</div>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="section-head">
            <div className="eyebrow">Pricing</div>
            <h2 className="section-title">
              Start free and upgrade when you need more
            </h2>
            <p className="section-sub">
              Begin with the essentials, then unlock deeper insights and more
              powerful planning tools when you're ready.
            </p>
          </div>

          <div className="pricing-wrap">
            <div className="price-card">
              <div className="price-name">Free</div>
              <div className="price-value">₦0</div>
              <div className="price-sub">
                Perfect for getting started with budgeting and expense tracking.
              </div>
              <div className="price-list">
                <div className="price-item">• Basic budgeting tools</div>
                <div className="price-item">• Expense tracking</div>
                <div className="price-item">• Core dashboard view</div>
              </div>
              <button
                className="btn-ghost"
                style={{ color: "#111", borderColor: "rgba(10,10,10,0.12)" }}
                onClick={handleGetStarted}
              >
                Start free
              </button>
            </div>

            <div className="price-card featured">
              <div className="price-name">Premium</div>
              <div className="price-value">
                ₦5,000
                <span style={{ fontSize: "1rem", opacity: 0.8 }}>/month</span>
              </div>
              <div className="price-sub">
                For users who want richer insights, stronger planning, and more
                control.
              </div>
              <div className="price-list">
                <div className="price-item">• Advanced insights and trends</div>
                <div className="price-item">• Smarter planning tools</div>
                <div className="price-item">
                  • Premium features as they launch
                </div>
              </div>
              <button className="btn-primary" onClick={handleUpgradeClick}>
                Upgrade plan
              </button>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div>
            <h3>Build better money habits with Truvllo</h3>
            <p>
              Join the people using Truvllo to simplify budgeting, stay aware of
              spending, and make calmer financial decisions.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={handleGetStarted}>
              Get started
            </button>
            <button
              className="btn-ghost"
              onClick={() => scrollToSection("features")}
            >
              Explore features
            </button>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">Truvllo</div>
              <p>
                Build better money habits, track expenses, and stay on top of
                your budget with confidence.
              </p>
            </div>

            <div className="footer-col">
              <div className="footer-col-title">Product</div>
              <button onClick={() => scrollToSection("features")}>
                Features
              </button>
              <button onClick={() => scrollToSection("pricing")}>
                Pricing
              </button>
              <button onClick={() => scrollToSection("how")}>
                How it works
              </button>
              <Link to="/blog">Blog</Link>
            </div>

            <div className="footer-col">
              <div className="footer-col-title">Company</div>
              <Link to="/about">About</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/contact">Contact</Link>
            </div>

            <div className="footer-col">
              <div className="footer-col-title">Connect</div>
              <a
                href="https://twitter.com/truvlloapp"
                target="_blank"
                rel="noreferrer"
              >
                Twitter / X
              </a>
              <a
                href="https://instagram.com/truvlloapp"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Truvllo. All rights reserved.</span>
            <span>Made for simpler, smarter money management.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
