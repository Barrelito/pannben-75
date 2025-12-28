-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public can view avatars
CREATE POLICY "Public Avatars Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);
