# Authentication Redirect Fix

## Issues Fixed

### 1. Google OAuth "Invalid Request" Error
**Problem**: Google OAuth was showing "unable to sign in this application sent an invalid request"

**Solution**: 
- Updated `redirectTo` to use `getRedirectUrl()` function that properly handles both development and production URLs
- Added `magicLink={true}` to enable email magic links
- The redirect URL now uses the current page URL (without query params) which works for both localhost and deployed URLs

### 2. Email Verification Redirect Issue
**Problem**: Email verification was redirecting to localhost instead of the deployed URL

**Solution**:
- The `getRedirectUrl()` function now detects the current environment
- In production, it uses the actual deployed URL
- In development, it uses localhost
- This ensures email verification links work correctly

### 3. Supabase Configuration Required

**IMPORTANT**: You must configure the redirect URLs in Supabase:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add these **Redirect URLs**:
   - `https://card-snaps.vercel.app` (or your actual deployed URL)
   - `https://card-snaps.vercel.app/**` (wildcard for all paths)
   - `http://localhost:5173` (for development)
   - `http://localhost:5173/**` (wildcard for development)

3. Set **Site URL** to:
   - `https://card-snaps.vercel.app` (your production URL)

4. For **Google OAuth**, in Google Cloud Console:
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - This is the Supabase callback URL, not your app URL

## How It Works Now

1. **Development**: Uses `http://localhost:5173` for redirects
2. **Production**: Uses the actual deployed URL (e.g., `https://card-snaps.vercel.app`)
3. **Email Verification**: Redirects to the correct URL based on environment
4. **Google OAuth**: Uses the correct redirect URL that Supabase expects

## Testing

1. **Test Google OAuth**:
   - Click "Continue with Google"
   - Should redirect to Google login
   - After login, should redirect back to your app

2. **Test Email Verification**:
   - Sign up with email
   - Check email for verification link
   - Click link - should redirect to your deployed app (not localhost)

## Troubleshooting

If Google OAuth still doesn't work:
1. Check Supabase Dashboard → Authentication → Providers → Google
2. Verify Google OAuth is enabled
3. Check that redirect URI in Google Cloud Console matches: `https://your-project-id.supabase.co/auth/v1/callback`
4. Verify Site URL is set correctly in Supabase

If email verification still redirects to localhost:
1. Check that Site URL in Supabase is set to your production URL
2. Verify redirect URLs include your production URL
3. Clear browser cache and try again




