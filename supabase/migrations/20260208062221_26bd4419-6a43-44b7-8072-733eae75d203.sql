
-- Enable pg_cron and pg_net for scheduled HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Table to store auto-dialog results
CREATE TABLE public.auto_dialog_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id TEXT,
  script_name TEXT NOT NULL,
  conversation TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS needed — this is a system-level table accessed only by edge functions
ALTER TABLE public.auto_dialog_runs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role full access"
  ON public.auto_dialog_runs
  FOR ALL
  USING (true)
  WITH CHECK (true);
