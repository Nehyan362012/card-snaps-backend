-- Card Snaps Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Decks table
CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cards TEXT NOT NULL, -- JSON string
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL, -- HTML string
  background TEXT DEFAULT 'blank',
  created_at BIGINT NOT NULL,
  last_modified BIGINT NOT NULL
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date BIGINT NOT NULL,
  topics TEXT NOT NULL -- JSON string
);

-- Stats table
CREATE TABLE IF NOT EXISTS stats (
  id TEXT PRIMARY KEY DEFAULT 'user_stats',
  data TEXT NOT NULL -- JSON string
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  messages TEXT NOT NULL, -- JSON string
  last_active BIGINT NOT NULL
);

-- Community table
CREATE TABLE IF NOT EXISTS community (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('deck', 'note')),
  title TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON string
  downloads INTEGER DEFAULT 0,
  timestamp BIGINT NOT NULL
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES community(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES community(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);

-- Views table
CREATE TABLE IF NOT EXISTS views (
  id SERIAL PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES community(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_decks_created_at ON decks(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_tests_date ON tests(date);
CREATE INDEX IF NOT EXISTS idx_chats_last_active ON chats(last_active);
CREATE INDEX IF NOT EXISTS idx_community_timestamp ON community(timestamp);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_views_post_id ON views(post_id);

-- Enable Row Level Security (RLS) - Optional, adjust based on your needs
-- ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE community ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE views ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your authentication needs):
-- CREATE POLICY "Allow public read access" ON decks FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON decks FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON decks FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON decks FOR DELETE USING (true);

