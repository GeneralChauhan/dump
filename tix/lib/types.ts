export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: "customer" | "organizer" | "staff" | "admin" | "vendor"
  organization_id: string | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  state: string | null
  country: string
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  capacity: number | null
  image_url: string | null
  organization_id: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  created_at: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  image_url: string | null
  banner_url: string | null
  start_date: string
  end_date: string | null
  doors_open: string | null
  status: "draft" | "published" | "cancelled" | "completed"
  is_featured: boolean
  category_id: string | null
  venue_id: string | null
  organization_id: string
  min_price: number | null
  max_price: number | null
  total_capacity: number
  tickets_sold: number
  created_at: string
  updated_at: string
  // Joined relations
  category?: Category
  venue?: Venue
  organization?: Organization
  ticket_zones?: TicketZone[]
}

export interface TicketZone {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number
  capacity: number
  tickets_sold: number
  color: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  event_id: string
  status: "pending" | "completed" | "cancelled" | "refunded"
  total_amount: number
  service_fee: number
  payment_intent_id: string | null
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
  // Joined relations
  event?: Event
  tickets?: Ticket[]
}

export interface Ticket {
  id: string
  order_id: string
  event_id: string
  zone_id: string
  user_id: string
  ticket_number: string
  qr_code: string
  status: "valid" | "used" | "cancelled" | "expired" | "transferred"
  scanned_at: string | null
  scanned_by: string | null
  attendee_name: string | null
  attendee_email: string | null
  seat_info: string | null
  price: number
  created_at: string
  updated_at: string
  // Joined relations
  event?: Event
  zone?: TicketZone
  order?: Order
}

export interface StaffMember {
  id: string
  user_id: string
  organization_id: string
  role: "scanner" | "manager" | "admin"
  events: string[]
  created_at: string
  updated_at: string
  // Joined relations
  profile?: Profile
}

export interface ScanLog {
  id: string
  ticket_id: string
  event_id: string
  scanned_by: string
  scan_result: "success" | "already_used" | "invalid" | "expired" | "wrong_event"
  scan_location: string | null
  device_info: string | null
  created_at: string
}
