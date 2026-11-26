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
2. Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
