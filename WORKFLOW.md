# Bhoomika Dental Clinic booking workflow

## Prepared Google Sheet

The authorized Workspace account did not contain an existing clinic spreadsheet, so a new private spreadsheet was prepared:

- Spreadsheet: `Bhoomika Dental Clinic Bookings`
- Spreadsheet ID: `1m2tYm7DPlIw6oEeHuTJr_5_GZDxzMDvayJTw7CHFN-Y`
- URL: https://docs.google.com/spreadsheets/d/1m2tYm7DPlIw6oEeHuTJr_5_GZDxzMDvayJTw7CHFN-Y/edit
- Tab: `Bookings`
- Header row: `Request ID`, `Submitted at (UTC)`, `Request type`, `Patient name`, `Patient email`, `Phone`, `Requested care`, `Preferred date`, `Preferred time`, `Patient note`, `Language`, `Source`, `Consent recorded`, `SMS opt-in`

`google-sheets/Code.gs` is ready in the repository. The current Google Workspace connector does not grant Apps Script project/deployment scope, so the final Apps Script paste/deploy step must be completed manually by the clinic owner in the sheet's **Extensions → Apps Script** editor.

## Apps Script deployment

1. Open the spreadsheet.
2. Open **Extensions → Apps Script**.
3. Replace the editor contents with `google-sheets/Code.gs`.
4. In **Project Settings → Script Properties**, set:
   - `SHEET_ID`: `1m2tYm7DPlIw6oEeHuTJr_5_GZDxzMDvayJTw7CHFN-Y`
   - `WEBHOOK_TOKEN`: a long random value
5. Deploy → New deployment → Web app.
6. Execute as the clinic owner.
7. Who has access: Anyone.
8. Copy the `/exec` URL.

Do not use the `/dev` URL. Do not make the spreadsheet public.

## Cloudflare production names

Use these exact production secret names:

```text
WORKFLOW_SECRET
SHEETS_WEBAPP_URL
SHEETS_TOKEN
EMAILJS_PRIVATE_KEY
GEMINI_API_KEY
CLINIC_EMAIL
CLINIC_ASSISTANT_EMAIL
EMAILJS_SERVICE_ID
EMAILJS_TEMPLATE_ID
EMAILJS_PUBLIC_KEY
CLINIC_PAYMENT_QR_URL
```

The appointment Function accepts both the requested aliases and the older names:

```text
SHEETS_WEBAPP_URL or GOOGLE_SHEETS_WEBHOOK_URL
SHEETS_TOKEN or WORKFLOW_SECRET or GOOGLE_SHEETS_SHARED_SECRET
```

Set `SHEETS_TOKEN` to the same value as Apps Script `WEBHOOK_TOKEN`. Set `SHEETS_WEBAPP_URL` to the deployed `/exec` URL.

`EMAILJS_PRIVATE_KEY` is optional for the current EmailJS REST flow because the public key already works; if configured, it is passed as EmailJS `accessToken`.

## Email recipients

```text
CLINIC_EMAIL=drlatamabrumkar@gmail.com
CLINIC_ASSISTANT_EMAIL=assistantbhoomikadentalclinic@gmail.com
```

A booking sends one clinic alert to each recipient and one patient receipt. Google Sheets logging is independent of email delivery.

## Safe final test

After the Apps Script `/exec` URL and matching token are configured in Cloudflare:

1. Submit a clearly synthetic booking named `TEST ONLY` using an inbox controlled by the clinic.
2. Verify the doctor alert, assistant alert, patient receipt, and `Bookings` row.
3. Confirm that the email template contains `{{message_body}}` and the QR HTML block using `{{payment_qr_url}}`.
4. Delete or clearly label the synthetic row.
5. Do not use real patient information for testing.
