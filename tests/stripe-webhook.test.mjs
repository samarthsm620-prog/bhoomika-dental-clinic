import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { onRequestPost } from '../functions/api/stripe-webhook.js';
import { onRequestPost as checkout } from '../functions/api/checkout.js';

const secret = 'whsec_test';
const env = { STRIPE_WEBHOOK_SECRET: secret, EMAILJS_PUBLIC_KEY: 'pk', CLINIC_EMAIL: 'drlatamabrumkar@gmail.com', CLINIC_ASSISTANT_EMAIL: 'assistant@example.com', STRIPE_SECRET_KEY: 'sk_test' };
const sent = [];
globalThis.fetch = async (url, init) => {
  if (String(url).includes('emailjs')) { sent.push(JSON.parse(init.body).template_params); return new Response('OK'); }
  if (String(url).includes('stripe.com')) { sent.stripeBody = init.body.toString(); return Response.json({ url: 'https://checkout.stripe.com/c/pay/cs_test' }); }
};
const event = (over = {}) => JSON.stringify({ type: 'checkout.session.completed', created: Math.floor(Date.now() / 1000), data: { object: { payment_status: 'paid', currency: 'inr', amount_total: 10000, client_reference_id: 'BHC-20261119-ABCDEF12', customer_email: 'patient@example.com', metadata: { appointment_number: 'BHC-20261119-ABCDEF12', patient_name: 'TEST ONLY Patient' }, ...over } } });
const sign = (body, ts = Math.floor(Date.now() / 1000)) => `t=${ts},v1=${createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex')}`;
const call = (body, sig) => onRequestPost({ request: new Request('https://x/api/stripe-webhook', { method: 'POST', headers: { 'stripe-signature': sig }, body }), env });

// 1 valid
let b = event(); let r = await call(b, sign(b));
assert.equal(r.status, 200);
assert.equal(sent.length, 3);
assert.equal(sent[0].to_email, 'patient@example.com');
assert.match(sent[0].email_subject, /Payment successful — BHC-20261119-ABCDEF12/);
assert.deepEqual(sent.slice(1).map((m) => m.to_email), ['drlatamabrumkar@gmail.com', 'assistant@example.com']);
// 2 bad signature
r = await call(b, 't=1,v1=bad'); assert.equal(r.status, 400);
// 3 stale timestamp
r = await call(b, sign(b, 1000)); assert.equal(r.status, 400);
// 4 wrong amount ignored, no emails
sent.length = 0; b = event({ amount_total: 500 }); r = await call(b, sign(b));
assert.equal(r.status, 200); assert.equal(sent.length, 0);
// 5 unpaid ignored
b = event({ payment_status: 'unpaid' }); r = await call(b, sign(b)); assert.equal(sent.length, 0);
// 6 checkout creates ₹100 INR session
r = await checkout({ request: new Request('https://x/api/checkout', { method: 'POST', body: JSON.stringify({ appointment_number: 'BHC-20261119-ABCDEF12', patient_email: 'patient@example.com', patient_name: 'TEST ONLY' }) }), env });
assert.equal(r.status, 200);
assert.match(sent.stripeBody, /unit_amount%5D=10000/); assert.match(sent.stripeBody, /currency%5D=inr/);
console.log('ALL 6 MOCK TESTS PASSED');
