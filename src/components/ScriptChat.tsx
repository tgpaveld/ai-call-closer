import { useState, useRef, useEffect, useMemo } from "react";
import {
  MessageSquare, Send, RotateCcw, Play, User, Bot, Loader2, FileText, Users, Headphones, FastForward,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useScriptChat, ChatMessage, ChatMode, ChatLanguage } from "@/hooks/useScriptChat";
import { useTextScripts } from "@/hooks/useTextScripts";
import { allObjections } from "@/data/mockScripts";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";

const LANGUAGES: { value: ChatLanguage; label: string; flag: string }[] = [
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "uk", label: "Українська", flag: "🇺🇦" },
];

function MessageBubble({ message, mode }: { message: ChatMessage; mode: ChatMode }) {
  const isUser = message.role === "user";
  if (mode === "ai_auto") {
    return (
      <div className="mb-4">
        <div className="glass rounded-2xl px-4 py-3 text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className="text-[10px] mt-1 text-muted-foreground">{message.timestamp.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>
    );
  }
  const userIsManager = mode === "ai_client";
  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
        {isUser ? (userIsManager ? <Headphones className="w-4 h-4" /> : <User className="w-4 h-4" />) : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed", isUser ? "bg-primary text-primary-foreground rounded-br-md" : "glass rounded-bl-md")}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={cn("text-[10px] mt-1", isUser ? "text-primary-foreground/60" : "text-muted-foreground")}>{message.timestamp.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
    </div>
  );
}

export function ScriptChat() {
  const { scripts, loading: scriptsLoading } = useTextScripts();
  const { t } = useLanguage();
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<ChatMode>("ai_manager");
  const [selectedLanguage, setSelectedLanguage] = useState<ChatLanguage>("ru");
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const MODES: { value: ChatMode; labelKey: string; descKey: string; icon: React.ReactNode }[] = [
    { value: "ai_manager", labelKey: "aiManager", descKey: "aiManagerDesc", icon: <Headphones className="w-4 h-4" /> },
    { value: "ai_client", labelKey: "aiClient", descKey: "aiClientDesc", icon: <User className="w-4 h-4" /> },
    { value: "ai_auto", labelKey: "aiAuto", descKey: "aiAutoDesc", icon: <Users className="w-4 h-4" /> },
  ];

  const selectedScript = useMemo(() => scripts.find((s) => s.id === selectedScriptId), [scripts, selectedScriptId]);
  useEffect(() => { if (scripts.length > 0 && !selectedScriptId) setSelectedScriptId(scripts[0].id); }, [scripts, selectedScriptId]);

  const objectionsData = useMemo(() => allObjections.map((o) => ({ category: o.category, trigger: o.trigger, keywords: o.keywords })), []);

  const { messages, isLoading, sendMessage, startConversation, continueAutoDialog, clearChat } = useScriptChat({
    scriptContent: selectedScript?.content ?? "", objections: objectionsData, mode: selectedMode, language: selectedLanguage,
  });

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = () => { if (!inputValue.trim() || isLoading) return; sendMessage(inputValue.trim()); setInputValue(""); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleStart = () => { if (!selectedScript) return; startConversation(); };
  const handleReset = () => { clearChat(); setInputValue(""); };

  const chatStarted = messages.length > 0;
  const currentModeInfo = MODES.find((m) => m.value === selectedMode)!;

  const roleBannerKeys: Record<ChatMode, string> = {
    ai_manager: "roleBannerManager",
    ai_client: "roleBannerClient",
    ai_auto: "roleBannerAuto",
  };

  const roleBannerEmojis: Record<ChatMode, string> = {
    ai_manager: "🎯", ai_client: "🎭", ai_auto: "🤖",
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("chat", "title")}</h1>
          <p className="text-muted-foreground mt-1">{t("chat", "subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {chatStarted && (<Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" />{t("chat", "reset")}</Button>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-6rem)]">
        <div className="space-y-4">
          <Card className="glass">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">{t("chat", "testMode")}</label>
                <div className="space-y-2">
                  {MODES.map((m) => (
                    <button key={m.value} onClick={() => { if (chatStarted) { clearChat(); setInputValue(""); } setSelectedMode(m.value); }}
                      className={cn("w-full text-left p-3 rounded-lg border transition-all", selectedMode === m.value ? "border-primary bg-primary/10 text-foreground" : "border-border/50 bg-secondary/50 text-muted-foreground hover:border-border")}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">{m.icon}{t("chat", m.labelKey)}</div>
                      <p className="text-xs mt-1 opacity-75">{t("chat", m.descKey)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">{t("chat", "chatLanguage")}</label>
                <div className="flex gap-2">
                  {LANGUAGES.map((lang) => (
                    <button key={lang.value} onClick={() => { if (chatStarted) { clearChat(); setInputValue(""); } setSelectedLanguage(lang.value); }}
                      className={cn("flex-1 text-center p-2 rounded-lg border transition-all text-sm", selectedLanguage === lang.value ? "border-primary bg-primary/10 text-foreground" : "border-border/50 bg-secondary/50 text-muted-foreground hover:border-border")}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <p className="text-xs mt-1">{lang.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">{t("chat", "scriptForTest")}</label>
                {scriptsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" />{t("common", "loading")}</div>
                ) : (
                  <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                    <SelectTrigger className="bg-secondary"><SelectValue placeholder={t("chat", "selectScript")} /></SelectTrigger>
                    <SelectContent>{scripts.map((s) => (<SelectItem key={s.id} value={s.id}><div className="flex items-center gap-2"><FileText className="w-3 h-3" />{s.name}</div></SelectItem>))}</SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t("chat", "objections")}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">{t("objections", "price")} ({allObjections.filter((o) => o.category === "price").length})</Badge>
                  <Badge variant="secondary" className="text-xs">{t("objections", "timing")} ({allObjections.filter((o) => o.category === "timing").length})</Badge>
                  <Badge variant="secondary" className="text-xs">{t("objections", "trust")} ({allObjections.filter((o) => o.category === "trust").length})</Badge>
                  <Badge variant="secondary" className="text-xs">{t("objections", "need")} ({allObjections.filter((o) => o.category === "need").length})</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t("chat", "aiUsesObjections").replace("{count}", String(allObjections.length))}</p>
              </div>

              {!chatStarted && (
                <Button className="w-full" onClick={handleStart} disabled={!selectedScript || isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  {t("chat", "startConversation")}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium text-foreground mb-2">{t("chat", "howToTest")}</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {selectedMode === "ai_manager" && (<><li>• {t("chat", "managerTip1")}</li><li>• {t("chat", "managerTip2")}</li><li>• {t("chat", "managerTip3")}</li></>)}
                {selectedMode === "ai_client" && (<><li>• {t("chat", "clientTip1")}</li><li>• {t("chat", "clientTip2")}</li><li>• {t("chat", "clientTip3")}</li></>)}
                {selectedMode === "ai_auto" && (<><li>• {t("chat", "autoTip1")}</li><li>• {t("chat", "autoTip2")}</li><li>• {t("chat", "autoTip3")}</li><li>• {t("chat", "autoTip4")}</li></>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 glass rounded-xl flex flex-col overflow-hidden">
          {!chatStarted ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">{currentModeInfo.icon}</div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{t("chat", currentModeInfo.labelKey)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("chat", currentModeInfo.descKey)}</p>
                  <p className="text-xs text-muted-foreground mt-2">{t("chat", "selectScriptAndStart")}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">
                      {roleBannerEmojis[selectedMode]}{" "}
                      <span className="font-medium text-foreground">{t("chat", roleBannerKeys[selectedMode])}</span>
                    </p>
                  </div>
                  {messages.map((msg) => (<MessageBubble key={msg.id} message={msg} mode={selectedMode} />))}
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-muted-foreground" /></div>
                      <div className="glass rounded-2xl rounded-bl-md px-4 py-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border/50">
                <div className="max-w-2xl mx-auto flex gap-2">
                  {selectedMode === "ai_auto" ? (
                    <Button className="w-full" onClick={continueAutoDialog} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FastForward className="w-4 h-4 mr-2" />}
                      {t("chat", "continueDialog")}
                    </Button>
                  ) : (
                    <>
                      <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder={selectedMode === "ai_manager" ? t("chat", "youAreClient") : t("chat", "youAreManager")}
                        className="bg-secondary" disabled={isLoading}
                      />
                      <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading} size="icon"><Send className="w-4 h-4" /></Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
