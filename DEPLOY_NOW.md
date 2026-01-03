# 🚀 DEPLOY NOW - Step by Step

## ✅ STEP 1: Frontend - COMPLETED!

**Your frontend is LIVE at**: https://card-snaps.vercel.app

---

## ⏳ STEP 2: Deploy Backend (5-10 minutes)

### Quick Deploy to Render:

1. **Open**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect Repository**:
   - If your backend is in the same repo: Connect your GitHub repo
   - If separate: Use "Public Git repository" and paste: `https://github.com/Nehyan362012/card-snaps-backend.git`

4. **Configure**:
   ```
   Name: card-snaps-backend
   Environment: Node
   Region: (choose closest)
   Branch: main
   Root Directory: (leave empty)
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   SUPABASE_URL = (your Supabase project URL)
   SUPABASE_ANON_KEY = (your Supabase anon key)
   GEMINI_API_KEY = (your Gemini API key - optional)
   NODE_ENV = production
   PORT = 3001
   ```

6. **Click**: "Create Web Service"
7. **Wait**: 2-5 minutes for deployment
8. **Copy**: Your backend URL (e.g., `https://card-snaps-backend-xxxx.onrender.com`)

---

## ⏳ STEP 3: Connect Frontend to Backend (2 minutes)

1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your `card-snaps` project
3. **Go to**: Settings → Environment Variables
4. **Add these variables**:
   ```
   VITE_API_BASE = https://your-backend-url.onrender.com
   VITE_SUPABASE_URL = (your Supabase URL)
   VITE_SUPABASE_ANON_KEY = (your Supabase key)
   VITE_GEMINI_API_KEY = (optional)
   ```

5. **Redeploy**: Go to Deployments → Click "..." → "Redeploy"

OR run:
```bash
vercel --prod
```

---

## ✅ STEP 4: Test Your Deployment

1. **Visit**: https://card-snaps.vercel.app
2. **Check**: Browser console for errors
3. **Test**: Create a deck, save a note
4. **Verify**: Data persists (check Supabase dashboard)

---

## 🆘 Troubleshooting

### Backend not responding?
- Check Render logs: Render dashboard → Your service → Logs
- Verify environment variables are set
- Check that `npm start` works locally

### Frontend can't connect?
- Verify `VITE_API_BASE` is set correctly in Vercel
- Check browser console for CORS errors
- Make sure backend URL is accessible

### Database errors?
- Verify Supabase credentials in both Vercel and Render
- Check that you ran `database-schema.sql` in Supabase

---

## 📋 Checklist

- [x] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Environment variables set in Render
- [ ] Environment variables set in Vercel
- [ ] Frontend redeployed with new env vars
- [ ] Tested creating a deck
- [ ] Tested saving a note
- [ ] Verified data in Supabase

---

## 🎉 You're Done!

Once all steps are complete, your app will be fully deployed and working!

**Frontend**: https://card-snaps.vercel.app  
**Backend**: https://your-backend-url.onrender.com

