const SITE_ORIGIN = 'https://bhoomika-dental-clinic.pages.dev';
const headers = { 'access-control-allow-origin': SITE_ORIGIN, 'cache-control': 'no-store' };
const json = (body, status = 200) => Response.json(body, { status, headers });
const clean = (value, max = 1000) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hex(buffer) { return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
function constantTimeEqual(a, b) { if (!a || a.length !== b.length) return false; let mismatch = 0; for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i); return mismatch === 0; }
async function verifyStripeSignature(raw, signature, secret) {
  const parts = String(signature || '').split(',').map((item) => item.split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${raw}`)));
  return signatures.some((candidate) => constantTimeEqual(digest, candidate));
}
function appointmentNumber(session) {
  const date = new Date((session.created || Math.floor(Date.now() / 1000)) * 1000);
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = clean(session.id, 12).replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase();
  return `BHC-${datePart}-${suffix || 'PAID'}`;
}
async function sendEmail(env, params) {
  if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_TEMPLATE_ID || !env.EMAILJS_PUBLIC_KEY) return false;
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: SITE_ORIGIN, referer: `${SITE_ORIGIN}/` },
    body: JSON.stringify({ service_id: env.EMAILJS_SERVICE_ID, template_id: env.EMAILJS_TEMPLATE_ID, user_id: env.EMAILJS_PUBLIC_KEY, template_params: params })
  });
  return response.ok;
}
async function logPayment(payload, env) {
  if (!env.GOOGLE_SHEETS_WEBHOOK_URL || !env.GOOGLE_SHEETS_SHARED_SECRET) return false;
  const body = new URLSearchParams({ token: env.GOOGLE_SHEETS_SHARED_SECRET, payload: JSON.stringify(payload) });
  const response = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body });
  const result = await response.json().catch(() => null);
  return response.ok && Boolean(result?.ok);
}

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: 'Stripe webhook is not configured.' }, 503);
  const raw = await request.text();
  if (!await verifyStripeSignature(raw, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET)) return json({ error: 'Invalid Stripe signature.' }, 400);
  let event;
  try { event = JSON.parse(raw); } catch { return json({ error: 'Invalid Stripe event.' }, 400); }
  if (event.type !== 'checkout.session.completed') return json({ received: true, ignored: true });
  const session = event.data?.object;
  if (!session || session.payment_status !== 'paid') return json({ received: true, ignored: true, reason: 'not_paid' });

  const metadata = session.metadata || {};
  const number = appointmentNumber(session);
  const clinicEmail = clean(env.CLINIC_EMAIL, 160).toLowerCase();
  const patientEmail = clean(session.customer_details?.email || metadata.patient_email, 160).toLowerCase();
  if (!clinicEmail || !patientEmail) return json({ error: 'Clinic or patient email is missing.' }, 502);
  const paymentQrUrl = clean(env.CLINIC_PAYMENT_QR_URL, 500);
  const details = [
    `Appointment no.: ${number}`,
    `Payment: ₹${((session.amount_total || 10000) / 100).toFixed(2)} INR — succeeded`,
    `Patient: ${clean(metadata.patient_name, 100)}`,
    `Phone: ${clean(metadata.patient_phone, 32)}`,
    `Email: ${patientEmail}`,
    `Care area: ${clean(metadata.specialty, 120)}`,
    `Preferred date/time: ${clean(metadata.preferred_date, 24) || 'Flexible'} ${clean(metadata.preferred_time, 24)}`.trim(),
    `Clinic: TMC Complex, Badami`,
    `Clinic phone: +91 9481731482`,
    `Stripe session: ${clean(session.id, 100)}`
  ].join('\n');
  const qrText = paymentQrUrl ? `\nClinic PhonePe/UPI QR: ${paymentQrUrl}` : '\nClinic payment QR: not configured yet.';
  const common = { appointment_number: number, payment_status: 'succeeded', amount_inr: '100', payment_qr_url: paymentQrUrl, clinic_phone: '+91 9481731482' };
  let clinicSent = false; let patientSent = false;
  try { clinicSent = await sendEmail(env, { ...common, to_email: clinicEmail, email_subject: `Payment succeeded — ${number}`, reply_to: patientEmail, recipient_name: 'Bhoomika Dental Clinic team', message_body: `PAID APPOINTMENT\n${details}${qrText}`, patient_first_aid: '' }); } catch (_) {}
  await delay(1100);
  try { patientSent = await sendEmail(env, { ...common, to_email: patientEmail, email_subject: `Appointment confirmed — ${number}`, reply_to: clinicEmail, recipient_name: clean(metadata.patient_name, 100), message_body: `Your ₹100 INR appointment payment succeeded.\n\nAppointment no.: ${number}\n${details}${qrText}\n\nThe clinic will contact you if the requested time needs adjustment. This email confirms payment and request receipt; the clinic may still need to confirm availability.`, patient_first_aid: '' }); } catch (_) {}
  const logged = await logPayment({ ...metadata, request_id: `stripe:${session.id}`, patient_email: patientEmail, appointment_number: number, payment_status: 'succeeded', payment_amount_inr: 100, stripe_session_id: session.id, dental_concern: `${metadata.dental_concern || ''} Payment succeeded; appointment ${number}.` }, env);
  return json({ ok: true, appointment_number: number, clinic_email_sent: clinicSent, patient_email_sent: patientSent, sheets_logged: logged });
}
