const TAB_NAME = 'Bookings';
const MAX_PAYLOAD_CHARS = 10000;
const EXPECTED_HEADERS = [
  'Request ID', 'Submitted at (UTC)', 'Request type', 'Patient name', 'Patient email',
  'Phone', 'Requested care', 'Preferred date', 'Preferred time',
  'Patient note', 'Language', 'Source', 'Consent recorded', 'SMS opt-in'
];

/** Public receiver: credentials remain in Script Properties; never log them. */
function doPost(e) {
  const properties = PropertiesService.getScriptProperties();
  const expectedToken = properties.getProperty('WEBHOOK_TOKEN') || '';
  const params = (e && e.parameter) || {};
  const providedToken = String(params.token || '');
  if (!expectedToken || !constantTimeEquals_(providedToken, expectedToken)) {
    return json_({ ok: false, error: 'unauthorized' });
  }

  const raw = String(params.payload || '');
  if (!raw || raw.length > MAX_PAYLOAD_CHARS) return json_({ ok: false, error: 'invalid_payload' });
  let data;
  try { data = JSON.parse(raw); } catch (_) { return json_({ ok: false, error: 'invalid_json' }); }
  if (!data || typeof data !== 'object' || data.website) return json_({ ok: true, ignored: true });

  const name = clean_(data.patient_name, 100);
  const email = clean_(data.patient_email, 160).toLowerCase();
  const phone = clean_(data.patient_phone, 32);
  const specialty = clean_(data.specialty, 120);
  const workflow = clean_(data.workflow_type, 40);
  const consent = data.consent === true || ['true', 'yes', 'on'].indexOf(String(data.consent || '').toLowerCase()) >= 0;
  const smsOptIn = data.sms_opt_in === true || ['true', 'yes', 'on'].indexOf(String(data.sms_opt_in || '').toLowerCase()) >= 0;
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, '').length < 7 || !specialty || !['appointment', 'preventive_screening'].includes(workflow) || !consent) {
    return json_({ ok: false, error: 'invalid_fields' });
  }

  const sheetId = properties.getProperty('SHEET_ID') || '';
  if (!sheetId) return json_({ ok: false, error: 'sheet_not_configured' });
  const requestId = clean_(data.request_id, 80) || Utilities.getUuid();
  const row = [
    requestId,
    clean_(data.submitted_at, 40) || new Date().toISOString(),
    workflow,
    name,
    email,
    phone,
    specialty,
    clean_(data.preferred_date, 24),
    clean_(data.preferred_time, 24),
    clean_(data.dental_concern, 700),
    clean_(data.language, 8),
    clean_(data.source, 64),
    'yes',
    smsOptIn ? 'yes' : 'no'
  ].map(sheetSafe_);

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ ok: false, error: 'busy' });
  try {
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(TAB_NAME);
    if (!sheet) return json_({ ok: false, error: 'bookings_tab_not_found' });
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(EXPECTED_HEADERS);
    } else {
      const currentHeaders = sheet.getRange(1, 1, 1, EXPECTED_HEADERS.length).getDisplayValues()[0];
      if (EXPECTED_HEADERS.some((header, index) => currentHeaders[index] !== header)) {
        return json_({ ok: false, error: 'sheet_schema_mismatch' });
      }
    }

    if (sheet.getLastRow() > 1) {
      const duplicate = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
        .createTextFinder(requestId).matchEntireCell(true).findNext();
      if (duplicate) return json_({ ok: true, duplicate: true, request_id: requestId });
    }
    sheet.appendRow(row);
    return json_({ ok: true, duplicate: false, request_id: requestId });
  } catch (_) {
    return json_({ ok: false, error: 'append_failed' });
  } finally {
    lock.releaseLock();
  }
}

/** Non-sensitive health check; returns no sheet data or secret material. */
function doGet() {
  return json_({ ok: true, service: 'Bhoomika Dental Clinic booking receiver' });
}

function clean_(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sheetSafe_(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function constantTimeEquals_(left, right) {
  if (!left || left.length !== right.length) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return mismatch === 0;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
