# Database Setup

## Prerequisites
- A Supabase project (already created)
- Supabase CLI (optional, for local development)

## Applying Migrations

### Option 1 — Supabase SQL Editor (easiest)

1. Open your Supabase project dashboard: https://supabase.com/dashboard/project/htfrpyaiagwszywoqqbb/editor
2. Go to **SQL Editor**
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click **Run**
5. Then copy and paste `seed/01_seed_initial.sql` and click **Run**

### Option 2 — Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Link project
supabase link --project-ref htfrpyaiagwszywoqqbb

# Push migrations
supabase db push
```

## Seed Data

The seed file creates:
- 1 admin user: `admin@shrijibazaar.com` / `admin123` (change after first login)
- Default app settings

## Tables Created

| Table | Purpose |
|---|---|
| `users` | Mobile app users |
| `admins` | Admin panel users |
| `refresh_tokens` | JWT refresh token storage |
| `games` | Game catalog |
| `rounds` | Game rounds |
| `activities` | User plays/bets |
| `point_wallets` | User point balances |
| `point_transactions` | Point transaction history |
| `bonuses` | Available bonuses |
| `bonus_claims` | Bonus claim records |
| `referrals` | Referral tracking |
| `notifications` | Push/in-app notifications |
| `banners` | Home screen banners |
| `settings` | App configuration key-value |
| `support_tickets` | User support tickets |
| `support_messages` | Support ticket messages |
| `audit_logs` | Admin action logs |

## Row Level Security

All tables have RLS enabled. Since the backend uses the `service_role` key (bypasses RLS), this is for defense-in-depth.

## Next Steps

After applying the schema, start the backend:
```bash
cd backend && npm run dev
```
