-- =============================================
-- REPO SCHEMA MIGRATION (safe/idempotent)
--
-- Goal: bring an existing Supabase project up to this repo's schema
-- as defined in `scripts/001_create_tables.sql` (+ `002_add_vendor_role.sql`).
--
-- Notes:
-- - This script tries to be SAFE: add missing columns, relax/adjust constraints,
--   and avoids dropping tables.
-- - Review before running in production.
-- =============================================

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------
-- STAFF MEMBERS
-- -----------------------------
-- Repo schema does NOT use `is_active`; app code should not depend on it.
-- If your DB has it, we leave it in place.

-- -----------------------------
-- TICKETS: normalize "used_at" -> "scanned_at"
-- -----------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='used_at'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='scanned_at'
  ) THEN
    ALTER TABLE public.tickets RENAME COLUMN used_at TO scanned_at;
  END IF;
END $$;

-- If both exist, prefer repo column and keep data by copying
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='used_at'
  )
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='scanned_at'
  ) THEN
    EXECUTE 'UPDATE public.tickets SET scanned_at = COALESCE(scanned_at, used_at) WHERE used_at IS NOT NULL';
  END IF;
END $$;

-- Ensure scanned_by exists (repo schema)
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS scanned_by UUID REFERENCES auth.users(id);

-- -----------------------------
-- SCAN LOGS: normalize staff_id/scanned_at -> scanned_by/created_at
-- -----------------------------
-- If a `staff_id` column exists, rename to `scanned_by` ONLY if it looks like it stores auth user ids.
-- If your `staff_id` stores staff_members.id, DO NOT rename (adjust app code instead).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='scan_logs' AND column_name='staff_id'
  )
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='scan_logs' AND column_name='scanned_by'
  ) THEN
    -- leave as-is; app code will be updated to use scanned_by=user.id
    NULL;
  END IF;
END $$;

-- Ensure scanned_by exists (repo schema)
ALTER TABLE public.scan_logs
  ADD COLUMN IF NOT EXISTS scanned_by UUID REFERENCES auth.users(id);

-- Ensure created_at exists (repo schema)
ALTER TABLE public.scan_logs
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- If you have scanned_at, backfill into created_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='scan_logs' AND column_name='scanned_at'
  ) THEN
    EXECUTE 'UPDATE public.scan_logs SET created_at = COALESCE(created_at, scanned_at) WHERE scanned_at IS NOT NULL';
  END IF;
END $$;

-- -----------------------------
-- EVENTS: normalize "date" -> "start_date" if needed
-- -----------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='events' AND column_name='date'
  )
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='events' AND column_name='start_date'
  ) THEN
    -- Try to convert `date` (text/date) into timestamptz start_date.
    ALTER TABLE public.events ADD COLUMN start_date TIMESTAMPTZ;
    BEGIN
      EXECUTE 'UPDATE public.events SET start_date = (date::timestamptz) WHERE start_date IS NULL AND date IS NOT NULL';
    EXCEPTION WHEN others THEN
      -- If conversion fails, leave start_date null and fix manually.
      NULL;
    END;
  END IF;
END $$;

-- -----------------------------
-- RPC: increment_tickets_sold (used by checkout)
-- -----------------------------
CREATE OR REPLACE FUNCTION public.increment_tickets_sold(p_event_id UUID, p_zone_id UUID, p_count INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events
  SET tickets_sold = COALESCE(tickets_sold, 0) + p_count
  WHERE id = p_event_id;

  UPDATE public.ticket_zones
  SET tickets_sold = COALESCE(tickets_sold, 0) + p_count
  WHERE id = p_zone_id;
END;
$$;


