import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const clinicKnowledge = JSON.parse(await readFile(resolve(root, 'clinic-knowledge.json'), 'utf8'));
const clinicContext = `You are the Bhoomika Dental Clinic voice assistant. Use the verified clinic knowledge below as your source of truth. Give general guidance only and never diagnose. For severe pain, facial swelling, uncontrolled bleeding, airway difficulty, or a knocked-out tooth, recommend urgent contact with the clinic. Answer in the requested language when possible, keep responses concise and helpful, and direct appointment requests to the website booking form or clinic phone.

Verified clinic knowledge:
${JSON.stringify(clinicKnowledge, null, 2)}`;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4'
};

async function readJson(request, maxBytes = 12000) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBytes) throw new Error('Request is too large.');
  }
  return JSON.parse(body);
}

async function handleGemini(request, response) {
  if (!process.env.GEMINI_API_KEY) { response.writeHead(503, { 'content-type': 'application/json' }); response.end(JSON.stringify({ error: 'Gemini proxy is not configured.' })); return; }
  try {
    const body = await readJson(request);
    const prompt = String(body.prompt || '').slice(0, 4000);
    const language = String(body.language || 'English').slice(0, 32);
    if (!prompt) throw new Error('Prompt required.');
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: clinicContext }] }, contents: [{ role: 'user', parts: [{ text: `Respond in ${language}. User says: ${prompt}` }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 240 } }) });
    const data = await upstream.json();
    if (!upstream.ok) throw new Error('Gemini request failed.');
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join(' ').trim();
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); response.end(JSON.stringify({ text: text || 'Please call the clinic so our team can guide you.' }));
  } catch (error) { response.writeHead(400, { 'content-type': 'application/json', 'cache-control': 'no-store' }); response.end(JSON.stringify({ error: error.message })); }
}

async function handleCallback(request, response) {
  if (!process.env.MANUS_CALLBACK_WEBHOOK) { response.writeHead(503, { 'content-type': 'application/json', 'cache-control': 'no-store' }); response.end(JSON.stringify({ error: 'Callback routing is not configured.' })); return; }
  try {
    const input = await readJson(request, 4000);
    const clean = (value, max = 500) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
    if (clean(input.website, 100)) { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ ok: true, ignored: true })); return; }
    const name = clean(input.name, 80), phone = clean(input.phone, 32), concern = clean(input.concern, 300);
    const digits = phone.replace(/\D/g, '');
    if (clean(input.workflow_type, 40) !== 'callback_triage' || name.length < 2 || digits.length < 7 || digits.length > 15 || concern.length < 3) {
      response.writeHead(400, { 'content-type': 'application/json', 'cache-control': 'no-store' }); response.end(JSON.stringify({ error: 'Please provide your name, a valid phone number, and a short reason for the callback.' })); return;
    }
    const payload = { workflow_type: 'callback_triage', name, phone, concern, language: clean(input.language, 8) === 'kn' ? 'kn' : 'en', source: 'website-callback-form', submitted_at: clean(input.submitted_at, 40) || new Date().toISOString(), request_id: crypto.randomUUID() };
    const upstream = await fetch(process.env.MANUS_CALLBACK_WEBHOOK, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (!upstream.ok) throw new Error('Callback routing failed.');
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); response.end(JSON.stringify({ ok: true, message: 'Callback request received.' }));
  } catch {
    response.writeHead(502, { 'content-type': 'application/json', 'cache-control': 'no-store' }); response.end(JSON.stringify({ error: 'Callback routing failed. Please call the clinic.' }));
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname === '/_app/health') { response.writeHead(200, { 'content-type': 'text/plain' }); response.end('ok'); return; }
  if (url.pathname === '/api/gemini' && request.method === 'POST') { await handleGemini(request, response); return; }
  if (url.pathname === '/api/callback' && request.method === 'POST') { await handleCallback(request, response); return; }
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); response.end('Method Not Allowed'); return; }
  const redirects = {
    '/index.html': '/', '/home': '/', '/privacy': '/privacy-policy', '/privacy/': '/privacy-policy',
    '/privacy-policy.html': '/privacy-policy', '/privacy-policy/': '/privacy-policy',
    '/terms': '/terms-and-conditions', '/terms/': '/terms-and-conditions',
    '/terms-of-service': '/terms-and-conditions', '/terms-and-conditions.html': '/terms-and-conditions',
    '/terms-and-conditions/': '/terms-and-conditions'
  };
  if (redirects[url.pathname]) { response.writeHead(301, { location: `${redirects[url.pathname]}${url.search}` }); response.end(); return; }

  try {
    const decoded = decodeURIComponent(url.pathname);
    const filePath = resolve(root, `.${decoded}`);
    const relative = filePath.slice(root.length);
    if (!relative.startsWith(sep) && relative !== '') throw new Error('Invalid path');
    let target = filePath;
    let info;
    try { info = await stat(target); }
    catch (error) {
      if (extname(decoded)) throw error;
      target = `${filePath}.html`;
      info = await stat(target);
    }
    if (info.isDirectory()) {
      if (!url.pathname.endsWith('/')) { response.writeHead(301, { location: `${url.pathname}/${url.search}` }); response.end(); return; }
      target = resolve(filePath, 'index.html');
      info = await stat(target);
    }
    if (!info.isFile()) throw new Error('Not a file');
    const data = await readFile(target);
    response.writeHead(200, { 'content-type': types[extname(target)] || 'application/octet-stream', 'cache-control': 'public, max-age=0' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    try {
      const notFound = await readFile(resolve(root, '404.html'));
      response.writeHead(404, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : notFound);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : 'Not Found');
    }
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Bhoomika Dental Clinic listening on ${port}`));
