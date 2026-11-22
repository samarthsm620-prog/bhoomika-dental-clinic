// Non-sensitive setup check: reports only yes/no and error codes, never values.
import { sheet, recipients } from '../_lib/workflow.js';
export async function onRequestGet({ env }) {
  const { doctor, assistant } = recipients(env);
  const probe = await sheet(env, 'get', { appointment_no: 'BHC-00000000-00000000' });
  // Expected when everything works: ok=false, error=not_found (script reachable, token accepted, sheet opened).
  const sheetStatus = probe.error === 'not_found' ? 'working' : (probe.error || (probe.ok ? 'unexpected_ok' : 'unknown'));
  return Response.json({
    emailjs_public_key: Boolean(env.EMAILJS_PUBLIC_KEY),
    emailjs_private_key: Boolean(env.EMAILJS_PRIVATE_KEY),
    workflow_secret: Boolean(env.WORKFLOW_SECRET),
    gemini_key: Boolean(env.GEMINI_API_KEY),
    clinic_emails_valid_and_different: Boolean(doctor && assistant && doctor !== assistant),
    sheets_url_set: Boolean(env.SHEETS_WEBAPP_URL),
    sheets_token_set: Boolean(env.SHEETS_TOKEN),
    sheets_status: sheetStatus
  }, { headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}
