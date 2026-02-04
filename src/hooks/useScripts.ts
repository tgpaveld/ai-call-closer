import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Script, ScriptBlock, ScriptVariable } from '@/types/script';
import { scriptsList } from '@/data/mockScripts';
import { toast } from 'sonner';

interface DbScript {
  id: string;
  name: string;
  description: string | null;
  blocks: ScriptBlock[];
  variables: ScriptVariable[];
  is_active: boolean;
  version: number;
  ab_test_group: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToScript(db: DbScript): Script {
  return {
    id: db.id,
    name: db.name,
    description: db.description || undefined,
    blocks: db.blocks || [],
    variables: db.variables || [],
    isActive: db.is_active,
    version: db.version,
    abTestGroup: db.ab_test_group as 'A' | 'B' | undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapScriptToDb(script: Script) {
  return {
    id: script.id,
    name: script.name,
    description: script.description || null,
    blocks: JSON.parse(JSON.stringify(script.blocks)),
    variables: JSON.parse(JSON.stringify(script.variables)),
    is_active: script.isActive,
    version: script.version,
    ab_test_group: script.abTestGroup || null,
  };
}

export function useScripts() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load scripts from database
  const loadScripts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        // Parse JSONB fields properly
        const parsedScripts = data.map((db) => mapDbToScript({
          ...db,
          blocks: typeof db.blocks === 'string' ? JSON.parse(db.blocks) : db.blocks,
          variables: typeof db.variables === 'string' ? JSON.parse(db.variables) : db.variables,
        }));
        setScripts(parsedScripts);
      } else {
        // Seed with mock data if empty
        console.log('No scripts found, seeding with mock data...');
        await seedScripts();
      }
    } catch (err) {
      console.error('Error loading scripts:', err);
      setError('Не удалось загрузить скрипты');
      // Fallback to mock data
      setScripts(scriptsList);
    } finally {
      setLoading(false);
    }
  }, []);

  // Seed database with initial mock scripts
  const seedScripts = async () => {
    try {
      const scriptsToInsert = scriptsList.map(mapScriptToDb);
      
      const { data, error: insertError } = await supabase
        .from('scripts')
        .insert(scriptsToInsert)
        .select();

      if (insertError) throw insertError;

      if (data) {
        const parsedScripts = data.map((db) => mapDbToScript({
          ...db,
          blocks: typeof db.blocks === 'string' ? JSON.parse(db.blocks) : db.blocks,
          variables: typeof db.variables === 'string' ? JSON.parse(db.variables) : db.variables,
        }));
        setScripts(parsedScripts);
        console.log('Seeded scripts successfully');
      }
    } catch (err) {
      console.error('Error seeding scripts:', err);
      setScripts(scriptsList);
    }
  };

  // Save/update a script
  const saveScript = async (script: Script): Promise<boolean> => {
    try {
      const dbScript = mapScriptToDb(script);
      
      const { error: upsertError } = await supabase
        .from('scripts')
        .upsert(dbScript, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      // Update local state
      setScripts(prev => 
        prev.map(s => s.id === script.id ? script : s)
      );

      return true;
    } catch (err) {
      console.error('Error saving script:', err);
      toast.error('Ошибка сохранения', {
        description: 'Не удалось сохранить скрипт в базу данных'
      });
      return false;
    }
  };

  // Create a new script
  const createScript = async (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Promise<Script | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('scripts')
        .insert([{
          name: script.name,
          description: script.description || null,
          blocks: JSON.parse(JSON.stringify(script.blocks)),
          variables: JSON.parse(JSON.stringify(script.variables)),
          is_active: script.isActive,
          version: script.version,
          ab_test_group: script.abTestGroup || null,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        const newScript = mapDbToScript({
          ...data,
          blocks: typeof data.blocks === 'string' ? JSON.parse(data.blocks) : data.blocks,
          variables: typeof data.variables === 'string' ? JSON.parse(data.variables) : data.variables,
        });
        setScripts(prev => [newScript, ...prev]);
        return newScript;
      }

      return null;
    } catch (err) {
      console.error('Error creating script:', err);
      toast.error('Ошибка создания', {
        description: 'Не удалось создать скрипт'
      });
      return null;
    }
  };

  // Delete a script
  const deleteScript = async (scriptId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('scripts')
        .delete()
        .eq('id', scriptId);

      if (deleteError) throw deleteError;

      setScripts(prev => prev.filter(s => s.id !== scriptId));
      return true;
    } catch (err) {
      console.error('Error deleting script:', err);
      toast.error('Ошибка удаления', {
        description: 'Не удалось удалить скрипт'
      });
      return false;
    }
  };

  // Load scripts on mount
  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  return {
    scripts,
    loading,
    error,
    saveScript,
    createScript,
    deleteScript,
    reloadScripts: loadScripts,
  };
}
