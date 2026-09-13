const { db, store } = require('../../data-store');
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

function calculateAge(dob) {
  const birth = new Date(`${dob}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(birth.getTime()) || birth > new Date()) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age <= 120 ? age : null;
}

function bookingCode() {
  return `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const {
      category_id,
      price_option_id,
      platform_id,
      service_id,
      appointment_date,
      appointment_time,
      customer_name,
      customer_email,
      customer_phone,
      customer_dob,
      notes,
      location,
      user_id
    } = body;

    if (!category_id && !service_id) {
      return jsonResponse(400, { error: 'Category or service is required.' });
    }

    const catId = Number(category_id || 1);
    const cat = db.prepare('SELECT * FROM booking_categories WHERE id=?').get(catId);
    if (!cat) {
      return jsonResponse(404, { error: 'Category not found.' });
    }

    // Validation for Real Meet
    let verifiedAge = null;
    if (cat.slug === 'real-meet') {
      if (!customer_dob) {
        return jsonResponse(400, { error: 'Date of birth is mandatory for Real Meet.' });
      }
      verifiedAge = calculateAge(customer_dob);
      if (verifiedAge === null || verifiedAge < 18) {
        return jsonResponse(400, { error: 'Real Meet is strictly for verified adults (18+).' });
      }
    }

    if (!appointment_date || !appointment_time) {
      return jsonResponse(400, { error: 'Please choose date and time.' });
    }

    // Check slot conflict
    const conflict = db.prepare(`
      SELECT id FROM bookings 
      WHERE appointment_date=? AND appointment_time=? AND status IN ('PENDING','APPROVED') AND category_id=?
    `).get(appointment_date, appointment_time, catId);

    if (conflict) {
      return jsonResponse(409, { error: 'This time slot is already reserved. Please select another slot.' });
    }

    const priceOpt = price_option_id
      ? db.prepare('SELECT * FROM price_options WHERE id=? AND category_id=? AND active=1').get(price_option_id, catId)
      : db.prepare('SELECT * FROM price_options WHERE category_id=? AND active=1 ORDER BY sort_order,id LIMIT 1').get(catId);

    const platform = platform_id
      ? db.prepare('SELECT * FROM platforms WHERE id=? AND category_id=? AND active=1').get(platform_id, catId)
      : null;

    // Resolve or find user
    let uid = user_id ? Number(user_id) : null;
    if (!uid && customer_email) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email=?').get(customer_email.toLowerCase());
      if (existingUser) {
        uid = existingUser.id;
      } else {
        const res = db.prepare('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,\'customer\')')
          .run(customer_name || 'Customer', customer_email.toLowerCase(), '');
        uid = res.lastInsertRowid;
      }
    }

    const code = bookingCode();
    const serviceRow = db.prepare('SELECT * FROM services WHERE category_id=? AND active=1 ORDER BY sort_order,id LIMIT 1').get(catId)
      || db.prepare('SELECT * FROM services ORDER BY id LIMIT 1').get();

    const newBookingRes = db.prepare(`
      INSERT INTO bookings (
        booking_code, user_id, service_id, category_id, price_option_id, platform_id,
        appointment_type, customer_name, customer_dob, customer_age, currency,
        platform_url, appointment_date, appointment_time, notes, location
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      code,
      uid || 1,
      serviceRow?.id || 1,
      catId,
      priceOpt?.id || null,
      platform?.id || null,
      cat.online_option || cat.name,
      customer_name || 'Customer',
      customer_dob || null,
      verifiedAge,
      priceOpt?.currency || 'INR',
      platform?.url || '',
      appointment_date,
      appointment_time,
      notes || '',
      location || (cat.slug === 'real-meet' ? (cat.locations?.[0] || 'Delhi NCR') : '')
    );

    const createdBooking = db.prepare('SELECT * FROM bookings WHERE id=?').get(newBookingRes.lastInsertRowid);

    // Optional Google Sheets integration
    try {
      if (googleSvc.configured() && process.env.GOOGLE_SHEET_ID) {
        await googleSvc.appendBookingRow({
          bookingCode: code,
          customerName: customer_name,
          customerEmail: customer_email,
          customerPhone: customer_phone,
          serviceName: cat.name,
          appointmentType: cat.online_option || cat.name,
          date: appointment_date,
          time: appointment_time,
          location: location || '',
          price: priceOpt?.price || 0,
          currency: priceOpt?.currency || 'INR',
          paymentStatus: 'UNPAID',
          status: 'PENDING',
          meetLink: '',
          createdAt: new Date().toISOString()
        });
      }
    } catch (sheetErr) {
      console.warn('[Netlify create-booking] Optional Google Sheet sync warning:', sheetErr.message);
    }

    return jsonResponse(201, {
      success: true,
      booking: createdBooking,
      message: 'Booking submitted successfully. Awaiting administrative review.'
    });
  } catch (error) {
    console.error('[Netlify create-booking] Error:', error);
    return jsonResponse(500, { error: error.message || 'Internal server error.' });
  }
};
