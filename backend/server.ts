import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach((line) => {
    const cleanLine = line.replace(/[^\w=._:/-]/g, '').trim();
    const match = cleanLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key.trim()] = value.trim();
    }
  });
}

import { Deck, Note, Test, ChatSession, UserStats } from '../types';
import type { CommunityItem } from '../services/api';
import { generateDeckFromContent } from '../services/geminiService';

interface Like {
  postId: string;
  userId: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  timestamp: number;
}

interface View {
  postId: string;
  userId: string;
  timestamp: number;
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Missing Supabase environment variables. Backend will run but database operations will fail.');
  console.warn('   Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
}
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminSupabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

// Profile endpoint
app.get('/api/profile', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });
  
  // Get auth token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Return user profile data
  res.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
    avatar: user.user_metadata?.avatar_url || '',
    gradeLevel: 'Student'
  });
});

app.post('/api/profile', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });
  
  // Get auth token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Update user metadata (requires service role on server)
  if (!adminSupabase) {
    return res.status(500).json({ error: 'Service role not configured on server' });
  }
  const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
    user.id,
    { 
      user_metadata: {
        ...user.user_metadata,
        ...req.body
      }
    }
  );
  
  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }
  
  res.json({ success: true, profile: req.body });
});

// API Routes

// Decks
app.get('/api/decks', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env' });
  const { data, error } = await supabase.from('decks').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const decks = (data || []).map(row => ({
    ...row,
    cards: JSON.parse(row.cards || '[]')
  }));
  res.json(decks);
});

app.post('/api/decks', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env' });
  const deck: Deck = req.body;
  const { error } = await supabase.from('decks').insert({
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cards: JSON.stringify(deck.cards)
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json(deck);
});

app.put('/api/decks/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env' });
  const id = req.params.id;
  const updatedDeck: Deck = req.body;
  const { error } = await supabase.from('decks').update({
    title: updatedDeck.title,
    description: updatedDeck.description,
    cards: JSON.stringify(updatedDeck.cards)
  }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(updatedDeck);
});

app.delete('/api/decks/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env' });
  const id = req.params.id;
  const { error } = await supabase.from('decks').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Notes
app.get('/api/notes', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env' });
  const { data, error } = await supabase.from('notes').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/notes', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env' });
  const note: Note = req.body;
  const { error } = await supabase.from('notes').insert({
    id: note.id,
    title: note.title,
    subject: note.subject,
    content: note.content,
    background: note.background,
    created_at: note.createdAt,
    last_modified: note.lastModified
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json(note);
});

app.put('/api/notes/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env' });
  const id = req.params.id;
  const updatedNote: Note = req.body;
  const { error } = await supabase.from('notes').update({
    title: updatedNote.title,
    subject: updatedNote.subject,
    content: updatedNote.content,
    background: updatedNote.background,
    last_modified: updatedNote.lastModified
  }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(updatedNote);
});

app.delete('/api/notes/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env' });
  const id = req.params.id;
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Stats
app.get('/api/stats', async (req, res) => {
  if (!supabase) {
    // Return default stats if database not configured
    const defaultStats = {
      xp: 0,
      streak: 0,
      cardsLearned: 0,
      minutesStudied: 0,
      level: 1,
      lastStudyDate: new Date().toDateString(),
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      fastestSession: 0,
      goals: [],
      goalsGeneratedDate: '',
      inventory: {},
      learnSessionsToday: 0
    };
    return res.json(defaultStats);
  }
  const { data, error } = await supabase.from('stats').select('data').eq('id', 'user_stats').single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  const stats = data ? JSON.parse(data.data) : {
    xp: 0,
    streak: 0,
    cardsLearned: 0,
    minutesStudied: 0,
    level: 1,
    lastStudyDate: new Date().toDateString(),
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    fastestSession: 0,
    goals: [],
    goalsGeneratedDate: '',
    inventory: {},
    learnSessionsToday: 0
  };
  res.json(stats);
});

app.post('/api/stats', async (req, res) => {
  if (!supabase) {
    // If database not configured, just return the stats (they'll be stored locally)
    return res.json(req.body);
  }
  const stats = req.body;
  const { error } = await supabase.from('stats').upsert({
    id: 'user_stats',
    data: JSON.stringify(stats)
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json(stats);
});

// Chats
app.get('/api/chats', async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('chats').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const chats = (data || []).map(row => ({
    ...row,
    messages: JSON.parse(row.messages || '[]')
  }));
  res.json(chats);
});

app.post('/api/chats', async (req, res) => {
  if (!supabase) {
    // If database not configured, just return the chat (it'll be stored locally)
    return res.json(req.body);
  }
  const chat: ChatSession = req.body;
  const { error } = await supabase.from('chats').insert({
    id: chat.id,
    title: chat.title,
    messages: JSON.stringify(chat.messages),
    last_active: chat.lastActive
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json(chat);
});

// Tests
app.get('/api/tests', async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('tests').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const tests = (data || []).map(row => ({
    ...row,
    topics: JSON.parse(row.topics || '[]')
  }));
  res.json(tests);
});

app.post('/api/tests', async (req, res) => {
  if (!supabase) {
    // If database not configured, just return the test (it'll be stored locally)
    return res.json(req.body);
  }
  const test: Test = req.body;
  const { error } = await supabase.from('tests').insert({
    id: test.id,
    title: test.title,
    date: test.date,
    topics: JSON.stringify(test.topics)
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json(test);
});

app.delete('/api/tests/:id', async (req, res) => {
  if (!supabase) return res.json({ success: true });
  const id = req.params.id;
  const { error } = await supabase.from('tests').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Community
app.get('/api/community', async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('community').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const items = await Promise.all((data || []).map(async item => {
    const { data: likes } = await supabase.from('likes').select('*', { count: 'exact' }).eq('postId', item.id);
    const { data: comments } = await supabase.from('comments').select('*', { count: 'exact' }).eq('postId', item.id);
    const { data: views } = await supabase.from('views').select('*', { count: 'exact' }).eq('postId', item.id);
    return {
      ...item,
      data: JSON.parse(item.data || '{}'),
      likesCount: likes?.length || 0,
      commentsCount: comments?.length || 0,
      views: views?.length || 0
    };
  }));
  res.json(items);
});

app.post('/api/community', async (req, res) => {
  if (!supabase) {
    // If database not configured, just return the item (it'll be stored locally)
    return res.json(req.body);
  }
  const item: CommunityItem = req.body;
  const { error } = await supabase.from('community').insert({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    author: item.author,
    data: JSON.stringify(item.data),
    downloads: item.downloads,
    timestamp: item.timestamp
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json(item);
});

app.post('/api/community/:id/like', async (req, res) => {
  if (!supabase) return res.json({ liked: false });
  const postId = req.params.id;
  const userId = req.body.userId;
  const { data: existing } = await supabase.from('likes').select('*').eq('postId', postId).eq('userId', userId).single();
  if (existing) {
    await supabase.from('likes').delete().eq('postId', postId).eq('userId', userId);
  } else {
    await supabase.from('likes').insert({ postId, userId });
  }
  res.json({ liked: !existing });
});

app.get('/api/community/:id/comments', async (req, res) => {
  if (!supabase) return res.json([]);
  const postId = req.params.id;
  const { data, error } = await supabase.from('comments').select('*').eq('postId', postId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/community/:id/comments', async (req, res) => {
  if (!supabase) {
    const comment = {
      id: randomUUID(),
      postId: req.params.id,
      userId: req.body.userId,
      text: req.body.text,
      timestamp: Date.now()
    };
    return res.json(comment);
  }
  const postId = req.params.id;
  const comment = {
    id: randomUUID(),
    postId,
    userId: req.body.userId,
    text: req.body.text,
    timestamp: Date.now()
  };
  const { error } = await supabase.from('comments').insert(comment);
  if (error) return res.status(500).json({ error: error.message });
  res.json(comment);
});

app.post('/api/community/:id/view', async (req, res) => {
  if (!supabase) return res.json({ success: true });
  const postId = req.params.id;
  const userId = req.body.userId;
  await supabase.from('views').insert({ postId, userId, timestamp: Date.now() });
  res.json({ success: true });
});

// AI endpoint (proxy to Gemini)
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const result = await generateDeckFromContent(null, null, prompt, "Generate flashcards from this content");
    res.json(result);
  } catch (e) {
    console.error('AI error:', e);
    res.status(500).json({ error: 'AI error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});