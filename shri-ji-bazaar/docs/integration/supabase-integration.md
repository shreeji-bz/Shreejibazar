# Supabase Integration Guide

This document explains how Shri Ji Bazaar integrates with Supabase.

## Overview

Supabase is used as the **Backend-as-a-Service** layer, providing:

- **Authentication** (email, phone, social)
- **PostgreSQL Database** with Row Level Security
- **Storage** for uploads
- **Realtime** subscriptions

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for provisioning (~2 minutes)

### 2. Get API Keys

From Project Settings → API:

- `SUPABASE_URL` → Project URL
- `SUPABASE_ANON_KEY` → `anon` key (public)
- `SUPABASE_SERVICE_ROLE_KEY` → `service_role` key (server-side only, never expose to mobile/web)

### 3. Configure Environment

**Backend (.env):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Mobile (lib/core/config/supabase_config.dart):**
```dart
static const String supabaseUrl = 'https://your-project.supabase.co';
static const String supabaseAnonKey = 'your-anon-key';
```

**Admin (.env):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Migrations

Execute the SQL migrations in `backend/src/database/migrations/` via:
- Supabase Dashboard → SQL Editor
- Or use Supabase CLI

### 5. Enable Realtime

In Supabase Dashboard → Database → Replication, enable replication for:
- `plays`
- `game_rounds`
- `notifications`
- `support_tickets`
- `support_messages`

## Architecture

```
┌─────────────┐
│ Flutter App │── Direct calls ──► Supabase (Auth, DB, Storage, Realtime)
│ (Mobile)    │                    └── Uses anon key (client-side)
├─────────────┤
│ React Admin │── Direct calls ──► Supabase (Auth, DB, Storage)
│ Panel       │                    └── Uses anon key (client-side)
├─────────────┤
│ Backend API │── Server calls ──► Supabase
│ (Node.js)   │                    └── Uses service_role key
└─────────────┘
```

- **Mobile & Admin**: Use `anon` key. RLS policies enforce what data users can access.
- **Backend**: Uses `service_role` key for admin operations that bypass RLS.

## Security Notes

- **Never** expose `service_role` key in mobile apps or browser code
- RLS policies are the primary security layer for mobile/admin clients
- Backend uses `service_role` key only for privileged operations
- All sensitive operations go through the backend API
