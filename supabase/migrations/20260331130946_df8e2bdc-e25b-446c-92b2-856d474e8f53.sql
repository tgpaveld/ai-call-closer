
-- Add user_id column to all three tables
ALTER TABLE public.scripts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.text_scripts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.auto_dialog_runs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage scripts" ON public.scripts;
DROP POLICY IF EXISTS "Authenticated users can manage text_scripts" ON public.text_scripts;
DROP POLICY IF EXISTS "Authenticated users can manage auto_dialog_runs" ON public.auto_dialog_runs;

-- New RLS policies: users can only see/manage their own data
CREATE POLICY "Users can select own scripts" ON public.scripts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own scripts" ON public.scripts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own scripts" ON public.scripts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own scripts" ON public.scripts FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can select own text_scripts" ON public.text_scripts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own text_scripts" ON public.text_scripts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own text_scripts" ON public.text_scripts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own text_scripts" ON public.text_scripts FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can select own auto_dialog_runs" ON public.auto_dialog_runs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own auto_dialog_runs" ON public.auto_dialog_runs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own auto_dialog_runs" ON public.auto_dialog_runs FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own auto_dialog_runs" ON public.auto_dialog_runs FOR DELETE TO authenticated USING (user_id = auth.uid());
