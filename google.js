const { google } = require('googleapis');
const nodemailer = require('nodemailer');

function configured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

function oauthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

async function createCalendarEvent({ booking, service, customer }) {
  if (!configured()) return { skipped: true };
  const auth = oauthClient();
  const calendar = google.calendar({ version: 'v3', auth });
  const start = new Date(`${booking.appointment_date}T${booking.appointment_time}:00`);
  const end = new Date(start.getTime() + service.duration_minutes * 60000);
  const wantsMeet = booking.appointment_type === 'Video Call';

  const event = {
    summary: `${service.name} — ${customer.name}`,
    description: booking.notes || '',
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    attendees: [{ email: customer.email }],
    location: booking.location || undefined
  };
  if (wantsMeet) {
    event.conferenceData = {
      createRequest: {
        requestId: `booking-${booking.id}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    };
  }

  const result = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    conferenceDataVersion: wantsMeet ? 1 : 0,
    sendUpdates: 'all',
    requestBody: event
  });
  return {
    eventId: result.data.id,
    meetUrl: result.data.hangoutLink || null
  };
}

async function appendBookingToSheet({ booking, service, customer }) {
  if (!configured() || !process.env.GOOGLE_SHEET_ID) return { skipped: true };
  const auth = oauthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${process.env.GOOGLE_SHEET_TAB || 'Bookings'}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[
      booking.booking_code, booking.created_at || new Date().toISOString(), customer.name,
      customer.email, customer.phone || '', booking.customer_dob || '', booking.customer_age || '',
      booking.category_name || booking.appointment_type, service.name, booking.duration_minutes || service.duration_minutes,
      booking.price || service.price, booking.currency || service.currency || 'INR', booking.platform_name || '',
      booking.appointment_date, booking.appointment_time, booking.location || '', booking.notes || '',
      booking.payment_status || 'UNPAID', booking.status || 'PENDING'
    ]] }
  });
  return { ok: true };
}

async function updateBookingInSheet({ booking }) {
  if (!configured() || !process.env.GOOGLE_SHEET_ID) return { skipped: true };
  const auth = oauthClient();
  const sheets = google.sheets({ version: 'v4', auth });
  const range = `${process.env.GOOGLE_SHEET_TAB || 'Bookings'}!A:S`;
  const result = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID, range });
  const rows = result.data.values || [];
  const index = rows.findIndex(row => row[0] === booking.booking_code);
  if (index < 0) return { missing: true };
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${process.env.GOOGLE_SHEET_TAB || 'Bookings'}!S${index + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[booking.status]] }
  });
  return { ok: true };
}

async function sendEmail({ to, subject, text }) {
  if (!configured() || !process.env.GMAIL_USER) return { skipped: true };
  const auth = oauthClient();
  const accessToken = await auth.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token
    }
  });
  await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text });
  return { ok: true };
}

module.exports = { configured, createCalendarEvent, appendBookingToSheet, updateBookingInSheet, sendEmail };
