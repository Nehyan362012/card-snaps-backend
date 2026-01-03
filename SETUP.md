# Card Snaps - Setup Guide

This guide will help you set up the Card Snaps application with backend and database support.

## Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- A Supabase account (free tier works fine)
- (Optional) A Gemini API key for AI features

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase Database

1. Go to [Supabase](https://app.supabase.com) and create a new project
2. Once your project is created, go to **Settings** → **API**
3. Copy your **Project URL** and **anon/public key**
4. Go to **SQL Editor** in your Supabase dashboard
5. Run the SQL script from `database-schema.sql` to create all required tables

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration (Backend)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Configuration (Frontend - must start with VITE_)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Key (Optional - for AI features)
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Server Port (optional, defaults to 3001)
PORT=3001
```

**Important Notes:**
- Frontend environment variables must start with `VITE_` to be accessible in the browser
- If you don't set up Supabase, the app will still work but data will only be stored locally
- If you don't set up Gemini API, AI features will use fallback behavior

## Step 4: Run the Application

### Development Mode

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns)
The backend API will be available at `http://localhost:3001`

### Production Build

```bash
npm run build
npm run preview
```

## Troubleshooting

### Backend won't start
- Make sure you've created a `.env` file with `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check that the backend server port (3001) is not already in use
- The backend will still start without Supabase credentials, but database operations will fail

### Frontend can't connect to backend
- Make sure the backend server is running on port 3001
- Check that `API_BASE` in `services/api.ts` points to the correct backend URL
- In development, it should be `http://localhost:3001`

### Database errors
- Verify that you've run the SQL schema from `database-schema.sql` in your Supabase project
- Check that your Supabase credentials in `.env` are correct
- Ensure Row Level Security (RLS) policies allow the operations you need (or disable RLS for development)

### AI features not working
- If you see "AI service is not configured" messages, make sure `VITE_GEMINI_API_KEY` is set in your `.env`
- The app will work without AI, but with limited functionality in Learn Mode

## Database Schema

The application uses the following Supabase tables:
- `decks` - Flashcard decks
- `notes` - User notes
- `tests` - Upcoming tests
- `stats` - User statistics
- `chats` - Chat sessions
- `community` - Shared decks and notes
- `likes` - Community likes
- `comments` - Community comments
- `views` - Community views

See `database-schema.sql` for the complete schema.

## Features

- ✅ Works without database (local storage fallback)
- ✅ Works without AI (fallback exercises)
- ✅ Graceful error handling
- ✅ TypeScript support
- ✅ Modern React with Vite

## Support

If you encounter any issues, check:
1. All environment variables are set correctly
2. Database schema is created in Supabase
3. Backend server is running
4. Browser console for any errors

