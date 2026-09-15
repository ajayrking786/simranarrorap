# Simran Arrora ♡ — Full-Stack Creator Web App

Official website and digital ecosystem for creator, collaborator, and professional **Simran Arrora**.

Designed with a luxury dark cinematic aesthetic (`#0a0a0a` background with hot pink `#e91e8c` accents), featuring visual galleries, motion video showcases, multi-step booking workflows, customer account management, resilient Google Sheets synchronization, transactional emails via Resend, AI concierge powered by Google Gemini, and comprehensive admin controls.

---

## 🌟 Key Capabilities & Architecture

- **Next.js 15 (App Router)** & **React 19** with strict TypeScript
- **Database & Row-Level Security:** Supabase PostgreSQL with automated migrations (`001_initial_schema.sql`, `002_rls_policies.sql`, `003_seed_config.sql`)
- **Visuals & Showcases:** Curated lookbooks, photo galleries with keyboard-navigable lightboxes, and cinematic video feeds
- **Server-Side Booking Workflow:** Multi-step reservation wizard with server-controlled pricing (never trusting client-supplied prices) and status transitions (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`)
- **Resilient Google Sheets Reporting:** Automatic booking append to the `Bookings` sheet with graceful degradation and admin retry tools
- **Transactional Communication:** Branded HTML emails via Resend with dark luxury shell
- **Simran AI Assistant:** Floating chatbot concierge powered by Google Gemini with strict prompt guardrails
- **Administrative Control Suite:** 17 dedicated management portals covering appointments, customers, services, prices, calendar config, live status, notifications, legal pages, and SEO
- **Security First:** Strict server-side route middleware protection, role-based access control (`ADMIN` vs `CUSTOMER`), sanitization, and no hard-coded secrets

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20+ / 24+)
- npm or pnpm

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the required environment keys:
```ini
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=bookings@simranarrora.com

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Admin Bootstrap
ADMIN_EMAIL=admin@simranarrora.com
ADMIN_PASSWORD=your-secure-password
```

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Database Setup (Supabase)

Execute migrations in your Supabase SQL editor in order:
1. `supabase/migrations/001_initial_schema.sql` — Tables, auto-updating triggers, UUID extensions, and indexes
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security policies
3. `supabase/migrations/003_seed_config.sql` — Default site settings, social link structures, and legal page placeholders

---

## 🛡️ Permissible Scope Policy

All services offered on this platform (Brand Collaborations, Creative Content Creation, Photography Sessions, Creator Consultations, Online Professional Sessions, Event Appearances, and Community Access) are strictly legitimate, artistic, and professional business engagements. Any unlawful or non-compliant solicitation is prohibited.

---

© Simran Arrora. All rights reserved.
