import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function sendJson(res, statusCode, payload) {
 res.statusCode = statusCode;
 res.setHeader('Content-Type', 'application/json');
 res.end(JSON.stringify(payload));
}

function createGeminiMiddleware(getApiKey) {
 return async (req, res) => {
  if (req.method !== 'POST') {
   res.setHeader('Allow', 'POST');
   return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const apiKey = getApiKey()?.trim();
  if (!apiKey || apiKey === 'replace_with_your_gemini_api_key') {
   return sendJson(res, 500, {
    error: 'GEMINI_API_KEY is not configured. Add your key to finsim-ai/.env.'
   });
  }

  let body = '';
  let aborted = false;
  req.on('data', chunk => {
   body += chunk;
   if (body.length > 100_000) {
    aborted = true;
    sendJson(res, 413, { error: 'Request payload too large' });
    req.destroy();
   }
  });

  req.on('end', async () => {
   if (aborted) return;
   try {
    const { prompt, context } = JSON.parse(body || '{}');
    if (!prompt?.trim()) {
     return sendJson(res, 400, { error: 'Prompt is required' });
    }

    const systemPrompt = `You are FinSim AI, a concise business-finance advisor.
Use the following simulated business data: ${JSON.stringify(context ?? {})}.
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
    return sendJson(res, 500, { error: error.message || 'Gemini request failed' });
   }
  });
 };
}

export default defineConfig(({ mode }) => {
 const getApiKey = () =>
  loadEnv(mode, process.cwd(), '').GEMINI_API_KEY || process.env.GEMINI_API_KEY;
 const geminiMiddleware = createGeminiMiddleware(getApiKey);

 return {
  plugins: [
   react(),
   {
    name: 'gemini-api',
    configureServer(server) {
     server.middlewares.use('/api/gemini', geminiMiddleware);
    },
    configurePreviewServer(server) {
     server.middlewares.use('/api/gemini', geminiMiddleware);
    }
   }
  ]
 };
});
