# Authentication System Setup

## Current Status

The app has Supabase authentication implemented, but it requires proper configuration to work.

## How Auth Works

1. **Auth Component** (`components/Auth.tsx`):
   - Uses Supabase Auth UI
   - Supports Google OAuth login
   - Shows login screen when user is not authenticated

2. **App Component** (`components/App.tsx`):
   - Checks for Supabase session on load
   - Shows Auth component if not authenticated
   - Loads user profile from session after login

3. **Supabase Client** (`services/supabaseClient.ts`):
   - Creates Supabase client with environment variables
   - Falls back to placeholder if not configured (allows app to work without auth)

## ✅ Auth WILL Work If:

1. **Environment Variables Set**:
   ```env
   VITE_SUPABASE_URL=your_actual_supabase_url
   VITE_SUPABASE_ANON_KEY=your_actual_supabase_key
   ```

2. **Supabase Auth Enabled**:
   - Go to Supabase Dashboard → Authentication → Settings
   - Enable "Enable Email Signup" or "Enable Google OAuth"

3. **Google OAuth Configured** (if using Google login):
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials

4. **Site URL Configured**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your frontend URL (e.g., `https://card-snaps.vercel.app`)
   - Add redirect URLs for OAuth

## ⚠️ Auth WON'T Work If:

- Environment variables are missing or have placeholder values
- Supabase Auth is not enabled in your project
- Google OAuth is not configured (but email auth might still work)
- Site URL is not configured in Supabase

## 🔧 Setup Steps

### 1. Configure Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Enable **Email** or **Google** provider
4. Set **Site URL** to your frontend URL
5. Add **Redirect URLs**:
   - `https://your-frontend-url.vercel.app`
   - `http://localhost:5173` (for development)

### 2. Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. Add to Supabase: **Authentication** → **Providers** → **Google**

### 3. Set Environment Variables

**In Vercel (Frontend)**:
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

**In Render (Backend)**:
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_ANON_KEY` = your Supabase anon key

### 4. Test Authentication

1. Visit your deployed frontend
2. You should see the login screen
3. Try logging in with Google or Email
4. After login, you should see the dashboard

## 🐛 Troubleshooting

### "Auth will not work" warning in console
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Verify they're not placeholder values

### Login button doesn't work
- Check browser console for errors
- Verify Supabase Auth is enabled in dashboard
- Check that Site URL is configured correctly

### Google OAuth not working
- Verify Google OAuth is enabled in Supabase
- Check that redirect URI matches exactly
- Verify Google Cloud credentials are correct

### User can't access app after login
- Check that session is being stored correctly
- Verify `onAuthStateChange` is working
- Check browser console for errors

## 🔄 Fallback Behavior

If Supabase is not configured:
- App will skip authentication
- Users can access the app directly
- Data will be stored in local storage only
- No user accounts or sessions

This allows the app to work even without Supabase, but with limited functionality.

## 📝 Current Implementation

The auth system:
- ✅ Checks for Supabase configuration
- ✅ Shows login screen when not authenticated
- ✅ Handles auth state changes
- ✅ Falls back gracefully if Supabase not configured
- ✅ Supports Google OAuth
- ✅ Supports email/password (if enabled in Supabase)

## 🎯 Next Steps

1. Set up Supabase Auth in your project
2. Configure environment variables
3. Test login flow
4. Verify user data is saved correctly

