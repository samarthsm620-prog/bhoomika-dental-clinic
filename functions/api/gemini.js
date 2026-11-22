import { createAssistantResponse } from '../_lib/assistant.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON. Please try again.' }, { status: 400 });
  }

  const result = await createAssistantResponse({ body, apiKey: env?.GEMINI_API_KEY });
  return Response.json(result.body, {
    status: result.status,
    headers: { 'cache-control': 'no-store' }
  });
}
