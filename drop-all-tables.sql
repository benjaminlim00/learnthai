-- Drop All Tables and Reset Database - Bulletproof Version
-- WARNING: This will delete ALL data in your LearnThai database
-- Run this in your Supabase SQL Editor only if you want to completely reset

-- Use DO blocks to handle any potential errors gracefully
DO $$ 
BEGIN
    -- Drop triggers first (they depend on functions and tables)
    DROP TRIGGER IF EXISTS update_vocabulary_timestamp ON vocabulary;
    DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON user_profiles;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some triggers may not exist - continuing...';
END $$;

DO $$ 
BEGIN
    -- Drop tables (order matters due to foreign key constraints)
    DROP TABLE IF EXISTS pronunciation_sessions CASCADE;
    DROP TABLE IF EXISTS cached_audio CASCADE;
    DROP TABLE IF EXISTS generation_logs CASCADE;
    DROP TABLE IF EXISTS vocabulary CASCADE;
    DROP TABLE IF EXISTS user_profiles CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some tables may not exist - continuing...';
END $$;

DO $$ 
BEGIN
    -- Drop functions
    DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
    DROP FUNCTION IF EXISTS get_or_create_user_profile(UUID) CASCADE;
    DROP FUNCTION IF EXISTS update_user_speaker_preference(UUID, TEXT) CASCADE;
    DROP FUNCTION IF EXISTS get_user_daily_generation_count(UUID) CASCADE;
    DROP FUNCTION IF EXISTS get_user_pronunciation_stats(UUID) CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some functions may not exist - continuing...';
END $$;

DO $$ 
BEGIN
    -- Drop storage policies
    DROP POLICY IF EXISTS "audio_cache_read" ON storage.objects;
    DROP POLICY IF EXISTS "audio_cache_write" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some storage policies may not exist - continuing...';
END $$;

DO $$ 
BEGIN
    -- Drop the storage bucket
    DELETE FROM storage.buckets WHERE id = 'audio-cache';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Storage bucket may not exist - continuing...';
END $$;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Database cleanup completed. You can now run supabase-clean-setup.sql';
END $$; 