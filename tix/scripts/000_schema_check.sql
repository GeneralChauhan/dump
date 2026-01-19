-- =============================================
-- SCHEMA CHECK (read-only)
-- Run this in Supabase SQL editor to verify required tables/columns exist.
-- This does NOT modify data.
-- =============================================

WITH required AS (
  SELECT * FROM (VALUES
    -- core auth/profile/org
    ('profiles','id'), ('profiles','email'), ('profiles','full_name'), ('profiles','role'), ('profiles','organization_id'),
    ('organizations','id'), ('organizations','name'), ('organizations','slug'), ('organizations','owner_id'),
    ('venues','id'), ('venues','name'), ('venues','organization_id'),
    ('categories','id'), ('categories','name'), ('categories','slug'),

    -- event & ticketing
    ('events','id'), ('events','title'), ('events','slug'), ('events','start_date'), ('events','status'),
    ('events','organization_id'), ('events','venue_id'), ('events','category_id'),
    ('ticket_zones','id'), ('ticket_zones','event_id'), ('ticket_zones','name'), ('ticket_zones','price'), ('ticket_zones','capacity'),
    ('orders','id'), ('orders','user_id'), ('orders','event_id'), ('orders','status'), ('orders','total_amount'),
    ('tickets','id'), ('tickets','order_id'), ('tickets','event_id'), ('tickets','zone_id'), ('tickets','user_id'),
    ('tickets','ticket_number'), ('tickets','qr_code'), ('tickets','status'), ('tickets','scanned_at'), ('tickets','scanned_by'),

    -- staffing / scanning
    ('staff_members','id'), ('staff_members','user_id'), ('staff_members','organization_id'), ('staff_members','role'),
    ('scan_logs','id'), ('scan_logs','ticket_id'), ('scan_logs','event_id'), ('scan_logs','scanned_by'), ('scan_logs','scan_result'), ('scan_logs','created_at')
  ) AS t(table_name, column_name)
),
existing AS (
  SELECT
    table_name,
    column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
)
SELECT
  r.table_name,
  r.column_name,
  CASE WHEN e.column_name IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM required r
LEFT JOIN existing e
  ON e.table_name = r.table_name
 AND e.column_name = r.column_name
ORDER BY r.table_name, r.column_name;


