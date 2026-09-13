const { google } = require('googleapis');
const nodemailer = require('nodemailer');

function configured() {
  const hasServiceAccount = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  const hasOAuthRefresh = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
  return hasServiceAccount || hasOAuthRefresh;
}

function serviceAccountAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) return null;
  try {
    const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
    return new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/forms.body',
        'https://www.googleapis.com/auth/forms.responses.readonly'
      ]
    });
  } catch (err) {
    console.warn('[Google Auth] Service account init failed:', err.message);
    return null;
  }
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

function getAuth(bearerToken) {
  if (bearerToken) {
    const clean = String(bearerToken).replace(/^Bearer\s+/i, '').trim();
    if (clean) {
      const client = new google.auth.OAuth2();
      client.setCredentials({ access_token: clean });
      return client;
    }
  }
  const sa = serviceAccountAuth();
  if (sa) return sa;
  if (configured()) {
    return oauthClient();
  }
  return null;
}

// ---------------- Google Calendar ----------------
async function createCalendarEvent({ booking, service, customer, token }) {
  const auth = getAuth(token);
  if (!auth) return { skipped: true };
  const calendar = google.calendar({ version: 'v3', auth });
  const start = new Date(`${booking.appointment_date}T${booking.appointment_time}:00`);
  const end = new Date(start.getTime() + (service?.duration_minutes || 30) * 60000);
  const wantsMeet = booking.appointment_type === 'Video Call' || !booking.appointment_type;

  const event = {
    summary: `${service?.name || 'Consultation'} — ${customer?.name || booking.name || 'Client'}`,
    description: booking.notes || '',
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    attendees: customer?.email ? [{ email: customer.email }] : undefined,
    location: booking.location || undefined
  };
  if (wantsMeet) {
    event.conferenceData = {
      createRequest: {
        requestId: `booking-${booking.id || Date.now()}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    };
  }

  const result = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    conferenceDataVersion: wantsMeet ? 1 : 0,
    sendUpdates: customer?.email ? 'all' : 'none',
    requestBody: event
  });
  return {
    eventId: result.data.id,
    meetUrl: result.data.hangoutLink || null
  };
}

// ---------------- Google Meet API ----------------
async function createMeetingSpace({ token }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const meet = google.meet({ version: 'v2', auth });
  const res = await meet.spaces.create({
    requestBody: {
      config: {
        accessType: 'OPEN'
      }
    }
  });
  return {
    spaceName: res.data.name,
    meetingUri: res.data.meetingUri,
    meetingCode: res.data.meetingCode
  };
}

// ---------------- Google Sheets API ----------------
async function appendBookingToSheet({ booking, service, customer, token }) {
  const auth = getAuth(token);
  if (!auth || !process.env.GOOGLE_SHEET_ID) return { skipped: true };
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${process.env.GOOGLE_SHEET_TAB || 'Bookings'}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        booking.booking_code,
        booking.created_at || new Date().toISOString(),
        customer?.name || booking.name || '',
        customer?.email || booking.email || '',
        customer?.phone || booking.phone || '',
        booking.customer_dob || '',
        booking.customer_age || '',
        booking.category_name || booking.appointment_type || 'General',
        service?.name || booking.service_name || 'Consultation',
        booking.duration_minutes || service?.duration_minutes || 30,
        booking.price || service?.price || 0,
        booking.currency || service?.currency || 'INR',
        booking.platform_name || '',
        booking.appointment_date,
        booking.appointment_time,
        booking.location || '',
        booking.notes || '',
        booking.payment_status || 'UNPAID',
        booking.status || 'PENDING'
      ]]
    }
  });
  return { ok: true };
}

async function updateBookingInSheet({ booking, token }) {
  const auth = getAuth(token);
  if (!auth || !process.env.GOOGLE_SHEET_ID) return { skipped: true };
  const sheets = google.sheets({ version: 'v4', auth });
  const range = `${process.env.GOOGLE_SHEET_TAB || 'Bookings'}!A:U`;
  try {
    const result = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID, range });
    const rows = result.data.values || [];
    const index = rows.findIndex(row => row[0] === booking.booking_code);
    if (index < 0) return { missing: true };
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${process.env.GOOGLE_SHEET_TAB || 'Bookings'}!S${index + 1}:U${index + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[booking.status, booking.google_meet_url || '', booking.google_event_id || '']] }
    });
    return { ok: true };
  } catch (err) {
    console.warn('[Google Sheets] updateBookingInSheet error:', err.message);
    return { error: err.message };
  }
}

async function createBookingSpreadsheet({ token, title, rows = [] }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: title || `Simran Premium Bookings — ${new Date().toISOString().slice(0,10)}` },
      sheets: [{ properties: { title: 'Bookings' } }]
    }
  });
  const spreadsheetId = spreadsheet.data.spreadsheetId;
  const header = [
    'Booking Code', 'Created At', 'Customer Name', 'Email', 'Phone',
    'Category', 'Service', 'Duration (min)', 'Price', 'Currency',
    'Date', 'Time', 'Payment Status', 'Booking Status', 'Google Meet Link', 'Notes'
  ];
  const allValues = [header, ...rows];
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Bookings!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: allValues }
  });
  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title: spreadsheet.data.properties.title
  };
}

async function readSpreadsheet({ token, spreadsheetId, range = 'Bookings!A1:Z50' }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return { values: res.data.values || [] };
}

// ---------------- Google Docs API ----------------
async function createConsultationDoc({ token, title, customerName, serviceName, date, time, notes, meetLink }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const docs = google.docs({ version: 'v1', auth });
  const doc = await docs.documents.create({
    requestBody: {
      title: title || `Consultation Notes — ${customerName || 'Client'} (${date || 'Session'})`
    }
  });
  const documentId = doc.data.documentId;
  const content = [
    `SIMRAN ARRORA — CONSULTATION & SESSION BRIEFING\n`,
    `===============================================\n\n`,
    `Client Name: ${customerName || 'N/A'}\n`,
    `Service / Topic: ${serviceName || 'Personal Consultation'}\n`,
    `Scheduled Date & Time: ${date || 'TBD'} at ${time || 'TBD'}\n`,
    `Google Meet Video Call: ${meetLink || 'Not assigned yet'}\n\n`,
    `Client Pre-Session Notes:\n`,
    `${notes || 'None provided'}\n\n`,
    `-----------------------------------------------\n`,
    `Consultant Session Notes & Action Items:\n`,
    `1. Discussion summary:\n\n`,
    `2. Key recommendations:\n\n`,
    `3. Follow-up items:\n\n`,
    `Generated via Simran Premium Workspace Integration on ${new Date().toLocaleString()}\n`
  ].join('');

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    }
  });

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    title: doc.data.title
  };
}

async function getDoc({ token, documentId }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const docs = google.docs({ version: 'v1', auth });
  const res = await docs.documents.get({ documentId });
  return res.data;
}

// ---------------- Google Forms API ----------------
async function createIntakeForm({ token, title, description }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const forms = google.forms({ version: 'v1', auth });
  const created = await forms.forms.create({
    requestBody: {
      info: {
        title: title || 'Simran Premium — Consultation Intake Questionnaire',
        documentTitle: title || 'Consultation Intake Questionnaire'
      }
    }
  });
  const formId = created.data.formId;

  // Add questions to the form
  await forms.forms.batchUpdate({
    formId,
    requestBody: {
      requests: [
        {
          updateFormInfo: {
            info: {
              description: description || 'Please fill out this quick preparation form before our scheduled session so we can maximize our time together.'
            },
            updateMask: 'description'
          }
        },
        {
          createItem: {
            item: {
              title: 'What are your primary goals for this session?',
              description: 'Briefly describe what you would like to achieve or discuss.',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: true }
                }
              }
            },
            location: { index: 0 }
          }
        },
        {
          createItem: {
            item: {
              title: 'Areas of Interest',
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'CHECKBOX',
                    options: [
                      { value: '1-on-1 Personal Video Consultation' },
                      { value: 'Creator & Content Production Strategy' },
                      { value: 'Exclusive Fan Club VIP Experience' },
                      { value: 'Brand Collaboration & Media' },
                      { value: 'Other' }
                    ]
                  }
                }
              }
            },
            location: { index: 1 }
          }
        },
        {
          createItem: {
            item: {
              title: 'Instagram or Social Media Handle (Optional)',
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: false }
                }
              }
            },
            location: { index: 2 }
          }
        },
        {
          createItem: {
            item: {
              title: 'Any specific questions or topics you want to prioritize?',
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: true }
                }
              }
            },
            location: { index: 3 }
          }
        }
      ]
    }
  });

  return {
    formId,
    responderUri: created.data.responderUri,
    editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
    title: created.data.info?.title || title
  };
}

async function getFormResponses({ token, formId }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const forms = google.forms({ version: 'v1', auth });
  const res = await forms.forms.responses.list({ formId });
  return { responses: res.data.responses || [] };
}

// ---------------- Google Drive API ----------------
async function listDriveFiles({ token, pageSize = 20, q }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
    pageSize,
    q: q || "trashed = false",
    fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, createdTime, size)',
    orderBy: 'createdTime desc'
  });
  return { files: res.data.files || [] };
}

async function uploadDriveFile({ token, name, mimeType = 'text/plain', content }) {
  const auth = getAuth(token);
  if (!auth) throw new Error('Google authentication or token required.');
  const drive = google.drive({ version: 'v3', auth });
  const { Readable } = require('stream');
  const stream = new Readable();
  stream.push(content);
  stream.push(null);

  const res = await drive.files.create({
    requestBody: {
      name: name || `Simran-Consultation-File-${Date.now()}.txt`,
      mimeType
    },
    media: {
      mimeType,
      body: stream
    },
    fields: 'id, name, mimeType, webViewLink, createdTime'
  });
  return res.data;
}

// ---------------- Gmail Notification ----------------
async function sendEmail({ to, subject, text, html }) {
  if (!to) return { skipped: true };
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text, html });
      return { ok: true, method: 'smtp' };
    } catch (err) {
      console.warn('[Gmail SMTP] send failed:', err.message);
    }
  }
  if (configured() && process.env.GMAIL_USER && process.env.GOOGLE_REFRESH_TOKEN) {
    try {
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
      await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text, html });
      return { ok: true, method: 'oauth2' };
    } catch (err) {
      console.warn('[Gmail OAuth2] send failed:', err.message);
    }
  }
  console.log(`[Email Notification] To: ${to} | Subject: ${subject}`);
  return { skipped: true, logged: true };
}

module.exports = {
  configured,
  getAuth,
  createCalendarEvent,
  createMeetingSpace,
  appendBookingToSheet,
  updateBookingInSheet,
  createBookingSpreadsheet,
  readSpreadsheet,
  createConsultationDoc,
  getDoc,
  createIntakeForm,
  getFormResponses,
  listDriveFiles,
  uploadDriveFile,
  sendEmail
};
