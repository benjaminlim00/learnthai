-- LearnThaiAI Database Setup - Clean Version
-- All features included, optimized for readability

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Vocabulary with SM-2 spaced repetition
CREATE TABLE vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  word_romanization TEXT,
  translation TEXT NOT NULL,
  sentence TEXT NOT NULL,
  sentence_romanization TEXT,
  sentence_translation TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
  interval INTEGER DEFAULT 1,
  ease_factor DECIMAL(4,2) DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles for speaker preferences
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  speaker_preference TEXT CHECK (speaker_preference IN ('male', 'female')) DEFAULT 'female',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generation logs for daily limits
CREATE TABLE generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_topic TEXT NOT NULL,
  vocabulary_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TTS audio caching
CREATE TABLE cached_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_hash TEXT UNIQUE NOT NULL,
  text_content TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  audio_type TEXT DEFAULT 'reference' CHECK (audio_type IN ('reference', 'user')),
  content_type TEXT DEFAULT 'sentence' CHECK (content_type IN ('word', 'sentence')),
  storage_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Speaking practice sessions
CREATE TABLE pronunciation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
  practice_mode TEXT CHECK (practice_mode IN ('word', 'sentence')),
  target_text TEXT NOT NULL,
  transcribed_text TEXT,
  feedback_data JSONB,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes
CREATE INDEX idx_vocabulary_user_review ON vocabulary(user_id, next_review);
CREATE INDEX idx_vocabulary_status ON vocabulary(status);
CREATE INDEX idx_vocabulary_user_status ON vocabulary(user_id, status);
CREATE INDEX idx_cached_audio_hash ON cached_audio(text_hash);
CREATE INDEX idx_cached_audio_voice ON cached_audio(voice_name);
CREATE INDEX idx_cached_audio_type ON cached_audio(audio_type, content_type);
CREATE INDEX idx_generation_logs_user_date ON generation_logs(user_id, created_at);
CREATE INDEX idx_pronunciation_user ON pronunciation_sessions(user_id);
CREATE INDEX idx_pronunciation_vocab ON pronunciation_sessions(vocabulary_id);
CREATE INDEX idx_pronunciation_user_created ON pronunciation_sessions(user_id, created_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all user tables
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_audio ENABLE ROW LEVEL SECURITY;

-- User-only access policies
DO $$
DECLARE table_name TEXT;
BEGIN
    FOR table_name IN VALUES ('vocabulary'), ('user_profiles'), ('generation_logs'), ('pronunciation_sessions')
    LOOP
        EXECUTE format('CREATE POLICY "user_access_%s" ON %I FOR ALL USING (auth.uid() = user_id)', table_name, table_name);
    END LOOP;
END $$;

CREATE POLICY "cached_audio_access" ON cached_audio FOR ALL USING (true);

-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('audio-cache', 'audio-cache', false, 52428800, ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "audio_cache_read" ON storage.objects FOR SELECT USING (bucket_id = 'audio-cache');
CREATE POLICY "audio_cache_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-cache' AND auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE table_name TEXT;
BEGIN
    FOR table_name IN VALUES ('vocabulary'), ('user_profiles')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%s_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', table_name, table_name);
    END LOOP;
END $$;

-- Core application functions
CREATE OR REPLACE FUNCTION get_or_create_user_profile(user_uuid UUID)
RETURNS TABLE(profile_id UUID, profile_user_id UUID, speaker_preference TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) AS $$
DECLARE profile_record user_profiles%ROWTYPE;
BEGIN
  SELECT * INTO profile_record FROM user_profiles p WHERE p.user_id = user_uuid;
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id) VALUES (user_uuid) RETURNING * INTO profile_record;
  END IF;
  RETURN QUERY SELECT profile_record.id, profile_record.user_id, profile_record.speaker_preference, profile_record.created_at, profile_record.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_user_speaker_preference(user_uuid UUID, new_speaker_preference TEXT)
RETURNS TABLE(profile_id UUID, profile_user_id UUID, speaker_preference TEXT, updated_at TIMESTAMPTZ) AS $$
BEGIN
  INSERT INTO user_profiles (user_id, speaker_preference) VALUES (user_uuid, new_speaker_preference)
  ON CONFLICT (user_id) DO UPDATE SET 
    speaker_preference = EXCLUDED.speaker_preference, 
    updated_at = NOW();
  RETURN QUERY SELECT p.id, p.user_id, p.speaker_preference, p.updated_at 
    FROM user_profiles p WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_daily_generation_count(user_uuid UUID) RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM generation_logs WHERE user_id = user_uuid AND created_at >= CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_pronunciation_stats(user_uuid UUID)
RETURNS TABLE(total_sessions INTEGER, today_sessions INTEGER, avg_score DECIMAL, words_practiced INTEGER, sentences_practiced INTEGER) AS $$
BEGIN
  RETURN QUERY SELECT 
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::INTEGER,
    AVG(score)::DECIMAL,
    COUNT(*) FILTER (WHERE practice_mode = 'word')::INTEGER,
    COUNT(*) FILTER (WHERE practice_mode = 'sentence')::INTEGER
  FROM pronunciation_sessions WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA storage TO authenticated, anon, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role; 