# Bhoomika Dental Clinic — Delivery Outcomes

- [ ] Build a responsive clinic homepage with deep-blue utility bar, white navigation, appointment CTA, split hero, trust metrics, booking widget, specialty cards, doctor profile, callback row, and bilingual Kannada/English toggle.
- [ ] Wire the main appointment webhook to send JSON with `workflow_type` set to `appointment` or `preventive_screening` based on the booking form selection.
- [ ] Wire the callback-triage webhook into the sticky callback row and surface success/error states without blocking the page.
- [x] Implement WCAG-minded semantics: landmarks, labels, keyboard focus, aria-live status regions, reduced motion, sufficient contrast, and descriptive alt text or decorative-image handling.
- [ ] Implement Web Speech API voice input/output, local dental intent mapping, bilingual replies, and optional server-side Gemini proxy using `clinic-knowledge.json` context.
- [ ] Include Badami, TMC Complex location; clinic hours; Monday free consultation window; and requested dental specialties.
- [ ] Add Cloudflare Pages Function proxy, route manifest, README, and clean public-repository-ready source.
- [x] Run syntax/build checks and verify the site serves successfully on port 3000 before repository publication.
