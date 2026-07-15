
-- Seller payment fields
ALTER TABLE public.seller_profiles
  ADD COLUMN IF NOT EXISTS upi_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS qr_path text NOT NULL DEFAULT '';

-- Order: payment verification + print instructions
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'Awaiting Payment',
  ADD COLUMN IF NOT EXISTS payment_proof_path text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_ref text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS orientation text NOT NULL DEFAULT 'Portrait',
  ADD COLUMN IF NOT EXISTS stapling boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lamination boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spiral_binding boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';

-- Storage policies for QR (public bucket) and payment proofs (private)
-- QR codes: any seller can upload/manage their own file under their user_id folder; public read
CREATE POLICY "qrcodes owner write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'qrcodes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "qrcodes owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'qrcodes' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'qrcodes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "qrcodes owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'qrcodes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Payment proofs: buyer uploads under their user_id, seller can read via order link
CREATE POLICY "proofs owner write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment_proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "proofs owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment_proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "proofs seller read via order" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment_proofs' AND EXISTS (
      SELECT 1 FROM public.orders o WHERE o.payment_proof_path = storage.objects.name AND o.seller_id = auth.uid()
    )
  );
CREATE POLICY "proofs owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'payment_proofs' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'payment_proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
