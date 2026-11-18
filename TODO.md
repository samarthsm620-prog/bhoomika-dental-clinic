# Bhoomika Dental Clinic — Delivery Status

## Verified in the current Cloudflare production deployment

- [x] GitHub `main` is connected to Pages. Commit `b9ff0ef` completed initialize, clone, build and deploy successfully; canonical `https://bhoomika-dental-clinic.pages.dev/` and its CSS endpoints return HTTP 200.
- [x] All 14 deployed static visual assets were checked: the site logo, 11 image files, and both MP4 videos. Image/video endpoints return HTTP 200 with the expected MIME types.
- [x] The hero background video is loaded and playing with `muted` and `loop` enabled. The second clinic video remains available as `video/mp4`.
- [x] Responsive layout was measured on the deployed CSS at 390 px (phone), 900 px (tablet), and 1280 px (desktop). Each width has no horizontal overflow; the story photo fits its container, feedback rating radios remain 1 px, and self-check radios remain 16 px.
- [x] The final 390 × 844 mobile screenshot was visually reviewed. The clinic identity, hero text, booking CTA, photo, and assistant control are visible and unclipped.
- [x] English → Kannada → English toggle works and restores English.
- [x] Empty appointment request is rejected with HTTP 400 before any notification or Sheets route is called.

## Live integration status (2026-11-18)

- [x] Cloudflare production contains encrypted variable names `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and `CLINIC_EMAIL`. Their values are intentionally not exposed; actual EmailJS template validity and delivery have not been tested.
- [ ] Confirm EmailJS service/template bindings in EmailJS and send one synthetic test to a controlled inbox. Do not use real patient data.
- [ ] Deploy `google-sheets/Code.gs`, set Apps Script properties `SHEET_ID` and `WEBHOOK_TOKEN`, then add production secrets `GOOGLE_SHEETS_WEBHOOK_URL` and `GOOGLE_SHEETS_SHARED_SECRET` in Cloudflare. The Cloudflare Pages project currently lacks both bindings, so website appointment logging to `Bookings` is not active. Any separate callback/triage sheet is not proof that this appointment-sheet route works.
- [ ] Add `GEMINI_API_KEY` as a Cloudflare Pages production secret. A generic live dental-sensitivity inquiry currently returns HTTP 503 `Gemini proxy is not configured`; no Gemini answer was produced.
- [ ] After Sheets and EmailJS are fully configured, run one clearly synthetic appointment test; verify the `Bookings` row and both email notifications, then remove the test row/message.

## Deployment notes

The site remains on the free `pages.dev` hostname. No custom domain has been purchased or configured. Exact Pages dashboard instructions and required variable names are in [`google-sheets/README.md`](google-sheets/README.md).
