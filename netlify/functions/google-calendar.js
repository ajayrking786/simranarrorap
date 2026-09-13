const googleSvc = require('../../google');
const { google } = require('googleapis');

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
      return jsonResponse(200, {
        active: Boolean(userToken || googleSvc.configured()),
        googleCalendar: Boolean(userToken || googleSvc.configured())
      });
    }

    if (event.httpMethod === 'POST') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      const { summary, description, date, time, durationMinutes, customerEmail } = body;

      // User token provided from client workspace auth
      if (userToken) {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: userToken });
        const calendar = google.calendar({ version: 'v3', auth });

        const startIso = `${date || new Date().toISOString().slice(0, 10)}T${time || '12:00'}:00`;
        const startDate = new Date(startIso);
        const endDate = new Date(startDate.getTime() + (Number(durationMinutes) || 30) * 60000);

        const eventRes = await calendar.events.insert({
          calendarId: 'primary',
          conferenceDataVersion: 1,
          requestBody: {
            summary: summary || 'Simran Arrora Consultation',
            description: description || 'Private Consultation Session',
            start: { dateTime: startDate.toISOString() },
            end: { dateTime: endDate.toISOString() },
            attendees: customerEmail ? [{ email: customerEmail }] : [],
            conferenceData: {
              createRequest: {
                requestId: `meet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
              }
            }
          }
        });

        const meetUrl = eventRes.data.hangoutLink || eventRes.data.conferenceData?.entryPoints?.[0]?.uri || null;

        return jsonResponse(200, {
          success: true,
          eventId: eventRes.data.id,
          hangoutLink: meetUrl,
          eventUrl: eventRes.data.htmlLink
        });
      }

      // Or using server service account
      if (googleSvc.configured()) {
        const eventRes = await googleSvc.createAppointmentEvent({
          summary: summary || 'Consultation Session',
          description,
          date,
          time,
          durationMinutes: Number(durationMinutes) || 30,
          customerEmail
        });

        return jsonResponse(200, {
          success: true,
          eventId: eventRes.id,
          hangoutLink: eventRes.hangoutLink || null,
          eventUrl: eventRes.htmlLink
        });
      }

      // Fallback mock/simulated meet URL for instant preview testing
      const generatedMeetUrl = `https://meet.google.com/${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;
      return jsonResponse(200, {
        success: true,
        hangoutLink: generatedMeetUrl,
        notice: 'Workspace credentials not detected; generated meeting space code.'
      });
    }

    return jsonResponse(405, { error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[Netlify google-calendar] Error:', err);
    return jsonResponse(500, { error: err.message });
  }
};
