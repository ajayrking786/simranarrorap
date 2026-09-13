const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;
let firebaseStorage = null;

function loadConfig() {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

function initFirebaseBackend() {
  if (firebaseApp) {
    return {
      app: firebaseApp,
      db: firestoreDb,
      auth: firebaseAuth,
      storage: firebaseStorage
    };
  }

  const appletConfig = loadConfig();
  const projectId = process.env.FIREBASE_PROJECT_ID || appletConfig.projectId || 'gen-lang-client-0442308093';
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || `${projectId}.firebasestorage.app`;

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    const existing = getApps();
    if (existing.length > 0) {
      firebaseApp = existing[0];
    } else if (clientEmail && privateKey) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        }),
        storageBucket
      });
    } else {
      firebaseApp = initializeApp({
        projectId,
        storageBucket
      });
    }

    try {
      firestoreDb = getFirestore(firebaseApp);
    } catch (e) {
      console.warn('[Firebase Backend] Firestore init error:', e.message);
    }

    try {
      firebaseAuth = getAuth(firebaseApp);
    } catch (e) {
      console.warn('[Firebase Backend] Auth init error:', e.message);
    }

    try {
      firebaseStorage = getStorage(firebaseApp);
    } catch (e) {
      console.warn('[Firebase Backend] Storage init error:', e.message);
    }

    return {
      app: firebaseApp,
      db: firestoreDb,
      auth: firebaseAuth,
      storage: firebaseStorage
    };
  } catch (err) {
    console.error('[Firebase Backend] Initialization error:', err.message);
    return {
      app: null,
      db: null,
      auth: null,
      storage: null
    };
  }
}

/**
 * Save or update a booking document in Cloud Firestore
 */
async function syncBookingToFirestore(booking) {
  if (!booking || !booking.booking_code) return null;
  const { db } = initFirebaseBackend();
  if (!db) return null;

  try {
    const docRef = db.collection('bookings').doc(booking.booking_code);
    const data = {
      bookingCode: booking.booking_code,
      name: booking.customer_name || booking.name || 'Client',
      email: booking.customer_email || booking.email || '',
      phone: booking.customer_phone || booking.phone || '',
      serviceName: booking.service_name || 'Consultation',
      categoryName: booking.category_name || booking.appointment_type || 'General',
      appointmentDate: booking.appointment_date,
      appointmentTime: booking.appointment_time,
      price: Number(booking.price || 0),
      currency: booking.currency || 'INR',
      status: booking.status || 'PENDING',
      paymentStatus: booking.payment_status || 'UNPAID',
      googleMeetUrl: booking.google_meet_url || '',
      googleCalendarEventId: booking.google_event_id || '',
      location: booking.location || '',
      notes: booking.notes || '',
      updatedAt: new Date().toISOString()
    };
    if (booking.created_at) data.createdAt = booking.created_at;
    if (booking.rejection_reason) data.rejectionReason = booking.rejection_reason;

    await docRef.set(data, { merge: true });
    return { ok: true, id: booking.booking_code };
  } catch (err) {
    console.warn('[Firebase Backend] Firestore syncBooking error:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Update specific fields of a booking in Firestore
 */
async function updateBookingInFirestore(bookingCode, patch) {
  if (!bookingCode) return null;
  const { db } = initFirebaseBackend();
  if (!db) return null;

  try {
    const docRef = db.collection('bookings').doc(bookingCode);
    const updateData = {
      ...patch,
      updatedAt: new Date().toISOString()
    };
    await docRef.set(updateData, { merge: true });
    return { ok: true };
  } catch (err) {
    console.warn('[Firebase Backend] Firestore updateBooking error:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Save user profile in Cloud Firestore
 */
async function syncUserToFirestore(user) {
  if (!user || !user.email) return null;
  const { db } = initFirebaseBackend();
  if (!db) return null;

  try {
    const docId = user.uid || String(user.id || user.email);
    const docRef = db.collection('users').doc(docId);
    await docRef.set({
      name: user.name || 'User',
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'customer',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { ok: true, id: docId };
  } catch (err) {
    console.warn('[Firebase Backend] Firestore syncUser error:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Save payment proof submission to Firestore
 */
async function syncPaymentToFirestore(payment) {
  if (!payment) return null;
  const { db } = initFirebaseBackend();
  if (!db) return null;

  try {
    const docId = String(payment.id || `PAY-${Date.now()}`);
    const docRef = db.collection('payments').doc(docId);
    await docRef.set({
      bookingId: payment.booking_id,
      amount: Number(payment.amount || 0),
      method: payment.method || 'UPI',
      transactionRef: payment.transaction_ref,
      note: payment.note || '',
      status: payment.status || 'PENDING_VERIFICATION',
      submittedAt: new Date().toISOString()
    }, { merge: true });
    return { ok: true, id: docId };
  } catch (err) {
    console.warn('[Firebase Backend] Firestore syncPayment error:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Save customer contact message to Firestore
 */
async function syncInquiryToFirestore(inquiry) {
  if (!inquiry) return null;
  const { db } = initFirebaseBackend();
  if (!db) return null;

  try {
    const docRef = db.collection('inquiries').doc();
    await docRef.set({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone || '',
      message: inquiry.message,
      createdAt: new Date().toISOString()
    });
    return { ok: true, id: docRef.id };
  } catch (err) {
    console.warn('[Firebase Backend] Firestore syncInquiry error:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Upload file buffer directly to Firebase Storage bucket
 */
async function uploadToStorage(buffer, filename, mimeType = 'image/jpeg') {
  const { storage } = initFirebaseBackend();
  if (!storage) throw new Error('Firebase Storage is not initialized.');

  const config = loadConfig();
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || config.storageBucket || 'gen-lang-client-0442308093.firebasestorage.app';
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(`uploads/${Date.now()}-${filename}`);

  await file.save(buffer, {
    metadata: { contentType: mimeType }
  });

  // Generate a persistent public or signed URL
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(file.name)}?alt=media`;
  return {
    url: publicUrl,
    filename: file.name,
    bucket: bucketName
  };
}

/**
 * Diagnostic test for Cloud Firestore connection & latency
 */
async function testFirestore() {
  const { db } = initFirebaseBackend();
  if (!db) {
    return {
      connected: false,
      status: 'NOT CONNECTED',
      details: 'Firebase Admin Firestore is not initialized.'
    };
  }

  const appletConfig = loadConfig();
  const projectId = process.env.FIREBASE_PROJECT_ID || appletConfig.projectId || 'gen-lang-client-0442308093';

  try {
    const t0 = Date.now();
    const testDoc = db.collection('system_pings').doc('health_check');
    await testDoc.set({
      pingAt: new Date().toISOString(),
      service: 'simran-premium-backend'
    });
    const snap = await testDoc.get();
    const latency = Date.now() - t0;
    return {
      connected: true,
      status: 'CONNECTED',
      latencyMs: latency,
      projectId,
      data: snap.data()
    };
  } catch (err) {
    // Check if client-side fallback is active
    return {
      connected: false,
      status: 'AUTHENTICATION_REQUIRED',
      projectId,
      message: err.message,
      note: 'Firestore is ready for authenticated client and service-account writes with firestore.rules deployed.'
    };
  }
}

module.exports = {
  initFirebaseBackend,
  syncBookingToFirestore,
  updateBookingInFirestore,
  syncUserToFirestore,
  syncPaymentToFirestore,
  syncInquiryToFirestore,
  uploadToStorage,
  testFirestore
};
