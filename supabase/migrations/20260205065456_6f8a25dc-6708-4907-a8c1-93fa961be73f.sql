-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Scripts are viewable by everyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be created by anyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be updated by anyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be deleted by anyone" ON public.scripts;

-- Create permissive policies (default behavior)
CREATE POLICY "Scripts are viewable by everyone" 
ON public.scripts 
FOR SELECT 
USING (true);

CREATE POLICY "Scripts can be created by anyone" 
ON public.scripts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Scripts can be updated by anyone" 
ON public.scripts 
FOR UPDATE 
USING (true);

CREATE POLICY "Scripts can be deleted by anyone" 
ON public.scripts 
FOR DELETE 
USING (true);