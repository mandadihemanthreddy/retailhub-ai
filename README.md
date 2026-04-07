# Retail Chatbot 🛍️

A complete cross-platform chatbot solution built for retail operations. Features a React (Vite) web client, an Expo (React Native) mobile app, an Express API backend, and a Supabase PostgreSQL database.

## Architecture & Features

- **Frontend (Web):** React + Vite. Features glassmorphism UI, real-time simulated latency, and Web Speech API Voice inputs.
- **Backend:** Node.js + Express. Exposes `/api/chat` for keyword rule-based interactions, ready for OpenAI injection. Lookups include product inventory and sales insights.
- **Database:** Supabase (PostgreSQL). Stores tables for `products` and tracking. Check `/database/schema.sql`.
- **Mobile (React Native):** Expo-powered chatbot mirroring the web interface functionality. Requires `expo-av` or external package for full ASR setup depending on test device.

## Getting Started

### 1. Backend 
1. `cd backend`
2. `npm install`
3. `npm run dev`

### 2. Frontend (Web)
1. `cd frontend`
2. `npm install` 
3. `npm run dev`

### 3. Mobile (App)
1. `cd mobile`
2. `npm run start`

## Examples
The chatbot understands rules like:
- "Can you show me your products?"
- "Do you have any sales insights?"
- "What is the stock level?"
- Use the mic icon in web to trigger Web Speech recognition!
