# Bhoomika Dental Clinic EmailJS Payload Contract

The website sends appointment messages through `https://api.emailjs.com/api/v1.0/email/send` using the clinic's EmailJS service, template, and public key.

## Common REST envelope

```json
{
  "service_id": "service_oz00kf3",
  "template_id": "template_lb2zn9m",
  "user_id": "4F8rvg3HsYXpJ3NTa",
  "template_params": {}
}
```

The public key is only used server-side by the Cloudflare Pages Function; it is not embedded in the frontend.

## Clinic notification payload

The appointment Function sends one clinic notification to each configured recipient:

- `drlatamabrumkar@gmail.com`
- `assistantbhoomikadentalclinic@gmail.com`

```json
{
  "to_email": "drlatamabrumkar@gmail.com",
  "reply_to": "patient@example.com",
  "email_subject": "Appointment request — Synthetic Patient",
  "recipient_name": "Bhoomika Dental Clinic team",
  "appointment_fee_inr": "100",
  "payment_status": "pending",
  "payment_qr_url": "https://bhoomika-dental-clinic.pages.dev/images/payment/phonepe-appointment-qr.jpeg",
  "message_body": "NEW APPOINTMENT REQUEST\nRequest ID: example-request-id\nPatient: Synthetic Patient\nPhone: +919000000000\nEmail: patient@example.com\nRequest type: Appointment request\nCare area: Routine dental check-up\nPreferred date/time: 2099-01-01 10:30\nConcern: Synthetic test only\nLanguage: en\nAppointment fee: ₹100 INR — pending payment\nPhonePe QR: https://bhoomika-dental-clinic.pages.dev/images/payment/phonepe-appointment-qr.jpeg",
  "patient_first_aid": ""
}
```

The second clinic payload is identical except for:

```json
{
  "to_email": "assistantbhoomikadentalclinic@gmail.com"
}
```

## Patient receipt payload

```json
{
  "to_email": "patient@example.com",
  "reply_to": "drlatamabrumkar@gmail.com",
  "email_subject": "We received your Bhoomika Dental Clinic request",
  "recipient_name": "Synthetic Patient",
  "appointment_fee_inr": "100",
  "payment_status": "pending",
  "payment_qr_url": "https://bhoomika-dental-clinic.pages.dev/images/payment/phonepe-appointment-qr.jpeg",
  "message_body": "Thank you, Synthetic Patient. The clinic has received your appointment request.\n\nAppointment fee: ₹100 INR — payment pending. Scan the PhonePe QR code shown below in this email, then keep the payment receipt. The clinic will verify payment and contact you to confirm availability. This is a request, not a confirmed appointment.\n\nPhonePe QR: https://bhoomika-dental-clinic.pages.dev/images/payment/phonepe-appointment-qr.jpeg\n\nClinic: +91 9481731482",
  "patient_first_aid": "If you have severe facial swelling, uncontrolled bleeding, a dental injury, or difficulty breathing or swallowing, seek urgent local medical care now. Do not wait for an email reply. This message is not a diagnosis or emergency service."
}
```

## Required EmailJS template fields

The EmailJS template must contain these fields:

```text
To: {{to_email}}
Subject: {{email_subject}}
Reply-To: {{reply_to}}

{{recipient_name}}
{{message_body}}
{{patient_first_aid}}
```

To render the QR image below the message, add this HTML in the EmailJS template editor:

```html
<hr>
<p><strong>₹100 INR appointment fee / PhonePe payment</strong></p>
<p>Payment status: {{payment_status}}</p>
<p>Appointment fee: ₹{{appointment_fee_inr}} INR</p>
<img src="{{payment_qr_url}}" alt="Bhoomika Dental Clinic PhonePe QR code" style="max-width:320px;width:100%;height:auto;display:block">
```

If the EmailJS editor strips the image tag, add this fallback link:

```html
<a href="{{payment_qr_url}}">Open the Bhoomika Dental Clinic PhonePe QR code</a>
```

## Paid Stripe webhook payload

After a verified Stripe `checkout.session.completed` event, the webhook sends the same three-recipient pattern with:

```json
{
  "appointment_number": "BHC-20261119-CS1234",
  "payment_status": "succeeded",
  "amount_inr": "100",
  "payment_qr_url": "https://bhoomika-dental-clinic.pages.dev/images/payment/phonepe-appointment-qr.jpeg",
  "clinic_phone": "+91 9481731482"
}
```

## Live Stripe test prerequisites

A live ₹100 Stripe test cannot run until these Cloudflare production secrets are supplied:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

The Stripe webhook endpoint is:

```text
https://bhoomika-dental-clinic.pages.dev/api/stripe-webhook
```

The checkout amount is fixed server-side at `10000` paise, which is ₹100 INR. The website currently has no Stripe secrets configured, so the successful live test performed on 2026-11-19 was the EmailJS-only appointment path, not a Stripe payment.
