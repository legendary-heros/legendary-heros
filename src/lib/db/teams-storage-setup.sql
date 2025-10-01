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

