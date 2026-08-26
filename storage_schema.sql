-- ==========================================
-- SUPABASE STORAGE BUCKET & POLICIES
-- ==========================================

-- 1. Create the dedicated 'product-images' bucket
-- Configures size limits (5MB) and specific MIME types (preventing executables).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

-- 2. Apply Storage Policies on storage.objects

-- Allow public read access to the bucket
CREATE POLICY "Public users can read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated admins to INSERT
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND public.is_admin()
  -- Force structure to be inside the products folder (e.g. products/uuid/image.webp)
  AND (storage.foldername(name))[1] = 'products'
);

-- Allow authenticated admins to UPDATE (replace images)
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND public.is_admin()
);

-- Allow authenticated admins to DELETE
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND public.is_admin()
);
