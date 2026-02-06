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
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useScriptChat, ChatMessage } from "@/hooks/useScriptChat";
import { useTextScripts } from "@/hooks/useTextScripts";
import { allObjections } from "@/data/mockScripts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-muted-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "glass rounded-bl-md"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isUser ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export function ScriptChat() {
  const { scripts, loading: scriptsLoading } = useTextScripts();
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedScript = useMemo(
    () => scripts.find((s) => s.id === selectedScriptId),
    [scripts, selectedScriptId]
  );

  // Auto-select first script
  useEffect(() => {
    if (scripts.length > 0 && !selectedScriptId) {
      setSelectedScriptId(scripts[0].id);
    }
  }, [scripts, selectedScriptId]);

  // Prepare objections for the AI
  const objectionsData = useMemo(
    () =>
      allObjections.map((o) => ({
        category: o.category,
        trigger: o.trigger,
        keywords: o.keywords,
      })),
    []
  );

  const { messages, isLoading, sendMessage, startConversation, clearChat } =
    useScriptChat({
      scriptContent: selectedScript?.content ?? "",
      objections: objectionsData,
    });

  // Auto-scroll to bottom
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

  return (
    <div className="p-8 space-y-6 animate-fade-in h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Тест скрипта</h1>
          <p className="text-muted-foreground mt-1">
            Тестируйте скрипты в текстовом чате с AI-клиентом
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
        {/* Left panel — settings */}
        <div className="space-y-4">
          <Card className="glass">
            <CardContent className="pt-6 space-y-4">
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
                  <Select
                    value={selectedScriptId}
                    onValueChange={setSelectedScriptId}
                  >
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
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Возражения
                </p>
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
                  AI-клиент использует все {allObjections.length} возражений из базы
                </p>
              </div>

              {!chatStarted && (
                <Button
                  className="w-full"
                  onClick={handleStart}
                  disabled={!selectedScript || isLoading}
                >
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

          {/* Tips */}
          <Card className="glass">
            <CardContent className="pt-6">
              <h4 className="text-sm font-medium text-foreground mb-2">
                💡 Как тестировать
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• Выберите скрипт и нажмите «Начать»</li>
                <li>• AI будет играть роль клиента</li>
                <li>• Вы — менеджер по продажам</li>
                <li>• Следуйте скрипту или импровизируйте</li>
                <li>• AI будет возражать — практикуйтесь!</li>
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
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Начните тестовый разговор
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Выберите скрипт слева и нажмите «Начать разговор»
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
                <div className="max-w-2xl mx-auto">
                  {/* Client info banner */}
                  <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">
                      🎭 AI играет роль:{" "}
                      <span className="font-medium text-foreground">
                        Дмитрий Сергеевич
                      </span>{" "}
                      — Коммерческий директор, ООО «ТехноСтар»
                    </p>
                  </div>

                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
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

              {/* Input */}
              <div className="p-4 border-t border-border/50">
                <div className="max-w-2xl mx-auto flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Вы — менеджер. Напишите свою реплику..."
                    className="bg-secondary"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
