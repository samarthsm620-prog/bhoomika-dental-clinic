# Google Sheets appointment logging

1. Create a clinic-owned Google Sheet and a tab named `Appointments`.
2. Open **Extensions → Apps Script**, paste `Code.gs`, and add the script property `GOOGLE_SHEETS_SHARED_SECRET` with a long random value.
3. Deploy as a Web app, execute as the clinic account, and choose the access level required by the clinic’s policy. Copy the deployment URL into Cloudflare Pages as `GOOGLE_SHEETS_WEBHOOK_URL`.
4. Set the same random value as `GOOGLE_SHEETS_SHARED_SECRET` in Cloudflare Pages.

The website sends only the appointment intake fields to this endpoint. Do not place the shared secret in browser code.
