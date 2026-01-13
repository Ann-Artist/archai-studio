-- Create storage bucket for floor plan images
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor-plans', 'floor-plans', true);

-- Allow authenticated users to upload floor plans
CREATE POLICY "Authenticated users can upload floor plans"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'floor-plans');

-- Allow public read access to floor plans
CREATE POLICY "Public can view floor plans"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'floor-plans');

-- Allow users to delete their own floor plans
CREATE POLICY "Users can delete own floor plans"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'floor-plans' AND auth.uid()::text = (storage.foldername(name))[1]);