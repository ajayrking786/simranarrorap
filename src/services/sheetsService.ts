/**
 * sheetsService.ts — Google Sheets sync for booking records.
 *
 * Design contract:
 * - All three env vars must be present; otherwise every function returns
 *   { synced: false, reason: 'not_configured' } without throwing.
 * - A Sheets failure NEVER causes a booking to be lost — errors are caught,
 *   logged, and returned as { synced: false, error }.
 * - The 'Bookings' sheet must exist with a header row already in place.
 *   Column order matches SHEET_COLUMNS below.
 */

import { google } from 'googleapis';
import type { Booking, BookingStatus, PaymentStatus } from '@/types';

// ─── Configuration ────────────────────────────────────────────────────────────

const SHEET_NAME = 'Bookings';

/**
 * Column order of the Bookings tab (zero-indexed, A=0).
 * Must match the header row in the actual spreadsheet.
 */
const SHEET_COLUMNS = [
  'Booking ID',       // A
  'Created At',       // B
  'Customer Name',    // C
  'Email',            // D
  'Phone',            // E
  'Service',          // F
  'Date',             // G
  'Time',             // H
  'Location',         // I
  'Duration (min)',   // J
  'Amount',           // K
  'Currency',         // L
  'Payment Status',   // M
  'Booking Status',   // N
  'Customer Notes',   // O
] as const;

// Index of columns used for update lookups
const COL_BOOKING_ID = 0;       // A
const COL_PAYMENT_STATUS = 12;  // M
const COL_BOOKING_STATUS = 13;  // N

// ─── Env check ────────────────────────────────────────────────────────────────

function isConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

type NotConfiguredResult = { synced: false; reason: 'not_configured' };

function notConfigured(): NotConfiguredResult {
  console.warn('[sheetsService] Google Sheets is not configured — skipping sync.');
  return { synced: false, reason: 'not_configured' };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Constructs and returns a JWT auth client from service account credentials.
 * The private key may arrive with literal \n sequences which must be normalised.
 */
export function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY!;
  // Normalize escaped newlines (common when env var is set via dotenv/Vercel)
  const privateKey = rawKey.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function spreadsheetId(): string {
  return process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
}

/** Converts a booking into an ordered row array matching SHEET_COLUMNS. */
function bookingToRow(booking: Booking): string[] {
  const serviceName = booking.service?.name || 'Standard Service';
  const duration = booking.service?.duration_minutes?.toString() || '';

  return [
    booking.booking_id || '',
    booking.created_at || new Date().toISOString(),
    booking.customer_name || '',
    booking.email || '',
    booking.phone || '',
    serviceName,
    booking.appointment_date || '',
    booking.appointment_time || '',
    booking.location ?? '',
    duration,
    booking.amount ? booking.amount.toString() : '0',
    booking.currency || 'INR',
    booking.payment_status || 'PENDING',
    booking.booking_status || 'PENDING',
    booking.notes ?? '',
  ];
}

// ─── Public Functions ─────────────────────────────────────────────────────────

/**
 * Appends a new row for the booking to the 'Bookings' sheet.
 * Safe to call from createBooking — failure is logged and returned, not thrown.
 */
export async function syncBookingToSheet(
  booking: Booking
): Promise<{ synced: boolean; error?: string }> {
  if (!isConfigured()) return notConfigured();

  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId(),
      range: `${SHEET_NAME}!A:${String.fromCharCode(65 + SHEET_COLUMNS.length - 1)}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [bookingToRow(booking)],
      },
    });

    return { synced: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sheetsService] syncBookingToSheet failed:', message);
    return { synced: false, error: message };
  }
}

/**
 * Finds the row matching bookingId in column A and updates the status columns.
 * Uses batchUpdate for atomic column targeting.
 */
export async function updateBookingRowInSheet(
  bookingId: string,
  status: BookingStatus,
  paymentStatus?: PaymentStatus
): Promise<{ synced: boolean; error?: string }> {
  if (!isConfigured()) return notConfigured();

  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const sid = spreadsheetId();

    // Read column A to find the row number (1-indexed)
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sid,
      range: `${SHEET_NAME}!A:A`,
    });

    const columnA = readRes.data.values ?? [];
    // Row index is 1-indexed in Sheets; row 1 is the header
    const rowIndex = columnA.findIndex(
      (row) => row[0] === bookingId
    );

    if (rowIndex === -1) {
      const msg = `Booking ID ${bookingId} not found in sheet.`;
      console.warn('[sheetsService] updateBookingRowInSheet:', msg);
      return { synced: false, error: msg };
    }

    // Convert 0-indexed array position to 1-indexed Sheets row
    const sheetRow = rowIndex + 1;

    // Build update data — only update the columns that changed
    const data: Array<{ range: string; values: string[][] }> = [
      {
        range: `${SHEET_NAME}!${columnLetter(COL_BOOKING_STATUS)}${sheetRow}`,
        values: [[status]],
      },
    ];

    if (paymentStatus !== undefined) {
      data.push({
        range: `${SHEET_NAME}!${columnLetter(COL_PAYMENT_STATUS)}${sheetRow}`,
        values: [[paymentStatus]],
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sid,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data,
      },
    });

    return { synced: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sheetsService] updateBookingRowInSheet failed:', message);
    return { synced: false, error: message };
  }
}

/**
 * Retries a full row sync for a booking that previously failed.
 * Checks whether the booking_id already exists in the sheet to avoid duplicates;
 * if found, returns synced:true (idempotent). Otherwise appends a new row.
 */
export async function retryFailedSync(
  bookingId: string,
  booking: Booking
): Promise<{ synced: boolean; error?: string }> {
  if (!isConfigured()) return { synced: false };

  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const sid = spreadsheetId();

    // Check for existing row
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sid,
      range: `${SHEET_NAME}!A:A`,
    });

    const columnA = readRes.data.values ?? [];
    const alreadyExists = columnA.some((row) => row[0] === bookingId);

    if (alreadyExists) {
      console.log(`[sheetsService] retryFailedSync: ${bookingId} already in sheet.`);
      return { synced: true };
    }

    // Append the row
    await sheets.spreadsheets.values.append({
      spreadsheetId: sid,
      range: `${SHEET_NAME}!A:${columnLetter(SHEET_COLUMNS.length - 1)}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [bookingToRow(booking)],
      },
    });

    return { synced: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sheetsService] retryFailedSync failed:', message);
    return { synced: false, error: message };
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Converts a 0-based column index to a Sheets column letter (A, B, … Z, AA…). */
function columnLetter(index: number): string {
  let letter = '';
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}
