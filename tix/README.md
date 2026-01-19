# Ticketmaster clone

## Supabase setup (local env)

This app uses Supabase for auth + database. The code expects these env vars:

- **`NEXT_PUBLIC_SUPABASE_URL`** (required)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (required)
- **`NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`** (optional; defaults to `http://localhost:3000/auth/callback`)

### 1) Create your `.env.local`

Due to repo/tooling safety rules, `.env*` files aren’t included here. Create it locally:

```bash
cp env.local.template .env.local
```

This repo is already prefilled for Supabase project **`pcjqxilezrzhmuwdmyrx`**:

- `NEXT_PUBLIC_SUPABASE_URL` is set to `https://pcjqxilezrzhmuwdmyrx.supabase.co`
- You only need to paste **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (from Supabase Dashboard → Project Settings → API → “anon public” key)

### 2) Use Supabase (choose one)

#### Option A: Supabase Local (recommended for dev)

1. Install the Supabase CLI (see Supabase docs).
2. In the project root:

```bash
supabase init
supabase start
supabase status
```

3. Copy values from `supabase status` into `.env.local`:
   - `API URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Apply the schema:
   - Open Supabase Studio (local) and run the SQL scripts in order:
     - `scripts/001_create_tables.sql`
     - `scripts/002_add_vendor_role.sql`

#### Option B: Supabase Hosted

1. Create a Supabase project in the dashboard.
2. In the project settings, get:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In the SQL editor, run:
   - `scripts/001_create_tables.sql`
   - `scripts/002_add_vendor_role.sql`
4. In **Auth settings**, add a redirect URL for local dev:
   - `http://localhost:3000/auth/callback`

### If your Supabase already has tables

You can **skip** `scripts/001_create_tables.sql` if your project already has the tables — the app already queries tables directly using `supabase.from("...")`.

What matters is that your existing schema **matches what the code expects**. To verify quickly, run:

- `scripts/000_schema_check.sql` (read-only) in the Supabase SQL editor

If it reports missing columns/tables, you have two options:

- **Update your DB** to match this repo’s expected schema (recommended for least code change)
- **Update the code** to match your existing schema (works too, but requires touching multiple pages/components)

### 3) Run the app

```bash
pnpm dev
```

