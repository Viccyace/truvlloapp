# Truvllo — Smart Budget Tracker

AI-powered budgeting for young professionals in Nigeria and West Africa.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local and fill in your Supabase URL and anon key
```

### 3. Run the dev server
```bash
npm run dev
# Opens at http://127.0.0.1:5173
```

### 4. Generate PWA icons (before deploying)
```bash
npm run generate-pwa-assets
```

## Tech Stack
- React 18 + Vite 6
- React Router v6
- Supabase (auth + database + edge functions)
- Tailwind-equivalent custom CSS
- Playfair Display + Plus Jakarta Sans typography

## Project Structure
```
src/
  main.jsx              ← App entry point
  router.jsx            ← All routes
  layouts/
    AppLayout.jsx       ← Sidebar + topbar + bottom nav (renders once)
  pages/
    Landing.jsx
    Auth.jsx
    Onboarding.jsx
    Dashboard.jsx
    Expenses.jsx
    Budget.jsx
    Insights.jsx
    Settings.jsx
    Upgrade.jsx
  providers/
    AuthProvider.jsx    ← Auth state + localStorage hydration
    BudgetProvider.jsx  ← All budget data + calculations
  hooks/
    useAI.js           ← All 6 AI feature calls
    usePaystack.js     ← Payment flow
  components/
    Preloader.jsx      ← First-visit splash screen
    InstallPrompt.jsx  ← PWA install banner
  lib/
    supabase.js        ← Supabase client singleton

supabase/functions/
  _shared/             ← Shared utilities (cors, auth, claude)
  ai-spending-analyst/
  ai-savings-coach/
  ai-nl-entry/
  ai-smart-categorise/
  ai-budget-advisor/
  ai-overspend-explainer/
  paystack-init/
  paystack-webhook/
```

## Deployment
See `DEPLOYMENT.md` for full step-by-step instructions.

## VS Code Setup
Install the recommended extensions when prompted:
- **Deno** (denoland.vscode-deno) — for supabase/functions/*.ts files
- **ESLint** — for JS/JSX linting
