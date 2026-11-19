const SITE_ORIGIN = 'https://bhoomika-dental-clinic.pages.dev';
const CLINIC_ADDRESS = 'TMC Complex, Badami, Karnataka, India';
const DEFAULT_QR_URL = `${SITE_ORIGIN}/images/payment/phonepe-appointment-qr.jpeg`;
const APPOINTMENT_FEE_INR = '100';
const MAX_BODY_BYTES = 12000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const REQUEST_CACHE_TTL_MS = 60 * 60 * 1000;
const recentRequests = new Map();
const recentByIp = new Map();
const corsHeaders = {
  'access-control-allow-origin': SITE_ORIGIN,
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};

const json = (body, status = 200) => Response.json(body, { status, headers: corsHeaders });
const clean = (value, max = 1000) => String(value ?? '').replace(/[<>]/g, ' ').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pruneRecentState(now) {
  if (recentRequests.size > 1000) {
    for (const [key, entry] of recentRequests) if (now - entry.created_at > REQUEST_CACHE_TTL_MS) recentRequests.delete(key);
  }
  if (recentByIp.size > 5000) {
    for (const [ip, timestamps] of recentByIp) {
      const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
      if (recent.length) recentByIp.set(ip, recent);
      else recentByIp.delete(ip);
    }
  }
}

function rateLimitRetryAfter(ip, now = Date.now()) {
  if (!ip) return 0;
  const recent = (recentByIp.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return Math.max(1, Math.ceil((recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000));
  recent.push(now);
  recentByIp.set(ip, recent);
  return 0;
}

function createAppointmentNumber(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const part = (type) => parts.find((item) => item.type === type)?.value || '';
  const datePart = `${part('year')}${part('month')}${part('day')}`;
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `BHC-${datePart}-${suffix}`;
}

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
    language: 8
  };
  const payload = Object.fromEntries(Object.entries(fields).map(([key, max]) => [key, clean(input?.[key], max)]));
  payload.consent = input?.consent === true || ['true', 'yes', 'on'].includes(String(input?.consent || '').toLowerCase());
  payload.request_id = clean(input?.request_id, 80) || crypto.randomUUID();
  payload.submitted_at = clean(input?.submitted_at, 40) || new Date().toISOString();
  return payload;
}

function validate(payload) {
  const digits = payload.patient_phone.replace(/\D/g, '');
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.patient_email);
  return payload.patient_name.length >= 2
    && digits.length >= 7
    && digits.length <= 15
    && validEmail
    && payload.specialty.length > 0
    && ['appointment', 'preventive_screening'].includes(payload.workflow_type)
    && payload.consent;
}

function calendarTimestamp(date, time) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) return '';
  const [, yearText, monthText, dayText] = dateMatch;
  const [, hourText, minuteText] = timeMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || hour > 23 || minute > 59) return '';
  const utc = Date.UTC(year, month - 1, day, hour, minute) - (330 * 60 * 1000);
  return new Date(utc).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function buildCalendarLink(payload, appointmentNumber) {
  const start = calendarTimestamp(payload.preferred_date, payload.preferred_time);
  if (!start) return '';
  const startDate = new Date(`${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}T${start.slice(9, 11)}:${start.slice(11, 13)}:${start.slice(13, 15)}Z`);
  const end = new Date(startDate.getTime() + 30 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const details = `Tentative placeholder for requested time only; this is not a confirmed appointment. Request number: ${appointmentNumber}. The clinic will confirm availability and manually verify PhonePe payment. Clinic phone: +91 9481731482.`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Bhoomika Dental Clinic — requested visit (not confirmed)',
    dates: `${start}/${end}`,
    ctz: 'Asia/Kolkata',
    location: CLINIC_ADDRESS,
    details
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function sendEmail(env, templateParams) {
  const serviceId = 'service_oz00kf3';
  const templateId = 'template_lb2zn9m';
  const publicKey = env.EMAILJS_PUBLIC_KEY;
  if (!publicKey) return { accepted: false, status: 0 };
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: SITE_ORIGIN, referer: `${SITE_ORIGIN}/` },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams
    })
  });
  return { accepted: response.ok, status: response.status };
}

function clinicRecipients(env) {
  const doctor = clean(env.CLINIC_EMAIL, 160).toLowerCase();
  const assistant = clean(env.CLINIC_ASSISTANT_EMAIL, 160).toLowerCase();
  const validAddress = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return [...new Set([doctor, assistant].filter(validAddress))];
}

async function sendEmailNotifications(payload, appointmentNumber, env) {
  const recipients = clinicRecipients(env);
  const doctorEmail = clean(env.CLINIC_EMAIL, 160).toLowerCase();
  const paymentQrUrl = clean(env.CLINIC_PAYMENT_QR_URL, 500) || DEFAULT_QR_URL;
  if (!env.EMAILJS_PUBLIC_KEY || recipients.length !== 2) {
    return { configured: false, clinic_recipients_expected: 2, clinic_recipients_accepted: 0, patient_email_accepted: false };
  }

  const careType = 'appointment request';
  const preferred = [payload.preferred_date, payload.preferred_time].filter(Boolean).join(' ') || 'Flexible';
  const calendarLink = buildCalendarLink(payload, appointmentNumber);
  const clinicSummary = [
    'NEW APPOINTMENT REQUEST — NOT CONFIRMED',
    `Request number: ${appointmentNumber}`,
    `Patient: ${payload.patient_name}`,
    `Phone: ${payload.patient_phone}`,
    `Email: ${payload.patient_email}`,
    'Request type: appointment coordination',
    `Preferred date/time (IST, requested only): ${preferred}`,
    `Payment: ₹${APPOINTMENT_FEE_INR} INR — pending manual PhonePe verification`,
    `Clinic: ${CLINIC_ADDRESS}`,
    `PhonePe QR: ${paymentQrUrl}`,
    'The clinic must confirm availability and verify payment before this becomes a confirmed appointment.'
  ].join('\n');

  const clinicParams = (clinicEmail) => ({
    to_email: clinicEmail,
    reply_to: payload.patient_email,
    email_subject: `${careType} — ${appointmentNumber}`,
    recipient_name: 'Bhoomika Dental Clinic team',
    appointment_number: appointmentNumber,
    appointment_fee_inr: APPOINTMENT_FEE_INR,
    payment_status: 'pending — manual PhonePe verification',
    payment_qr_url: paymentQrUrl,
    calendar_link: calendarLink,
    message_body: clinicSummary,
    patient_first_aid: ''
  });

  let clinicRecipientsAccepted = 0;
  for (const clinicEmail of recipients) {
    try {
      const result = await sendEmail(env, clinicParams(clinicEmail));
      if (result.accepted) clinicRecipientsAccepted += 1;
    } catch { /* Report provider acceptance accurately; do not claim inbox delivery. */ }
    await delay(1100);
  }

  const firstAid = payload.language === 'kn'
    ? 'ಮುಖದ ತೀವ್ರ ಊತ, ನಿಯಂತ್ರಿಸಲಾಗದ ರಕ್ತಸ್ರಾವ, ಹಲ್ಲಿನ ಗಾಯ, ಅಥವಾ ಉಸಿರಾಟ/ನುಂಗುವ ತೊಂದರೆ ಇದ್ದರೆ ತಕ್ಷಣ ಸ್ಥಳೀಯ ತುರ್ತು ವೈದ್ಯಕೀಯ ನೆರವು ಪಡೆಯಿರಿ. ಇದು ರೋಗನಿರ್ಣಯ ಅಥವಾ ತುರ್ತು ಸೇವೆಯಲ್ಲ.'
    : 'For severe facial swelling, uncontrolled bleeding, a dental injury, or difficulty breathing or swallowing, seek urgent local medical care. This email is not a diagnosis or emergency service.';
  const clinicDeliveryGuidance = clinicRecipientsAccepted === 0
    ? 'The email service accepted no clinic notification request. Please call the clinic before paying.'
    : clinicRecipientsAccepted < recipients.length
      ? `The email service accepted only ${clinicRecipientsAccepted}/${recipients.length} clinic notification requests. Delivery is not verified; please call the clinic before paying.`
      : 'The email service accepted the clinic notification requests, but delivery is not verified. The clinic must confirm availability before an appointment is confirmed.';
  const calendarText = calendarLink
    ? `\n\nAdd a tentative placeholder for the requested time to your calendar (this is not a confirmed appointment): ${calendarLink}`
    : '';
  const patientMessage = [
    `Thank you, ${payload.patient_name}. Your request reference is ${appointmentNumber}.`,
    `Request number: ${appointmentNumber}`,
    `Requested date/time (IST): ${preferred}`,
    `Clinic: Bhoomika Dental Clinic, ${CLINIC_ADDRESS}`,
    'This email confirms that the website generated a request reference; it does not confirm clinic receipt, appointment availability, or payment.',
    clinicDeliveryGuidance,
    `Appointment fee: ₹${APPOINTMENT_FEE_INR} INR — payment pending. Scan the PhonePe QR only after the clinic confirms availability, and keep the payment receipt. The clinic must verify payment manually.`,
    `PhonePe QR: ${paymentQrUrl}`,
    `Clinic phone: +91 9481731482`,
    firstAid
  ].join('\n') + calendarText;

  let patientEmailAccepted = false;
  try {
    const result = await sendEmail(env, {
      to_email: payload.patient_email,
      reply_to: doctorEmail,
      email_subject: `Request received — ${appointmentNumber}`,
      recipient_name: payload.patient_name,
      appointment_number: appointmentNumber,
      appointment_fee_inr: APPOINTMENT_FEE_INR,
      payment_status: 'pending — manual PhonePe verification',
      payment_qr_url: paymentQrUrl,
      calendar_link: calendarLink,
      message_body: patientMessage,
      patient_first_aid: firstAid
    });
    patientEmailAccepted = result.accepted;
  } catch { /* EmailJS acceptance is not a delivery receipt. */ }

  return {
    configured: true,
    clinic_recipients_expected: recipients.length,
    clinic_recipients_accepted: clinicRecipientsAccepted,
    patient_email_accepted: patientEmailAccepted
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== SITE_ORIGIN) return json({ error: 'Request origin not allowed.' }, 403);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: 'Request is too large.' }, 413);

  let input;
  try { input = JSON.parse(raw); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (clean(input?.website, 100)) return json({ ok: true, ignored: true });

  const payload = safePayload(input);
  if (!validate(payload)) return json({ error: 'Please provide a valid name, phone, email, care area, and consent.' }, 400);

  const now = Date.now();
  pruneRecentState(now);
  const clientIp = clean(request.headers.get('cf-connecting-ip'), 64);
  const requestKey = `${clientIp || 'no-ip'}:${payload.request_id}`;
  const cached = recentRequests.get(requestKey);
  if (cached && now - cached.created_at < REQUEST_CACHE_TTL_MS) {
    if (cached.status === 'pending') return json({ error: 'This request is already being processed.' }, 409);
    return json(cached.body, cached.status);
  }
  const retryAfter = rateLimitRetryAfter(clientIp, now);
  if (retryAfter) {
    return new Response(JSON.stringify({ error: 'Too many requests from this connection. Please wait before trying again.' }), {
      status: 429,
      headers: { ...corsHeaders, 'content-type': 'application/json', 'retry-after': String(retryAfter) }
    });
  }
  recentRequests.set(requestKey, { created_at: now, status: 'pending' });

  const appointmentNumber = createAppointmentNumber();
  let email;
  try {
    email = await sendEmailNotifications(payload, appointmentNumber, env);
  } catch {
    email = { configured: Boolean(env.EMAILJS_PUBLIC_KEY), clinic_recipients_expected: 2, clinic_recipients_accepted: 0, patient_email_accepted: false };
  }
  const acceptedCount = Number(email.clinic_recipients_accepted || 0) + Number(Boolean(email.patient_email_accepted));
  const expectedCount = Number(email.clinic_recipients_expected || 0) + 1;
  const emailStatus = !email.configured
    ? 'not_configured'
    : acceptedCount === expectedCount
      ? 'accepted'
      : acceptedCount > 0
        ? 'partial'
        : 'failed';

  if (acceptedCount === 0) {
    const errorBody = {
      ok: false,
      appointment_number: appointmentNumber,
      email_status: emailStatus,
      error: emailStatus === 'not_configured'
        ? 'Appointment email service or required clinic recipient is not configured. Please call the clinic.'
        : 'The email service did not accept the appointment messages. Please call the clinic.'
    };
    recentRequests.delete(requestKey);
    return json(errorBody, emailStatus === 'not_configured' ? 503 : 502);
  }

  const resultBody = {
    ok: true,
    appointment_number: appointmentNumber,
    email_provider: 'EmailJS',
    email_status: emailStatus,
    clinic_recipients_expected: email.clinic_recipients_expected,
    clinic_recipients_accepted: email.clinic_recipients_accepted,
    patient_email_accepted: Boolean(email.patient_email_accepted),
    delivery_verified: false,
    payment_status: 'pending_manual_phonepe_verification',
    payment_qr_url: clean(env.CLINIC_PAYMENT_QR_URL, 500) || DEFAULT_QR_URL,
    message: email.clinic_recipients_accepted === 0
      ? 'A request reference was generated, but EmailJS accepted no clinic notification request. Call the clinic before paying; no appointment is confirmed.'
      : `EmailJS accepted ${email.clinic_recipients_accepted}/${email.clinic_recipients_expected} clinic notification requests; delivery is not verified. The clinic must confirm availability and manually verify payment.`
  };
  recentRequests.set(requestKey, { created_at: now, status: 200, body: resultBody });
  return json(resultBody);
}
