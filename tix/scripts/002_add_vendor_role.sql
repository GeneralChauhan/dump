-- =============================================
-- ADD VENDOR ROLE TO PROFILES TABLE
-- =============================================

-- Drop the existing CHECK constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new CHECK constraint with 'vendor' role included
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'organizer', 'staff', 'admin', 'vendor'));

