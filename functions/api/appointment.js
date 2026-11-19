const SITE_ORIGIN = 'https://bhoomika-dental-clinic.pages.dev';
const MAX_BODY_BYTES = 12000;
const corsHeaders = {
  'access-control-allow-origin': SITE_ORIGIN,
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};

const json = (body, status = 200) => Response.json(body, { status, headers: corsHeaders });
const clean = (value, max = 1000) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function safePayload(input) {
  const fields = {
    workflow_type: 40,
    patient_name: 100,
    patient_phone: 32,
    patient_email: 160,
    specialty: 120,
    preferred_date: 24,
    preferred_time: 24,
    dental_concern: 700,
    language: 8,
    source: 64
  };
  const payload = Object.fromEntries(Object.entries(fields).map(([key, max]) => [key, clean(input?.[key], max)]));
  payload.consent = input?.consent === true || ['true', 'yes', 'on'].includes(String(input?.consent || '').toLowerCase());
  payload.sms_opt_in = input?.sms_opt_in === true || ['true', 'yes', 'on'].includes(String(input?.sms_opt_in || '').toLowerCase());
  payload.request_id = clean(input?.request_id, 80) || crypto.randomUUID();
  payload.submitted_at = clean(input?.submitted_at, 40) || new Date().toISOString();
  return payload;
}

function validate(payload) {
  const digits = payload.patient_phone.replace(/\D/g, '');
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.patient_email);
  return payload.patient_name.length >= 2
    && payload.patient_phone.length >= 7
    && digits.length >= 7
    && digits.length <= 15
    && validEmail
    && payload.specialty.length > 0
    && ['appointment', 'preventive_screening'].includes(payload.workflow_type)
    && payload.consent;
}

async function sendEmail(env, templateParams) {
  const serviceId = env.EMAILJS_SERVICE_ID;
  const templateId = env.EMAILJS_TEMPLATE_ID;
  const publicKey = env.EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return false;
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: SITE_ORIGIN, referer: `${SITE_ORIGIN}/` },
    body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey, template_params: templateParams })
  });
  return response.ok;
}

function clinicRecipients(env) {
  return [...new Set([
    clean(env.CLINIC_EMAIL, 160).toLowerCase(),
    clean(env.CLINIC_ASSISTANT_EMAIL, 160).toLowerCase()
  ].filter(Boolean))];
}

async function sendEmailNotifications(payload, env) {
  const recipients = clinicRecipients(env);
  const paymentQrUrl = clean(env.CLINIC_PAYMENT_QR_URL, 500);
  if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_TEMPLATE_ID || !env.EMAILJS_PUBLIC_KEY || !recipients.length) {
    return { configured: false, clinic_sent: false, patient_sent: false };
  }

  const careType = payload.workflow_type === 'preventive_screening' ? 'Preventive screening' : 'Appointment request';
  const clinicSummary = [
    'NEW APPOINTMENT REQUEST',
    `Request ID: ${payload.request_id}`,
    `Patient: ${payload.patient_name}`,
    `Phone: ${payload.patient_phone}`,
    `Email: ${payload.patient_email}`,
    `Request type: ${careType}`,
    `Care area: ${payload.specialty}`,
    `Preferred date/time: ${payload.preferred_date || 'Flexible'} ${payload.preferred_time || ''}`.trim(),
    `Concern: ${payload.dental_concern || 'Not specified'}`,
    `Language: ${payload.language || 'en'}`,
    'Appointment fee: ₹100 INR — pending payment',
    `PhonePe QR: ${paymentQrUrl || 'Clinic QR not configured'}`
  ].join('\n');
  const firstAid = payload.language === 'kn'
    ? 'ಮುಖದ ತೀವ್ರ ಊತ, ನಿಯಂತ್ರಿಸಲಾಗದ ರಕ್ತಸ್ರಾವ, ಹಲ್ಲಿನ ಗಾಯ, ಅಥವಾ ಉಸಿರಾಟ/ನುಂಗುವ ತೊಂದರೆ ಇದ್ದರೆ ತಕ್ಷಣ ಸ್ಥಳೀಯ ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು ಪಡೆಯಿರಿ. ಇಮೇಲ್ ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯಬೇಡಿ. ಇದು ರೋಗನಿರ್ಣಯ ಅಥವಾ ತುರ್ತು ಸೇವೆಯಲ್ಲ.'
    : 'If you have severe facial swelling, uncontrolled bleeding, a dental injury, or difficulty breathing or swallowing, seek urgent local medical care now. Do not wait for an email reply. This message is not a diagnosis or emergency service.';

  let clinicSent = false;
  let clinicRecipientsSent = 0;
  let patientSent = false;
  for (const clinicEmail of recipients) {
    try {
      const sent = await sendEmail(env, {
        to_email: clinicEmail,
        reply_to: payload.patient_email,
        email_subject: `${careType} — ${payload.patient_name}`,
        recipient_name: 'Bhoomika Dental Clinic team',
        appointment_fee_inr: '100',
        payment_status: 'pending',
        payment_qr_url: paymentQrUrl,
        message_body: clinicSummary,
        patient_first_aid: ''
      });
      if (sent) clinicRecipientsSent += 1;
    } catch { /* Email is reported as incomplete without exposing provider details. */ }
    await delay(1100);
  }
  clinicSent = clinicRecipientsSent > 0;
  try {
    const patientClinicEmail = recipients[0];
    patientSent = await sendEmail(env, {
      to_email: payload.patient_email,
      reply_to: patientClinicEmail,
      email_subject: 'We received your Bhoomika Dental Clinic request',
      recipient_name: payload.patient_name,
      appointment_fee_inr: '100',
      payment_status: 'pending',
      payment_qr_url: paymentQrUrl,
      message_body: `Thank you, ${payload.patient_name}. The clinic has received your ${careType.toLowerCase()} request.\n\nAppointment fee: ₹100 INR — payment pending. Scan the PhonePe QR code shown below in this email, then keep the payment receipt. The clinic will verify payment and contact you to confirm availability. This is a request, not a confirmed appointment.\n\nPhonePe QR: ${paymentQrUrl || 'The clinic will provide the QR separately.'}\n\n${firstAid}\n\nClinic: +91 9481731482`,
      patient_first_aid: firstAid
    });
  } catch { /* Keep the clinic's appointment intake available if email delivery fails. */ }
  return { configured: true, clinic_sent: clinicSent, clinic_recipients_sent: clinicRecipientsSent, patient_sent: patientSent };
}

function normalizeMsg91Mobile(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (String(value || '').trim().startsWith('+') && digits.length >= 8 && digits.length <= 15) return digits;
  return '';
}

async function sendAppointmentSms(payload, env) {
  if (!payload.sms_opt_in) return { configured: false, sent: false, status: 'not_opted_in' };
  if (!env.MSG91_AUTH_KEY || !env.MSG91_TEMPLATE_ID) return { configured: false, sent: false, status: 'not_configured' };
  const mobile = normalizeMsg91Mobile(payload.patient_phone);
  if (!mobile) return { configured: true, sent: false, status: 'invalid_number' };

  const flowPayload = {
    template_id: env.MSG91_TEMPLATE_ID,
    short_url: '0',
    realTimeResponse: '1',
    recipients: [{ mobiles: mobile }]
  };

  try {
    const response = await fetch('https://control.msg91.com/api/v5/flow', {
      method: 'POST',
      headers: { accept: 'application/json', authkey: env.MSG91_AUTH_KEY, 'content-type': 'application/json' },
      body: JSON.stringify(flowPayload)
    });
    const result = await response.json().catch(() => null);
    const sent = response.ok && String(result?.type || '').toLowerCase() === 'success';
    return { configured: true, sent, status: sent ? 'sent' : 'failed' };
  } catch {
    return { configured: true, sent: false, status: 'failed' };
  }
}

async function logToSheets(payload, env) {
  if (!env.GOOGLE_SHEETS_WEBHOOK_URL || !env.GOOGLE_SHEETS_SHARED_SECRET) {
    return { configured: false };
  }
  const body = new URLSearchParams({
    token: env.GOOGLE_SHEETS_SHARED_SECRET,
    payload: JSON.stringify(payload)
  });
  const response = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body
  });
  if (!response.ok) throw new Error('Sheets webhook failed');
  const result = await response.json().catch(() => null);
  if (!result?.ok) throw new Error('Sheets webhook rejected request');
  return { configured: true, duplicate: Boolean(result.duplicate) };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: 'Request is too large.' }, 413);

  let input;
  try { input = JSON.parse(raw); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (clean(input?.website, 100)) return json({ ok: true, ignored: true });

  const payload = safePayload(input);
  if (!validate(payload)) return json({ error: 'Please provide a valid name, phone, email, care area, and consent.' }, 400);

  const outcomes = await Promise.allSettled([
    sendEmailNotifications(payload, env),
    logToSheets(payload, env)
  ]);
  const email = outcomes[0].status === 'fulfilled' ? outcomes[0].value : { configured: false, clinic_sent: false, patient_sent: false };
  const sheets = outcomes[1].status === 'fulfilled' ? outcomes[1].value : { configured: false };
  const configured = [email.clinic_sent, sheets.configured].filter(Boolean).length;

  if (configured === 0) return json({ error: 'Appointment routing is not configured.' }, 503);
  const sms = await sendAppointmentSms(payload, env);
  return json({
    ok: true,
    request_id: payload.request_id,
    email_configured: Boolean(email.clinic_sent && email.patient_sent),
    email_status: email.configured ? (email.clinic_sent && email.patient_sent ? 'sent' : 'partial') : 'not_configured',
    clinic_recipients_sent: Number(email.clinic_recipients_sent || 0),
    patient_email_sent: Boolean(email.patient_sent),
    sheets_logged: Boolean(sheets.configured),
    sms_status: sms.status,
    sms_sent: Boolean(sms.sent),
    message: 'Appointment request received.'
  });
}
