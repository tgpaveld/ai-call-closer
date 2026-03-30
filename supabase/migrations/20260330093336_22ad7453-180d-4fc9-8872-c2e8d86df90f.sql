-- Drop all permissive public policies on scripts
DROP POLICY IF EXISTS "Scripts are viewable by everyone" ON scripts;
DROP POLICY IF EXISTS "Scripts can be created by anyone" ON scripts;
DROP POLICY IF EXISTS "Scripts can be updated by anyone" ON scripts;
DROP POLICY IF EXISTS "Scripts can be deleted by anyone" ON scripts;

-- Drop all permissive public policies on text_scripts
DROP POLICY IF EXISTS "Text scripts are viewable by everyone" ON text_scripts;
DROP POLICY IF EXISTS "Text scripts can be created by anyone" ON text_scripts;
DROP POLICY IF EXISTS "Text scripts can be updated by anyone" ON text_scripts;
DROP POLICY IF EXISTS "Text scripts can be deleted by anyone" ON text_scripts;

-- Drop permissive public policy on auto_dialog_runs
DROP POLICY IF EXISTS "Service role full access" ON auto_dialog_runs;

-- Add authenticated-only policies for scripts
CREATE POLICY "Authenticated users can manage scripts"
ON scripts FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Add authenticated-only policies for text_scripts
CREATE POLICY "Authenticated users can manage text_scripts"
ON text_scripts FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Add authenticated-only policies for auto_dialog_runs
CREATE POLICY "Authenticated users can manage auto_dialog_runs"
ON auto_dialog_runs FOR ALL TO authenticated
USING (true) WITH CHECK (true);