-- Complete Database Reset Script
-- WARNING: This will delete ALL data, policies, and objects in your LearnThai database
-- Run this in your Supabase SQL Editor for a complete reset

-- Disable row level security temporarily to allow cleanup
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS vocabulary DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS generation_logs DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS pronunciation_sessions DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS cached_audio DISABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error disabling RLS: %', SQLERRM;
END $$;

-- Drop all storage policies
DO $$ 
BEGIN
    -- Drop storage bucket policies
    DROP POLICY IF EXISTS "audio_cache_read" ON storage.objects;
    DROP POLICY IF EXISTS "audio_cache_write" ON storage.objects;
    DROP POLICY IF EXISTS "audio_cache_insert" ON storage.objects;
    DROP POLICY IF EXISTS "audio_cache_update" ON storage.objects;
    DROP POLICY IF EXISTS "audio_cache_delete" ON storage.objects;
    
    -- Drop any other potential storage policies
    DROP POLICY IF EXISTS "authenticated_read" ON storage.objects;
    DROP POLICY IF EXISTS "authenticated_insert" ON storage.objects;
    DROP POLICY IF EXISTS "authenticated_update" ON storage.objects;
    DROP POLICY IF EXISTS "authenticated_delete" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping storage policies: %', SQLERRM;
END $$;

-- Drop all table policies
DO $$ 
BEGIN
    -- Drop table-specific policies
    DROP POLICY IF EXISTS "cached_audio_read" ON cached_audio;
    DROP POLICY IF EXISTS "cached_audio_write" ON cached_audio;
    DROP POLICY IF EXISTS "cached_audio_access" ON cached_audio;
    DROP POLICY IF EXISTS "user_access_vocabulary" ON vocabulary;
    DROP POLICY IF EXISTS "user_access_user_profiles" ON user_profiles;
    DROP POLICY IF EXISTS "user_access_generation_logs" ON generation_logs;
    DROP POLICY IF EXISTS "user_access_pronunciation_sessions" ON pronunciation_sessions;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping table policies: %', SQLERRM;
END $$;

-- Drop triggers
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_vocabulary_timestamp ON vocabulary;
    DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON user_profiles;
    DROP TRIGGER IF EXISTS update_cached_audio_timestamp ON cached_audio;
    DROP TRIGGER IF EXISTS update_generation_logs_timestamp ON generation_logs;
    DROP TRIGGER IF EXISTS update_pronunciation_sessions_timestamp ON pronunciation_sessions;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping triggers: %', SQLERRM;
END $$;

-- Drop all indexes
DO $$
BEGIN
    -- Drop vocabulary indexes
    DROP INDEX IF EXISTS idx_vocabulary_user_review;
    DROP INDEX IF EXISTS idx_vocabulary_user_status;
    
    -- Drop cached audio indexes
    DROP INDEX IF EXISTS idx_cached_audio_hash;
    DROP INDEX IF EXISTS idx_cached_audio_type;
    
    -- Drop generation logs index
    DROP INDEX IF EXISTS idx_generation_logs_user_date;
    
    -- Drop pronunciation sessions index
    DROP INDEX IF EXISTS idx_pronunciation_user_created;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping indexes: %', SQLERRM;
END $$;

-- Drop all tables with CASCADE
DO $$ 
BEGIN
    -- Drop tables in correct order due to dependencies
    DROP TABLE IF EXISTS pronunciation_sessions CASCADE;
    DROP TABLE IF EXISTS cached_audio CASCADE;
    DROP TABLE IF EXISTS generation_logs CASCADE;
    DROP TABLE IF EXISTS vocabulary CASCADE;
    DROP TABLE IF EXISTS user_profiles CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping tables: %', SQLERRM;
END $$;

-- Drop all functions
DO $$ 
BEGIN
    -- Core functions
    DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
    DROP FUNCTION IF EXISTS get_or_create_user_profile(UUID) CASCADE;
    DROP FUNCTION IF EXISTS update_user_speaker_preference(UUID, TEXT) CASCADE;
    DROP FUNCTION IF EXISTS get_user_pronunciation_sessions(UUID, INTEGER) CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping functions: %', SQLERRM;
END $$;

-- Clean up storage
DO $$ 
BEGIN
    -- Delete all files in the audio-cache bucket
    DELETE FROM storage.objects WHERE bucket_id = 'audio-cache';
    
    -- Drop the storage bucket itself
    DELETE FROM storage.buckets WHERE id = 'audio-cache';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error cleaning storage: %', SQLERRM;
END $$;

-- Reset any sequences
DO $$
BEGIN
    -- Reset all sequences to start from 1
    ALTER SEQUENCE IF EXISTS user_profiles_id_seq RESTART WITH 1;
    ALTER SEQUENCE IF EXISTS generation_logs_id_seq RESTART WITH 1;
    ALTER SEQUENCE IF EXISTS pronunciation_sessions_id_seq RESTART WITH 1;
    ALTER SEQUENCE IF EXISTS cached_audio_id_seq RESTART WITH 1;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error resetting sequences: %', SQLERRM;
END $$;

-- Vacuum the database to reclaim space and update statistics
DO $$ 
BEGIN
    VACUUM FULL ANALYZE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during VACUUM: %', SQLERRM;
END $$;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Database cleanup completed successfully. You can now run supabase-clean-setup.sql';
END $$; 