# Deployment Guide - Card Snaps

This guide will help you deploy both the frontend and backend of Card Snaps.

## Quick Deploy Options

### Option 1: Vercel (Frontend) + Render (Backend) - Recommended

#### Frontend on Vercel (5 minutes)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - It will detect Vite automatically
   - Add environment variables when prompted:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GEMINI_API_KEY` (optional)

4. **Update API URL** after backend is deployed:
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add: `VITE_API_BASE` = your backend URL (e.g., `https://card-snaps-backend.onrender.com`)

#### Backend on Render (10 minutes)

1. **Go to [Render.com](https://render.com)** and sign up/login

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository (or use manual deploy)
   - Or use the Render CLI:
     ```bash
     npm i -g render-cli
     render login
     render deploy
     ```

3. **Configure the service**:
   - **Name**: `card-snaps-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (or `backend` if you want to separate)

4. **Add Environment Variables** in Render dashboard:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
   - `GEMINI_API_KEY` = your Gemini API key (optional)
   - `PORT` = `3001` (or leave default)
   - `NODE_ENV` = `production`

5. **Deploy**: Click "Create Web Service"

6. **Update Frontend API URL**:
   - Copy your Render backend URL (e.g., `https://card-snaps-backend.onrender.com`)
   - Update `services/api.ts` line 5 to use this URL, or set `VITE_API_BASE` in Vercel

### Option 2: Netlify (Frontend) + Railway (Backend)

#### Frontend on Netlify

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```
   - Or connect GitHub repo in Netlify dashboard
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add Environment Variables** in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (optional)
   - `VITE_API_BASE` = your backend URL

#### Backend on Railway

1. **Go to [Railway.app](https://railway.app)** and sign up

2. **Create New Project** → "Deploy from GitHub repo"

3. **Configure**:
   - Root directory: Leave empty
   - Build command: `npm install`
   - Start command: `npm start`

4. **Add Environment Variables**:
   - Same as Render (see above)

### Option 3: All-in-One on Fly.io

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Create apps** (separate for frontend and backend):
   ```bash
   fly launch  # For backend
   fly launch  # For frontend (in different directory or with different name)
   ```

## Important: Update API URL

After deploying the backend, you **must** update the frontend to point to your backend URL.

### Method 1: Environment Variable (Recommended)

In your frontend deployment (Vercel/Netlify), add:
```
VITE_API_BASE=https://your-backend-url.com
```

Then update `services/api.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'http://localhost:3001' : 'https://card-snaps-backend.onrender.com');
```

### Method 2: Direct Update

Edit `services/api.ts` line 5 and replace the production URL with your backend URL.

## Database Setup

Before deploying, make sure you've:

1. ✅ Created a Supabase project
2. ✅ Run `database-schema.sql` in Supabase SQL Editor
3. ✅ Added Supabase credentials to your deployment environment variables

## Testing Deployment

1. **Test Backend**:
   ```bash
   curl https://your-backend-url.com/api/decks
   ```
   Should return `[]` or your decks

2. **Test Frontend**:
   - Visit your frontend URL
   - Check browser console for errors
   - Try creating a deck

## Troubleshooting

### Backend not starting
- Check Render/Railway logs
- Verify all environment variables are set
- Ensure `npm start` works locally first

### Frontend can't connect to backend
- Check CORS settings (already configured in backend)
- Verify `VITE_API_BASE` or API URL is correct
- Check browser console for CORS errors

### Database errors
- Verify Supabase credentials are correct
- Check that schema was run successfully
- Review Supabase logs

## Quick Deploy Commands

```bash
# Deploy frontend to Vercel
vercel --prod

# Deploy backend to Render (via GitHub)
# Just push to GitHub and connect in Render dashboard

# Or use Render CLI
render deploy
```

## Post-Deployment Checklist

- [ ] Backend is accessible and responding
- [ ] Frontend can connect to backend
- [ ] Database operations work (create deck, save note)
- [ ] Environment variables are set correctly
- [ ] CORS is working (no CORS errors in console)
- [ ] API endpoints return expected data




