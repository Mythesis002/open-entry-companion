-- Allow authenticated users to update template counts
CREATE POLICY "Authenticated users can update template counts" ON public.templates 
  FOR UPDATE TO authenticated 
  USING (true) 
  WITH CHECK (true);