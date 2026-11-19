import { onRequestPost as onAppointmentPost } from './appointment.js';

const SITE_ORIGIN = 'https://bhoomika-dental-clinic.pages.dev';
const APPOINTMENT_AMOUNT_INR = 10000; // ₹100.00 in paise; fixed server-side.
const headers = {
  'access-control-allow-origin': SITE_ORIGIN,
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};
const json = (body, status = 200) => Response.json(body, { status, headers });
const clean = (value, max = 1000) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const formField = (form, key, value) => form.set(key, key.startsWith('metadata[') ? clean(value, 450) : value);

function normalize(input) {
  const payload = {
    workflow_type: clean(input?.workflow_type, 40),
    patient_name: clean(input?.patient_name, 100),
    patient_phone: clean(input?.patient_phone, 32),
    patient_email: clean(input?.patient_email, 160).toLowerCase(),
    specialty: clean(input?.specialty, 120),
    preferred_date: clean(input?.preferred_date, 24),
    preferred_time: clean(input?.preferred_time, 24),
    dental_concern: clean(input?.dental_concern, 450),
    language: clean(input?.language, 8),
    source: clean(input?.source, 64),
    request_id: clean(input?.request_id, 80) || crypto.randomUUID(),
    submitted_at: clean(input?.submitted_at, 40) || new Date().toISOString(),
    consent: input?.consent === true || ['true', 'yes', 'on'].includes(String(input?.consent || '').toLowerCase())
  };
  return payload;
}

function valid(payload) {
  const digits = payload.patient_phone.replace(/\D/g, '');
  return payload.patient_name.length >= 2
    && digits.length >= 7 && digits.length <= 15
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.patient_email)
    && payload.specialty.length > 0
    && ['appointment', 'preventive_screening'].includes(payload.workflow_type)
    && payload.consent;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers });
}

export async function onRequestPost({ request, env }) {
  let input;
  try { input = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const payload = normalize(input);
  if (!valid(payload)) return json({ error: 'Please provide valid appointment details and consent.' }, 400);

  // EmailJS-only mode keeps appointment notifications operational while Stripe is being configured.
  // Google Sheets remains optional and is not part of email delivery.
  if (!env.STRIPE_SECRET_KEY) {
    const emailResponse = await onAppointmentPost({
      request: new Request(request.url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
      env
    });
    if (!emailResponse.ok) return emailResponse;
    const result = await emailResponse.json();
    return json({ ...result, email_only: true, payment_required: false });
  }

  const form = new URLSearchParams();
  formField(form, 'mode', 'payment');
  formField(form, 'line_items[0][price_data][currency]', 'inr');
  formField(form, 'line_items[0][price_data][unit_amount]', String(APPOINTMENT_AMOUNT_INR));
  formField(form, 'line_items[0][price_data][product_data][name]', 'Bhoomika Dental Clinic appointment request');
  formField(form, 'line_items[0][price_data][product_data][description]', '₹100 appointment booking fee');
  formField(form, 'line_items[0][quantity]', '1');
  formField(form, 'customer_email', payload.patient_email);
  formField(form, 'client_reference_id', payload.request_id);
  formField(form, 'success_url', `${SITE_ORIGIN}/?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  formField(form, 'cancel_url', `${SITE_ORIGIN}/?payment=cancelled`);
  Object.entries(payload).forEach(([key, value]) => formField(form, `metadata[${key}]`, value === true ? 'true' : value));

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.url) return json({ error: 'Unable to create Stripe checkout session.' }, 502);
  return json({ ok: true, checkout_url: result.url, session_id: result.id, amount_inr: 100 });
}
