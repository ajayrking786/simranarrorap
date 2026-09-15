/**
 * emailService.ts — Transactional email via Resend.
 *
 * Design contract:
 * - If RESEND_API_KEY is absent: log a warning and return { sent: false }.
 * - Never throw from public functions — callers must not fail because email failed.
 * - Never claim email was sent unless Resend confirmed delivery.
 */

import { Resend } from 'resend';
import type { Booking, ContactMessage } from '@/types';

// ─── Client ───────────────────────────────────────────────────────────────────

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[emailService] RESEND_API_KEY is not set — emails are disabled.');
    return null;
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? 'noreply@simranarrora.com';
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildEmailHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#111111;border-radius:12px;overflow:hidden;border:1px solid #222222;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0a0a0a;padding:32px 40px;text-align:center;border-bottom:2px solid #e91e8c;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Simran <span style="color:#e91e8c;">Arrora ♡</span>
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:#888888;letter-spacing:1px;text-transform:uppercase;">
                Creator • Collaborator • Professional
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#ffffff;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #222222;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888888;">
                &copy; ${new Date().getFullYear()} Simran Arrora. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;color:#888888;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;font-size:14px;color:#ffffff;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;
}

function buildBookingSummaryTable(booking: Booking): string {
  const serviceName = booking.service?.name || 'Creator Service';
  const amount =
    booking.currency === 'INR'
      ? `₹${booking.amount.toLocaleString('en-IN')}`
      : `${booking.currency} ${booking.amount.toLocaleString()}`;

  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#161616;border-radius:8px;padding:20px;border:1px solid #222222;margin:20px 0;">
    ${detailRow('Booking ID', booking.booking_id)}
    ${detailRow('Service', serviceName)}
    ${detailRow('Date', booking.appointment_date)}
    ${detailRow('Time', booking.appointment_time)}
    ${booking.location ? detailRow('Location', booking.location) : ''}
    ${detailRow('Amount', amount)}
  </table>`;
}

// ─── Safe send helper ─────────────────────────────────────────────────────────

interface SendOptions {
  to: string;
  subject: string;
  html: string;
}

async function safeSend(opts: SendOptions): Promise<{ sent: boolean }> {
  const resend = getResendClient();
  if (!resend) return { sent: false };

  try {
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    if (error) {
      console.error('[emailService] Resend API error:', error);
      return { sent: false };
    }

    return { sent: true };
  } catch (err) {
    console.error('[emailService] Unexpected error sending email:', err);
    return { sent: false };
  }
}

// ─── Public Functions ─────────────────────────────────────────────────────────

export async function sendBookingReceived(booking: Booking): Promise<{ sent: boolean }> {
  const bodyHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;">Booking Request Received 🎉</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#cccccc;line-height:1.6;">
      Hi <strong style="color:#ffffff;">${escapeHtml(booking.customer_name)}</strong>, thank you for booking!
      Your booking request has been received and is currently under review.
      We will confirm availability and get back to you shortly.
    </p>
    <h3 style="margin:0 0 4px;font-size:16px;color:#e91e8c;">Booking Summary</h3>
    ${buildBookingSummaryTable(booking)}`;

  return safeSend({
    to: booking.email,
    subject: `Booking Request Received — ${booking.booking_id} | Simran Arrora`,
    html: buildEmailHtml('Booking Received', bodyHtml),
  });
}

export async function sendBookingApproved(booking: Booking): Promise<{ sent: boolean }> {
  const bodyHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;">Booking Approved ✅</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#cccccc;line-height:1.6;">
      Great news, <strong style="color:#ffffff;">${escapeHtml(booking.customer_name)}</strong>!
      Your appointment has been confirmed.
    </p>
    <h3 style="margin:0 0 4px;font-size:16px;color:#e91e8c;">Booking Details</h3>
    ${buildBookingSummaryTable(booking)}`;

  return safeSend({
    to: booking.email,
    subject: `Booking Confirmed — ${booking.booking_id} | Simran Arrora`,
    html: buildEmailHtml('Booking Approved', bodyHtml),
  });
}

export async function sendBookingRejected(booking: Booking): Promise<{ sent: boolean }> {
  const serviceName = booking.service?.name || 'Creator Service';
  const bodyHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;">Booking Update</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#cccccc;line-height:1.6;">
      Hi <strong style="color:#ffffff;">${escapeHtml(booking.customer_name)}</strong>,
      your selected date and time is not available for <strong style="color:#e91e8c;">${escapeHtml(serviceName)}</strong>.
      Please try another available date or time.
    </p>
    <h3 style="margin:0 0 4px;font-size:16px;color:#e91e8c;">Booking Reference</h3>
    ${buildBookingSummaryTable(booking)}`;

  return safeSend({
    to: booking.email,
    subject: `Booking Update — ${booking.booking_id} | Simran Arrora`,
    html: buildEmailHtml('Booking Update', bodyHtml),
  });
}

export async function sendBookingRescheduled(
  booking: Booking,
  newDate: string,
  newTime: string
): Promise<{ sent: boolean }> {
  const serviceName = booking.service?.name || 'Creator Service';
  const bodyHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;">Booking Rescheduled 📅</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#cccccc;line-height:1.6;">
      Hi <strong style="color:#ffffff;">${escapeHtml(booking.customer_name)}</strong>,
      your appointment has been rescheduled.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#161616;border-radius:8px;padding:20px;border:1px solid #222222;margin:20px 0;">
      ${detailRow('Booking ID', booking.booking_id)}
      ${detailRow('Service', serviceName)}
      ${detailRow('New Date', newDate)}
      ${detailRow('New Time', newTime)}
      ${booking.location ? detailRow('Location', booking.location) : ''}
    </table>`;

  return safeSend({
    to: booking.email,
    subject: `Booking Rescheduled — ${booking.booking_id} | Simran Arrora`,
    html: buildEmailHtml('Booking Rescheduled', bodyHtml),
  });
}

export async function sendBookingCancelled(booking: Booking): Promise<{ sent: boolean }> {
  const bodyHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;">Booking Cancelled</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#cccccc;line-height:1.6;">
      Hi <strong style="color:#ffffff;">${escapeHtml(booking.customer_name)}</strong>,
      your appointment <strong style="color:#e91e8c;">${escapeHtml(booking.booking_id)}</strong> has been cancelled.
    </p>
    <h3 style="margin:0 0 4px;font-size:16px;color:#e91e8c;">Cancelled Booking</h3>
    ${buildBookingSummaryTable(booking)}`;

  return safeSend({
    to: booking.email,
    subject: `Booking Cancelled — ${booking.booking_id} | Simran Arrora`,
    html: buildEmailHtml('Booking Cancelled', bodyHtml),
  });
}

export async function sendContactMessageAck(message: ContactMessage): Promise<{ sent: boolean }> {
  const bodyHtml = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#ffffff;">Message Received 💌</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#cccccc;line-height:1.6;">
      Hi <strong style="color:#ffffff;">${escapeHtml(message.name)}</strong>,
      thank you for getting in touch! We have received your message and will get back to you soon.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#161616;border-radius:8px;padding:20px;border:1px solid #222222;margin:20px 0;">
      ${message.subject ? detailRow('Subject', message.subject) : ''}
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#888888;width:40%;vertical-align:top;">Your Message</td>
        <td style="padding:8px 0;font-size:14px;color:#ffffff;vertical-align:top;line-height:1.6;">${escapeHtml(message.message)}</td>
      </tr>
    </table>`;

  return safeSend({
    to: message.email,
    subject: `We received your message | Simran Arrora`,
    html: buildEmailHtml('Message Received', bodyHtml),
  });
}
