import { useState } from "react";
import { Bot, Play, Pause, Settings, Zap, Brain, Phone, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

interface AgentCapability {
  id: string;
  name: string;
  description: string;
  icon: typeof Bot;
  enabled: boolean;
}

const capabilities: AgentCapability[] = [
  {
    id: 'social_search',
    name: 'Поиск в соц.сетях',
    description: 'Автоматический поиск профилей клиентов в VK, LinkedIn, Facebook',
    icon: Search,
    enabled: true,
  },
  {
    id: 'messenger_search',
    name: 'Поиск в мессенджерах',
    description: 'Определение наличия Telegram, WhatsApp, Viber, Signal',
    icon: Zap,
    enabled: true,
  },
  {
    id: 'voice_generation',
    name: 'Генерация голоса',
    description: 'Создание естественного голоса для разговоров',
    icon: Phone,
    enabled: true,
  },
  {
    id: 'conversation_ai',
    name: 'AI разговоры',
    description: 'Умное ведение диалога по скрипту с адаптацией',
    icon: Brain,
    enabled: false,
  },
];

export function AIAgent() {
  const [isRunning, setIsRunning] = useState(false);
  const [agentCapabilities, setAgentCapabilities] = useState(capabilities);

  const toggleCapability = (id: string) => {
    setAgentCapabilities(caps =>
      caps.map(cap =>
        cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
      )
    );
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Агент</h1>
          <p className="text-muted-foreground mt-1">Управление искусственным интеллектом</p>
        </div>
        <Button
          variant={isRunning ? "destructive" : "glow"}
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Остановить
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Запустить
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                isRunning 
                  ? "gradient-primary shadow-glow animate-pulse-glow" 
                  : "bg-secondary"
              )}>
                <Bot className={cn(
                  "w-8 h-8 transition-colors",
                  isRunning ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">CallAI Agent</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isRunning ? "bg-success animate-pulse" : "bg-muted-foreground"
                  )} />
                  <span className="text-sm text-muted-foreground">
                    {isRunning ? "Активен" : "Остановлен"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Обработано сегодня</p>
                <p className="text-2xl font-bold text-foreground mt-1">247</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Успешных звонков</p>
                <p className="text-2xl font-bold text-success mt-1">89</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Найдено соцсетей</p>
                <p className="text-2xl font-bold text-foreground mt-1">312</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Найдено мессенджеров</p>
                <p className="text-2xl font-bold text-foreground mt-1">198</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Возможности агента</h3>
            <div className="space-y-4">
              {agentCapabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={cap.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cap.name}</p>
                        <p className="text-sm text-muted-foreground">{cap.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={cap.enabled}
                      onCheckedChange={() => toggleCapability(cap.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Активность</h3>
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {[
                { time: '14:32', text: 'Звонок клиенту Петров И.', status: 'success' },
                { time: '14:28', text: 'Найден Telegram: @user123', status: 'info' },
                { time: '14:25', text: 'Найден VK профиль', status: 'info' },
                { time: '14:20', text: 'Звонок клиенту Сидорова М.', status: 'warning' },
                { time: '14:15', text: 'Начата обработка списка', status: 'info' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-muted-foreground w-12">{item.time}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5",
                    item.status === 'success' && "bg-success",
                    item.status === 'warning' && "bg-warning",
                    item.status === 'info' && "bg-primary"
                  )} />
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Модель LLM</h3>
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30">
              <p className="text-sm text-muted-foreground">Подключена</p>
              <p className="text-lg font-semibold text-foreground mt-1">Gemini 2.5 Flash</p>
              <p className="text-xs text-muted-foreground mt-2">Lovable AI Gateway</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
