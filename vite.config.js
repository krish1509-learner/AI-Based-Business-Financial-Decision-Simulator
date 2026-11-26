import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleGeminiRequest } from './api/gemini.js';

function createGeminiMiddleware(getApiKey) {
 return (req, res) => {
  let body = '';
  let tooLarge = false;
  req.on('data', chunk => {
   body += chunk;
   if (body.length > 100_000 && !tooLarge) {
    tooLarge = true;
    res.statusCode = 413;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Request payload too large' }));
   }
  });

  req.on('end', () => {
   if (tooLarge) return;
   try {
    req.body = JSON.parse(body || '{}');
    return handleGeminiRequest(req, res, getApiKey);
   } catch (error) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Request body must be valid JSON' }));
   }
  });
 };
}

export default defineConfig(({ mode }) => {
 const env = loadEnv(mode, process.cwd(), '');
 const getApiKey = () => env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
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
