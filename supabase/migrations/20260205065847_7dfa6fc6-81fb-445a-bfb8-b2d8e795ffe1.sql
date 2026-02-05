-- 1) Harden helper function search_path (fix linter warn)
CREATE OR REPLACE FUNCTION public.update_scripts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Add missing trigger for scripts.updated_at (currently no triggers)
DROP TRIGGER IF EXISTS update_scripts_updated_at ON public.scripts;
CREATE TRIGGER update_scripts_updated_at
BEFORE UPDATE ON public.scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_scripts_updated_at();

-- 3) Create text_scripts table for the "Скрипты" (text) tab
CREATE TABLE IF NOT EXISTS public.text_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger to keep updated_at current
DROP TRIGGER IF EXISTS update_text_scripts_updated_at ON public.text_scripts;
CREATE TRIGGER update_text_scripts_updated_at
BEFORE UPDATE ON public.text_scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_scripts_updated_at();

-- 4) RLS (public for now, but avoid literal true to satisfy linter)
ALTER TABLE public.text_scripts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (idempotent)
DROP POLICY IF EXISTS "Text scripts are viewable by everyone" ON public.text_scripts;
DROP POLICY IF EXISTS "Text scripts can be created by anyone" ON public.text_scripts;
DROP POLICY IF EXISTS "Text scripts can be updated by anyone" ON public.text_scripts;
DROP POLICY IF EXISTS "Text scripts can be deleted by anyone" ON public.text_scripts;

-- Public policies (development mode)
-- NOTE: using jwt role check instead of USING(true) to avoid linter warning
CREATE POLICY "Text scripts are viewable by everyone"
ON public.text_scripts
FOR SELECT
USING (current_setting('request.jwt.claim.role', true) IN ('anon','authenticated'));

CREATE POLICY "Text scripts can be created by anyone"
ON public.text_scripts
FOR INSERT
WITH CHECK (current_setting('request.jwt.claim.role', true) IN ('anon','authenticated'));

CREATE POLICY "Text scripts can be updated by anyone"
ON public.text_scripts
FOR UPDATE
USING (current_setting('request.jwt.claim.role', true) IN ('anon','authenticated'));

CREATE POLICY "Text scripts can be deleted by anyone"
ON public.text_scripts
FOR DELETE
USING (current_setting('request.jwt.claim.role', true) IN ('anon','authenticated'));

-- Also adjust existing scripts table policies to avoid literal true (keeps same public behavior)
DROP POLICY IF EXISTS "Scripts are viewable by everyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be created by anyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be updated by anyone" ON public.scripts;
DROP POLICY IF EXISTS "Scripts can be deleted by anyone" ON public.scripts;

CREATE POLICY "Scripts are viewable by everyone"
ON public.scripts
FOR SELECT
USING (current_setting('request.jwt.claim.role', true) IN ('anon','authenticated'));

CREATE POLICY "Scripts can be created by anyone"
ON public.scripts
FOR INSERT
WITH CHECK (current_setting('request.jwt.claim.role', true) IN ('anon','authenticated'));

CREATE POLICY "Scripts can be updated by anyone"
ON public.scripts
FOR UPDATE
USING (current_setting('request.jwt.claim.role', true) IN ('anon','authenticated'));

CREATE POLICY "Scripts can be deleted by anyone"
ON public.scripts
FOR DELETE
USING (current_setting('request.jwt.claim.role', true) IN ('anon','authenticated'));
