# Bhoomika Dental Clinic — Delivery Status

## Verified in current source and deployment work

- [x] Responsive clinic homepage, English/Kannada toggle, booking panel, specialty cards, clinician profile, hours/location, self-check, callback flow, and accessible live status controls.
- [x] Real clinic photos and videos, unique image alt text, compressed raster assets, favicon, web manifest, and social preview image.
- [x] Patient email field, explicit appointment-data consent, optional SMS consent, file-privacy note, validation, appointment honeypot, callback honeypot, and WhatsApp request-letter flow.
- [x] Same-origin Cloudflare Pages Functions for appointment validation, server-side Sheets/EmailJS routing, optional MSG91 SMS routing, and Gemini proxy.
- [x] Crawler-visible metadata, canonical URL, JSON-LD clinic identity, sitemap.xml, robots.txt, AI search-bot access, clean URL redirects, custom noindex 404 page, privacy policy, terms page, cookie consent, HSTS, and browser security headers.
- [x] Stale generated `dist` bundle removed so old provider identifiers are not publicly exposed; provider secrets remain server-side.
- [x] GitHub `main` is connected to Cloudflare Pages with repository-root output and a no-build command.

## Live integration status

- [x] Cloudflare production contains encrypted variable names `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and `CLINIC_EMAIL`.
- [ ] Resolve EmailJS delivery: synthetic production tests returned `email_status: partial`; check the clinic inbox and EmailJS template/activity dashboard. The endpoint does not reveal which recipient send succeeded.
- [ ] Deploy the latest `google-sheets/Code.gs`, add the final SMS opt-in header to the `Bookings` tab, set Apps Script properties `SHEET_ID` and `WEBHOOK_TOKEN`, then add production secrets `GOOGLE_SHEETS_WEBHOOK_URL` and `GOOGLE_SHEETS_SHARED_SECRET` in Cloudflare.
- [ ] Add `GEMINI_API_KEY` as a Cloudflare Pages production secret if live Gemini responses are required.
- [x] Optional, unchecked bilingual SMS-consent control and opt-in-gated MSG91 Pages Function are present. SMS delivery remains unavailable until MSG91 credentials and the approved DLT template are configured.
- [ ] Configure MSG91 production secrets `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID`, with the matching approved DLT sender and content template. Test only with an explicitly opted-in controlled phone.

## Account-dependent setup

- [ ] Add Google Search Console ownership verification and submit `https://bhoomika-dental-clinic.pages.dev/sitemap.xml` after the owner signs in or supplies the HTML/DNS verification method.
- [ ] Add Bing Webmaster verification and submit the same sitemap after owner access is available.
- [ ] Add a real GA4 Measurement ID to the consent-gated `data-ga-measurement-id` attribute after the clinic’s Analytics property is created.
- [ ] Create and verify the Google Business Profile using the clinic-owned Google account and phone/postcard verification.
- [ ] Add a custom domain if desired; the site currently uses the secure free `pages.dev` hostname.

## Deployment notes

The site remains on the free `pages.dev` hostname. Cloudflare’s default Pages hostname redirects HTTP to HTTPS; the published `_headers` file also enables HSTS. A site-wide `noindex` would conflict with the request to index the homepage, so `noindex` is limited to the custom 404 page while public content remains indexable.
