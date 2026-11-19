// Creates a Stripe Checkout Session for the ₹100 appointment fee.
// Secrets (Cloudflare Pages): STRIPE_SECRET_KEY
const SITE_ORIGIN = 'https://bhoomika-dental-clinic.pages.dev';
export const APPOINTMENT_AMOUNT_PAISE = 10000; // ₹100.00 INR
const corsHeaders = {
  'access-control-allow-origin': SITE_ORIGIN,
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};
const json = (body, status = 200) => Response.json(body, { status, headers: corsHeaders });
const clean = (v, max = 200) => String(v ?? '').replace(/[<>\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== SITE_ORIGIN) return json({ error: 'Request origin not allowed.' }, 403);
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Online payment is not configured. Please use the PhonePe QR.' }, 503);

  let input;
  try { input = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const appointmentNumber = clean(input?.appointment_number, 40);
  const patientEmail = clean(input?.patient_email, 160);
  const patientName = clean(input?.patient_name, 100);
  if (!/^BHC-\d{8}-[A-Z0-9]{8}$/.test(appointmentNumber) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
    return json({ error: 'Valid appointment number and patient email are required.' }, 400);
  }

  const form = new URLSearchParams({
    mode: 'payment',
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'inr',
    'line_items[0][price_data][unit_amount]': String(APPOINTMENT_AMOUNT_PAISE),
    'line_items[0][price_data][product_data][name]': 'Bhoomika Dental Clinic — appointment fee',
    customer_email: patientEmail,
    client_reference_id: appointmentNumber,
    'metadata[appointment_number]': appointmentNumber,
    'metadata[patient_name]': patientName,
    success_url: `${SITE_ORIGIN}/?payment=return`,
    cancel_url: `${SITE_ORIGIN}/?payment=cancelled`
  });
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) return json({ error: 'Could not start online payment. Please use the PhonePe QR.' }, 502);
  return json({ ok: true, checkout_url: data.url, amount_inr: 100 });
}
