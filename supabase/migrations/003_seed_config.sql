-- =============================================================================
-- Migration 003: Seed Configuration Data
-- Project: Simran Arrora Creator Web App
-- NO fake booking/customer/payment data. All inserts are idempotent.
-- =============================================================================

-- Site Settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name',         'Simran Arrora'),
  ('age_gate_enabled',  'false'),
  ('age_gate_required', NULL),
  ('live_enabled',      'false')
ON CONFLICT (key) DO NOTHING;

-- Legal Pages (placeholder content — must be edited by admin before launch)
INSERT INTO legal_pages (slug, title, content, effective_date, published) VALUES
  ('terms', 'Terms & Conditions',
   '# Terms & Conditions

> **This page content is editable by the administrator. Please update before launch.**

## 1. Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by these terms and conditions.

## 2. Services

Services offered on this platform are for lawful, professional purposes only. Details about scope, limitations, and delivery will be documented here.

## 3. Payments

Payment terms, refund conditions, and accepted methods will be described here.

## 4. Intellectual Property

All content on this site is the intellectual property of Simran Arrora unless stated otherwise.

## 5. Limitation of Liability

The limitation of liability clause will be documented here before launch.

## 6. Governing Law

These terms shall be governed by the laws of India.

## 7. Contact

For questions regarding these terms, please use the contact form on this website.',
   CURRENT_DATE, true),

  ('privacy', 'Privacy Policy',
   '# Privacy Policy

> **This page content is editable by the administrator. Please update before launch.**

## 1. Information We Collect

We collect information you provide when booking a service: name, email, phone, and payment details.

## 2. How We Use Your Information

We use this information to process bookings, send confirmations, and communicate about appointments.

## 3. Sharing of Information

We do not sell, trade, or rent your personal information to third parties.

## 4. Data Retention

We retain your information for as long as necessary to provide our services and comply with legal obligations.

## 5. Your Rights

You have the right to access, correct, or delete your personal data. Please contact us to exercise these rights.

## 6. Contact

For privacy-related questions, please use the contact form on this website.',
   CURRENT_DATE, true),

  ('shipping', 'Shipping & Delivery Policy',
   '# Shipping & Delivery Policy

> **This page content is editable by the administrator. Please update before launch.**

## Digital Services Only

All services offered on this platform are delivered digitally — online sessions, video calls, and digital content. No physical shipping or delivery is involved.

## Appointment Confirmation

Upon successful booking, you will receive a confirmation via email. The admin team will review and confirm your appointment.

## Session Delivery

Details about how sessions are conducted (platform, link sharing) will be communicated upon booking confirmation.

## Contact

For questions about service delivery, please use the contact form on this website.',
   CURRENT_DATE, true),

  ('cancellation-refund', 'Cancellation & Refund Policy',
   '# Cancellation & Refund Policy

> **This page content is editable by the administrator. Please update before launch.**

## Cancellation by Customer

Customers may request cancellation by contacting us. Eligibility for refunds depends on the timing of the cancellation request relative to the appointment date.

## Cancellation by Us

In the rare event we need to cancel your appointment, we will contact you immediately and offer either a full refund or a rescheduled session.

## Refund Eligibility

Refund eligibility criteria and any non-refundable fees will be documented here before launch.

## Refund Process

Approved refunds will be processed to the original payment method within 5-7 business days.

## Contact

To request a cancellation or refund, please use the contact form on this website.',
   CURRENT_DATE, true),

  ('contact', 'Contact Us',
   '# Contact Us

> **This page content is editable by the administrator. Please update before launch.**

## Get in Touch

We would love to hear from you. Please fill in the contact form or reach out through our social media channels.

## Response Time

We aim to respond to all enquiries within 24-48 hours on business days.',
   CURRENT_DATE, true)
ON CONFLICT (slug) DO NOTHING;

-- Payment Settings (single row)
INSERT INTO payment_settings (provider, enabled, test_mode)
  SELECT 'razorpay', false, true
  WHERE NOT EXISTS (SELECT 1 FROM payment_settings);

-- Social Links (5 platforms, all disabled, no URLs)
INSERT INTO social_links (name, url, icon, platform, enabled, display_order) VALUES
  ('Instagram',   NULL, 'instagram', 'instagram', false, 1),
  ('X (Twitter)', NULL, 'twitter',   'twitter',   false, 2),
  ('Telegram',    NULL, 'send',      'telegram',  false, 3),
  ('Reddit',      NULL, 'reddit',    'reddit',    false, 4),
  ('YouTube',     NULL, 'youtube',   'youtube',   false, 5)
ON CONFLICT DO NOTHING;

-- Live Settings (single row, disabled)
INSERT INTO live_settings (title, description, public_url, thumbnail_url, enabled)
  SELECT 'Live Session', NULL, NULL, NULL, false
  WHERE NOT EXISTS (SELECT 1 FROM live_settings);
