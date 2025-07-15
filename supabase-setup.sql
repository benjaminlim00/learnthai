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

-- Enable Row Level Security for data isolation
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vocabulary table
CREATE POLICY "Users can only access own vocabulary" ON vocabulary
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own vocabulary" ON vocabulary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- Create custom type for vocabulary items in generation logs
CREATE TYPE vocabulary_item AS (
  word text,
  word_romanization text,
  translation text,
  sentence text,
  sentence_romanization text,
  sentence_translation text
);

-- Create generation logs table to track daily usage
CREATE TABLE generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_topic TEXT NOT NULL,
  vocabulary_response vocabulary_item[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for generation logs
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for generation logs
CREATE POLICY "Users can only access own generation logs" ON generation_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own generation logs" ON generation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_generation_logs_user_id ON generation_logs(user_id);
CREATE INDEX idx_generation_logs_created_at ON generation_logs(created_at DESC);
CREATE INDEX idx_generation_logs_user_created_at ON generation_logs(user_id, created_at);

-- ============================================================================
-- TTS Audio Caching System
-- ============================================================================

-- Create the cached_audio table for TTS audio caching
CREATE TABLE cached_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_hash TEXT UNIQUE NOT NULL,
  text_content TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  audio_type TEXT NOT NULL DEFAULT 'reference' CHECK (audio_type IN ('reference', 'user')),
  content_type TEXT NOT NULL DEFAULT 'sentence' CHECK (content_type IN ('word', 'sentence')),
  storage_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cached_audio_text_hash ON cached_audio(text_hash);
CREATE INDEX idx_cached_audio_voice_name ON cached_audio(voice_name);
CREATE INDEX idx_cached_audio_type ON cached_audio(audio_type);
CREATE INDEX idx_cached_audio_content_type ON cached_audio(content_type);
CREATE INDEX idx_cached_audio_created_at ON cached_audio(created_at);

-- ============================================================================
-- Speaking Practice System
-- ============================================================================

-- Create pronunciation practice sessions table
CREATE TABLE pronunciation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  practice_mode TEXT NOT NULL CHECK (practice_mode IN ('word', 'sentence')),
  target_text TEXT NOT NULL,
  transcribed_text TEXT,
  feedback_data JSONB,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pronunciation_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pronunciation sessions
CREATE POLICY "Users can only access own pronunciation sessions" ON pronunciation_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own pronunciation sessions" ON pronunciation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_pronunciation_sessions_user_id ON pronunciation_sessions(user_id);
CREATE INDEX idx_pronunciation_sessions_vocabulary_id ON pronunciation_sessions(vocabulary_id);
CREATE INDEX idx_pronunciation_sessions_created_at ON pronunciation_sessions(created_at DESC);

-- ============================================================================
-- Storage Buckets and Policies
-- ============================================================================

-- Create the audio-cache storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-cache', 
  'audio-cache', 
  false,
  52428800, -- 50MB limit
  ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/mp4'];

-- Create user-recordings storage bucket for temporary user audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-recordings', 
  'user-recordings', 
  false,
  10485760, -- 10MB limit for user recordings
  ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg'];

-- ============================================================================
-- Storage RLS Policies for audio-cache bucket
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read cached audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert cached audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role to manage cached audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon and authenticated to read cached audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated to upload cached audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to cached audio" ON storage.objects;

-- Allow authenticated users to SELECT cached audio files
CREATE POLICY "authenticated_read_cached_audio" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio-cache' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to INSERT cached audio files  
CREATE POLICY "authenticated_insert_cached_audio" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio-cache' AND 
  auth.role() = 'authenticated'
);

-- Allow service role full access to cached audio
CREATE POLICY "service_role_manage_cached_audio" ON storage.objects
FOR ALL USING (
  bucket_id = 'audio-cache' AND 
  (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'service_role')
);

-- Allow anonymous access to read cached audio (for public TTS)
CREATE POLICY "anon_read_cached_audio" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio-cache' AND 
  auth.role() = 'anon'
);

-- ============================================================================
-- Storage RLS Policies for user-recordings bucket
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage user recordings" ON storage.objects;

-- Allow users to read their own recordings
CREATE POLICY "user_read_own_recordings" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-recordings' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload their own recordings
CREATE POLICY "user_upload_own_recordings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-recordings' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own recordings
CREATE POLICY "user_delete_own_recordings" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-recordings' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow service role full access to user recordings
CREATE POLICY "service_role_manage_user_recordings" ON storage.objects
FOR ALL USING (
  bucket_id = 'user-recordings' AND 
  (auth.jwt()->>'role' = 'service_role' OR auth.role() = 'service_role')
);

-- ============================================================================
-- Row Level Security policies for cached_audio table
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read cached audio records" ON cached_audio;
DROP POLICY IF EXISTS "Allow authenticated users to insert cached audio records" ON cached_audio;
DROP POLICY IF EXISTS "Allow service role to manage cached audio records" ON cached_audio;

ALTER TABLE cached_audio ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read cached audio records (reference audio is shared)
CREATE POLICY "authenticated_read_cached_audio_records" ON cached_audio
FOR SELECT USING (
  auth.role() = 'authenticated' OR 
  auth.role() = 'anon' OR 
  auth.jwt()->>'role' = 'service_role'
);

-- Allow authenticated users to insert cached audio records
CREATE POLICY "authenticated_insert_cached_audio_records" ON cached_audio
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' OR 
  auth.jwt()->>'role' = 'service_role'
);

-- Allow service role full access to cached audio records
CREATE POLICY "service_role_manage_cached_audio_records" ON cached_audio
FOR ALL USING (
  auth.jwt()->>'role' = 'service_role'
);

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Create a function to clean up old cache entries (30+ days old)
CREATE OR REPLACE FUNCTION cleanup_old_cached_audio()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  old_paths TEXT[];
  path TEXT;
BEGIN
  -- Get paths of files to be deleted
  SELECT ARRAY_AGG(storage_path) INTO old_paths
  FROM cached_audio 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete from database
  DELETE FROM cached_audio 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Note: Storage files should be cleaned up separately via cron or manual process
  -- You can use the old_paths array to delete from storage.objects if needed
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old user recordings (7+ days old)
CREATE OR REPLACE FUNCTION cleanup_old_user_recordings()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete old pronunciation session records first
  DELETE FROM pronunciation_sessions 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Note: Storage files in user-recordings bucket should be cleaned up separately
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- API Helper Functions
-- ============================================================================

-- Function to get user's daily generation count
CREATE OR REPLACE FUNCTION get_user_daily_generation_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM generation_logs
    WHERE user_id = user_uuid 
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's pronunciation practice stats
CREATE OR REPLACE FUNCTION get_user_pronunciation_stats(user_uuid UUID)
RETURNS TABLE(
  total_sessions INTEGER,
  today_sessions INTEGER,
  avg_score DECIMAL,
  words_practiced INTEGER,
  sentences_practiced INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_sessions,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::INTEGER as today_sessions,
    AVG(score)::DECIMAL as avg_score,
    COUNT(*) FILTER (WHERE practice_mode = 'word')::INTEGER as words_practiced,
    COUNT(*) FILTER (WHERE practice_mode = 'sentence')::INTEGER as sentences_practiced
  FROM pronunciation_sessions
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Grant necessary permissions
-- ============================================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA storage TO authenticated, anon, service_role;
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_old_cached_audio() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_user_recordings() TO service_role;
GRANT EXECUTE ON FUNCTION get_user_daily_generation_count(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_pronunciation_stats(UUID) TO authenticated, service_role;