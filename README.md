# AI-Based-Business-Financial-Decision-Simulator

FinSim AI is an interactive business-finance simulator built with React, Vite, Recharts, and Google Gemini.

## Features
- **Log In & Sign Up**: Local workspace authentication with demo account support
- **Business Overview**: Revenue, net profit, cash balance, and health score telemetry
- **Decision Simulator**: Model marketing spend, pricing adjustments, and hiring changes
- **AI Advisor**: Context-aware Gemini financial advisor via `/api/gemini`
- **Financial Reports, Risk Analysis & Decision History**: Track trends and runway

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY` from Google AI Studio. Keep this key private; it is only read by the server API route:
   ```bash
   cp .env.example .env
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Deploy to Vercel
1. Import this project in Vercel, or run `vercel` from this directory and follow the prompts.
2. In the Vercel project settings, add `GEMINI_API_KEY` under **Environment Variables** for Production (and Preview if needed). Do not add a `VITE_` prefix.
3. Deploy with `vercel --prod`, or push to the Git provider connected to the Vercel project for automatic deployments.

Vercel builds the Vite app and deploys `api/gemini.js` as the server-side `/api/gemini` function. After changing environment variables, redeploy for them to take effect.
