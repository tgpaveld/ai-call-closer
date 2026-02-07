import { useState, useRef, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Send,
  RotateCcw,
  Play,
  User,
  Bot,
  Loader2,
  FileText,
  Users,
  Headphones,
  FastForward,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useScriptChat, ChatMessage, ChatMode } from "@/hooks/useScriptChat";
import { useTextScripts } from "@/hooks/useTextScripts";
import { allObjections } from "@/data/mockScripts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const MODES: { value: ChatMode; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "ai_manager",
    label: "AI — Менеджер",
    desc: "Вы — клиент, AI продаёт вам",
    icon: <Headphones className="w-4 h-4" />,
  },
  {
    value: "ai_client",
    label: "AI — Клиент",
    desc: "Вы — менеджер, AI — клиент",
    icon: <User className="w-4 h-4" />,
  },
  {
    value: "ai_auto",
    label: "Авто-диалог",
    desc: "AI играет обе роли и учится",
    icon: <Users className="w-4 h-4" />,
  },
];

function MessageBubble({ message, mode }: { message: ChatMessage; mode: ChatMode }) {
  const isUser = message.role === "user";

  // In auto mode, all messages are from assistant, no user bubbles
  if (mode === "ai_auto") {
    return (
      <div className="mb-4">
        <div className="glass rounded-2xl px-4 py-3 text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className="text-[10px] mt-1 text-muted-foreground">
            {message.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    );
  }

  const userIsManager = mode === "ai_client";

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        )}
      >
        {isUser
          ? (userIsManager ? <Headphones className="w-4 h-4" /> : <User className="w-4 h-4" />)
          : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground rounded-br-md" : "glass rounded-bl-md"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isUser ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export function ScriptChat() {
  const { scripts, loading: scriptsLoading } = useTextScripts();
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<ChatMode>("ai_manager");
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedScript = useMemo(
    () => scripts.find((s) => s.id === selectedScriptId),
    [scripts, selectedScriptId]
  );

  useEffect(() => {
    if (scripts.length > 0 && !selectedScriptId) {
      setSelectedScriptId(scripts[0].id);
    }
  }, [scripts, selectedScriptId]);

  const objectionsData = useMemo(
    () => allObjections.map((o) => ({ category: o.category, trigger: o.trigger, keywords: o.keywords })),
    []
  );

  const { messages, isLoading, sendMessage, startConversation, continueAutoDialog, clearChat } =
    useScriptChat({
      scriptContent: selectedScript?.content ?? "",
      objections: objectionsData,
      mode: selectedMode,
    });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStart = () => {
    if (!selectedScript) return;
    startConversation();
  };

  const handleReset = () => {
    clearChat();
    setInputValue("");
  };

  const chatStarted = messages.length > 0;
  const currentModeInfo = MODES.find((m) => m.value === selectedMode)!;

  const roleBanner: Record<ChatMode, { emoji: string; text: string }> = {
    ai_manager: {
      emoji: "🎯",
      text: "AI играет роль: Менеджер Алексей (AI Caller) — Вы играете клиента",
    },
    ai_client: {
      emoji: "🎭",
      text: "AI играет роль: Дмитрий Сергеевич — Коммерческий директор, ООО «ТехноСтар» — Вы менеджер",
    },
    ai_auto: {
      emoji: "🤖",
      text: "Авто-режим: AI играет обе роли — Менеджер Алексей ↔ Клиент Дмитрий Сергеевич",
    },
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Тест скрипта</h1>
          <p className="text-muted-foreground mt-1">
            Тестируйте скрипты в текстовом чате с AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          {chatStarted && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-6rem)]">
        {/* Left panel */}
        <div className="space-y-4">
          <Card className="glass">
            <CardContent className="pt-6 space-y-4">
              {/* Mode selector */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Режим тестирования
                </label>
                <div className="space-y-2">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        if (chatStarted) {
                          clearChat();
                          setInputValue("");
                        }
                        setSelectedMode(m.value);
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        selectedMode === m.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/50 bg-secondary/50 text-muted-foreground hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {m.icon}
                        {m.label}
                      </div>
                      <p className="text-xs mt-1 opacity-75">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Script selector */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Скрипт для теста
                </label>
                {scriptsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Загрузка...
                  </div>
                ) : (
                  <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                    <SelectTrigger className="bg-secondary">
                      <SelectValue placeholder="Выберите скрипт" />
                    </SelectTrigger>
                    <SelectContent>
                      {scripts.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            {s.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Возражения</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    Цена ({allObjections.filter((o) => o.category === "price").length})
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Время ({allObjections.filter((o) => o.category === "timing").length})
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Доверие ({allObjections.filter((o) => o.category === "trust").length})
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Потребность ({allObjections.filter((o) => o.category === "need").length})
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  AI использует все {allObjections.length} возражений из базы
                </p>
              </div>

              {!chatStarted && (
                <Button className="w-full" onClick={handleStart} disabled={!selectedScript || isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Начать разговор
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium text-foreground mb-2">💡 Как тестировать</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {selectedMode === "ai_manager" && (
                  <>
                    <li>• AI играет менеджера по скрипту</li>
                    <li>• Вы — клиент: возражайте, задавайте вопросы</li>
                    <li>• Проверьте, как AI обрабатывает возражения</li>
                  </>
                )}
                {selectedMode === "ai_client" && (
                  <>
                    <li>• AI играет роль клиента</li>
                    <li>• Вы — менеджер: следуйте скрипту</li>
                    <li>• Практикуйте обработку возражений</li>
                  </>
                )}
                {selectedMode === "ai_auto" && (
                  <>
                    <li>• AI ведёт весь разговор сам</li>
                    <li>• Наблюдайте за техниками продаж</li>
                    <li>• Нажимайте «Продолжить» для развития</li>
                    <li>• Учитесь на примере AI</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3 glass rounded-xl flex flex-col overflow-hidden">
          {!chatStarted ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  {currentModeInfo.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{currentModeInfo.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{currentModeInfo.desc}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Выберите скрипт слева и нажмите «Начать разговор»
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">
                      {roleBanner[selectedMode].emoji}{" "}
                      <span className="font-medium text-foreground">
                        {roleBanner[selectedMode].text}
                      </span>
                    </p>
                  </div>

                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} mode={selectedMode} />
                  ))}

                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input / auto-continue */}
              <div className="p-4 border-t border-border/50">
                <div className="max-w-2xl mx-auto flex gap-2">
                  {selectedMode === "ai_auto" ? (
                    <Button
                      className="w-full"
                      onClick={continueAutoDialog}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FastForward className="w-4 h-4 mr-2" />
                      )}
                      Продолжить диалог
                    </Button>
                  ) : (
                    <>
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          selectedMode === "ai_manager"
                            ? "Вы — клиент. Ответьте менеджеру..."
                            : "Вы — менеджер. Напишите свою реплику..."
                        }
                        className="bg-secondary"
                        disabled={isLoading}
                      />
                      <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
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
