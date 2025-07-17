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
  word_romanization TEXT NOT NULL,
  translation TEXT NOT NULL,
  sentence TEXT NOT NULL,
  sentence_romanization TEXT NOT NULL,
  sentence_translation TEXT NOT NULL,
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

-- Pronunciation sessions for speaking practice
-- Fixed: Removed duplicate id field
CREATE TABLE pronunciation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('word', 'sentence')),
  errors TEXT[] CHECK (array_length(errors, 1) IS NULL OR 
    array_position(errors, 'tone_error') IS NOT NULL OR
    array_position(errors, 'vowel_length') IS NOT NULL OR
    array_position(errors, 'vowel_mispronunciation') IS NOT NULL OR
    array_position(errors, 'aspiration') IS NOT NULL OR
    array_position(errors, 'consonant_error') IS NOT NULL OR
    array_position(errors, 'final_consonant') IS NOT NULL OR
    array_position(errors, 'rhythm_timing') IS NOT NULL OR
    array_position(errors, 'stress_pattern') IS NOT NULL OR
    array_position(errors, 'word_boundary') IS NOT NULL OR
    array_position(errors, 'overall_fluency') IS NOT NULL
  ),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes with comments explaining their purpose

-- Vocabulary indexes
CREATE INDEX idx_vocabulary_user_review ON vocabulary(user_id, next_review);
-- ^ Critical for spaced repetition: Fetching due words for a user

CREATE INDEX idx_vocabulary_user_status ON vocabulary(user_id, status);
-- ^ Used for filtering vocabulary by status per user

-- Cached audio indexes
CREATE INDEX idx_cached_audio_hash ON cached_audio(text_hash);
-- ^ Critical for TTS caching: Fast lookups by text hash

CREATE INDEX idx_cached_audio_type ON cached_audio(audio_type, content_type);
-- ^ Used for filtering audio by type and content

-- Generation logs index
CREATE INDEX idx_generation_logs_user_date ON generation_logs(user_id, created_at);
-- ^ Used for checking daily generation limits

-- Pronunciation sessions index
CREATE INDEX idx_pronunciation_user_created ON pronunciation_sessions(user_id, created_at);
-- ^ Used for fetching recent pronunciation sessions

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

-- Cached audio policies - allow authenticated users to read, service role to write
CREATE POLICY "cached_audio_read" ON cached_audio FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "cached_audio_write" ON cached_audio FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('audio-cache', 'audio-cache', false, 52428800, ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "audio_cache_read" ON storage.objects FOR SELECT USING (bucket_id = 'audio-cache' AND auth.role() IN ('authenticated', 'service_role'));
CREATE POLICY "audio_cache_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-cache' AND auth.role() IN ('authenticated', 'service_role'));
CREATE POLICY "audio_cache_update" ON storage.objects FOR UPDATE USING (bucket_id = 'audio-cache' AND auth.role() IN ('authenticated', 'service_role'));
CREATE POLICY "audio_cache_delete" ON storage.objects FOR DELETE USING (bucket_id = 'audio-cache' AND auth.role() IN ('authenticated', 'service_role'));

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


-- Simple function to get pronunciation sessions for analysis
CREATE OR REPLACE FUNCTION get_user_pronunciation_sessions(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  id UUID,
  content TEXT,
  content_type TEXT,
  errors TEXT[],
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY SELECT 
    ps.id,
    ps.content,
    ps.content_type,
    ps.errors,
    ps.score,
    ps.created_at
  FROM pronunciation_sessions ps
  WHERE ps.user_id = user_uuid
    AND ps.created_at >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY ps.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA storage TO authenticated, anon, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role; 