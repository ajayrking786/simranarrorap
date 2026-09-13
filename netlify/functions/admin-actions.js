const { db, store } = require('../../data-store');

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
    if (event.httpMethod === 'GET') {
      const stats = {
        totalBookings: db.prepare('SELECT COUNT(*) n FROM bookings').get()?.n || 0,
        pending: db.prepare('SELECT COUNT(*) n FROM bookings WHERE status=\'PENDING\'').get()?.n || 0,
        approved: db.prepare('SELECT COUNT(*) n FROM bookings WHERE status=\'APPROVED\'').get()?.n || 0,
        rejected: db.prepare('SELECT COUNT(*) n FROM bookings WHERE status=\'REJECTED\'').get()?.n || 0,
        today: db.prepare('SELECT COUNT(*) n FROM bookings WHERE appointment_date=DATE(\'now\',\'localtime\')').get()?.n || 0,
        upcoming: db.prepare('SELECT COUNT(*) n FROM bookings WHERE appointment_date>=DATE(\'now\',\'localtime\') AND status=\'APPROVED\'').get()?.n || 0,
        paymentPending: db.prepare('SELECT COUNT(*) n FROM bookings WHERE payment_status=\'PENDING_VERIFICATION\'').get()?.n || 0
      };

      const categories = db.prepare('SELECT * FROM booking_categories ORDER BY sort_order,id').all();
      const live = db.prepare('SELECT * FROM live_settings WHERE id=1').get();
      const paymentSettings = db.prepare('SELECT * FROM payment_settings WHERE id=1').get();

      return jsonResponse(200, {
        stats,
        categories,
        live,
        paymentSettings
      });
    }

    if (event.httpMethod === 'POST') {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      const { action } = body;

      if (action === 'APPROVE_PAYMENT') {
        const paymentId = Number(body.payment_id);
        const p = db.prepare('SELECT * FROM payments WHERE id=?').get(paymentId);
        if (!p) return jsonResponse(404, { error: 'Payment record not found.' });

        db.prepare('UPDATE payments SET status=\'APPROVED\', reviewed_at=CURRENT_TIMESTAMP WHERE id=?').run(paymentId);
        db.prepare('UPDATE bookings SET payment_status=\'PAID\', updated_at=CURRENT_TIMESTAMP WHERE id=?').run(p.booking_id);

        const b = db.prepare('SELECT * FROM bookings WHERE id=?').get(p.booking_id);
        if (b) {
          db.prepare('INSERT INTO notifications (user_id,title,message) VALUES (?,?,?)')
            .run(b.user_id, 'Payment Verified', `Payment of INR ${p.amount} for booking ${b.booking_code} has been approved.`);
        }

        return jsonResponse(200, { success: true, message: 'Payment verified and booking marked as PAID.' });
      }

      if (action === 'REJECT_PAYMENT') {
        const paymentId = Number(body.payment_id);
        db.prepare('UPDATE payments SET status=\'REJECTED\', reviewed_at=CURRENT_TIMESTAMP WHERE id=?').run(paymentId);
        return jsonResponse(200, { success: true, message: 'Payment rejected.' });
      }

      if (action === 'UPDATE_LIVE') {
        const { title, description, live_url, thumbnail_path, start_date, start_time, end_date, end_time, enabled } = body;
        db.prepare(`
          UPDATE live_settings
          SET title=?, description=?, live_url=?, thumbnail_path=?, start_date=?, start_time=?, end_date=?, end_time=?, enabled=?, updated_at=CURRENT_TIMESTAMP
          WHERE id=1
        `).run(title, description, live_url, thumbnail_path, start_date, start_time, end_date, end_time, enabled ? 1 : 0);
        return jsonResponse(200, { success: true, message: 'Live settings saved.' });
      }

      return jsonResponse(400, { error: `Unsupported admin action: ${action}` });
    }

    return jsonResponse(405, { error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[Netlify admin-actions] Error:', err);
    return jsonResponse(500, { error: err.message });
  }
};
