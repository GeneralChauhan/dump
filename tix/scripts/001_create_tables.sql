-- =============================================
-- TICKETMASTER CLONE DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'organizer', 'staff', 'admin')),
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- ORGANIZATIONS TABLE (Event Organizers)
-- =============================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_select_all" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "organizations_insert_owner" ON public.organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "organizations_update_owner" ON public.organizations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "organizations_delete_owner" ON public.organizations FOR DELETE USING (auth.uid() = owner_id);

-- Update profiles with organization reference
ALTER TABLE public.profiles ADD CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- =============================================
-- VENUES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  image_url TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venues_select_all" ON public.venues FOR SELECT USING (true);
CREATE POLICY "venues_insert_org" ON public.venues FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "venues_update_org" ON public.venues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "venues_delete_org" ON public.venues FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

-- Insert default categories
INSERT INTO public.categories (name, slug, icon, color) VALUES
  ('Concerts', 'concerts', 'music', '#E91E63'),
  ('Sports', 'sports', 'trophy', '#4CAF50'),
  ('Theater', 'theater', 'drama', '#9C27B0'),
  ('Comedy', 'comedy', 'laugh', '#FF9800'),
  ('Festivals', 'festivals', 'party-popper', '#00BCD4'),
  ('Conferences', 'conferences', 'presentation', '#607D8B')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  banner_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  doors_open TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  is_featured BOOLEAN DEFAULT FALSE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  total_capacity INTEGER DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_published" ON public.events FOR SELECT USING (
  status = 'published' OR 
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "events_insert_org" ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "events_update_org" ON public.events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "events_delete_org" ON public.events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- =============================================
-- TICKET ZONES TABLE (Seating sections/zones)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ticket_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  capacity INTEGER NOT NULL,
  tickets_sold INTEGER DEFAULT 0,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ticket_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_zones_select_all" ON public.ticket_zones FOR SELECT USING (true);
CREATE POLICY "ticket_zones_insert_org" ON public.ticket_zones FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  )
);
CREATE POLICY "ticket_zones_update_org" ON public.ticket_zones FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  )
);
CREATE POLICY "ticket_zones_delete_org" ON public.ticket_zones FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  )
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(10, 2) NOT NULL,
  service_fee DECIMAL(10, 2) DEFAULT 0,
  payment_intent_id TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  )
);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  )
);

-- =============================================
-- TICKETS TABLE (Individual tickets with QR)
-- =============================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES public.ticket_zones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  qr_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'expired', 'transferred')),
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES auth.users(id),
  attendee_name TEXT,
  attendee_email TEXT,
  seat_info TEXT,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.organizations o ON p.organization_id = o.id
    JOIN public.events e ON e.organization_id = o.id
    WHERE p.id = auth.uid() AND p.role = 'staff' AND e.id = event_id
  )
);
CREATE POLICY "tickets_insert_own" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update_allowed" ON public.tickets FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.organizations o ON p.organization_id = o.id
    JOIN public.events e ON e.organization_id = o.id
    WHERE p.id = auth.uid() AND p.role = 'staff' AND e.id = event_id
  )
);

-- =============================================
-- STAFF MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'scanner' CHECK (role IN ('scanner', 'manager', 'admin')),
  events UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_own_org" ON public.staff_members FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "staff_insert_org_owner" ON public.staff_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "staff_update_org_owner" ON public.staff_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);
CREATE POLICY "staff_delete_org_owner" ON public.staff_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
);

-- =============================================
-- SCAN LOGS TABLE (for audit trail)
-- =============================================
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  scanned_by UUID NOT NULL REFERENCES auth.users(id),
  scan_result TEXT NOT NULL CHECK (scan_result IN ('success', 'already_used', 'invalid', 'expired', 'wrong_event')),
  scan_location TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scan_logs_select_org" ON public.scan_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.staff_members sm
    WHERE sm.user_id = auth.uid() AND event_id = ANY(sm.events)
  )
);
CREATE POLICY "scan_logs_insert_staff" ON public.scan_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_members sm
    WHERE sm.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.events e 
    JOIN public.organizations o ON e.organization_id = o.id 
    WHERE e.id = event_id AND o.owner_id = auth.uid()
  )
);

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_organization ON public.events(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON public.tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON public.orders(event_id);
