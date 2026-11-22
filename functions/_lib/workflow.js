// Shared helpers for the staged booking workflow:
// form -> assistant + doctor (verify) -> patient (register + pay ₹100) -> doctor (confirm payment) -> patient (confirmed)
export const SITE_ORIGIN = 'https://bhoomika-dental-clinic.pages.dev';
export const CLINIC_ADDRESS = 'TMC Complex, Badami, Karnataka, India';
export const CLINIC_PHONE = '+91 9481731482';
export const DEFAULT_QR_URL = `${SITE_ORIGIN}/images/payment/phonepe-appointment-qr.jpeg`;
export const FEE = '100';
export const clean = (v, max = 300) => String(v ?? '').replace(/[<>]/g, ' ').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
export async function sign(env, id, action) {
  if (!env.WORKFLOW_SECRET) throw new Error('WORKFLOW_SECRET not configured');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.WORKFLOW_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}|${action}`))).slice(0, 40);
}
export async function verify(env, id, action, sig) {
  if (!env.WORKFLOW_SECRET || !sig) return false;
  const expected = await sign(env, id, action);
  const s = String(sig);
  return s.length === expected.length && [...s].reduce((d, c, i) => d | (c.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0;
}
export const reviewLink = async (env, id, action) => `${SITE_ORIGIN}/api/review?id=${encodeURIComponent(id)}&action=${action}&sig=${await sign(env, id, action)}`;

export function recipients(env) {
  const doctor = clean(env.CLINIC_EMAIL, 160).toLowerCase();
  const assistant = clean(env.CLINIC_ASSISTANT_EMAIL, 160).toLowerCase();
  return { doctor: isEmail(doctor) ? doctor : '', assistant: isEmail(assistant) ? assistant : '' };
}

// One EmailJS template is reused for every message; EmailJS acceptance is not inbox delivery.
export async function sendEmailDetailed(env, p) {
  if (!env.EMAILJS_PUBLIC_KEY) return { ok: false, status: 0, detail: 'no_public_key' };
  const body = {
    service_id: 'service_oz00kf3', template_id: 'template_lb2zn9m', user_id: env.EMAILJS_PUBLIC_KEY,
    template_params: {
      appointment_fee_inr: FEE, payment_qr_url: '', calendar_link: '', patient_first_aid: '', payment_status: '',
      reply_to: '', recipient_name: 'Bhoomika Dental Clinic team', ...p
    }
  };
  if (env.EMAILJS_PRIVATE_KEY) body.accessToken = env.EMAILJS_PRIVATE_KEY;
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'content-type': 'application/json', origin: SITE_ORIGIN, referer: `${SITE_ORIGIN}/` }, body: JSON.stringify(body)
    });
    // EmailJS error bodies are short plain-text reasons (no secrets); keep a trimmed copy for diagnostics only.
    const detail = res.ok ? '' : clean(await res.text().catch(() => ''), 120);
    return { ok: res.ok, status: res.status, detail };
  } catch { return { ok: false, status: 0, detail: 'network_error' }; }
}
export async function sendEmail(env, p) { return (await sendEmailDetailed(env, p)).ok; }

// Google Sheets (via the Apps Script receiver in google-sheets/Code.gs) is the system of record for booking state.
export async function sheet(env, action, data) {
  if (!env.SHEETS_WEBAPP_URL || !env.SHEETS_TOKEN) return { ok: false, error: 'sheet_not_configured' };
  try {
    const res = await fetch(env.SHEETS_WEBAPP_URL, {
      method: 'POST', redirect: 'follow', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: env.SHEETS_TOKEN, action, payload: JSON.stringify(data) })
    });
    return await res.json();
  } catch { return { ok: false, error: 'sheet_unreachable' }; }
}

export const html = (title, body, status = 200) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font-family:system-ui;max-width:560px;margin:10vh auto;padding:0 20px;line-height:1.5"><h1 style="font-size:1.4rem">${title}</h1>${body}`,
  { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
