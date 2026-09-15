// ─────────────────────────────────────────────
//  Simran Arrora – Shared TypeScript Types
// ─────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'CUSTOMER'

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'

export type PaymentStatus =
  | 'PENDING'
  | 'VERIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED'

export type SyncStatus = 'PENDING' | 'SYNCED' | 'FAILED'

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'BOOKING' | 'PAYMENT'

// ── Database Entities ─────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  image_url: string | null
  duration_minutes: number | null
  enabled: boolean
  display_order: number
  price_options?: PriceOption[]
  created_at: string
  updated_at: string
}

export interface PriceOption {
  id: string
  service_id: string
  name: string
  description: string | null
  amount: number
  currency: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  booking_id: string
  customer_id: string | null
  service_id: string | null
  price_option_id: string | null
  customer_name: string
  email: string
  phone: string
  appointment_date: string
  appointment_time: string
  location: string | null
  notes: string | null
  amount: number
  currency: string
  payment_status: PaymentStatus
  booking_status: BookingStatus
  google_sheet_sync_status: SyncStatus
  created_at: string
  updated_at: string
  // Optional joined relations
  service?: Service | null
  price_option?: PriceOption | null
  customer?: User | null
}

export interface Payment {
  id: string
  booking_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  amount: number
  currency: string
  status: PaymentStatus
  failure_reason: string | null
  created_at: string
  updated_at: string
}

export interface GalleryItem {
  id: string
  title: string
  description: string | null
  image_url: string
  category: string | null
  alt_text: string | null
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string
  platform: string | null
  button_label: string
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface SocialLink {
  id: string
  name: string
  url: string | null
  icon: string | null
  platform: string | null
  enabled: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface LiveSettings {
  id: string
  title: string | null
  description: string | null
  public_url: string | null
  thumbnail_url: string | null
  start_datetime: string | null
  end_datetime: string | null
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  archived: boolean
  created_at: string
}

export interface LegalPage {
  id: string
  slug: string
  title: string
  content: string | null
  effective_date: string | null
  published: boolean
  last_updated: string
  created_at: string
  updated_at: string
}

export interface PaymentSettings {
  id: string
  provider: string
  enabled: boolean
  test_mode: boolean
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: string
  key: string
  value: string | null
  updated_at: string
}

export interface GoogleSheetSync {
  id: string
  booking_id: string
  sync_status: SyncStatus
  last_attempt: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ── Dashboard & Responses ─────────────────────────────────────

export interface DashboardStats {
  total: number
  pending: number
  approved: number
  rejected: number
  today: number
  upcoming: number
  paymentPending: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// ── Form Schemas & Payloads ────────────────────────────────────

export interface BookingFormData {
  customer_name: string
  email: string
  phone: string
  service_id: string
  price_option_id: string
  appointment_date: string
  appointment_time: string
  notes?: string
  location?: string
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  fullName: string
  email: string
  phone?: string
  password: string
  confirmPassword?: string
}

export interface AdminLoginFormData {
  email: string
  password: string
}

export interface ChatMessage {
  role: 'user' | 'model'
  parts: string
}
