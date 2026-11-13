# AdaptiveLearn AI — Render & Cloud Deployment Guide

## 1. Hosting Overview
AdaptiveLearn AI is architected as a single Next.js Web Service ready for immediate deployment on **Render**, Vercel, or Docker-compatible cloud hosting.

A complete blueprint configuration is included in `render.yaml`.

---

## 2. Environment Variables Configuration

Configure the following environment variables in your Render Dashboard:

| Variable | Description | Example / Value |
|---|---|---|
| `NODE_ENV` | Production environment flag | `production` |
| `NEXT_PUBLIC_APP_URL` | Base URL of deployed application | `https://adaptivelearn-ai.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client Anon key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-side key | `eyJhbGciOi...` |
| `GROQ_API_KEY` | Groq AI Inference Key | `gsk_...` |
| `GROQ_MODEL` | Groq AI Model Name | `llama-3.3-70b-versatile` |
| `AI_PROVIDER` | Active AI Provider | `groq` |
| `GEMINI_API_KEY` | (Optional) Fallback Gemini Key | `AIzaSy...` |

---

## 3. Render Web Service Deployment Steps

1. **Push Code to GitHub**:
   Ensure all changes are committed and pushed to your GitHub repository.
2. **Create New Web Service on Render**:
   - Log in to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** -> **Web Service**.
   - Select your GitHub repository.
3. **Configure Build & Start Settings**:
   - **Environment**: Node
   - **Region**: Oregon (or nearest to your database)
   - **Branch**: `main`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
4. **Attach Environment Variables**:
   - Add the variables listed in Section 2 under **Environment**.
5. **Deploy**:
   - Click **Create Web Service**. Render will automatically run `npm ci && npm run build` and launch the application.

---

## 4. Supabase Database Setup
1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase/migrations/20261113_initial_schema.sql` and run the script.
4. In **Storage**, create a private bucket named `course-materials`.
5. Copy your Project URL, Anon Key, and Service Role Key into your Render environment variables.

---

## 5. Free-Tier Cold Starts Note
On Render's free instance tier, the service spins down after 15 minutes of inactivity. The initial request may take ~30-50 seconds to boot the Node.js process. For high-stakes live examinations, an active starter/standard instance is recommended.
