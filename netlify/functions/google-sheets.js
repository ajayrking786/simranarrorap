const { db } = require('../../data-store');
const googleSvc = require('../../google');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(204, {});

  try {
    const headers = event.headers || {};
    const authHeader = headers.authorization || headers.Authorization || '';
    const userToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (event.httpMethod === 'GET') {
      const sheetId = process.env.GOOGLE_SHEET_ID;
      const configured = Boolean(userToken || (googleSvc.configured() && sheetId));
      return jsonResponse(200, {
        configured,
        spreadsheetId: sheetId || null,
        message: configured ? 'Google Sheets integration active.' : 'Requires Google OAuth authorization or Service Account credentials.'
      });
    }

    if (event.httpMethod === 'POST') {
      const bookings = db.prepare(`
        SELECT b.*, c.name category_name, p.price, p.currency, pl.name platform_name,
               u.name customer_name, u.email customer_email, u.phone customer_phone
        FROM bookings b
        LEFT JOIN booking_categories c ON c.id = b.category_id
        LEFT JOIN price_options p ON p.id = b.price_option_id
        LEFT JOIN platforms pl ON pl.id = b.platform_id
        LEFT JOIN users u ON u.id = b.user_id
        ORDER BY b.id DESC
      `).all();

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;

      if (!spreadsheetId && !userToken) {
        return jsonResponse(200, {
          success: true,
          count: bookings.length,
          data: bookings,
          note: 'Spreadsheet ID not set in environment; exported bookings as JSON payload.'
        });
      }

      // If user provided a client OAuth token, use Google Sheets API directly
      if (userToken) {
        const { google } = require('googleapis');
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: userToken });
        const sheets = google.sheets({ version: 'v4', auth });

        let targetId = spreadsheetId;
        if (!targetId) {
          const createRes = await sheets.spreadsheets.create({
            resource: {
              properties: { title: `Simran Bookings Export ${new Date().toISOString().slice(0, 10)}` }
            }
          });
          targetId = createRes.data.spreadsheetId;
        }

        const rows = [
          ['Booking Code', 'Customer Name', 'Email', 'Phone', 'Category', 'Appointment Type', 'Date', 'Time', 'Location', 'Price', 'Currency', 'Payment Status', 'Status', 'Meet URL', 'Created At']
        ];
        bookings.forEach(b => {
          rows.push([
            b.booking_code,
            b.customer_name || '',
            b.customer_email || '',
            b.customer_phone || '',
            b.category_name || '',
            b.appointment_type || '',
            b.appointment_date || '',
            b.appointment_time || '',
            b.location || '',
            b.price || 0,
            b.currency || 'INR',
            b.payment_status || '',
            b.status || '',
            b.google_meet_url || '',
            b.created_at || ''
          ]);
        });

        await sheets.spreadsheets.values.update({
          spreadsheetId: targetId,
          range: 'Sheet1!A1',
          valueInputOption: 'USER_ENTERED',
          resource: { values: rows }
        });

        return jsonResponse(200, {
          success: true,
          spreadsheetId: targetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetId}/edit`,
          rowsSynced: rows.length - 1
        });
      }

      // Or using server service account
      if (googleSvc.configured() && spreadsheetId) {
        for (const b of bookings.slice(0, 10)) {
          await googleSvc.appendBookingRow({
            bookingCode: b.booking_code,
            customerName: b.customer_name,
            customerEmail: b.customer_email,
            customerPhone: b.customer_phone,
            serviceName: b.category_name || b.appointment_type,
            appointmentType: b.appointment_type,
            date: b.appointment_date,
            time: b.appointment_time,
            location: b.location || '',
            price: b.price || 0,
            currency: b.currency || 'INR',
            paymentStatus: b.payment_status || 'UNPAID',
            status: b.status,
            meetLink: b.google_meet_url || '',
            createdAt: b.created_at
          });
        }

        return jsonResponse(200, {
          success: true,
          spreadsheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
          message: 'Synced bookings with Google Sheets via server service account.'
        });
      }

      return jsonResponse(200, {
        success: true,
        count: bookings.length,
        data: bookings
      });
    }

    return jsonResponse(405, { error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[Netlify google-sheets] Error:', err);
    return jsonResponse(500, { error: err.message });
  }
};
