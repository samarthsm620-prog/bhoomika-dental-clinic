# Appointment notifications and Google Sheets logging

This site sends appointment requests to a same-origin Cloudflare Pages Function. EmailJS and Sheets values are read only by that server-side Function; they are not embedded in frontend JavaScript. Keep the clinic spreadsheet private.

## Google Sheets webhook

1. Use the clinic-owned spreadsheet and a tab named `Bookings`. Row 1 must contain, in this order: `Request ID`, `Submitted at (UTC)`, `Request type`, `Patient name`, `Patient email`, `Phone`, `Requested care`, `Preferred date`, `Preferred time`, `Patient note`, `Language`, `Source`, `Consent recorded`. The receiver checks these headers and does not overwrite them.
2. Open **Extensions → Apps Script** (or the clinic's standalone Apps Script project), paste `Code.gs`, and save it.
3. In **Project Settings → Script Properties**, set `SHEET_ID` to that spreadsheet's ID and `WEBHOOK_TOKEN` to a long random token. Do not commit either value to GitHub.
4. Select **Deploy → New deployment → Web app**. Set **Execute as** to the clinic owner. Set access to **Anyone** so the site can reach the endpoint without a Google login. The receiver validates `WEBHOOK_TOKEN`; do not make the spreadsheet public.
5. Copy the deployed web-app URL ending in `/exec`. Do not use the editor's `/dev` URL.

## Add the Cloudflare Pages production secrets

1. Open the [Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/workers-and-pages), choose **Workers & Pages**, then select the Pages project **`bhoomika-dental-clinic`**.
2. Open **Settings → Variables and Secrets → Add**. Choose the **Production** environment. Do not add a production clinic secret only to Preview.
3. Add `GOOGLE_SHEETS_WEBHOOK_URL` with the deployed Apps Script `/exec` URL. Choose **Secret** to keep the endpoint private in the dashboard.
4. Add `GOOGLE_SHEETS_SHARED_SECRET` as a **Secret**. Its value must exactly match the Apps Script `WEBHOOK_TOKEN` property.
5. If live Gemini replies are wanted, add `GEMINI_API_KEY` as a **Secret** using a key from the clinic's Google AI Studio account.
6. Save the changes. If Cloudflare asks for deployment, deploy them. Otherwise open **Deployments**, retry the latest production deployment, and wait for initialize, build, and deploy to succeed. Verify the commit is the current GitHub `main` branch commit.

The current appointment Function expects these exact names: `GOOGLE_SHEETS_WEBHOOK_URL`, `GOOGLE_SHEETS_SHARED_SECRET`, `GEMINI_API_KEY`. Do not rename them. Never paste secret values into chat, source files, or GitHub.

## EmailJS notifications

Create an EmailJS email service connected to the clinic's chosen mailbox. In EmailJS, create or update one template with **To email** `{{to_email}}`, **Subject** `{{email_subject}}`, and **Reply-To** `{{reply_to}}`. Include `{{recipient_name}}`, `{{message_body}}`, and `{{patient_first_aid}}` in its body. The Pages Function sends this template twice: a structured alert to the clinic and a receipt to the patient's submitted address. The receipt states that the request is not a confirmed appointment and includes general urgent-care guidance; it is not a diagnosis or emergency service.

The Cloudflare Pages project requires `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and the clinic-approved `CLINIC_EMAIL`. As of 2026-11-18, those four names are present as encrypted production secrets. Their values and actual EmailJS delivery have not been independently verified. Confirm the template bindings and clinic recipient in EmailJS before using live patient bookings. Do not assume the Cloudflare account email is the doctor's notification address.

## Gemini assistant

The `/api/gemini` Pages Function requires `GEMINI_API_KEY`. The site has a clinic-facts-only local fallback when Gemini is unavailable. A `503` response means the production secret is absent; `502` means the upstream Gemini request failed. After adding the key and deploying, test the endpoint with a generic, non-emergency question.

## Safe smoke test

After the Apps Script endpoint and both Sheets values are configured, use clearly synthetic booking data and an email inbox you control. Confirm the sheet row and both EmailJS messages, then remove the test row. Do not submit real patient information as a test. The Sheets append uses `request_id` to avoid duplicate rows on retries.
