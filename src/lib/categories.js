/**
 * src/lib/categories.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for expense categories.
 * Previously defined separately in AppLayout, BankImport, Dashboard,
 * Expenses, and ExpensesPage — now imported from here.
 *
 * Usage:
 *   import { CATEGORIES, CAT_MAP, normalizeCategory } from "../lib/categories";
 */

import {
  Wallet,
  Car,
  Home,
  ShoppingBag,
  HeartPulse,
  Smartphone,
  Clapperboard,
  Briefcase,
} from "lucide-react";

export const CATEGORIES = [
  { id: "food", label: "Food", Icon: Wallet, color: "#D97706", bg: "#FFF3E0" },
  {
    id: "transport",
    label: "Transport",
    Icon: Car,
    color: "#2D6A4F",
    bg: "#E8F5E9",
  },
  { id: "bills", label: "Bills", Icon: Home, color: "#C026D3", bg: "#FCE4EC" },
  {
    id: "shopping",
    label: "Shopping",
    Icon: ShoppingBag,
    color: "#7C3AED",
    bg: "#F3E5F5",
  },
  {
    id: "health",
    label: "Health",
    Icon: HeartPulse,
    color: "#0F766E",
    bg: "#E0F7FA",
  },
  {
    id: "airtime",
    label: "Airtime",
    Icon: Smartphone,
    color: "#2563EB",
    bg: "#E3F2FD",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    Icon: Clapperboard,
    color: "#65A30D",
    bg: "#F9FBE7",
  },
  {
    id: "other",
    label: "Other",
    Icon: Briefcase,
    color: "#475569",
    bg: "#F5F5F5",
  },
];

/** Fast lookup by id: CAT_MAP["food"] → { id, label, Icon, color, bg } */
export const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/**
 * Normalise any raw category value (from DB, AI, or import) to a valid id.
 * Falls back to "other" for unknown values.
 */
export function normalizeCategory(value) {
  if (!value) return "other";
  const v = String(value).toLowerCase().replace(/\s+/g, "");
  if (CAT_MAP[v]) return v;
  const aliases = {
    shop: "shopping",
    fun: "entertainment",
    data: "airtime",
    bill: "bills",
    food: "food",
    transport: "transport",
    health: "health",
  };
  return aliases[v] ?? "other";
}
