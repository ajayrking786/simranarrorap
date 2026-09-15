/**
 * bookingService.ts — Server-side booking CRUD and business logic.
 *
 * SECURITY: All functions use the admin client (bypasses RLS).
 * Must only be called from Route Handlers or Server Actions — never from
 * client components. Customer data is never leaked across customers.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import type {
  Booking,
  BookingFormData,
  BookingStatus,
  DashboardStats,
} from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateBookingId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SA-${year}-${suffix}`;
}

function todayISODate(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createBooking(
  data: BookingFormData,
  resolvedAmount: number,
  resolvedCurrency: string,
  customerId?: string | null
): Promise<Booking> {
  const bookingId = generateBookingId();

  const insertPayload = {
    booking_id: bookingId,
    customer_id: customerId || null,
    service_id: data.service_id || null,
    price_option_id: data.price_option_id || null,
    customer_name: data.customer_name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    location: data.location?.trim() || null,
    notes: data.notes?.trim() || null,
    amount: resolvedAmount,
    currency: resolvedCurrency,
    payment_status: 'PENDING',
    booking_status: 'PENDING',
    google_sheet_sync_status: 'PENDING',
  };

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .insert(insertPayload)
    .select('*, service:services(*), price_option:price_options(*)')
    .single();

  if (error) {
    console.error('[bookingService] createBooking error:', error);
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  return booking as Booking;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('*, service:services(*), price_option:price_options(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[bookingService] getBookingById error:', error);
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return booking as Booking | null;
}

export async function getBookingByBookingId(bookingId: string): Promise<Booking | null> {
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('*, service:services(*), price_option:price_options(*)')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) {
    console.error('[bookingService] getBookingByBookingId error:', error);
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return booking as Booking | null;
}

export async function getBookingsByCustomer(customerId: string): Promise<Booking[]> {
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('*, service:services(*), price_option:price_options(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[bookingService] getBookingsByCustomer error:', error);
    throw new Error(`Failed to fetch customer bookings: ${error.message}`);
  }

  return (bookings ?? []) as Booking[];
}

export async function getAllBookings(filters?: { status?: string; date?: string }): Promise<Booking[]> {
  let query = supabaseAdmin
    .from('bookings')
    .select('*, service:services(*), price_option:price_options(*)')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('booking_status', filters.status);
  }

  if (filters?.date) {
    query = query.eq('appointment_date', filters.date);
  }

  const { data: bookings, error } = await query;

  if (error) {
    console.error('[bookingService] getAllBookings error:', error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return (bookings ?? []) as Booking[];
}

export async function getTodayBookings(): Promise<Booking[]> {
  const today = todayISODate();

  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('*, service:services(*), price_option:price_options(*)')
    .eq('appointment_date', today)
    .order('appointment_time', { ascending: true });

  if (error) {
    console.error('[bookingService] getTodayBookings error:', error);
    throw new Error(`Failed to fetch today's bookings: ${error.message}`);
  }

  return (bookings ?? []) as Booking[];
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  const today = todayISODate();

  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('*, service:services(*), price_option:price_options(*)')
    .gt('appointment_date', today)
    .in('booking_status', ['PENDING', 'APPROVED'])
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) {
    console.error('[bookingService] getUpcomingBookings error:', error);
    throw new Error(`Failed to fetch upcoming bookings: ${error.message}`);
  }

  return (bookings ?? []) as Booking[];
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .update({
      booking_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, service:services(*), price_option:price_options(*)')
    .single();

  if (error) {
    console.error('[bookingService] updateBookingStatus error:', error);
    throw new Error(`Failed to update booking status: ${error.message}`);
  }

  return booking as Booking;
}

export async function updateBookingSheetSyncStatus(
  id: string,
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED'
): Promise<void> {
  await supabaseAdmin
    .from('bookings')
    .update({
      google_sheet_sync_status: syncStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = todayISODate();

  const { data: rows, error } = await supabaseAdmin
    .from('bookings')
    .select('id, booking_status, payment_status, appointment_date');

  if (error) {
    console.error('[bookingService] getDashboardStats error:', error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      today: 0,
      upcoming: 0,
      paymentPending: 0,
    };
  }

  const all = (rows ?? []) as Array<{
    id: string;
    booking_status: BookingStatus;
    payment_status: string;
    appointment_date: string;
  }>;

  return {
    total: all.length,
    pending: all.filter((b) => b.booking_status === 'PENDING').length,
    approved: all.filter((b) => b.booking_status === 'APPROVED').length,
    rejected: all.filter((b) => b.booking_status === 'REJECTED').length,
    today: all.filter((b) => b.appointment_date === today).length,
    upcoming: all.filter(
      (b) =>
        b.appointment_date > today &&
        (b.booking_status === 'PENDING' || b.booking_status === 'APPROVED')
    ).length,
    paymentPending: all.filter((b) => b.payment_status === 'PENDING' || b.payment_status === 'VERIFICATION').length,
  };
}
