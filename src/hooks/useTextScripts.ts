import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface TextScript {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DbTextScript {
  id: string;
  name: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapDbToTextScript(db: DbTextScript): TextScript {
  return {
    id: db.id,
    name: db.name,
    content: db.content ?? "",
    isActive: db.is_active,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapTextScriptToDb(script: TextScript, userId?: string) {
  return {
    id: script.id,
    name: script.name,
    content: script.content,
    is_active: script.isActive,
    user_id: userId,
  };
}

const DEFAULT_TEXT_SCRIPTS: Omit<TextScript, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Основной скрипт продаж',
    content: `Здравствуйте, {имя клиента}! Меня зовут {имя агента}, я из компании {название компании}.

Звоню буквально на минуту — у нас сейчас есть интересное предложение, которое может быть вам полезно.

Скажите, вам удобно сейчас говорить?

[Если да] — Отлично! Мы помогаем компаниям автоматизировать продажи с помощью AI. Уже работаем с более чем 50 компаниями, и в среднем наши клиенты увеличивают конверсию на 30%.

[Если нет] — Понимаю, когда вам будет удобно перезвонить?

Могу предложить вам бесплатную демонстрацию, чтобы вы увидели, как это работает на практике. Что скажете?`,
    isActive: true,
  },
];

export function useTextScripts() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<TextScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const seedScripts = useCallback(async () => {
    if (!user) return;
    try {
      const toInsert = DEFAULT_TEXT_SCRIPTS.map(s => ({
        name: s.name,
        content: s.content,
        is_active: s.isActive,
        user_id: user.id,
      }));
      const { data, error: insertError } = await supabase
        .from('text_scripts')
        .insert(toInsert)
        .select();

      if (insertError) throw insertError;
      if (data) {
        setScripts(data.map((row) => mapDbToTextScript(row as DbTextScript)));
        console.log('Seeded text scripts successfully');
      }
    } catch (err) {
      console.error('Error seeding text scripts:', err);
    }
  }, [user]);

  const loadScripts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("text_scripts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setScripts(data.map((row) => mapDbToTextScript(row as DbTextScript)));
      } else {
        console.log('No text scripts found, seeding...');
        await seedScripts();
      }
    } catch (err) {
      console.error("Error loading text scripts:", err);
      setError("Не удалось загрузить скрипты");
    } finally {
      setLoading(false);
    }
  }, [seedScripts]);

  const createScript = useCallback(async (name: string): Promise<TextScript | null> => {
    if (!user) return null;
    try {
      const { data, error: insertError } = await supabase
        .from('text_scripts')
        .insert({ name, content: '', is_active: false, user_id: user.id })
        .select()
        .single();
      if (insertError) throw insertError;
      if (data) {
        const newScript = mapDbToTextScript(data as DbTextScript);
        setScripts(prev => [newScript, ...prev]);
        return newScript;
      }
      return null;
    } catch (err) {
      console.error('Error creating text script:', err);
      toast.error('Ошибка создания скрипта');
      return null;
    }
  }, [user]);

  const saveScript = useCallback(async (script: TextScript): Promise<boolean> => {
    try {
      const { error: upsertError } = await supabase
        .from("text_scripts")
        .upsert(mapTextScriptToDb(script, user?.id), { onConflict: "id" });

      if (upsertError) throw upsertError;

      setScripts((prev) => prev.map((s) => (s.id === script.id ? script : s)));
      return true;
    } catch (err) {
      console.error("Error saving text script:", err);
      toast.error("Ошибка сохранения", {
        description: "Не удалось сохранить скрипт",
      });
      return false;
    }
  }, [user]);

  const deleteScript = useCallback(async (scriptId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('text_scripts')
        .delete()
        .eq('id', scriptId);
      if (deleteError) throw deleteError;
      setScripts(prev => prev.filter(s => s.id !== scriptId));
      return true;
    } catch (err) {
      console.error('Error deleting text script:', err);
      toast.error('Ошибка удаления скрипта');
      return false;
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadScripts();
    } else {
      setLoading(false);
    }
  }, [loadScripts, user]);

  return {
    scripts,
    loading,
    error,
    createScript,
    saveScript,
    deleteScript,
    reloadScripts: loadScripts,
  };
}
