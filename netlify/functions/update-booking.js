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
  if (!['POST', 'PATCH', 'PUT'].includes(event.httpMethod)) {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const bookingId = Number(body.booking_id || body.id || (event.queryStringParameters && event.queryStringParameters.id));
    const action = String(body.action || '').toUpperCase();

    if (!bookingId) {
      return jsonResponse(400, { error: 'booking_id is required.' });
    }

    const booking = db.prepare(`
      SELECT b.*, c.name category_name, c.slug category_slug, u.email customer_email, u.name customer_name
      FROM bookings b
      LEFT JOIN booking_categories c ON c.id=b.category_id
      LEFT JOIN users u ON u.id=b.user_id
      WHERE b.id=?
    `).get(bookingId);

    if (!booking) {
      return jsonResponse(404, { error: 'Booking not found.' });
    }

    if (action === 'APPROVE') {
      let location = body.location || booking.location || '';
      let meetUrl = body.google_meet_url || booking.google_meet_url || null;
      let eventId = booking.google_event_id || null;

      if (!meetUrl && booking.category_slug === 'video-call') {
        try {
          if (googleSvc.configured()) {
            const calEvent = await googleSvc.createAppointmentEvent({
              summary: `Consultation - ${booking.customer_name || 'Client'} (${booking.booking_code})`,
              description: `Appointment type: ${booking.appointment_type}\nBooking Code: ${booking.booking_code}`,
              date: booking.appointment_date,
              time: booking.appointment_time,
              durationMinutes: 30,
              customerEmail: booking.customer_email
            });
            if (calEvent) {
              eventId = calEvent.id;
              meetUrl = calEvent.hangoutLink || meetUrl;
            }
          }
        } catch (calErr) {
          console.warn('[Netlify update-booking] Google Calendar sync warning:', calErr.message);
        }
      }

      db.prepare(`
        UPDATE bookings
        SET status='APPROVED', location=?, google_event_id=?, google_meet_url=?, rejection_reason=NULL, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).run(location, eventId, meetUrl, bookingId);

      // Create in-app notification
      db.prepare('INSERT INTO notifications (user_id,title,message) VALUES (?,?,?)')
        .run(booking.user_id, 'Booking Approved', `Your booking ${booking.booking_code} for ${booking.appointment_date} at ${booking.appointment_time} has been approved.`);

      return jsonResponse(200, {
        success: true,
        action: 'APPROVE',
        message: 'Booking approved successfully.',
        google_meet_url: meetUrl
      });
    }

    if (action === 'REJECT') {
      const reason = body.reason || 'Requested slot is unavailable. Please select another time.';
      db.prepare(`
        UPDATE bookings
        SET status='REJECTED', rejection_reason=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).run(reason, bookingId);

      db.prepare('INSERT INTO notifications (user_id,title,message) VALUES (?,?,?)')
        .run(booking.user_id, 'Booking Status Update', `Your booking ${booking.booking_code} could not be approved: ${reason}`);

      return jsonResponse(200, {
        success: true,
        action: 'REJECT',
        message: 'Booking rejected.'
      });
    }

    if (action === 'RESCHEDULE') {
      const { appointment_date, appointment_time } = body;
      if (!appointment_date || !appointment_time) {
        return jsonResponse(400, { error: 'appointment_date and appointment_time required for rescheduling.' });
      }

      const conflict = db.prepare(`
        SELECT id FROM bookings
        WHERE appointment_date=? AND appointment_time=? AND status IN ('PENDING','APPROVED') AND category_id=? AND id!=?
      `).get(appointment_date, appointment_time, booking.category_id, bookingId);

      if (conflict) {
        return jsonResponse(409, { error: 'Target slot is already reserved.' });
      }

      db.prepare(`
        UPDATE bookings
        SET appointment_date=?, appointment_time=?, status='PENDING', updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).run(appointment_date, appointment_time, bookingId);

      db.prepare('INSERT INTO notifications (user_id,title,message) VALUES (?,?,?)')
        .run(booking.user_id, 'Booking Rescheduled', `Your booking ${booking.booking_code} has been rescheduled to ${appointment_date} at ${appointment_time} and is pending confirmation.`);

      return jsonResponse(200, {
        success: true,
        action: 'RESCHEDULE',
        message: 'Booking rescheduled to pending.'
      });
    }

    if (action === 'CANCEL') {
      db.prepare('UPDATE bookings SET status=\'CANCELLED\', updated_at=CURRENT_TIMESTAMP WHERE id=?')
        .run(bookingId);

      db.prepare('INSERT INTO notifications (user_id,title,message) VALUES (?,?,?)')
        .run(booking.user_id, 'Booking Cancelled', `Your booking ${booking.booking_code} has been cancelled.`);

      return jsonResponse(200, {
        success: true,
        action: 'CANCEL',
        message: 'Booking cancelled.'
      });
    }

    return jsonResponse(400, { error: `Unsupported action: ${action}` });
  } catch (error) {
    console.error('[Netlify update-booking] Error:', error);
    return jsonResponse(500, { error: error.message || 'Internal server error.' });
  }
};
