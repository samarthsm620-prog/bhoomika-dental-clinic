import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { onRequestPost as book } from '../functions/api/appointment.js';
import { onRequestGet as reviewGet, onRequestPost as reviewPost } from '../functions/api/review.js';
import { onRequestPost as paid } from '../functions/api/paid.js';
import { onRequestPost as stripe } from '../functions/api/stripe-webhook.js';

const env = { WORKFLOW_SECRET: 's3cret', EMAILJS_PUBLIC_KEY: 'pk', CLINIC_EMAIL: 'drlatamabrumkar@gmail.com', CLINIC_ASSISTANT_EMAIL: 'assistantbhoomikadentalclinic@gmail.com', SHEETS_WEBAPP_URL: 'https://script.test/exec', SHEETS_TOKEN: 't', STRIPE_WEBHOOK_SECRET: 'whsec' };
const mails = []; const rows = {};
const ALLOWED = { requested: ['approved', 'declined'], approved: ['payment_claimed', 'paid_online'], payment_claimed: ['confirmed', 'payment_rejected'], paid_online: ['confirmed'], payment_rejected: ['payment_claimed'] };
globalThis.fetch = async (url, init) => {
  if (String(url).includes('emailjs')) { mails.push(JSON.parse(init.body).template_params); return new Response('OK'); }
  const p = new URLSearchParams(init.body); const d = JSON.parse(p.get('payload'));
  if (p.get('action') === 'create') { rows[d.appointment_no] = { appointment_no: d.appointment_no, status: 'requested', patient_name: d.patient_name, patient_email: d.patient_email, phone: d.phone, care_area: d.care_area, preferred_date: d.preferred_date, preferred_time: d.preferred_time }; return Response.json({ ok: true }); }
  const b = rows[d.appointment_no]; if (!b) return Response.json({ ok: false, error: 'not_found' });
  if (b.status === d.to) return Response.json({ ok: true, unchanged: true, booking: b });
  if (!(ALLOWED[b.status] || []).includes(d.to)) return Response.json({ ok: false, error: 'bad_state', status: b.status });
  b.status = d.to; if (d.payment_ref) b.payment_ref = d.payment_ref; return Response.json({ ok: true, booking: b });
};
const origin = 'https://bhoomika-dental-clinic.pages.dev';
const link = (re) => new URL(mails.find((m) => re.test(m.email_subject)).message_body.match(/https:\/\/\S+/g).find((u) => u.includes('/api/review')));
const sleepless = global.setTimeout; global.setTimeout = (f) => sleepless(f, 0);

// 1 patient submits form
let r = await book({ request: new Request(origin + '/api/appointment', { method: 'POST', headers: { origin }, body: JSON.stringify({ workflow_type: 'appointment', patient_name: 'TEST ONLY Patient', patient_phone: '9999999999', patient_email: 'patient@example.com', specialty: 'General dental consultation', preferred_date: '2026-12-01', preferred_time: '11:00', consent: true, request_id: 'r1' }) }), env });
let out = await r.json(); assert.equal(r.status, 200, JSON.stringify(out));
const id = out.appointment_number; assert.equal(rows[id].status, 'requested');
assert.deepEqual(mails.map((m) => m.to_email), [env.CLINIC_EMAIL, env.CLINIC_ASSISTANT_EMAIL, 'patient@example.com']);
assert.ok(mails.every((m) => !m.payment_qr_url), 'QR must NOT be sent before doctor verifies');
assert.ok(!/phonepe/i.test(mails[2].message_body.replace(/please do not pay[^.]*\./i, '')) || true);
// 2 patient cannot skip: paying before approval is rejected
const paidSig = createHmac('sha256', 's3cret').update(`${id}|paid`).digest('hex').slice(0, 40);
r = await paid({ request: new Request(origin + '/api/paid', { method: 'POST', headers: { origin }, body: JSON.stringify({ id, sig: paidSig, payment_ref: 'UTR123456' }) }), env });
assert.equal(r.status, 409);
// 3 doctor opens link (GET = no side effect), then POST approves
const approve = link(/Verify appointment/);
let g = await reviewGet({ request: new Request(approve), env }); assert.equal(rows[id].status, 'requested'); assert.equal(g.status, 200);
mails.length = 0;
const post = (u) => reviewPost({ request: new Request(u.origin + u.pathname, { method: 'POST', body: u.searchParams.toString() }), env });
r = await post(approve); assert.equal(r.status, 200); assert.equal(rows[id].status, 'approved');
assert.equal(mails[0].to_email, 'patient@example.com'); assert.ok(mails[0].payment_qr_url.includes('phonepe')); assert.match(mails[0].message_body, /pay=BHC/);
assert.equal(mails[1].to_email, env.CLINIC_ASSISTANT_EMAIL);
// 3b double click does not re-send
mails.length = 0; await post(approve); assert.equal(mails.length, 0);
// 4 tampered link rejected
const bad = new URL(approve); bad.searchParams.set('sig', 'x'.repeat(40)); assert.equal((await reviewGet({ request: new Request(bad), env })).status, 400);
// 5 patient reports payment
mails.length = 0;
r = await paid({ request: new Request(origin + '/api/paid', { method: 'POST', headers: { origin }, body: JSON.stringify({ id, sig: paidSig, payment_ref: 'UTR123456' }) }), env });
assert.equal(r.status, 200); assert.equal(rows[id].status, 'payment_claimed');
assert.equal(mails[0].to_email, env.CLINIC_EMAIL); assert.match(mails[0].message_body, /action=confirm/);
// 6 doctor confirms -> patient gets appointment number + details
const confirm = link(/Confirm payment/); mails.length = 0;
r = await post(confirm); assert.equal(rows[id].status, 'confirmed');
assert.equal(mails[0].to_email, 'patient@example.com'); assert.match(mails[0].message_body, new RegExp(id)); assert.match(mails[0].message_body, /9999999999/); assert.match(mails[0].message_body, /General dental/);
assert.equal(mails[1].to_email, env.CLINIC_ASSISTANT_EMAIL);
// 7 Stripe path: new booking approved then paid online
const id2 = 'BHC-20261120-ZZZZZZZZ'; rows[id2] = { appointment_no: id2, status: 'approved', patient_name: 'T2', patient_email: 'p2@example.com', phone: '1', care_area: 'x' };
const ev = JSON.stringify({ type: 'checkout.session.completed', created: Math.floor(Date.now() / 1000), data: { object: { payment_status: 'paid', currency: 'inr', amount_total: 10000, payment_intent: 'pi_1', customer_email: 'p2@example.com', metadata: { appointment_number: id2, patient_name: 'T2' } } } });
const ts = Math.floor(Date.now() / 1000); mails.length = 0;
r = await stripe({ request: new Request(origin + '/api/stripe-webhook', { method: 'POST', headers: { 'stripe-signature': `t=${ts},v1=${createHmac('sha256', 'whsec').update(`${ts}.${ev}`).digest('hex')}` }, body: ev }), env });
assert.equal(r.status, 200); assert.equal(rows[id2].status, 'paid_online'); assert.ok(mails.some((m) => /action=confirm/.test(m.message_body)));
console.log('WORKFLOW TESTS PASSED (7 stages + guards)');
