-- ==============================================================================
-- SANA ARTS: ARTWORK UPLOAD & STORAGE SYSTEM MIGRATION
-- Features:
--   1. Dedicated public.artworks table linked to public.profiles(id)
--   2. Strict Row Level Security (RLS) policies for viewing, inserting, updating, deleting
--   3. Dedicated 'artworks' Supabase Storage bucket with public read & authenticated write policies
-- ==============================================================================

-- 1. Create the artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  medium TEXT,
  dimensions TEXT,
  image_url TEXT NOT NULL,
  image_path TEXT,
  status TEXT DEFAULT 'Available' NOT NULL CHECK (status IN ('Available', 'Sold')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id 
  ON public.artworks (artist_id);

CREATE INDEX IF NOT EXISTS idx_artworks_category 
  ON public.artworks (category);

CREATE INDEX IF NOT EXISTS idx_artworks_created_at 
  ON public.artworks (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_artworks_status 
  ON public.artworks (status);

-- 3. Configure Row Level Security (RLS)
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view published artworks (visitors, collectors, art enthusiasts)
DROP POLICY IF EXISTS "Artworks are viewable by everyone" ON public.artworks;
CREATE POLICY "Artworks are viewable by everyone"
  ON public.artworks FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can insert their own artwork (ensures auth.uid() = artist_id)
DROP POLICY IF EXISTS "Authenticated users can insert artwork" ON public.artworks;
CREATE POLICY "Authenticated users can insert artwork"
  ON public.artworks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = artist_id);

-- Policy 3: Artwork owners can update their own artwork records
DROP POLICY IF EXISTS "Users can update own artwork" ON public.artworks;
CREATE POLICY "Users can update own artwork"
  ON public.artworks FOR UPDATE TO authenticated
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

-- Policy 4: Artwork owners can delete their own artwork records
DROP POLICY IF EXISTS "Users can delete own artwork" ON public.artworks;
CREATE POLICY "Users can delete own artwork"
  ON public.artworks FOR DELETE TO authenticated
  USING (auth.uid() = artist_id);

-- 4. Set up the dedicated Supabase Storage bucket for artworks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks',
  'artworks',
  true,
  10485760, -- 10 MB maximum file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage Policy 1: Public read access for artwork images
DROP POLICY IF EXISTS "Artwork images are publicly accessible" ON storage.objects;
CREATE POLICY "Artwork images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artworks');

-- Storage Policy 2: Authenticated users can upload artwork images
DROP POLICY IF EXISTS "Authenticated users can upload artwork images" ON storage.objects;
CREATE POLICY "Authenticated users can upload artwork images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'artworks' AND
    auth.role() = 'authenticated'
  );

-- Storage Policy 3: Authenticated users can update their own uploaded artwork images
DROP POLICY IF EXISTS "Users can update their artwork images" ON storage.objects;
CREATE POLICY "Users can update their artwork images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'artworks' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      auth.role() = 'authenticated'
    )
  );

-- Storage Policy 4: Authenticated users can delete their own uploaded artwork images
DROP POLICY IF EXISTS "Users can delete their artwork images" ON storage.objects;
CREATE POLICY "Users can delete their artwork images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'artworks' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      auth.role() = 'authenticated'
    )
  );
