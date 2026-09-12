const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'app.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      appointment_type TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      price REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      image TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      category_id INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS booking_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      image TEXT,
      booking_mode TEXT NOT NULL DEFAULT 'appointment',
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      currency TEXT NOT NULL DEFAULT 'INR',
      max_participants INTEGER,
      online_option TEXT,
      available_dates TEXT NOT NULL DEFAULT '[]',
      available_times TEXT NOT NULL DEFAULT '[]',
      locations TEXT NOT NULL DEFAULT '[]',
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(category_id) REFERENCES booking_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      url TEXT,
      icon TEXT,
      description TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(category_id) REFERENCES booking_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS video_platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '',
      logo TEXT,
      description TEXT NOT NULL DEFAULT '',
      button_label TEXT NOT NULL DEFAULT 'Visit Platform',
      enabled INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_code TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      category_id INTEGER,
      price_option_id INTEGER,
      platform_id INTEGER,
      appointment_type TEXT NOT NULL,
      customer_name TEXT,
      customer_dob TEXT,
      customer_age INTEGER,
      currency TEXT NOT NULL DEFAULT 'INR',
      platform_url TEXT,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      notes TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
      payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK(payment_status IN ('UNPAID','PENDING_VERIFICATION','APPROVED','REJECTED')),
      google_event_id TEXT,
      google_meet_url TEXT,
      rejection_reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(service_id) REFERENCES services(id),
      FOREIGN KEY(category_id) REFERENCES booking_categories(id),
      FOREIGN KEY(price_option_id) REFERENCES price_options(id),
      FOREIGN KEY(platform_id) REFERENCES platforms(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      method TEXT,
      transaction_ref TEXT,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK(status IN ('PENDING_VERIFICATION','APPROVED','REJECTED')),
      submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT,
      FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS live_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      title TEXT NOT NULL DEFAULT 'Live Session',
      description TEXT NOT NULL DEFAULT 'Live is currently unavailable.',
      live_url TEXT,
      thumbnail_path TEXT,
      start_date TEXT,
      start_time TEXT,
      end_date TEXT,
      end_time TEXT,
      enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      upi_id TEXT,
      instructions TEXT,
      payment_link TEXT,
      qr_path TEXT,
      enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS legal_pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      effective_date TEXT,
      published INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      read_at TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_path TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const columns = (table) => new Set(db.prepare(`PRAGMA table_info(${table})`).all().map(column => column.name));
  const addColumn = (table, name, definition) => { if (!columns(table).has(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`); };
  addColumn('services', 'currency', "TEXT NOT NULL DEFAULT 'INR'");
  addColumn('services', 'category_id', 'INTEGER');
  addColumn('services', 'sort_order', 'INTEGER NOT NULL DEFAULT 0');
  addColumn('bookings', 'category_id', 'INTEGER');
  addColumn('bookings', 'price_option_id', 'INTEGER');
  addColumn('bookings', 'platform_id', 'INTEGER');
  addColumn('bookings', 'customer_name', 'TEXT');
  addColumn('bookings', 'customer_dob', 'TEXT');
  addColumn('bookings', 'customer_age', 'INTEGER');
  addColumn('bookings', 'currency', "TEXT NOT NULL DEFAULT 'INR'");
  addColumn('bookings', 'platform_url', 'TEXT');
  addColumn('live_settings', 'thumbnail_path', 'TEXT');
  addColumn('live_settings', 'start_date', 'TEXT');
  addColumn('live_settings', 'start_time', 'TEXT');
  addColumn('live_settings', 'end_date', 'TEXT');
  addColumn('live_settings', 'end_time', 'TEXT');
  addColumn('payment_settings', 'payment_link', 'TEXT');
  addColumn('contact_messages', 'phone', 'TEXT');
  addColumn('contact_messages', 'read_at', 'TEXT');
  addColumn('contact_messages', 'archived_at', 'TEXT');

  db.prepare(`INSERT OR IGNORE INTO live_settings (id) VALUES (1)`).run();
  db.prepare(`INSERT OR IGNORE INTO payment_settings (id) VALUES (1)`).run();

  db.prepare(`UPDATE bookings SET category_id=(SELECT category_id FROM services WHERE services.id=bookings.service_id) WHERE category_id IS NULL`).run();
  db.prepare(`UPDATE bookings SET currency='INR' WHERE currency IS NULL OR currency=''`).run();

  seedInitialData();
}

function seedInitialData() {
  try {
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM booking_categories').get().count;
    if (categoryCount === 0) {
      const cat1 = db.prepare(`INSERT INTO booking_categories (name, slug, description, booking_mode, duration_minutes, currency, active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, 1, 1)`).run(
          'Video Consultation',
          'video-consultation',
          'One-on-one virtual consultation and personalized creator discussion.',
          'appointment',
          30,
          'INR'
        );
      const catId1 = cat1.lastInsertRowid;

      db.prepare(`INSERT INTO price_options (category_id, name, duration_minutes, price, currency, active, sort_order)
        VALUES (?, ?, ?, ?, ?, 1, 1)`).run(catId1, 'Standard 30-Min Session', 30, 2499, 'INR');
      db.prepare(`INSERT INTO price_options (category_id, name, duration_minutes, price, currency, active, sort_order)
        VALUES (?, ?, ?, ?, ?, 1, 2)`).run(catId1, 'Extended 60-Min Session', 60, 4499, 'INR');

      db.prepare(`INSERT INTO platforms (category_id, name, description, active, sort_order)
        VALUES (?, ?, ?, 1, 1)`).run(catId1, 'Google Meet', 'HD Video Call with screen sharing');
      db.prepare(`INSERT INTO platforms (category_id, name, description, active, sort_order)
        VALUES (?, ?, ?, 1, 2)`).run(catId1, 'Zoom', 'Interactive video session');

      const cat2 = db.prepare(`INSERT INTO booking_categories (name, slug, description, booking_mode, duration_minutes, currency, active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, 1, 2)`).run(
          'Real Meet & Consultation',
          'real-meet',
          'Exclusive in-person consultation session in selected cities.',
          'appointment',
          60,
          'INR'
        );
      const catId2 = cat2.lastInsertRowid;

      db.prepare(`INSERT INTO price_options (category_id, name, duration_minutes, price, currency, active, sort_order)
        VALUES (?, ?, ?, ?, ?, 1, 1)`).run(catId2, 'VIP In-Person Consultation', 60, 9999, 'INR');

      db.prepare(`INSERT INTO services (name, description, appointment_type, duration_minutes, price, currency, image, active, category_id, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 1)`).run(
          '1-on-1 Video Consultation',
          'Direct personal video consultation covering creative collaborations and Q&A.',
          'Video Call',
          30,
          2499,
          'INR',
          'assets/Images/IMG_0474.jpg',
          catId1
        );

      db.prepare(`INSERT INTO services (name, description, appointment_type, duration_minutes, price, currency, image, active, category_id, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 2)`).run(
          'VIP In-Person Consultation',
          'Exclusive one-on-one session for business inquiries, brand collaborations & consulting.',
          'In-Person',
          60,
          9999,
          'INR',
          'assets/Images/IMG_0483-1.jpg',
          catId2
        );
    }

    const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery_items').get().count;
    if (galleryCount === 0) {
      const images = [
        { title: 'Exclusive Portfolio', path: 'assets/Images/IMG_0474.jpg', cat: 'Highlights' },
        { title: 'Behind The Scenes', path: 'assets/Images/IMG_0476.jpg', cat: 'Exclusive' },
        { title: 'Studio Session', path: 'assets/Images/IMG_0483-1.jpg', cat: 'Highlights' },
        { title: 'Urban Moments', path: 'assets/Images/IMG_0491.jpg', cat: 'Moments' },
        { title: 'Golden Hour', path: 'assets/Images/IMG_0494.jpg', cat: 'Moments' }
      ];
      images.forEach((img, idx) => {
        db.prepare(`INSERT INTO gallery_items (title, description, image_path, category, enabled, display_order)
          VALUES (?, '', ?, ?, 1, ?)`).run(img.title, img.path, img.cat, idx + 1);
      });
    }

    const socialCount = db.prepare('SELECT COUNT(*) as count FROM social_links').get().count;
    if (socialCount === 0) {
      db.prepare(`INSERT INTO social_links (name, url, icon, active, sort_order) VALUES (?, ?, ?, 1, 1)`).run('Instagram', 'https://instagram.com', 'instagram');
      db.prepare(`INSERT INTO social_links (name, url, icon, active, sort_order) VALUES (?, ?, ?, 1, 2)`).run('X (Twitter)', 'https://x.com', 'x');
      db.prepare(`INSERT INTO social_links (name, url, icon, active, sort_order) VALUES (?, ?, ?, 1, 3)`).run('Telegram', 'https://telegram.org', 'telegram');
      db.prepare(`INSERT INTO social_links (name, url, icon, active, sort_order) VALUES (?, ?, ?, 1, 4)`).run('YouTube', 'https://youtube.com', 'youtube');
    }

    const videoCount = db.prepare('SELECT COUNT(*) as count FROM video_platforms').get().count;
    if (videoCount === 0) {
      db.prepare(`INSERT INTO video_platforms (name, url, description, button_label, enabled, display_order)
        VALUES (?, ?, ?, ?, 1, 1)`).run('YouTube Channel', 'https://youtube.com', 'Latest vlogs, teasers and video series.', 'Watch on YouTube');
    }
  } catch (e) {
    console.warn('[db] Seed initial data notice:', e.message);
  }
}

function ensureAdminFromEnv() {
  const name = process.env.ADMIN_NAME || 'Admin';
  const email = (process.env.ADMIN_EMAIL || 'admin@simranarrora.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!existing) {
    const hash = bcrypt.hashSync(password, 12);
    db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`)
      .run(name, email, hash);
    console.log(`[setup] Admin initialized for ${email}`);
  }
}

module.exports = { db, initDb, ensureAdminFromEnv };
