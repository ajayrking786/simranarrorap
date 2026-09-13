const nodemailer = require('nodemailer');

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
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method Not Allowed' });

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const { to, subject, html, text } = body;

    if (!to || (!html && !text)) {
      return jsonResponse(400, { error: 'Missing required parameters: to, subject, html/text.' });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.warn('[Netlify send-email] GMAIL_USER / GMAIL_PASS not configured. Logging email instead:');
      console.log(`To: ${to} | Subject: ${subject}`);
      return jsonResponse(200, {
        success: true,
        sent: false,
        notice: 'Email logged (GMAIL_USER / GMAIL_APP_PASSWORD not configured).'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });

    const info = await transporter.sendMail({
      from: `"Simran Arrora Official" <${gmailUser}>`,
      to,
      subject: subject || 'Appointment Update - Simran Arrora',
      text: text || '',
      html: html || `<p>${text}</p>`
    });

    return jsonResponse(200, {
      success: true,
      sent: true,
      messageId: info.messageId
    });
  } catch (err) {
    console.error('[Netlify send-email] Error:', err);
    return jsonResponse(500, { error: err.message });
  }
};
