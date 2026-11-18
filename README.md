# Bhoomika Dental Clinic

A responsive, bilingual clinic website for Dr. Lata H. Teredal, BDS, at TMC Complex, Badami. The client is vanilla JavaScript with local CSS Grid layouts; appointment, Gemini, and notification services run through Cloudflare Pages Functions.

## Local preview

For a static visual preview, run:

```bash
python3 -m http.server 3000
```

Open `http://localhost:3000`. Pages Functions require Wrangler to preview; see the Cloudflare Pages documentation and the integration setup guide in [`google-sheets/README.md`](google-sheets/README.md).

## Cloudflare Pages deployment

The Git-connected Cloudflare Pages project is `bhoomika-dental-clinic`, sourced from `samarthsm620-prog/bhoomika-dental-clinic` on `main`. The project serves the repository root (`.`) and discovers the root `functions/` directory automatically. Do not use `wrangler deploy` for this Pages project; that command targets Workers and can omit Pages Functions. Pushes to `main` are intended to deploy automatically.

The live Pages URL is `https://bhoomika-dental-clinic.pages.dev`. A custom domain is optional and should only be configured after the clinic owner selects and purchases one.

## Appointment flow

`POST /api/appointment` validates the request on Cloudflare, requires an explicit consent checkbox, filters spam honeypot submissions, and sends data to configured integrations. It can append an idempotent row to a private Google Sheet through the server-side Apps Script webhook and send separate clinic and patient emails through one EmailJS template. The patient email is a receipt, not an appointment confirmation, and includes general urgent-care guidance. The existing WhatsApp click-to-open and callback paths remain available. The form does not upload attached X-rays or reports; patients are asked to bring them or share them after clinic contact.

Configure production secrets in Cloudflare Pages using the variable names in `.env.example`. Follow [`google-sheets/README.md`](google-sheets/README.md) for the exact Apps Script properties, email template variables, and deployment steps. Never commit API keys, shared tokens, patient data, or deployed webhook URLs.

## Gemini assistant

The browser calls the `/api/gemini` Pages Function using the currently listed `gemini-3.5-flash-lite` model ([official model list](https://ai.google.dev/gemini-api/docs/models)). `GEMINI_API_KEY` must be set as an encrypted Pages secret. If Gemini is unavailable, the assistant clearly says it is showing local clinic facts instead. The clinic-knowledge rules prohibit symptom diagnosis or recommending a procedure from symptoms alone.

## Media and accessibility

The hero carousel uses the clinic's own treatment-room, clinician, and exterior photos. The existing background videos are preserved. User-provided infographics containing non-local or third-party claims are not presented as clinic facts. The site includes an English/Kannada toggle, keyboard focus states, reduced-motion behavior, landmarks, labels, and status announcements.
