# Truvllo — Deployment Guide

# Vercel (frontend) + Supabase (database + edge functions)

# ─────────────────────────────────────────────────────────────────────────────

## Prerequisites

Install these tools if you haven't already:

```bash
# Node.js 18+ (check with: node -v)
# https://nodejs.org

# Supabase CLI (Windows)
winget install Supabase.CLI
# or with npm:
npm install -g supabase

# Vercel CLI
npm install -g vercel

# Verify installs
supabase --version
vercel --version
```

---

## Step 1 — Supabase project setup

### 1a. Create project

Go to https://app.supabase.com → New Project

- Name: Truvllo
- Password: (save this — you'll need it)
- Region: pick closest to Nigeria (EU West or US East are common choices)

### 1b. Link CLI to your project

```bash
# In your project root
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Your project ref is in the URL: https://app.supabase.com/project/YOUR_PROJECT_REF
```

### 1c. Run database migrations

Open Supabase Dashboard → SQL Editor and run these files in order:

**01_profiles.sql**

```sql
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  first_name          text not null default '',
  last_name           text not null default '',
  avatar_url          text,
  currency            text not null default 'NGN',
  onboarding_complete boolean not null default false,
  plan                text not null default 'free',
  trial_ends_at       timestamptz,
  trial_activated     boolean not null default false,
  subscription_ends_at    timestamptz,
  subscription_id         text,
  subscribed_at           timestamptz,
  subscription_cancelled  boolean not null default false,
  whatsapp_number     text,
  whatsapp_active     boolean not null default false,
  created_at          timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**02_budgets_expenses.sql**

```sql
create table public.budgets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  amount     numeric(12,2) not null,
  start_date date not null,
  end_date   date not null,
  period     text not null default 'monthly',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.budgets enable row level security;
create policy "Own budgets" on public.budgets for all using (auth.uid() = user_id);

create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  budget_id   uuid not null references public.budgets(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null,
  category    text not null,
  date        date not null default current_date,
  notes       text,
  is_recurring boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.expenses enable row level security;
create policy "Own expenses" on public.expenses for all using (auth.uid() = user_id);

create table public.category_caps (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  budget_id uuid not null references public.budgets(id) on delete cascade,
  category  text not null,
  "limit"   numeric(12,2) not null,
  unique (user_id, budget_id, category)
);
alter table public.category_caps enable row level security;
create policy "Own caps" on public.category_caps for all using (auth.uid() = user_id);

create table public.recurring_expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null,
  category    text not null,
  frequency   text not null default 'monthly',
  next_date   date,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.recurring_expenses enable row level security;
create policy "Own recurring" on public.recurring_expenses for all using (auth.uid() = user_id);
```

**03_payments.sql**

```sql
create table public.payment_transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  reference    text not null unique,
  plan         text not null,
  amount       numeric(12,2) not null,
  amount_paid  numeric(12,2),
  status       text not null default 'pending',
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);
alter table public.payment_transactions enable row level security;
create policy "Own transactions" on public.payment_transactions for select using (auth.uid() = user_id);

create table public.whatsapp_pending (
  user_id      uuid not null references auth.users(id) on delete cascade,
  transactions jsonb not null,
  budget_id    uuid references public.budgets(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id)
);
alter table public.whatsapp_pending enable row level security;
create policy "Own whatsapp pending" on public.whatsapp_pending for all using (auth.uid() = user_id);

-- Auto-activate trial on first expense
create or replace function public.activate_trial_on_first_expense()
returns trigger language plpgsql security definer as $$
declare expense_count int;
begin
  select count(*) into expense_count from public.expenses where user_id = new.user_id;
  if expense_count = 1 then
    update public.profiles
    set plan = 'trial', trial_activated = true, trial_ends_at = now() + interval '7 days'
    where id = new.user_id and trial_activated = false;
  end if;
  return new;
end;
$$;
create trigger on_first_expense
  after insert on public.expenses
  for each row execute procedure public.activate_trial_on_first_expense();
```

### 1d. Enable Google Auth (optional)

Dashboard → Authentication → Providers → Google → Enable
Add your Google OAuth credentials from https://console.cloud.google.com

### 1e. Configure Auth redirect URLs

Dashboard → Authentication → URL Configuration:

- Site URL: `https://truvllo.vercel.app`
- Redirect URLs: `https://truvllo.vercel.app/**`

---

## Step 2 — Set Supabase secrets

```bash
# Anthropic API key (from console.anthropic.com)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...

# Flutterwave secret key (from dashboard.flutterwave.com → Settings → API Keys)
supabase secrets set FLUTTERWAVE_SECRET_KEY=FLW_SECRET_KEY

# Flutterwave webhook hash (from dashboard.flutterwave.com → Webhooks)
supabase secrets set FLUTTERWAVE_WEBHOOK_HASH=your_webhook_hash

# Twilio WhatsApp credentials (from console.twilio.com)
supabase secrets set TWILIO_ACCOUNT_SID=AC_...
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Your production URL (update after Vercel deploy)
supabase secrets set SITE_URL=https://truvllo.vercel.app

# Verify secrets are set
supabase secrets list
```

---

## Step 3 — Deploy Edge Functions

```bash
# Deploy all AI functions
supabase functions deploy ai-spending-analyst
supabase functions deploy ai-savings-coach
supabase functions deploy ai-nl-entry
supabase functions deploy ai-smart-categorise
supabase functions deploy ai-budget-advisor
supabase functions deploy ai-overspend-explainer

# Deploy payment functions
supabase functions deploy flutterwave-init
supabase functions deploy flutterwave-webhook

# Deploy WhatsApp functions
supabase functions deploy whatsapp-webhook
supabase functions deploy whatsapp-send-alert
supabase functions deploy whatsapp-daily-summary
supabase functions deploy whatsapp-trial-reminder
supabase functions deploy send-whatsapp-welcome

# Verify all functions deployed
supabase functions list
```

---

## Step 4 — Deploy frontend to Vercel

### 4a. First deploy (interactive)

```bash
# In your project root
vercel

# Follow the prompts:
# → Set up and deploy? Y
# → Which scope? (your account)
# → Link to existing project? N
# → Project name: truvllo
# → In which directory is your code located? ./
# → Want to override the settings? N
```

### 4b. Set environment variables on Vercel

```bash
# Supabase public keys (safe to expose to browser)
vercel env add VITE_SUPABASE_URL
# paste: https://your-project-ref.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# paste: eyJhbGci...

vercel env add VITE_SITE_URL
# paste: https://truvllo.vercel.app

# Set for all environments
# When prompted: Production, Preview, Development → select all three
```

Or add them directly in Vercel Dashboard → Project → Settings → Environment Variables.

### 4c. Production deploy

```bash
vercel --prod
```

### 4d. Set up custom domain (optional)

Vercel Dashboard → Project → Settings → Domains → Add `truvllo.com`
Follow DNS instructions for your registrar.

---

## Step 5 — Configure Paystack webhook

1. Go to https://dashboard.paystack.com
2. Settings → API Keys & Webhooks
3. Webhook URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/paystack-webhook
   ```
4. Enable events:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`
5. Save

---

## Step 6 — Set up WhatsApp Business API

### 6a. Get Twilio credentials

1. Go to https://console.twilio.com and create a free account
2. Dashboard → Account Info → copy your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (32-character string)
3. WhatsApp → Sandbox → copy the **WhatsApp number** (usually `+14155238886`)

### 6b. Enable WhatsApp Business API

1. In Twilio Console → Messaging → Settings → WhatsApp
2. Click "Get Started" to enable WhatsApp
3. For production use, you'll need to submit business verification to Twilio
4. The sandbox number works for testing, but has limitations

### 6c. Configure WhatsApp webhook

1. Twilio Console → Messaging → Settings → WhatsApp
2. Set **Webhook URL** for incoming messages:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/whatsapp-webhook
   ```
3. **HTTP Method**: `POST`
4. Save settings

### 6d. Test WhatsApp setup

Send a WhatsApp message to your Twilio number from your phone:

- Message: "hello"
- Should receive: "👋 Hi! I don't recognise this number..."

---

## Step 7 — Verify deployment

```bash
# Check your live app
open https://truvllo.vercel.app

# Run Lighthouse PWA audit
npx lighthouse https://truvllo.vercel.app --only-categories=pwa,performance

# Test Edge Functions directly
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-nl-entry \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "spent 4500 on lunch", "currency": "NGN"}'
```

---

## Ongoing deployments

After the first deploy, subsequent pushes are one command:

```bash
# Deploy to production
vercel --prod

# Or connect to GitHub for automatic deploys:
# Vercel Dashboard → Project → Settings → Git → Connect Repository
# Every push to main auto-deploys to production
# Every PR gets a preview URL
```

---

## Deployment checklist

### Supabase

- [ ] Project created
- [ ] All 3 SQL migration files executed
- [ ] Google Auth enabled (if using)
- [ ] Auth redirect URLs configured
- [ ] `ANTHROPIC_API_KEY` secret set
- [ ] `PAYSTACK_SECRET_KEY` secret set
- [ ] `TWILIO_ACCOUNT_SID` secret set
- [ ] `TWILIO_AUTH_TOKEN` secret set
- [ ] `TWILIO_WHATSAPP_FROM` secret set
- [ ] `SITE_URL` secret set
- [ ] All 13 Edge Functions deployed
- [ ] `supabase functions list` shows all functions active

### Vercel

- [ ] `vercel.json` present in project root
- [ ] `VITE_SUPABASE_URL` env var set
- [ ] `VITE_SUPABASE_ANON_KEY` env var set
- [ ] `VITE_SITE_URL` env var set
- [ ] Production deploy succeeded
- [ ] `/dashboard` route works on direct URL (React Router rewrite working)
- [ ] PWA manifest loads (DevTools → Application → Manifest)
- [ ] Service worker registered (DevTools → Application → Service Workers)

### Paystack

- [ ] Webhook URL configured
- [ ] `charge.success` event enabled
- [ ] `subscription.create` event enabled
- [ ] `subscription.disable` event enabled
- [ ] Test payment completes and upgrades user plan

### WhatsApp

- [ ] Twilio account created
- [ ] `TWILIO_ACCOUNT_SID` secret set
- [ ] `TWILIO_AUTH_TOKEN` secret set
- [ ] `TWILIO_WHATSAPP_FROM` secret set
- [ ] WhatsApp webhook URL configured in Twilio
- [ ] Test message sent to WhatsApp number receives response

### Final QA

- [ ] Sign up → email verification → onboarding flow works
- [ ] Add expense → trial activates automatically
- [ ] Dashboard AI panels load from Edge Functions
- [ ] Natural language entry parses correctly
- [ ] Upgrade flow → Paystack → redirects back → Premium badge shows
- [ ] App installs as PWA on Android (Chrome install prompt)
- [ ] App works offline (shows cached data)
- [ ] Lighthouse PWA score ≥ 90

---

## Troubleshooting

**Edge Function returns 401**
→ Check the `Authorization: Bearer <token>` header is being sent from the frontend
→ Verify the Supabase anon key is correct in Vercel env vars

**Paystack webhook returns 401**
→ Check `PAYSTACK_SECRET_KEY` secret is set correctly: `supabase secrets list`
→ Ensure webhook URL uses the Edge Function URL, not the Vercel URL

**WhatsApp messages not working**
→ Check `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_FROM` secrets are set: `supabase secrets list`
→ Verify WhatsApp webhook URL is configured in Twilio Console
→ Test by sending "hello" to your WhatsApp number — should get unrecognized number response
→ For production, ensure WhatsApp Business API is approved by Twilio

**React Router 404 on refresh**
→ Verify `vercel.json` is in the project root and the rewrite rule is correct
→ Check Vercel deployment logs for config errors

**PWA not installing**
→ Must be served over HTTPS (Vercel handles this automatically)
→ Check all required icon sizes are in `public/icons/`
→ Run Lighthouse PWA audit to see specific failures

**iOS input zoom**
→ All inputs must have `font-size: 16px` — this is set globally in `index.html`

**Vite proxy IPv4/IPv6 issue (Windows)**
→ `server.host: "127.0.0.1"` in `vite.config.js` (already set)
