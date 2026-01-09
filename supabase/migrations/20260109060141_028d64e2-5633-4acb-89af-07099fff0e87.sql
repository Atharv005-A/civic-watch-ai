-- Create storage bucket for complaint evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-evidence', 'complaint-evidence', true);

-- Allow anyone to upload evidence files (for anonymous complaints too)
CREATE POLICY "Anyone can upload evidence"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'complaint-evidence');

-- Allow anyone to view evidence (public bucket)
CREATE POLICY "Anyone can view evidence"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-evidence');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own evidence"
ON storage.objects FOR DELETE
USING (bucket_id = 'complaint-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);