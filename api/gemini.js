const MAX_REQUEST_SIZE = 100_000;

function sendJson(res, statusCode, payload) {
 res.statusCode = statusCode;
 res.setHeader('Content-Type', 'application/json');
 res.end(JSON.stringify(payload));
}

export async function handleGeminiRequest(req, res, getApiKey = () => process.env.GEMINI_API_KEY) {
 if (req.method !== 'POST') {
  res.setHeader('Allow', 'POST');
  return sendJson(res, 405, { error: 'Method not allowed' });
 }

 const apiKey = getApiKey()?.trim();
 if (!apiKey || apiKey === 'replace_with_your_gemini_api_key') {
  return sendJson(res, 500, {
   error: 'GEMINI_API_KEY is not configured. Add it to your local .env or Vercel project environment variables.'
  });
 }

 try {
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
   return sendJson(res, 400, { error: 'Prompt is required' });
  }
  if (prompt.length > 20_000 || JSON.stringify(body).length > MAX_REQUEST_SIZE) {
   return sendJson(res, 413, { error: 'Request payload too large' });
  }

  const systemPrompt = `You are FinSim AI, a concise business-finance advisor.
Use the following simulated business data: ${JSON.stringify(body.context ?? {})}.
Do not claim that results are guaranteed. Keep answers practical and clearly distinguish estimates from facts.
When relevant, suggest one small next step in the Decision Simulator.`;

  const response = await fetch(
   'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
   {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
     'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
     systemInstruction: { parts: [{ text: systemPrompt }] },
     contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
   }
  );

  const data = await response.json();
  if (!response.ok) {
   return sendJson(res, response.status, {
    error: data.error?.message || 'Gemini request failed'
   });
  }

  const text = data.candidates?.[0]?.content?.parts
   ?.map(part => part.text || '')
   .join('\n')
   .trim();

  return sendJson(res, 200, { text: text || 'I could not generate a response.' });
 } catch (error) {
  console.error('Gemini request failed:', error);
  return sendJson(res, 500, { error: 'Gemini request failed. Check the server logs for details.' });
 }
}

export default function gemini(req, res) {
 return handleGeminiRequest(req, res);
}
