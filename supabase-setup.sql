-- LearnThaiAI Database Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Create the vocabulary table with all required fields
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
  -- SM-2 Spaced Repetition fields
  interval INTEGER DEFAULT 1,
  ease_factor DECIMAL(4,2) DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for now (application-level security through API routes)
ALTER TABLE vocabulary DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX idx_vocabulary_status ON vocabulary(status);
CREATE INDEX idx_vocabulary_created_at ON vocabulary(created_at DESC);
-- SM-2 Spaced Repetition indexes
CREATE INDEX idx_vocabulary_next_review ON vocabulary(next_review);
CREATE INDEX idx_vocabulary_user_next_review ON vocabulary(user_id, next_review);

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

-- Create a function to calculate next review date
CREATE OR REPLACE FUNCTION calculate_next_review(current_interval INTEGER)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN NOW() + (current_interval || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to automatically update updated_at when SM-2 fields change
CREATE OR REPLACE FUNCTION update_vocabulary_sm2_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.interval IS DISTINCT FROM NEW.interval OR
        OLD.ease_factor IS DISTINCT FROM NEW.ease_factor OR
        OLD.repetitions IS DISTINCT FROM NEW.repetitions OR
        OLD.next_review IS DISTINCT FROM NEW.next_review) THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vocabulary_sm2_updated_at
    BEFORE UPDATE ON vocabulary
    FOR EACH ROW
    EXECUTE FUNCTION update_vocabulary_sm2_timestamp();

-- Create a view for due vocabulary cards
CREATE VIEW due_vocabulary AS
SELECT 
    id,
    user_id,
    word,
    word_romanization,
    translation,
    sentence,
    sentence_romanization,
    sentence_translation,
    status,
    interval,
    ease_factor,
    repetitions,
    next_review,
    created_at,
    updated_at
FROM vocabulary
WHERE next_review <= NOW()
ORDER BY next_review ASC;

-- Optional: Create a view for user statistics
CREATE VIEW user_vocabulary_stats AS
SELECT 
    user_id,
    COUNT(*) as total_words,
    COUNT(*) FILTER (WHERE status = 'new') as new_words,
    COUNT(*) FILTER (WHERE status = 'learning') as learning_words,
    COUNT(*) FILTER (WHERE status = 'mastered') as mastered_words,
    COUNT(*) FILTER (WHERE next_review <= NOW()) as due_words,
    AVG(ease_factor) as avg_ease_factor,
    AVG(interval) as avg_interval,
    MAX(created_at) as last_added_word
FROM vocabulary
GROUP BY user_id; 