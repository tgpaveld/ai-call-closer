-- Create scripts table
CREATE TABLE public.scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  ab_test_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for now, can be restricted later)
CREATE POLICY "Scripts are viewable by everyone" 
ON public.scripts 
FOR SELECT 
USING (true);

-- Allow public insert/update/delete (for now, can add auth later)
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

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_scripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scripts_updated_at
BEFORE UPDATE ON public.scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_scripts_updated_at();