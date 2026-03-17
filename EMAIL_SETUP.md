# Truvllo Email Setup — Resend

## 1. Get your Resend API key

1. Go to https://resend.com and create a free account
2. Dashboard → API Keys → Create API Key
3. Name it "Truvllo Production"
4. Copy the key (starts with `re_...`)

## 2. Add your domain to Resend (required to send from your own address)

1. Resend Dashboard → Domains → Add Domain
2. Enter your domain (e.g. `truvllo.com`) — or use `truvlloapp.vercel.app` for now
3. Add the DNS records Resend gives you to your domain registrar
4. Wait for verification (usually a few minutes)

> If you don't have a custom domain yet, Resend gives you a free `@resend.dev`
> sending address for testing. Update the `from` field in `_shared/resend.ts`
> to use it: `from: "Truvllo <onboarding@resend.dev>"`

## 3. Set the Resend secret on Supabase

```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
```

## 4. Deploy the email Edge Functions

```bash
supabase functions deploy send-contact
supabase functions deploy send-careers-waitlist
supabase functions deploy send-welcome
supabase functions deploy send-trial-activated
supabase functions deploy send-trial-expiry
```

## 5. Wire up automatic emails via Supabase DB Webhooks

### Welcome email — fires on new user signup

Go to **Supabase Dashboard → Database → Webhooks → Create webhook**:

| Field        | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| Name         | `on_new_user_welcome`                                            |
| Table        | `profiles`                                                       |
| Events       | `INSERT`                                                         |
| URL          | `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-welcome` |
| HTTP Headers | `Authorization: Bearer YOUR_ANON_KEY`                            |

### Trial activation email — fires when plan becomes 'trial'

Create another webhook:

| Field        | Value                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| Name         | `on_trial_activated`                                                     |
| Table        | `profiles`                                                               |
| Events       | `UPDATE`                                                                 |
| URL          | `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-trial-activated` |
| HTTP Headers | `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`                            |

Add a condition so it only fires when plan changes to 'trial':

```sql
new.plan = 'trial' AND old.plan != 'trial'
```

## 6. Set up the trial expiry reminder (pg_cron)

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Enable pg_cron extension (if not already enabled)
create extension if not exists pg_cron;

-- Schedule the trial expiry function to run every day at 9am UTC
select cron.schedule(
  'send-trial-expiry-reminders',
  '0 9 * * *',
  $$
  select net.http_post(
    url    := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-trial-expiry',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body   := '{}'::jsonb
  )
  $$
);
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project ref.

## 7. Call welcome email from AuthProvider after signup

In `src/providers/AuthProvider.jsx`, find the `signUp` function and add this after the user is created:

```js
// After successful signup, call the welcome email function
const {
  data: { session },
} = await supabase.auth.signInWithPassword({ email, password });
if (session) {
  fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ firstName }),
  }).catch(console.error); // fire and forget
}
```

## Email overview

| Email                 | Trigger                                          | Sent to                                   |
| --------------------- | ------------------------------------------------ | ----------------------------------------- |
| Welcome               | On signup (DB webhook INSERT on profiles)        | New user                                  |
| Trial activated       | On first expense (DB webhook UPDATE on profiles) | User whose plan becomes 'trial'           |
| Trial expiry reminder | pg_cron daily at 9am UTC                         | All users whose trial expires tomorrow    |
| Contact form          | Contact page form submit                         | User (confirmation) + Team (notification) |
| Careers waitlist      | Careers page email signup                        | User (confirmation) + Team (notification) |

## Testing

Test any function directly with curl:

```bash
# Test contact form
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-contact \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","topic":"general","message":"Hello!"}'

# Test trial expiry (manually trigger for a specific user)
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-trial-expiry \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```
