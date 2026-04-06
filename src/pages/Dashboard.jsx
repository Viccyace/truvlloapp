/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  RefreshCw,
  Plus,
  Trash2,
  Pencil,
  ArrowUpRight,
  Clock,
  Target,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { useBudget } from "../providers/BudgetProvider";

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`;

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --cream:      #FAF8F3;
  --cream-dark: #F0EDE4;
  --bg:         #F5F3EE;
  --green-deep: #1B4332;
  --green-mid:  #2D6A4F;
  --green-light:#40916C;
  --green-pale: #D8F3DC;
  --green-glow: rgba(64,145,108,0.12);
  --ink:        #0A0A0A;
  --ink-mid:    #1A1A1A;
  --ink-muted:  #3A3A3A;
  --ink-subtle: #6B6B6B;
  --ink-ghost:  #9A9A9A;
  --amber:      #D4A017;
  --amber-light:#F0C040;
  --amber-pale: rgba(212,160,23,0.1);
  --red:        #E53935;
  --red-pale:   rgba(229,57,53,0.08);
  --blue:       #1565C0;
  --blue-pale:  rgba(21,101,192,0.08);
  --white:      #FFFFFF;
  --border:     rgba(10,10,10,0.07);
  --border-md:  rgba(10,10,10,0.12);
  --shadow-xs:  0 1px 3px rgba(0,0,0,0.06);
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.07);
  --shadow-md:  0 8px 24px rgba(0,0,0,0.09);
  --shadow-lg:  0 16px 48px rgba(0,0,0,0.12);
  --radius-sm:  10px;
  --radius-md:  16px;
  --radius-lg:  22px;
  --radius-xl:  28px;
}

/* ── Layout ──────────────────────────────────────────────────────────────── */
.dash {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1180px;
  width: 100%;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: var(--ink);
  animation: dashFadeIn 0.4s ease both;
}
@keyframes dashFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

/* ── Greeting ─────────────────────────────────────────────────────────────── */
.greeting {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  animation: dashFadeIn 0.4s ease 0.05s both;
}
.greeting-left {}
.greeting-time {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-ghost);
  margin-bottom: 6px;
}
.greeting-name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.greeting-name em { font-style: italic; color: var(--green-mid); }
.greeting-date {
  font-size: 0.82rem;
  color: var(--ink-subtle);
  margin-top: 6px;
  font-weight: 500;
}
.greeting-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--green-pale);
  color: var(--green-deep);
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid rgba(27,67,50,0.14);
  flex-shrink: 0;
}
.greeting-badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--green-light);
  animation: blink 2s ease infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }

/* ── Summary cards grid ────────────────────────────────────────────────────── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  animation: dashFadeIn 0.4s ease 0.08s both;
}
@media(max-width:900px){ .summary-grid{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:520px){ .summary-grid{ grid-template-columns:repeat(2,1fr); gap:10px; } }

.sum-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 22px 20px;
  border: 1.5px solid var(--border);
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.22s, transform 0.22s;
}
.sum-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

.sum-card.hero {
  background: linear-gradient(150deg, var(--green-deep) 0%, #2D6A4F 55%, #40916C 100%);
  border-color: transparent;
  box-shadow: 0 8px 32px rgba(27,67,50,0.3);
}
.sum-card-noise {
  position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 200px;
  opacity: 0.4;
}
.sum-icon {
  width: 38px; height: 38px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; flex-shrink: 0;
}
.sum-icon.green  { background: var(--green-glow); }
.sum-icon.red    { background: var(--red-pale); }
.sum-icon.amber  { background: var(--amber-pale); }
.sum-icon.blue   { background: var(--blue-pale); }
.sum-icon.white  { background: rgba(255,255,255,0.18); }

.sum-label {
  font-size: 0.67rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.09em;
  color: var(--ink-ghost); margin-bottom: 5px;
}
.hero .sum-label { color: rgba(255,255,255,0.5); }

.sum-value {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.25rem, 2.5vw, 1.65rem);
  font-weight: 900;
  color: var(--ink);
  line-height: 1;
  letter-spacing: -0.015em;
  word-break: break-all;
}
.hero .sum-value { color: var(--white); }
.sum-value.red   { color: var(--red); }
.sum-value.green { color: var(--green-mid); }
.sum-value.amber { color: var(--amber); }

.sum-footer {
  display: flex; align-items: center; gap: 5px;
  margin-top: 8px; font-size: 0.72rem; font-weight: 600;
  color: var(--ink-ghost);
}
.hero .sum-footer { color: rgba(255,255,255,0.5); }
.sum-footer.up   { color: var(--green-light); }
.sum-footer.down { color: var(--red); }

.sum-progress {
  margin-top: 12px; height: 4px; border-radius: 100px;
  background: rgba(255,255,255,0.18); overflow: hidden;
}
.sum-progress-fill {
  height: 100%; border-radius: 100px;
  background: rgba(255,255,255,0.75);
  transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
}

/* ── Two-col layout ──────────────────────────────────────────────────────── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  animation: dashFadeIn 0.4s ease 0.12s both;
}
@media(max-width:1050px){ .two-col{ grid-template-columns:1fr; } }

/* ── Cards ──────────────────────────────────────────────────────────────── */
.card {
  background: var(--white);
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border);
  overflow: hidden;
}
.card-pad { padding: 24px; }

.card-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; gap: 10px; margin-bottom: 20px;
}
.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem; font-weight: 700; color: var(--ink);
}
.card-sub { font-size: 0.75rem; color: var(--ink-subtle); margin-top: 2px; }

.status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 100px;
  font-size: 0.68rem; font-weight: 800;
  white-space: nowrap; flex-shrink: 0;
}

/* ── Pace card ──────────────────────────────────────────────────────────── */
.pace-meta {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 10px; margin-bottom: 20px;
}
.pace-meta-box {
  background: var(--bg); border-radius: var(--radius-sm);
  padding: 12px; border: 1px solid var(--border);
}
.pace-meta-label {
  font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: var(--ink-ghost); margin-bottom: 5px;
}
.pace-meta-val {
  font-family: 'Playfair Display', serif;
  font-size: 1rem; font-weight: 900; color: var(--ink);
}
.pace-meta-val.red   { color: var(--red); }
.pace-meta-val.amber { color: var(--amber); }
.pace-meta-val.green { color: var(--green-mid); }

.pace-bar-row { margin-bottom: 8px; }
.pace-bar-labels {
  display: flex; justify-content: space-between;
  font-size: 0.7rem; color: var(--ink-ghost);
  font-weight: 600; margin-bottom: 8px;
}
.pace-bar-track {
  background: var(--cream-dark); border-radius: 100px;
  height: 9px; overflow: hidden; position: relative;
}
.pace-bar-expected {
  position: absolute; top:0; bottom:0; left:0;
  background: rgba(10,10,10,0.08); border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
}
.pace-bar-actual {
  height: 100%; border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.4,0,0.2,1) 0.1s;
}
.pace-tick {
  position: absolute; top: -3px; bottom: -3px; width: 2px;
  background: var(--ink-muted); border-radius: 1px;
  transform: translateX(-50%);
  transition: left 1.2s cubic-bezier(0.4,0,0.2,1);
}
.pace-tick-label {
  position: absolute; top: -18px; transform: translateX(-50%);
  font-size: 0.6rem; font-weight: 700; color: var(--ink-subtle); white-space: nowrap;
}
.pace-caption {
  font-size: 0.8rem; color: var(--ink-subtle);
  line-height: 1.55; margin-top: 12px;
}

/* ── Safe card ──────────────────────────────────────────────────────────── */
.safe-card {
  background: linear-gradient(155deg, #0D2B1E 0%, #1B4332 50%, #2D6A4F 100%);
  border-radius: var(--radius-lg);
  padding: 26px;
  display: flex; flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  position: relative; overflow: hidden;
  border: 1px solid rgba(64,145,108,0.2);
}
.safe-blob {
  position: absolute; border-radius: 50%; filter: blur(40px);
  pointer-events: none;
}
.safe-blob-1 { width:180px;height:180px;bottom:-60px;right:-40px;background:rgba(64,145,108,0.25); }
.safe-blob-2 { width:100px;height:100px;top:-30px;left:-20px;background:rgba(212,160,23,0.15); }
.safe-label {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: rgba(255,255,255,0.45);
  margin-bottom: 8px; position: relative; z-index: 1;
}
.safe-amount {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 4vw, 2.5rem);
  font-weight: 900; color: var(--white); line-height: 1;
  position: relative; z-index: 1; letter-spacing: -0.02em;
}
.safe-period {
  font-size: 0.78rem; color: rgba(255,255,255,0.4);
  margin-top: 4px; position: relative; z-index: 1;
}
.safe-footer {
  display: flex; justify-content: space-between;
  align-items: flex-end; margin-top: 20px; position: relative; z-index: 1;
}
.safe-days { font-size: 0.78rem; color: rgba(255,255,255,0.45); }
.safe-days strong { color: rgba(255,255,255,0.85); }
.safe-ring { width: 52px; height: 52px; position: relative; flex-shrink: 0; }
.safe-ring svg { transform: rotate(-90deg); }
.safe-ring-pct {
  position: absolute; inset: 0; display: flex; align-items: center;
  justify-content: center; font-size: 0.62rem; font-weight: 800;
  color: rgba(255,255,255,0.65);
}

/* ── AI cards ──────────────────────────────────────────────────────────── */
.ai-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  animation: dashFadeIn 0.4s ease 0.16s both;
}
@media(max-width:680px){ .ai-grid{ grid-template-columns:1fr; } }

.ai-card {
  background: var(--ink-mid); border-radius: var(--radius-lg);
  padding: 24px; position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
}
.ai-glow {
  position: absolute; border-radius: 50%;
  filter: blur(50px); pointer-events: none; opacity: 0.18;
}
.ai-tag {
  display: flex; align-items: center; gap: 7px; margin-bottom: 14px;
}
.ai-dot {
  width: 6px; height: 6px; border-radius: 50%;
  animation: blink 2.5s ease-in-out infinite;
}
.ai-tag-text {
  font-size: 0.66rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.1em;
}
.ai-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 0.98rem; font-weight: 700; color: var(--white); margin-bottom: 10px;
}
.ai-card-body {
  font-size: 0.83rem; color: rgba(255,255,255,0.55); line-height: 1.65;
}
.ai-card-body strong { color: rgba(255,255,255,0.88); font-weight: 700; }
.ai-card-footer {
  display: flex; align-items: center;
  justify-content: space-between; margin-top: 16px; gap: 8px;
}
.ai-powered { font-size: 0.68rem; color: rgba(255,255,255,0.22); font-weight: 600; }
.ai-refresh {
  background: rgba(255,255,255,0.07); border: none; border-radius: 8px;
  padding: 6px 12px; font-size: 0.73rem; font-weight: 600;
  color: rgba(255,255,255,0.45); cursor: pointer;
  transition: all 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex; align-items: center; gap: 5px;
}
.ai-refresh:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }
.ai-loading { display: flex; gap: 5px; align-items: center; }
.ai-dot-pulse {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  animation: blink 1.2s ease-in-out infinite;
}
.ai-dot-pulse:nth-child(2){ animation-delay:0.2s; }
.ai-dot-pulse:nth-child(3){ animation-delay:0.4s; }

/* ── NL Entry ──────────────────────────────────────────────────────────── */
.nl-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border); padding: 24px;
  animation: dashFadeIn 0.4s ease 0.2s both;
}
.nl-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.nl-icon {
  width: 40px; height: 40px; border-radius: 11px;
  background: var(--amber-pale); display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
}
.nl-title {
  font-family: 'Playfair Display', serif;
  font-size: 1rem; font-weight: 700;
}
.nl-sub { font-size: 0.76rem; color: var(--ink-subtle); margin-top: 2px; }
.nl-row { display: flex; gap: 10px; }
@media(max-width:500px){ .nl-row{ flex-direction:column; } }

.nl-input {
  flex: 1; padding: 13px 16px; border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem; font-weight: 500; color: var(--ink);
  background: var(--bg); outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.nl-input:focus {
  border-color: var(--amber);
  box-shadow: 0 0 0 3px rgba(212,160,23,0.1);
  background: var(--white);
}
.nl-input::placeholder { color: rgba(10,10,10,0.28); }

.nl-btn {
  padding: 13px 20px; border-radius: var(--radius-sm); border: none;
  background: var(--amber); color: var(--ink);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.875rem; font-weight: 800;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
}
.nl-btn:hover { background: var(--amber-light); transform: translateY(-1px); }
.nl-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.nl-parsed {
  margin-top: 12px; background: var(--green-pale);
  border-radius: var(--radius-sm); padding: 13px 16px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; border: 1px solid rgba(27,67,50,0.14);
  animation: scaleIn 0.3s ease; flex-wrap: wrap;
}
@keyframes scaleIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
.nl-parsed-text { font-size: 0.83rem; color: var(--green-deep); font-weight: 600; }
.nl-parsed-text span { color: var(--green-mid); font-weight: 800; }
.nl-confirm {
  background: var(--green-light); color: var(--white); border: none;
  border-radius: 8px; padding: 8px 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.nl-confirm:hover { background: var(--green-mid); }

/* ── Recent expenses + Quick add ─────────────────────────────────────────── */
.two-col-bottom {
  display: grid; grid-template-columns: 1fr 400px; gap: 20px;
  animation: dashFadeIn 0.4s ease 0.24s both;
}
@media(max-width:1100px){ .two-col-bottom{ grid-template-columns:1fr; } }

/* ── Transaction list ─────────────────────────────────────────────────────── */
.tx-list { display: flex; flex-direction: column; }
.tx-date-group {}
.tx-date-label {
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--ink-ghost);
  padding: 14px 24px 8px; background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.tx-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 24px; border-bottom: 1px solid var(--border);
  transition: background 0.15s; cursor: default;
}
.tx-row:last-of-type { border-bottom: none; }
.tx-row:hover { background: var(--bg); }
.tx-cat-badge {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.05rem; flex-shrink: 0;
}
.tx-info { flex: 1; min-width: 0; }
.tx-desc {
  font-size: 0.875rem; font-weight: 700; color: var(--ink);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tx-meta {
  display: flex; align-items: center; gap: 8px;
  margin-top: 3px; font-size: 0.72rem; color: var(--ink-ghost); font-weight: 500;
}
.tx-cat-pill {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 7px; border-radius: 100px;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.03em;
}
.tx-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.tx-amount {
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem; font-weight: 800; color: var(--red);
  white-space: nowrap; letter-spacing: -0.01em;
}
.tx-actions { display: none; gap: 4px; }
.tx-row:hover .tx-actions { display: flex; }
.tx-act {
  width: 28px; height: 28px; border-radius: 7px; border: none;
  background: var(--cream-dark); color: var(--ink-subtle);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}
.tx-act:hover { background: var(--border-md); color: var(--ink); }
.tx-act.del:hover { background: var(--red-pale); color: var(--red); }

.tx-empty {
  padding: 40px 24px; text-align: center;
  color: var(--ink-subtle);
}
.tx-empty-icon { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5; }
.tx-empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem; font-weight: 700; color: var(--ink); margin-bottom: 6px;
}
.tx-empty-sub { font-size: 0.83rem; line-height: 1.6; }

.card-footer-link {
  display: flex; align-items: center; justify-content: center;
  padding: 14px; border-top: 1px solid var(--border);
  font-size: 0.8rem; font-weight: 700; color: var(--green-mid);
  cursor: pointer; transition: background 0.15s;
}
.card-footer-link:hover { background: var(--bg); }

/* ── Quick add ────────────────────────────────────────────────────────────── */
.qa-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border); padding: 24px;
}
.qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
.qa-field-label {
  font-size: 0.75rem; font-weight: 700; color: var(--ink-muted);
  display: block; margin-bottom: 6px;
}
.qa-input {
  width: 100%; padding: 11px 14px; border: 1.5px solid var(--border);
  border-radius: 11px; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem; font-weight: 500; color: var(--ink);
  background: var(--bg); outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.qa-input:focus {
  border-color: var(--green-light);
  box-shadow: 0 0 0 3px rgba(64,145,108,0.1);
  background: var(--white);
}
.qa-input::placeholder { color: rgba(10,10,10,0.28); }
.qa-amount-wrap { position: relative; }
.qa-sym {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  font-weight: 800; color: var(--ink-subtle); font-size: 0.9rem; pointer-events: none;
}
.qa-amount-wrap .qa-input { padding-left: 28px; }

.cat-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.cat-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 100px;
  border: 1.5px solid var(--border); background: var(--white);
  font-size: 0.73rem; font-weight: 700; color: var(--ink-subtle);
  cursor: pointer; transition: all 0.18s;
}
.cat-pill:hover { border-color: rgba(64,145,108,0.35); color: var(--green-mid); }
.cat-pill.active {
  background: var(--green-pale);
  border-color: var(--green-light);
  color: var(--green-deep);
}

.qa-footer { display: flex; gap: 10px; margin-top: 16px; }
.qa-ghost {
  padding: 11px 18px; border: 1.5px solid var(--border);
  border-radius: 11px; background: transparent; color: var(--ink-muted);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.18s;
}
.qa-ghost:hover { border-color: var(--border-md); color: var(--ink); }
.qa-submit {
  flex: 1; padding: 11px; border-radius: 11px; border: none;
  background: linear-gradient(135deg, var(--green-deep), var(--green-light));
  color: var(--white); font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem; font-weight: 700; cursor: pointer;
  transition: all 0.22s; box-shadow: 0 4px 16px rgba(27,67,50,0.22);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.qa-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(27,67,50,0.32); }
.qa-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* ── Toast ─────────────────────────────────────────────────────────────────── */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  z-index: 999; background: var(--ink); color: var(--white);
  padding: 12px 20px; border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.85rem; font-weight: 600;
  display: flex; align-items: center; gap: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.22);
  animation: scaleIn 0.3s ease; white-space: nowrap;
}

/* ── Spinner ────────────────────────────────────────────────────────────────── */
.spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: var(--white); border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to{ transform: rotate(360deg); } }
`;

/* ── Category config ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "food", emoji: "🍔", label: "Food", bg: "#FFF3E0", color: "#E65100" },
  {
    id: "transport",
    emoji: "🚗",
    label: "Transport",
    bg: "#E8F5E9",
    color: "#2E7D32",
  },
  { id: "bills", emoji: "🏠", label: "Bills", bg: "#FCE4EC", color: "#C2185B" },
  {
    id: "shopping",
    emoji: "🛍️",
    label: "Shopping",
    bg: "#EDE7F6",
    color: "#6A1B9A",
  },
  {
    id: "health",
    emoji: "💊",
    label: "Health",
    bg: "#E0F7FA",
    color: "#00695C",
  },
  {
    id: "airtime",
    emoji: "📱",
    label: "Airtime",
    bg: "#E3F2FD",
    color: "#1565C0",
  },
  {
    id: "entertainment",
    emoji: "🎬",
    label: "Entertain.",
    bg: "#F9FBE7",
    color: "#558B2F",
  },
  { id: "other", emoji: "💼", label: "Other", bg: "#F5F5F5", color: "#455A64" },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const NL_EXAMPLES = [
  "spent 4500 on lunch",
  "bolt ride 2800",
  "netflix 4800 entertainment",
  "groceries 12000",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmt(n) {
  return Number(n || 0).toLocaleString("en-NG");
}

function getDateLabel(raw) {
  if (!raw) return "Recently";
  const d = new Date(raw);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (isNaN(d.getTime())) return "—";
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function normCat(val) {
  if (!val) return "other";
  const v = String(val).toLowerCase().replace(/\s+/g, "");
  const aliases = {
    shop: "shopping",
    fun: "entertainment",
    data: "airtime",
    bill: "bills",
  };
  return CAT_MAP[v] ? v : aliases[v] || "other";
}

/* ── Sub-components ──────────────────────────────────────────────────────── */
function SummaryCards({ budget, spent, remaining, safe, daysLeft, sym }) {
  const pct =
    budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const remPct = budget > 0 ? Math.round((remaining / budget) * 100) : 0;
  return (
    <div className="summary-grid">
      {/* Hero card */}
      <div className="sum-card hero">
        <div className="sum-card-noise" />
        <div className="sum-icon white">
          <Wallet size={17} color="rgba(255,255,255,0.9)" />
        </div>
        <div className="sum-label">Total Budget</div>
        <div className="sum-value">
          {sym}
          {fmt(budget)}
        </div>
        <div className="sum-progress">
          <div className="sum-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="sum-footer">{pct}% used this period</div>
      </div>
      {/* Spent */}
      <div className="sum-card">
        <div className="sum-icon red">
          <TrendingDown size={17} color="var(--red)" />
        </div>
        <div className="sum-label">Total Spent</div>
        <div className="sum-value red">
          {sym}
          {fmt(spent)}
        </div>
        <div className="sum-footer">Live from your records</div>
      </div>
      {/* Remaining */}
      <div className="sum-card">
        <div className="sum-icon green">
          <Shield size={17} color="var(--green-mid)" />
        </div>
        <div className="sum-label">Remaining</div>
        <div className="sum-value green">
          {sym}
          {fmt(remaining)}
        </div>
        <div
          className={`sum-footer ${remPct > 50 ? "up" : remPct > 20 ? "" : "down"}`}
        >
          <ArrowUpRight size={12} /> {remPct}% still available
        </div>
      </div>
      {/* Safe to spend */}
      <div className="sum-card">
        <div className="sum-icon amber">
          <Target size={17} color="var(--amber)" />
        </div>
        <div className="sum-label">Safe-to-Spend</div>
        <div className="sum-value amber">
          {sym}
          {fmt(safe)}
        </div>
        <div className="sum-footer">
          <Clock size={11} /> Per day · {daysLeft} days left
        </div>
      </div>
    </div>
  );
}

function PaceCard({
  budget,
  spent,
  expected,
  status,
  currentDay,
  totalDays,
  sym,
}) {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRendered(true), 220);
    return () => clearTimeout(t);
  }, []);
  const spentPct =
    budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const expectedPct =
    budget > 0 ? Math.min(100, Math.round((expected / budget) * 100)) : 0;
  const barColor =
    status.key === "over_budget"
      ? "#FF6B6B"
      : status.key === "slightly_over"
        ? "#F0C040"
        : "#52B788";
  return (
    <div className="card">
      <div className="card-pad">
        <div className="card-header">
          <div>
            <div className="card-title">Budget Pace</div>
            <div className="card-sub">
              Day {currentDay} of {totalDays}
            </div>
          </div>
          <span
            className="status-pill"
            style={{ background: status.bg, color: status.color }}
          >
            ● {status.label}
          </span>
        </div>
        <div className="pace-meta">
          {[
            { label: "Spent", val: `${sym}${fmt(spent)}`, cls: "red" },
            { label: "Expected", val: `${sym}${fmt(expected)}`, cls: "amber" },
            {
              label: "Difference",
              val: `${spent <= expected ? "−" : "+"}${sym}${fmt(Math.abs(spent - expected))}`,
              cls: spent <= expected ? "green" : "red",
            },
          ].map((m) => (
            <div key={m.label} className="pace-meta-box">
              <div className="pace-meta-label">{m.label}</div>
              <div className={`pace-meta-val ${m.cls}`}>{m.val}</div>
            </div>
          ))}
        </div>
        <div className="pace-bar-row">
          <div className="pace-bar-labels">
            <span>{sym}0</span>
            <span>
              {sym}
              {fmt(budget)}
            </span>
          </div>
          <div className="pace-bar-track">
            <div
              className="pace-bar-expected"
              style={{ width: rendered ? `${expectedPct}%` : "0%" }}
            />
            <div
              className="pace-bar-actual"
              style={{
                width: rendered ? `${spentPct}%` : "0%",
                background: `linear-gradient(90deg, ${barColor}bb, ${barColor})`,
              }}
            />
            <div
              className="pace-tick"
              style={{ left: rendered ? `${expectedPct}%` : "0%" }}
            >
              <div className="pace-tick-label">Expected</div>
            </div>
          </div>
        </div>
        <p className="pace-caption">
          You've spent{" "}
          <strong>
            {sym}
            {fmt(spent)}
          </strong>{" "}
          against an expected{" "}
          <strong>
            {sym}
            {fmt(expected)}
          </strong>{" "}
          for day {currentDay}.{" "}
          {spent <= expected
            ? "You're tracking ahead of pace — great discipline!"
            : "You're slightly over pace — consider pulling back to avoid end-of-period pressure."}
        </p>
      </div>
    </div>
  );
}

function SafeCard({ amount, daysLeft, totalDays, currentDay, sym }) {
  const pct = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;
  const r = 20;
  const circ = 2 * Math.PI * r;
  return (
    <div className="safe-card">
      <div className="safe-blob safe-blob-1" />
      <div className="safe-blob safe-blob-2" />
      <div>
        <div className="safe-label">Safe-to-Spend Today</div>
        <div className="safe-amount">
          {sym}
          {fmt(amount)}
        </div>
        <div className="safe-period">daily spending allowance</div>
      </div>
      <div className="safe-footer">
        <div className="safe-days">
          <strong>{daysLeft}</strong> days remaining in period
        </div>
        <div className="safe-ring">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle
              cx="26"
              cy="26"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="26"
              cy="26"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="4"
              strokeDasharray={circ}
              strokeDashoffset={circ - (pct / 100) * circ}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="safe-ring-pct">{pct}%</div>
        </div>
      </div>
    </div>
  );
}

function AIPanel({ type, insight, loading, onRefresh }) {
  const isA = type === "analyst";
  const dot = isA ? "var(--amber)" : "var(--green-light)";
  const glow = isA ? "rgba(212,160,23,0.6)" : "rgba(64,145,108,0.6)";
  return (
    <div className="ai-card">
      <div
        className="ai-glow"
        style={{
          background: `radial-gradient(circle,${glow} 0%,transparent 70%)`,
          top: -60,
          right: -60,
          width: 200,
          height: 200,
        }}
      />
      <div className="ai-tag">
        <div className="ai-dot" style={{ background: dot }} />
        <span className="ai-tag-text" style={{ color: dot }}>
          {isA ? "🔍 AI Spending Analyst" : "🎯 AI Savings Coach"}
        </span>
      </div>
      <div className="ai-card-title">
        {isA ? "This month's breakdown" : "Your top savings tip"}
      </div>
      <div className="ai-card-body">
        {loading ? (
          <div className="ai-loading">
            <div className="ai-dot-pulse" />
            <div className="ai-dot-pulse" />
            <div className="ai-dot-pulse" />
          </div>
        ) : (
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(insight, {
                ALLOWED_TAGS: ["strong", "em", "br"],
                ALLOWED_ATTR: [],
              }),
            }}
          />
        )}
      </div>
      <div className="ai-card-footer">
        <span className="ai-powered">Powered by Claude AI</span>
        <button className="ai-refresh" onClick={onRefresh}>
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
    </div>
  );
}

function NLEntry({ onAdd, sym }) {
  const [val, setVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [ph, setPh] = useState(NL_EXAMPLES[0]);
  const idx = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      idx.current = (idx.current + 1) % NL_EXAMPLES.length;
      setPh(NL_EXAMPLES[idx.current]);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const parse = () => {
    if (!val.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const amount = val.match(/\d[\d,]*/)?.[0]?.replace(/,/g, "") ?? "0";
      const cats = {
        lunch: "food",
        dinner: "food",
        groceries: "food",
        bolt: "transport",
        uber: "transport",
        netflix: "entertainment",
        entertainment: "entertainment",
        data: "airtime",
        airtime: "airtime",
      };
      const cat =
        Object.entries(cats).find(([k]) =>
          val.toLowerCase().includes(k),
        )?.[1] ?? "other";
      const desc = val
        .replace(/\d[\d,]*/g, "")
        .replace(/spent|on|for|at/gi, "")
        .trim();
      setParsed({ amount: parseInt(amount, 10), cat, desc: desc || val });
      setLoading(false);
    }, 900);
  };

  const confirm = async () => {
    await onAdd?.(parsed);
    setParsed(null);
    setVal("");
  };

  return (
    <div className="nl-card">
      <div className="nl-header">
        <div className="nl-icon">
          <Zap size={19} color="var(--amber)" />
        </div>
        <div>
          <div className="nl-title">Natural Language Entry</div>
          <div className="nl-sub">
            Type what you spent — AI parses it instantly
          </div>
        </div>
      </div>
      <div className="nl-row">
        <input
          className="nl-input"
          placeholder={ph}
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setParsed(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && parse()}
        />
        <button
          className="nl-btn"
          onClick={parse}
          disabled={!val.trim() || loading}
        >
          {loading ? (
            <div className="spinner" />
          ) : (
            <>
              <Zap size={14} /> Parse
            </>
          )}
        </button>
      </div>
      {parsed && (
        <div className="nl-parsed">
          <div className="nl-parsed-text">
            Log{" "}
            <span>
              {sym}
              {fmt(parsed.amount)}
            </span>{" "}
            for <span>{parsed.desc}</span> under{" "}
            <span>{CAT_MAP[parsed.cat]?.label || "Other"}</span>?
          </div>
          <button className="nl-confirm" onClick={confirm}>
            Log it ✓
          </button>
        </div>
      )}
    </div>
  );
}

function RecentExpenses({ expenses, onDelete, sym, onViewAll }) {
  const grouped = expenses.reduce((acc, e) => {
    const label = getDateLabel(e.date);
    if (!acc[label]) acc[label] = [];
    acc[label].push(e);
    return acc;
  }, {});

  if (!expenses.length) {
    return (
      <div className="card">
        <div className="card-pad">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Transactions</div>
            </div>
          </div>
        </div>
        <div className="tx-empty">
          <div className="tx-empty-icon">🧾</div>
          <div className="tx-empty-title">No transactions yet</div>
          <div className="tx-empty-sub">
            Log your first expense above to start tracking.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-pad" style={{ paddingBottom: 0 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Recent Transactions</div>
            <div className="card-sub">{expenses.length} latest entries</div>
          </div>
        </div>
      </div>
      <div className="tx-list">
        {Object.entries(grouped).map(([date, rows]) => (
          <div key={date} className="tx-date-group">
            <div className="tx-date-label">{date}</div>
            {rows.map((e) => {
              const c = CAT_MAP[normCat(e.category)] ?? CAT_MAP.other;
              return (
                <div key={e.id} className="tx-row">
                  <div className="tx-cat-badge" style={{ background: c.bg }}>
                    {c.emoji}
                  </div>
                  <div className="tx-info">
                    <div className="tx-desc">
                      {e.description || e.desc || "Expense"}
                    </div>
                    <div className="tx-meta">
                      <span
                        className="tx-cat-pill"
                        style={{ background: c.bg, color: c.color }}
                      >
                        {c.emoji} {c.label}
                      </span>
                      <span>·</span>
                      <span>{getDateLabel(e.date)}</span>
                    </div>
                  </div>
                  <div className="tx-right">
                    <div className="tx-amount">
                      −{sym}
                      {fmt(e.amount)}
                    </div>
                    <div className="tx-actions">
                      <button className="tx-act">
                        <Pencil size={12} />
                      </button>
                      <button
                        className="tx-act del"
                        onClick={() => onDelete?.(e.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="card-footer-link" onClick={onViewAll}>
        View all transactions →
      </div>
    </div>
  );
}

function QuickAdd({ onAdd, sym }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("food");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setDesc("");
    setAmount("");
    setCat("food");
    setDate("");
  };
  const submit = async () => {
    if (!desc.trim() || !amount) return;
    setLoading(true);
    try {
      await onAdd?.({
        desc,
        amount: Number(amount),
        cat,
        date: date || new Date().toISOString().split("T")[0],
      });
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qa-card">
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <div className="card-title">Quick Add</div>
          <div className="card-sub">Manual entry with full control</div>
        </div>
        <div style={{ fontSize: "1.3rem" }}>⚡</div>
      </div>
      <div className="qa-grid">
        <div style={{ gridColumn: "1/-1" }}>
          <label className="qa-field-label">Description</label>
          <input
            className="qa-input"
            placeholder="e.g. Chicken Republic lunch"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div>
          <label className="qa-field-label">Amount</label>
          <div className="qa-amount-wrap">
            <span className="qa-sym">{sym}</span>
            <input
              className="qa-input"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
        </div>
        <div>
          <label className="qa-field-label">Date</label>
          <input
            className="qa-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label className="qa-field-label">Category</label>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                className={`cat-pill${cat === c.id ? " active" : ""}`}
                onClick={() => setCat(c.id)}
              >
                {c.emoji} {c.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="qa-footer">
        <button className="qa-ghost" onClick={reset}>
          Clear
        </button>
        <button
          className="qa-submit"
          onClick={submit}
          disabled={!desc.trim() || !amount || loading}
        >
          {loading ? (
            <div className="spinner" />
          ) : (
            <>
              <Plus size={15} /> Log Expense
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast">
      <span style={{ color: "#52B788" }}>✓</span> {msg}
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { displayName } = useAuth();
  const {
    activeBudget,
    recentExpenses,
    totalBudget,
    totalSpent,
    remaining,
    safeToSpend,
    expectedSpend,
    paceStatus,
    totalDays,
    currentDay,
    daysLeft,
    addExpense,
    deleteExpense,
    sym,
  } = useBudget();

  const currSym = sym || "₦";
  const [analystInsight] = useState(
    "Your AI spending analysis will appear here once you've logged some expenses.",
  );
  const [coachTip] = useState(
    "Log your first expense to activate your AI savings coach.",
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const defaultPace = {
    key: "on_track",
    label: "On Track",
    color: "#52B788",
    bg: "rgba(82,183,136,0.12)",
  };

  const handleAdd = async (data) => {
    const amount = Number(data.amount ?? 0);
    const c =
      CATEGORIES.find((x) => x.id === (data.cat ?? data.category)) ||
      CATEGORIES[7];
    if (!amount || amount <= 0) {
      setToast("Enter a valid amount");
      return;
    }
    try {
      await addExpense({
        description: data.desc ?? data.description ?? "Expense",
        amount,
        category: c.id,
        date: data.date || new Date().toISOString().split("T")[0],
        notes: "",
      });
      setToast(`${currSym}${fmt(amount)} logged under ${c.label}`);
    } catch (err) {
      setToast(err?.message || "Could not save expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setToast("Transaction deleted");
    } catch (err) {
      setToast(err?.message || "Could not delete");
    }
  };

  return (
    <>
      <style>{FONTS + CSS}</style>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div className="dash">
        {/* Greeting */}
        <div className="greeting">
          <div className="greeting-left">
            <div className="greeting-time">{getGreeting()}</div>
            <div className="greeting-name">
              Welcome back, <em>{displayName || "there"}</em>
            </div>
            <div className="greeting-date">
              Here's where your money stands — {today}
            </div>
          </div>
          <div className="greeting-badge">
            <div className="greeting-badge-dot" /> Live tracking active
          </div>
        </div>

        {/* Summary cards */}
        <SummaryCards
          budget={Number(
            totalBudget ||
              activeBudget?.total_amount ||
              activeBudget?.amount ||
              0,
          )}
          spent={Number(totalSpent || 0)}
          remaining={Number(remaining || 0)}
          safe={Number(safeToSpend || 0)}
          daysLeft={Number(daysLeft || 0)}
          sym={currSym}
        />

        {/* Pace + Safe */}
        <div className="two-col">
          <PaceCard
            budget={Number(totalBudget || activeBudget?.total_amount || 0)}
            spent={Number(totalSpent || 0)}
            expected={Number(expectedSpend || 0)}
            status={paceStatus || defaultPace}
            currentDay={Number(currentDay || new Date().getDate())}
            totalDays={Number(
              totalDays ||
                new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  0,
                ).getDate(),
            )}
            sym={currSym}
          />
          <SafeCard
            amount={Number(safeToSpend || 0)}
            daysLeft={Number(daysLeft || 0)}
            totalDays={Number(totalDays || 30)}
            currentDay={Number(currentDay || new Date().getDate())}
            sym={currSym}
          />
        </div>

        {/* AI panels */}
        <div className="ai-grid">
          <AIPanel
            type="analyst"
            insight={analystInsight}
            loading={aiLoading}
            onRefresh={() => {
              setAiLoading(true);
              setTimeout(() => setAiLoading(false), 900);
            }}
          />
          <AIPanel
            type="coach"
            insight={coachTip}
            loading={aiLoading}
            onRefresh={() => {
              setAiLoading(true);
              setTimeout(() => setAiLoading(false), 900);
            }}
          />
        </div>

        {/* NL entry */}
        <NLEntry onAdd={handleAdd} sym={currSym} />

        {/* Transactions + Quick add */}
        <div className="two-col-bottom">
          <RecentExpenses
            expenses={Array.isArray(recentExpenses) ? recentExpenses : []}
            onDelete={handleDelete}
            sym={currSym}
            onViewAll={() => (window.location.href = "/expenses")}
          />
          <QuickAdd onAdd={handleAdd} sym={currSym} />
        </div>
      </div>
    </>
  );
}
