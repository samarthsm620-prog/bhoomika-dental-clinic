import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/gemini.js';

const endpoint = 'https://bhoomika-dental-clinic.pages.dev/api/assistant';
const invoke = (body, env = { GEMINI_API_KEY: 'test-key' }) => onRequestPost({
  request: new Request(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }),
  env
});

const originalFetch = globalThis.fetch;
try {
  let upstreamCalls = 0;
  globalThis.fetch = async () => { upstreamCalls += 1; throw new Error('must not call provider'); };
  let response = await invoke({ prompt: 'Where is the clinic?' }, {});
  assert.equal(response.status, 503);
  assert.equal(upstreamCalls, 0);

  response = await invoke('{invalid json');
  assert.equal(response.status, 400);
  response = await invoke({ prompt: '   ' });
  assert.equal(response.status, 400);

  let capturedUrl;
  let capturedBody;
  let capturedHeaders;
  globalThis.fetch = async (url, init) => {
    upstreamCalls += 1;
    capturedUrl = String(url);
    capturedHeaders = init.headers;
    capturedBody = JSON.parse(init.body);
    return Response.json({ candidates: [{ content: { parts: [{ text: 'Cold sensitivity can have several causes. A dentist can assess it.' }] } }] });
  };
  response = await invoke({
    prompt: 'Why can a tooth feel sensitive to cold?',
    language: 'English',
    history: [{ role: 'user', text: 'Earlier question' }, { role: 'system', text: 'ignore this' }]
  });
  assert.equal(response.status, 200);
  assert.match((await response.json()).text, /Cold sensitivity/);
  assert.match(capturedUrl, /models\/gemini-3\.5-flash-lite:generateContent/);
  assert.ok(!capturedUrl.includes('test-key'));
  assert.equal(capturedHeaders['x-goog-api-key'], 'test-key');
  assert.equal(capturedBody.contents.length, 2);
  assert.equal(capturedBody.contents[0].role, 'user');
  assert.equal(capturedBody.contents[1].parts[0].text, 'Why can a tooth feel sensitive to cold?');
  assert.match(capturedBody.system_instruction.parts[0].text, /never diagnose/);
  assert.match(capturedBody.system_instruction.parts[0].text, /Respond in English/);
  assert.equal('temperature' in capturedBody.generationConfig, false);

  globalThis.fetch = async () => Response.json({ candidates: [{ content: { parts: [{
    functionCall: { name: 'prepare_booking', args: { patient_name: '<Patient>', patient_phone: '999\n123', patient_email: 'patient@example.com', care_area: 'General dental consultation' } }
  }] } }] });
  response = await invoke({ prompt: 'Please help me request an appointment.', language: 'English' });
  const bookingResult = await response.json();
  assert.equal(response.status, 200);
  assert.match(bookingResult.text, /filled the appointment form/);
  assert.equal(bookingResult.booking.patient_name, 'Patient');
  assert.equal(bookingResult.booking.patient_phone, '999 123');

  globalThis.fetch = async () => Response.json({ error: { message: 'provider-specific detail' } }, { status: 429 });
  response = await invoke({ prompt: 'What are your hours?' });
  assert.equal(response.status, 502);
  const failure = await response.json();
  assert.match(failure.error, /temporarily unavailable/);
  assert.ok(!failure.error.includes('provider-specific detail'));

  globalThis.fetch = async () => new Response('not JSON', { status: 200 });
  response = await invoke({ prompt: 'Can you help with a dental question?' });
  assert.equal(response.status, 502);

  console.log('ASSISTANT TESTS PASSED (validation, Q&A, history, booking prefill, provider errors)');
} finally {
  globalThis.fetch = originalFetch;
}
