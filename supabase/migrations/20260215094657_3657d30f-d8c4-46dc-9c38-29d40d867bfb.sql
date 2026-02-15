-- Allow anyone to view special complaints (sensitive but public awareness needed)
CREATE POLICY "Anyone can view special complaints"
ON public.complaints
FOR SELECT
USING (type = 'special');
