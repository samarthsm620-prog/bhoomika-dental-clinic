const MAX_BODY_BYTES = 4000;
const corsHeaders = {
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};

const json = (body, status = 200, origin = '') => Response.json(body, {
  status,
  headers: { ...corsHeaders, ...(origin ? { 'access-control-allow-origin': origin } : {}) }
});
const clean = (value, max = 500) => String(value ?? '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, max);

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('origin') || '';
  const ownOrigin = new URL(request.url).origin;
  if (origin && origin !== ownOrigin) return json({ error: 'Origin not allowed.' }, 403, ownOrigin);
  return new Response(null, { status: 204, headers: { ...corsHeaders, 'access-control-allow-origin': ownOrigin } });
}

export async function onRequestPost({ request, env }) {
  const ownOrigin = new URL(request.url).origin;
  const origin = request.headers.get('origin') || '';
  if (origin && origin !== ownOrigin) return json({ error: 'Origin not allowed.' }, 403, ownOrigin);

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ error: 'Request is too large.' }, 413, ownOrigin);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: 'Request is too large.' }, 413, ownOrigin);

  let input;
  try { input = JSON.parse(raw); } catch { return json({ error: 'Invalid request.' }, 400, ownOrigin); }
  if (clean(input?.website, 100)) return json({ ok: true, ignored: true }, 200, ownOrigin);

  const name = clean(input?.name, 80);
  const phone = clean(input?.phone, 32);
  const digits = phone.replace(/\D/g, '');
  const concern = clean(input?.concern, 300);
  if (clean(input?.workflow_type, 40) !== 'callback_triage'
      || name.length < 2
      || digits.length < 7
      || digits.length > 15
      || concern.length < 3) {
    return json({ error: 'Please provide your name, a valid phone number, and a short reason for the callback.' }, 400, ownOrigin);
  }
  if (!env.MANUS_CALLBACK_WEBHOOK) return json({ error: 'Callback routing is not configured.' }, 503, ownOrigin);

  const payload = {
    workflow_type: 'callback_triage',
    name,
    phone,
    concern,
    language: clean(input?.language, 8) === 'kn' ? 'kn' : 'en',
    source: 'website-callback-form',
    submitted_at: clean(input?.submitted_at, 40) || new Date().toISOString(),
    request_id: crypto.randomUUID()
  };

  try {
    const response = await fetch(env.MANUS_CALLBACK_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return json({ error: 'Callback routing failed. Please call the clinic.' }, 502, ownOrigin);
    return json({ ok: true, message: 'Callback request received.' }, 200, ownOrigin);
  } catch {
    return json({ error: 'Callback routing failed. Please call the clinic.' }, 502, ownOrigin);
  }
}
