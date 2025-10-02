-- Create storage bucket for user assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-assets', 'user-assets', true);

-- Set up storage policies for user-assets bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-assets' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow public access to read files
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-assets');

-- Allow users to update their own files
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-assets')
WITH CHECK (bucket_id = 'user-assets');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-assets');



-- Create storage bucket for team images
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-images', 'team-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for team images
CREATE POLICY "Team images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-images');

CREATE POLICY "Authenticated users can upload team images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'team-images'
);

CREATE POLICY "Team leaders can update their team images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'team-images'
);

CREATE POLICY "Team leaders can delete their team images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'team-images'
);