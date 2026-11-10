const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type'
};

const json = (body, status = 200) => Response.json(body, { status, headers: corsHeaders });

async function requestWithRetry(url, options, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      lastError = new Error(`Upstream returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }
  throw lastError || new Error('Upstream request failed');
}

function safePayload(input) {
  const allowed = ['workflow_type', 'patient_name', 'patient_phone', 'patient_email', 'specialty', 'preferred_date', 'preferred_time', 'dental_concern', 'language', 'submitted_at', 'source', 'attachment_names'];
  return Object.fromEntries(allowed.map((key) => [key, String(input?.[key] || '').slice(0, 1000)]));
}

async function sendEmail(payload, env) {
  if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_TEMPLATE_ID || !env.EMAILJS_PUBLIC_KEY) return { configured: false };
  const templateParams = {
    ...payload,
    clinic_email: env.CLINIC_EMAIL || '',
    reply_to: payload.patient_email,
    to_email: env.CLINIC_EMAIL || '',
    appointment_type: payload.workflow_type === 'preventive_screening' ? 'Preventive screening' : 'Appointment request'
  };
  await requestWithRetry('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ service_id: env.EMAILJS_SERVICE_ID, template_id: env.EMAILJS_TEMPLATE_ID, user_id: env.EMAILJS_PUBLIC_KEY, template_params: templateParams })
  });
  return { configured: true };
}

async function logToSheets(payload, env) {
  if (!env.GOOGLE_SHEETS_WEBHOOK_URL) return { configured: false };
  const body = { ...payload, clinic_email: env.CLINIC_EMAIL || '', shared_secret: env.GOOGLE_SHEETS_SHARED_SECRET || '' };
  await requestWithRetry(env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { configured: true };
}

async function logToManusWebhook(payload, env) {
  const url = env.MANUS_APPOINTMENT_WEBHOOK || 'https://api.manus.im/api/webhook/triggers/c52fc9be-e19c-4cc1-a216-bcde5fa96e94';
  await requestWithRetry(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { configured: true };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }
  const payload = safePayload(input);
  if (!payload.patient_name || !payload.patient_phone || !payload.patient_email) return json({ error: 'Name, phone, and email are required.' }, 400);

  const results = await Promise.allSettled([
    sendEmail(payload, env),
    logToSheets(payload, env),
    logToManusWebhook(payload, env)
  ]);
  const failures = results.filter((result) => result.status === 'rejected');
  const configured = results.filter((result) => result.status === 'fulfilled' && result.value.configured).length;
  if (failures.length && configured === 0) return json({ error: 'No appointment integrations are configured.' }, 503);
  if (failures.length) return json({ ok: true, partial: true, message: 'Appointment received; one or more notification channels need attention.' });
  return json({ ok: true, message: 'Appointment received and routed to the clinic.' });
}
