# Bhoomika Dental Clinic — Delivery Status

## Implemented in source

- [x] Responsive clinic homepage, English/Kannada toggle, booking panel, specialty cards, clinician profile, hours/location, self-check, callback flow, and accessible live status controls.
- [x] Real clinic photos in the hero and gallery; existing looping background videos remain intact.
- [x] Patient email field, explicit appointment-data consent, file-privacy note, request validation, spam honeypot, and WhatsApp request-letter flow.
- [x] Same-origin Cloudflare Pages Function for appointment validation and server-side Sheets/EmailJS routing.
- [x] Google Apps Script receiver source that validates the shared token, matches the existing `Bookings` header row, records consent, locks append operations, and avoids duplicate request IDs.
- [x] Two-recipient EmailJS sender source: structured clinic alert and patient receipt with general urgent-care guidance.
- [x] Gemini Pages Function, verified current model name, clinic-specific rules, and local fallback state when the secret is not configured.
- [x] Deployment/readme documentation and no real credentials committed to source.

## Required owner setup before an end-to-end email/Sheets test

- [ ] Deploy `google-sheets/Code.gs` from the clinic's Apps Script account; set `SHEET_ID` and a random `WEBHOOK_TOKEN` in Script Properties; copy the `/exec` URL and matching token into Cloudflare Pages secrets `GOOGLE_SHEETS_WEBHOOK_URL` and `GOOGLE_SHEETS_SHARED_SECRET`.
- [ ] Configure an EmailJS service and template with `to_email`, `email_subject`, `reply_to`, `recipient_name`, `message_body`, and `patient_first_aid`; set `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and the clinic-approved `CLINIC_EMAIL` in Cloudflare Pages.
- [ ] Add `GEMINI_API_KEY` to Cloudflare Pages if live Gemini responses are wanted.
- [ ] After those secrets are configured, submit one clearly synthetic test booking, verify the sheet row and both test inbox emails, then remove the test row and message.

Cloudflare Pages production is connected to the GitHub `main` branch, with repository-root output and a no-build command. A custom domain is intentionally not purchased or configured; the current site uses its free `pages.dev` hostname.
