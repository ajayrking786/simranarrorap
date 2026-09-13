const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'app-data.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default dataset for creator & consultation site
function getDefaultData() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'simranarrora.p@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminHash = bcrypt.hashSync(adminPassword, 10);

  return {
    users: [
      {
        id: 1,
        name: process.env.ADMIN_NAME || 'Simran Arrora',
        email: adminEmail,
        phone: '+91 9876543210',
        password_hash: adminHash,
        google_id: null,
        role: 'admin',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Demo Admin',
        email: 'admin@simranarrora.com',
        phone: '',
        password_hash: adminHash,
        google_id: null,
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ],
    booking_categories: [
      {
        id: 1,
        name: 'Video Call',
        slug: 'video-call',
        description: 'Private 1-on-1 video call and personal consultation session.',
        image: 'assets/Images/IMG_0474.jpg',
        booking_mode: 'appointment',
        duration_minutes: 15,
        currency: 'INR',
        max_participants: 1,
        online_option: 'Online Video Call',
        available_dates: [],
        available_times: ['11:00', '12:00', '14:00', '16:00', '18:00', '20:00', '21:00'],
        locations: [],
        active: 1,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Audio Call',
        slug: 'audio-call',
        description: 'Direct 1-on-1 audio call session for conversations and Q&A.',
        image: 'assets/Images/IMG_0476.jpg',
        booking_mode: 'appointment',
        duration_minutes: 15,
        currency: 'INR',
        max_participants: 1,
        online_option: 'Voice Call',
        available_dates: [],
        available_times: ['11:30', '13:00', '15:00', '17:00', '19:00', '21:30'],
        locations: [],
        active: 1,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Real Meet',
        slug: 'real-meet',
        description: 'Exclusive in-person VIP consultation and personal meeting.',
        image: 'assets/Images/IMG_0483-1.jpg',
        booking_mode: 'appointment',
        duration_minutes: 60,
        currency: 'INR',
        max_participants: 1,
        online_option: 'In-Person',
        available_dates: [],
        available_times: ['14:00', '16:00', '18:00', '19:30'],
        locations: ['Delhi NCR (VIP Venue)', 'Mumbai (Luxury Hotel)', 'Bangalore', 'Goa', 'Client Designated Location'],
        active: 1,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Live',
        slug: 'live',
        description: 'Live interactive streaming session with Simran Arrora.',
        image: 'assets/Images/IMG_0491.jpg',
        booking_mode: 'live',
        duration_minutes: 45,
        currency: 'INR',
        max_participants: null,
        online_option: 'Live Stream',
        available_dates: [],
        available_times: [],
        locations: [],
        active: 1,
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Party Book',
        slug: 'party-book',
        description: 'VIP creator appearance, private celebration or club event booking.',
        image: 'assets/Images/IMG_0494.jpg',
        booking_mode: 'appointment',
        duration_minutes: 120,
        currency: 'INR',
        max_participants: 50,
        online_option: 'Event Appearance',
        available_dates: [],
        available_times: ['18:00', '20:00', '21:30'],
        locations: ['Delhi NCR', 'Mumbai', 'Goa', 'Private Event Venue'],
        active: 1,
        sort_order: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    price_options: [
      { id: 1, category_id: 1, name: '5 Minutes', duration_minutes: 5, price: 499, currency: 'INR', active: 1, sort_order: 1 },
      { id: 2, category_id: 1, name: '10 Minutes', duration_minutes: 10, price: 999, currency: 'INR', active: 1, sort_order: 2 },
      { id: 3, category_id: 1, name: '15 Minutes', duration_minutes: 15, price: 1499, currency: 'INR', active: 1, sort_order: 3 },
      { id: 4, category_id: 2, name: '5 Minutes Audio', duration_minutes: 5, price: 299, currency: 'INR', active: 1, sort_order: 1 },
      { id: 5, category_id: 2, name: '10 Minutes Audio', duration_minutes: 10, price: 599, currency: 'INR', active: 1, sort_order: 2 },
      { id: 6, category_id: 2, name: '15 Minutes Audio', duration_minutes: 15, price: 899, currency: 'INR', active: 1, sort_order: 3 },
      { id: 7, category_id: 3, name: '60 Minutes In-Person Session', duration_minutes: 60, price: 9999, currency: 'INR', active: 1, sort_order: 1 },
      { id: 8, category_id: 5, name: 'Private Event (120 Mins)', duration_minutes: 120, price: 24999, currency: 'INR', active: 1, sort_order: 1 }
    ],
    platforms: [
      { id: 1, category_id: 1, name: 'Instagram', url: 'https://instagram.com/simranarrora', icon: 'instagram', description: 'Instagram Video Call', active: 1, sort_order: 1 },
      { id: 2, category_id: 1, name: 'Official App', url: 'https://simranarrora.com/app', icon: 'app', description: 'Private App Session', active: 1, sort_order: 2 },
      { id: 3, category_id: 1, name: 'WhatsApp', url: 'https://wa.me/919876543210', icon: 'whatsapp', description: 'Encrypted WhatsApp Video Call', active: 1, sort_order: 3 },
      { id: 4, category_id: 1, name: 'Google Meet', url: '', icon: 'meet', description: 'HD Google Meet Video Room', active: 1, sort_order: 4 },
      { id: 5, category_id: 2, name: 'Instagram', url: 'https://instagram.com/simranarrora', icon: 'instagram', description: 'Instagram Voice Call', active: 1, sort_order: 1 },
      { id: 6, category_id: 2, name: 'Official App', url: 'https://simranarrora.com/app', icon: 'app', description: 'Official App Audio Room', active: 1, sort_order: 2 },
      { id: 7, category_id: 2, name: 'WhatsApp', url: 'https://wa.me/919876543210', icon: 'whatsapp', description: 'WhatsApp Audio Call', active: 1, sort_order: 3 }
    ],
    services: [
      {
        id: 1,
        name: 'Video Call',
        description: 'Private 1-on-1 video call and personal consultation session.',
        appointment_type: 'Video Call',
        duration_minutes: 15,
        price: 1499,
        currency: 'INR',
        image: 'assets/Images/IMG_0474.jpg',
        active: 1,
        category_id: 1,
        sort_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Audio Call',
        description: 'Direct 1-on-1 audio call session for conversations and Q&A.',
        appointment_type: 'Audio Call',
        duration_minutes: 15,
        price: 899,
        currency: 'INR',
        image: 'assets/Images/IMG_0476.jpg',
        active: 1,
        category_id: 2,
        sort_order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Real Meet',
        description: 'Exclusive in-person VIP consultation and personal meeting.',
        appointment_type: 'In-Person',
        duration_minutes: 60,
        price: 9999,
        currency: 'INR',
        image: 'assets/Images/IMG_0483-1.jpg',
        active: 1,
        category_id: 3,
        sort_order: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Party Book',
        description: 'VIP creator appearance, private celebration or club event booking.',
        appointment_type: 'Event Appearance',
        duration_minutes: 120,
        price: 24999,
        currency: 'INR',
        image: 'assets/Images/IMG_0494.jpg',
        active: 1,
        category_id: 5,
        sort_order: 4,
        created_at: new Date().toISOString()
      }
    ],
    social_links: [
      { id: 1, name: 'Instagram', url: 'https://instagram.com/simranarrora', icon: 'instagram', active: 1, sort_order: 1 },
      { id: 2, name: 'X (Twitter)', url: 'https://x.com/simranarrora', icon: 'x', active: 1, sort_order: 2 },
      { id: 3, name: 'Telegram', url: 'https://t.me/simranarrora', icon: 'telegram', active: 1, sort_order: 3 },
      { id: 4, name: 'Reddit', url: 'https://reddit.com/r/simranarrora', icon: 'reddit', active: 1, sort_order: 4 },
      { id: 5, name: 'YouTube', url: 'https://youtube.com/@simranarrora', icon: 'youtube', active: 1, sort_order: 5 }
    ],
    video_platforms: [
      {
        id: 1,
        name: 'YouTube Channel',
        url: 'https://youtube.com/@simranarrora',
        logo: '',
        description: 'Watch all new vlogs, teasers, behind the scenes, and creator lifestyle highlights.',
        button_label: 'Watch on YouTube',
        enabled: 1,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    gallery_items: [
      { id: 1, title: 'Exclusive Portfolio', description: 'High fashion editorial look', image_path: 'assets/Images/IMG_0474.jpg', category: 'Portfolio', enabled: 1, display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, title: 'Behind The Scenes', description: 'Studio set candid moment', image_path: 'assets/Images/IMG_0476.jpg', category: 'BTS', enabled: 1, display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 3, title: 'Studio Session', description: 'Classic dramatic lighting', image_path: 'assets/Images/IMG_0483-1.jpg', category: 'Studio', enabled: 1, display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 4, title: 'Urban Moments', description: 'City rooftop sunset', image_path: 'assets/Images/IMG_0491.jpg', category: 'Moments', enabled: 1, display_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 5, title: 'Golden Hour', description: 'Natural ambient glow', image_path: 'assets/Images/IMG_0494.jpg', category: 'Golden Hour', enabled: 1, display_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    bookings: [],
    payments: [],
    live_settings: {
      id: 1,
      title: 'VIP Live Broadcast',
      description: 'Exclusive live interactive stream with Simran Arrora.',
      live_url: 'https://youtube.com/@simranarrora',
      thumbnail_path: 'assets/Images/IMG_0491.jpg',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      enabled: 0,
      updated_at: new Date().toISOString()
    },
    payment_settings: {
      id: 1,
      upi_id: 'simranarrora@upi',
      instructions: 'Click PAY NOW to pay via Razorpay (UPI, Credit/Debit Cards, NetBanking, Wallets). After payment completion, enter your Razorpay payment ID or UPI transaction reference below for manual admin verification.',
      payment_link: 'https://razorpay.me/@simranarrora',
      qr_path: '',
      enabled: 1,
      updated_at: new Date().toISOString()
    },
    legal_pages: [
      {
        slug: 'terms',
        title: 'Terms and Conditions',
        content: 'Welcome to Simran Arrora official creator platform. All appointments, consultations, and digital content bookings are subject to personal conduct rules, strict privacy guidelines, and mutual agreement. We reserve the right to refuse or cancel appointments for policy violations.',
        effective_date: '2026-09-12',
        published: 1,
        updated_at: new Date().toISOString()
      },
      {
        slug: 'privacy',
        title: 'Privacy Policy',
        content: 'We respect your confidentiality and personal details. Contact details and consultation requests are stored securely and never shared with third parties. Authentication is secured through Firebase.',
        effective_date: '2026-09-12',
        published: 1,
        updated_at: new Date().toISOString()
      },
      {
        slug: 'shipping',
        title: 'Shipping and Delivery Policy',
        content: 'All services provided are digital consultations, video appointments, and in-person creator sessions. Meeting links and confirmations are delivered digitally via your account dashboard, SMS, and email upon administrative approval.',
        effective_date: '2026-09-12',
        published: 1,
        updated_at: new Date().toISOString()
      },
      {
        slug: 'cancellation-refund',
        title: 'Cancellation and Refund Policy',
        content: 'Customers can request cancellation through their dashboard while a booking is pending review. Refunds are processed according to the verified payment method and administrative review within 5-7 business days.',
        effective_date: '2026-09-12',
        published: 1,
        updated_at: new Date().toISOString()
      },
      {
        slug: 'contact',
        title: 'Contact Us',
        content: 'For collaboration inquiries, brand partnerships, or booking assistance, reach out via the official contact form or email admin@simranarrora.com.',
        effective_date: '2026-09-12',
        published: 1,
        updated_at: new Date().toISOString()
      }
    ],
    notifications: [],
    contact_messages: []
  };
}

class DataStore {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getDefaultData();
        this.save();
      }
    } catch (e) {
      console.warn('[DataStore] Load error, using default:', e.message);
      this.data = getDefaultData();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('[DataStore] Save error:', e.message);
    }
  }

  // Next auto-incrementing ID for any table
  nextId(table) {
    if (!Array.isArray(this.data[table])) this.data[table] = [];
    return this.data[table].reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }

  ensureAdmin(email, name = 'Simran Arrora', password = 'Admin@123456') {
    const cleanEmail = String(email || '').trim().toLowerCase();
    let adminUser = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!adminUser) {
      const hash = bcrypt.hashSync(password, 10);
      const id = this.nextId('users');
      adminUser = {
        id,
        name,
        email: cleanEmail,
        phone: '',
        password_hash: hash,
        role: 'admin',
        created_at: new Date().toISOString()
      };
      this.data.users.push(adminUser);
      this.save();
      console.log(`[DataStore] Seeded admin user: ${cleanEmail}`);
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      this.save();
    }
    return adminUser;
  }
}

const store = new DataStore();

// Compatibility adapter replicating the better-sqlite3 API (prepare, run, get, all)
// so all existing endpoints run without native C++ binary dependencies.
const db = {
  prepare(query) {
    const q = query.trim().replace(/\s+/g, ' ');

    return {
      get(...args) {
        return executeGet(q, args, store);
      },
      all(...args) {
        return executeAll(q, args, store);
      },
      run(...args) {
        return executeRun(q, args, store);
      }
    };
  },
  transaction(fn) {
    return (...args) => {
      const res = fn(...args);
      store.save();
      return res;
    };
  }
};

function executeGet(q, args, s) {
  const qUpper = q.toUpperCase();

  // COUNT queries
  if (qUpper.includes('COUNT(*)')) {
    if (qUpper.includes('FROM BOOKING_CATEGORIES')) {
      return { count: s.data.booking_categories.length, n: s.data.booking_categories.length };
    }
    if (qUpper.includes('FROM GALLERY_ITEMS')) {
      return { count: s.data.gallery_items.length, n: s.data.gallery_items.length };
    }
    if (qUpper.includes('FROM SOCIAL_LINKS')) {
      return { count: s.data.social_links.length, n: s.data.social_links.length };
    }
    if (qUpper.includes('FROM VIDEO_PLATFORMS')) {
      return { count: s.data.video_platforms.length, n: s.data.video_platforms.length };
    }
    if (qUpper.includes('FROM BOOKINGS')) {
      let bookings = s.data.bookings || [];
      if (qUpper.includes("STATUS='PENDING'")) return { n: bookings.filter(b => b.status === 'PENDING').length };
      if (qUpper.includes("STATUS='APPROVED'")) return { n: bookings.filter(b => b.status === 'APPROVED').length };
      if (qUpper.includes("STATUS='REJECTED'")) return { n: bookings.filter(b => b.status === 'REJECTED').length };
      if (qUpper.includes("PAYMENT_STATUS='PENDING_VERIFICATION'")) return { n: bookings.filter(b => b.payment_status === 'PENDING_VERIFICATION').length };
      if (qUpper.includes("APPOINTMENT_DATE=DATE('NOW','LOCALTIME')")) {
        const today = new Date().toISOString().slice(0, 10);
        return { n: bookings.filter(b => b.appointment_date === today).length };
      }
      if (qUpper.includes("APPOINTMENT_DATE>=DATE('NOW','LOCALTIME') AND STATUS='APPROVED'")) {
        const today = new Date().toISOString().slice(0, 10);
        return { n: bookings.filter(b => b.appointment_date >= today && b.status === 'APPROVED').length };
      }
      return { n: bookings.length };
    }
    return { count: 0, n: 0 };
  }

  // Users
  if (qUpper.startsWith('SELECT * FROM USERS WHERE EMAIL=?')) {
    const email = String(args[0] || '').toLowerCase();
    return s.data.users.find(u => u.email.toLowerCase() === email) || null;
  }
  if (qUpper.startsWith('SELECT ID FROM USERS WHERE EMAIL=?')) {
    const email = String(args[0] || '').toLowerCase();
    const u = s.data.users.find(u => u.email.toLowerCase() === email);
    return u ? { id: u.id } : null;
  }
  if (qUpper.startsWith('SELECT ID,NAME,EMAIL,PHONE,ROLE FROM USERS WHERE ID=?') || qUpper.startsWith('SELECT ID, NAME, EMAIL, PHONE, ROLE FROM USERS WHERE ID=?')) {
    const id = Number(args[0]);
    const u = s.data.users.find(u => u.id === id);
    if (!u) return null;
    return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role };
  }
  if (qUpper.startsWith('SELECT * FROM USERS WHERE ID=?')) {
    const id = Number(args[0]);
    return s.data.users.find(u => u.id === id) || null;
  }

  // Booking categories
  if (qUpper.startsWith('SELECT * FROM BOOKING_CATEGORIES WHERE ID=?')) {
    const id = Number(args[0]);
    return s.data.booking_categories.find(c => c.id === id) || null;
  }
  if (qUpper.startsWith('SELECT ID FROM BOOKING_CATEGORIES WHERE ID=?')) {
    const id = Number(args[0]);
    const c = s.data.booking_categories.find(c => c.id === id);
    return c ? { id: c.id } : null;
  }

  // Services
  if (qUpper.startsWith('SELECT * FROM SERVICES WHERE ID=?')) {
    const id = Number(args[0]);
    return s.data.services.find(srv => srv.id === id) || null;
  }
  if (qUpper.startsWith('SELECT * FROM SERVICES WHERE CATEGORY_ID=?')) {
    const catId = Number(args[0]);
    return s.data.services.find(srv => srv.category_id === catId && srv.active) || s.data.services.find(srv => srv.category_id === catId) || null;
  }

  // Price options
  if (qUpper.startsWith('SELECT * FROM PRICE_OPTIONS WHERE ID=? AND CATEGORY_ID=? AND ACTIVE=1')) {
    const id = Number(args[0]), catId = Number(args[1]);
    return s.data.price_options.find(p => p.id === id && p.category_id === catId && p.active) || null;
  }
  if (qUpper.startsWith('SELECT * FROM PRICE_OPTIONS WHERE CATEGORY_ID=? AND ACTIVE=1 ORDER BY SORT_ORDER,ID LIMIT 1')) {
    const catId = Number(args[0]);
    return s.data.price_options.find(p => p.category_id === catId && p.active) || null;
  }
  if (qUpper.startsWith('SELECT * FROM PRICE_OPTIONS WHERE ID=?')) {
    const id = Number(args[0]);
    return s.data.price_options.find(p => p.id === id) || null;
  }

  // Platforms
  if (qUpper.startsWith('SELECT * FROM PLATFORMS WHERE ID=? AND CATEGORY_ID=? AND ACTIVE=1')) {
    const id = Number(args[0]), catId = Number(args[1]);
    return s.data.platforms.find(p => p.id === id && p.category_id === catId && p.active) || null;
  }
  if (qUpper.startsWith('SELECT * FROM PLATFORMS WHERE ID=?')) {
    const id = Number(args[0]);
    return s.data.platforms.find(p => p.id === id) || null;
  }

  // Social links
  if (qUpper.startsWith('SELECT * FROM SOCIAL_LINKS WHERE ID=?')) {
    const id = Number(args[0]);
    return s.data.social_links.find(l => l.id === id) || null;
  }

  // Video platforms
  if (qUpper.startsWith('SELECT * FROM VIDEO_PLATFORMS WHERE ID=?')) {
    const id = Number(args[0]);
    return s.data.video_platforms.find(v => v.id === id) || null;
  }

  // Gallery items
  if (qUpper.startsWith('SELECT * FROM GALLERY_ITEMS WHERE ID=?')) {
    const id = Number(args[0]);
    return s.data.gallery_items.find(g => g.id === id) || null;
  }

  // Live settings
  if (qUpper.includes('FROM LIVE_SETTINGS WHERE ID=1')) {
    return s.data.live_settings;
  }

  // Payment settings
  if (qUpper.includes('FROM PAYMENT_SETTINGS WHERE ID=1')) {
    return s.data.payment_settings;
  }

  // Legal pages
  if (qUpper.startsWith('SELECT * FROM LEGAL_PAGES WHERE SLUG=? AND PUBLISHED=1')) {
    const slug = String(args[0]);
    return s.data.legal_pages.find(p => p.slug === slug && p.published) || null;
  }
  if (qUpper.startsWith('SELECT * FROM LEGAL_PAGES WHERE SLUG=?')) {
    const slug = String(args[0]);
    return s.data.legal_pages.find(p => p.slug === slug) || null;
  }

  // Bookings
  if (qUpper.startsWith('SELECT ID FROM BOOKINGS WHERE APPOINTMENT_DATE=? AND APPOINTMENT_TIME=? AND STATUS IN (\'PENDING\',\'APPROVED\') AND CATEGORY_ID=?')) {
    const [date, time, catId, excludeId] = args;
    const conflict = (s.data.bookings || []).find(b =>
      b.appointment_date === date &&
      b.appointment_time === time &&
      ['PENDING', 'APPROVED'].includes(b.status) &&
      b.category_id === Number(catId) &&
      (excludeId ? b.id !== Number(excludeId) : true)
    );
    return conflict ? { id: conflict.id } : null;
  }
  if (qUpper.startsWith('SELECT * FROM BOOKINGS WHERE ID=? AND USER_ID=?')) {
    const id = Number(args[0]), userId = Number(args[1]);
    return (s.data.bookings || []).find(b => b.id === id && b.user_id === userId) || null;
  }
  if (qUpper.startsWith('SELECT * FROM BOOKINGS WHERE ID=?')) {
    const id = Number(args[0]);
    return (s.data.bookings || []).find(b => b.id === id) || null;
  }
  if (qUpper.includes('FROM BOOKINGS B') && qUpper.includes('WHERE B.ID=?')) {
    const id = Number(args[0]), userId = args[1] ? Number(args[1]) : null;
    const b = (s.data.bookings || []).find(b => b.id === id && (userId ? b.user_id === userId : true));
    if (!b) return null;
    const cat = s.data.booking_categories.find(c => c.id === b.category_id);
    const price = s.data.price_options.find(p => p.id === b.price_option_id);
    const platform = s.data.platforms.find(pl => pl.id === b.platform_id);
    const srv = s.data.services.find(s => s.id === b.service_id);
    const user = s.data.users.find(u => u.id === b.user_id);
    return {
      ...b,
      category_name: cat?.name || '',
      category_slug: cat?.slug || '',
      price_option_name: price?.name || '',
      price: price?.price ?? srv?.price ?? 0,
      currency: price?.currency || b.currency || 'INR',
      platform_name: platform?.name || '',
      service_name: srv?.name || '',
      customer_email: user?.email || '',
      customer_name: b.customer_name || user?.name || ''
    };
  }
  if (qUpper.startsWith('SELECT BOOKING_CODE FROM BOOKINGS WHERE ID=?')) {
    const id = Number(args[0]);
    const b = (s.data.bookings || []).find(b => b.id === id);
    return b ? { booking_code: b.booking_code } : null;
  }
  if (qUpper.startsWith('SELECT ID FROM BOOKINGS WHERE SERVICE_ID=? LIMIT 1')) {
    const sId = Number(args[0]);
    const b = (s.data.bookings || []).find(b => b.service_id === sId);
    return b ? { id: b.id } : null;
  }
  if (qUpper.startsWith('SELECT ID FROM BOOKINGS WHERE CATEGORY_ID=? LIMIT 1')) {
    const cId = Number(args[0]);
    const b = (s.data.bookings || []).find(b => b.category_id === cId);
    return b ? { id: b.id } : null;
  }

  // Payments
  if (qUpper.startsWith('SELECT ID FROM PAYMENTS WHERE BOOKING_ID=?')) {
    const bId = Number(args[0]);
    const p = (s.data.payments || []).find(p => p.booking_id === bId);
    return p ? { id: p.id } : null;
  }
  if (qUpper.startsWith('SELECT * FROM PAYMENTS WHERE ID=?')) {
    const id = Number(args[0]);
    return (s.data.payments || []).find(p => p.id === id) || null;
  }

  return null;
}

function executeAll(q, args, s) {
  const qUpper = q.toUpperCase();

  // Services
  if (qUpper.startsWith('SELECT * FROM SERVICES WHERE ACTIVE=1 ORDER BY ID')) {
    return s.data.services.filter(srv => srv.active).sort((a, b) => a.id - b.id);
  }
  if (qUpper.startsWith('SELECT * FROM SERVICES ORDER BY ID')) {
    return [...s.data.services].sort((a, b) => a.id - b.id);
  }

  // Booking categories
  if (qUpper.startsWith('SELECT * FROM BOOKING_CATEGORIES WHERE ACTIVE=1 ORDER BY SORT_ORDER,ID')) {
    return s.data.booking_categories.filter(c => c.active).sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
  }
  if (qUpper.startsWith('SELECT * FROM BOOKING_CATEGORIES ORDER BY SORT_ORDER,ID')) {
    return [...s.data.booking_categories].sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
  }

  // Price options
  if (qUpper.startsWith('SELECT * FROM PRICE_OPTIONS WHERE CATEGORY_ID=? AND ACTIVE=1 ORDER BY SORT_ORDER,ID')) {
    const catId = Number(args[0]);
    return s.data.price_options.filter(p => p.category_id === catId && p.active).sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
  }
  if (qUpper.startsWith('SELECT * FROM PRICE_OPTIONS WHERE CATEGORY_ID=? ORDER BY SORT_ORDER,ID')) {
    const catId = Number(args[0]);
    return s.data.price_options.filter(p => p.category_id === catId).sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
  }
  if (qUpper.startsWith('SELECT * FROM PRICE_OPTIONS WHERE ACTIVE=1 ORDER BY CATEGORY_ID,SORT_ORDER,ID')) {
    return s.data.price_options.filter(p => p.active).sort((a, b) => (a.category_id - b.category_id) || (a.sort_order - b.sort_order) || (a.id - b.id));
  }
  if (qUpper.includes('FROM PRICE_OPTIONS P JOIN BOOKING_CATEGORIES C')) {
    return s.data.price_options.map(p => {
      const cat = s.data.booking_categories.find(c => c.id === p.category_id);
      return { ...p, category_name: cat?.name || '' };
    }).sort((a, b) => (a.category_id - b.category_id) || (a.sort_order - b.sort_order) || (a.id - b.id));
  }

  // Platforms
  if (qUpper.startsWith('SELECT * FROM PLATFORMS WHERE CATEGORY_ID=? AND ACTIVE=1 ORDER BY SORT_ORDER,ID')) {
    const catId = Number(args[0]);
    return s.data.platforms.filter(p => p.category_id === catId && p.active).sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
  }
  if (qUpper.startsWith('SELECT * FROM PLATFORMS WHERE CATEGORY_ID=? ORDER BY SORT_ORDER,ID')) {
    const catId = Number(args[0]);
    return s.data.platforms.filter(p => p.category_id === catId).sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
  }
  if (qUpper.startsWith('SELECT * FROM PLATFORMS WHERE ACTIVE=1 ORDER BY CATEGORY_ID,SORT_ORDER,ID')) {
    return s.data.platforms.filter(p => p.active).sort((a, b) => (a.category_id - b.category_id) || (a.sort_order - b.sort_order) || (a.id - b.id));
  }
  if (qUpper.includes('FROM PLATFORMS P JOIN BOOKING_CATEGORIES C')) {
    return s.data.platforms.map(p => {
      const cat = s.data.booking_categories.find(c => c.id === p.category_id);
      return { ...p, category_name: cat?.name || '' };
    }).sort((a, b) => (a.category_id - b.category_id) || (a.sort_order - b.sort_order) || (a.id - b.id));
  }

  // Social links
  if (qUpper.startsWith('SELECT * FROM SOCIAL_LINKS WHERE ACTIVE=1 ORDER BY SORT_ORDER,ID')) {
    return s.data.social_links.filter(l => l.active).sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
  }
  if (qUpper.startsWith('SELECT * FROM SOCIAL_LINKS ORDER BY SORT_ORDER,ID')) {
    return [...s.data.social_links].sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
  }

  // Video platforms
  if (qUpper.includes('FROM VIDEO_PLATFORMS WHERE ENABLED=1 AND URL!=\'\' ORDER BY DISPLAY_ORDER,ID')) {
    return s.data.video_platforms.filter(v => v.enabled && v.url).sort((a, b) => (a.display_order - b.display_order) || (a.id - b.id));
  }
  if (qUpper.includes('FROM VIDEO_PLATFORMS ORDER BY DISPLAY_ORDER,ID')) {
    return [...s.data.video_platforms].sort((a, b) => (a.display_order - b.display_order) || (a.id - b.id));
  }

  // Gallery
  if (qUpper.startsWith('SELECT * FROM GALLERY_ITEMS WHERE ENABLED=1 ORDER BY DISPLAY_ORDER,ID')) {
    return s.data.gallery_items.filter(g => g.enabled).sort((a, b) => (a.display_order - b.display_order) || (a.id - b.id));
  }
  if (qUpper.startsWith('SELECT * FROM GALLERY_ITEMS ORDER BY DISPLAY_ORDER,ID')) {
    return [...s.data.gallery_items].sort((a, b) => (a.display_order - b.display_order) || (a.id - b.id));
  }

  // Notifications
  if (qUpper.startsWith('SELECT * FROM NOTIFICATIONS WHERE USER_ID=? ORDER BY ID DESC LIMIT 50')) {
    const userId = Number(args[0]);
    return (s.data.notifications || []).filter(n => n.user_id === userId).sort((a, b) => b.id - a.id).slice(0, 50);
  }

  // Customer bookings
  if (qUpper.includes('FROM BOOKINGS B JOIN SERVICES S') && qUpper.includes('WHERE B.USER_ID=? ORDER BY B.ID DESC')) {
    const userId = Number(args[0]);
    return (s.data.bookings || [])
      .filter(b => b.user_id === userId)
      .sort((a, b) => b.id - a.id)
      .map(b => {
        const srv = s.data.services.find(s => s.id === b.service_id);
        const cat = s.data.booking_categories.find(c => c.id === b.category_id);
        const price = s.data.price_options.find(p => p.id === b.price_option_id);
        const platform = s.data.platforms.find(pl => pl.id === b.platform_id);
        return {
          ...b,
          service_name: srv?.name || '',
          price: price?.price ?? srv?.price ?? 0,
          currency: price?.currency || b.currency || srv?.currency || 'INR',
          duration_minutes: srv?.duration_minutes || 30,
          category_name: cat?.name || '',
          price_option_name: price?.name || '',
          platform_name: platform?.name || ''
        };
      });
  }

  // Admin bookings
  if (qUpper.includes('FROM BOOKINGS B') && qUpper.includes('ORDER BY B.ID DESC')) {
    return (s.data.bookings || [])
      .sort((a, b) => b.id - a.id)
      .map(b => {
        const user = s.data.users.find(u => u.id === b.user_id);
        const srv = s.data.services.find(s => s.id === b.service_id);
        const cat = s.data.booking_categories.find(c => c.id === b.category_id);
        const price = s.data.price_options.find(p => p.id === b.price_option_id);
        const platform = s.data.platforms.find(pl => pl.id === b.platform_id);
        return {
          ...b,
          customer_name: b.customer_name || user?.name || 'Customer',
          customer_email: user?.email || '',
          customer_phone: user?.phone || '',
          service_name: srv?.name || '',
          price: price?.price ?? srv?.price ?? 0,
          currency: price?.currency || b.currency || srv?.currency || 'INR',
          duration_minutes: srv?.duration_minutes || 30,
          category_name: cat?.name || '',
          price_option_name: price?.name || '',
          platform_name: platform?.name || ''
        };
      });
  }

  // Payments
  if (qUpper.includes('FROM PAYMENTS P JOIN BOOKINGS B') && qUpper.includes('ORDER BY P.ID DESC')) {
    return (s.data.payments || [])
      .sort((a, b) => b.id - a.id)
      .map(p => {
        const b = (s.data.bookings || []).find(b => b.id === p.booking_id);
        const u = s.data.users.find(u => u.id === p.user_id);
        return {
          ...p,
          booking_code: b?.booking_code || '',
          customer_name: u?.name || '',
          customer_email: u?.email || ''
        };
      });
  }

  // Admin customers
  if (qUpper.includes('FROM USERS U LEFT JOIN BOOKINGS B') && qUpper.includes('ROLE=\'CUSTOMER\'')) {
    return s.data.users
      .filter(u => u.role === 'customer')
      .sort((a, b) => b.id - a.id)
      .map(u => {
        const count = (s.data.bookings || []).filter(b => b.user_id === u.id).length;
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          created_at: u.created_at,
          bookings: count
        };
      });
  }

  // Messages
  if (qUpper.startsWith('SELECT * FROM CONTACT_MESSAGES ORDER BY ID DESC')) {
    return (s.data.contact_messages || []).sort((a, b) => b.id - a.id).slice(0, 100);
  }

  // Legal
  if (qUpper.startsWith('SELECT * FROM LEGAL_PAGES ORDER BY SLUG')) {
    return [...s.data.legal_pages].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  return [];
}

function executeRun(q, args, s) {
  const qUpper = q.toUpperCase();

  // Users insert
  if (qUpper.startsWith('INSERT INTO USERS (NAME,EMAIL,PASSWORD_HASH,ROLE)')) {
    const [name, email, password_hash, role] = args;
    const cleanEmail = String(email).trim().toLowerCase();
    if (s.data.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('UNIQUE constraint failed: users.email');
    }
    const id = s.nextId('users');
    const newUser = {
      id,
      name,
      email: cleanEmail,
      phone: '',
      password_hash,
      google_id: null,
      role: role || 'customer',
      created_at: new Date().toISOString()
    };
    s.data.users.push(newUser);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }

  // Users update
  if (qUpper.startsWith('UPDATE USERS SET NAME=?,PHONE=? WHERE ID=?')) {
    const [name, phone, id] = args;
    const u = s.data.users.find(u => u.id === Number(id));
    if (u) {
      u.name = name;
      u.phone = phone;
      s.save();
    }
    return { changes: u ? 1 : 0 };
  }
  if (qUpper.startsWith('UPDATE USERS SET ROLE=? WHERE ID=?')) {
    const [role, id] = args;
    const u = s.data.users.find(u => u.id === Number(id));
    if (u) {
      u.role = role;
      s.save();
    }
    return { changes: u ? 1 : 0 };
  }

  // Bookings insert
  if (qUpper.startsWith('INSERT INTO BOOKINGS')) {
    const [booking_code, user_id, service_id, category_id, price_option_id, platform_id, appointment_type, customer_name, customer_dob, customer_age, currency, platform_url, appointment_date, appointment_time, notes, location] = args;
    const id = s.nextId('bookings');
    const newBooking = {
      id,
      booking_code,
      user_id: Number(user_id),
      service_id: Number(service_id),
      category_id: category_id ? Number(category_id) : null,
      price_option_id: price_option_id ? Number(price_option_id) : null,
      platform_id: platform_id ? Number(platform_id) : null,
      appointment_type,
      customer_name,
      customer_dob,
      customer_age,
      currency: currency || 'INR',
      platform_url,
      appointment_date,
      appointment_time,
      notes,
      location,
      status: 'PENDING',
      payment_status: 'UNPAID',
      google_event_id: null,
      google_meet_url: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (!s.data.bookings) s.data.bookings = [];
    s.data.bookings.push(newBooking);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }

  // Bookings update
  if (qUpper.startsWith('UPDATE BOOKINGS SET STATUS=\'CANCELLED\', UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?') || qUpper.startsWith('UPDATE BOOKINGS SET STATUS=\'CANCELLED\',UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?')) {
    const id = Number(args[0]);
    const b = (s.data.bookings || []).find(b => b.id === id);
    if (b) {
      b.status = 'CANCELLED';
      b.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: b ? 1 : 0 };
  }
  if (qUpper.startsWith('UPDATE BOOKINGS SET PAYMENT_STATUS=\'PENDING_VERIFICATION\',UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?')) {
    const id = Number(args[0]);
    const b = (s.data.bookings || []).find(b => b.id === id);
    if (b) {
      b.payment_status = 'PENDING_VERIFICATION';
      b.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: b ? 1 : 0 };
  }
  if (qUpper.includes('SET STATUS=\'APPROVED\',LOCATION=?,GOOGLE_EVENT_ID=?,GOOGLE_MEET_URL=?')) {
    const [loc, eventId, meetUrl, id] = args;
    const b = (s.data.bookings || []).find(b => b.id === Number(id));
    if (b) {
      b.status = 'APPROVED';
      b.location = loc;
      b.google_event_id = eventId;
      b.google_meet_url = meetUrl;
      b.rejection_reason = null;
      b.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: b ? 1 : 0 };
  }
  if (qUpper.includes('SET STATUS=\'REJECTED\',REJECTION_REASON=?,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?')) {
    const [reason, id] = args;
    const b = (s.data.bookings || []).find(b => b.id === Number(id));
    if (b) {
      b.status = 'REJECTED';
      b.rejection_reason = reason;
      b.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: b ? 1 : 0 };
  }
  if (qUpper.includes('SET APPOINTMENT_DATE=?,APPOINTMENT_TIME=?,STATUS=\'PENDING\'')) {
    const [date, time, id] = args;
    const b = (s.data.bookings || []).find(b => b.id === Number(id));
    if (b) {
      b.appointment_date = date;
      b.appointment_time = time;
      b.status = 'PENDING';
      b.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: b ? 1 : 0 };
  }
  if (qUpper.includes('SET GOOGLE_MEET_URL=?, UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?') || qUpper.includes('SET GOOGLE_MEET_URL=?,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?')) {
    const [url, id] = args;
    const b = (s.data.bookings || []).find(b => b.id === Number(id));
    if (b) {
      b.google_meet_url = url;
      b.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: b ? 1 : 0 };
  }
  if (qUpper.includes('UPDATE BOOKINGS SET PAYMENT_STATUS=?,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?')) {
    const [status, id] = args;
    const b = (s.data.bookings || []).find(b => b.id === Number(id));
    if (b) {
      b.payment_status = status;
      b.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: b ? 1 : 0 };
  }

  // Payments insert
  if (qUpper.startsWith('INSERT INTO PAYMENTS')) {
    const [booking_id, user_id, amount, method, transaction_ref, note] = args;
    const id = s.nextId('payments');
    const newPayment = {
      id,
      booking_id: Number(booking_id),
      user_id: Number(user_id),
      amount: Number(amount),
      method,
      transaction_ref,
      note,
      status: 'PENDING_VERIFICATION',
      submitted_at: new Date().toISOString(),
      reviewed_at: null
    };
    if (!s.data.payments) s.data.payments = [];
    s.data.payments.push(newPayment);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE PAYMENTS SET STATUS=?,REVIEWED_AT=CURRENT_TIMESTAMP WHERE ID=?')) {
    const [status, id] = args;
    const p = (s.data.payments || []).find(p => p.id === Number(id));
    if (p) {
      p.status = status;
      p.reviewed_at = new Date().toISOString();
      s.save();
    }
    return { changes: p ? 1 : 0 };
  }

  // Booking categories
  if (qUpper.startsWith('INSERT INTO BOOKING_CATEGORIES')) {
    const [name, slug, description, image, booking_mode, duration_minutes, currency, max_participants, online_option, available_dates, available_times, locations, sort_order] = args;
    const id = s.nextId('booking_categories');
    const cat = {
      id,
      name,
      slug,
      description,
      image,
      booking_mode,
      duration_minutes: Number(duration_minutes) || 30,
      currency: currency || 'INR',
      max_participants: max_participants ? Number(max_participants) : null,
      online_option,
      available_dates: typeof available_dates === 'string' ? JSON.parse(available_dates || '[]') : (available_dates || []),
      available_times: typeof available_times === 'string' ? JSON.parse(available_times || '[]') : (available_times || []),
      locations: typeof locations === 'string' ? JSON.parse(locations || '[]') : (locations || []),
      active: 1,
      sort_order: Number(sort_order) || id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    s.data.booking_categories.push(cat);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE BOOKING_CATEGORIES SET NAME=?,SLUG=?,DESCRIPTION=?')) {
    const [name, slug, description, image, booking_mode, duration_minutes, currency, max_participants, online_option, available_dates, available_times, locations, active, sort_order, id] = args;
    const cat = s.data.booking_categories.find(c => c.id === Number(id));
    if (cat) {
      cat.name = name;
      cat.slug = slug;
      cat.description = description;
      cat.image = image;
      cat.booking_mode = booking_mode;
      cat.duration_minutes = Number(duration_minutes);
      cat.currency = currency;
      cat.max_participants = max_participants ? Number(max_participants) : null;
      cat.online_option = online_option;
      cat.available_dates = typeof available_dates === 'string' ? JSON.parse(available_dates || '[]') : (available_dates || []);
      cat.available_times = typeof available_times === 'string' ? JSON.parse(available_times || '[]') : (available_times || []);
      cat.locations = typeof locations === 'string' ? JSON.parse(locations || '[]') : (locations || []);
      cat.active = Number(active);
      cat.sort_order = Number(sort_order);
      cat.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: cat ? 1 : 0 };
  }
  if (qUpper.startsWith('UPDATE BOOKING_CATEGORIES SET SORT_ORDER=? WHERE ID=?')) {
    const [sort_order, id] = args;
    const cat = s.data.booking_categories.find(c => c.id === Number(id));
    if (cat) {
      cat.sort_order = Number(sort_order);
      s.save();
    }
    return { changes: cat ? 1 : 0 };
  }
  if (qUpper.startsWith('DELETE FROM BOOKING_CATEGORIES WHERE ID=?')) {
    const id = Number(args[0]);
    const idx = s.data.booking_categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      s.data.booking_categories.splice(idx, 1);
      s.save();
    }
    return { changes: idx !== -1 ? 1 : 0 };
  }

  // Price options
  if (qUpper.startsWith('INSERT INTO PRICE_OPTIONS')) {
    const [category_id, name, duration_minutes, price, currency, active, sort_order] = args;
    const id = s.nextId('price_options');
    const item = {
      id,
      category_id: Number(category_id),
      name,
      duration_minutes: Number(duration_minutes),
      price: Number(price),
      currency: currency || 'INR',
      active: Number(active),
      sort_order: Number(sort_order) || id
    };
    s.data.price_options.push(item);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE PRICE_OPTIONS SET CATEGORY_ID=?,NAME=?,DURATION_MINUTES=?,PRICE=?,CURRENCY=?,ACTIVE=?,SORT_ORDER=? WHERE ID=?')) {
    const [category_id, name, duration_minutes, price, currency, active, sort_order, id] = args;
    const item = s.data.price_options.find(p => p.id === Number(id));
    if (item) {
      item.category_id = Number(category_id);
      item.name = name;
      item.duration_minutes = Number(duration_minutes);
      item.price = Number(price);
      item.currency = currency;
      item.active = Number(active);
      item.sort_order = Number(sort_order);
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('UPDATE PRICE_OPTIONS SET SORT_ORDER=? WHERE ID=?')) {
    const [sort_order, id] = args;
    const item = s.data.price_options.find(p => p.id === Number(id));
    if (item) {
      item.sort_order = Number(sort_order);
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('DELETE FROM PRICE_OPTIONS WHERE ID=?')) {
    const id = Number(args[0]);
    const idx = s.data.price_options.findIndex(p => p.id === id);
    if (idx !== -1) {
      s.data.price_options.splice(idx, 1);
      s.save();
    }
    return { changes: idx !== -1 ? 1 : 0 };
  }

  // Platforms
  if (qUpper.startsWith('INSERT INTO PLATFORMS')) {
    const [category_id, name, url, icon, description, active, sort_order] = args;
    const id = s.nextId('platforms');
    const item = {
      id,
      category_id: Number(category_id),
      name,
      url,
      icon,
      description,
      active: Number(active),
      sort_order: Number(sort_order) || id
    };
    s.data.platforms.push(item);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE PLATFORMS SET CATEGORY_ID=?,NAME=?,URL=?,ICON=?,DESCRIPTION=?,ACTIVE=?,SORT_ORDER=? WHERE ID=?')) {
    const [category_id, name, url, icon, description, active, sort_order, id] = args;
    const item = s.data.platforms.find(p => p.id === Number(id));
    if (item) {
      item.category_id = Number(category_id);
      item.name = name;
      item.url = url;
      item.icon = icon;
      item.description = description;
      item.active = Number(active);
      item.sort_order = Number(sort_order);
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('UPDATE PLATFORMS SET SORT_ORDER=? WHERE ID=?')) {
    const [sort_order, id] = args;
    const item = s.data.platforms.find(p => p.id === Number(id));
    if (item) {
      item.sort_order = Number(sort_order);
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('DELETE FROM PLATFORMS WHERE ID=?')) {
    const id = Number(args[0]);
    const idx = s.data.platforms.findIndex(p => p.id === id);
    if (idx !== -1) {
      s.data.platforms.splice(idx, 1);
      s.save();
    }
    return { changes: idx !== -1 ? 1 : 0 };
  }

  // Social links
  if (qUpper.startsWith('INSERT INTO SOCIAL_LINKS')) {
    const [name, url, icon, active, sort_order] = args;
    const id = s.nextId('social_links');
    const item = { id, name, url, icon, active: Number(active), sort_order: Number(sort_order) || id };
    s.data.social_links.push(item);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE SOCIAL_LINKS SET NAME=?,URL=?,ICON=?,ACTIVE=?,SORT_ORDER=? WHERE ID=?')) {
    const [name, url, icon, active, sort_order, id] = args;
    const item = s.data.social_links.find(l => l.id === Number(id));
    if (item) {
      item.name = name;
      item.url = url;
      item.icon = icon;
      item.active = Number(active);
      item.sort_order = Number(sort_order);
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('DELETE FROM SOCIAL_LINKS WHERE ID=?')) {
    const id = Number(args[0]);
    const idx = s.data.social_links.findIndex(l => l.id === id);
    if (idx !== -1) {
      s.data.social_links.splice(idx, 1);
      s.save();
    }
    return { changes: idx !== -1 ? 1 : 0 };
  }

  // Video platforms
  if (qUpper.startsWith('INSERT INTO VIDEO_PLATFORMS')) {
    const [name, url, logo, description, button_label, enabled, display_order] = args;
    const id = s.nextId('video_platforms');
    const item = {
      id,
      name,
      url,
      logo,
      description,
      button_label,
      enabled: Number(enabled),
      display_order: Number(display_order) || id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    s.data.video_platforms.push(item);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE VIDEO_PLATFORMS SET NAME=?,URL=?,LOGO=?,DESCRIPTION=?,BUTTON_LABEL=?,ENABLED=?,DISPLAY_ORDER=?,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?')) {
    const [name, url, logo, description, button_label, enabled, display_order, id] = args;
    const item = s.data.video_platforms.find(v => v.id === Number(id));
    if (item) {
      item.name = name;
      item.url = url;
      item.logo = logo;
      item.description = description;
      item.button_label = button_label;
      item.enabled = Number(enabled);
      item.display_order = Number(display_order);
      item.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('UPDATE VIDEO_PLATFORMS SET DISPLAY_ORDER=? WHERE ID=?')) {
    const [display_order, id] = args;
    const item = s.data.video_platforms.find(v => v.id === Number(id));
    if (item) {
      item.display_order = Number(display_order);
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('DELETE FROM VIDEO_PLATFORMS WHERE ID=?')) {
    const id = Number(args[0]);
    const idx = s.data.video_platforms.findIndex(v => v.id === id);
    if (idx !== -1) {
      s.data.video_platforms.splice(idx, 1);
      s.save();
    }
    return { changes: idx !== -1 ? 1 : 0 };
  }

  // Gallery
  if (qUpper.startsWith('INSERT INTO GALLERY_ITEMS')) {
    const [title, description, image_path, category, enabled, display_order] = args;
    const id = s.nextId('gallery_items');
    const item = {
      id,
      title,
      description,
      image_path,
      category,
      enabled: Number(enabled),
      display_order: Number(display_order) || id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    s.data.gallery_items.push(item);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE GALLERY_ITEMS SET TITLE=?,DESCRIPTION=?,IMAGE_PATH=?,CATEGORY=?,ENABLED=?,DISPLAY_ORDER=?,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=?')) {
    const [title, description, image_path, category, enabled, display_order, id] = args;
    const item = s.data.gallery_items.find(g => g.id === Number(id));
    if (item) {
      item.title = title;
      item.description = description;
      item.image_path = image_path;
      item.category = category;
      item.enabled = Number(enabled);
      item.display_order = Number(display_order);
      item.updated_at = new Date().toISOString();
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('DELETE FROM GALLERY_ITEMS WHERE ID=?')) {
    const id = Number(args[0]);
    const idx = s.data.gallery_items.findIndex(g => g.id === id);
    if (idx !== -1) {
      s.data.gallery_items.splice(idx, 1);
      s.save();
    }
    return { changes: idx !== -1 ? 1 : 0 };
  }

  // Services
  if (qUpper.startsWith('INSERT INTO SERVICES')) {
    const [name, description, appointment_type, duration_minutes, price, image] = args;
    const id = s.nextId('services');
    const item = {
      id,
      name,
      description,
      appointment_type,
      duration_minutes: Number(duration_minutes),
      price: Number(price),
      currency: 'INR',
      image,
      active: 1,
      category_id: null,
      sort_order: id,
      created_at: new Date().toISOString()
    };
    s.data.services.push(item);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE SERVICES SET NAME=?,DESCRIPTION=?,APPOINTMENT_TYPE=?,DURATION_MINUTES=?,PRICE=?,CURRENCY=?,IMAGE=?,ACTIVE=?,SORT_ORDER=? WHERE CATEGORY_ID=?')) {
    const [name, description, appointment_type, duration_minutes, currency, image, active, sort_order, catId] = args;
    const item = s.data.services.find(srv => srv.category_id === Number(catId));
    if (item) {
      item.name = name;
      item.description = description;
      item.appointment_type = appointment_type;
      item.duration_minutes = Number(duration_minutes);
      item.currency = currency;
      item.image = image;
      item.active = Number(active);
      item.sort_order = Number(sort_order);
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('UPDATE SERVICES SET NAME=?,DESCRIPTION=?,APPOINTMENT_TYPE=?,DURATION_MINUTES=?,PRICE=?,IMAGE=?,ACTIVE=? WHERE ID=?')) {
    const [name, description, appointment_type, duration_minutes, price, image, active, id] = args;
    const item = s.data.services.find(srv => srv.id === Number(id));
    if (item) {
      item.name = name;
      item.description = description;
      item.appointment_type = appointment_type;
      item.duration_minutes = Number(duration_minutes);
      item.price = Number(price);
      item.image = image;
      item.active = Number(active);
      s.save();
    }
    return { changes: item ? 1 : 0 };
  }
  if (qUpper.startsWith('DELETE FROM SERVICES WHERE ID=?') || qUpper.startsWith('DELETE FROM SERVICES WHERE CATEGORY_ID=?')) {
    const id = Number(args[0]);
    const idx = s.data.services.findIndex(srv => srv.id === id || srv.category_id === id);
    if (idx !== -1) {
      s.data.services.splice(idx, 1);
      s.save();
    }
    return { changes: idx !== -1 ? 1 : 0 };
  }

  // Live settings
  if (qUpper.includes('UPDATE LIVE_SETTINGS SET TITLE=?,DESCRIPTION=?,LIVE_URL=?,THUMBNAIL_PATH=?,START_DATE=?,START_TIME=?,END_DATE=?,END_TIME=?,ENABLED=?,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=1')) {
    const [title, description, live_url, thumbnail_path, start_date, start_time, end_date, end_time, enabled] = args;
    s.data.live_settings = {
      ...s.data.live_settings,
      title,
      description,
      live_url,
      thumbnail_path,
      start_date,
      start_time,
      end_date,
      end_time,
      enabled: Number(enabled),
      updated_at: new Date().toISOString()
    };
    s.save();
    return { changes: 1 };
  }

  // Payment settings
  if (qUpper.includes('UPDATE PAYMENT_SETTINGS SET UPI_ID=?,INSTRUCTIONS=?,PAYMENT_LINK=?,ENABLED=?,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=1')) {
    const [upi_id, instructions, payment_link, enabled] = args;
    s.data.payment_settings = {
      ...s.data.payment_settings,
      upi_id,
      instructions,
      payment_link,
      enabled: Number(enabled),
      updated_at: new Date().toISOString()
    };
    s.save();
    return { changes: 1 };
  }
  if (qUpper.includes('UPDATE PAYMENT_SETTINGS SET QR_PATH=?,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=1')) {
    s.data.payment_settings.qr_path = args[0];
    s.data.payment_settings.updated_at = new Date().toISOString();
    s.save();
    return { changes: 1 };
  }
  if (qUpper.includes('UPDATE PAYMENT_SETTINGS SET QR_PATH=NULL,UPDATED_AT=CURRENT_TIMESTAMP WHERE ID=1')) {
    s.data.payment_settings.qr_path = null;
    s.data.payment_settings.updated_at = new Date().toISOString();
    s.save();
    return { changes: 1 };
  }

  // Legal pages
  if (qUpper.startsWith('INSERT INTO LEGAL_PAGES')) {
    const [slug, title, content, effective_date, published] = args;
    let page = s.data.legal_pages.find(p => p.slug === slug);
    if (page) {
      page.title = title;
      page.content = content;
      page.effective_date = effective_date;
      page.published = Number(published);
      page.updated_at = new Date().toISOString();
    } else {
      page = { slug, title, content, effective_date, published: Number(published), updated_at: new Date().toISOString() };
      s.data.legal_pages.push(page);
    }
    s.save();
    return { changes: 1 };
  }

  // Contact messages
  if (qUpper.startsWith('INSERT INTO CONTACT_MESSAGES')) {
    const [name, email, phone, message] = args;
    const id = s.nextId('contact_messages');
    const msg = { id, name, email, phone, message, read_at: null, archived_at: null, created_at: new Date().toISOString() };
    if (!s.data.contact_messages) s.data.contact_messages = [];
    s.data.contact_messages.push(msg);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.includes('UPDATE CONTACT_MESSAGES SET READ_AT=?') || qUpper.includes('UPDATE CONTACT_MESSAGES SET ARCHIVED_AT=?')) {
    const [val, id] = args;
    const msg = (s.data.contact_messages || []).find(m => m.id === Number(id));
    if (msg) {
      if (qUpper.includes('READ_AT=?')) msg.read_at = val;
      if (qUpper.includes('ARCHIVED_AT=?')) msg.archived_at = val;
      s.save();
    }
    return { changes: msg ? 1 : 0 };
  }
  if (qUpper.startsWith('DELETE FROM CONTACT_MESSAGES WHERE ID=?')) {
    const id = Number(args[0]);
    const idx = (s.data.contact_messages || []).findIndex(m => m.id === id);
    if (idx !== -1) {
      s.data.contact_messages.splice(idx, 1);
      s.save();
    }
    return { changes: idx !== -1 ? 1 : 0 };
  }

  // Notifications
  if (qUpper.startsWith('INSERT INTO NOTIFICATIONS')) {
    const [user_id, title, message] = args;
    const id = s.nextId('notifications');
    const n = { id, user_id: Number(user_id), title, message, read_at: null, created_at: new Date().toISOString() };
    if (!s.data.notifications) s.data.notifications = [];
    s.data.notifications.push(n);
    s.save();
    return { lastInsertRowid: id, changes: 1 };
  }
  if (qUpper.startsWith('UPDATE NOTIFICATIONS SET READ_AT=CURRENT_TIMESTAMP WHERE ID=? AND USER_ID=?')) {
    const [id, userId] = args;
    const n = (s.data.notifications || []).find(n => n.id === Number(id) && n.user_id === Number(userId));
    if (n) {
      n.read_at = new Date().toISOString();
      s.save();
    }
    return { changes: n ? 1 : 0 };
  }

  return { changes: 0 };
}

function initDb() {
  store.ensureAdmin(process.env.ADMIN_EMAIL || 'simranarrora.p@gmail.com');
  store.ensureAdmin('admin@simranarrora.com');
  store.ensureAdmin('ajayr.king786@gmail.com');
  console.log('[DataStore] Pure JavaScript data store ready (No native SQLite dependency).');
}

function ensureAdminFromEnv() {
  initDb();
}

module.exports = {
  store,
  db,
  initDb,
  ensureAdminFromEnv
};
