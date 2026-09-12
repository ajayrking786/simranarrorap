# Simran Arrora Premium Full-Stack Web App

## Overview

Simran Arrora Premium is a Node.js and Express website for creator services and professional consultations. It includes a public booking experience, customer accounts, an authenticated admin dashboard, SQLite persistence, optional Google integrations, and manual payment verification.

The application is designed so Google and payment integrations remain disabled until their environment variables are configured. It never treats a payment-link click or payment-proof submission as an automatically verified payment.

## Features

- Responsive public website with services, gallery, live links, contact, and legal pages.
- Customer registration, login, optional Google Sign-In, and booking history.
- Admin dashboard for services, categories, bookings, customers, payments, live settings, gallery, QR settings, integrations, and messages.
- Booking approval, rejection, rescheduling, cancellation, and optional Google Meet creation.
- Manual payment-proof review with pending, approved, and rejected states.
- SQLite database and SQLite-backed sessions for local or single-instance deployment.
- Optional Google Calendar, Meet, Sheets, Gmail, OAuth, and Gemini configuration.

## Tech Stack

- Node.js 20+
- Express 4
- SQLite via `better-sqlite3`
- `express-session` with `connect-sqlite3`
- Passport and Google OAuth 2.0
- Google APIs and Nodemailer
- Plain HTML, CSS, and browser JavaScript frontend

## Installation

1. Install Node.js 20 or newer.
2. Clone this repository and enter the project directory.
3. Install dependencies:

```bash
npm install
```

4. Create a local environment file:

```bash
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead. Edit `.env` with local values. Never commit `.env`.

## Environment Variables

The complete variable list is in `.env.example`. At minimum, set these before using the admin area:

```env
SESSION_SECRET=use-a-long-random-value
ADMIN_NAME=Your Admin Name
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-strong-password
```

For production, use a session secret of at least 32 characters, HTTPS, and a secret manager or protected environment configuration. The admin password is read only during initial admin creation or when the application provisions the configured admin account; do not place it in source control.

## Database Setup

No migration command is required for a fresh install. On first start, the application creates `data/app.db`, its SQLite WAL files, and `data/sessions.db` as needed. The `data/` directory is intentionally ignored because it may contain customer, booking, payment, and session data.

Back up production database files securely and do not upload them to GitHub. For multi-instance production hosting, use persistent storage and evaluate PostgreSQL or MySQL instead of local SQLite.

## Google Sheets Setup

1. Create or select a Google Cloud project.
2. Enable the Google Sheets API and create OAuth credentials.
3. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_SHEET_ID`, and optionally `GOOGLE_SHEET_TAB` in `.env`.
4. Grant the authenticated Google account access to the target spreadsheet.

When configured, approved booking data is appended to the configured sheet and later status changes update the booking row. Without these values, the core booking flow continues locally and Google actions are skipped.

## Google Calendar / Meet Setup

Enable the Google Calendar API and use OAuth credentials with calendar access. Set `GOOGLE_CALENDAR_ID` and the OAuth variables in `.env`; use the exact HTTPS callback URL for the deployed application in `GOOGLE_REDIRECT_URI`. Approving a Video Call booking can then create a Calendar event and Google Meet link.

`GOOGLE_SERVICE_ACCOUNT_JSON` and `GOOGLE_DRIVE_FOLDER_ID` are reserved for optional service-account or Drive integrations. Store the JSON securely outside the repository; do not commit a service-account file.

## Payment Link Setup

Set `RAZORPAY_PAYMENT_LINK` to the external payment link shown by the application, or configure the payment link from the admin dashboard. Payment proof remains pending until an administrator verifies it. Do not add payment API keys or secret keys to this repository.

## Admin Setup

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env` before the first start. The application creates the initial admin user if that email does not already exist. After signing in at `/admin`, configure services, prices, availability, links, payment instructions, gallery items, live settings, and integrations.

## Development Run Command

```bash
npm run dev
```

Or run the production-style local server:

```bash
npm start
```

Open `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the admin panel.

## Production Build Command

```bash
npm run build
```

The build command performs Node.js syntax checks for the server, database, and Google integration modules. Before deployment, also configure HTTPS, persistent storage, secure environment variables, backups, rate limiting, CSRF protection, and the published legal/payment policies appropriate to the deployment.

## Project Structure

```text
simran-premium-fullstack/
├── server.js
├── db.js
├── google.js
├── package.json
├── package-lock.json
├── .env.example
├── data/                 # ignored local SQLite and session data
└── public/               # frontend pages, styles, scripts, and static assets
```# Simran Premium Full-Stack Website

A production-oriented dark/cinematic creator + professional consultation website with a separate admin dashboard.

## Included

- Responsive public website: Home, About, Services, Gallery, Booking, Live, Contact, Account.
- Customer registration/login and optional Google Sign-In.
- Role-based customer/admin authorization enforced on the server.
- SQLite database for Users, Services, Bookings, Payments, Live Settings, Payment Settings, Notifications, and Contact Messages.
- Booking workflow: PENDING / APPROVED / REJECTED / CANCELLED.
- Customer "My Bookings" area with rejection messages and Google Meet links when available.
- Admin dashboard with booking stats, appointment approval/rejection/rescheduling/cancellation, customers, services, payments, live management, QR management, integrations and messages.
- Manual payment verification. Clicking "I HAVE PAID" only creates PENDING_VERIFICATION; it never fakes successful payment.
- Dynamic admin-managed QR image and UPI ID/instructions.
- Admin-managed Live title/description/URL/enable state. The public Join Live button always uses the exact configured URL.
- Optional Google OAuth, Calendar, Meet, Sheets and Gmail integrations using server environment variables.
- Google Meet is created through Google Calendar conference data for approved Video Call bookings when Google is configured.
- Existing site images are included under `public/assets/Images/`.

This build is intentionally for lawful creator, collaboration and professional consultation services. It is not configured for commercial sexual services.

## Requirements

- Node.js 20 or newer
- npm

## Windows quick start

1. Extract this ZIP.
2. Open the extracted folder in VS Code.
3. Open **Terminal > New Terminal**.
4. Run:

```bash
npm install
```

5. Copy `.env.example` to a new file named `.env`.
6. Edit these values in `.env` before first start:

```env
SESSION_SECRET=put-a-long-random-secret-here
ADMIN_NAME=Your Admin Name
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=use-a-strong-password
```

7. Run:

```bash
npm start
```

8. Open:

- Public website: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`

The first start creates `data/app.db` and creates the initial admin account from `.env` if that email does not already exist. It does not automatically create sample services, prices, categories, social links, or platform URLs; configure those from the admin panel before publishing.

## Google setup

Google integrations stay safely disabled until you provide real credentials. Put these in `.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary
GOOGLE_SHEET_ID=
GOOGLE_SHEET_TAB=Bookings
GMAIL_USER=
GOOGLE_SERVICE_ACCOUNT_JSON=
GOOGLE_DRIVE_FOLDER_ID=
GEMINI_API_KEY=
RAZORPAY_PAYMENT_LINK=https://razorpay.me/@simranarrora
```

In Google Cloud Console, enable the APIs you use and create OAuth credentials. For production, replace the localhost redirect URL with your real HTTPS domain callback URL.

### Approval flow when Google is configured

Admin clicks **Approve** -> server updates booking -> creates Calendar event -> creates Meet link for Video Call -> sends confirmation through Gmail -> appends a row to the configured Google Sheet -> customer sees APPROVED in My Bookings.

If Google is not configured, booking approval still works locally; the Google-specific steps are skipped rather than faked.

## Payment workflow

Admin Panel -> QR Management:

- Upload/replace/delete a QR image.
- Enter UPI ID.
- Enter customer payment instructions.
- Enter the external payment link, such as the configured Razorpay link.
- Enable/disable payment settings.

Customer opens My Bookings -> Submit Payment Proof -> enters transaction/reference ID -> status becomes `PENDING_VERIFICATION`.

Admin Panel -> Payments -> manually Approve or Reject.

The app never treats clicking `PAY NOW` or `I HAVE PAID` as successful payment. Proof remains pending until an admin verifies it.

## Live workflow

Admin Panel -> Live Management:

- Enter title.
- Enter description.
- Enter the exact live URL.
- Enable or disable live state.

The public website shows LIVE NOW only when enabled and uses the configured URL; no live destination is hard-coded.

## Configuration map

- Services and prices: Admin -> Services, Booking Configuration, and Price Lists.
- Categories, availability, locations, and call platforms: Admin -> Booking Configuration.
- Social links and video URLs: Admin -> Platforms & Links and Videos / Video Platforms.
- Gallery: Admin -> Gallery. Only enabled gallery items appear publicly.
- Live settings: Admin -> Live Management.
- Payment link, QR, UPI, and instructions: Admin -> QR Management.
- Legal content: public pages are available at `/terms`, `/privacy`, `/shipping`, `/contact`, and `/cancellation-refund`. Published database overrides can be managed through `/api/admin/legal/:slug`.

When configured, Google Sheets receives the booking ID, created time, customer details, category, service, duration, amount, currency, platform, schedule, location, notes, payment status, and booking status. Approval, rejection, rescheduling, and cancellation update the status cell when the booking row exists.

## Important production checklist

- Use a long random `SESSION_SECRET`.
- Use a strong admin password.
- Never commit `.env`.
- Use HTTPS in production.
- Use persistent disk/storage for SQLite and uploaded QR files, or replace SQLite with PostgreSQL/MySQL for multi-instance hosting.
- Add rate limiting, CSRF protection and your hosting platform's secure secret manager before high-traffic public deployment.
- Review privacy policy, terms, refund/cancellation policy and local legal requirements before accepting payments or in-person appointments.

## Project structure

```text
simran-premium-fullstack/
├── server.js
├── db.js
├── google.js
├── package.json
├── .env.example
├── .gitignore
├── data/
└── public/
    ├── index.html
    ├── site.css
    ├── site.js
    ├── admin.html
    ├── admin.css
    ├── admin.js
    ├── assets/Images/
    └── uploads/
```
#   s i m r a n a r r o r a  
 