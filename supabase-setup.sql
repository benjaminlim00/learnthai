-- LearnThaiAI Database Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Create the vocabulary table
CREATE TABLE vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  word_romanization TEXT,
  translation TEXT NOT NULL,
  sentence TEXT NOT NULL,
  sentence_romanization TEXT,
  sentence_translation TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for now (application-level security through API routes)
ALTER TABLE vocabulary DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX idx_vocabulary_status ON vocabulary(status);
CREATE INDEX idx_vocabulary_created_at ON vocabulary(created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_vocabulary_updated_at 
    BEFORE UPDATE ON vocabulary 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for user statistics
CREATE VIEW user_vocabulary_stats AS
SELECT 
    user_id,
    COUNT(*) as total_words,
    COUNT(*) FILTER (WHERE status = 'new') as new_words,
    COUNT(*) FILTER (WHERE status = 'learning') as learning_words,
    COUNT(*) FILTER (WHERE status = 'mastered') as mastered_words,
    MAX(created_at) as last_added_word
FROM vocabulary
GROUP BY user_id; 