/**
 * paymentService.ts — Razorpay payment creation, verification, and record-keeping.
 *
 * SECURITY INVARIANTS (never violate these):
 * 1. The server always controls the price — never trust client-supplied amount.
 * 2. Payment is only marked PAID after successful HMAC signature verification.
 * 3. The Razorpay secret is never sent to the browser.
 * 4. Constant-time comparison prevents timing-based signature forgery.
 */

import Razorpay from 'razorpay';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Payment, PaymentStatus } from '@/types';

// ─── Client ───────────────────────────────────────────────────────────────────

function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      '[paymentService] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set.'
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// ─── Order Creation ───────────────────────────────────────────────────────────

/**
 * Creates a Razorpay order for the given booking.
 *
 * @param amount     Amount in smallest currency unit (e.g. paise for INR).
 *                   MUST be the server-resolved price — never accept from client.
 * @param currency   ISO 4217 currency code (e.g. 'INR').
 * @param bookingId  The human-readable booking ID (e.g. 'SA-2024-123456').
 *                   Stored as receipt for easy cross-referencing in Razorpay dashboard.
 *
 * @returns orderId, amount, currency, and the publishable keyId for the client SDK.
 * @throws  If Razorpay is not configured or the API call fails.
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string,
  bookingId: string
): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('[paymentService] Razorpay is not configured.');
  }

  const razorpay = getRazorpayClient();

  // Receipt is truncated to 40 chars — Razorpay enforces this limit.
  const receipt = bookingId.slice(0, 40);

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes: {
      booking_id: bookingId,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount as number,
    currency: order.currency,
    keyId, // Safe to expose — this is the publishable key, not the secret
  };
}

// ─── Signature Verification ───────────────────────────────────────────────────

/**
 * Verifies the Razorpay payment signature using HMAC-SHA256.
 *
 * The expected signature is computed as:
 *   HMAC_SHA256(razorpayOrderId + '|' + razorpayPaymentId, secret)
 *
 * Uses timingSafeEqual to prevent timing oracle attacks.
 *
 * @returns true only if the signature is valid. Returns false on any failure.
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    console.error('[paymentService] verifyPaymentSignature: RAZORPAY_KEY_SECRET not set.');
    return false;
  }

  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(signature, 'utf-8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (err) {
    console.error('[paymentService] Signature verification error:', err);
    return false;
  }
}

// ─── Database Operations ──────────────────────────────────────────────────────

/**
 * Upserts a payment record in the 'payments' table.
 * Called ONLY after successful signature verification.
 *
 * Uses upsert on (booking_id) so retries are idempotent.
 */
export async function updatePaymentRecord(
  bookingId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  status: PaymentStatus
): Promise<void> {
  // Also update the denormalised columns on the bookings table
  const { error: bookingError } = await supabaseAdmin
    .from('bookings')
    .update({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      payment_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('booking_id', bookingId);

  if (bookingError) {
    console.error('[paymentService] updatePaymentRecord (bookings) error:', bookingError);
    throw new Error(`Failed to update booking payment info: ${bookingError.message}`);
  }

  // Upsert into the payments table for detailed audit trail
  const { error: paymentError } = await supabaseAdmin
    .from('payments')
    .upsert(
      {
        booking_id: bookingId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'booking_id' }
    );

  if (paymentError) {
    console.error('[paymentService] updatePaymentRecord (payments) error:', paymentError);
    throw new Error(`Failed to upsert payment record: ${paymentError.message}`);
  }
}

/**
 * Fetches the payment record for a given booking.
 * Returns null if no payment record exists yet (e.g. booking not yet paid).
 */
export async function getPaymentByBooking(
  bookingId: string
): Promise<Payment | null> {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) {
    console.error('[paymentService] getPaymentByBooking error:', error);
    throw new Error(`Failed to fetch payment record: ${error.message}`);
  }

  return data as Payment | null;
}
