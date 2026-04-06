/**
 * SpendingPersonalityCard.jsx
 * Shareable card showing spending personality based on top categories
 * Renders as a canvas-ready card that can be screenshot and shared
 */
import { useMemo, useRef } from "react";
import { useBudget } from "../providers/BudgetProvider";
import { useAuth } from "../providers/AuthProvider";

const PERSONALITIES = [
  {
    key: "food",
    emoji: "🍽️",
    label: "Food-First Spender",
    insight:
      "You live to eat well — {pct}% of your budget goes to food. Track it before it tracks you.",
  },
  {
    key: "transport",
    emoji: "🚗",
    label: "On-The-Move Spender",
    insight:
      "You're always somewhere — {pct}% on transport. Bolt and buses are taking a real chunk.",
  },
  {
    key: "bills",
    emoji: "💡",
    label: "Steady Bill Payer",
    insight:
      "You're reliable — {pct}% goes to bills. Fixed costs are eating your budget before you start.",
  },
  {
    key: "shopping",
    emoji: "🛍️",
    label: "Impulse Buyer",
    insight:
      "You love a good purchase — {pct}% on shopping. Small buys add up faster than you think.",
  },
  {
    key: "entertainment",
    emoji: "🎬",
    label: "Experience Collector",
    insight:
      "You invest in memories — {pct}% on entertainment. Life is short, but budgets are shorter.",
  },
  {
    key: "airtime",
    emoji: "📱",
    label: "Connected Spender",
    insight:
      "Always online — {pct}% on airtime and data. Staying connected has a real price tag.",
  },
  {
    key: "health",
    emoji: "💊",
    label: "Health-Conscious Spender",
    insight:
      "Your health comes first — {pct}% on health. An investment worth every naira.",
  },
  {
    key: "other",
    emoji: "💸",
    label: "Diversified Spender",
    insight:
      "Your spending is all over the place — {pct}% on miscellaneous items. Time to categorise.",
  },
];

export default function SpendingPersonalityCard({ onClose }) {
  const { expenses, totalSpent } = useBudget();
  const { displayName } = useAuth();
  const cardRef = useRef(null);

  const personality = useMemo(() => {
    if (!expenses.length) return null;

    // Calculate category totals
    const cats = {};
    expenses.forEach((e) => {
      const cat = e.category || "other";
      cats[cat] = (cats[cat] ?? 0) + Number(e.amount || 0);
    });

    // Top 3 categories
    const sorted = Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topCat = sorted[0]?.[0] ?? "other";
    const topAmt = sorted[0]?.[1] ?? 0;
    const topPct = totalSpent > 0 ? Math.round((topAmt / totalSpent) * 100) : 0;
    const template =
      PERSONALITIES.find((p) => p.key === topCat) ??
      PERSONALITIES[PERSONALITIES.length - 1];

    return {
      ...template,
      insight: template.insight.replace("{pct}", topPct),
      topPct,
      topCat,
      top3: sorted.map(([cat, _amt]) => ({
        cat,
        amt: Number(_amt),
        pct: totalSpent > 0 ? Math.round((Number(_amt) / totalSpent) * 100) : 0,
        p: PERSONALITIES.find((p) => p.key === cat),
      })),
    };
  }, [expenses, totalSpent]);

  const handleShare = async () => {
    const card = cardRef.current;
    if (!card) return;
    try {
      // Try native share first
      if (navigator.share) {
        await navigator.share({
          title: `My Truvllo Spending Personality`,
          text: `I'm a ${personality.label}! ${personality.insight}\n\nTrack yours at truvllo.app`,
        });
      } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(
          `💸 My Truvllo Spending Personality\n\n` +
            `${personality.emoji} ${personality.label}\n\n` +
            `"${personality.insight}"\n\n` +
            `Track yours at truvllo.app`,
        );
        alert("Copied to clipboard! Share it anywhere.");
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  if (!personality) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0A0A0A",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card (shareable area) */}
        <div
          ref={cardRef}
          style={{
            background: "linear-gradient(135deg,#1B4332,#0A0A0A)",
            padding: "32px 28px",
          }}
        >
          {/* Truvllo badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#D4A017",
              }}
            />
            <span
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Truvllo
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              spending personality
            </span>
          </div>

          {/* Emoji + title */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>
              {personality.emoji}
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              {personality.label}
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              "{personality.insight}"
            </div>
          </div>

          {/* Top 3 categories */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 24,
            }}
          >
            {personality.top3.map(({ cat, pct, p }, i) => (
              <div
                key={cat}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ fontSize: "1rem", width: 24 }}>
                  {p?.emoji ?? "💸"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.7)",
                        textTransform: "capitalize",
                      }}
                    >
                      {cat}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 100,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background:
                          i === 0 ? "#D4A017" : i === 1 ? "#40916C" : "#6B6B6B",
                        borderRadius: 100,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 16,
            }}
          >
            <div
              style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}
            >
              {displayName?.split(" ")[0] || "Truvllo User"} · this month
            </div>
            <div
              style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}
            >
              truvllo.app
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "20px 28px", display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              border: "1.5px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            onClick={handleShare}
            style={{
              flex: 2,
              padding: 12,
              border: "none",
              borderRadius: 12,
              background: "linear-gradient(135deg,#1B4332,#40916C)",
              color: "#fff",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Share my personality →
          </button>
        </div>
      </div>
    </div>
  );
}
