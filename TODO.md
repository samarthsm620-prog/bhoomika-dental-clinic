# Bhoomika Dental Clinic — Delivery Status

## Appointment request and notification flow
- [x] Appointment form submits to `POST /api/appointment` using EmailJS only; no Stripe, payment webhook, or Sheets webhook is used for booking.
- [x] Server generates a date-stamped reference (`BHC-YYYYMMDD-XXXXXXXX`) and includes it in clinic and patient emails.
- [x] EmailJS uses service `service_oz00kf3`, template `template_lb2zn9m`, and the encrypted public key configured in Cloudflare Pages.
- [x] Doctor and assistant notification requests and patient receipt requests report separate provider-accepted counts; the browser does not equate provider acceptance with inbox delivery.
- [x] Both clinic recipients are required; the handler fails closed if the assistant address or EmailJS public key is missing.
- [x] Selected care area and free-text dental concern are excluded from appointment emails; text is sanitized before it enters email subjects/bodies.
- [x] The supplied PhonePe QR is passed to the EmailJS template and shown on the page only after both clinic notification requests are accepted by EmailJS.
- [x] ₹100 PhonePe payment remains pending until clinic staff manually verify the payment and confirm availability; a request number is not a confirmed appointment.
- [x] A tentative Google Calendar placeholder link is included only when both preferred date and time are provided, and is labeled not confirmed.
- [x] Removed appointment-form SMS consent and all SMS-sent claims because no SMS provider is configured.
- [x] Removed client-side `?payment=success` copy that could claim a payment from an editable URL.
- [x] Added a best-effort per-isolate request throttle, idempotency cache, and submit-button lock to reduce accidental repeats. These do not replace edge-level bot protection.
- [x] The server ignores caller-provided test labels so public requests cannot be disguised as synthetic tests.

## Remaining external verification
- [ ] Confirm the EmailJS template uses the required recipient, subject, reply-to, request number, QR image, and calendar-link fields; code can pass these values but cannot edit the EmailJS dashboard template.
- [ ] Run one synthetic production request with a patient name clearly marked `TEST ONLY`; confirm actual doctor inbox receipt and inspect whether the QR renders as an image. EmailJS acceptance alone is not proof of delivery.
- [ ] Assistant mailbox is not available in the connected doctor Gmail account; provider acceptance is not independent inbox verification.
- [ ] Appointment requests are not persisted in a database; the generated number is a reference carried by email, not a durable booking record.
- [ ] Consider Cloudflare edge-level rate limiting or Turnstile if traffic grows beyond the current low-volume clinic form.
- [ ] SMS is not offered. Configure and test an SMS provider only if the clinic later asks to add it.

## Other website features
- [x] Responsive clinic homepage, English/Kannada toggle, care directory, clinician profile, hours/location, self-check, callback flow, privacy note, and WhatsApp request path.
- [x] Crawler-visible metadata, sitemap, robots rules, privacy policy, terms, cookie consent, HSTS, and browser security headers.
- [x] GitHub `main` is connected to Cloudflare Pages; repository-root deployment is configured.
- [x] Gemini assistant proxy and local clinic-information fallback.

## Deployment notes
The site is hosted at `https://bhoomika-dental-clinic.pages.dev`. Pushes to the connected `main` branch trigger a Cloudflare Pages production deployment.
