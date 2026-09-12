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
}

function ensureAdminFromEnv() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password) return;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (!existing) {
    const hash = bcrypt.hashSync(password, 12);
    db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`)
      .run(name, email.toLowerCase(), hash);
    console.log(`[setup] Admin created for ${email}. Change ADMIN_PASSWORD before production use.`);
  }
}

module.exports = { db, initDb, ensureAdminFromEnv };
