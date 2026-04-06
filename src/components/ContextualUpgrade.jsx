/**
 * ContextualUpgrade.jsx
 * Shows upgrade prompt ONLY when triggered by a real AI insight — not a timer.
 * Used in Dashboard when AI returns data above ₦10,000 in any category.
 */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { MONTHLY_PRICE_FMT, ANNUAL_PRICE_FMT, TRIAL_DAYS } from "../lib/config";

export default function ContextualUpgrade({ trigger, onDismiss }) {
  const navigate = useNavigate();
  const { isTrialing, trialDaysLeft } = useAuth();

  if (!trigger) return null;

  // trigger = { category, amount, sym } — the insight that fired this
  const { category, amount, sym = "₦" } = trigger;
  const formattedAmt = Number(amount).toLocaleString();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          background: "#FAF8F3",
          borderRadius: 24,
          padding: "36px 28px",
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>💡</div>

        {/* Headline — uses real data */}
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.35rem",
            fontWeight: 800,
            color: "#0A0A0A",
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          You've spent {sym}
          {formattedAmt} on {category} this month
        </div>

        <div
          style={{
            fontSize: "0.875rem",
            color: "#6B6B6B",
            lineHeight: 1.65,
            marginBottom: 24,
          }}
        >
          {isTrialing
            ? `Your AI insights expire in ${trialDaysLeft} days. Keep seeing exactly where your money goes.`
            : `Unlock AI spending insights, category caps, and WhatsApp alerts to stay in control.`}
        </div>

        {/* Pricing framing */}
        <div
          style={{
            background: "#D8F3DC",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#2D6A4F",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Premium — less than one Bolt ride per week
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: "#1B4332",
                }}
              >
                {sym}
                {MONTHLY_PRICE_FMT}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#2D6A4F" }}>
                per month
              </div>
            </div>
            <div style={{ color: "#2D6A4F", fontSize: "0.8rem" }}>or</div>
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: "#1B4332",
                }}
              >
                {sym}
                {ANNUAL_PRICE_FMT}/mo
              </div>
              <div style={{ fontSize: "0.72rem", color: "#2D6A4F" }}>
                billed annually (save 25%)
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/upgrade")}
          style={{
            width: "100%",
            padding: 14,
            border: "none",
            borderRadius: 12,
            background: "linear-gradient(135deg,#1B4332,#40916C)",
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 10,
            boxShadow: "0 4px 16px rgba(27,67,50,0.3)",
          }}
        >
          {isTrialing ? "Upgrade before trial ends →" : "Start Premium →"}
        </button>

        <button
          onClick={onDismiss}
          style={{
            width: "100%",
            padding: 12,
            border: "none",
            background: "transparent",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: "0.875rem",
            color: "#9B9B9B",
            cursor: "pointer",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
