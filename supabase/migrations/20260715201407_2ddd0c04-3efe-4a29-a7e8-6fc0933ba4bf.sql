
DROP POLICY IF EXISTS "proofs owner write" ON storage.objects;
DROP POLICY IF EXISTS "proofs owner read" ON storage.objects;
DROP POLICY IF EXISTS "proofs seller read via order" ON storage.objects;
DROP POLICY IF EXISTS "proofs owner update" ON storage.objects;

CREATE POLICY "proofs owner write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "proofs owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "proofs seller read via order" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs' AND EXISTS (
      SELECT 1 FROM public.orders o WHERE o.payment_proof_path = storage.objects.name AND o.seller_id = auth.uid()
    )
  );
CREATE POLICY "proofs owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
