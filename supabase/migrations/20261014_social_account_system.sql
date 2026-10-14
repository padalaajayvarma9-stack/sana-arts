-- ==============================================================================
-- SANA ARTS: SOCIAL ACCOUNT SYSTEM MIGRATION
-- Features:
--   1. Realtime Online Presence & Last Seen Tracking
--   2. Follow / Unfollow System with RLS Policies & Unique Constraints
--   3. Unique @username Handles & Account Search
-- ==============================================================================

-- 1. Extend profiles table with social fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Ensure username uniqueness (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique 
  ON public.profiles (LOWER(username)) 
  WHERE username IS NOT NULL;

-- Index for username / name search speed
CREATE INDEX IF NOT EXISTS idx_profiles_search 
  ON public.profiles (full_name, username);

-- 2. Create the follows relationship table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- Unique pair index: Prevents duplicate follows
CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_unique_pair 
  ON public.follows (follower_id, following_id);

-- Performance indexes for follower / following queries
CREATE INDEX IF NOT EXISTS idx_follows_follower_id 
  ON public.follows (follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_following_id 
  ON public.follows (following_id);

CREATE INDEX IF NOT EXISTS idx_follows_created_at 
  ON public.follows (created_at DESC);

-- 3. Configure Row Level Security (RLS) on follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read follow relationships (public social counts & lists)
DROP POLICY IF EXISTS "Follow relationships are viewable by everyone" ON public.follows;
CREATE POLICY "Follow relationships are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

-- Authenticated users can follow others as themselves
DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = follower_id AND 
    follower_id <> following_id
  );

-- Authenticated users can unfollow accounts they currently follow
DROP POLICY IF EXISTS "Authenticated users can unfollow" ON public.follows;
CREATE POLICY "Authenticated users can unfollow"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- 4. Ensure profiles RLS permits users to update their own profile & social columns
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Enable Realtime for follows table (optional live follower updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'follows'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;
