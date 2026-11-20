import { sheet, sendEmail, recipients, reviewLink, delay as wfDelay, FEE, CLINIC_PHONE } from '../_lib/workflow.js';
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

async function notify(payload, appointmentNumber, env) {
  const { doctor, assistant } = recipients(env);
  const preferred = [payload.preferred_date, payload.preferred_time].filter(Boolean).join(' ') || 'Flexible';
  const calendarLink = buildCalendarLink(payload, appointmentNumber);
  const approve = await reviewLink(env, appointmentNumber, 'approve');
  const decline = await reviewLink(env, appointmentNumber, 'decline');
  const details = [
    `Request number: ${appointmentNumber}`, `Patient: ${payload.patient_name}`, `Phone: ${payload.patient_phone}`,
    `Email: ${payload.patient_email}`, `Care area: ${payload.specialty}`, `Preferred (IST, requested only): ${preferred}`
  ].join('\n');
  const accepted = { doctor: false, assistant: false, patient: false };

  accepted.doctor = await sendEmail(env, {
    to_email: doctor, reply_to: payload.patient_email, email_subject: `Verify appointment request — ${appointmentNumber}`,
    appointment_number: appointmentNumber, payment_status: 'awaiting doctor verification',
    message_body: `NEW APPOINTMENT REQUEST — NEEDS YOUR VERIFICATION\n${details}\n\nApprove (patient is then asked to pay ₹${FEE_TEXT}):\n${approve}\n\nDecline:\n${decline}`
  });
  await delay(1100);
  accepted.assistant = await sendEmail(env, {
    to_email: assistant, reply_to: payload.patient_email, email_subject: `New request (awaiting doctor) — ${appointmentNumber}`,
    appointment_number: appointmentNumber, payment_status: 'awaiting doctor verification',
    message_body: `FYI — new appointment request, forwarded to the doctor for verification.\n${details}`
  });
  await delay(1100);
  accepted.patient = await sendEmail(env, {
    to_email: payload.patient_email, reply_to: doctor, email_subject: `Request received — ${appointmentNumber}`,
    recipient_name: payload.patient_name, appointment_number: appointmentNumber, payment_status: 'awaiting doctor verification',
    calendar_link: calendarLink,
    message_body: `Thank you, ${payload.patient_name}. Your appointment request ${appointmentNumber} has been received by Bhoomika Dental Clinic.\nRequested (IST): ${preferred}\n\nThe doctor will verify your request first. You will get another email once you are registered, with the ₹${FEE_TEXT} payment QR. Please do not pay before then.\nThis is not a confirmed appointment. Clinic phone: ${CLINIC_PHONE}`
  });
  return accepted;
}
const FEE_TEXT = FEE;
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
  const saved = await sheet(env, 'create', {
    appointment_no: appointmentNumber, patient_name: payload.patient_name, patient_email: payload.patient_email, phone: payload.patient_phone,
    care_area: payload.specialty, preferred_date: payload.preferred_date, preferred_time: payload.preferred_time,
    note: payload.dental_concern, language: payload.language, source: clean(input?.source, 64) || 'website-form'
  });
  const { doctor, assistant } = recipients(env);
  if (!saved.ok || !env.EMAILJS_PUBLIC_KEY || !env.WORKFLOW_SECRET || !doctor || !assistant || doctor === assistant) {
    recentRequests.delete(requestKey);
    return json({ ok: false, appointment_number: appointmentNumber, error: 'Booking service is not fully set up yet. Please call the clinic on +91 9481731482.' }, 503);
  }
  const accepted = await notify(payload, appointmentNumber, env);
  if (!accepted.doctor) {
    recentRequests.delete(requestKey);
    return json({ ok: false, appointment_number: appointmentNumber, error: 'We could not reach the doctor by email. Please call +91 9481731482.' }, 502);
  }
  const resultBody = {
    ok: true,
    appointment_number: appointmentNumber,
    stage: 'awaiting_doctor_verification',
    doctor_email_accepted: accepted.doctor,
    assistant_email_accepted: accepted.assistant,
    patient_email_accepted: accepted.patient,
    delivery_verified: false,
    message: `Request ${appointmentNumber} received. The doctor will verify it; you will then get an email asking for the ₹100 payment. This is not a confirmed appointment.`
  };
  recentRequests.set(requestKey, { created_at: now, status: 200, body: resultBody });
  return json(resultBody);
}
