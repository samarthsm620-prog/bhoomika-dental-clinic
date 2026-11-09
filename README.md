# Bhoomika Dental Clinic

Accessible bilingual dental clinic landing page for Bhoomika Dental Clinic, Badami.

## Run locally

```bash
python3 -m http.server 3000
```

Open `http://localhost:3000`.

## Webhook integration

The browser posts text/plain JSON to the configured Manus Trigger webhooks:

- Appointment and preventive screening: `workflow_type` is `appointment` or `preventive_screening`.
- Callback triage: sticky callback form payload.

The webhook constants live at the top of `app.js`.

## Optional Gemini assistant

The browser calls `/api/gemini` when the endpoint is available. On Cloudflare Pages, set the encrypted `GEMINI_API_KEY` environment variable and deploy the included `functions/api/gemini.js`. Without the key or endpoint, the assistant still works with Web Speech API and local dental intent matching.

## Cloudflare Pages

Use this repository as a Pages project with the project root as the build directory. The site is static; the Pages Function in `functions/` is deployed automatically. No build command is required.

## Privacy

Do not commit patient records, API keys, or production secrets. The client validates required fields but production systems should also apply server-side validation, retention, consent, and access controls.
