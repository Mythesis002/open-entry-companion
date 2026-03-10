-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload temp refs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'generated-images');

-- Allow public read access
CREATE POLICY "Public read access for generated images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'generated-images');

-- Allow service role to delete
CREATE POLICY "Service role can delete generated images"
ON storage.objects FOR DELETE TO service_role
USING (bucket_id = 'generated-images');
