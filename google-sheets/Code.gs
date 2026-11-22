// Bhoomika Dental Clinic — booking state store (Google Sheets).
// Script Properties required:
//   SHEET_ID      = the target spreadsheet ID
//   WEBHOOK_TOKEN = same value as Cloudflare SHEETS_TOKEN
// Deploy: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
// Copy the public /exec URL to Cloudflare SHEETS_WEBAPP_URL.

const TAB_NAME = 'Bookings';
const HEADERS = [
  'Appointment No', 'Created (UTC)', 'Status', 'Patient name', 'Patient email', 'Phone', 'Care area',
  'Preferred date', 'Preferred time', 'Patient note', 'Language', 'Source',
  'Doctor verified at', 'Payment ref (patient)', 'Payment claimed at', 'Payment confirmed at', 'Last updated (UTC)'
];

// Only these state transitions are permitted.
const ALLOWED = {
  requested: ['approved', 'declined'],
  approved: ['payment_claimed', 'paid_online'],
  payment_claimed: ['confirmed', 'payment_rejected'],
  paid_online: ['confirmed'],
  payment_rejected: ['payment_claimed']
};

// 1-based sheet columns for transition metadata.
const EDITABLE = {
  doctor_verified_at: 13,
  payment_ref: 14,
  payment_claimed_at: 15,
  payment_confirmed_at: 16
};

function doGet() {
  return json_({ ok: true, service: 'Bhoomika Dental Clinic booking store' });
}

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const p = (e && e.parameter) || {};
  const action = clean_(p.action, 20);

  if (!equals_(String(p.token || ''), String(props.getProperty('WEBHOOK_TOKEN') || ''))) {
    return json_({ ok: false, error: 'unauthorized' });
  }

  let data;
  try {
    data = JSON.parse(String(p.payload || ''));
  } catch (err) {
    Logger.log('invalid_json action=%s message=%s', action, safeError_(err));
    return json_({ ok: false, error: 'invalid_json' });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return json_({ ok: false, error: 'busy' });

  try {
    const sh = sheet_(props.getProperty('SHEET_ID'));
    if (action === 'create') return json_(create_(sh, data));
    if (action === 'get') return json_(get_(sh, data));
    if (action === 'transition') return json_(transition_(sh, data));
    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    // Never log tokens, patient fields, payment references, or the full payload.
    Logger.log('server_error action=%s message=%s', action, safeError_(err));
    return json_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

function sheet_(id) {
  if (!id) throw new Error('SHEET_ID is not configured');
  const ss = SpreadsheetApp.openById(id);
  let sh = ss.getSheetByName(TAB_NAME);
  if (!sh) sh = ss.getSheets()[0].setName(TAB_NAME);
  ensureSchema_(sh);
  return sh;
}

function ensureSchema_(sh) {
  const existing = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  let matches = existing.length === HEADERS.length;
  for (let i = 0; i < HEADERS.length; i++) {
    if (String(existing[i] || '') !== HEADERS[i]) {
      matches = false;
      break;
    }
  }
  if (!matches) sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sh.setFrozenRows(1);
}

function find_(sh, id) {
  if (!id || sh.getLastRow() < 2) return 0;
  const hit = sh.getRange(2, 1, sh.getLastRow() - 1, 1)
    .createTextFinder(String(id)).matchEntireCell(true).findNext();
  return hit ? hit.getRow() : 0;
}

function rowObj_(sh, row) {
  const v = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  return {
    appointment_no: v[0],
    created: String(v[1] || ''),
    status: v[2],
    patient_name: v[3],
    patient_email: v[4],
    phone: v[5],
    care_area: v[6],
    preferred_date: String(v[7] || ''),
    preferred_time: String(v[8] || ''),
    note: v[9],
    language: v[10],
    source: v[11],
    doctor_verified_at: String(v[12] || ''),
    payment_ref: v[13],
    payment_claimed_at: String(v[14] || ''),
    payment_confirmed_at: String(v[15] || ''),
    last_updated: String(v[16] || '')
  };
}

function create_(sh, d) {
  const id = clean_(d.appointment_no, 40);
  if (!/^BHC-\d{8}-[A-Z0-9]{8}$/.test(id)) return { ok: false, error: 'invalid_id' };
  if (find_(sh, id)) return { ok: true, duplicate: true };

  const now = new Date().toISOString();
  sh.appendRow([
    id,
    now,
    'requested',
    clean_(d.patient_name, 100),
    clean_(d.patient_email, 160).toLowerCase(),
    clean_(d.phone, 32),
    clean_(d.care_area, 120),
    clean_(d.preferred_date, 24),
    clean_(d.preferred_time, 24),
    clean_(d.note, 700),
    clean_(d.language, 8),
    clean_(d.source, 64),
    '',
    '',
    '',
    '',
    now
  ].map(safe_));
  return { ok: true, duplicate: false };
}

function get_(sh, d) {
  const row = find_(sh, clean_(d.appointment_no, 40));
  return row ? { ok: true, booking: rowObj_(sh, row) } : { ok: false, error: 'not_found' };
}

function transition_(sh, d) {
  const row = find_(sh, clean_(d.appointment_no, 40));
  if (!row) return { ok: false, error: 'not_found' };

  const booking = rowObj_(sh, row);
  const to = clean_(d.to, 30);
  if (booking.status === to) return { ok: true, unchanged: true, booking: booking };
  if ((ALLOWED[booking.status] || []).indexOf(to) < 0) {
    return { ok: false, error: 'bad_state', status: booking.status };
  }

  const now = new Date().toISOString();
  sh.getRange(row, 3).setValue(to);
  sh.getRange(row, 17).setValue(now);

  Object.keys(EDITABLE).forEach(function (key) {
    if (d[key] != null) {
      sh.getRange(row, EDITABLE[key]).setValue(safe_(clean_(d[key], 120)));
    }
  });
  return { ok: true, booking: rowObj_(sh, row) };
}

function clean_(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max || 300);
}

function safe_(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function safeError_(err) {
  return clean_(err && err.message ? err.message : err, 240);
}

function equals_(a, b) {
  if (!a || a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
