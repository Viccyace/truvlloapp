// src/lib/icons.js
// ─────────────────────────────────────────────────────────────────────────────
// Central icon imports from Lucide React.
// Import from here instead of directly from lucide-react to keep things tidy.
// Usage: import { DashboardIcon, ReceiptIcon } from "@/lib/icons";

export {
  // ── Navigation ──────────────────────────────────────────────────────────
  LayoutDashboard as DashboardIcon,
  Receipt as ExpensesIcon,
  Target as BudgetIcon,
  BarChart2 as InsightsIcon,
  Settings2 as SettingsIcon,
  Home as HomeIcon,
  TrendingUp as TrendingIcon,
  Menu as MenuIcon,
  ArrowLeft as BackIcon,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal as MoreIcon,

  // ── Dashboard ────────────────────────────────────────────────────────────
  Wallet as WalletIcon,
  ArrowUpRight as SpentIcon,
  PiggyBank as RemainingIcon,
  CalendarDays as SafeSpendIcon,
  Sparkles as AIIcon,
  RefreshCw as RefreshIcon,
  Zap as ParseIcon,

  // ── Expense categories ───────────────────────────────────────────────────
  UtensilsCrossed as FoodIcon,
  Car as TransportIcon,
  Lightbulb as BillsIcon,
  ShoppingBag as ShoppingIcon,
  Heart as HealthIcon,
  Clapperboard as EntertainmentIcon,
  Smartphone as AirtimeIcon,
  TrendingUp as SavingsIcon,
  ArrowLeftRight as TransferIcon,
  Briefcase as OtherIcon,

  // ── Actions ──────────────────────────────────────────────────────────────
  Plus as PlusIcon,
  X as CloseIcon,
  Check as CheckIcon,
  Trash2 as DeleteIcon,
  Pencil as EditIcon,
  Search as SearchIcon,
  Bell as NotificationIcon,
  Upload as ImportIcon,
  Download as ExportIcon,
  Filter as FilterIcon,
  ChevronDown as ChevronDownIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Copy as CopyIcon,
  LogOut as LogOutIcon,
  AlertTriangle as AlertIcon,
  Info as InfoIcon,
  ExternalLink as ExternalLinkIcon,
  Share2 as ShareIcon,

  // ── Features (landing page) ──────────────────────────────────────────────
  CalendarCheck as PaceIcon,
  FolderOpen as CategoryCapIcon,
  Trophy as StreakIcon,
  MessageSquare as NLIcon,
  Tag as SmartCatIcon,
  Compass as AdvisorIcon,

  // ── Auth / onboarding ────────────────────────────────────────────────────
  Mail as MailIcon,
  Lock as LockIcon,
  User as UserIcon,
  Globe as GlobeIcon,
} from "lucide-react";

// ── Category icon map ────────────────────────────────────────────────────────
// Use this to get the right icon component for a category string
import {
  UtensilsCrossed,
  Car,
  Lightbulb,
  ShoppingBag,
  Heart,
  Clapperboard,
  Smartphone,
  PiggyBank,
  ArrowLeftRight,
  Briefcase,
} from "lucide-react";

export const CATEGORY_ICONS = {
  Food: UtensilsCrossed,
  Transport: Car,
  Bills: Lightbulb,
  Shopping: ShoppingBag,
  Health: Heart,
  Entertainment: Clapperboard,
  Airtime: Smartphone,
  Savings: PiggyBank,
  Transfer: ArrowLeftRight,
  Other: Briefcase,
};

export const CATEGORY_COLORS = {
  Food: { bg: "#FFF3E0", color: "#E65100" },
  Transport: { bg: "#E8F5E9", color: "#2E7D32" },
  Bills: { bg: "#FCE4EC", color: "#C62828" },
  Shopping: { bg: "#F3E5F5", color: "#6A1B9A" },
  Health: { bg: "#E0F7FA", color: "#00695C" },
  Entertainment: { bg: "#F9FBE7", color: "#558B2F" },
  Airtime: { bg: "#E3F2FD", color: "#1565C0" },
  Savings: { bg: "#D8F3DC", color: "#1B4332" },
  Transfer: { bg: "#F5F5F5", color: "#424242" },
  Other: { bg: "#F5F5F5", color: "#424242" },
};

// Helper: render a category icon with its background
// Usage: <CategoryIcon category="Food" size={20} />
import React from "react";
export function CategoryIcon({ category, size = 18, style = {} }) {
  const Icon = CATEGORY_ICONS[category] || Briefcase;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  const dim = size + 18;
  return React.createElement(
    "div",
    {
      style: {
        width: dim,
        height: dim,
        borderRadius: Math.round(dim * 0.28),
        background: colors.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      },
    },
    React.createElement(Icon, { size, color: colors.color, strokeWidth: 2 }),
  );
}
