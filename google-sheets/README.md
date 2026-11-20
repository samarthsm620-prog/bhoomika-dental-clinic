# Google Sheets booking store

System of record for the staged booking flow (requested → approved → payment_claimed → confirmed).

1. Open the spreadsheet **Bhoomika Dental Clinic — Bookings** (Google Drive), Extensions > Apps Script, paste `Code.gs`.
2. Project Settings > Script Properties: `SHEET_ID` = the spreadsheet ID from its URL, `WEBHOOK_TOKEN` = a long random string.
3. Deploy > New deployment > Web app > Execute as **Me**, access **Anyone**. Copy the `/exec` URL.
4. Cloudflare Pages secrets: `SHEETS_WEBAPP_URL` = that URL, `SHEETS_TOKEN` = the same random string.

The sheet holds patient contact details and the free-text note: keep it private to the clinic.
