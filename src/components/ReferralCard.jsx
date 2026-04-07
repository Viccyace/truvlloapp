/**
 * ReferralCard.jsx
 * WhatsApp referral program — invite a friend, both get 7 extra days
 */
import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";

export default function ReferralCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id?.slice(0, 8).toUpperCase() ?? "TRUVLLO";
  const referralLink = `https://www.truvllo.app/auth?ref=${referralCode}`;

  const whatsappMsg = encodeURIComponent(
    `Hey! I've been using Truvllo to track my spending — it actually shows where my salary goes 🤑\n\n` +
      `Sign up with my link and get a 21-day free trial instead of 14:\n` +
      `${referralLink}`,
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#1B4332,#2D6A4F)",
        borderRadius: 16,
        padding: "20px 20px",
        color: "#fff",
      }}
    >
      <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🎁</div>
      <div
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        Invite a friend, both get 7 extra days
      </div>
      <div
        style={{
          fontSize: "0.82rem",
          color: "rgba(255,255,255,0.65)",
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        Share your link. When your friend logs their first expense, they get a
        21-day trial. You get 7 bonus days on your trial — one reward, for your
        first referral only.
      </div>

      {/* Referral link */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.8)",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          truvllo.app/auth?ref={referralCode}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? "#40916C" : "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: 8,
            padding: "6px 12px",
            color: "#fff",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* WhatsApp share */}
      <a
        href={`https://wa.me/?text=${whatsappMsg}`}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "#25D366",
          borderRadius: 10,
          padding: "12px 16px",
          color: "#fff",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontSize: "0.875rem",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        💬 Share on WhatsApp
      </a>
    </div>
  );
}
