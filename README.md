# Bhoomika Dental Clinic

A responsive, bilingual clinic website for Dr. Lata H. Teredal, BDS, at TMC Complex, Badami. The client is vanilla JavaScript with local CSS; appointment and notification services run through Cloudflare Pages Functions.

## Local preview

For a static visual preview, run:

```bash
python3 -m http.server 3000
```

Open `http://localhost:3000`. Pages Functions require Wrangler to preview; see the Cloudflare Pages documentation.

## Cloudflare Pages deployment

The Git-connected Cloudflare Pages project is `bhoomika-dental-clinic`, sourced from `samarthsm620-prog/bhoomika-dental-clinic` on `main`. The project serves the repository root (`.`) and discovers the root `functions/` directory automatically. Do not use `wrangler deploy` for this Pages project; that command targets Workers and can omit Pages Functions. Pushes to `main` are intended to deploy automatically.

The live Pages URL is `https://bhoomika-dental-clinic.pages.dev`. A custom domain is optional and should only be configured after the clinic owner selects and purchases one.

## Appointment request and payment flow

`POST /api/appointment` validates a consented appointment request, generates a reference (`BHC-YYYYMMDD-XXXXXXXX`, India time), and submits EmailJS template requests to the doctor, clinic assistant, and the email address entered by the patient. The function uses EmailJS service `service_oz00kf3`, template `template_lb2zn9m`, and Cloudflare settings `EMAILJS_PUBLIC_KEY`, `CLINIC_EMAIL`, and `CLINIC_ASSISTANT_EMAIL`. Both clinic recipients are required. It reports **provider acceptance**, not inbox delivery; the UI never claims that a message was delivered merely because EmailJS returned success.

Appointment intake uses EmailJS only: it does not call Stripe, Google Sheets, or a payment webhook. The site displays the clinic's PhonePe QR for the ₹100 fee only after EmailJS accepts both clinic notification requests; that acceptance is not proof of inbox delivery. If clinic notifications are only partially accepted, the patient is told to call before paying. Payment remains pending until clinic staff manually verify it and confirm availability. A request number is only a reference, not an appointment confirmation. If a preferred date and time are provided, the patient email includes an optional Google Calendar placeholder link clearly marked **not confirmed**. It is not a calendar invitation for a confirmed slot.

Clinic emails include contact details and requested time but omit the selected care area and free-text dental concern. The form does not upload attached X-rays or reports, and the appointment endpoint does not persist a durable booking record; if notifications fail, a request may not be retrievable later. A per-isolate, best-effort request throttle and idempotency cache reduce accidental repeats but are not a substitute for Cloudflare edge-level bot protection at higher traffic. SMS is not offered, so the form does not request SMS consent or claim an SMS was sent. The existing WhatsApp click-to-open and callback paths remain separate from appointment intake; WhatsApp receives the entered form details only when the user clicks that button.

Configure `EMAILJS_PUBLIC_KEY`, `CLINIC_EMAIL`, `CLINIC_ASSISTANT_EMAIL`, and `CLINIC_PAYMENT_QR_URL` as Cloudflare Pages production secrets/variables. The service and template IDs are in the appointment function. Use the required EmailJS fields documented in [`EMAILJS-PAYLOAD-CONTRACT.md`](EMAILJS-PAYLOAD-CONTRACT.md). Never commit API keys, email recipient values, or patient data.

## Gemini assistant

The browser calls the `/api/gemini` Pages Function using the currently listed `gemini-3.5-flash-lite` model ([official model list](https://ai.google.dev/gemini-api/docs/models)). `GEMINI_API_KEY` must be set as an encrypted Pages secret. If Gemini is unavailable, the assistant clearly says it is showing local clinic facts instead. The clinic-knowledge rules prohibit symptom diagnosis or recommending a procedure from symptoms alone.

## Media and accessibility

The hero carousel uses the clinic's own treatment-room, clinician, and exterior photos. The existing background videos are preserved. User-provided infographics containing non-local or third-party claims are not presented as clinic facts. The site includes an English/Kannada toggle, keyboard focus states, reduced-motion behavior, landmarks, labels, and status announcements.
