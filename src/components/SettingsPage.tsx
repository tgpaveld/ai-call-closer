import { useState } from "react";
import { User, Phone, Bot, Shield, Globe, Sun, Moon, Monitor, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme, AppTheme } from "@/contexts/ThemeContext";
import { AppLanguage, languageLabels } from "@/i18n/translations";
import { toast } from "sonner";

const TIMEZONES = [
  "Europe/Moscow", "Europe/Kiev", "Europe/London", "Europe/Berlin",
  "Europe/Paris", "Europe/Madrid", "America/New_York", "America/Chicago",
  "America/Denver", "America/Los_Angeles", "Asia/Tokyo", "Asia/Shanghai",
  "Asia/Dubai", "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland",
];

const themeIcons: Record<AppTheme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme, timezone, setTimezone } = useTheme();
  const [companyName, setCompanyName] = useState('Моя компания');
  const [websiteUrl, setWebsiteUrl] = useState('https://example.com');
  const [agentName, setAgentName] = useState('Анна');
  const [voiceSpeed, setVoiceSpeed] = useState(1);

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("settings", "title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings", "subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("settings", "language")}</h2>
              <p className="text-xs text-muted-foreground">{t("settings", "languageDesc")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(languageLabels) as AppLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  language === lang
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary/50 text-muted-foreground hover:border-border hover:bg-secondary"
                }`}
              >
                <span className="text-2xl">{languageLabels[lang].flag}</span>
                <span className="font-medium">{languageLabels[lang].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("settings", "theme")}</h2>
              <p className="text-xs text-muted-foreground">{t("settings", "themeDesc")}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["light", "dark", "system"] as AppTheme[]).map((th) => {
              const Icon = themeIcons[th];
              return (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    theme === th
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-border hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-sm">{t("settings", `theme${th.charAt(0).toUpperCase() + th.slice(1)}`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timezone */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("settings", "timezone")}</h2>
              <p className="text-xs text-muted-foreground">{t("settings", "timezoneDesc")}</p>
            </div>
          </div>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-border bg-secondary/50 text-foreground focus:border-primary focus:outline-none transition-all"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* Company */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t("settings", "companyData")}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">{t("settings", "companyName")}</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">{t("settings", "companyWebsite")}</label>
              <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://" className="bg-secondary border-border" />
            </div>
          </div>
        </div>

        {/* AI Agent */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t("settings", "aiAgent")}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">{t("settings", "agentName")}</label>
              <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} className="bg-secondary border-border" />
              <p className="text-xs text-muted-foreground mt-1">{t("settings", "agentNameDesc")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">{t("settings", "voiceSpeed")}</label>
              <div className="flex items-center gap-4">
                <input type="range" min="0.5" max="1.5" step="0.1" value={voiceSpeed} onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))} className="flex-1" />
                <span className="text-foreground font-medium w-12 text-center">{voiceSpeed}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telephony */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t("settings", "telephony")}</h2>
          </div>
          <div className="space-y-4">
            {[
              { name: t("settings", "autoRedial"), desc: t("settings", "autoRedialDesc") },
              { name: t("settings", "callRecording"), desc: t("settings", "callRecordingDesc") },
              { name: t("settings", "transcription"), desc: t("settings", "transcriptionDesc") },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="glass rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t("settings", "security")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: t("settings", "dataMasking"), desc: t("settings", "dataMaskingDesc") },
              { name: t("settings", "timeRestriction"), desc: t("settings", "timeRestrictionDesc") },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg">{t("settings", "saveChanges")}</Button>
      </div>
    </div>
  );
}
