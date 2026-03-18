export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [data, setData] = useState({
    currency: "NGN",
    budgetName: "",
    monthlyBudget: "",
    period: "monthly",
    categories: ["food", "transport"],
  });

  const onChange = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const blobColor =
    step === 1
      ? "rgba(64,145,108,0.22)"
      : step === 2
        ? "rgba(212,160,23,0.18)"
        : "rgba(27,67,50,0.2)";

  const handleFinish = async () => {
    try {
      setLoading(true);

      const { error } = await completeOnboarding({
        currency: data.currency,
        _budgetName: data.budgetName,
        _period: data.period,
      });

      if (error) {
        console.error("Onboarding completion failed:", error);
        setLoading(false);
        return;
      }

      setLoading(false);
      setDone(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    } catch (err) {
      console.error("Onboarding error:", err);
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleSkip = async () => {
    try {
      setLoading(true);

      const { error } = await completeOnboarding({
        currency: data.currency || "NGN",
        _budgetName: data.budgetName,
        _period: data.period,
      });

      if (error) {
        console.error("Skip onboarding failed:", error);
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Skip onboarding error:", err);
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
            Skip for now
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
