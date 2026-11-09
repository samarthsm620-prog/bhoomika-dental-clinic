const clinicContext = `You are the Bhoomika Dental Clinic voice assistant. Clinic: Bhoomika Dental Clinic. Doctor: Dr. Lata H. Teredal, BDS. Location: TMC Complex, Badami. Hours: 10:30 AM to 2:30 PM and 5:00 PM to 7:30 PM. Free Monday consultations: 10:30 AM to 2:00 PM. Give general guidance only, never diagnose, and recommend urgent clinic contact for severe pain, facial swelling, uncontrolled bleeding, airway difficulty, or a knocked-out tooth. Answer in the requested language when possible.`;

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
  if (!upstream.ok) return Response.json({ error: 'Gemini request failed.' }, { status: 502 });
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join(' ').trim();
  return Response.json({ text: text || 'Please call the clinic so our team can guide you.' });
}
