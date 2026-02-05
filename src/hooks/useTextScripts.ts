import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

function mapTextScriptToDb(script: TextScript) {
  return {
    id: script.id,
    name: script.name,
    content: script.content,
    is_active: script.isActive,
  };
}

export function useTextScripts() {
  const [scripts, setScripts] = useState<TextScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScripts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("text_scripts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setScripts((data ?? []).map((row) => mapDbToTextScript(row as DbTextScript)));
    } catch (err) {
      console.error("Error loading text scripts:", err);
      setError("Не удалось загрузить скрипты");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveScript = useCallback(async (script: TextScript): Promise<boolean> => {
    try {
      const { error: upsertError } = await supabase
        .from("text_scripts")
        .upsert(mapTextScriptToDb(script), { onConflict: "id" });

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
  }, []);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  return {
    scripts,
    loading,
    error,
    saveScript,
    reloadScripts: loadScripts,
  };
}
