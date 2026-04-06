import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppTheme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
    root.classList.toggle("light", !prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem("app-theme") as AppTheme) || "dark";
  });
  const [timezone, setTimezoneState] = useState(() => {
    return localStorage.getItem("app-timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  // Apply theme on mount and changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Load from DB
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("user_preferences")
        .select("theme, timezone")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data?.theme) {
        const t = data.theme as AppTheme;
        setThemeState(t);
        localStorage.setItem("app-theme", t);
      }
      if (data?.timezone) {
        setTimezoneState(data.timezone);
        localStorage.setItem("app-timezone", data.timezone);
      }
    };
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("user_preferences")
          .select("theme, timezone")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.theme) {
              const t = data.theme as AppTheme;
              setThemeState(t);
              localStorage.setItem("app-theme", t);
            }
            if (data?.timezone) {
              setTimezoneState(data.timezone);
              localStorage.setItem("app-timezone", data.timezone);
            }
          });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const setTheme = useCallback(async (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem("app-theme", t);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("user_preferences").upsert(
        { user_id: session.user.id, theme: t },
        { onConflict: "user_id" }
      );
    }
  }, []);

  const setTimezone = useCallback(async (tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem("app-timezone", tz);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("user_preferences").upsert(
        { user_id: session.user.id, timezone: tz },
        { onConflict: "user_id" }
      );
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, timezone, setTimezone }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
