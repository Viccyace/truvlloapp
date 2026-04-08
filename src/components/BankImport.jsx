import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  X,
  Upload,
  RefreshCw,
  Check,
  ChevronLeft,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

const styles = `
  .import-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  @media(min-width:640px){ .import-modal-overlay { align-items: center; } }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  .import-modal {
    background: #FAF8F3; border-radius: 24px 24px 0 0; width: 100%; max-width: 720px;
    max-height: 92vh; display: flex; flex-direction: column; overflow: hidden;
    animation: slideUp 0.35s cubic-bezier(0.34,1.2,0.64,1);
  }
  @media(min-width:640px){ .import-modal{ border-radius:24px; } }

  .import-header {
    padding: 24px 28px 20px; border-bottom: 1.5px solid rgba(10,10,10,0.08);
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
    background: #FAF8F3;
  }
  .import-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #0A0A0A; }
  .import-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(10,10,10,0.06); color: #6B6B6B; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
  .import-close:hover { background: rgba(10,10,10,0.12); }

  .import-body { flex: 1; overflow-y: auto; padding: 24px 28px; }

  /* Step indicators */
  .import-steps { display: flex; gap: 0; margin-bottom: 28px; }
  .import-step { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 600; color: #6B6B6B; }
  .import-step.active { color: #1B4332; }
  .import-step.done { color: #40916C; }
  .import-step-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(10,10,10,0.08); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
  .import-step.active .import-step-num { background: #1B4332; color: #FFFFFF; }
  .import-step.done .import-step-num { background: #40916C; color: #FFFFFF; }
  .import-step-connector { flex: 1; height: 1.5px; background: rgba(10,10,10,0.1); margin: 0 8px; min-width: 20px; }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed rgba(10,10,10,0.15); border-radius: 18px; padding: 48px 28px;
    text-align: center; cursor: pointer; transition: all 0.22s; background: #FFFFFF;
    position: relative;
  }
  .upload-zone:hover, .upload-zone.drag { border-color: #40916C; background: #D8F3DC; }
  .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .upload-icon { font-size: 2.5rem; margin-bottom: 14px; }
  .upload-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #0A0A0A; margin-bottom: 8px; }
  .upload-sub { font-size: 0.875rem; color: #6B6B6B; line-height: 1.6; margin-bottom: 16px; }
  .upload-formats { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .upload-format-pill { background: rgba(10,10,10,0.06); color: #3A3A3A; padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; }

  /* File selected */
  .file-selected { background: #D8F3DC; border: 1.5px solid rgba(27,67,50,0.2); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 20px; overflow: hidden; }
  .file-icon { width: 40px; height: 40px; border-radius: 10px; background: #1B4332; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #FFFFFF; flex-shrink: 0; }
  .file-name { font-weight: 700; font-size: 0.9rem; color: #1B4332; margin-bottom: 2px; word-break: break-all; overflow-wrap: anywhere; }
  .file-size { font-size: 0.78rem; color: #2D6A4F; }
  .file-remove { margin-left: auto; background: none; border: none; color: #2D6A4F; cursor: pointer; font-size: 0.85rem; font-weight: 600; }

  /* Parsing state */
  .parsing-state { text-align: center; padding: 40px 20px; }
  .parsing-spinner { width: 48px; height: 48px; border: 3px solid rgba(27,67,50,0.15); border-top-color: #1B4332; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .parsing-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #0A0A0A; margin-bottom: 8px; }
  .parsing-sub { font-size: 0.875rem; color: #6B6B6B; line-height: 1.6; }

  /* Review table */
  .review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
  .review-count { font-size: 0.875rem; color: #6B6B6B; }
  .review-count strong { color: #0A0A0A; }
  .select-all-btn { background: none; border: 1.5px solid rgba(10,10,10,0.12); border-radius: 8px; padding: 6px 14px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.78rem; font-weight: 600; color: #3A3A3A; cursor: pointer; transition: all 0.18s; }
  .select-all-btn:hover { border-color: #40916C; color: #1B4332; }

  .txn-table { width: 100%; border-collapse: collapse; }
  .txn-table th { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #6B6B6B; padding: 8px 12px; text-align: left; border-bottom: 1.5px solid rgba(10,10,10,0.08); }
  .txn-row { transition: background 0.15s; cursor: pointer; }
  .txn-row:hover { background: rgba(10,10,10,0.02); }
  .txn-row.selected { background: #D8F3DC; }
  .txn-row td { padding: 10px 12px; font-size: 0.875rem; border-bottom: 1px solid rgba(10,10,10,0.05); vertical-align: middle; }
  .txn-checkbox { width: 16px; height: 16px; accent-color: #1B4332; cursor: pointer; }
  .txn-desc { font-weight: 600; color: #0A0A0A; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .txn-date { color: #6B6B6B; white-space: nowrap; font-size: 0.8rem; }
  .txn-amount { font-family: 'Playfair Display', serif; font-weight: 700; color: #E53935; white-space: nowrap; }
  .txn-cat { display: inline-flex; align-items: center; gap: 5px; background: rgba(10,10,10,0.06); padding: 3px 10px; border-radius: 100px; font-size: 0.72rem; font-weight: 600; color: #3A3A3A; white-space: nowrap; }
  .cat-select { border: 1px solid rgba(10,10,10,0.12); border-radius: 6px; padding: 4px 6px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.75rem; color: #0A0A0A; background: #FAF8F3; outline: none; cursor: pointer; }

  /* Summary bar */
  .summary-bar { background: #1B4332; border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-top: 20px; flex-wrap: wrap; gap: 10px; }
  .summary-bar-text { font-size: 0.875rem; color: rgba(255,255,255,0.7); }
  .summary-bar-text strong { color: #FFFFFF; font-weight: 700; }
  .summary-bar-amount { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 900; color: #FFFFFF; }

  /* Success state */
  .success-state { text-align: center; padding: 40px 20px; }
  .success-icon { font-size: 3rem; margin-bottom: 16px; }
  .success-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #0A0A0A; margin-bottom: 8px; }
  .success-sub { font-size: 0.9rem; color: #6B6B6B; line-height: 1.6; }

  /* Error */
  .error-box { background: rgba(229,57,53,0.08); border: 1.5px solid rgba(229,57,53,0.2); border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; font-size: 0.875rem; color: #C62828; line-height: 1.5; }

  /* Footer */
  .import-footer { padding: 20px 28px; border-top: 1.5px solid rgba(10,10,10,0.08); display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0; background: #FAF8F3; }
  .btn-ghost { padding: 11px 22px; border: 1.5px solid rgba(10,10,10,0.12); border-radius: 12px; background: transparent; color: #3A3A3A; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.18s; }
  .btn-ghost:hover { border-color: rgba(10,10,10,0.25); }
  .btn-primary { padding: 12px 28px; border-radius: 12px; border: none; background: linear-gradient(135deg,#1B4332,#40916C); color: #FFFFFF; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(27,67,50,0.25); display: flex; align-items: center; gap: 6px; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,67,50,0.35); }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #FFFFFF; border-radius: 50%; animation: spin 0.7s linear infinite; }
`;

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Airtime",
  "Savings",
  "Transfer",
  "Other",
];

const CAT_ICONS = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Bills: "🏠",
  Health: "💊",
  Entertainment: "🎬",
  Airtime: "📱",
  Savings: "💰",
  Transfer: "🔄",
  Other: "💼",
};

function fmt(n) {
  return Number(n).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BankImport({
  onClose,
  onImport,
  budgetId,
  currency = "NGN",
}) {
  const [step, setStep] = useState("upload"); // upload | parsing | review | success
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef();

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "csv"].includes(ext)) {
      setError("Only PDF and CSV files are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const parse = async () => {
    if (!file) return;
    setStep("parsing");
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("currency", currency);
      form.append("budget_id", budgetId ?? "");

      // Get token — try getSession() first, fallback to truvllo_auth cache
      let token = null;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        token = session?.access_token;
      } catch (e) {}
      if (!token) {
        const cached = JSON.parse(localStorage.getItem("truvllo_auth") || "{}");
        token = cached?.access_token;
      }
      if (!token) throw new Error("Your session expired. Please log in again.");

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/ai-import-statement`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY },
          body: form,
        },
      );

      const data = await res.json();
      if (!res.ok) {
        // Extract clean message from nested Anthropic/Supabase error
        const raw = data.error || data.message || "";
        const nested = typeof raw === "object" ? raw : {};
        const msg =
          nested?.error?.message ||
          nested?.message ||
          (typeof raw === "string" && raw.includes("credit balance")
            ? "Anthropic API credits exhausted. Top up at console.anthropic.com/settings/billing."
            : null) ||
          (typeof raw === "string" && raw.length < 200
            ? raw
            : "AI parser returned an error. Please try again.");
        throw new Error(msg);
      }
      if (!data.transactions?.length)
        throw new Error(
          "No transactions found in this file. Make sure it's a bank statement.",
        );

      setTransactions(data.transactions);
      // Pre-select all debit transactions
      setSelected(
        new Set(
          data.transactions.filter((t) => t.type === "debit").map((t) => t.id),
        ),
      );
      setStep("review");
    } catch (err) {
      const msg = err.message || "Failed to fetch";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError(
          "Could not reach the AI parser. Make sure the ai-import-statement Edge Function is deployed: supabase functions deploy ai-import-statement",
        );
      } else {
        setError(msg);
      }
      setStep("upload");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === transactions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(transactions.map((t) => t.id)));
    }
  };

  const updateCategory = (id, category) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category } : t)),
    );
  };

  const confirmImport = async () => {
    const toImport = transactions.filter((t) => selected.has(t.id));
    if (!toImport.length) return;
    setImporting(true);
    try {
      await onImport(toImport);
      setImportedCount(toImport.length);
      setStep("success");
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const selectedTotal = transactions
    .filter((t) => selected.has(t.id))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currencySymbol =
    { NGN: "₦", USD: "$", GBP: "£", EUR: "€", KES: "KSh", GHS: "₵" }[
      currency
    ] || currency;

  return (
    <>
      <style>{FONTS + styles}</style>
      <div
        className="import-modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="import-modal">
          {/* Header */}
          <div className="import-header">
            <div>
              <div className="import-title">Import Bank Statement</div>
            </div>
            <button className="import-close" onClick={onClose}>
              <X size={14} />
            </button>
          </div>

          {/* Step indicators */}
          <div className="import-body">
            <div className="import-steps">
              <div
                className={`import-step ${step === "upload" ? "active" : ["parsing", "review", "success"].includes(step) ? "done" : ""}`}
              >
                <div className="import-step-num">
                  {["parsing", "review", "success"].includes(step) ? "✓" : "1"}
                </div>
                Upload
              </div>
              <div className="import-step-connector" />
              <div
                className={`import-step ${step === "parsing" ? "active" : ["review", "success"].includes(step) ? "done" : ""}`}
              >
                <div className="import-step-num">
                  {["review", "success"].includes(step) ? "✓" : "2"}
                </div>
                AI Parse
              </div>
              <div className="import-step-connector" />
              <div
                className={`import-step ${step === "review" ? "active" : step === "success" ? "done" : ""}`}
              >
                <div className="import-step-num">
                  {step === "success" ? "✓" : "3"}
                </div>
                Review
              </div>
              <div className="import-step-connector" />
              <div
                className={`import-step ${step === "success" ? "done" : ""}`}
              >
                <div className="import-step-num">
                  {step === "success" ? "✓" : "4"}
                </div>
                Import
              </div>
            </div>

            {/* ── STEP 1: Upload ────────────────────────────────────────── */}
            {step === "upload" && (
              <>
                {error && <div className="error-box">⚠️ {error}</div>}

                {file ? (
                  <div className="file-selected">
                    <div
                      className="file-icon"
                      style={{ flexShrink: 0, minWidth: 40 }}
                    >
                      {file.name.endsWith(".pdf") ? (
                        <FileText size={18} />
                      ) : (
                        <FileSpreadsheet size={18} />
                      )}
                    </div>
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatBytes(file.size)}</div>
                    </div>
                    <button
                      className="file-remove"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    className={`upload-zone${drag ? " drag" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.csv"
                      onChange={(e) => handleFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                    <div className="upload-icon">
                      <Upload size={40} color="#40916C" />
                    </div>
                    <div className="upload-title">
                      Upload your bank statement
                    </div>
                    <p className="upload-sub">
                      Download your statement from your bank app, then upload it
                      here.
                      <br />
                      Truvllo AI will extract all your transactions
                      automatically.
                    </p>
                    <div className="upload-formats">
                      <span className="upload-format-pill">
                        <FileText size={12} style={{ marginRight: 4 }} />
                        PDF
                      </span>
                      <span className="upload-format-pill">
                        <FileSpreadsheet size={12} style={{ marginRight: 4 }} />
                        CSV
                      </span>
                      <span className="upload-format-pill">Max 10MB</span>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    background: "rgba(212,160,23,0.08)",
                    borderRadius: 10,
                    borderLeft: "3px solid #D4A017",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "#3A3A3A",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    <strong>🔒 Your data is private.</strong> Your statement is
                    processed by AI and never stored. Only the extracted
                    transactions are saved to your Truvllo account.
                  </p>
                </div>
              </>
            )}

            {/* ── STEP 2: Parsing ───────────────────────────────────────── */}
            {step === "parsing" && (
              <div className="parsing-state">
                <div className="parsing-spinner" />
                <div className="parsing-title">Reading your statement...</div>
                <p className="parsing-sub">
                  Truvllo AI is extracting your transactions, cleaning up
                  descriptions, and categorising each expense. This takes 10–30
                  seconds.
                </p>
              </div>
            )}

            {/* ── STEP 3: Review ────────────────────────────────────────── */}
            {step === "review" && (
              <>
                {error && <div className="error-box">⚠️ {error}</div>}
                <div className="review-header">
                  <div className="review-count">
                    Found <strong>{transactions.length}</strong> transactions ·{" "}
                    <strong>{selected.size}</strong> selected
                  </div>
                  <button className="select-all-btn" onClick={toggleAll}>
                    {selected.size === transactions.length
                      ? "Deselect all"
                      : "Select all"}
                  </button>
                </div>

                <div
                  style={{
                    overflowX: "auto",
                    borderRadius: 14,
                    border: "1.5px solid rgba(10,10,10,0.08)",
                  }}
                >
                  <table className="txn-table">
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}></th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr
                          key={t.id}
                          className={`txn-row${selected.has(t.id) ? " selected" : ""}`}
                          onClick={() => toggleSelect(t.id)}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="txn-checkbox"
                              checked={selected.has(t.id)}
                              onChange={() => toggleSelect(t.id)}
                            />
                          </td>
                          <td>
                            <div className="txn-desc" title={t.description}>
                              {t.description}
                            </div>
                          </td>
                          <td>
                            <span className="txn-date">
                              {formatDate(t.date)}
                            </span>
                          </td>
                          <td>
                            <span className="txn-amount">
                              −{currencySymbol}
                              {fmt(t.amount)}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              className="cat-select"
                              value={t.category}
                              onChange={(e) =>
                                updateCategory(t.id, e.target.value)
                              }
                            >
                              {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                  {CAT_ICONS[c]} {c}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selected.size > 0 && (
                  <div className="summary-bar">
                    <div className="summary-bar-text">
                      Importing <strong>{selected.size}</strong> transactions
                    </div>
                    <div className="summary-bar-amount">
                      {currencySymbol}
                      {fmt(selectedTotal)} total
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── STEP 4: Success ───────────────────────────────────────── */}
            {step === "success" && (
              <div className="success-state">
                <div className="success-icon">🎉</div>
                <div className="success-title">
                  {importedCount} transactions imported!
                </div>
                <p className="success-sub">
                  Your expenses have been added to your budget. Your spending
                  pace and safe-to-spend are now updated.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="import-footer">
            {step === "upload" && (
              <>
                <button className="btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={parse}
                  disabled={!file}
                >
                  <RefreshCw size={14} style={{ marginRight: 6 }} />
                  Parse with AI
                </button>
              </>
            )}
            {step === "review" && (
              <>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setStep("upload");
                    setFile(null);
                  }}
                >
                  <ChevronLeft size={15} /> Back
                </button>
                <button
                  className="btn-primary"
                  onClick={confirmImport}
                  disabled={selected.size === 0 || importing}
                >
                  {importing ? (
                    <>
                      <RefreshCw size={14} className="spinner-sm" />{" "}
                      Importing...
                    </>
                  ) : (
                    <>
                      Import {selected.size} transactions
                      <ChevronLeft
                        size={14}
                        style={{ transform: "rotate(180deg)", marginLeft: 4 }}
                      />
                    </>
                  )}
                </button>
              </>
            )}
            {step === "success" && (
              <button className="btn-primary" onClick={onClose}>
                <Check size={15} style={{ marginRight: 5 }} />
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
