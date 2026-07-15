
CREATE POLICY "pdfs owner upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "pdfs owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "pdfs seller read via order" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'pdfs' AND EXISTS (
      SELECT 1 FROM public.orders o WHERE o.file_path = storage.objects.name AND o.seller_id = auth.uid()
    )
  );
CREATE POLICY "pdfs owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
