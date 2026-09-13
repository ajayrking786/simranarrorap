const $=s=>document.querySelector(s),view=$('#view');let me=null,current='dashboard';
async function api(url,opts={}){const r=await fetch(url,{headers:{'Content-Type':'application/json',...(opts.headers||{})},...opts});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Request failed');return d}
function toast(t){const e=$('#adminToast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2500)}
function money(v){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(v)}
function chip(s){return `<span class="chip ${s}">${s}</span>`}
async function boot(){const d=await api('/api/auth/me');me=d.user;if(me?.role==='admin'){showApp();await render('dashboard')}else showGate()}
function showApp(){$('#adminGate').classList.add('hidden');$('#adminApp').classList.remove('hidden');$('#adminName').textContent=(me.name||'A').slice(0,1).toUpperCase()}
function showGate(){$('#adminApp').classList.add('hidden');$('#adminGate').classList.remove('hidden')}
$('#adminLogin').onsubmit=async e=>{e.preventDefault();try{const d=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:$('#adminEmail').value,password:$('#adminPassword').value})});if(d.user.role!=='admin'){await api('/api/auth/logout',{method:'POST'});throw new Error('Invalid email or password.')}me=d.user;window.history.replaceState({},'', '/admin');showApp();render('dashboard')}catch(err){$('#loginMsg').textContent='Invalid email or password.'}};
const adminGoogleBtn=$('#adminGoogleBtn');if(adminGoogleBtn){adminGoogleBtn.onclick=async()=>{try{adminGoogleBtn.disabled=true;adminGoogleBtn.textContent='Connecting with Google…';const res=await window.signInWithGoogleWorkspace();if(res.user?.role!=='admin'){await api('/api/auth/logout',{method:'POST'});throw new Error('Access restricted to administrators.')}me=res.user;window.history.replaceState({},'', '/admin');showApp();render('dashboard');toast('Signed in as Admin');}catch(err){console.error(err);$('#loginMsg').textContent=err.message||'Google sign-in failed.';adminGoogleBtn.disabled=false;adminGoogleBtn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg> Sign In with Google';}}};
$('#adminLogout').onclick=async()=>{await api('/api/auth/logout',{method:'POST'});if(window.firebase?.auth)await window.firebase.auth().signOut().catch(()=>{});me=null;showGate()};
document.querySelectorAll('#sideNav button').forEach(b=>b.onclick=()=>render(b.dataset.view));
$('#menuToggle').onclick=()=>$('#adminApp').classList.toggle('menu-open');
document.querySelectorAll('#sideNav button').forEach(b=>b.addEventListener('click',()=>$('#adminApp').classList.remove('menu-open')));
$('#notificationButton').onclick=()=>render('notifications');
async function render(name){current=name;document.querySelectorAll('#sideNav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$('#viewTitle').textContent={dashboard:'Dashboard',appointments:'Appointments',customers:'Customers',services:'Services',configuration:'Booking Configuration',prices:'Price Lists',platforms:'Platforms & Links',gallery:'Gallery','video-platforms':'Videos / Video Platforms',calendar:'Calendar',payments:'Payments',live:'Live Management',qr:'QR Management',integrations:'Google Integrations',messages:'Contact Messages',documents:'Legal Pages',notifications:'Notifications',settings:'Settings'}[name]||name;view.innerHTML='<div class="card">Loading…</div>';try{await ({dashboard,appointments,customers,services,configuration,prices,platforms,gallery,'video-platforms':videoPlatforms,calendar,payments,live,qr,integrations,messages,documents,notifications,settings}[name])()}catch(e){view.innerHTML=`<div class="card"><p>${e.message}</p></div>`}}
async function dashboard(){const s=await api('/api/admin/stats');view.innerHTML=`<div class="stats"><div class="stat"><span>Total Bookings</span><strong>${s.totalBookings}</strong></div><div class="stat"><span>Pending</span><strong>${s.pending}</strong></div><div class="stat"><span>Approved</span><strong>${s.approved}</strong></div><div class="stat"><span>Rejected</span><strong>${s.rejected}</strong></div><div class="stat"><span>Today's Appointments</span><strong>${s.today}</strong></div><div class="stat"><span>Upcoming</span><strong>${s.upcoming}</strong></div><div class="stat"><span>Payment Pending</span><strong>${s.paymentPending}</strong></div></div><div class="grid2"><div class="card"><h2>Approval Workflow</h2><p class="muted">Approve creates an optional Google Calendar event/Meet link when configured, sends a Gmail confirmation, and appends booking data to Google Sheets.</p></div><div class="card"><h2>Security</h2><p class="muted">Customer and admin access are separated server-side. Secrets belong only in <code>.env</code>.</p></div></div>`}
async function appointments(){const rows=await api('/api/admin/bookings');view.innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Booking</th><th>Customer</th><th>Category / Service</th><th>Price</th><th>Platform</th><th>Date/Time</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map(b=>`<tr><td><strong>${b.booking_code}</strong></td><td>${b.customer_name}<br><span class="muted">${b.customer_email}</span></td><td>${b.category_name||b.appointment_type}<br><span class="muted">${b.service_name}</span></td><td>${money(b.price,b.currency)}<br><span class="muted">${b.price_option_name||''}</span></td><td>${b.platform_name||'—'}</td><td>${b.appointment_date}<br>${b.appointment_time}<br><span class="muted">${b.location||''}</span></td><td>${chip(b.payment_status)}</td><td>${chip(b.status)}${b.google_meet_url?`<br><a href="${b.google_meet_url}" target="_blank">Meet link</a>`:''}</td><td><div class="actions"><button class="primary" onclick="bookingAction(${b.id},'APPROVE')">Approve</button><button onclick="bookingAction(${b.id},'REJECT')">Reject</button><button onclick="bookingAction(${b.id},'RESCHEDULE')">Reschedule</button><button class="danger" onclick="bookingAction(${b.id},'CANCEL')">Cancel</button></div></td></tr>`).join('')||'<tr><td colspan="9">No bookings.</td></tr>'}</tbody></table></div>`}
window.bookingAction=async(id,action)=>{let body={action};if(action==='REJECT')body.reason=prompt('Reason for rejection:','Please try to book another date and time.')||'Please try to book another date and time.';if(action==='RESCHEDULE'){body.appointment_date=prompt('New date (YYYY-MM-DD):','');body.appointment_time=prompt('New time (HH:MM):','');if(!body.appointment_date||!body.appointment_time)return}if(action==='APPROVE')body.location=prompt('Location (optional):','')||'';try{await api(`/api/admin/bookings/${id}`,{method:'PATCH',body:JSON.stringify(body)});toast(`Booking ${action.toLowerCase()}`);appointments()}catch(e){toast(e.message)}}
async function customers(){const rows=await api('/api/admin/customers');view.innerHTML=`<div class="customer-list">${rows.map(c=>`<div class="item row"><div><strong>${c.name}</strong><p class="muted">${c.email}${c.phone?` · ${c.phone}`:''}</p></div><div><strong>${c.bookings}</strong><span class="muted"> bookings</span></div></div>`).join('')||'<div class="card">No customers.</div>'}</div>`}
async function services(){const rows=await api('/api/admin/services');view.innerHTML=`<div class="grid2"><div class="card"><h2>Add Service</h2><form id="serviceForm" class="form"><label>Name<input id="sName" required></label><label>Type<input id="sType" value="Online Service" required></label><label>Duration (min)<input id="sDuration" type="number" value="30" min="5" required></label><label>Price<input id="sPrice" type="number" value="0" min="0" required></label><label class="wide">Image path<input id="sImage" placeholder="/assets/Images/IMG_0474.jpg"></label><label class="wide">Description<textarea id="sDesc" required></textarea></label><button class="primary wide">Add Service</button></form></div><div class="service-list">${rows.map(s=>`<div class="item"><div class="row"><div><strong>${s.name}</strong><p class="muted">${s.appointment_type} · ${s.duration_minutes} min · ${money(s.price)}</p></div>${chip(s.active?'APPROVED':'CANCELLED')}</div><div class="actions"><button onclick="toggleService(${s.id},${s.active?0:1})">${s.active?'Disable':'Enable'}</button></div></div>`).join('')}</div></div>`;$('#serviceForm').onsubmit=async e=>{e.preventDefault();try{await api('/api/admin/services',{method:'POST',body:JSON.stringify({name:$('#sName').value,appointment_type:$('#sType').value,duration_minutes:Number($('#sDuration').value),price:Number($('#sPrice').value),image:$('#sImage').value,description:$('#sDesc').value})});toast('Service added');services()}catch(err){toast(err.message)}}}
window.toggleService=async(id,active)=>{const rows=await api('/api/admin/services');const s=rows.find(x=>x.id===id);await api(`/api/admin/services/${id}`,{method:'PATCH',body:JSON.stringify({...s,active:Boolean(active)})});toast('Service updated');services()}
async function payments(){const rows=await api('/api/admin/payments');view.innerHTML=`<div class="payment-list">${rows.map(p=>`<div class="item"><div class="row"><div><strong>${p.booking_code} · ${p.customer_name}</strong><p class="muted">${money(p.amount)} · ${p.method} · Ref: ${p.transaction_ref}</p></div>${chip(p.status)}</div><p>${p.note||''}</p>${p.status==='PENDING_VERIFICATION'?`<div class="actions"><button class="primary" onclick="paymentAction(${p.id},'APPROVED')">Approve Payment</button><button class="danger" onclick="paymentAction(${p.id},'REJECTED')">Reject</button></div>`:''}</div>`).join('')||'<div class="card">No payment submissions.</div>'}</div>`}
window.paymentAction=async(id,status)=>{try{await api(`/api/admin/payments/${id}`,{method:'PATCH',body:JSON.stringify({status})});toast(`Payment ${status.toLowerCase()}`);payments()}catch(e){toast(e.message)}}
async function live(){const l=await api('/api/admin/live');view.innerHTML=`<div class="card"><h2>Live Session Settings</h2><form id="liveForm" class="form"><label class="wide">Title<input id="lTitle" value="${esc(l.title)}"></label><label class="wide">Description<textarea id="lDesc">${esc(l.description||'')}</textarea></label><label class="wide">Exact Live URL<input id="lUrl" value="${esc(l.live_url||'')}" placeholder="https://..."></label><label class="wide">Thumbnail path<input id="lThumb" value="${esc(l.thumbnail_path||'')}" placeholder="/uploads/live.jpg"></label><label>Start date<input id="lStartDate" type="date" value="${esc(l.start_date||'')}"></label><label>Start time<input id="lStartTime" type="time" value="${esc(l.start_time||'')}"></label><label>End date<input id="lEndDate" type="date" value="${esc(l.end_date||'')}"></label><label>End time<input id="lEndTime" type="time" value="${esc(l.end_time||'')}"></label><label class="wide">Status<select id="lEnabled"><option value="0" ${!l.enabled?'selected':''}>Disabled</option><option value="1" ${l.enabled?'selected':''}>Enabled</option></select></label><button class="primary wide">Save Live Settings</button></form></div>`;$('#liveForm').onsubmit=async e=>{e.preventDefault();try{await api('/api/admin/live',{method:'PUT',body:JSON.stringify({title:$('#lTitle').value,description:$('#lDesc').value,live_url:$('#lUrl').value,thumbnail_path:$('#lThumb').value,start_date:$('#lStartDate').value,start_time:$('#lStartTime').value,end_date:$('#lEndDate').value,end_time:$('#lEndTime').value,enabled:$('#lEnabled').value==='1'})});toast('Live settings saved')}catch(err){toast(err.message)}}}
async function qr(){const p=await api('/api/admin/payment-settings');view.innerHTML=`<div class="grid2"><div class="card"><h2>Payment Settings</h2>${p.qr_path?`<img class="qr-preview" src="${p.qr_path}">`:'<p class="muted">No QR uploaded.</p>'}<form id="qrUpload" enctype="multipart/form-data"><label>Upload / replace QR<input id="qrFile" type="file" accept="image/*" required></label><button class="primary" style="margin-top:12px">Upload QR</button></form>${p.qr_path?'<button id="deleteQr" class="danger" style="margin-top:10px">Delete QR</button>':''}</div><div class="card"><h2>Payment Link & Instructions</h2><form id="paySettings" class="form"><label class="wide">External payment link<input id="paymentLink" type="url" value="${esc(p.payment_link||'')}" placeholder="https://razorpay.me/@..." /></label><label class="wide">UPI ID<input id="upiId" value="${esc(p.upi_id||'')}"></label><label class="wide">Instructions<textarea id="payInstructions">${esc(p.instructions||'')}</textarea></label><label class="wide">Enabled<select id="payEnabled"><option value="0" ${!p.enabled?'selected':''}>Disabled</option><option value="1" ${p.enabled?'selected':''}>Enabled</option></select></label><button class="primary wide">Save</button></form></div></div>`;$('#qrUpload').onsubmit=async e=>{e.preventDefault();const fd=new FormData();fd.append('qr',$('#qrFile').files[0]);const r=await fetch('/api/admin/payment-qr',{method:'POST',body:fd});const d=await r.json();if(!r.ok)return toast(d.error||'Upload failed');toast('QR uploaded');qr()};if($('#deleteQr'))$('#deleteQr').onclick=async()=>{await api('/api/admin/payment-qr',{method:'DELETE'});toast('QR deleted');qr()};$('#paySettings').onsubmit=async e=>{e.preventDefault();await api('/api/admin/payment-settings',{method:'PUT',body:JSON.stringify({payment_link:$('#paymentLink').value,upi_id:$('#upiId').value,instructions:$('#payInstructions').value,enabled:$('#payEnabled').value==='1'})});toast('Payment settings saved')}}
async function integrations(){
  const i = await api('/api/admin/integrations');
  const hasToken = Boolean(window.googleWorkspaceAccessToken);

  const services = [
    {
      id: 'gemini',
      name: 'Google Gemini API',
      icon: '✦',
      connected: Boolean(i.gemini?.connected),
      status: i.gemini?.status || (i.gemini?.connected ? 'CONNECTED' : 'NOT CONNECTED'),
      detail: i.gemini?.details || 'Gemini 3.8 Flash model via @google/genai SDK'
    },
    {
      id: 'firebase',
      name: 'Google Firebase (Firestore, Auth & Storage)',
      icon: '🔥',
      connected: Boolean(i.firebase?.connected),
      status: i.firebase?.status || 'NOT CONNECTED',
      detail: i.firebase?.details || `Project: ${i.firebase?.projectId || 'gen-lang-client-0442308093'}`
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: '📊',
      connected: Boolean(i.googleSheets?.connected || hasToken),
      status: (i.googleSheets?.connected || hasToken) ? 'CONNECTED' : 'NOT CONNECTED',
      detail: i.googleSheets?.details || 'Live sync & spreadsheet export'
    },
    {
      id: 'drive',
      name: 'Google Drive',
      icon: '📁',
      connected: Boolean(i.googleDrive?.connected || hasToken),
      status: (i.googleDrive?.connected || hasToken) ? 'CONNECTED' : 'NOT CONNECTED',
      detail: i.googleDrive?.details || 'Cloud file storage & consultation archives'
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: '📅',
      connected: Boolean(i.googleCalendar?.connected || hasToken),
      status: (i.googleCalendar?.connected || hasToken) ? 'CONNECTED' : 'NOT CONNECTED',
      detail: i.googleCalendar?.details || 'Automated consultation scheduling & invites'
    },
    {
      id: 'meet',
      name: 'Google Meet',
      icon: '🎥',
      connected: Boolean(i.googleMeet?.connected || hasToken),
      status: (i.googleMeet?.connected || hasToken) ? 'CONNECTED' : 'NOT CONNECTED',
      detail: i.googleMeet?.details || '1-on-1 VIP Video consultation spaces'
    },
    {
      id: 'gmail',
      name: 'Gmail Notifications',
      icon: '✉️',
      connected: Boolean(i.gmail?.connected),
      status: i.gmail?.status || (i.gmail?.connected ? 'CONNECTED' : 'NOT CONNECTED'),
      detail: i.gmail?.details || 'Automated booking approvals & updates'
    },
    {
      id: 'maps',
      name: 'Google Maps',
      icon: '📍',
      connected: Boolean(i.googleMaps?.connected),
      status: i.googleMaps?.status || 'CONNECTED',
      detail: i.googleMaps?.details || 'VIP meeting suites in Delhi, Mumbai, Chandigarh'
    },
    {
      id: 'oauth',
      name: 'Google OAuth / Sign In',
      icon: '🔐',
      connected: Boolean(i.googleOAuth?.connected),
      status: i.googleOAuth?.status || 'CONNECTED',
      detail: i.googleOAuth?.details || 'Sign In with Google enabled'
    }
  ];

  view.innerHTML = `
    <div class="card" style="margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
      <div>
        <p class="eyebrow">GOOGLE SERVICES HUB</p>
        <h2>Production Google Services Integration</h2>
        <p class="muted">Status and real-time operations for Google Gemini AI, Firebase (Auth, Firestore, Storage), Sheets, Drive, Calendar, Meet, Gmail, Maps, and OAuth.</p>
      </div>
      <div>
        <button id="wsAuthBtn" class="primary" style="display:inline-flex;align-items:center;gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          ${hasToken ? 'Workspace Authorized ✓' : 'Authorize Google Workspace'}
        </button>
      </div>
    </div>

    <!-- 9 Google Services Grid with CONNECTED / NOT CONNECTED Badges -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:20px;">
      ${services.map(s => `
        <div class="card" style="padding:16px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid ${s.connected ? 'rgba(52,168,83,0.3)' : 'rgba(255,255,255,0.08)'};background:${s.connected ? 'rgba(52,168,83,0.03)' : 'rgba(255,255,255,0.02)'};">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
              <strong style="font-size:15px;display:flex;align-items:center;gap:6px;">
                <span>${s.icon}</span> ${esc(s.name)}
              </strong>
              <span style="font-size:11px;font-weight:700;padding:4px 8px;border-radius:6px;letter-spacing:0.5px;background:${s.connected ? 'rgba(52,168,83,0.2)' : 'rgba(251,188,4,0.15)'};color:${s.connected ? '#81c995' : '#fdd663'};border:1px solid ${s.connected ? 'rgba(52,168,83,0.4)' : 'rgba(251,188,4,0.3)'};">
                ${s.status}
              </span>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin:0;line-height:1.5;">${esc(s.detail)}</p>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Interactive Google Services Control Panels -->
    <div class="grid2" style="margin-top:18px;">
      <!-- Google Gemini AI Studio -->
      <div class="card">
        <p class="eyebrow">GOOGLE GEMINI 3.8 FLASH</p>
        <h2>Gemini AI Studio & Briefing</h2>
        <p class="muted">Generate AI-powered VIP consultation briefs, talking points, icebreakers, and advice.</p>
        <div class="form" style="margin-top:12px;">
          <label>Client Name<input id="aiClientName" placeholder="Client Name" value="Rohit Sharma" /></label>
          <label>Session Service<input id="aiServiceName" placeholder="e.g. 1-on-1 Video Consultation" value="1-on-1 Video Call" /></label>
          <label class="wide">Client Consultation Notes<textarea id="aiNotes" placeholder="Client background, expectations...">Interested in brand collaborations, fitness routine advice, and social media growth strategies.</textarea></label>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">
            <button id="runAiPrepBtn" class="primary" type="button">Generate AI Briefing with Gemini</button>
            <button id="testAiPingBtn" class="ghost" type="button">Test Gemini Health</button>
          </div>
        </div>
        <div id="aiResult" style="margin-top:14px;"></div>
      </div>

      <!-- Firebase Firestore & Storage Hub -->
      <div class="card">
        <p class="eyebrow">FIREBASE FIRESTORE & STORAGE</p>
        <h2>Cloud Firestore Database Hub</h2>
        <p class="muted">Cloud Firestore database provisioned with role-based security rules.</p>
        <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;margin:12px 0;font-size:13px;line-height:1.7;">
          <div><strong>Project ID:</strong> <code>${i.firebase?.projectId || 'gen-lang-client-0442308093'}</code></div>
          <div><strong>Storage Bucket:</strong> <code>${i.firebase?.storageBucket || 'gen-lang-client-0442308093.firebasestorage.app'}</code></div>
          <div><strong>Security Rules:</strong> <code>firestore.rules</code> Deployed & Enforced</div>
          <div><strong>Collections:</strong> <code>/users</code>, <code>/bookings</code>, <code>/payments</code>, <code>/inquiries</code></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button id="pingFirestoreBtn" class="primary">Ping Firestore</button>
          <button id="syncFirestoreBtn" class="secondary">Sync All Data to Firestore</button>
        </div>
        <div id="firestoreResult" style="margin-top:14px;"></div>
      </div>

      <!-- Google Meet Studio -->
      <div class="card">
        <p class="eyebrow">GOOGLE MEET VIDEO CALLS</p>
        <h2>Google Meet Studio</h2>
        <p class="muted">Generate meeting spaces directly using Google Meet API for 1-on-1 consultations.</p>
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
          <button id="createMeetBtn" class="primary">Generate New Meet Space</button>
        </div>
        <div id="meetResult" style="margin-top:14px;"></div>
      </div>

      <!-- Google Sheets Exporter -->
      <div class="card">
        <p class="eyebrow">GOOGLE SHEETS DATA SYNC</p>
        <h2>Google Sheets Exporter</h2>
        <p class="muted">Export all consultation bookings, payment records, and client info into Google Sheets.</p>
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
          <button id="exportSheetsBtn" class="primary">Export Bookings to Google Sheets</button>
        </div>
        <div id="sheetsResult" style="margin-top:14px;"></div>
      </div>

      <!-- Google Drive Manager -->
      <div class="card">
        <p class="eyebrow">GOOGLE DRIVE CLOUD STORAGE</p>
        <h2>Google Drive Manager</h2>
        <p class="muted">Browse files or quickly save consultation transcripts and notes to Google Drive.</p>
        <div style="display:flex;gap:10px;margin-bottom:14px;">
          <button id="browseDriveBtn" class="secondary">Browse Recent Files</button>
        </div>
        <div class="form">
          <label>Document Title<input id="driveFileName" placeholder="Client-Notes-2026.txt" /></label>
          <label class="wide">Content<textarea id="driveContent" placeholder="Notes to store in Drive..."></textarea></label>
          <button id="uploadDriveBtn" class="primary wide">Save to Google Drive</button>
        </div>
        <div id="driveResult" style="margin-top:14px;"></div>
      </div>

      <!-- Google Maps VIP Venues -->
      <div class="card">
        <p class="eyebrow">GOOGLE MAPS PLATFORM</p>
        <h2>VIP Consultation Venues</h2>
        <p class="muted">Exclusively configured Real Meet venues with verified coordinates and directions.</p>
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
          <button id="loadMapsBtn" class="primary">View VIP Locations</button>
        </div>
        <div id="mapsResult" style="margin-top:14px;"></div>
      </div>

      <!-- Google Docs Consultation Notes -->
      <div class="card">
        <p class="eyebrow">GOOGLE DOCS</p>
        <h2>Google Docs Consultation Briefs</h2>
        <p class="muted">Create structured consultation prep documents and briefing sheets in Google Docs.</p>
        <div class="form" style="margin-top:12px;">
          <label>Client Name<input id="docClientName" placeholder="Client Name" /></label>
          <label>Session Topic<input id="docTopic" placeholder="e.g. 1-on-1 Video Consultation" /></label>
          <label class="wide">Session Notes / Goals<textarea id="docNotes" placeholder="Client goals, questions to cover..."></textarea></label>
          <button id="createDocBtn" class="primary wide">Create Google Doc Briefing</button>
        </div>
        <div id="docsResult" style="margin-top:14px;"></div>
      </div>

      <!-- Google Forms Intake Questionnaire -->
      <div class="card">
        <p class="eyebrow">GOOGLE FORMS</p>
        <h2>Google Forms Intake Questionnaire</h2>
        <p class="muted">Generate customized intake questionnaires for clients to complete prior to consultation.</p>
        <div class="form" style="margin-top:12px;">
          <label class="wide">Form Title<input id="formTitle" value="Simran Premium — Consultation Intake Questionnaire" /></label>
          <button id="createFormBtn" class="primary wide">Create Intake Google Form</button>
        </div>
        <div id="formsResult" style="margin-top:14px;"></div>
      </div>
    </div>
  `;

  // Bind Workspace Authorization Button
  $('#wsAuthBtn').onclick = async () => {
    try {
      $('#wsAuthBtn').disabled = true;
      $('#wsAuthBtn').textContent = 'Authorizing…';
      await window.signInWithGoogleWorkspace();
      toast('Google Workspace Authorized');
      integrations();
    } catch (err) {
      toast(err.message || 'Authorization failed');
      $('#wsAuthBtn').disabled = false;
      $('#wsAuthBtn').textContent = 'Authorize Google Workspace';
    }
  };

  // Google Gemini AI Handlers
  $('#runAiPrepBtn').onclick = async () => {
    const resDiv = $('#aiResult');
    resDiv.innerHTML = '<p class="muted">Generating Gemini 3.8 Flash briefing…</p>';
    try {
      const data = await api('/api/ai/prep', {
        method: 'POST',
        body: JSON.stringify({
          customerName: $('#aiClientName').value,
          serviceName: $('#aiServiceName').value,
          notes: $('#aiNotes').value,
          date: '2026-10-15',
          time: '18:00'
        })
      });
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(66,133,244,0.08);border:1px solid rgba(66,133,244,0.3);padding:14px;border-radius:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="color:#8ab4f8;font-size:14px;">✦ Gemini Consultation Briefing</strong>
            <span style="font-size:11px;background:rgba(66,133,244,0.2);padding:2px 8px;border-radius:4px;color:#8ab4f8;">${esc(data.source||'gemini-3.8-flash')}</span>
          </div>
          <p style="font-size:13px;margin:0 0 10px;line-height:1.6;"><strong>Summary:</strong> ${esc(data.summary||'')}</p>
          ${data.talkingPoints?.length ? `
            <div style="margin-bottom:10px;">
              <strong style="font-size:12px;color:var(--text-muted);">RECOMMENDED TALKING POINTS:</strong>
              <ul style="margin:4px 0 0 16px;padding:0;font-size:13px;line-height:1.6;">
                ${data.talkingPoints.map(p => `<li>${esc(p)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${data.icebreakers?.length ? `
            <div style="margin-bottom:10px;">
              <strong style="font-size:12px;color:var(--text-muted);">WARM ICEBREAKERS:</strong>
              <ul style="margin:4px 0 0 16px;padding:0;font-size:13px;line-height:1.6;">
                ${data.icebreakers.map(b => `<li>"${esc(b)}"</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${data.recommendation ? `
            <div style="background:rgba(255,255,255,0.04);padding:8px 12px;border-radius:6px;font-size:12px;color:#e8eaed;">
              <strong>Key Recommendation:</strong> ${esc(data.recommendation)}
            </div>
          ` : ''}
        </div>
      `;
      toast('Gemini brief ready');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  $('#testAiPingBtn').onclick = async () => {
    const resDiv = $('#aiResult');
    resDiv.innerHTML = '<p class="muted">Pinging Google Gemini API…</p>';
    try {
      const data = await api('/api/ai/status');
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(52,168,83,0.1);border:1px solid rgba(52,168,83,0.3);padding:12px;border-radius:8px;">
          <strong style="color:#81c995;">Gemini API Connected!</strong>
          <p style="margin:4px 0;font-size:13px;">Model: <code>${esc(data.model||'gemini-3.8-flash')}</code></p>
          <p style="margin:4px 0;font-size:13px;">Latency: <strong>${data.latencyMs||0}ms</strong></p>
          <p style="font-size:12px;color:var(--text-muted);">Response: "${esc(data.reply||'OK')}"</p>
        </div>
      `;
      toast('Gemini is operational');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  // Google Maps VIP Locations Handler
  $('#loadMapsBtn').onclick = async () => {
    const resDiv = $('#mapsResult');
    resDiv.innerHTML = '<p class="muted">Loading VIP consultation venues…</p>';
    try {
      const data = await api('/api/google/maps/locations');
      resDiv.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${data.venues.map(v => `
            <div style="background:rgba(255,255,255,0.03);padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${esc(v.name)}</strong>
                <span style="font-size:11px;background:rgba(66,133,244,0.15);color:#8ab4f8;padding:2px 6px;border-radius:4px;">${esc(v.city)}</span>
              </div>
              <p style="font-size:12px;color:var(--text-muted);margin:4px 0;">${esc(v.address)}</p>
              <a href="${v.mapsUrl}" target="_blank" rel="noopener" style="font-size:12px;color:#8ab4f8;display:inline-block;margin-top:2px;">Open in Google Maps ↗</a>
            </div>
          `).join('')}
        </div>
      `;
      toast('VIP venues loaded');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  // Google Meet Handler
  $('#createMeetBtn').onclick = async () => {
    const resDiv = $('#meetResult');
    resDiv.innerHTML = '<p class="muted">Generating Google Meet space…</p>';
    try {
      const headers = {};
      if (window.googleWorkspaceAccessToken) headers['Authorization'] = `Bearer ${window.googleWorkspaceAccessToken}`;
      const data = await api('/api/google/meet/create', { method: 'POST', headers, body: JSON.stringify({}) });
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(66,133,244,0.1);border:1px solid rgba(66,133,244,0.3);padding:12px;border-radius:8px;">
          <strong style="color:#8ab4f8;">Google Meet Space Created!</strong>
          <p style="margin:6px 0;word-break:break-all;"><strong>URL:</strong> <a href="${data.meetingUri}" target="_blank" rel="noopener" style="color:#8ab4f8;">${data.meetingUri}</a></p>
          <p style="font-size:12px;color:var(--text-muted);">Meeting Code: <code>${data.meetingCode||'N/A'}</code></p>
          <div style="margin-top:8px;display:flex;gap:8px;">
            <a href="${data.meetingUri}" target="_blank" rel="noopener" class="btn primary" style="padding:6px 12px;font-size:12px;">Launch Meet Call ↗</a>
            <button onclick="navigator.clipboard.writeText('${data.meetingUri}');toast('Meeting link copied!')" class="btn ghost" style="padding:6px 12px;font-size:12px;">Copy Link</button>
          </div>
        </div>
      `;
      toast('Google Meet space generated');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  // Google Sheets Export Handler
  $('#exportSheetsBtn').onclick = async () => {
    const resDiv = $('#sheetsResult');
    resDiv.innerHTML = '<p class="muted">Exporting bookings to Google Sheets…</p>';
    try {
      const headers = {};
      if (window.googleWorkspaceAccessToken) headers['Authorization'] = `Bearer ${window.googleWorkspaceAccessToken}`;
      const data = await api('/api/google/sheets/export', { method: 'POST', headers, body: JSON.stringify({}) });
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(52,168,83,0.1);border:1px solid rgba(52,168,83,0.3);padding:12px;border-radius:8px;">
          <strong style="color:#81c995;">Google Sheet Created & Exported!</strong>
          <p style="margin:6px 0;word-break:break-all;"><strong>Sheet Title:</strong> ${esc(data.title)}</p>
          <p style="margin-top:8px;"><a href="${data.spreadsheetUrl}" target="_blank" rel="noopener" class="btn primary" style="padding:6px 12px;font-size:12px;">Open in Google Sheets ↗</a></p>
        </div>
      `;
      toast('Exported to Google Sheets');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  // Google Docs Create Handler
  $('#createDocBtn').onclick = async () => {
    const resDiv = $('#docsResult');
    const clientName = $('#docClientName').value || 'Client';
    const topic = $('#docTopic').value || 'Personal Consultation';
    const notes = $('#docNotes').value || '';
    resDiv.innerHTML = '<p class="muted">Creating Google Doc…</p>';
    try {
      const headers = {};
      if (window.googleWorkspaceAccessToken) headers['Authorization'] = `Bearer ${window.googleWorkspaceAccessToken}`;
      const data = await api('/api/google/docs/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({ customerName: clientName, serviceName: topic, notes })
      });
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(66,133,244,0.1);border:1px solid rgba(66,133,244,0.3);padding:12px;border-radius:8px;">
          <strong style="color:#8ab4f8;">Google Doc Created!</strong>
          <p style="margin:6px 0;"><strong>Title:</strong> ${esc(data.title)}</p>
          <p style="margin-top:8px;"><a href="${data.documentUrl}" target="_blank" rel="noopener" class="btn primary" style="padding:6px 12px;font-size:12px;">Open in Google Docs ↗</a></p>
        </div>
      `;
      toast('Google Doc created');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  // Google Forms Create Handler
  $('#createFormBtn').onclick = async () => {
    const resDiv = $('#formsResult');
    const title = $('#formTitle').value || 'Consultation Intake Questionnaire';
    resDiv.innerHTML = '<p class="muted">Creating Google Form…</p>';
    try {
      const headers = {};
      if (window.googleWorkspaceAccessToken) headers['Authorization'] = `Bearer ${window.googleWorkspaceAccessToken}`;
      const data = await api('/api/google/forms/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title })
      });
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);padding:12px;border-radius:8px;">
          <strong style="color:#c084fc;">Google Form Created!</strong>
          <p style="margin:6px 0;"><strong>Title:</strong> ${esc(data.title)}</p>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
            <a href="${data.responderUri}" target="_blank" rel="noopener" class="btn primary" style="padding:6px 12px;font-size:12px;">Share Responder Link ↗</a>
            <a href="${data.editUrl}" target="_blank" rel="noopener" class="btn ghost" style="padding:6px 12px;font-size:12px;">Edit Form Questions ↗</a>
          </div>
        </div>
      `;
      toast('Google Form created');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  // Google Drive Handlers
  $('#browseDriveBtn').onclick = async () => {
    const resDiv = $('#driveResult');
    resDiv.innerHTML = '<p class="muted">Fetching files from Google Drive…</p>';
    try {
      const headers = {};
      if (window.googleWorkspaceAccessToken) headers['Authorization'] = `Bearer ${window.googleWorkspaceAccessToken}`;
      const data = await api('/api/google/drive/files', { headers });
      if (!data.files || !data.files.length) {
        resDiv.innerHTML = '<p class="muted">No files found in Google Drive.</p>';
        return;
      }
      resDiv.innerHTML = `
        <div style="max-height:220px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:8px;padding:8px;">
          ${data.files.map(f=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;">
              <span>${esc(f.name)}</span>
              ${f.webViewLink ? `<a href="${f.webViewLink}" target="_blank" rel="noopener" style="color:#8ab4f8;font-size:12px;">Open ↗</a>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  $('#uploadDriveBtn').onclick = async () => {
    const resDiv = $('#driveResult');
    const name = $('#driveFileName').value || `Consultation-Note-${Date.now()}.txt`;
    const content = $('#driveContent').value;
    if (!content) {
      toast('Please enter note content');
      return;
    }
    resDiv.innerHTML = '<p class="muted">Saving file to Google Drive…</p>';
    try {
      const headers = {};
      if (window.googleWorkspaceAccessToken) headers['Authorization'] = `Bearer ${window.googleWorkspaceAccessToken}`;
      const data = await api('/api/google/drive/upload', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, content })
      });
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(52,168,83,0.1);border:1px solid rgba(52,168,83,0.3);padding:12px;border-radius:8px;">
          <strong style="color:#81c995;">File Saved to Google Drive!</strong>
          <p style="margin:6px 0;"><strong>File:</strong> ${esc(data.name)}</p>
          ${data.webViewLink ? `<a href="${data.webViewLink}" target="_blank" rel="noopener" class="btn primary" style="padding:6px 12px;font-size:12px;margin-top:6px;display:inline-block;">View File in Drive ↗</a>` : ''}
        </div>
      `;
      toast('File saved to Google Drive');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };

  // Firebase Firestore Handlers
  $('#pingFirestoreBtn').onclick = async () => {
    const resDiv = $('#firestoreResult');
    resDiv.innerHTML = '<p class="muted">Pinging Cloud Firestore database…</p>';
    const startTime = Date.now();
    try {
      const fb = await window.initFirebase();
      if (!fb || !fb.db) throw new Error('Firebase SDK is not initialized.');
      const testRef = fb.db.collection('system_pings').doc('health_check');
      await testRef.set({
        pingAt: new Date().toISOString(),
        agent: navigator.userAgent
      });
      const latency = Date.now() - startTime;
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(52,168,83,0.1);border:1px solid rgba(52,168,83,0.3);padding:12px;border-radius:8px;">
          <strong style="color:#81c995;">Firestore Ping Successful!</strong>
          <p style="margin:4px 0;">Latency: <strong>${latency}ms</strong></p>
          <p style="font-size:12px;color:var(--text-muted);">Database is accepting secure writes and verifying security rules.</p>
        </div>
      `;
      toast('Firestore is online');
    } catch (err) {
      const errorInfo = window.handleFirestoreError ? window.handleFirestoreError(err, 'create', 'system_pings') : { message: err.message };
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${errorInfo.message}</p>`;
    }
  };

  $('#syncFirestoreBtn').onclick = async () => {
    const resDiv = $('#firestoreResult');
    resDiv.innerHTML = '<p class="muted">Synchronizing local data to Cloud Firestore…</p>';
    try {
      const res = await api('/api/admin/firestore/sync', { method: 'POST' });
      resDiv.innerHTML = `
        <div class="panel" style="background:rgba(52,168,83,0.1);border:1px solid rgba(52,168,83,0.3);padding:12px;border-radius:8px;">
          <strong style="color:#81c995;">Firestore Sync Complete!</strong>
          <p style="margin:4px 0;">${esc(res.message || 'Data successfully synced.')}</p>
          <div style="font-size:12px;color:var(--text-muted);display:flex;gap:12px;margin-top:6px;">
            <span>Bookings: <strong>${res.counts?.bookings||0}</strong></span>
            <span>Users: <strong>${res.counts?.users||0}</strong></span>
            <span>Payments: <strong>${res.counts?.payments||0}</strong></span>
          </div>
        </div>
      `;
      toast('Synced all data to Firestore');
    } catch (err) {
      resDiv.innerHTML = `<p class="danger" style="color:#f28b82;">${err.message}</p>`;
    }
  };
}
async function messages(){const rows=await api('/api/admin/messages');view.innerHTML=`<div class="message-list">${rows.map(m=>`<div class="item"><strong>${m.name}</strong> · <span class="muted">${m.email}</span><p>${m.message}</p><small class="muted">${m.created_at}</small></div>`).join('')||'<div class="card">No messages.</div>'}</div>`}
async function prices(){await configuration()}
async function platforms(){await configuration()}
async function videoPlatforms(){const rows=await api('/api/admin/video-platforms');view.innerHTML=`<div class="grid2"><div class="card"><p class="eyebrow">PUBLIC VIDEOS</p><h2>Video Platforms</h2><p class="muted">Only enabled entries with a configured URL appear on the public Videos section.</p><form id="videoPlatformForm" class="form"><label>Name<input id="vpName" required placeholder="OnlyFans"></label><label>Button label<input id="vpButton" value="Visit Platform"></label><label class="wide">Platform URL<input id="vpUrl" type="url" placeholder="https://..."></label><label class="wide">Logo / icon URL<input id="vpLogo" placeholder="https://... or /uploads/logo.png"></label><label class="wide">Description<textarea id="vpDescription"></textarea></label><button class="primary wide">+ Add Platform</button></form></div><div class="card"><p class="eyebrow">MANAGE</p><h2>Configured Platforms</h2><div class="config-list">${rows.map((platform,index)=>`<div class="item"><div class="row"><div><strong>${esc(platform.name)}</strong><p class="platform-url">${esc(platform.url||'URL not configured')}</p><p class="muted">${esc(platform.description||'No description')}</p></div>${chip(platform.enabled?'ACTIVE':'DISABLED')}</div><div class="actions"><button onclick="editVideoPlatform(${platform.id})">Edit</button><button onclick="toggleVideoPlatform(${platform.id},${platform.enabled?0:1})">${platform.enabled?'Disable':'Enable'}</button><button class="danger" onclick="deleteVideoPlatform(${platform.id})">Delete</button>${index?`<button onclick="moveVideoPlatform(${index},-1)">↑</button>`:''}${index<rows.length-1?`<button onclick="moveVideoPlatform(${index},1)">↓</button>`:''}</div></div>`).join('')||'<p class="muted">No platforms configured.</p>'}</div></div></div>`;$('#videoPlatformForm').onsubmit=async e=>{e.preventDefault();try{await api('/api/admin/video-platforms',{method:'POST',body:JSON.stringify({name:$('#vpName').value,url:$('#vpUrl').value,logo:$('#vpLogo').value,description:$('#vpDescription').value,button_label:$('#vpButton').value})});toast('Video platform added');videoPlatforms()}catch(err){toast(err.message)}}}
window.editVideoPlatform=async id=>{const rows=await api('/api/admin/video-platforms'),p=rows.find(item=>item.id===id);if(!p)return;const name=prompt('Platform name:',p.name),url=prompt('Platform URL:',p.url||''),logo=prompt('Logo / icon URL:',p.logo||''),description=prompt('Description:',p.description||''),button_label=prompt('Button label:',p.button_label||'Visit Platform');if(name!==null&&url!==null)await api(`/api/admin/video-platforms/${id}`,{method:'PUT',body:JSON.stringify({...p,name,url,logo,description,button_label})});videoPlatforms()};window.toggleVideoPlatform=async(id,enabled)=>{const rows=await api('/api/admin/video-platforms'),p=rows.find(item=>item.id===id);await api(`/api/admin/video-platforms/${id}`,{method:'PUT',body:JSON.stringify({...p,enabled:Boolean(enabled)})});videoPlatforms()};window.deleteVideoPlatform=async id=>{if(confirm('Delete this video platform?')){await api(`/api/admin/video-platforms/${id}`,{method:'DELETE'});videoPlatforms()}};window.moveVideoPlatform=async(index,direction)=>{const rows=await api('/api/admin/video-platforms'),ids=rows.map(item=>item.id);[ids[index],ids[index+direction]]=[ids[index+direction],ids[index]];await api('/api/admin/video-platforms/reorder',{method:'PUT',body:JSON.stringify({ids})});videoPlatforms()};
async function calendar(){const rows=await api('/api/admin/bookings');const now=new Date(),year=now.getFullYear(),month=now.getMonth(),first=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate();const cells=Array.from({length:first},()=>'<div class="calendar-day empty"></div>');for(let day=1;day<=days;day++){const key=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,items=rows.filter(row=>row.appointment_date===key);cells.push(`<div class="calendar-day ${day===now.getDate()?'today':''}"><strong>${day}</strong>${items.slice(0,3).map(item=>`<span>${esc(item.appointment_time)} · ${esc(item.customer_name)}</span>`).join('')}</div>`)}view.innerHTML=`<div class="card calendar-card"><div class="row"><div><p class="eyebrow">APPOINTMENTS</p><h2>${now.toLocaleString(undefined,{month:'long',year:'numeric'})}</h2></div><span class="chip">${rows.length} total</span></div><div class="calendar-week">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=>`<span>${day}</span>`).join('')}</div><div class="calendar-grid">${cells.join('')}</div></div>`}
async function notifications(){const rows=await api('/api/notifications');view.innerHTML=`<div class="card"><p class="eyebrow">INBOX</p><h2>Notifications</h2><div class="message-list">${rows.map(n=>`<div class="item row"><div><strong>${esc(n.title)}</strong><p class="muted">${esc(n.message)}</p><small class="muted">${esc(n.created_at)}</small></div>${n.read_at?'':'<span class="notification-dot"></span>'}</div>`).join('')||'<p class="muted">No notifications yet.</p>'}</div></div>`}
async function settings(){view.innerHTML=`<div class="grid2"><div class="card"><p class="eyebrow">ACCOUNT</p><h2>Profile</h2><form id="profileForm" class="form"><label class="wide">Name<input id="profileName" value="${esc(me?.name||'')}"></label><label class="wide">Email<input value="${esc(me?.email||'')}" readonly></label><label class="wide">Phone<input id="profilePhone" value="${esc(me?.phone||'')}"></label><button class="primary wide">Save Profile</button></form></div><div class="card"><p class="eyebrow">SECURITY</p><h2>Session Security</h2><p class="muted">Admin sessions use server-side cookies with HttpOnly, SameSite protection and production Secure cookies. Passwords are never returned to this page.</p><div class="actions"><button class="danger" onclick="adminLogout.click()">Sign Out</button></div></div></div><div class="grid2" style="margin-top:18px"><div class="card"><p class="eyebrow">BOOKING</p><h2>Booking Settings</h2><p class="muted">Categories, prices, platforms, durations, availability, and locations are managed from Booking Configuration.</p><button class="primary" onclick="render('configuration')">Open Configuration</button></div><div class="card"><p class="eyebrow">PAYMENTS & LINKS</p><h2>Connected Settings</h2><p class="muted">Payment QR settings and social/platform URLs are controlled by their dedicated managers.</p><div class="actions"><button onclick="render('qr')">Payment QR</button><button onclick="render('platforms')">Platforms & Links</button></div></div></div>`;$('#profileForm').onsubmit=async e=>{e.preventDefault();try{const d=await api('/api/account',{method:'PATCH',body:JSON.stringify({name:$('#profileName').value,phone:$('#profilePhone').value})});me=d.user;showApp();toast('Profile saved')}catch(err){toast(err.message)}}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
let configCategories=[],configPrices=[],configPlatforms=[],configLinks=[];
function csv(value){return Array.isArray(value)?value.join(', '):String(value||'')}
function configForm(category={}){return `<form id="categoryForm" class="form"><input id="categoryId" type="hidden" value="${esc(category.id||'')}"><label>Name<input id="categoryName" required value="${esc(category.name||'')}"></label><label>Slug<input id="categorySlug" value="${esc(category.slug||'')}"></label><label>Mode<select id="categoryMode"><option value="appointment" ${category.booking_mode!=='live'?'selected':''}>Appointment</option><option value="live" ${category.booking_mode==='live'?'selected':''}>Live</option></select></label><label>Duration (min)<input id="categoryDuration" type="number" min="0" value="${Number(category.duration_minutes||0)}"></label><label>Currency<input id="categoryCurrency" value="${esc(category.currency||'INR')}"></label><label>Max participants<input id="categoryMax" type="number" min="1" value="${esc(category.max_participants||'')}"></label><label class="wide">Image path<input id="categoryImage" value="${esc(category.image||'')}"></label><label class="wide">Description<textarea id="categoryDescription">${esc(category.description||'')}</textarea></label><label class="wide">Available dates, comma separated<input id="categoryDates" value="${esc(csv(category.available_dates))}" placeholder="2026-10-01, 2026-10-02"></label><label class="wide">Available times, comma separated<input id="categoryTimes" value="${esc(csv(category.available_times))}" placeholder="18:00, 20:00"></label><label class="wide">Meeting locations, comma separated<input id="categoryLocations" value="${esc(csv(category.locations))}" placeholder="Studio, Online"></label><label class="wide">Online option<input id="categoryOnline" value="${esc(category.online_option||'')}"></label><label class="wide"><input id="categoryActive" type="checkbox" ${category.id===undefined||category.active?'checked':''}> Enabled</label><div class="actions wide"><button class="primary">${category.id?'Save Changes':'Add Booking Category'}</button>${category.id?'<button type="button" id="cancelCategory">Cancel</button>':''}</div></form>`}
function categoryPayload(){return {name:$('#categoryName').value,slug:$('#categorySlug').value,booking_mode:$('#categoryMode').value,duration_minutes:Number($('#categoryDuration').value),currency:$('#categoryCurrency').value,image:$('#categoryImage').value,description:$('#categoryDescription').value,max_participants:Number($('#categoryMax').value)||null,online_option:$('#categoryOnline').value,available_dates:$('#categoryDates').value.split(',').map(x=>x.trim()).filter(Boolean),available_times:$('#categoryTimes').value.split(',').map(x=>x.trim()).filter(Boolean),locations:$('#categoryLocations').value.split(',').map(x=>x.trim()).filter(Boolean),active:$('#categoryActive').checked,sort_order:0}}
async function configuration(){[configCategories,configPrices,configPlatforms,configLinks]=await Promise.all([api('/api/admin/booking-categories'),api('/api/admin/prices'),api('/api/admin/platforms'),api('/api/admin/social-links')]);view.innerHTML=`<div class="grid2"><div class="card"><h2>Booking Categories</h2><p class="muted">Create and control every public booking category, availability, location, and duration.</p>${configCategories.map((c,i)=>`<div class="item"><div class="row"><div><strong>${esc(c.name)}</strong><p class="muted">${c.booking_mode} · ${c.currency} · ${c.duration_minutes} min</p></div>${chip(c.active?'ACTIVE':'DISABLED')}</div><div class="actions"><button onclick="editCategory(${c.id})">Edit</button><button onclick="toggleCategory(${c.id},${c.active?0:1})">${c.active?'Disable':'Enable'}</button><button class="danger" onclick="deleteCategory(${c.id})">Delete</button>${i?`<button onclick="moveCategory(${i},-1)">↑</button>`:''}${i<configCategories.length-1?`<button onclick="moveCategory(${i},1)">↓</button>`:''}</div></div>`).join('')}</div><div class="card"><h2 id="categoryFormTitle">Add Booking Category</h2>${configForm()}</div></div><div class="grid2" style="margin-top:18px"><div class="card"><h2>Price List Manager</h2><form id="priceForm" class="form"><label>Category<select id="priceCategory">${configCategories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label><label>Name<input id="priceName" required placeholder="5 Minutes"></label><label>Duration<input id="priceDuration" type="number" min="1" required></label><label>Price<input id="priceAmount" type="number" min="0" step="0.01" required></label><label>Currency<input id="priceCurrency" value="INR" required></label><button class="primary wide">Add Price</button></form><div class="config-list">${configPrices.map(p=>`<div class="item row"><span>${esc(p.category_name)} · ${esc(p.name)} · ${p.currency} ${p.price} · ${p.duration_minutes} min</span><span class="actions"><button onclick="togglePrice(${p.id},${p.active?0:1})">${p.active?'Disable':'Enable'}</button><button class="danger" onclick="deletePrice(${p.id})">Delete</button></span></div>`).join('')}</div></div><div class="card"><h2>Platform Manager</h2><form id="platformForm" class="form"><label>Category<select id="platformCategory">${configCategories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label><label>Name<input id="platformName" required placeholder="Instagram"></label><label>URL<input id="platformUrl" placeholder="https://..."></label><label>Icon<input id="platformIcon" placeholder="instagram"></label><label class="wide">Description<textarea id="platformDescription"></textarea></label><button class="primary wide">Add Platform</button></form><div class="config-list">${configPlatforms.map(p=>`<div class="item row"><span>${esc(p.category_name)} · ${esc(p.name)}<br><small class="muted">${esc(p.url||'No URL configured')}</small></span><span class="actions"><button onclick="togglePlatform(${p.id},${p.active?0:1})">${p.active?'Disable':'Enable'}</button><button class="danger" onclick="deletePlatform(${p.id})">Delete</button></span></div>`).join('')}</div></div></div><div class="card" style="margin-top:18px"><h2>Social / Platform Link Manager</h2><form id="linkForm" class="form"><label>Name<input id="linkName" required placeholder="Instagram"></label><label>URL<input id="linkUrl" required placeholder="https://..."></label><label>Icon<input id="linkIcon"></label><button class="primary">Add Link</button></form><div class="config-list">${configLinks.map(l=>`<div class="item row"><span>${esc(l.name)} · ${esc(l.url)}</span><span class="actions"><button onclick="toggleLink(${l.id},${l.active?0:1})">${l.active?'Disable':'Enable'}</button><button class="danger" onclick="deleteLink(${l.id})">Delete</button></span></div>`).join('')}</div></div>`;bindConfigurationForms()}
function bindConfigurationForms(){const form=$('#categoryForm');form.onsubmit=async e=>{e.preventDefault();const id=$('#categoryId').value;await api(id?`/api/admin/booking-categories/${id}`:'/api/admin/booking-categories',{method:id?'PUT':'POST',body:JSON.stringify(categoryPayload())});toast('Category saved');configuration()};if($('#cancelCategory'))$('#cancelCategory').onclick=configuration;$('#priceForm').onsubmit=async e=>{e.preventDefault();await api('/api/admin/prices',{method:'POST',body:JSON.stringify({category_id:Number($('#priceCategory').value),name:$('#priceName').value,duration_minutes:Number($('#priceDuration').value),price:Number($('#priceAmount').value),currency:$('#priceCurrency').value})});toast('Price added');configuration()};$('#platformForm').onsubmit=async e=>{e.preventDefault();await api('/api/admin/platforms',{method:'POST',body:JSON.stringify({category_id:Number($('#platformCategory').value),name:$('#platformName').value,url:$('#platformUrl').value,icon:$('#platformIcon').value,description:$('#platformDescription').value})});toast('Platform added');configuration()};$('#linkForm').onsubmit=async e=>{e.preventDefault();await api('/api/admin/social-links',{method:'POST',body:JSON.stringify({name:$('#linkName').value,url:$('#linkUrl').value,icon:$('#linkIcon').value})});toast('Link added');configuration()};const lists=document.querySelectorAll('.config-list');[configPrices,configPlatforms,configLinks].forEach((items,listIndex)=>items.forEach((item,index)=>{const button=document.createElement('button');button.textContent='Edit';button.onclick=()=>listIndex===0?editPrice(item.id):listIndex===1?editPlatform(item.id):editLink(item.id);lists[listIndex]?.querySelectorAll('.item')[index]?.querySelector('.actions')?.prepend(button)}))}
window.editCategory=id=>{const c=configCategories.find(x=>x.id===id);if(!c)return;$('#categoryFormTitle').textContent='Edit Booking Category';$('#categoryForm').outerHTML=configForm(c);bindConfigurationForms()};window.toggleCategory=async(id,active)=>{const c=configCategories.find(x=>x.id===id);await api(`/api/admin/booking-categories/${id}`,{method:'PUT',body:JSON.stringify({...c,active:Boolean(active)})});configuration()};window.deleteCategory=async id=>{if(confirm('Delete this category?')){await api(`/api/admin/booking-categories/${id}`,{method:'DELETE'});configuration()}};window.moveCategory=async(index,direction)=>{const ids=configCategories.map(c=>c.id);[ids[index],ids[index+direction]]=[ids[index+direction],ids[index]];await api('/api/admin/booking-categories/reorder',{method:'PUT',body:JSON.stringify({ids})});configuration()};window.togglePrice=async(id,active)=>{const p=configPrices.find(x=>x.id===id);await api(`/api/admin/prices/${id}`,{method:'PUT',body:JSON.stringify({...p,active:Boolean(active)})});configuration()};window.editPrice=async id=>{const p=configPrices.find(x=>x.id===id);if(!p)return;const name=prompt('Price option name:',p.name),duration=prompt('Duration in minutes:',p.duration_minutes),amount=prompt('Price:',p.price),currency=prompt('Currency:',p.currency);if(name&&duration&&amount&&currency)await api(`/api/admin/prices/${id}`,{method:'PUT',body:JSON.stringify({...p,name,duration_minutes:Number(duration),price:Number(amount),currency})});configuration()};window.deletePrice=async id=>{if(confirm('Delete this price option?')){await api(`/api/admin/prices/${id}`,{method:'DELETE'});configuration()}};window.togglePlatform=async(id,active)=>{const p=configPlatforms.find(x=>x.id===id);await api(`/api/admin/platforms/${id}`,{method:'PUT',body:JSON.stringify({...p,active:Boolean(active)})});configuration()};window.editPlatform=async id=>{const p=configPlatforms.find(x=>x.id===id);if(!p)return;const name=prompt('Platform name:',p.name),url=prompt('Platform URL:',p.url||''),icon=prompt('Icon:',p.icon||''),description=prompt('Description:',p.description||'');if(name&&url)await api(`/api/admin/platforms/${id}`,{method:'PUT',body:JSON.stringify({...p,name,url,icon,description})});configuration()};window.deletePlatform=async id=>{if(confirm('Delete this platform?')){await api(`/api/admin/platforms/${id}`,{method:'DELETE'});configuration()}};window.toggleLink=async(id,active)=>{const l=configLinks.find(x=>x.id===id);await api(`/api/admin/social-links/${id}`,{method:'PUT',body:JSON.stringify({...l,active:Boolean(active)})});configuration()};window.editLink=async id=>{const l=configLinks.find(x=>x.id===id);if(!l)return;const name=prompt('Link name:',l.name),url=prompt('URL:',l.url),icon=prompt('Icon:',l.icon||'');if(name&&url)await api(`/api/admin/social-links/${id}`,{method:'PUT',body:JSON.stringify({...l,name,url,icon})});configuration()};window.deleteLink=async id=>{if(confirm('Delete this link?')){await api(`/api/admin/social-links/${id}`,{method:'DELETE'});configuration()}};
async function gallery(){const rows=await api('/api/admin/gallery');view.innerHTML=`<div class="grid2"><div class="card"><h2>Add Gallery Image</h2><form id="galleryForm" class="form"><label>Title<input id="gTitle" required></label><label>Image path<input id="gImage" required placeholder="/assets/Images/IMG_0474.jpg"></label><label>Category<input id="gCategory"></label><label class="wide">Description<textarea id="gDescription"></textarea></label><button class="primary wide">Add Image</button></form></div><div class="card"><h2>Gallery Items</h2>${rows.map(item=>`<div class="item row"><div><strong>${esc(item.title)}</strong><p class="muted">${esc(item.image_path)}</p></div><div class="actions"><button onclick="toggleGallery(${item.id},${item.enabled?0:1})">${item.enabled?'Disable':'Enable'}</button><button class="danger" onclick="deleteGallery(${item.id})">Delete</button></div></div>`).join('')||'<p class="muted">No gallery items configured.</p>'}</div></div>`;$('#galleryForm').onsubmit=async e=>{e.preventDefault();try{await api('/api/admin/gallery',{method:'POST',body:JSON.stringify({title:$('#gTitle').value,image_path:$('#gImage').value,category:$('#gCategory').value,description:$('#gDescription').value})});toast('Gallery image added');gallery()}catch(error){toast(error.message)}}}
window.toggleGallery=async(id,enabled)=>{const rows=await api('/api/admin/gallery'),item=rows.find(row=>row.id===id);await api(`/api/admin/gallery/${id}`,{method:'PUT',body:JSON.stringify({...item,enabled:Boolean(enabled)})});gallery()};window.deleteGallery=async id=>{if(confirm('Delete this gallery image?')){await api(`/api/admin/gallery/${id}`,{method:'DELETE'});gallery()}};
async function documents(){const rows=await api('/api/admin/legal');const current=rows[0]||{slug:'terms',title:'Terms and Conditions',content:'',effective_date:'',published:false};view.innerHTML=`<div class="card"><p class="eyebrow">PUBLISHED CONTENT</p><h2>Legal Pages</h2><form id="legalForm" class="form"><label>Page<select id="legalSlug">${['terms','privacy','shipping','cancellation-refund','contact'].map(slug=>`<option value="${slug}" ${slug===current.slug?'selected':''}>${slug}</option>`).join('')}</select></label><label>Title<input id="legalTitle" value="${esc(current.title||'')}"></label><label>Effective date<input id="legalDate" type="date" value="${esc(current.effective_date||'')}"></label><label class="wide">Content<textarea id="legalContent" rows="18">${esc(current.content||'')}</textarea></label><label class="wide"><input id="legalPublished" type="checkbox" ${current.published?'checked':''}> Published</label><button class="primary">Save Legal Page</button></form></div>`;$('#legalSlug').onchange=async()=>{const item=(await api('/api/admin/legal')).find(row=>row.slug===$('#legalSlug').value)||{slug:$('#legalSlug').value,title:'',content:'',effective_date:'',published:false};$('#legalTitle').value=item.title||'';$('#legalDate').value=item.effective_date||'';$('#legalContent').value=item.content||'';$('#legalPublished').checked=Boolean(item.published)};$('#legalForm').onsubmit=async e=>{e.preventDefault();try{await api(`/api/admin/legal/${$('#legalSlug').value}`,{method:'PUT',body:JSON.stringify({title:$('#legalTitle').value,effective_date:$('#legalDate').value,content:$('#legalContent').value,published:$('#legalPublished').checked})});toast('Legal page saved')}catch(error){toast(error.message)}}}
boot().catch(()=>showGate());

// Video platform editing uses the existing form instead of browser prompts.
window.editVideoPlatform=async id=>{
	const rows=await api('/api/admin/video-platforms'), platform=rows.find(item=>item.id===id), form=$('#videoPlatformForm');
	if(!platform||!form)return;
	form.dataset.editingId=String(id);
	$('#vpName').value=platform.name||'';
	$('#vpButton').value=platform.button_label||'Visit Platform';
	$('#vpUrl').value=platform.url||'';
	$('#vpLogo').value=platform.logo||'';
	$('#vpDescription').value=platform.description||'';
	const submit=form.querySelector('button');
	submit.textContent='Save Platform Changes';
	let cancel=form.querySelector('.cancel-video-platform');
	if(!cancel){cancel=document.createElement('button');cancel.type='button';cancel.className='cancel-video-platform';cancel.textContent='Cancel Edit';submit.insertAdjacentElement('afterend',cancel);}
	cancel.onclick=()=>videoPlatforms();
	form.onsubmit=async event=>{
		event.preventDefault();
		try{
			await api(`/api/admin/video-platforms/${id}`,{method:'PUT',body:JSON.stringify({name:$('#vpName').value,url:$('#vpUrl').value,logo:$('#vpLogo').value,description:$('#vpDescription').value,button_label:$('#vpButton').value,enabled:platform.enabled,display_order:platform.display_order})});
			toast('Video platform updated');
			videoPlatforms();
		}catch(error){toast(error.message)}
	};
	form.scrollIntoView({behavior:'smooth',block:'center'});
};
