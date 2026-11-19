# Bhoomika Dental Clinic EmailJS Payload Contract

Appointment booking is a direct EmailJS notification flow. It does not depend on Stripe, Google Sheets, or a payment webhook. The PhonePe QR is supplied in the same email template, while payment remains pending for manual clinic verification.

## Service configuration

- EmailJS service ID: `service_oz00kf3`
- EmailJS template ID: `template_lb2zn9m`
- Cloudflare secrets: `EMAILJS_PUBLIC_KEY`, `CLINIC_EMAIL`, and `CLINIC_ASSISTANT_EMAIL`
- Patient recipient: the email address submitted with the request
- QR image: `https://bhoomika-dental-clinic.pages.dev/images/payment/phonepe-appointment-qr.jpeg`

Both distinct clinic recipients must be configured; the function fails closed if either address is missing or duplicated. The website never stores or asks for an EmailJS account password. Recipient addresses and the EmailJS public key remain in Cloudflare settings, not this repository.

## Appointment number and status

Each request gets a reference in this format:

```text
BHC-YYYYMMDD-XXXXXXXX
```

The date uses Asia/Kolkata. This reference is generated for the request; it is not proof of a confirmed time slot or payment. The appointment endpoint does not currently store a durable booking record, so the number is carried in the email notifications rather than backed by a database.

The ₹100 PhonePe payment status remains `pending — manual PhonePe verification`. The clinic must verify payment and availability before confirming an appointment. EmailJS HTTP success means the provider accepted an email request; it does **not** prove delivery to the recipient's inbox. The API returns `delivery_verified: false` and separate accepted counts for clinic and patient messages.

## Clinic notification template parameters

Each clinic recipient receives one request with these parameters:

```json
{
  "to_email": "clinic recipient from Cloudflare settings",
  "reply_to": "patient@example.com",
  "email_subject": "Appointment request — BHC-20261119-ABCDEF12",
  "recipient_name": "Bhoomika Dental Clinic team",
  "appointment_number": "BHC-20261119-ABCDEF12",
  "appointment_fee_inr": "100",
  "payment_status": "pending — manual PhonePe verification",
  "payment_qr_url": "https://bhoomika-dental-clinic.pages.dev/images/payment/phonepe-appointment-qr.jpeg",
  "calendar_link": "optional tentative Google Calendar URL, when date and time were provided",
  "message_body": "Request number, patient contact details, generic appointment-coordination notice, requested time, pending-payment note, clinic location, and PhonePe QR link",
  "patient_first_aid": ""
}
```

The selected care area, free-text dental concern, and uploaded filenames are not included in appointment notification emails. The form does not upload files.

## Patient receipt template parameters

```json
{
  "to_email": "patient@example.com",
  "reply_to": "doctor recipient from Cloudflare settings",
  "email_subject": "Request received — BHC-20261119-ABCDEF12",
  "recipient_name": "Synthetic Patient",
  "appointment_number": "BHC-20261119-ABCDEF12",
  "appointment_fee_inr": "100",
  "payment_status": "pending — manual PhonePe verification",
  "payment_qr_url": "https://bhoomika-dental-clinic.pages.dev/images/payment/phonepe-appointment-qr.jpeg",
  "calendar_link": "optional tentative Google Calendar URL, when date and time were provided",
  "message_body": "Request number, requested time (not confirmed), clinic address, pending PhonePe payment instructions, QR link, and a tentative calendar link when available",
  "patient_first_aid": "Generic urgent-care guidance only"
}
```

The calendar link is a **tentative placeholder for the requested time**, not a confirmed calendar invitation. It is omitted when the patient does not provide both a valid preferred date and time.

## Required EmailJS template fields

Configure the EmailJS template with:

```text
To: {{to_email}}
Subject: {{email_subject}}
Reply-To: {{reply_to}}
```

Use `{{recipient_name}}`, `{{appointment_number}}`, `{{message_body}}`, and `{{patient_first_aid}}` in the body. To render the QR as an image, the EmailJS HTML template must include:

```html
<hr>
<p><strong>Appointment request {{appointment_number}}</strong></p>
<p>Fee: ₹{{appointment_fee_inr}} INR</p>
<p>Payment status: {{payment_status}}</p>
<img src="{{payment_qr_url}}" alt="Bhoomika Dental Clinic PhonePe QR code" style="max-width:320px;width:100%;height:auto;display:block">
<p><a href="{{payment_qr_url}}">Open the PhonePe QR code</a></p>
```

For a requested date/time, add a link only as a tentative placeholder:

```html
<a href="{{calendar_link}}">Add this requested time to your calendar (not confirmed)</a>
```

If EmailJS strips the image, keep the direct QR link so patients can still open it. A successful EmailJS response is not a delivery receipt; verify a test message in the destination inbox before describing it as received.

## API response example

```json
{
  "ok": true,
  "appointment_number": "BHC-20261119-ABCDEF12",
  "email_provider": "EmailJS",
  "email_status": "accepted",
  "clinic_recipients_expected": 2,
  "clinic_recipients_accepted": 2,
  "patient_email_accepted": true,
  "delivery_verified": false,
  "payment_status": "pending_manual_phonepe_verification"
}
```

`accepted` means EmailJS accepted each send request. `partial`, `failed`, and `not_configured` are reported separately. No status from the booking form means “payment received” or “appointment confirmed.”
