
ALTER TABLE public.user_preferences
ADD COLUMN theme TEXT NOT NULL DEFAULT 'system',
ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Europe/Moscow';
