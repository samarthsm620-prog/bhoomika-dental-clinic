# Bhoomika Dental Clinic — Implementation Plan

## Product
A premium, bilingual dental clinic landing page for Bhoomika Dental Clinic in Badami, with appointment intake, preventive-screening routing, callback triage, specialty discovery, doctor trust signals, and an accessible voice assistant.

## Design direction
- **Design movement:** editorial healthcare precision with warm Indian-clinic hospitality.
- **Core principles:** calm authority, high-contrast clarity, reassuring microcopy, and progressive disclosure.
- **Color philosophy:** deep indigo-blue communicates clinical trust; aqua and mint accents signal freshness and oral health; warm coral is reserved for urgent actions.
- **Layout paradigm:** asymmetrical split hero and offset content bands, with the booking panel visually anchored to the right and specialty content flowing in staggered cards.
- **Signature elements:** pill-shaped utility links, a mint “care signal” rail, and thin line-work dental motifs.
- **Interaction philosophy:** every action gives an immediate state update, visible focus, and plain-language confirmation.
- **Animation:** subtle lift/fade only; respect `prefers-reduced-motion`.
- **Typography:** system sans stack with wide display headings, readable 1rem body copy, and generous line height.
- **Brand essence:** local dental expertise with hospital-grade clarity; reassuring, precise, human.
- **Brand voice:** “Small steps. Stronger smiles.” and “Tell us what you need; we’ll guide the next step.”
- **Wordmark:** a simple tooth-and-sun monogram built in CSS/SVG, paired with the clinic name.
- **Signature brand color:** Bhoomika mint `#b8f2df`.

## Implementation
- Static HTML/CSS/vanilla JavaScript for Cloudflare Pages.
- `clinic-knowledge.json` stores bilingual clinic facts and assistant mappings.
- `functions/api/gemini.js` provides an optional server-side Gemini proxy using `GEMINI_API_KEY`; the browser falls back to local intent matching and Web Speech API if unavailable.
- Main booking webhook uses `workflow_type: appointment|preventive_screening`.
- Sticky callback form posts to the callback-triage webhook.
- Appointment and callback submissions use text/plain JSON bodies to remain simple-request friendly from static hosting.
- No Apollo proprietary assets or brand marks are copied; the visual language is an original healthcare interpretation.

## Project structure
- `index.html` — semantic page, forms, content sections, live regions.
- `styles.css` — responsive visual system and reduced-motion/accessibility rules.
- `app.js` — translations, form routing, specialty search, voice assistant, webhook client.
- `clinic-knowledge.json` — assistant facts and search mappings.
- `functions/api/gemini.js` — optional Cloudflare Pages Function proxy.
- `public/manus-routes.json` — route manifest.
- `README.md` — local run, webhook, Gemini, and Cloudflare setup.
