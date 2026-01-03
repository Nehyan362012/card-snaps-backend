# Quick Deploy Status

## ✅ Frontend Deployed!

**Frontend URL**: https://card-snaps.vercel.app

## 🔧 Next Steps: Backend Deployment

### Option 1: Render (Recommended - Free Tier Available)

1. **Go to [render.com](https://render.com)** and sign up/login

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository OR use "Public Git repository"
   - Repository: Your card-snaps repo URL

3. **Configure Service**:
   - **Name**: `card-snaps-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your main branch)
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

4. **Add Environment Variables** (in Render dashboard):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_key (optional)
   NODE_ENV=production
   PORT=3001
   ```

5. **Deploy**: Click "Create Web Service"

6. **Wait for deployment** (takes 2-5 minutes)

7. **Copy your backend URL** (e.g., `https://card-snaps-backend.onrender.com`)

8. **Update Frontend Environment Variables**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your `card-snaps` project
   - Go to Settings → Environment Variables
   - Add:
     - `VITE_API_BASE` = `https://your-backend-url.onrender.com`
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase key
     - `VITE_GEMINI_API_KEY` = your Gemini key (optional)

9. **Redeploy Frontend**:
   ```bash
   vercel --prod
   ```

### Option 2: Railway (Alternative)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add environment variables (same as Render)
5. Deploy!

### Option 3: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. `fly auth login`
3. `fly launch` (follow prompts)
4. Add environment variables: `fly secrets set KEY=value`

## 🎯 Current Status

- ✅ Frontend: **DEPLOYED** at https://card-snaps.vercel.app
- ⏳ Backend: **NEEDS DEPLOYMENT** (follow steps above)
- ⏳ Environment Variables: **NEED TO BE SET** in Vercel

## 📝 Quick Commands

```bash
# Redeploy frontend
vercel --prod

# Check deployment logs
vercel logs

# Update environment variables in Vercel
# Use Vercel dashboard or:
vercel env add VITE_API_BASE
```

## 🔗 Important Links

- **Frontend**: https://card-snaps.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Supabase Dashboard**: https://app.supabase.com

