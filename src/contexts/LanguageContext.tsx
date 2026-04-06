import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import translations, { AppLanguage } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (section: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as AppLanguage) || "ru";
  });
  const initialLoadDone = useRef(false);

  // Load language from DB on auth
  useEffect(() => {
    const loadFromDb = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("user_preferences")
        .select("language")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data?.language) {
        const lang = data.language as AppLanguage;
        setLanguageState(lang);
        localStorage.setItem("app-language", lang);
      }
      initialLoadDone.current = true;
    };
    loadFromDb();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("user_preferences")
          .select("language")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.language) {
              const lang = data.language as AppLanguage;
              setLanguageState(lang);
              localStorage.setItem("app-language", lang);
            }
            initialLoadDone.current = true;
          });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from("user_preferences")
        .upsert(
          { user_id: session.user.id, language: lang },
          { onConflict: "user_id" }
        );
    }
  }, []);

  const t = useCallback(
    (section: string, key: string): string => {
      const sec = (translations as any)[section];
      if (!sec) return key;
      const entry = sec[key];
      if (!entry) return key;
      return entry[language] || entry["ru"] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
