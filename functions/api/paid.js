// Patient tells the clinic they have paid via the PhonePe QR (link from the "You are registered" email).
import { SITE_ORIGIN, FEE, clean, verify, sheet, sendEmail, recipients, reviewLink, delay } from '../_lib/workflow.js';
const cors = { 'access-control-allow-origin': SITE_ORIGIN, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'cache-control': 'no-store' };
const json = (b, s = 200) => Response.json(b, { status: s, headers: cors });
export const onRequestOptions = () => new Response(null, { status: 204, headers: cors });

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== SITE_ORIGIN) return json({ error: 'Request origin not allowed.' }, 403);
  let input; try { input = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const id = clean(input?.id, 40), sig = clean(input?.sig, 64), ref = clean(input?.payment_ref, 60);
  if (ref.length < 4) return json({ error: 'Please enter your payment reference (UTR / transaction ID).' }, 400);
  if (!(await verify(env, id, 'paid', sig))) return json({ error: 'This payment link is not valid.' }, 403);

  const r = await sheet(env, 'transition', { appointment_no: id, to: 'payment_claimed', payment_ref: ref, payment_claimed_at: new Date().toISOString() });
  if (!r.ok) return json({ error: r.error === 'bad_state' ? `This booking is currently "${r.status}"; payment can't be reported now.` : 'Could not save. Please call the clinic.' }, r.error === 'bad_state' ? 409 : 502);
  if (r.unchanged) return json({ ok: true, message: 'Payment already reported. The clinic will confirm shortly.' });

  const b = r.booking; const { doctor, assistant } = recipients(env);
  const okDoctor = await sendEmail(env, {
    to_email: doctor, reply_to: b.patient_email, appointment_number: id, email_subject: `Confirm payment — ${id}`,
    message_body: `Patient reports a ₹${FEE} PhonePe payment.\nRequest: ${id}\nPatient: ${b.patient_name}, ${b.phone}\nPayment reference given: ${ref}\n\nCheck your PhonePe app, then:\nPayment received — confirm appointment:\n${await reviewLink(env, id, 'confirm')}\n\nPayment NOT found:\n${await reviewLink(env, id, 'reject_payment')}`
  });
  await delay(1100);
  await sendEmail(env, { to_email: assistant, reply_to: b.patient_email, appointment_number: id, email_subject: `Payment reported — awaiting doctor — ${id}`, message_body: `${b.patient_name} reported payment (ref ${ref}) for ${id}. Doctor has been asked to confirm.` });
  await delay(1100);
  await sendEmail(env, { to_email: b.patient_email, reply_to: doctor, recipient_name: b.patient_name, appointment_number: id, email_subject: `Payment noted — ${id}`, message_body: `Hello ${b.patient_name}, we noted your payment reference ${ref}. The doctor will confirm it and you will receive your final appointment details by email.` });
  return json({ ok: true, doctor_email_accepted: okDoctor, message: 'Thank you. The doctor will confirm your payment; you will get an email with your appointment details.' });
}
