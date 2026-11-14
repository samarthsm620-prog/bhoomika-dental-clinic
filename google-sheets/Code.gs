const SHEET_NAME = 'Appointments';
const SHARED_SECRET = PropertiesService.getScriptProperties().getProperty('GOOGLE_SHEETS_SHARED_SECRET');

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (!SHARED_SECRET || body.shared_secret !== SHARED_SECRET) return json({ ok: false, error: 'Unauthorized' });
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
    const headers = ['submitted_at', 'workflow_type', 'patient_name', 'patient_phone', 'patient_email', 'specialty', 'preferred_date', 'preferred_time', 'dental_concern', 'language', 'source', 'attachment_names'];
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);
    sheet.appendRow(headers.map((header) => String(body[header] || '').slice(0, 2000)));
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message });
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
