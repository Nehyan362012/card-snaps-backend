import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import { Deck, Note, Test, ChatSession, UserStats } from '../types';
import { CommunityItem } from '../services/api';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}
const supabase = createClient(supabaseUrl, supabaseKey);

// API Routes

// Decks
app.get('/api/decks', async (req, res) => {
  const { data, error } = await supabase.from('decks').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const decks = data.map(row => ({
    ...row,
    cards: JSON.parse(row.cards)
  }));
  res.json(decks);
});

app.post('/api/decks', async (req, res) => {
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
  const id = req.params.id;
  const { error } = await supabase.from('decks').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Notes
app.get('/api/notes', async (req, res) => {
  const { data, error } = await supabase.from('notes').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/notes', async (req, res) => {
  const note: Note = req.body;
  const { error } = await supabase.from('notes').insert({
    id: note.id,
    title: note.title,
    subject: note.subject,
    content: note.content,
    background: note.background,
    createdAt: note.createdAt,
    lastModified: note.lastModified
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json(note);
});

app.put('/api/notes/:id', async (req, res) => {
  const id = req.params.id;
  const updatedNote: Note = req.body;
  const { error } = await supabase.from('notes').update({
    title: updatedNote.title,
    subject: updatedNote.subject,
    content: updatedNote.content,
    background: updatedNote.background,
    lastModified: updatedNote.lastModified
  }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(updatedNote);
});

app.delete('/api/notes/:id', async (req, res) => {
  const id = req.params.id;
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Stats
app.get('/api/stats', async (req, res) => {
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
  const { data, error } = await supabase.from('chats').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const chats = data.map(row => ({
    ...row,
    messages: JSON.parse(row.messages)
  }));
  res.json(chats);
});

app.post('/api/chats', async (req, res) => {
  const chat: ChatSession = req.body;
  const { error } = await supabase.from('chats').insert({
    id: chat.id,
    title: chat.title,
    messages: JSON.stringify(chat.messages),
    lastActive: chat.lastActive
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json(chat);
});

// Tests
app.get('/api/tests', async (req, res) => {
  const { data, error } = await supabase.from('tests').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const tests = data.map(row => ({
    ...row,
    topics: JSON.parse(row.topics)
  }));
  res.json(tests);
});

app.post('/api/tests', async (req, res) => {
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
  const id = req.params.id;
  const { error } = await supabase.from('tests').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Community
app.get('/api/community', async (req, res) => {
  const { data, error } = await supabase.from('community').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const items = await Promise.all(data.map(async item => {
    const { data: likes } = await supabase.from('likes').select('*', { count: 'exact' }).eq('postId', item.id);
    const { data: comments } = await supabase.from('comments').select('*', { count: 'exact' }).eq('postId', item.id);
    const { data: views } = await supabase.from('views').select('*', { count: 'exact' }).eq('postId', item.id);
    return {
      ...item,
      data: JSON.parse(item.data),
      likesCount: likes?.length || 0,
      commentsCount: comments?.length || 0,
      views: views?.length || 0
    };
  }));
  res.json(items);
});

app.post('/api/community', async (req, res) => {
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
  const postId = req.params.id;
  const { data, error } = await supabase.from('comments').select('*').eq('postId', postId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/community/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const comment = {
    id: crypto.randomUUID(),
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