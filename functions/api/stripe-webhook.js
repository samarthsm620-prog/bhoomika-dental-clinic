// Stripe webhook: on a verified, paid ₹100 checkout, email "payment successful" to the patient and clinic via EmailJS.
// Secrets (Cloudflare Pages): STRIPE_WEBHOOK_SECRET, EMAILJS_PUBLIC_KEY, CLINIC_EMAIL, CLINIC_ASSISTANT_EMAIL; optional EMAILJS_PRIVATE_KEY
const SITE_ORIGIN = 'https://bhoomika-dental-clinic.pages.dev';
const EXPECTED_AMOUNT_PAISE = 10000;
const TOLERANCE_SECONDS = 300;
const clean = (v, max = 300) => String(v ?? '').replace(/[<>\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function verifyStripeSignature(rawBody, header, secret, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=').map((s) => s.trim())).filter((p) => p.length === 2));
  const t = Number(parts.t);
  const signatures = header.split(',').filter((p) => p.trim().startsWith('v1=')).map((p) => p.trim().slice(3));
  if (!t || !signatures.length || Math.abs(now / 1000 - t) > TOLERANCE_SECONDS) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${rawBody}`)));
  return signatures.some((s) => s.length === expected.length && [...s].reduce((d, c, i) => d | (c.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0);
}

async function sendEmail(env, templateParams) {
  if (!env.EMAILJS_PUBLIC_KEY) return false;
  const body = { service_id: 'service_oz00kf3', template_id: 'template_lb2zn9m', user_id: env.EMAILJS_PUBLIC_KEY, template_params: templateParams };
  if (env.EMAILJS_PRIVATE_KEY) body.accessToken = env.EMAILJS_PRIVATE_KEY;
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: SITE_ORIGIN, referer: `${SITE_ORIGIN}/` },
    body: JSON.stringify(body)
  });
  return res.ok;
}

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  if (!(await verifyStripeSignature(raw, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET))) {
    return new Response('Invalid signature', { status: 400 });
  }
  let event;
  try { event = JSON.parse(raw); } catch { return new Response('Bad payload', { status: 400 }); }
  if (event.type !== 'checkout.session.completed') return Response.json({ received: true, ignored: event.type });

  const s = event.data?.object || {};
  if (s.payment_status !== 'paid' || s.currency !== 'inr' || s.amount_total !== EXPECTED_AMOUNT_PAISE) {
    return Response.json({ received: true, ignored: 'not a paid ₹100 INR session' });
  }
  const appt = clean(s.metadata?.appointment_number || s.client_reference_id, 40);
  const name = clean(s.metadata?.patient_name, 100) || 'Patient';
  const email = clean(s.customer_details?.email || s.customer_email, 160);
  const paidAt = new Date((event.created || Date.now() / 1000) * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const common = {
    appointment_number: appt, appointment_fee_inr: '100', payment_status: 'PAID — payment succeeded',
    payment_qr_url: '', calendar_link: '', patient_first_aid: ''
  };
  const doctor = clean(env.CLINIC_EMAIL, 160).toLowerCase();
  const assistant = clean(env.CLINIC_ASSISTANT_EMAIL, 160).toLowerCase();
  const results = { patient: false, clinic: 0 };

  if (email) {
    results.patient = await sendEmail(env, {
      ...common, to_email: email, reply_to: doctor, recipient_name: name,
      email_subject: `Payment successful — ${appt}`,
      message_body: [
        `Hello ${name}, your payment of ₹100 INR was successful.`,
        `Appointment number: ${appt}`, `Paid on (IST): ${paidAt}`,
        'Clinic: Bhoomika Dental Clinic, TMC Complex, Badami, Karnataka, India', 'Clinic phone: +91 9481731482',
        'The clinic will confirm your appointment time. Please keep this email as your receipt.'
      ].join('\n')
    }).catch(() => false);
  }
  for (const to of [...new Set([doctor, assistant].filter(Boolean))]) {
    const ok = await sendEmail(env, {
      ...common, to_email: to, reply_to: email, recipient_name: 'Bhoomika Dental Clinic team',
      email_subject: `Payment received — ${appt}`,
      message_body: `PAYMENT RECEIVED (Stripe)\nAppointment number: ${appt}\nPatient: ${name}\nEmail: ${email}\nAmount: ₹100 INR\nPaid on (IST): ${paidAt}`
    }).catch(() => false);
    if (ok) results.clinic += 1;
  }
  // Return 5xx if nothing was accepted so Stripe retries the webhook.
  if (!results.patient && results.clinic === 0) return Response.json({ received: true, email: 'failed' }, { status: 502 });
  return Response.json({ received: true, email_accepted: results });
}
