# Render Deployment Guide

## ✅ Current Status
All build errors have been fixed. The application now builds cleanly and is ready for Render deployment.

## 📋 Required Environment Variables

### Frontend Service (Card Snaps)
Set these in your Render frontend service environment:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Backend Service (Card Snaps Backend)
Set these in your Render backend service environment:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
```

## 🚀 Deployment Steps

### 1. Push Latest Changes
```bash
git push origin main
```

### 2. Update Render Environment Variables
- Go to your Render dashboard
- Update environment variables for both services
- Restart both services after updating

### 3. Verify Deployment
- Frontend should be accessible at your Render URL
- Backend API should respond at `your-backend-url.onrender.com/api/health`

## 🔧 What Was Fixed

1. **tsx Dependency**: Moved from `devDependencies` to `dependencies` for backend runtime
2. **Port Configuration**: Removed hardcoded PORT from `render.yaml`
3. **Node Version**: Added `NODE_VERSION: 20` to ensure Node 20 on Render
4. **HTML Cleanup**: Removed conflicting importmap and missing CSS reference
5. **Environment Variables**: Graceful handling of missing env vars during build
6. **TypeScript**: All TypeScript errors resolved

## 🧪 Testing After Deployment

1. **Frontend**: Visit your frontend URL - should load the authentication screen
2. **Authentication**: Test email signup and Google OAuth
3. **Backend**: Test API endpoints via the frontend
4. **Environment**: Check Render logs for any runtime errors

## 📝 Notes

- The application uses Supabase for authentication and database
- Google OAuth requires proper redirect URI configuration in Supabase
- Backend runs on the port assigned by Render (not hardcoded)
- Frontend build outputs to `dist/` directory

## 🆘 Troubleshooting

If deployment fails:
1. Check Render build logs
2. Verify all environment variables are set
3. Ensure the repository is up to date
4. Check that Node version 20 is being used

For runtime issues:
1. Check Render service logs
2. Verify Supabase configuration
3. Test API endpoints directly
