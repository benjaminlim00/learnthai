-- Drop All Tables and Reset Database
-- WARNING: This will delete ALL data in your LearnThai database
-- Run this in your Supabase SQL Editor only if you want to completely reset

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS due_vocabulary CASCADE;
DROP VIEW IF EXISTS user_vocabulary_stats CASCADE;

-- Drop tables (order matters due to foreign key constraints)
DROP TABLE IF EXISTS cached_audio CASCADE;
DROP TABLE IF EXISTS generation_logs CASCADE;
DROP TABLE IF EXISTS vocabulary CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS vocabulary_item CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_next_review(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_vocabulary_sm2_timestamp() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_cached_audio() CASCADE;

-- Drop storage policies (they're automatically dropped with the bucket, but being explicit)
DROP POLICY IF EXISTS "Allow authenticated users to read cached audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert cached audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role to manage cached audio" ON storage.objects;

-- Drop the storage bucket (this will also remove all files and policies)
DELETE FROM storage.buckets WHERE id = 'audio-cache';

-- Note: RLS policies on tables are automatically dropped when tables are dropped
-- Note: Triggers are automatically dropped when tables are dropped

-- You can now re-run your supabase-setup.sql to recreate everything fresh 