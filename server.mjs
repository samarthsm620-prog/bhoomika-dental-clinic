import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const clinicContext = `You are the Bhoomika Dental Clinic voice assistant. Clinic: Bhoomika Dental Clinic. Doctor: Dr. Lata H. Teredal, BDS. Location: TMC Complex, Badami. Hours: 10:30 AM to 2:30 PM and 5:00 PM to 7:30 PM. Free Monday consultations: 10:30 AM to 2:00 PM. Give general guidance only, never diagnose, and recommend urgent clinic contact for severe pain, facial swelling, uncontrolled bleeding, airway difficulty, or a knocked-out tooth.`;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

async function readJson(request) {
  let body = '';
  for await (const chunk of request) { body += chunk; if (body.length > 12000) break; }
  return JSON.parse(body);
}

async function handleGemini(request, response) {
  if (!process.env.GEMINI_API_KEY) { response.writeHead(503, { 'content-type': 'application/json' }); response.end(JSON.stringify({ error: 'Gemini proxy is not configured.' })); return; }
  try {
    const body = await readJson(request);
    const prompt = String(body.prompt || '').slice(0, 4000);
    const language = String(body.language || 'English').slice(0, 32);
    if (!prompt) throw new Error('Prompt required.');
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: clinicContext }] }, contents: [{ role: 'user', parts: [{ text: `Respond in ${language}. User says: ${prompt}` }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 240 } }) });
    const data = await upstream.json();
    if (!upstream.ok) throw new Error('Gemini request failed.');
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join(' ').trim();
    response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ text: text || 'Please call the clinic so our team can guide you.' }));
  } catch (error) { response.writeHead(400, { 'content-type': 'application/json' }); response.end(JSON.stringify({ error: error.message })); }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/_app/health') { response.writeHead(200, { 'content-type': 'text/plain' }); response.end('ok'); return; }
    if (url.pathname === '/api/gemini' && request.method === 'POST') { await handleGemini(request, response); return; }
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); response.end('Method Not Allowed'); return; }
    const requested = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = normalize(resolve(root, `.${requested}`));
    if (!filePath.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return; }
    const data = await readFile(filePath);
    response.writeHead(200, { 'content-type': types[extname(filePath)] || 'application/octet-stream', 'cache-control': 'public, max-age=0' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404, { 'content-type': 'text/plain' }); response.end('Not Found'); }
});
server.listen(port, '0.0.0.0', () => console.log(`Bhoomika Dental Clinic listening on ${port}`));
