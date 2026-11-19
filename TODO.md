# Bhoomika Dental Clinic — Delivery Status

## Verified in the current Cloudflare production deployment

- [x] GitHub `main` is connected to Pages. Production commit `0535575` (including SMS code from `669ac2b`) completed initialize, clone, build and deploy successfully. Cloudflare's build-watch include rule is restored to `*` with no exclusions; canonical `https://bhoomika-dental-clinic.pages.dev/` returns HTTP 200 and serves the SMS form changes.
- [x] All 14 deployed static visual assets were checked: the site logo, 11 image files, and both MP4 videos. Image/video endpoints return HTTP 200 with the expected MIME types.
- [x] The hero background video is loaded and playing with `muted` and `loop` enabled. The second clinic video remains available as `video/mp4`.
- [x] Responsive layout was measured on the deployed CSS at 390 px (phone), 900 px (tablet), and 1280 px (desktop). Each width has no horizontal overflow; the story photo fits its container, feedback rating radios remain 1 px, and self-check radios remain 16 px.
- [x] The final 390 × 844 mobile screenshot was visually reviewed. The clinic identity, hero text, booking CTA, photo, and assistant control are visible and unclipped.
- [x] English → Kannada → English toggle works and restores English.
- [x] Empty appointment request is rejected with HTTP 400 before any notification or Sheets route is called.

## Live integration status (2026-11-18)

- [x] Cloudflare production contains encrypted variable names `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and `CLINIC_EMAIL`. Their values are intentionally not exposed.
- [ ] Resolve EmailJS delivery: two synthetic production tests returned HTTP 200 with `email_status: partial`; check the clinic inbox and EmailJS template/activity dashboard. The endpoint does not reveal which recipient send succeeded.
- [ ] Deploy the latest `google-sheets/Code.gs`, add the final `SMS opt-in` header to the `Bookings` tab, set Apps Script properties `SHEET_ID` and `WEBHOOK_TOKEN`, then add production secrets `GOOGLE_SHEETS_WEBHOOK_URL` and `GOOGLE_SHEETS_SHARED_SECRET` in Cloudflare. The Pages project currently lacks both bindings, so website appointment logging to `Bookings` is not active. Any separate callback/triage sheet is not proof that this appointment-sheet route works.
- [ ] Add `GEMINI_API_KEY` as a Cloudflare Pages production secret. A generic live dental-sensitivity inquiry currently returns HTTP 503 `Gemini proxy is not configured`; no Gemini answer was produced.
- [x] Deploy the optional, unchecked bilingual SMS-consent control and opt-in-gated MSG91 Pages Function. The Function sends only after an appointment reaches a clinic route; real SMS delivery remains unavailable until MSG91 credentials and the approved template are configured.
- [ ] Configure MSG91 production secrets `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID`, with the matching approved DLT sender and content template. SMS must only be tested with an explicitly opted-in controlled phone.
- [ ] After Sheets and EmailJS are fully configured, run one clearly synthetic appointment test; verify the `Bookings` row and both email notifications, then remove the test row/message.

## Deployment notes

The site remains on the free `pages.dev` hostname. No custom domain has been purchased or configured. Exact Pages dashboard instructions and required variable names are in [`google-sheets/README.md`](google-sheets/README.md).
