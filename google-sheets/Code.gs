// Bhoomika Dental Clinic — booking state store (Google Sheets).
// Script Properties required: SHEET_ID, WEBHOOK_TOKEN (same value as Cloudflare SHEETS_TOKEN).
// Deploy: Deploy > New deployment > Web app > Execute as: Me, Access: Anyone. Copy the /exec URL to Cloudflare SHEETS_WEBAPP_URL.
const TAB_NAME = 'Bookings';
const HEADERS = [
  'Appointment No', 'Created (UTC)', 'Status', 'Patient name', 'Patient email', 'Phone', 'Care area',
  'Preferred date', 'Preferred time', 'Patient note', 'Language', 'Source',
  'Doctor verified at', 'Payment ref (patient)', 'Payment claimed at', 'Payment confirmed at', 'Last updated (UTC)'
];
// Allowed status moves. The doctor/patient/webhook can only advance a booking along these edges.
const ALLOWED = {
  requested: ['approved', 'declined'],
  approved: ['payment_claimed', 'paid_online'],
  payment_claimed: ['confirmed', 'payment_rejected'],
  paid_online: ['confirmed'],
  payment_rejected: ['payment_claimed']
};
const EDITABLE = { doctor_verified_at: 12, payment_ref: 13, payment_claimed_at: 14, payment_confirmed_at: 15 };

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const p = (e && e.parameter) || {};
  if (!equals_(String(p.token || ''), props.getProperty('WEBHOOK_TOKEN') || '')) return json_({ ok: false, error: 'unauthorized' });
  let data;
  try { data = JSON.parse(String(p.payload || '')); } catch (_) { return json_({ ok: false, error: 'invalid_json' }); }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return json_({ ok: false, error: 'busy' });
  try {
    const sh = sheet_(props.getProperty('SHEET_ID'));
    if (p.action === 'create') return json_(create_(sh, data));
    if (p.action === 'get') return json_(get_(sh, data));
    if (p.action === 'transition') return json_(transition_(sh, data));
    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return json_({ ok: false, error: 'server_error' });
  } finally { lock.releaseLock(); }
}

function doGet() { return json_({ ok: true, service: 'Bhoomika Dental Clinic booking store' }); }

function sheet_(id) {
  const ss = SpreadsheetApp.openById(id);
  let sh = ss.getSheetByName(TAB_NAME);
  if (!sh) { sh = ss.getSheets()[0]; sh.setName(TAB_NAME); }
  if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  return sh;
}
function find_(sh, id) {
  if (sh.getLastRow() < 2) return 0;
  const hit = sh.getRange(2, 1, sh.getLastRow() - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext();
  return hit ? hit.getRow() : 0;
}
function rowObj_(sh, r) {
  const v = sh.getRange(r, 1, 1, HEADERS.length).getValues()[0];
  return { appointment_no: v[0], created: String(v[1]), status: v[2], patient_name: v[3], patient_email: v[4], phone: v[5], care_area: v[6], preferred_date: String(v[7]), preferred_time: String(v[8]), payment_ref: v[13] };
}
function create_(sh, d) {
  const id = clean_(d.appointment_no, 40);
  if (!/^BHC-\d{8}-[A-Z0-9]{8}$/.test(id)) return { ok: false, error: 'invalid_id' };
  if (find_(sh, id)) return { ok: true, duplicate: true };
  const now = new Date().toISOString();
  sh.appendRow([
    id, now, 'requested', clean_(d.patient_name, 100), clean_(d.patient_email, 160).toLowerCase(), clean_(d.phone, 32), clean_(d.care_area, 120),
    clean_(d.preferred_date, 24), clean_(d.preferred_time, 24), clean_(d.note, 700), clean_(d.language, 8), clean_(d.source, 64),
    '', '', '', '', now
  ].map(safe_));
  return { ok: true, duplicate: false };
}
function get_(sh, d) {
  const r = find_(sh, clean_(d.appointment_no, 40));
  return r ? { ok: true, booking: rowObj_(sh, r) } : { ok: false, error: 'not_found' };
}
function transition_(sh, d) {
  const r = find_(sh, clean_(d.appointment_no, 40));
  if (!r) return { ok: false, error: 'not_found' };
  const b = rowObj_(sh, r);
  const to = String(d.to || '');
  if (b.status === to) return { ok: true, unchanged: true, booking: b };   // idempotent repeat click
  if ((ALLOWED[b.status] || []).indexOf(to) < 0) return { ok: false, error: 'bad_state', status: b.status };
  const now = new Date().toISOString();
  sh.getRange(r, 3).setValue(to);
  sh.getRange(r, 17).setValue(now);
  Object.keys(EDITABLE).forEach(function (k) { if (d[k] != null) sh.getRange(r, EDITABLE[k]).setValue(safe_(clean_(d[k], 120))); });
  return { ok: true, booking: rowObj_(sh, r) };
}
function clean_(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n); }
function safe_(v) { const t = String(v == null ? '' : v); return /^[=+\-@]/.test(t) ? "'" + t : t; }
function equals_(a, b) { if (!a || a.length !== b.length) return false; let m = 0; for (let i = 0; i < a.length; i++) m |= a.charCodeAt(i) ^ b.charCodeAt(i); return m === 0; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
