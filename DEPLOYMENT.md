# 🚀 RetailHub AI Deployment Guide

Follow these steps to deploy your multi-tenant Retail AI platform to the cloud.

## 1. Backend (API & AI Engine)
**Recommended Platform**: [Render](https://render.com/) or [Railway](https://railway.app/)

1. Create a new **Web Service** on Render.
2. Connect your GitHub repository: `mandadihemanthreddy/retailhub-ai`.
3. Set **Root Directory** to `backend`.
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node index.js`
6. **Environment Variables**: Add all keys from your `backend/.env` file:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `NVIDIA_API_KEY`
   - `OPENROUTER_API_KEY`
   - `GEMINI_API_KEY`
   - `PORT`: `5000` (optional, Render handles this)

## 2. Web Frontend
**Recommended Platform**: [Vercel](https://vercel.com/)

1. Create a new project in Vercel.
2. Connect your GitHub repository.
3. Select `frontend` as the **Root Directory**.
4. Vercel will automatically detect **Vite** settings.
5. **Project Settings**:
   - Change the `localhost:5000` references in your code to your **Render Backend URL** (once deployed).
   *Tip: I recommend creating a `.env` in the frontend to store the API URL.*

## 3. Mobile App (Expo)
**Platform**: [Expo EAS](https://expo.dev/eas)

1. Open a terminal in the `mobile` folder.
2. Install EAS CLI: `npm install -g eas-cli`.
3. Run `eas login`.
4. Run `eas build -p android --profile preview` to create an APK for testing.
5. **Important**: Before building, update `BACKEND_URL` in `App.js` to your **Live Render Backend URL**.

---
### 💡 Pro Tip:
Before final deployment, create a `frontend/.env` file:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```
And update `frontend/src/App.jsx` to use `import.meta.env.VITE_API_URL`.
