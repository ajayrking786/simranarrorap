-- =============================================================================
-- Migration 001: Initial Schema
-- Project: Simran Arrora Creator Web App
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate booking ID: SA-YYYY-XXXXXX
CREATE OR REPLACE FUNCTION generate_booking_id()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_year text;
  v_rand text;
BEGIN
  v_year := to_char(now(), 'YYYY');
  v_rand := upper(
    translate(
      encode(gen_random_bytes(6), 'base64'),
      'abcdefghijklmnopqrstuvwxyz+/=0',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0000'
    )
  );
  v_rand := left(regexp_replace(v_rand, '[^A-Z0-9]', '', 'g') || 'AAAAAA', 6);
  RETURN 'SA-' || v_year || '-' || v_rand;
END;
$$;

-- users
CREATE TABLE IF NOT EXISTS users (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL UNIQUE,
  full_name  text,
  phone      text,
  role       text        NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'CUSTOMER')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- services
CREATE TABLE IF NOT EXISTS services (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  description      text,
  image_url        text,
  duration_minutes int,
  enabled          boolean     NOT NULL DEFAULT true,
  display_order    int         NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- price_options
CREATE TABLE IF NOT EXISTS price_options (
  id          uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  uuid           NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name        text           NOT NULL,
  description text,
  amount      numeric(10,2)  NOT NULL CHECK (amount >= 0),
  currency    text           NOT NULL DEFAULT 'INR',
  enabled     boolean        NOT NULL DEFAULT true,
  created_at  timestamptz    NOT NULL DEFAULT now(),
  updated_at  timestamptz    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_price_options_service_id ON price_options(service_id);
CREATE TRIGGER trg_price_options_updated_at BEFORE UPDATE ON price_options FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- bookings
CREATE TABLE IF NOT EXISTS bookings (
  id                       uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id               text           NOT NULL UNIQUE DEFAULT generate_booking_id(),
  customer_id              uuid           REFERENCES users(id) ON DELETE SET NULL,
  service_id               uuid           REFERENCES services(id) ON DELETE SET NULL,
  price_option_id          uuid           REFERENCES price_options(id) ON DELETE SET NULL,
  customer_name            text           NOT NULL,
  email                    text           NOT NULL,
  phone                    text           NOT NULL,
  appointment_date         date           NOT NULL,
  appointment_time         time           NOT NULL,
  location                 text,
  notes                    text,
  amount                   numeric(10,2)  NOT NULL CHECK (amount >= 0),
  currency                 text           NOT NULL DEFAULT 'INR',
  payment_status           text           NOT NULL DEFAULT 'PENDING'
                           CHECK (payment_status IN ('PENDING','VERIFICATION','APPROVED','REJECTED','REFUNDED')),
  booking_status           text           NOT NULL DEFAULT 'PENDING'
                           CHECK (booking_status IN ('PENDING','APPROVED','REJECTED','RESCHEDULED','CANCELLED','COMPLETED')),
  google_sheet_sync_status text           NOT NULL DEFAULT 'PENDING'
                           CHECK (google_sheet_sync_status IN ('PENDING','SYNCED','FAILED')),
  created_at               timestamptz    NOT NULL DEFAULT now(),
  updated_at               timestamptz    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id      ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id       ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status   ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id                   uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id           uuid           NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_order_id    text,
  razorpay_payment_id  text,
  razorpay_signature   text,
  amount               numeric(10,2)  NOT NULL CHECK (amount >= 0),
  currency             text           NOT NULL DEFAULT 'INR',
  status               text           NOT NULL DEFAULT 'PENDING',
  failure_reason       text,
  created_at           timestamptz    NOT NULL DEFAULT now(),
  updated_at           timestamptz    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- gallery
CREATE TABLE IF NOT EXISTS gallery (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  description   text,
  image_url     text        NOT NULL,
  category      text,
  alt_text      text,
  published     boolean     NOT NULL DEFAULT false,
  display_order int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gallery_published ON gallery(published);
CREATE TRIGGER trg_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- videos
CREATE TABLE IF NOT EXISTS videos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  description   text,
  thumbnail_url text,
  video_url     text,
  platform      text,
  button_label  text        NOT NULL DEFAULT 'Watch Now',
  published     boolean     NOT NULL DEFAULT false,
  display_order int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(published);
CREATE TRIGGER trg_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- social_links
CREATE TABLE IF NOT EXISTS social_links (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  url           text,
  icon          text,
  platform      text,
  enabled       boolean     NOT NULL DEFAULT true,
  display_order int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_social_links_updated_at BEFORE UPDATE ON social_links FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- live_settings
CREATE TABLE IF NOT EXISTS live_settings (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text,
  description    text,
  public_url     text,
  thumbnail_url  text,
  start_datetime timestamptz,
  end_datetime   timestamptz,
  enabled        boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_live_settings_updated_at BEFORE UPDATE ON live_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      text        NOT NULL,
  message    text        NOT NULL,
  type       text        NOT NULL DEFAULT 'INFO',
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);

-- contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  phone      text,
  subject    text,
  message    text        NOT NULL,
  archived   boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- legal_pages
CREATE TABLE IF NOT EXISTS legal_pages (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text        NOT NULL UNIQUE,
  title          text        NOT NULL,
  content        text,
  effective_date date,
  published      boolean     NOT NULL DEFAULT true,
  last_updated   timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_legal_pages_updated_at BEFORE UPDATE ON legal_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- payment_settings
CREATE TABLE IF NOT EXISTS payment_settings (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider   text        NOT NULL DEFAULT 'razorpay',
  enabled    boolean     NOT NULL DEFAULT false,
  test_mode  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_payment_settings_updated_at BEFORE UPDATE ON payment_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text        NOT NULL UNIQUE,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- google_sheet_sync
CREATE TABLE IF NOT EXISTS google_sheet_sync (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sync_status   text        NOT NULL DEFAULT 'PENDING' CHECK (sync_status IN ('PENDING','SYNCED','FAILED')),
  last_attempt  timestamptz,
  error_message text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_google_sheet_sync_booking_id ON google_sheet_sync(booking_id);
CREATE TRIGGER trg_google_sheet_sync_updated_at BEFORE UPDATE ON google_sheet_sync FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- audit_logs (immutable — no updated_at trigger)
CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid,
  action        text        NOT NULL,
  resource_type text,
  resource_id   text,
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id       ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at    ON audit_logs(created_at DESC);
