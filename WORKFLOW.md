# Booking workflow (replaces the manual-only flow in EMAILJS-PAYLOAD-CONTRACT.md)

1. **Patient** submits the form (or Gemini fills it from voice/chat; the patient still reviews, ticks consent and submits). `POST /api/appointment` creates a row in Google Sheets (`requested`) and emails: doctor (Approve/Decline links), assistant (FYI), patient ("received, don't pay yet"). **No QR yet.**
2. **Doctor** opens the Approve link (GET shows a button; POST does the action) → `approved`. Patient gets "You are registered – pay ₹100" with the PhonePe QR and a "I have paid" link; assistant gets an FYI.
3. **Patient** pays, opens the link, enters the payment reference → `payment_claimed`. Doctor gets Confirm / Not-received links.
   - Stripe alternative: `/api/stripe-webhook` (signature verified) → `paid_online`, doctor gets the Confirm link.
4. **Doctor** confirms → `confirmed`. Patient gets appointment number + form details; assistant gets the same.

Status moves are enforced by the Sheet script (`ALLOWED` in `google-sheets/Code.gs`); repeat clicks send no duplicate emails. Links are HMAC-signed with `WORKFLOW_SECRET`.

Cloudflare secrets: `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, `CLINIC_EMAIL`, `CLINIC_ASSISTANT_EMAIL`, `WORKFLOW_SECRET`, `SHEETS_WEBAPP_URL`, `SHEETS_TOKEN`, `GEMINI_API_KEY`, optional `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
Tests: `npm test` (mocked EmailJS/Sheets/Stripe). EmailJS acceptance is not proof of inbox delivery.
