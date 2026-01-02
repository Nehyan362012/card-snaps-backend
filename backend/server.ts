import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { Deck, Note, Test, ChatSession, UserStats } from './types';
import { CommunityItem } from './services/api';

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
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    cards TEXT
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    subject TEXT,
    content TEXT,
    background TEXT,
    createdAt INTEGER,
    lastModified INTEGER
  );

  CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    title TEXT,
    date INTEGER,
    topics TEXT
  );

  CREATE TABLE IF NOT EXISTS stats (
    id TEXT PRIMARY KEY,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT,
    messages TEXT,
    lastActive INTEGER
  );

  CREATE TABLE IF NOT EXISTS community (
    id TEXT PRIMARY KEY,
    type TEXT,
    title TEXT,
    description TEXT,
    author TEXT,
    data TEXT,
    downloads INTEGER,
    timestamp INTEGER
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT,
    userId TEXT
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    postId TEXT,
    userId TEXT,
    text TEXT,
    timestamp INTEGER
  );

  CREATE TABLE IF NOT EXISTS views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId TEXT,
    userId TEXT,
    timestamp INTEGER
  );
`);

// Prepared statements
const getDecksStmt = db.prepare('SELECT * FROM decks');
const createDeckStmt = db.prepare('INSERT INTO decks VALUES (?, ?, ?, ?)');
const updateDeckStmt = db.prepare('UPDATE decks SET title = ?, description = ?, cards = ? WHERE id = ?');
const deleteDeckStmt = db.prepare('DELETE FROM decks WHERE id = ?');

const getNotesStmt = db.prepare('SELECT * FROM notes');
const createNoteStmt = db.prepare('INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?)');
const updateNoteStmt = db.prepare('UPDATE notes SET title = ?, subject = ?, content = ?, background = ?, lastModified = ? WHERE id = ?');
const deleteNoteStmt = db.prepare('DELETE FROM notes WHERE id = ?');

const getTestsStmt = db.prepare('SELECT * FROM tests');
const createTestStmt = db.prepare('INSERT INTO tests VALUES (?, ?, ?, ?)');
const deleteTestStmt = db.prepare('DELETE FROM tests WHERE id = ?');

const getStatsStmt = db.prepare('SELECT data FROM stats WHERE id = ?');
const setStatsStmt = db.prepare('INSERT OR REPLACE INTO stats VALUES (?, ?)');

const getChatsStmt = db.prepare('SELECT * FROM chats');
const createChatStmt = db.prepare('INSERT INTO chats VALUES (?, ?, ?, ?)');

const getCommunityStmt = db.prepare('SELECT * FROM community');
const createCommunityStmt = db.prepare('INSERT INTO community VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

const getLikesStmt = db.prepare('SELECT * FROM likes WHERE postId = ?');
const addLikeStmt = db.prepare('INSERT INTO likes (postId, userId) VALUES (?, ?)');
const removeLikeStmt = db.prepare('DELETE FROM likes WHERE postId = ? AND userId = ?');

const getCommentsStmt = db.prepare('SELECT * FROM comments WHERE postId = ?');
const addCommentStmt = db.prepare('INSERT INTO comments VALUES (?, ?, ?, ?, ?)');

const addViewStmt = db.prepare('INSERT INTO views (postId, userId, timestamp) VALUES (?, ?, ?)');

// API Routes

// Decks
app.get('/api/decks', (req, res) => {
  const rows = getDecksStmt.all() as { id: string; title: string; description: string; cards: string }[];
  const decks = rows.map(row => ({
    ...row,
    cards: JSON.parse(row.cards)
  }));
  res.json(decks);
});

app.post('/api/decks', (req, res) => {
  const deck: Deck = req.body;
  createDeckStmt.run(deck.id, deck.title, deck.description, JSON.stringify(deck.cards));
  res.json(deck);
});

app.put('/api/decks/:id', (req, res) => {
  const id = req.params.id;
  const updatedDeck: Deck = req.body;
  updateDeckStmt.run(updatedDeck.title, updatedDeck.description, JSON.stringify(updatedDeck.cards), id);
  res.json(updatedDeck);
});

app.delete('/api/decks/:id', (req, res) => {
  const id = req.params.id;
  deleteDeckStmt.run(id);
  res.json({ success: true });
});

// Notes
app.get('/api/notes', (req, res) => {
  const notes = getNotesStmt.all();
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const note: Note = req.body;
  createNoteStmt.run(note.id, note.title, note.subject, note.content, note.background, note.createdAt, note.lastModified);
  res.json(note);
});

app.put('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  const updatedNote: Note = req.body;
  updateNoteStmt.run(updatedNote.title, updatedNote.subject, updatedNote.content, updatedNote.background, updatedNote.lastModified, id);
  res.json(updatedNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  deleteNoteStmt.run(id);
  res.json({ success: true });
});

// Stats
app.get('/api/stats', (req, res) => {
  const row = getStatsStmt.get('user_stats') as { data: string } | undefined;
  const stats = row ? JSON.parse(row.data) : {};
  res.json(stats);
});

app.post('/api/stats', (req, res) => {
  const stats = req.body;
  setStatsStmt.run('user_stats', JSON.stringify(stats));
  res.json(stats);
});

// Chats
app.get('/api/chats', (req, res) => {
  const rows = getChatsStmt.all() as { id: string; title: string; messages: string; lastActive: number }[];
  const chats = rows.map(row => ({
    ...row,
    messages: JSON.parse(row.messages)
  }));
  res.json(chats);
});

app.post('/api/chats', (req, res) => {
  const chat: ChatSession = req.body;
  createChatStmt.run(chat.id, chat.title, JSON.stringify(chat.messages), chat.lastActive);
  res.json(chat);
});

// Tests
app.get('/api/tests', (req, res) => {
  const rows = getTestsStmt.all() as { id: string; title: string; date: number; topics: string }[];
  const tests = rows.map(row => ({
    ...row,
    topics: JSON.parse(row.topics)
  }));
  res.json(tests);
});

app.post('/api/tests', (req, res) => {
  const test: Test = req.body;
  createTestStmt.run(test.id, test.title, test.date, JSON.stringify(test.topics));
  res.json(test);
});

app.delete('/api/tests/:id', (req, res) => {
  const id = req.params.id;
  deleteTestStmt.run(id);
  res.json({ success: true });
});

// Community
app.get('/api/community', (req, res) => {
  const rows = getCommunityStmt.all() as { id: string; type: string; title: string; description: string; author: string; data: string; downloads: number; timestamp: number }[];
  const items = rows.map(item => ({
    ...item,
    data: JSON.parse(item.data),
    likesCount: getLikesStmt.all(item.id).length,
    commentsCount: (db.prepare('SELECT COUNT(*) as count FROM comments WHERE postId = ?').get(item.id) as { count: number }).count,
    views: (db.prepare('SELECT COUNT(*) as count FROM views WHERE postId = ?').get(item.id) as { count: number }).count
  }));
  res.json(items);
});

app.post('/api/community', (req, res) => {
  const item: CommunityItem = req.body;
  createCommunityStmt.run(item.id, item.type, item.title, item.description, item.author, JSON.stringify(item.data), item.downloads, item.timestamp);
  res.json(item);
});

app.post('/api/community/:id/like', (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;
  const existing = db.prepare('SELECT * FROM likes WHERE postId = ? AND userId = ?').get(postId, userId);
  if (existing) {
    removeLikeStmt.run(postId, userId);
  } else {
    addLikeStmt.run(postId, userId);
  }
  res.json({ liked: !existing });
});

app.get('/api/community/:id/comments', (req, res) => {
  const postId = req.params.id;
  const comments = getCommentsStmt.all(postId);
  res.json(comments);
});

app.post('/api/community/:id/comments', (req, res) => {
  const postId = req.params.id;
  const comment = {
    id: crypto.randomUUID(),
    postId,
    userId: req.body.userId,
    text: req.body.text,
    timestamp: Date.now()
  };
  addCommentStmt.run(comment.id, comment.postId, comment.userId, comment.text, comment.timestamp);
  res.json(comment);
});

app.post('/api/community/:id/view', (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;
  addViewStmt.run(postId, userId, Date.now());
  res.json({ success: true });
});

// AI endpoint (proxy to Gemini)
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    // Here you would call Gemini API
    // For now, return a mock response
    res.json({ response: 'Mock AI response' });
  } catch (e) {
    res.status(500).json({ error: 'AI error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});