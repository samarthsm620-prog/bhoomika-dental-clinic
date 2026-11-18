# Appointment notifications and Google Sheets logging

This site submits the appointment form to a Cloudflare Pages Function. EmailJS credentials and the Google Sheets shared token stay server-side; the browser never receives them. The clinic sheet should remain private and must not be shared publicly.

## Google Sheets webhook

1. In the clinic-owned Google Sheet, use a tab named `Bookings` with these existing columns in row 1, in order: `Request ID`, `Submitted at (UTC)`, `Request type`, `Patient name`, `Patient email`, `Phone`, `Requested care`, `Preferred date`, `Preferred time`, `Patient note`, `Language`, `Source`, `Consent recorded`. The receiver checks this exact order before appending and does not overwrite the header.
2. Open **Extensions → Apps Script** (or the clinic's standalone Apps Script project), paste `Code.gs`, and save it.
3. In **Project Settings → Script Properties**, set `SHEET_ID` to the clinic spreadsheet ID and `WEBHOOK_TOKEN` to a long, randomly generated secret. Do not add either value to GitHub.
4. Deploy the script as a **Web app**, execute as the clinic owner, and permit public access only because the patient form calls it without a Google login. The script checks `WEBHOOK_TOKEN` before writing; keep the spreadsheet itself private.
5. Copy the deployed `/exec` URL to Cloudflare Pages as `GOOGLE_SHEETS_WEBHOOK_URL`. Set the same random token as the encrypted `GOOGLE_SHEETS_SHARED_SECRET` Pages secret. Do not expose the token in frontend JavaScript.
6. A successful booking appends one row. `request_id` makes retries idempotent, so a network retry will not create duplicate entries.

## EmailJS notifications

Create an EmailJS email service and one template. Configure the template's **To email** as `{{to_email}}`, **Subject** as `{{email_subject}}`, **Reply-To** as `{{reply_to}}`, and include `{{recipient_name}}`, `{{message_body}}`, and `{{patient_first_aid}}` in the body. The Pages Function sends the same template twice: a structured clinic alert to `CLINIC_EMAIL` and a receipt to the patient's submitted address. The patient receipt says the request is not yet a confirmed appointment and includes general urgent-care guidance; it is not a diagnosis or emergency service.

Set these Cloudflare Pages environment variables/secrets: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and `CLINIC_EMAIL`. The clinic recipient address must be confirmed by the clinic owner; do not assume the Cloudflare account email is the doctor's notification address. Test with an address you control before switching to the clinic's live inbox.

## Gemini assistant

Set `GEMINI_API_KEY` as an encrypted Cloudflare Pages secret. The website uses the `/api/gemini` Pages Function; it falls back to local, clinic-facts-only answers when Gemini is unavailable and displays that state in the assistant panel.

## Deployment and smoke test

Cloudflare Pages is connected to the GitHub `main` branch. After updating source, wait for the production build to complete, then verify the hero images, both language states, `/api/gemini`, and the booking endpoint. Do not submit real patient information as a test. Use clearly synthetic test data and remove the test row/email after verifying delivery.
