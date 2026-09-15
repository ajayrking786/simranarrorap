-- =============================================================================
-- Migration 002: Row Level Security Policies
-- Project: Simran Arrora Creator Web App
-- =============================================================================

-- is_admin() helper to avoid RLS recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN');
$$;

-- Enable RLS on all tables
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE services          ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_options     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery           ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links      ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sheet_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY users_select_own       ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_insert_own       ON users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY users_update_own       ON users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND role = 'CUSTOMER');
CREATE POLICY users_admin_select_all ON users FOR SELECT USING (is_admin());
CREATE POLICY users_admin_update_all ON users FOR UPDATE USING (is_admin());
CREATE POLICY users_admin_delete     ON users FOR DELETE USING (is_admin());

-- services
CREATE POLICY services_select_enabled ON services FOR SELECT USING (enabled = true);
CREATE POLICY services_admin_all      ON services FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- price_options
CREATE POLICY price_options_select_enabled ON price_options FOR SELECT USING (enabled = true);
CREATE POLICY price_options_admin_all      ON price_options FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- bookings
CREATE POLICY bookings_insert_own  ON bookings FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY bookings_select_own  ON bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY bookings_admin_select ON bookings FOR SELECT USING (is_admin());
CREATE POLICY bookings_admin_update ON bookings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY bookings_admin_delete ON bookings FOR DELETE USING (is_admin());

-- payments
CREATE POLICY payments_select_own ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM bookings b WHERE b.id = payments.booking_id AND b.customer_id = auth.uid())
);
CREATE POLICY payments_admin_select ON payments FOR SELECT USING (is_admin());
CREATE POLICY payments_admin_update ON payments FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY payments_admin_insert ON payments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY payments_admin_delete ON payments FOR DELETE USING (is_admin());

-- gallery
CREATE POLICY gallery_select_published ON gallery FOR SELECT USING (published = true);
CREATE POLICY gallery_admin_all        ON gallery FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- videos
CREATE POLICY videos_select_published ON videos FOR SELECT USING (published = true);
CREATE POLICY videos_admin_all        ON videos FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- social_links
CREATE POLICY social_links_select_enabled ON social_links FOR SELECT USING (enabled = true);
CREATE POLICY social_links_admin_all      ON social_links FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- live_settings
CREATE POLICY live_settings_select_all ON live_settings FOR SELECT USING (true);
CREATE POLICY live_settings_admin_all  ON live_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- notifications
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_admin_all  ON notifications FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- contact_messages
CREATE POLICY contact_messages_insert_public ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY contact_messages_admin_select  ON contact_messages FOR SELECT USING (is_admin());
CREATE POLICY contact_messages_admin_update  ON contact_messages FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY contact_messages_admin_delete  ON contact_messages FOR DELETE USING (is_admin());

-- legal_pages
CREATE POLICY legal_pages_select_published ON legal_pages FOR SELECT USING (published = true);
CREATE POLICY legal_pages_admin_all        ON legal_pages FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- site_settings
CREATE POLICY site_settings_select_all ON site_settings FOR SELECT USING (true);
CREATE POLICY site_settings_admin_all  ON site_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- payment_settings (admins only)
CREATE POLICY payment_settings_admin_all ON payment_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- google_sheet_sync (admins only)
CREATE POLICY google_sheet_sync_admin_all ON google_sheet_sync FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- audit_logs (admins read/insert only — rows are immutable via no UPDATE/DELETE policy)
CREATE POLICY audit_logs_admin_select ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY audit_logs_admin_insert ON audit_logs FOR INSERT WITH CHECK (is_admin());
