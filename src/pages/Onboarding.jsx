import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

const styles = `
  /* your onboarding styles here */
`;

const CONFETTI_COLORS = [
  "#40916C",
  "#D4A017",
  "#1B4332",
  "#52B788",
  "#F0C040",
  "#74C69D",
];

function ConfettiPiece({ style }) {
  return <div className="confetti-piece" style={style} />;
}

function Confetti({ show }) {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    animationDelay: `${Math.random() * 0.6}s`,
    animationDuration: `${0.9 + Math.random() * 0.8}s`,
    width: `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 8}px`,
    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
  }));

  if (!show) return null;

  return (
    <div className="confetti-wrap">
      {pieces.map((piece, i) => (
        <ConfettiPiece key={i} style={piece} />
      ))}
    </div>
  );
}
export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState({
    currency: "NGN",
    budgetName: "",
    monthlyBudget: "",
    period: "monthly",
    categories: ["food", "transport"],
  });

  const onChange = (key, val) => {
    setData((d) => ({ ...d, [key]: val }));
    if (errorMsg) setErrorMsg("");
  };

  const blobColor =
    step === 1
      ? "rgba(64,145,108,0.22)"
      : step === 2
        ? "rgba(212,160,23,0.18)"
        : "rgba(27,67,50,0.2)";

  const handleFinish = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setErrorMsg("");

      const { error } = await completeOnboarding({
        currency: data.currency,
        _budgetName: data.budgetName,
        _period: data.period,
      });

      if (error) {
        console.error("Onboarding completion failed:", error);
        setErrorMsg(
          error.message ||
            "We could not complete onboarding. Please try again.",
        );
        setLoading(false);
        return;
      }

      setDone(true);
      setShowConfetti(true);
      setLoading(false);

      setTimeout(() => setShowConfetti(false), 1800);
    } catch (err) {
      console.error("Onboarding error:", err);
      setErrorMsg(
        err?.message || "Something went wrong while finishing onboarding.",
      );
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleSkip = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setErrorMsg("");

      const { error } = await completeOnboarding({
        currency: data.currency || "NGN",
        _budgetName: data.budgetName,
        _period: data.period,
      });

      if (error) {
        console.error("Skip onboarding failed:", error);
        setErrorMsg(error.message || "We could not skip onboarding right now.");
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Skip onboarding error:", err);
      setErrorMsg(err?.message || "Something went wrong while skipping.");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <>
        <style>{FONTS + styles}</style>
        <Confetti show={showConfetti} />
        <div className="success-root">
          <div className="success-check">✓</div>
          <h1
            className="success-title"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            You're all set!
          </h1>
          <p className="success-sub">
            Your budget is ready. Start logging expenses to activate your 7-day
            Premium trial and unlock all AI features instantly.
          </p>
          <button className="success-btn" onClick={handleGoToDashboard}>
            Go to my Dashboard →
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{FONTS + styles}</style>
      <Confetti show={showConfetti} />

      <div className="ob-root">
        <div
          className="ob-blob ob-blob-1"
          style={{
            background: `radial-gradient(circle, ${blobColor} 0%, transparent 70%)`,
          }}
        />
        <div
          className="ob-blob ob-blob-2"
          style={{
            background:
              "radial-gradient(circle, rgba(212,160,23,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="ob-topbar">
          <div className="ob-logo">
            <span className="ob-logo-dot" />
            Truvllo
          </div>
          <button className="ob-skip" onClick={handleSkip} disabled={loading}>
            {loading ? "Please wait..." : "Skip for now"}
          </button>
        </div>

        <div className="ob-progress">
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
              {[1, 2, 3].map((s, i) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    flex: i < 2 ? 1 : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className={`ob-step-circle ${step > s ? "done" : step === s ? "active" : "upcoming"}`}
                    >
                      {step > s ? <span className="ob-step-check">✓</span> : s}
                    </div>
                    <div
                      className={`ob-step-label ${step > s ? "done" : step === s ? "active" : "upcoming"}`}
                    >
                      {s === 1 ? "Currency" : s === 2 ? "Budget" : "Confirm"}
                    </div>
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        flex: 1,
                        paddingBottom: 22,
                        margin: "0 6px",
                        marginTop: 16,
                      }}
                    >
                      <div className="ob-step-connector">
                        <div
                          className="ob-step-connector-fill"
                          style={{ width: step > s ? "100%" : "0%" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ob-card-wrap">
          <div className="ob-card" key={step}>
            {errorMsg && (
              <div
                style={{
                  marginBottom: 18,
                  background: "rgba(192,57,43,0.08)",
                  border: "1.5px solid rgba(192,57,43,0.2)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: "0.875rem",
                  color: "#C0392B",
                  lineHeight: 1.5,
                }}
              >
                {errorMsg}
              </div>
            )}

            {step === 1 && (
              <Step1
                data={data}
                onChange={onChange}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <Step2
                data={data}
                onChange={onChange}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <Step3
                data={data}
                onBack={() => setStep(2)}
                onFinish={handleFinish}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
