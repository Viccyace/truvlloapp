import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #FAF8F3; }

  :root {
    --cream: #FAF8F3; --cream-dark: #F0EDE4;
    --green-deep: #1B4332; --green-mid: #2D6A4F; --green-light: #40916C; --green-pale: #D8F3DC;
    --ink: #0A0A0A; --ink-muted: #3A3A3A; --ink-subtle: #6B6B6B;
    --amber: #D4A017; --white: #FFFFFF; --error: #C0392B; --border: rgba(10,10,10,0.12);
  }

  .auth-root { display: flex; min-height: 100vh; }

  .auth-left {
    width: 44%; background: var(--ink);
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 48px 56px; position: relative; overflow: hidden; flex-shrink: 0;
  }
  @media (max-width: 860px) { .auth-left { display: none; } }
  .auth-left-bg { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }
  .left-blob-1 { width: 420px; height: 420px; background: radial-gradient(circle, rgba(64,145,108,0.2) 0%, transparent 70%); top: -80px; right: -100px; }
  .left-blob-2 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(212,160,23,0.1) 0%, transparent 70%); bottom: 40px; left: -60px; }
  .auth-logo { display: flex; align-items: center; gap: 8px; font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--white); position: relative; z-index: 1; cursor: pointer; }
  .auth-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); }
  .auth-left-center { position: relative; z-index: 1; }
  .auth-left-headline { font-family: 'Playfair Display', serif; font-size: 2.6rem; font-weight: 900; line-height: 1.12; color: var(--white); letter-spacing: -0.02em; margin-bottom: 20px; }
  .auth-left-headline em { font-style: italic; color: rgba(255,255,255,0.45); }
  .auth-left-sub { font-size: 0.95rem; color: rgba(255,255,255,0.45); line-height: 1.7; max-width: 320px; }
  .auth-left-stats { display: flex; gap: 32px; margin-top: 40px; position: relative; z-index: 1; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 900; color: var(--white); }
  .stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.35); font-weight: 500; margin-top: 2px; }
  .auth-testimonial { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 24px; position: relative; z-index: 1; }
  .auth-quote-mark { font-family: 'Playfair Display', serif; font-size: 3rem; line-height: 0.6; color: var(--amber); opacity: 0.6; margin-bottom: 12px; display: block; }
  .auth-testimonial-text { font-size: 0.9rem; color: rgba(255,255,255,0.65); line-height: 1.65; font-family: 'Playfair Display', serif; font-style: italic; margin-bottom: 16px; }
  .auth-testimonial-author { display: flex; align-items: center; gap: 10px; }
  .auth-testimonial-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--green-mid), var(--green-light)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: var(--white); flex-shrink: 0; }
  .auth-testimonial-name { font-size: 0.85rem; font-weight: 700; color: var(--white); }
  .auth-testimonial-role { font-size: 0.75rem; color: rgba(255,255,255,0.35); }

  .auth-right { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 5%; background: var(--cream); min-height: 100vh; overflow-y: auto; }
  .auth-right-inner { width: 100%; max-width: 420px; }
  .auth-mobile-logo { display: none; align-items: center; justify-content: center; gap: 8px; font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--ink); margin-bottom: 36px; cursor: pointer; }
  .auth-mobile-logo-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--amber); }
  @media (max-width: 860px) { .auth-mobile-logo { display: flex; } }

  .auth-tabs { display: flex; background: var(--cream-dark); border-radius: 14px; padding: 4px; margin-bottom: 36px; gap: 4px; }
  .auth-tab { flex: 1; border: none; border-radius: 10px; padding: 11px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.22s; background: transparent; color: var(--ink-subtle); }
  .auth-tab.active { background: var(--white); color: var(--ink); box-shadow: 0 2px 10px rgba(0,0,0,0.09); }

  .auth-form-title { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 800; color: var(--ink); margin-bottom: 6px; letter-spacing: -0.015em; }
  .auth-form-sub { font-size: 0.9rem; color: var(--ink-subtle); margin-bottom: 28px; line-height: 1.5; }
  .form-row { display: flex; gap: 14px; }
  .form-row .field-wrap { flex: 1; }
  .field-wrap { margin-bottom: 18px; }
  .field-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--ink-muted); margin-bottom: 7px; }
  .field-input { width: 100%; padding: 13px 16px; border: 1.5px solid var(--border); border-radius: 12px; background: var(--white); color: var(--ink); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 500; outline: none; transition: border-color 0.2s, box-shadow 0.2s; -webkit-appearance: none; }
  .field-input::placeholder { color: rgba(10,10,10,0.3); }
  .field-input:focus { border-color: var(--green-light); box-shadow: 0 0 0 3px rgba(64,145,108,0.1); }
  .field-input.error { border-color: var(--error); }
  .field-error { font-size: 0.75rem; color: var(--error); margin-top: 5px; font-weight: 500; }
  .password-wrap { position: relative; }
  .password-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--ink-subtle); font-size: 0.8rem; font-weight: 600; padding: 4px; }
  .form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
  .forgot-link { font-size: 0.85rem; color: var(--green-mid); font-weight: 600; text-decoration: none; cursor: pointer; }
  .forgot-link:hover { color: var(--green-deep); }
  .submit-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, var(--green-deep), var(--green-light)); color: var(--white); border: none; border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.25s; margin-bottom: 20px; box-shadow: 0 6px 24px rgba(27,67,50,0.25); display: flex; align-items: center; justify-content: center; gap: 8px; }
  .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 32px rgba(27,67,50,0.35); }
  .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; font-size: 0.8rem; color: rgba(10,10,10,0.3); font-weight: 500; }
  .divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: var(--border); }
  .social-btn { width: 100%; padding: 13px; background: var(--white); color: var(--ink); border: 1.5px solid var(--border); border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .social-btn:hover { border-color: rgba(10,10,10,0.25); background: var(--cream-dark); }
  .google-icon { width: 18px; height: 18px; }
  .switch-text { text-align: center; font-size: 0.875rem; color: var(--ink-subtle); margin-top: 24px; }
  .switch-text a { color: var(--green-mid); font-weight: 700; text-decoration: none; cursor: pointer; }
  .trial-callout { background: var(--green-pale); border-radius: 12px; padding: 14px 16px; display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; border: 1px solid rgba(27,67,50,0.12); }
  .trial-callout-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
  .trial-callout-text { font-size: 0.82rem; color: var(--green-deep); line-height: 1.55; font-weight: 500; }
  .trial-callout-text strong { font-weight: 700; }
  .global-error { background: rgba(192,57,43,0.08); border: 1.5px solid rgba(192,57,43,0.2); border-radius: 12px; padding: 12px 16px; font-size: 0.875rem; color: var(--error); margin-bottom: 18px; line-height: 1.5; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.4); border-top-color: var(--white); border-radius: 50%; animation: spin 0.7s linear infinite; }
  .success-screen { text-align: center; padding: 20px 0; }
  .success-icon { font-size: 3rem; margin-bottom: 16px; }
  .success-title { font-family: 'Playfair Display', serif; font-size: 1.7rem; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
  .success-sub { font-size: 0.9rem; color: var(--ink-subtle); line-height: 1.65; }
`;

const GoogleIcon = () => (
  <svg
    className="google-icon"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

function LoginForm({ onSwitch }) {
  const { signIn, signInWithGoogle, sendPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = "Enter a valid email address";
    }
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});
    setGlobalError("");
    setLoading(true);

    try {
      const { error } = await signIn({ email, password });

      if (error) {
        setGlobalError(
          error.message || "Invalid email or password. Please try again.",
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setGlobalError(err?.message || "Could not sign you in.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: "Enter your email first" });
      return;
    }

    setLoading(true);
    setGlobalError("");

    try {
      const { error } = await sendPasswordReset(email);
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setGlobalError(err?.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGlobalError("");
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setGlobalError(error.message || "Google sign-in failed.");
      }
    } catch (err) {
      setGlobalError(err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="success-screen">
        <div className="success-icon">📧</div>
        <div className="success-title">Check your inbox</div>
        <p className="success-sub">
          We've sent a password reset link to <strong>{email}</strong>. Check
          your spam folder if you don't see it.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-form-title">Welcome back</h1>
      <p className="auth-form-sub">
        Sign in to your Truvllo account and pick up where you left off.
      </p>

      {globalError && <div className="global-error">{globalError}</div>}

      <div className="field-wrap">
        <label className="field-label">Email address</label>
        <input
          className={`field-input${errors.email ? " error" : ""}`}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((x) => ({ ...x, email: "" }));
            setGlobalError("");
          }}
        />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="field-wrap">
        <label className="field-label">Password</label>
        <div className="password-wrap">
          <input
            className={`field-input${errors.password ? " error" : ""}`}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((x) => ({ ...x, password: "" }));
              setGlobalError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <div className="field-error">{errors.password}</div>
        )}
      </div>

      <div className="form-options">
        <div />
        <a className="forgot-link" onClick={handleForgotPassword}>
          Forgot password?
        </a>
      </div>

      <button className="submit-btn" onClick={handleLogin} disabled={loading}>
        {loading ? <div className="spinner" /> : "Sign in to Truvllo"}
      </button>

      <div className="divider">or continue with</div>
      <button className="social-btn" onClick={handleGoogle} disabled={loading}>
        <GoogleIcon /> Continue with Google
      </button>

      <div className="switch-text">
        Don't have an account? <a onClick={onSwitch}>Create one free</a>
      </div>
    </>
  );
}

function SignupForm({ onSwitch }) {
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = "Enter a valid email address";
    }
    if (!password) e.password = "Password is required";
    else if (password.length < 8) {
      e.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) {
      e.confirmPassword = "Passwords don't match";
    }
    if (!agreeTerms) e.terms = "You must agree to the terms to continue";
    return e;
  };

  const clearErr = (key) => setErrors((x) => ({ ...x, [key]: "" }));

  const handleSignup = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setErrors({});
    setGlobalError("");
    setLoading(true);

    try {
      const { error } = await signUp({
        email,
        password,
        firstName,
        lastName,
      });

      if (error) {
        if (error.message?.includes("already registered")) {
          setGlobalError(
            "An account with this email already exists. Try signing in instead.",
          );
        } else {
          setGlobalError(
            error.message || "Something went wrong. Please try again.",
          );
        }
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setGlobalError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGlobalError("");
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setGlobalError(error.message || "Google sign-in failed.");
      }
    } catch (err) {
      setGlobalError(err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-screen">
        <div className="success-icon">🎉</div>
        <div className="success-title">Account created!</div>
        <p className="success-sub">
          Welcome to Truvllo, {firstName}! Your account is ready. Continue to
          sign in.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-form-title">Create your account</h1>
      <p className="auth-form-sub">Free forever. No credit card required.</p>

      <div className="trial-callout">
        <span className="trial-callout-icon">🎁</span>
        <div className="trial-callout-text">
          <strong>7-day Premium trial included</strong> — unlocks automatically
          when you log your first expense. No card needed.
        </div>
      </div>

      {globalError && <div className="global-error">{globalError}</div>}

      <div className="form-row">
        <div className="field-wrap">
          <label className="field-label">First name</label>
          <input
            className={`field-input${errors.firstName ? " error" : ""}`}
            type="text"
            placeholder="Adaeze"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearErr("firstName");
            }}
          />
          {errors.firstName && (
            <div className="field-error">{errors.firstName}</div>
          )}
        </div>
        <div className="field-wrap">
          <label className="field-label">Last name</label>
          <input
            className={`field-input${errors.lastName ? " error" : ""}`}
            type="text"
            placeholder="Okafor"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearErr("lastName");
            }}
          />
          {errors.lastName && (
            <div className="field-error">{errors.lastName}</div>
          )}
        </div>
      </div>

      <div className="field-wrap">
        <label className="field-label">Email address</label>
        <input
          className={`field-input${errors.email ? " error" : ""}`}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearErr("email");
            setGlobalError("");
          }}
        />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="field-wrap">
        <label className="field-label">Password</label>
        <div className="password-wrap">
          <input
            className={`field-input${errors.password ? " error" : ""}`}
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearErr("password");
            }}
          />
          <button
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <div className="field-error">{errors.password}</div>
        )}
      </div>

      <div className="field-wrap">
        <label className="field-label">Confirm password</label>
        <div className="password-wrap">
          <input
            className={`field-input${errors.confirmPassword ? " error" : ""}`}
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearErr("confirmPassword");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
          />
          <button
            className="password-toggle"
            onClick={() => setShowConfirm((v) => !v)}
            type="button"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="field-error">{errors.confirmPassword}</div>
        )}
      </div>

      <div className="field-wrap" style={{ marginBottom: 22 }}>
        <label className="checkbox-wrap">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              clearErr("terms");
            }}
          />
          <span className="checkbox-label">
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--green-mid)", fontWeight: 600 }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--green-mid)", fontWeight: 600 }}
            >
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.terms && (
          <div className="field-error" style={{ marginTop: 6 }}>
            {errors.terms}
          </div>
        )}
      </div>

      <button className="submit-btn" onClick={handleSignup} disabled={loading}>
        {loading ? <div className="spinner" /> : "Create my free account"}
      </button>

      <div className="switch-text">
        Already have an account? <a onClick={onSwitch}>Sign in</a>
      </div>
    </>
  );
}

function LeftPanel({ mode }) {
  const navigate = useNavigate();

  return (
    <div className="auth-left">
      <div className="auth-left-bg left-blob-1" />
      <div className="auth-left-bg left-blob-2" />
      <div className="auth-logo" onClick={() => navigate("/")}>
        <span className="auth-logo-dot" />
        Truvllo
      </div>
      <div className="auth-left-center">
        <h2 className="auth-left-headline">
          {mode === "login" ? (
            <>
              Your money is
              <br />
              <em>waiting for you</em>
            </>
          ) : (
            <>
              Take control of
              <br />
              <em>your finances today</em>
            </>
          )}
        </h2>
        <p className="auth-left-sub">
          {mode === "login"
            ? "Welcome back. Your budget, pace, and AI insights are right where you left them."
            : "The AI budgeting app that thinks with you. Free to start, powerful from day one."}
        </p>
        <div className="auth-left-stats">
          <div>
            <div className="stat-val">2,400+</div>
            <div className="stat-label">Active users</div>
          </div>
          <div>
            <div className="stat-val">6</div>
            <div className="stat-label">AI features</div>
          </div>
          <div>
            <div className="stat-val">4.9★</div>
            <div className="stat-label">User rating</div>
          </div>
        </div>
      </div>
      <div className="auth-testimonial">
        <span className="auth-quote-mark">"</span>
        <p className="auth-testimonial-text">
          The AI spending coach saved me ₦40k last month. It spotted I was
          overspending on food delivery before I even noticed.
        </p>
        <div className="auth-testimonial-author">
          <div className="auth-testimonial-avatar">K</div>
          <div>
            <div className="auth-testimonial-name">Korede F.</div>
            <div className="auth-testimonial-role">
              Software Engineer, Abuja
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPages() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

  return (
    <>
      <style>{FONTS + styles}</style>
      <div className="auth-root">
        <LeftPanel mode={mode} />
        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="auth-mobile-logo" onClick={() => navigate("/")}>
              <span className="auth-mobile-logo-dot" />
              Truvllo
            </div>
            <div className="auth-tabs">
              <button
                className={`auth-tab${mode === "login" ? " active" : ""}`}
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
              <button
                className={`auth-tab${mode === "signup" ? " active" : ""}`}
                onClick={() => setMode("signup")}
              >
                Create account
              </button>
            </div>
            {mode === "login" ? (
              <LoginForm onSwitch={() => setMode("signup")} />
            ) : (
              <SignupForm onSwitch={() => setMode("login")} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
