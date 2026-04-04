
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  social_media TEXT NOT NULL DEFAULT '',
  messengers TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  comment TEXT NOT NULL DEFAULT '',
  last_call_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own clients"
ON public.clients FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clients"
ON public.clients FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clients"
ON public.clients FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own clients"
ON public.clients FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_scripts_updated_at();
