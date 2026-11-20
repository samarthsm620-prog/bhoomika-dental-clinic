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

## Website hardening follow-up (2026-11-20)
- [x] Current source has unique homepage/privacy/terms titles and descriptions, canonical/social metadata, Dentist structured data, SVG/PNG/ICO/touch icons, sitemap, crawler rules (including named AI crawlers), a real noindex 404 page, and permanent canonical redirects.
- [x] Appointment and callback forms use same-origin Pages Functions. The callback webhook URL has been removed from browser JavaScript and is read from `MANUS_CALLBACK_WEBHOOK`; rotate the previously exposed provider URL before adding its replacement.
- [x] Clinic photo WebP derivatives are used only where they are smaller than the current compressed source; the already-smaller dental-specialties PNG remains unchanged. All background-video sources remain available, with initial downloads deferred and below-fold playback loaded near view.
- [x] Analytics remains off until a GA4 Measurement ID is supplied; consent is optional, can be reopened from the footer, and is scoped to the configured Measurement ID.
- [x] Latest website changes are deployed on Cloudflare Pages (`2e5178c`); clean legal routes, HTTP-to-HTTPS redirect/HSTS, robots, sitemap, icons/social image, responsive WebP assets, and real noindex 404 have been verified live. Desktop callback and consent panels no longer overlap. A synthetic EmailJS booking was accepted by both clinic-recipient sends and the patient-copy send routed to the clinic inbox; provider acceptance does not verify inbox delivery.
- [ ] Add/verify the runtime values listed in `README.md` (including `GEMINI_API_KEY` and, after rotating the previously exposed callback URL, `MANUS_CALLBACK_WEBHOOK`) under Cloudflare Pages Production; do not enter any patient email password.
- [ ] Google Search Console verification, sitemap submission, and homepage indexing request require the clinic owner's Google sign-in and the verification method/token for the current `pages.dev` URL-prefix property.
- [ ] Bing Webmaster Tools verification and sitemap submission require an authorized account; the homepage must remain publicly crawlable.
- [ ] GA4 setup requires the clinic-owned property's `G-...` Measurement ID and privacy approval; add it to the homepage `data-ga-measurement-id` only after consent language and policy are approved.
- [ ] Google Business Profile must be claimed/created by an authorized clinic representative after confirming the exact name, address/map pin or service area, category, phone, hours, website, and clinic's eligibility; Google verification cannot be bypassed.
- [x] Local mobile Lighthouse after deferring video and font loads: performance 0.81, LCP 3.1 s, FCP 1.5 s, Speed Index 2.1 s, TBT 480 ms, CLS 0. This local Node preview is a lab run, not field/Core Web Vitals data.
- [x] Live mobile Lighthouse on Cloudflare: performance 0.87, FCP 2.8 s, LCP 3.4 s, Speed Index 2.9 s, TBT 10 ms, CLS 0; no MP4 was transferred in the initial Lighthouse trace. A real-phone check and Search Console field data remain pending.
- [ ] Have the clinic's authorized owner/privacy reviewer approve the privacy and terms text, actual processors, retention and contact details before treating them as final policy.
- [ ] Current GitHub `main` explicitly marks Google Sheets booking logging as legacy/not used and SMS as not offered. Neither Sheets storage nor MSG91 delivery is active; restoring either is a separate integration change and requires the clinic's explicit architecture choice and provider configuration.
