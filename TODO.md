# Bhoomika Dental Clinic — Delivery Status

## Verified in current source and deployment work
- [x] Responsive clinic homepage, English/Kannada toggle, booking panel, specialty cards, clinician profile, hours/location, self-check, callback flow, and accessible live status controls.
- [x] Real clinic photos and videos, unique image alt text, compressed raster assets, favicon, web manifest, and social preview image.
- [x] Patient email field, explicit appointment-data consent, optional SMS consent, file-privacy note, validation, appointment honeypot, callback honeypot, and WhatsApp request-letter flow.
- [x] Same-origin Cloudflare Pages Functions for appointment validation, server-side Sheets/EmailJS routing, optional MSG91 SMS routing, and Gemini proxy.
- [x] Crawler-visible metadata, canonical URL, JSON-LD clinic identity, sitemap.xml, robots.txt, AI search-bot access, clean URL redirects, custom noindex 404 page, privacy policy, terms page, cookie consent, HSTS, and browser security headers.
- [x] Stale generated `dist` bundle removed so old provider identifiers are not publicly exposed; provider secrets remain server-side.
- [x] GitHub `main` is connected to Cloudflare Pages with repository-root output and a no-build command.
- [x] Google Apps Script receiver source validates the shared token, matches the `Bookings` header row, records consent, locks append operations, and avoids duplicate request IDs.
- [x] Direct ₹100 INR Stripe Checkout endpoint and Stripe-signature webhook source; paid confirmation emails go directly through the clinic-owned EmailJS account, not through Manus.

## Live integration status
- [x] Cloudflare production contains encrypted EmailJS variable names.
- [ ] Resolve EmailJS delivery: synthetic production tests returned partial/unconfigured; verify the clinic inbox and EmailJS activity dashboard.
- [ ] Deploy the latest `google-sheets/Code.gs`, set Apps Script properties `SHEET_ID` and `WEBHOOK_TOKEN`, then add production Sheets secrets in Cloudflare.
- [ ] Add `GEMINI_API_KEY` as a Cloudflare Pages production secret if live Gemini responses are required.
- [ ] Configure MSG91 production secrets and test only with an explicitly opted-in controlled phone.
- [ ] Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and clinic-owned `CLINIC_PAYMENT_QR_URL`; configure Stripe to send `checkout.session.completed` to `/api/stripe-webhook`.
- [ ] Run one synthetic Stripe test-mode checkout; verify the Sheet row and both direct test inbox emails; then remove test data.

## Account-dependent setup
- [ ] Add Google Search Console and Bing Webmaster verification.
- [ ] Add a real GA4 Measurement ID after the clinic property is created.
- [ ] Create and verify the Google Business Profile using the clinic-owned Google account.
- [ ] Add a custom domain if desired; the site currently uses the secure free `pages.dev` hostname.

## Deployment notes
The site remains on the free `pages.dev` hostname. Cloudflare’s default Pages hostname redirects HTTP to HTTPS; `_headers` enables HSTS. Public content remains indexable while the custom 404 page is noindex.
