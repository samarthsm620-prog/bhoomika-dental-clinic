import clinicKnowledge from '../../clinic-knowledge.json' with { type: 'json' };

const clinicContext = `You are the Bhoomika Dental Clinic voice assistant. Use the verified clinic knowledge below as your source of truth. Give general guidance only and never diagnose. For severe pain, facial swelling, uncontrolled bleeding, airway difficulty, or a knocked-out tooth, recommend urgent contact with the clinic. Answer in the requested language when possible, keep responses concise and helpful, and direct appointment requests to the website booking form or clinic phone.

Verified clinic knowledge:
${JSON.stringify(clinicKnowledge, null, 2)}`;

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) {
    return Response.json({ error: 'Gemini proxy is not configured.' }, { status: 503 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const prompt = String(body.prompt || '').slice(0, 4000);
  const language = String(body.language || 'English').slice(0, 32);
  if (!prompt) return Response.json({ error: 'Prompt required.' }, { status: 400 });

  const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: clinicContext }] },
      contents: [{ role: 'user', parts: [{ text: `Respond in ${language}. User says: ${prompt}` }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 240 }
    })
  });
  const data = await upstream.json();
  if (!upstream.ok) {
    const providerMessage = String(data?.error?.message || 'Unknown provider error.').replace(/key=[^\s&]+/gi, 'key=[redacted]').slice(0, 240);
    return Response.json({ error: 'Gemini request failed.', provider_status: upstream.status, provider_message: providerMessage }, { status: 502 });
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join(' ').trim();
  return Response.json({ text: text || 'Please call the clinic so our team can guide you.' });
}
