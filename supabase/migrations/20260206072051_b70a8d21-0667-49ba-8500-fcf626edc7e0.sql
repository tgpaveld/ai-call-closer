
-- Drop restrictive policies on text_scripts
DROP POLICY IF EXISTS "Text scripts are viewable by everyone" ON public.text_scripts;
DROP POLICY IF EXISTS "Text scripts can be created by anyone" ON public.text_scripts;
DROP POLICY IF EXISTS "Text scripts can be deleted by anyone" ON public.text_scripts;
DROP POLICY IF EXISTS "Text scripts can be updated by anyone" ON public.text_scripts;

-- Recreate as PERMISSIVE
CREATE POLICY "Text scripts are viewable by everyone"
  ON public.text_scripts FOR SELECT
  USING (true);

CREATE POLICY "Text scripts can be created by anyone"
  ON public.text_scripts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Text scripts can be updated by anyone"
  ON public.text_scripts FOR UPDATE
  USING (true);

CREATE POLICY "Text scripts can be deleted by anyone"
  ON public.text_scripts FOR DELETE
  USING (true);

-- Fix same issue on scripts table
DROP POLICY IF EXISTS "Scripts are viewable by everyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be created by anyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be deleted by anyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be updated by anyone" ON public.scripts;

CREATE POLICY "Scripts are viewable by everyone"
  ON public.scripts FOR SELECT
  USING (true);

CREATE POLICY "Scripts can be created by anyone"
  ON public.scripts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Scripts can be updated by anyone"
  ON public.scripts FOR UPDATE
  USING (true);

CREATE POLICY "Scripts can be deleted by anyone"
  ON public.scripts FOR DELETE
  USING (true);
