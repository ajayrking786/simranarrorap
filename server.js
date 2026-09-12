require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const multer = require('multer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { db, initDb, ensureAdminFromEnv } = require('./db');
const googleSvc = require('./google');

initDb();
ensureAdminFromEnv();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  throw new Error('SESSION_SECRET must be at least 32 characters in production.');
}

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname, 'data') }),
  secret: process.env.SESSION_SECRET || 'development-only-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

const requestWindows = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const recent = (requestWindows.get(key) || []).filter(time => now - time < windowMs);
  recent.push(now);
  requestWindows.set(key, recent);
  return recent.length <= limit;
}
app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin') || req.get('referer');
  if (origin) {
    try { if (new URL(origin).host !== req.get('host')) return res.status(403).json({ error: 'Invalid request origin.' }); }
    catch { return res.status(403).json({ error: 'Invalid request origin.' }); }
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  try { done(null, db.prepare('SELECT id,name,email,phone,role FROM users WHERE id=?').get(id)); }
  catch (e) { done(e); }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI || `${APP_URL}/auth/google/callback`
  }, (accessToken, refreshToken, profile, done) => {
    try {
      const email = (profile.emails?.[0]?.value || '').toLowerCase();
      if (!email) return done(new Error('Google account has no accessible email'));
      let user = db.prepare('SELECT * FROM users WHERE google_id=? OR email=?').get(profile.id, email);
      if (!user) {
        const info = db.prepare(`INSERT INTO users (name,email,google_id,role) VALUES (?,?,?,'customer')`)
          .run(profile.displayName || email.split('@')[0], email, profile.id);
        user = db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid);
      } else if (!user.google_id) {
        db.prepare('UPDATE users SET google_id=? WHERE id=?').run(profile.id, user.id);
      }
      done(null, user);
    } catch (e) { done(e); }
  }));
}

const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(publicDir, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `payment-qr-${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});

function safeUser(u) { return u ? { id:u.id, name:u.name, email:u.email, phone:u.phone, role:u.role } : null; }
function requireAuth(req, res, next) { if (!req.user) return res.status(401).json({ error: 'Please sign in.' }); next(); }
function requireAdmin(req, res, next) { if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' }); next(); }
function bookingCode() { return `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`; }
function notify(userId, title, message) { db.prepare('INSERT INTO notifications (user_id,title,message) VALUES (?,?,?)').run(userId, title, message); }
function publicService(s) { return { ...s, active: Boolean(s.active) }; }
function mapPaymentSettings(row) { return { ...row, payment_link: row.payment_link || process.env.RAZORPAY_PAYMENT_LINK || '', enabled: Boolean(row.enabled) }; }
function jsonArray(value) { try { const parsed = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function configRow(row) { return row ? { ...row, active: Boolean(row.active), available_dates: jsonArray(row.available_dates), available_times: jsonArray(row.available_times), locations: jsonArray(row.locations) } : null; }
function slugify(value) { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `category-${Date.now()}`; }
function calculateAge(dob) { const birth = new Date(`${dob}T00:00:00`); if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(birth.getTime()) || birth > new Date()) return null; const now = new Date(); let age = now.getFullYear() - birth.getFullYear(); const beforeBirthday = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()); if (beforeBirthday) age -= 1; return age >= 0 && age <= 120 ? age : null; }
function categoryService(categoryId) { return db.prepare('SELECT * FROM services WHERE category_id=? AND active=1 ORDER BY sort_order,id LIMIT 1').get(categoryId) || db.prepare('SELECT * FROM services WHERE category_id=? ORDER BY sort_order,id LIMIT 1').get(categoryId); }

// Admin page guards must run before static extension resolution.
app.get('/admin/login', (req,res) => req.user?.role === 'admin' ? res.redirect('/admin') : res.sendFile(path.join(publicDir,'admin.html')));
app.get('/admin', (req,res) => { if (!req.user || req.user.role !== 'admin') return res.redirect('/admin/login'); res.sendFile(path.join(publicDir,'admin.html')); });

// Public pages
const legalSlugs = new Set(['terms','privacy','shipping','cancellation-refund','contact']);
app.get('/:slug', (req,res,next) => {
  if (!legalSlugs.has(req.params.slug)) return next();
  const page = db.prepare('SELECT * FROM legal_pages WHERE slug=? AND published=1').get(req.params.slug);
  if (page) return res.send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title}</title><link rel="stylesheet" href="/reference.css"><link rel="stylesheet" href="/reference-overrides.css"></head><body><main class="section container legal-page"><p class="eyebrow">LEGAL</p><h1>${page.title}</h1><p>Effective date: ${page.effective_date || 'Not specified'}</p><div>${page.content}</div><p><a class="btn primary" href="/">Return home</a></p></main></body></html>`);
  res.sendFile(path.join(publicDir, `${req.params.slug}.html`));
});
app.use(express.static(publicDir, { extensions: ['html'] }));
app.get('/', (_req,res) => res.sendFile(path.join(publicDir,'index.html')));

// Auth
app.get('/api/auth/me', (req,res) => res.json({ user: safeUser(req.user), googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) }));
app.post('/api/auth/register', async (req,res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ error:'Enter a valid name, email, and password of at least 8 characters.' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const info = db.prepare(`INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'customer')`).run(name,email,hash);
    const user = db.prepare('SELECT id,name,email,phone,role FROM users WHERE id=?').get(info.lastInsertRowid);
    req.login(user, err => err ? res.status(500).json({error:'Could not sign in.'}) : res.json({user:safeUser(user)}));
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({error:'An account with this email already exists.'});
    res.status(500).json({error:'Registration failed.'});
  }
});
app.post('/api/auth/login', async (req,res) => {
  if (!rateLimit(`login:${req.ip}`, 8, 15 * 60 * 1000)) return res.status(429).json({error:'Too many login attempts. Please try again later.'});
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!user || !user.password_hash || !(await bcrypt.compare(password,user.password_hash))) return res.status(401).json({error:'Invalid email or password.'});
  req.login(user, err => err ? res.status(500).json({error:'Could not sign in.'}) : res.json({user:safeUser(user)}));
});
app.post('/api/auth/logout', (req,res) => req.logout(() => req.session.destroy(() => res.json({ok:true}))));
app.get('/auth/google', (req,res,next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).send('Google Sign-In is not configured.');
  passport.authenticate('google',{scope:['profile','email']})(req,res,next);
});
app.get('/auth/google/callback', (req,res,next) => passport.authenticate('google',{failureRedirect:'/?auth=failed'})(req,res,() => res.redirect(req.user?.role === 'admin' ? '/admin' : '/?auth=success')));

// Public API
app.get('/api/services', (_req,res) => res.json(db.prepare('SELECT * FROM services WHERE active=1 ORDER BY id').all().map(publicService)));
app.get('/api/booking-categories', (_req,res) => {
  const categories = db.prepare('SELECT * FROM booking_categories WHERE active=1 ORDER BY sort_order,id').all();
  res.json(categories.map(category => ({ ...configRow(category), prices: db.prepare('SELECT * FROM price_options WHERE category_id=? AND active=1 ORDER BY sort_order,id').all(category.id), platforms: db.prepare('SELECT * FROM platforms WHERE category_id=? AND active=1 ORDER BY sort_order,id').all(category.id) })));
});
app.get('/api/prices', (_req,res) => res.json(db.prepare('SELECT * FROM price_options WHERE active=1 ORDER BY category_id,sort_order,id').all()));
app.get('/api/platforms', (_req,res) => res.json(db.prepare('SELECT * FROM platforms WHERE active=1 ORDER BY category_id,sort_order,id').all()));
app.get('/api/social-links', (_req,res) => res.json(db.prepare('SELECT * FROM social_links WHERE active=1 ORDER BY sort_order,id').all()));
app.get('/api/video-platforms', (_req,res) => res.json(db.prepare("SELECT * FROM video_platforms WHERE enabled=1 AND url!='' ORDER BY display_order,id").all().map(row => ({ ...row, enabled: Boolean(row.enabled) }))));
app.get('/api/gallery', (_req,res) => res.json(db.prepare('SELECT * FROM gallery_items WHERE enabled=1 ORDER BY display_order,id').all().map(row => ({...row, enabled:Boolean(row.enabled)}))));
app.get('/api/live', (_req,res) => { const row=db.prepare('SELECT * FROM live_settings WHERE id=1').get(); res.json({...row,enabled:Boolean(row.enabled)}); });
app.get('/api/payment-settings', (_req,res) => { const row=db.prepare('SELECT * FROM payment_settings WHERE id=1').get(); res.json(mapPaymentSettings(row)); });
app.get('/api/legal/:slug', (req,res) => {
  const page = db.prepare('SELECT * FROM legal_pages WHERE slug=? AND published=1').get(req.params.slug);
  if (!page) return res.status(404).json({error:'Legal page not found.'});
  res.json(page);
});
app.post('/api/contact', (req,res) => {
  if (!rateLimit(`contact:${req.ip}`, 5, 15 * 60 * 1000)) return res.status(429).json({error:'Too many messages. Please try again later.'});
  const name=String(req.body.name||'').trim(), email=String(req.body.email||'').trim(), phone=String(req.body.phone||'').trim().slice(0,40), message=String(req.body.message||'').trim();
  if(name.length<2 || !/^\S+@\S+\.\S+$/.test(email) || message.length<5) return res.status(400).json({error:'Please complete all contact fields.'});
  db.prepare('INSERT INTO contact_messages (name,email,phone,message) VALUES (?,?,?,?)').run(name,email,phone,message);
  res.json({ok:true});
});

// Customer account
app.patch('/api/account', requireAuth, (req,res) => {
  const name=String(req.body.name||'').trim(), phone=String(req.body.phone||'').trim();
  if(name.length<2) return res.status(400).json({error:'Name is required.'});
  db.prepare('UPDATE users SET name=?,phone=? WHERE id=?').run(name,phone,req.user.id);
  res.json({user:safeUser(db.prepare('SELECT id,name,email,phone,role FROM users WHERE id=?').get(req.user.id))});
});
app.get('/api/notifications', requireAuth, (req,res) => res.json(db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50').all(req.user.id)));
app.post('/api/notifications/:id/read', requireAuth, (req,res) => { db.prepare('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?').run(req.params.id,req.user.id); res.json({ok:true}); });

// Bookings
app.post('/api/bookings', requireAuth, (req,res) => {
  const categoryId=Number(req.body.category_id), priceOptionId=Number(req.body.price_option_id)||null, platformId=Number(req.body.platform_id)||null, date=String(req.body.appointment_date||''), time=String(req.body.appointment_time||''), notes=String(req.body.notes||'').slice(0,1000), requestedLocation=String(req.body.location||'').slice(0,300);
  const name=String(req.body.name||req.user.name||'').trim(), phone=String(req.body.phone||req.user.phone||'').trim(), email=req.user.email;
  const category=db.prepare('SELECT * FROM booking_categories WHERE id=? AND active=1').get(categoryId);
  if(!category) return res.status(400).json({error:'Please select a valid booking category.'});
  if(category.booking_mode==='live') return res.status(400).json({error:'Live sessions are joined from the Live section and do not require a booking.'});
  const service=categoryService(category.id);
  if(!service) return res.status(400).json({error:'This category is not currently configured for booking.'});
  const price=priceOptionId ? db.prepare('SELECT * FROM price_options WHERE id=? AND category_id=? AND active=1').get(priceOptionId,category.id) : db.prepare('SELECT * FROM price_options WHERE category_id=? AND active=1 ORDER BY sort_order,id LIMIT 1').get(category.id);
  if(!price) return res.status(400).json({error:'Please select a valid enabled price option.'});
  const platform=platformId ? db.prepare('SELECT * FROM platforms WHERE id=? AND category_id=? AND active=1').get(platformId,category.id) : null;
  if(['video-call','audio-call'].includes(category.slug) && !platform) return res.status(400).json({error:'Please select a valid enabled platform.'});
  if(platform && platform.url && !/^https?:\/\//i.test(platform.url)) return res.status(400).json({error:'The configured platform URL is invalid.'});
  if(name.length<2 || phone.length<5 || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({error:'Please provide valid customer details.'});
  const dob=String(req.body.dob||'').trim(), age=category.slug==='real-meet'?calculateAge(dob):null;
  if(category.slug==='real-meet' && age===null) return res.status(400).json({error:'A valid date of birth is required for Real Meet.'});
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return res.status(400).json({error:'Please choose a valid date and time.'});
  const selected = new Date(`${date}T${time}:00`); if(Number.isNaN(selected.getTime()) || selected < new Date()) return res.status(400).json({error:'Please choose a future appointment time.'});
  const availableDates=jsonArray(category.available_dates), availableTimes=jsonArray(category.available_times), locations=jsonArray(category.locations);
  if(availableDates.length && !availableDates.includes(date)) return res.status(400).json({error:'That date is not available.'});
  if(availableTimes.length && !availableTimes.includes(time)) return res.status(400).json({error:'That time is not available.'});
  if(locations.length && !locations.includes(requestedLocation)) return res.status(400).json({error:'Please select a configured meeting location.'});
  const conflict = db.prepare(`SELECT id FROM bookings WHERE appointment_date=? AND appointment_time=? AND status IN ('PENDING','APPROVED') AND category_id=?`).get(date, time, category.id);
  if (conflict) return res.status(409).json({error:'This time slot is no longer available.'});
  db.prepare('UPDATE users SET name=?,phone=? WHERE id=?').run(name,phone,req.user.id);
  const code=bookingCode();
  const info=db.prepare(`INSERT INTO bookings (booking_code,user_id,service_id,category_id,price_option_id,platform_id,appointment_type,customer_name,customer_dob,customer_age,currency,platform_url,appointment_date,appointment_time,notes,location) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(code,req.user.id,service.id,category.id,price.id,platform?.id||null,category.name,name,dob||null,age,price.currency,platform?.url||null,date,time,notes,requestedLocation);
  const created = db.prepare('SELECT b.*,c.name category_name,p.name price_option_name,p.price,p.currency,pl.name platform_name FROM bookings b JOIN booking_categories c ON c.id=b.category_id LEFT JOIN price_options p ON p.id=b.price_option_id LEFT JOIN platforms pl ON pl.id=b.platform_id WHERE b.id=?').get(info.lastInsertRowid);
  notify(req.user.id,'Booking received',`${code} is pending admin approval.`);
  googleSvc.appendBookingToSheet({booking:created,service,customer:{...req.user,name,email,phone}}).catch(error => console.error('[google-sheets] booking append failed', error.message));
  res.json({booking:created});
});
app.get('/api/bookings', requireAuth, (req,res) => {
  const rows=db.prepare(`SELECT b.*, s.name service_name, COALESCE(p.price,s.price) price, COALESCE(p.currency,b.currency,s.currency,'INR') currency, s.duration_minutes, c.name category_name, p.name price_option_name, pl.name platform_name FROM bookings b JOIN services s ON s.id=b.service_id LEFT JOIN booking_categories c ON c.id=b.category_id LEFT JOIN price_options p ON p.id=b.price_option_id LEFT JOIN platforms pl ON pl.id=b.platform_id WHERE b.user_id=? ORDER BY b.id DESC`).all(req.user.id);
  res.json(rows);
});
app.post('/api/bookings/:id/cancel', requireAuth, (req,res) => {
  const b=db.prepare('SELECT * FROM bookings WHERE id=? AND user_id=?').get(req.params.id,req.user.id);
  if(!b || !['PENDING','APPROVED'].includes(b.status)) return res.status(400).json({error:'This booking cannot be cancelled.'});
  db.prepare(`UPDATE bookings SET status='CANCELLED', updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(b.id);
  notify(req.user.id,'Booking cancelled',`${b.booking_code} was cancelled.`);
  res.json({ok:true});
});

// Manual payment submission: never auto-approves.
app.post('/api/payments', requireAuth, (req,res) => {
  const bookingId=Number(req.body.booking_id), method=String(req.body.method||'UPI').slice(0,40), transactionRef=String(req.body.transaction_ref||'').trim().slice(0,120), note=String(req.body.note||'').slice(0,500);
  const b=db.prepare(`SELECT b.*,COALESCE(p.price,s.price) price FROM bookings b JOIN services s ON s.id=b.service_id LEFT JOIN price_options p ON p.id=b.price_option_id WHERE b.id=? AND b.user_id=?`).get(bookingId,req.user.id);
  if(!b) return res.status(404).json({error:'Booking not found.'});
  if(!['PENDING','APPROVED'].includes(b.status)) return res.status(400).json({error:'Payment is unavailable for this booking.'});
  if(!rateLimit(`payment:${req.user.id}`, 5, 15 * 60 * 1000)) return res.status(429).json({error:'Too many payment submissions. Please try again later.'});
  if(transactionRef.length<3) return res.status(400).json({error:'Enter your payment transaction/reference ID.'});
  if(db.prepare('SELECT id FROM payments WHERE booking_id=?').get(bookingId)) return res.status(409).json({error:'Payment proof has already been submitted for this booking.'});
  db.prepare(`INSERT INTO payments (booking_id,user_id,amount,method,transaction_ref,note) VALUES (?,?,?,?,?,?)`).run(bookingId,req.user.id,b.price,method,transactionRef,note);
  db.prepare(`UPDATE bookings SET payment_status='PENDING_VERIFICATION',updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(bookingId);
  notify(req.user.id,'Payment submitted',`${b.booking_code} payment is pending manual verification.`);
  res.json({ok:true,status:'PENDING_VERIFICATION'});
});

// Admin stats/data
app.get('/api/admin/booking-categories', requireAdmin, (_req,res) => res.json(db.prepare('SELECT * FROM booking_categories ORDER BY sort_order,id').all().map(category => ({ ...configRow(category), prices: db.prepare('SELECT * FROM price_options WHERE category_id=? ORDER BY sort_order,id').all(category.id), platforms: db.prepare('SELECT * FROM platforms WHERE category_id=? ORDER BY sort_order,id').all(category.id) }))));
app.post('/api/admin/booking-categories', requireAdmin, (req,res) => {
  const name=String(req.body.name||'').trim(), description=String(req.body.description||'').trim(), slug=slugify(req.body.slug||name), mode=String(req.body.booking_mode||'appointment'), duration=Math.max(0,Number(req.body.duration_minutes||30)), currency=String(req.body.currency||'INR').trim().slice(0,8), image=String(req.body.image||'').trim(), order=Number(req.body.sort_order||0);
  if(!name || !['appointment','live'].includes(mode) || !currency) return res.status(400).json({error:'Name, valid booking mode, and currency are required.'});
  try {
    const info=db.prepare(`INSERT INTO booking_categories (name,slug,description,image,booking_mode,duration_minutes,currency,max_participants,online_option,available_dates,available_times,locations,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(name,slug,description,image,mode,duration,currency,Number(req.body.max_participants)||null,String(req.body.online_option||''),JSON.stringify(Array.isArray(req.body.available_dates)?req.body.available_dates:[]),JSON.stringify(Array.isArray(req.body.available_times)?req.body.available_times:[]),JSON.stringify(Array.isArray(req.body.locations)?req.body.locations:[]),order||Date.now());
    const categoryId=Number(info.lastInsertRowid); db.prepare('INSERT INTO services (name,description,appointment_type,duration_minutes,price,currency,image,category_id,sort_order) VALUES (?,?,?,?,?,?,?,?,?)').run(name,description,name,duration,0,currency,image,categoryId,order||categoryId);
    res.status(201).json(configRow(db.prepare('SELECT * FROM booking_categories WHERE id=?').get(categoryId)));
  } catch(e) { if(String(e.message).includes('UNIQUE')) return res.status(409).json({error:'A category with this name or slug already exists.'}); throw e; }
});
app.put('/api/admin/booking-categories/:id', requireAdmin, (req,res) => {
  if(req.params.id==='reorder'){const ids=Array.isArray(req.body.ids)?req.body.ids:[];const update=db.prepare('UPDATE booking_categories SET sort_order=? WHERE id=?');db.transaction(()=>ids.forEach((id,index)=>update.run(index+1,Number(id))))();return res.json({ok:true});}
  const current=db.prepare('SELECT * FROM booking_categories WHERE id=?').get(req.params.id); if(!current)return res.status(404).json({error:'Booking category not found.'}); const v={...current,...req.body}; const name=String(v.name||'').trim(), slug=slugify(v.slug||name); if(!name)return res.status(400).json({error:'Category name is required.'});
  db.prepare(`UPDATE booking_categories SET name=?,slug=?,description=?,image=?,booking_mode=?,duration_minutes=?,currency=?,max_participants=?,online_option=?,available_dates=?,available_times=?,locations=?,active=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(name,slug,String(v.description||''),String(v.image||''),String(v.booking_mode||'appointment'),Math.max(0,Number(v.duration_minutes||0)),String(v.currency||'INR').slice(0,8),Number(v.max_participants)||null,String(v.online_option||''),JSON.stringify(Array.isArray(v.available_dates)?v.available_dates:jsonArray(v.available_dates)),JSON.stringify(Array.isArray(v.available_times)?v.available_times:jsonArray(v.available_times)),JSON.stringify(Array.isArray(v.locations)?v.locations:jsonArray(v.locations)),v.active?1:0,Number(v.sort_order||0),current.id);
  db.prepare('UPDATE services SET name=?,description=?,appointment_type=?,duration_minutes=?,currency=?,image=?,active=?,sort_order=? WHERE category_id=?').run(name,String(v.description||''),name,Math.max(0,Number(v.duration_minutes||0)),String(v.currency||'INR').slice(0,8),String(v.image||''),v.active?1:0,Number(v.sort_order||0),current.id);
  res.json(configRow(db.prepare('SELECT * FROM booking_categories WHERE id=?').get(current.id)));
});
app.delete('/api/admin/booking-categories/:id', requireAdmin, (req,res) => { const category=db.prepare('SELECT id FROM booking_categories WHERE id=?').get(req.params.id); if(!category)return res.status(404).json({error:'Booking category not found.'}); if(db.prepare('SELECT id FROM bookings WHERE category_id=? LIMIT 1').get(category.id))return res.status(409).json({error:'This category has bookings and cannot be deleted. Disable it instead.'}); db.prepare('DELETE FROM booking_categories WHERE id=?').run(category.id); db.prepare('DELETE FROM services WHERE category_id=?').run(category.id); res.json({ok:true}); });
app.put('/api/admin/booking-categories/reorder', requireAdmin, (req,res) => { const ids=Array.isArray(req.body.ids)?req.body.ids:[]; const update=db.prepare('UPDATE booking_categories SET sort_order=? WHERE id=?'); db.transaction(()=>ids.forEach((id,index)=>update.run(index+1,Number(id))))(); res.json({ok:true}); });

app.get('/api/admin/prices', requireAdmin, (_req,res)=>res.json(db.prepare('SELECT p.*,c.name category_name FROM price_options p JOIN booking_categories c ON c.id=p.category_id ORDER BY p.category_id,p.sort_order,p.id').all()));
app.post('/api/admin/prices', requireAdmin, (req,res)=>{ const categoryId=Number(req.body.category_id),name=String(req.body.name||'').trim(),duration=Number(req.body.duration_minutes),price=Number(req.body.price),currency=String(req.body.currency||'INR').slice(0,8); if(!categoryId||!name||!Number.isFinite(duration)||duration<1||!Number.isFinite(price)||price<0)return res.status(400).json({error:'Category, duration, and valid price are required.'}); const info=db.prepare('INSERT INTO price_options (category_id,name,duration_minutes,price,currency,active,sort_order) VALUES (?,?,?,?,?,?,?)').run(categoryId,name,duration,price,currency,req.body.active===false?0:1,Number(req.body.sort_order||Date.now())); res.status(201).json(db.prepare('SELECT * FROM price_options WHERE id=?').get(info.lastInsertRowid)); });
app.put('/api/admin/prices/:id', requireAdmin, (req,res)=>{ if(req.params.id==='reorder'){const ids=Array.isArray(req.body.ids)?req.body.ids:[];const update=db.prepare('UPDATE price_options SET sort_order=? WHERE id=?');db.transaction(()=>ids.forEach((id,index)=>update.run(index+1,Number(id))))();return res.json({ok:true});} const current=db.prepare('SELECT * FROM price_options WHERE id=?').get(req.params.id); if(!current)return res.status(404).json({error:'Price option not found.'}); const v={...current,...req.body}; db.prepare('UPDATE price_options SET category_id=?,name=?,duration_minutes=?,price=?,currency=?,active=?,sort_order=? WHERE id=?').run(Number(v.category_id),String(v.name||''),Number(v.duration_minutes),Number(v.price),String(v.currency||'INR').slice(0,8),v.active?1:0,Number(v.sort_order||0),current.id); res.json(db.prepare('SELECT * FROM price_options WHERE id=?').get(current.id)); });
app.delete('/api/admin/prices/:id', requireAdmin, (req,res)=>{db.prepare('DELETE FROM price_options WHERE id=?').run(req.params.id);res.json({ok:true})});
app.put('/api/admin/prices/reorder', requireAdmin, (req,res)=>{const ids=Array.isArray(req.body.ids)?req.body.ids:[];const update=db.prepare('UPDATE price_options SET sort_order=? WHERE id=?');db.transaction(()=>ids.forEach((id,index)=>update.run(index+1,Number(id))))();res.json({ok:true})});

app.get('/api/admin/platforms', requireAdmin, (_req,res)=>res.json(db.prepare('SELECT p.*,c.name category_name FROM platforms p JOIN booking_categories c ON c.id=p.category_id ORDER BY p.category_id,p.sort_order,p.id').all()));
app.post('/api/admin/platforms', requireAdmin, (req,res)=>{const categoryId=Number(req.body.category_id),name=String(req.body.name||'').trim(),url=String(req.body.url||'').trim();if(!categoryId||!name)return res.status(400).json({error:'Category and platform name are required.'});if(url&&!/^https?:\/\//i.test(url))return res.status(400).json({error:'Platform URL must start with http:// or https://.'});const info=db.prepare('INSERT INTO platforms (category_id,name,url,icon,description,active,sort_order) VALUES (?,?,?,?,?,?,?)').run(categoryId,name,url,String(req.body.icon||''),String(req.body.description||''),req.body.active===false?0:1,Number(req.body.sort_order||Date.now()));res.status(201).json(db.prepare('SELECT * FROM platforms WHERE id=?').get(info.lastInsertRowid));});
app.put('/api/admin/platforms/:id', requireAdmin, (req,res)=>{if(req.params.id==='reorder'){const ids=Array.isArray(req.body.ids)?req.body.ids:[];const update=db.prepare('UPDATE platforms SET sort_order=? WHERE id=?');db.transaction(()=>ids.forEach((id,index)=>update.run(index+1,Number(id))))();return res.json({ok:true});}const current=db.prepare('SELECT * FROM platforms WHERE id=?').get(req.params.id);if(!current)return res.status(404).json({error:'Platform not found.'});const v={...current,...req.body};const url=String(v.url||'').trim();if(url&&!/^https?:\/\//i.test(url))return res.status(400).json({error:'Platform URL must start with http:// or https://.'});db.prepare('UPDATE platforms SET category_id=?,name=?,url=?,icon=?,description=?,active=?,sort_order=? WHERE id=?').run(Number(v.category_id),String(v.name||''),url,String(v.icon||''),String(v.description||''),v.active?1:0,Number(v.sort_order||0),current.id);res.json(db.prepare('SELECT * FROM platforms WHERE id=?').get(current.id));});
app.delete('/api/admin/platforms/:id', requireAdmin, (req,res)=>{db.prepare('DELETE FROM platforms WHERE id=?').run(req.params.id);res.json({ok:true})});
app.put('/api/admin/platforms/reorder', requireAdmin, (req,res)=>{const ids=Array.isArray(req.body.ids)?req.body.ids:[];const update=db.prepare('UPDATE platforms SET sort_order=? WHERE id=?');db.transaction(()=>ids.forEach((id,index)=>update.run(index+1,Number(id))))();res.json({ok:true})});

app.get('/api/admin/social-links', requireAdmin, (_req,res)=>res.json(db.prepare('SELECT * FROM social_links ORDER BY sort_order,id').all()));
app.post('/api/admin/social-links', requireAdmin, (req,res)=>{const name=String(req.body.name||'').trim(),url=String(req.body.url||'').trim();if(!name||!/^https?:\/\//i.test(url))return res.status(400).json({error:'Name and a valid URL are required.'});const info=db.prepare('INSERT INTO social_links (name,url,icon,active,sort_order) VALUES (?,?,?,?,?)').run(name,url,String(req.body.icon||''),req.body.active===false?0:1,Number(req.body.sort_order||Date.now()));res.status(201).json(db.prepare('SELECT * FROM social_links WHERE id=?').get(info.lastInsertRowid));});
app.put('/api/admin/social-links/:id', requireAdmin, (req,res)=>{const current=db.prepare('SELECT * FROM social_links WHERE id=?').get(req.params.id);if(!current)return res.status(404).json({error:'Link not found.'});const v={...current,...req.body};const url=String(v.url||'').trim();if(!String(v.name||'').trim()||!/^https?:\/\//i.test(url))return res.status(400).json({error:'Name and a valid URL are required.'});db.prepare('UPDATE social_links SET name=?,url=?,icon=?,active=?,sort_order=? WHERE id=?').run(String(v.name),url,String(v.icon||''),v.active?1:0,Number(v.sort_order||0),current.id);res.json(db.prepare('SELECT * FROM social_links WHERE id=?').get(current.id));});
app.delete('/api/admin/social-links/:id', requireAdmin, (req,res)=>{db.prepare('DELETE FROM social_links WHERE id=?').run(req.params.id);res.json({ok:true})});
app.get('/api/admin/video-platforms', requireAdmin, (_req,res)=>res.json(db.prepare('SELECT * FROM video_platforms ORDER BY display_order,id').all().map(row=>({...row,enabled:Boolean(row.enabled)}))));
app.post('/api/admin/video-platforms', requireAdmin, (req,res)=>{const name=String(req.body.name||'').trim(),url=String(req.body.url||'').trim();if(!name)return res.status(400).json({error:'Platform name is required.'});if(url&&!/^https?:\/\//i.test(url))return res.status(400).json({error:'Platform URL must start with http:// or https://.'});const info=db.prepare('INSERT INTO video_platforms (name,url,logo,description,button_label,enabled,display_order) VALUES (?,?,?,?,?,?,?)').run(name,url,String(req.body.logo||''),String(req.body.description||''),String(req.body.button_label||'Visit Platform'),req.body.enabled===false?0:1,Number(req.body.display_order||Date.now()));res.status(201).json(db.prepare('SELECT * FROM video_platforms WHERE id=?').get(info.lastInsertRowid));});
app.put('/api/admin/video-platforms/:id', requireAdmin, (req,res)=>{if(req.params.id==='reorder'){const ids=Array.isArray(req.body.ids)?req.body.ids:[];const update=db.prepare('UPDATE video_platforms SET display_order=? WHERE id=?');db.transaction(()=>ids.forEach((id,index)=>update.run(index+1,Number(id))))();return res.json({ok:true});}const current=db.prepare('SELECT * FROM video_platforms WHERE id=?').get(req.params.id);if(!current)return res.status(404).json({error:'Video platform not found.'});const v={...current,...req.body},name=String(v.name||'').trim(),url=String(v.url||'').trim();if(!name)return res.status(400).json({error:'Platform name is required.'});if(url&&!/^https?:\/\//i.test(url))return res.status(400).json({error:'Platform URL must start with http:// or https://.'});db.prepare('UPDATE video_platforms SET name=?,url=?,logo=?,description=?,button_label=?,enabled=?,display_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name,url,String(v.logo||''),String(v.description||''),String(v.button_label||'Visit Platform'),v.enabled?1:0,Number(v.display_order||0),current.id);res.json(db.prepare('SELECT * FROM video_platforms WHERE id=?').get(current.id));});
app.delete('/api/admin/video-platforms/:id', requireAdmin, (req,res)=>{db.prepare('DELETE FROM video_platforms WHERE id=?').run(req.params.id);res.json({ok:true})});

app.get('/api/admin/stats', requireAdmin, (_req,res) => {
  const one=(sql)=>db.prepare(sql).get().n;
  res.json({
    totalBookings:one('SELECT COUNT(*) n FROM bookings'), pending:one("SELECT COUNT(*) n FROM bookings WHERE status='PENDING'"), approved:one("SELECT COUNT(*) n FROM bookings WHERE status='APPROVED'"), rejected:one("SELECT COUNT(*) n FROM bookings WHERE status='REJECTED'"),
    today:one("SELECT COUNT(*) n FROM bookings WHERE appointment_date=date('now','localtime')"), upcoming:one("SELECT COUNT(*) n FROM bookings WHERE appointment_date>=date('now','localtime') AND status='APPROVED'"), paymentPending:one("SELECT COUNT(*) n FROM bookings WHERE payment_status='PENDING_VERIFICATION'")
  });
});
app.get('/api/admin/bookings', requireAdmin, (_req,res) => res.json(db.prepare(`SELECT b.*,COALESCE(b.customer_name,u.name) customer_name,u.email customer_email,u.phone customer_phone,s.name service_name,COALESCE(p.price,s.price) price,COALESCE(p.currency,b.currency,s.currency,'INR') currency,s.duration_minutes,c.name category_name,p.name price_option_name,pl.name platform_name FROM bookings b JOIN users u ON u.id=b.user_id JOIN services s ON s.id=b.service_id LEFT JOIN booking_categories c ON c.id=b.category_id LEFT JOIN price_options p ON p.id=b.price_option_id LEFT JOIN platforms pl ON pl.id=b.platform_id ORDER BY b.id DESC`).all()));
app.patch('/api/admin/bookings/:id', requireAdmin, async (req,res) => {
  const id=Number(req.params.id), action=String(req.body.action||'').toUpperCase(), reason=String(req.body.reason||'').slice(0,500), newDate=String(req.body.appointment_date||''), newTime=String(req.body.appointment_time||''), location=String(req.body.location||'').slice(0,300);
  const booking=db.prepare('SELECT * FROM bookings WHERE id=?').get(id); if(!booking) return res.status(404).json({error:'Booking not found.'});
  const service=db.prepare('SELECT * FROM services WHERE id=?').get(booking.service_id); const customer=db.prepare('SELECT * FROM users WHERE id=?').get(booking.user_id);
  try {
    if(action==='APPROVE') {
      let eventId=booking.google_event_id, meetUrl=booking.google_meet_url;
      const g=await googleSvc.createCalendarEvent({booking:{...booking,location:location||booking.location},service,customer});
      if(!g.skipped){eventId=g.eventId; meetUrl=g.meetUrl;}
      db.prepare(`UPDATE bookings SET status='APPROVED',location=?,google_event_id=?,google_meet_url=?,rejection_reason=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(location||booking.location,eventId,meetUrl,id);
      notify(customer.id,'Booking approved',`${booking.booking_code} is approved.${meetUrl ? ' Your Google Meet link is available in My Bookings.' : ''}`);
      const updated=db.prepare('SELECT * FROM bookings WHERE id=?').get(id);
      await Promise.allSettled([
        googleSvc.sendEmail({to:customer.email,subject:`Booking approved — ${booking.booking_code}`,text:`Your ${service.name} booking is approved for ${booking.appointment_date} at ${booking.appointment_time}.${meetUrl ? `\nGoogle Meet: ${meetUrl}` : ''}`}),
        googleSvc.updateBookingInSheet({booking:updated})
      ]);
    } else if(action==='REJECT') {
      db.prepare(`UPDATE bookings SET status='REJECTED',rejection_reason=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(reason||'Please try to book another date and time.',id);
      notify(customer.id,'Booking rejected',`${booking.booking_code}: ${reason||'Please try to book another date and time.'}`);
      const rejected = db.prepare('SELECT * FROM bookings WHERE id=?').get(id);
      await Promise.allSettled([
        googleSvc.sendEmail({to:customer.email,subject:`Booking update — ${booking.booking_code}`,text:`Your booking could not be approved. ${reason||'Please try to book another date and time.'}`}),
        googleSvc.updateBookingInSheet({booking:rejected})
      ]);
    } else if(action==='RESCHEDULE') {
      if(!/^\d{4}-\d{2}-\d{2}$/.test(newDate) || !/^\d{2}:\d{2}$/.test(newTime)) return res.status(400).json({error:'New date and time are required.'});
      const conflict = db.prepare(`SELECT id FROM bookings WHERE appointment_date=? AND appointment_time=? AND status IN ('PENDING','APPROVED') AND category_id=? AND id<>?`).get(newDate,newTime,booking.category_id,id);
      if (conflict) return res.status(409).json({error:'That time slot is already unavailable.'});
      db.prepare(`UPDATE bookings SET appointment_date=?,appointment_time=?,status='PENDING',updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(newDate,newTime,id);
      notify(customer.id,'Booking rescheduled',`${booking.booking_code} moved to ${newDate} at ${newTime} and is pending approval.`);
      await googleSvc.updateBookingInSheet({booking:db.prepare('SELECT * FROM bookings WHERE id=?').get(id)}).catch(() => {});
    } else if(action==='CANCEL') {
      db.prepare(`UPDATE bookings SET status='CANCELLED',updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(id);
      notify(customer.id,'Booking cancelled',`${booking.booking_code} was cancelled by admin.`);
      await googleSvc.updateBookingInSheet({booking:db.prepare('SELECT * FROM bookings WHERE id=?').get(id)}).catch(() => {});
    } else return res.status(400).json({error:'Unsupported action.'});
    res.json({booking:db.prepare('SELECT * FROM bookings WHERE id=?').get(id)});
  } catch(e) { console.error(e); res.status(500).json({error:'Could not update booking. Check Google configuration/logs if integrations are enabled.'}); }
});

app.get('/api/admin/services', requireAdmin, (_req,res)=>res.json(db.prepare('SELECT * FROM services ORDER BY id').all().map(publicService)));
app.post('/api/admin/services', requireAdmin, (req,res)=>{
  const name=String(req.body.name||'').trim(),description=String(req.body.description||'').trim(),type=String(req.body.appointment_type||'Online Service').trim(),duration=Number(req.body.duration_minutes||30),price=Number(req.body.price||0),image=String(req.body.image||'').trim();
  if(!name||!description||duration<5||price<0) return res.status(400).json({error:'Complete all service fields.'});
  const info=db.prepare('INSERT INTO services (name,description,appointment_type,duration_minutes,price,image) VALUES (?,?,?,?,?,?)').run(name,description,type,duration,price,image);
  res.json(db.prepare('SELECT * FROM services WHERE id=?').get(info.lastInsertRowid));
});
app.patch('/api/admin/services/:id', requireAdmin, (req,res)=>{
  const current=db.prepare('SELECT * FROM services WHERE id=?').get(req.params.id); if(!current)return res.status(404).json({error:'Service not found.'});
  const v={...current,...req.body};
  db.prepare('UPDATE services SET name=?,description=?,appointment_type=?,duration_minutes=?,price=?,image=?,active=? WHERE id=?').run(String(v.name),String(v.description),String(v.appointment_type),Number(v.duration_minutes),Number(v.price),String(v.image||''),v.active?1:0,current.id);
  res.json(db.prepare('SELECT * FROM services WHERE id=?').get(current.id));
});
app.put('/api/admin/services/:id', requireAdmin, (req,res)=>{
  const current=db.prepare('SELECT * FROM services WHERE id=?').get(req.params.id); if(!current)return res.status(404).json({error:'Service not found.'}); const v={...current,...req.body};
  db.prepare('UPDATE services SET name=?,description=?,appointment_type=?,duration_minutes=?,price=?,currency=?,image=?,active=?,sort_order=? WHERE id=?').run(String(v.name||''),String(v.description||''),String(v.appointment_type||v.name||''),Number(v.duration_minutes||0),Number(v.price||0),String(v.currency||'INR'),String(v.image||''),v.active?1:0,Number(v.sort_order||0),current.id); res.json(db.prepare('SELECT * FROM services WHERE id=?').get(current.id));
});
app.delete('/api/admin/services/:id', requireAdmin, (req,res)=>{if(db.prepare('SELECT id FROM bookings WHERE service_id=? LIMIT 1').get(req.params.id))return res.status(409).json({error:'This service has bookings and cannot be deleted. Disable it instead.'});db.prepare('DELETE FROM services WHERE id=?').run(req.params.id);res.json({ok:true})});

app.get('/api/admin/payments', requireAdmin, (_req,res)=>res.json(db.prepare(`SELECT p.*,b.booking_code,u.name customer_name,u.email customer_email FROM payments p JOIN bookings b ON b.id=p.booking_id JOIN users u ON u.id=p.user_id ORDER BY p.id DESC`).all()));
app.patch('/api/admin/payments/:id', requireAdmin, (req,res)=>{
  const status=String(req.body.status||'').toUpperCase(); if(!['APPROVED','REJECTED'].includes(status))return res.status(400).json({error:'Invalid status.'});
  const p=db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id); if(!p)return res.status(404).json({error:'Payment not found.'});
  db.prepare('UPDATE payments SET status=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=?').run(status,p.id);
  db.prepare('UPDATE bookings SET payment_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status,p.booking_id);
  const b=db.prepare('SELECT booking_code FROM bookings WHERE id=?').get(p.booking_id);
  notify(p.user_id,`Payment ${status.toLowerCase()}`,`${b.booking_code} payment status: ${status}.`);
  res.json({ok:true});
});

app.get('/api/admin/live', requireAdmin, (_req,res)=>{const r=db.prepare('SELECT * FROM live_settings WHERE id=1').get();res.json({...r,enabled:Boolean(r.enabled)});});
app.post('/api/admin/live', requireAdmin, (req,res)=>{req.body.enabled=req.body.enabled; return updateLive(req,res);});
app.put('/api/admin/live', requireAdmin, (req,res)=>{
  return updateLive(req,res);
});
function updateLive(req,res) {
  const title=String(req.body.title||'').slice(0,120),description=String(req.body.description||'').slice(0,500),url=String(req.body.live_url||'').trim(),enabled=req.body.enabled?1:0,thumbnail=String(req.body.thumbnail_path||'').slice(0,300),startDate=String(req.body.start_date||'').slice(0,10),startTime=String(req.body.start_time||'').slice(0,5),endDate=String(req.body.end_date||'').slice(0,10),endTime=String(req.body.end_time||'').slice(0,5);
  if(enabled && !/^https?:\/\//i.test(url)) return res.status(400).json({error:'A valid Live URL is required before enabling.'});
  db.prepare('UPDATE live_settings SET title=?,description=?,live_url=?,thumbnail_path=?,start_date=?,start_time=?,end_date=?,end_time=?,enabled=?,updated_at=CURRENT_TIMESTAMP WHERE id=1').run(title,description,url,thumbnail,startDate,startTime,endDate,endTime,enabled);
  res.json({ok:true});
}

app.get('/api/admin/payment-settings', requireAdmin, (_req,res)=>res.json(mapPaymentSettings(db.prepare('SELECT * FROM payment_settings WHERE id=1').get())));
app.put('/api/admin/payment-settings', requireAdmin, (req,res)=>{
  const upi=String(req.body.upi_id||'').trim().slice(0,120),instructions=String(req.body.instructions||'').slice(0,1000),paymentLink=String(req.body.payment_link||'').trim().slice(0,500),enabled=req.body.enabled?1:0;
  if (paymentLink && !/^https?:\/\//i.test(paymentLink)) return res.status(400).json({error:'Payment link must start with http:// or https://.'});
  db.prepare('UPDATE payment_settings SET upi_id=?,instructions=?,payment_link=?,enabled=?,updated_at=CURRENT_TIMESTAMP WHERE id=1').run(upi,instructions,paymentLink,enabled);
  res.json({ok:true});
});
app.post('/api/admin/payment-qr', requireAdmin, upload.single('qr'), (req,res)=>{
  if(!req.file)return res.status(400).json({error:'Select an image file.'});
  const old=db.prepare('SELECT qr_path FROM payment_settings WHERE id=1').get()?.qr_path;
  const qrPath=`/uploads/${req.file.filename}`;
  db.prepare('UPDATE payment_settings SET qr_path=?,updated_at=CURRENT_TIMESTAMP WHERE id=1').run(qrPath);
  if(old && old.startsWith('/uploads/')) { try{fs.unlinkSync(path.join(publicDir,old));}catch{} }
  res.json({qr_path:qrPath});
});
app.delete('/api/admin/payment-qr', requireAdmin, (_req,res)=>{
  const old=db.prepare('SELECT qr_path FROM payment_settings WHERE id=1').get()?.qr_path;
  db.prepare('UPDATE payment_settings SET qr_path=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=1').run();
  if(old && old.startsWith('/uploads/')) { try{fs.unlinkSync(path.join(publicDir,old));}catch{} }
  res.json({ok:true});
});

app.get('/api/admin/customers', requireAdmin, (_req,res)=>res.json(db.prepare(`SELECT u.id,u.name,u.email,u.phone,u.created_at,COUNT(b.id) bookings FROM users u LEFT JOIN bookings b ON b.user_id=u.id WHERE u.role='customer' GROUP BY u.id ORDER BY u.id DESC`).all()));
app.get('/api/admin/messages', requireAdmin, (_req,res)=>res.json(db.prepare('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 100').all()));
app.patch('/api/admin/messages/:id', requireAdmin, (req,res)=>{const action=String(req.body.action||'').toUpperCase();if(!['READ','ARCHIVE','UNARCHIVE'].includes(action))return res.status(400).json({error:'Unsupported message action.'});const column=action==='READ'?'read_at':'archived_at';const value=action==='UNARCHIVE'?null:new Date().toISOString();db.prepare(`UPDATE contact_messages SET ${column}=? WHERE id=?`).run(value,req.params.id);res.json({ok:true});});
app.delete('/api/admin/messages/:id', requireAdmin, (req,res)=>{db.prepare('DELETE FROM contact_messages WHERE id=?').run(req.params.id);res.json({ok:true});});
app.get('/api/admin/gallery', requireAdmin, (_req,res)=>res.json(db.prepare('SELECT * FROM gallery_items ORDER BY display_order,id').all().map(row=>({...row,enabled:Boolean(row.enabled)}))));
app.post('/api/admin/gallery', requireAdmin, (req,res)=>{const title=String(req.body.title||'').trim(),image=String(req.body.image_path||'').trim();if(!title||!image)return res.status(400).json({error:'Title and image path are required.'});const info=db.prepare('INSERT INTO gallery_items (title,description,image_path,category,enabled,display_order) VALUES (?,?,?,?,?,?)').run(title,String(req.body.description||''),image,String(req.body.category||''),req.body.enabled===false?0:1,Number(req.body.display_order||Date.now()));res.status(201).json(db.prepare('SELECT * FROM gallery_items WHERE id=?').get(info.lastInsertRowid));});
app.put('/api/admin/gallery/:id', requireAdmin, (req,res)=>{const current=db.prepare('SELECT * FROM gallery_items WHERE id=?').get(req.params.id);if(!current)return res.status(404).json({error:'Gallery item not found.'});const v={...current,...req.body};db.prepare('UPDATE gallery_items SET title=?,description=?,image_path=?,category=?,enabled=?,display_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(String(v.title||''),String(v.description||''),String(v.image_path||''),String(v.category||''),v.enabled?1:0,Number(v.display_order||0),current.id);res.json(db.prepare('SELECT * FROM gallery_items WHERE id=?').get(current.id));});
app.delete('/api/admin/gallery/:id', requireAdmin, (req,res)=>{db.prepare('DELETE FROM gallery_items WHERE id=?').run(req.params.id);res.json({ok:true});});
app.get('/api/admin/legal', requireAdmin, (_req,res)=>res.json(db.prepare('SELECT * FROM legal_pages ORDER BY slug').all().map(row=>({...row,published:Boolean(row.published)}))));
app.put('/api/admin/legal/:slug', requireAdmin, (req,res)=>{const slug=String(req.params.slug||'').trim();if(!legalSlugs.has(slug))return res.status(400).json({error:'Unsupported legal page.'});const title=String(req.body.title||'').trim();if(!title)return res.status(400).json({error:'Title is required.'});db.prepare('INSERT INTO legal_pages (slug,title,content,effective_date,published) VALUES (?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title,content=excluded.content,effective_date=excluded.effective_date,published=excluded.published,updated_at=CURRENT_TIMESTAMP').run(slug,title,String(req.body.content||''),String(req.body.effective_date||''),req.body.published?1:0);res.json(db.prepare('SELECT * FROM legal_pages WHERE slug=?').get(slug));});
app.get('/api/admin/integrations', requireAdmin, (_req,res)=>res.json({
  googleSignIn:Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET),
  googleCalendar:googleSvc.configured(), googleMeet:googleSvc.configured(), googleSheets:Boolean(googleSvc.configured()&&process.env.GOOGLE_SHEET_ID), gmail:Boolean(googleSvc.configured()&&process.env.GMAIL_USER)
}));

app.use((err,req,res,next)=>{ console.error(err); if(err instanceof multer.MulterError)return res.status(400).json({error:err.message}); res.status(500).json({error:'Unexpected server error.'}); });

app.listen(PORT,()=>console.log(`Premium site running at ${APP_URL}`));
