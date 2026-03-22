export default function BudgetPage() {
  const { isPremiumOrTrial } = useAuth();
  const {
    activeBudget,
    budgets = [],
    categoryCaps = [],
    recurring = [],
    setActiveBudget,
    addBudget,
    updateBudget,
    addCategoryCap,
    updateCategoryCap,
    deleteCategoryCap,
    addRecurringExpense,
    deleteRecurringExpense,
    totalSpent,
    remaining,
    daysLeft,
  } = useBudget();

  const isPremium = isPremiumOrTrial;

  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const currentBudget =
    activeBudget || budgets.find((b) => b.is_active) || null;

  const budgetAmount = Number(currentBudget?.amount || 0);
  const spentAmount = Number(totalSpent || 0);
  const remainingAmount = Number(
    remaining || Math.max(0, budgetAmount - spentAmount),
  );
  const daysLeftCount = Number(daysLeft || 0);

  const spentPct =
    budgetAmount > 0
      ? Math.min(100, Math.round((spentAmount / budgetAmount) * 100))
      : 0;

  const saveBudget = async (data) => {
    try {
      if (data.id && budgets.find((b) => b.id === data.id)) {
        await updateBudget(data.id, {
          name: data.name,
          amount: Number(data.amount),
          period: data.period,
          start: data.start,
          end: data.end,
        });
        setToast("Budget updated");
      } else {
        await addBudget({
          name: data.name,
          amount: Number(data.amount),
          period: data.period,
          start: data.start,
          end: data.end,
        });
        setToast("Budget created");
      }
      setModal(null);
    } catch (error) {
      console.error("Save budget error:", error);
      setToast(error?.message || "Could not save budget");
    }
  };

  const switchBudget = async (id) => {
    try {
      await setActiveBudget(id);
      const b = budgets.find((item) => item.id === id);
      setToast(b ? `Switched to "${b.name}"` : "Budget switched");
    } catch (error) {
      console.error("Switch budget error:", error);
      setToast(error?.message || "Could not switch budget");
    }
  };

  const updateCap = async (id, newLimit) => {
    try {
      await updateCategoryCap(id, Number(newLimit));
      setToast("Cap updated");
    } catch (error) {
      console.error("Update cap error:", error);
      setToast(error?.message || "Could not update cap");
    }
  };

  const deleteCap = async (id) => {
    try {
      await deleteCategoryCap(id);
      setToast("Cap removed");
    } catch (error) {
      console.error("Delete cap error:", error);
      setToast(error?.message || "Could not remove cap");
    }
  };

  const addCap = async () => {
    try {
      const usedCats = categoryCaps.map((c) => c.cat || c.category);
      const available = CATS.filter((c) => !usedCats.includes(c.id));
      if (!available.length) return;

      const first = available[0];
      await addCategoryCap({
        category: first.id,
        limit: 20000,
      });
      setToast(`${first.label} cap added`);
    } catch (error) {
      console.error("Add cap error:", error);
      setToast(error?.message || "Could not add cap");
    }
  };

  const addRecurring = async (data) => {
    try {
      await addRecurringExpense({
        category: data.cat,
        description: data.name,
        amount: Number(data.amount),
        frequency: data.freq,
      });
      setModal(null);
      setToast(`${data.name} added as recurring`);
    } catch (error) {
      console.error("Add recurring error:", error);
      setToast(error?.message || "Could not add recurring expense");
    }
  };

  const handleDeleteRecurring = async (id) => {
    try {
      await deleteRecurringExpense(id);
      setToast("Recurring expense removed");
    } catch (error) {
      console.error("Delete recurring error:", error);
      setToast(error?.message || "Could not remove recurring expense");
    }
  };

  const totalRecurring = recurring.reduce(
    (s, r) => s + Number(r.amount || 0),
    0,
  );

  return (
    <>
      <style>{FONTS + styles}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {modal === "new_budget" && (
        <BudgetModal onSave={saveBudget} onClose={() => setModal(null)} />
      )}
      {modal === "edit_budget" && currentBudget && (
        <BudgetModal
          budget={currentBudget}
          onSave={saveBudget}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "new_recurring" && (
        <RecurringModal onSave={addRecurring} onClose={() => setModal(null)} />
      )}

      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Budget</div>
            <div className="page-sub">
              Manage your active budget, caps, and fixed expenses
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => setModal("new_budget")}
          >
            + New Budget
          </button>
        </div>

        <div className="active-hero">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-top">
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Active Budget
              </div>
              <div className="hero-name" style={{ marginTop: 10 }}>
                {currentBudget?.name || "No active budget"}
              </div>
              <div className="hero-period">
                {currentBudget?.start || "—"}{" "}
                {currentBudget?.end ? `– ${currentBudget.end}` : ""} ·{" "}
                {currentBudget?.period || "—"}
              </div>
            </div>
            {currentBudget && (
              <button
                className="hero-edit-btn"
                onClick={() => setModal("edit_budget")}
              >
                ✎ Edit
              </button>
            )}
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-label">Total Budget</div>
              <div className="hero-stat-val">₦{fmt(budgetAmount)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Spent</div>
              <div className="hero-stat-val amber">₦{fmt(spentAmount)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Remaining</div>
              <div className="hero-stat-val muted">₦{fmt(remainingAmount)}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Days Left</div>
              <div className="hero-stat-val muted">{daysLeftCount}</div>
            </div>
          </div>

          <div className="hero-bar-label">
            <span>₦0</span>
            <span>{spentPct}% used</span>
            <span>₦{fmt(budgetAmount)}</span>
          </div>
          <div className="hero-bar-track">
            <div
              className="hero-bar-fill"
              style={{
                width: `${spentPct}%`,
                background: "rgba(255,255,255,0.75)",
              }}
            />
          </div>
        </div>

        <div className="two-col">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="section-title">Category Spending Caps</div>
                  <div className="section-sub">
                    Set limits per category and track usage
                  </div>
                </div>
                <span className="pro-tag">✦ Premium</span>
              </div>
              <div className="section-card-body">
                {isPremium ? (
                  <div className="cap-list">
                    {categoryCaps.map((cap, i) => (
                      <div key={cap.id}>
                        {i > 0 && <div className="cap-divider" />}
                        <CapRow
                          cap={{
                            ...cap,
                            cat: cap.cat || cap.category,
                            spent: Number(cap.spent || 0),
                            limit: Number(cap.limit || 0),
                          }}
                          onUpdate={updateCap}
                          onDelete={deleteCap}
                        />
                      </div>
                    ))}
                    {categoryCaps.length < CATS.length && (
                      <button className="cap-add-btn" onClick={addCap}>
                        + Add category cap
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="gate-wrap">
                    <div className="gate-blur">
                      <div className="cap-list">
                        {categoryCaps.slice(0, 3).map((cap, i) => (
                          <div key={cap.id}>
                            {i > 0 && <div className="cap-divider" />}
                            <CapRow
                              cap={{
                                ...cap,
                                cat: cap.cat || cap.category,
                                spent: Number(cap.spent || 0),
                                limit: Number(cap.limit || 0),
                              }}
                              onUpdate={() => {}}
                              onDelete={() => {}}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="gate-overlay">
                      <div className="gate-card">
                        <div className="gate-icon">⭐</div>
                        <div className="gate-title">Premium Feature</div>
                        <div className="gate-sub">
                          Set per-category spending caps and get warned before
                          you overshoot.
                        </div>
                        <button className="gate-upgrade-btn">
                          Upgrade — ₦6,500/mo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="section-title">Recurring Expenses</div>
                  <div className="section-sub">
                    ₦{fmt(totalRecurring)}/mo in fixed costs
                  </div>
                </div>
                <span className="pro-tag">✦ Premium</span>
              </div>
              <div className="section-card-body">
                {isPremium ? (
                  <>
                    <div className="rec-list">
                      {recurring.map((r) => {
                        const catKey = r.cat || r.category || "other";
                        const c = CAT_MAP[catKey] ?? CAT_MAP.other;
                        return (
                          <div key={r.id} className="rec-item">
                            <div
                              className="rec-icon"
                              style={{ background: c.bg }}
                            >
                              {c.icon}
                            </div>
                            <div className="rec-body">
                              <div className="rec-name">
                                {r.name || r.description}
                              </div>
                              <div className="rec-meta">
                                Next: {r.next || r.next_date || "—"}
                              </div>
                            </div>
                            <div className="rec-right">
                              <div className="rec-amount">₦{fmt(r.amount)}</div>
                              <div className="rec-freq-pill">
                                {r.freq || r.frequency || "Monthly"}
                              </div>
                            </div>
                            <button
                              className="rec-del-btn"
                              onClick={() => handleDeleteRecurring(r.id)}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      className="rec-add-btn"
                      onClick={() => setModal("new_recurring")}
                    >
                      + Add recurring expense
                    </button>
                  </>
                ) : (
                  <div className="gate-wrap">
                    <div className="gate-blur">
                      <div className="rec-list">
                        {recurring.slice(0, 3).map((r) => {
                          const catKey = r.cat || r.category || "other";
                          const c = CAT_MAP[catKey] ?? CAT_MAP.other;
                          return (
                            <div key={r.id} className="rec-item">
                              <div
                                className="rec-icon"
                                style={{ background: c.bg }}
                              >
                                {c.icon}
                              </div>
                              <div className="rec-body">
                                <div className="rec-name">
                                  {r.name || r.description}
                                </div>
                              </div>
                              <div className="rec-right">
                                <div className="rec-amount">
                                  ₦{fmt(r.amount)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="gate-overlay">
                      <div className="gate-card">
                        <div className="gate-icon">🔁</div>
                        <div className="gate-title">Recurring Expenses</div>
                        <div className="gate-sub">
                          Set fixed costs once and Truvllo accounts for them
                          automatically every month.
                        </div>
                        <button className="gate-upgrade-btn">
                          Upgrade — ₦6,500/mo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <div className="section-title">All Budgets</div>
                  <div className="section-sub">
                    {budgets.length} budgets created
                  </div>
                </div>
              </div>
              <div className="section-card-body">
                <div className="budget-list">
                  {budgets.map((b) => {
                    const usedPct =
                      Number(b.amount) > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (Number(b.spent || 0) / Number(b.amount)) * 100,
                            ),
                          )
                        : 0;
                    const isActive = b.is_active || currentBudget?.id === b.id;

                    return (
                      <div
                        key={b.id}
                        className={`budget-item${isActive ? " active-budget" : ""}`}
                        onClick={() => !isActive && switchBudget(b.id)}
                      >
                        <div className="budget-item-icon">
                          {isActive ? "🟢" : "📋"}
                        </div>
                        <div className="budget-item-body">
                          <div className="budget-item-name">{b.name}</div>
                          <div className="budget-item-meta">
                            {String(b.period || "")
                              .charAt(0)
                              .toUpperCase() +
                              String(b.period || "").slice(1)}{" "}
                            · {usedPct}% used
                          </div>
                          <div
                            className="bar-track"
                            style={{ marginTop: 7, height: 4 }}
                          >
                            <div
                              className="bar-fill"
                              style={{
                                width: `${usedPct}%`,
                                background: isActive
                                  ? "var(--green-light)"
                                  : "var(--ink-subtle)",
                              }}
                            />
                          </div>
                        </div>
                        <div className="budget-item-right">
                          <div className="budget-item-amount">
                            ₦{fmt(b.amount)}
                          </div>
                          <div
                            className="budget-item-pct"
                            style={{
                              color:
                                usedPct >= 100
                                  ? "var(--red)"
                                  : usedPct >= 80
                                    ? "var(--amber)"
                                    : "var(--ink-subtle)",
                            }}
                          >
                            ₦{fmt(b.spent || 0)} spent
                          </div>
                        </div>
                        {isActive ? (
                          <div className="active-check">✓</div>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--ink-subtle)",
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            Switch →
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div
                    className="budget-add-card"
                    onClick={() => setModal("new_budget")}
                  >
                    + Create new budget
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
