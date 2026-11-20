// Doctor review links (from email). GET shows a confirm button (so mail scanners can't trigger actions); POST performs the step.
import { SITE_ORIGIN, CLINIC_ADDRESS, CLINIC_PHONE, DEFAULT_QR_URL, FEE, clean, sign, verify, sheet, sendEmail, recipients, html, delay } from '../_lib/workflow.js';

const ACTIONS = {
  approve: { from: 'requested', to: 'approved', label: 'Approve this request and ask the patient to pay ₹100', stamp: 'doctor_verified_at' },
  decline: { from: 'requested', to: 'declined', label: 'Decline this request' },
  confirm: { from: 'payment_claimed', to: 'confirmed', label: 'Confirm payment received and the appointment', stamp: 'payment_confirmed_at' },
  reject_payment: { from: 'payment_claimed', to: 'payment_rejected', label: 'Payment NOT received — ask the patient to retry' }
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function params(request) {
  const url = new URL(request.url);
  let src = url.searchParams;
  if (request.method === 'POST') src = new URLSearchParams(await request.text());
  return { id: clean(src.get('id'), 40), action: clean(src.get('action'), 20), sig: clean(src.get('sig'), 64) };
}

export async function onRequestGet({ request, env }) {
  const { id, action, sig } = await params(request);
  if (!ACTIONS[action] || !(await verify(env, id, action, sig))) return html('Link not valid', '<p>This link is invalid or has been altered.</p>', 400);
  return html('Bhoomika Dental Clinic', `<p>Request <b>${esc(id)}</b></p><p>${esc(ACTIONS[action].label)}?</p>
    <form method="post"><input type="hidden" name="id" value="${esc(id)}"><input type="hidden" name="action" value="${esc(action)}"><input type="hidden" name="sig" value="${esc(sig)}">
    <button style="font-size:1rem;padding:12px 20px">Yes, do it</button></form>`);
}

export async function onRequestPost({ request, env }) {
  const { id, action, sig } = await params(request);
  const a = ACTIONS[action];
  if (!a || !(await verify(env, id, action, sig))) return html('Link not valid', '<p>This link is invalid or has been altered.</p>', 400);

  const now = new Date().toISOString();
  const r = await sheet(env, 'transition', { appointment_no: id, to: a.to, ...(a.stamp ? { [a.stamp]: now } : {}) });
  if (!r.ok) {
    if (r.error === 'bad_state') return html('Already handled', `<p>This request is currently <b>${esc(r.status)}</b>, so this action no longer applies.</p>`, 409);
    return html('Could not save', '<p>The booking record could not be updated. Nothing was sent. Please try again in a minute.</p>', 502);
  }
  if (r.unchanged) return html('Already done', `<p>This step was already completed for <b>${esc(id)}</b>. No emails were re-sent.</p>`);

  const b = r.booking;
  const { doctor, assistant } = recipients(env);
  const when = [b.preferred_date, b.preferred_time].filter(Boolean).join(' ') || 'Flexible';
  const qr = clean(env.CLINIC_PAYMENT_QR_URL, 500) || DEFAULT_QR_URL;
  let patientMsg, assistantMsg, extra = {};

  if (action === 'approve') {
    const paidSig = await sign(env, id, 'paid');
    patientMsg = {
      email_subject: `You are registered — please pay ₹${FEE} — ${id}`, payment_status: `₹${FEE} payment pending`, payment_qr_url: qr,
      message_body: `Hello ${b.patient_name}, the doctor has verified your request ${id}. You are registered.\nRequested (IST): ${when}\nClinic: Bhoomika Dental Clinic, ${CLINIC_ADDRESS}\n\nTo secure your appointment please pay ₹${FEE} by scanning the PhonePe QR: ${qr}\n\nAfter paying, tell us here (enter your payment reference): ${SITE_ORIGIN}/?pay=${encodeURIComponent(id)}&sig=${paidSig}\nThe clinic then confirms your payment and sends your final appointment details.\nClinic phone: ${CLINIC_PHONE}`
    };
    assistantMsg = { email_subject: `Doctor verified — patient asked to pay — ${id}`, message_body: `Doctor verified ${id} (${b.patient_name}). The patient has been emailed the ₹${FEE} PhonePe QR.` };
  } else if (action === 'decline') {
    patientMsg = { email_subject: `Update on your request — ${id}`, message_body: `Hello ${b.patient_name}, the clinic could not accept request ${id} for the requested time. Please call ${CLINIC_PHONE} to arrange another time. No payment is needed.` };
    assistantMsg = { email_subject: `Doctor declined — ${id}`, message_body: `Doctor declined ${id} (${b.patient_name}). Patient informed.` };
  } else if (action === 'confirm') {
    patientMsg = {
      email_subject: `Appointment confirmed — ${id}`, payment_status: 'PAID — payment succeeded',
      message_body: `Hello ${b.patient_name}, your payment of ₹${FEE} has been received and your appointment is confirmed.\n\nAppointment number: ${id}\nName: ${b.patient_name}\nPhone: ${b.phone}\nCare area: ${b.care_area}\nDate/time (IST): ${when}\nClinic: Bhoomika Dental Clinic, ${CLINIC_ADDRESS}\nPayment reference: ${b.payment_ref || 'recorded by clinic'}\nClinic phone: ${CLINIC_PHONE}\n\nPlease arrive 10 minutes early. If you need to change the time, call the clinic.`
    };
    assistantMsg = { email_subject: `CONFIRMED — ${id}`, message_body: `Doctor confirmed payment and appointment ${id}.\nPatient: ${b.patient_name}, ${b.phone}, ${b.patient_email}\nCare area: ${b.care_area}\nDate/time: ${when}\nPatient has been emailed the confirmation.` };
  } else {
    const paidSig = await sign(env, id, 'paid');
    patientMsg = { email_subject: `Payment not found — ${id}`, message_body: `Hello ${b.patient_name}, the clinic could not find your ₹${FEE} payment for ${id}. If you have paid, please re-enter the reference here: ${SITE_ORIGIN}/?pay=${encodeURIComponent(id)}&sig=${paidSig} or call ${CLINIC_PHONE}.` };
    assistantMsg = { email_subject: `Payment not found — ${id}`, message_body: `Doctor could not find payment for ${id} (${b.patient_name}). Patient asked to retry.` };
  }
  const okPatient = await sendEmail(env, { to_email: b.patient_email, reply_to: doctor, recipient_name: b.patient_name, appointment_number: id, ...patientMsg });
  await delay(1100);
  const okAssistant = await sendEmail(env, { to_email: assistant, reply_to: b.patient_email, appointment_number: id, ...assistantMsg });
  return html('Done', `<p>Saved: <b>${esc(a.to)}</b> for ${esc(id)}.</p><p>Patient email accepted by EmailJS: ${okPatient ? 'yes' : '<b>NO — please call the patient</b>'}. Assistant email: ${okAssistant ? 'yes' : 'no'}.</p>`);
}
