
-- Drop existing overly permissive storage policies for product-images
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- Workspace-scoped upload policy
CREATE POLICY "Users upload to own workspace product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT workspace_id::text FROM public.profiles WHERE id = auth.uid())
);

-- Workspace-scoped update policy
CREATE POLICY "Users update own workspace product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT workspace_id::text FROM public.profiles WHERE id = auth.uid())
);

-- Workspace-scoped delete policy
CREATE POLICY "Users delete own workspace product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT workspace_id::text FROM public.profiles WHERE id = auth.uid())
);

-- Public read access is acceptable for product images (they're displayed in the app)
CREATE POLICY "Public read product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
