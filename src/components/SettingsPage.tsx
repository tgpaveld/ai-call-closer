import { useState } from "react";
import { Settings, User, Phone, Bot, Volume2, Globe, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

export function SettingsPage() {
  const [companyName, setCompanyName] = useState('Моя компания');
  const [websiteUrl, setWebsiteUrl] = useState('https://example.com');
  const [agentName, setAgentName] = useState('Анна');
  const [voiceSpeed, setVoiceSpeed] = useState(1);

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
        <p className="text-muted-foreground mt-1">Конфигурация системы</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Данные компании</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Название компании
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Сайт компании
              </label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://"
                className="bg-secondary border-border"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">AI Агент</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Имя агента
              </label>
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Как агент будет представляться клиентам
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Скорость речи
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-foreground font-medium w-12 text-center">{voiceSpeed}x</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Телефония</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">Автодозвон</p>
                <p className="text-sm text-muted-foreground">Автоматический повторный звонок</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">Запись разговоров</p>
                <p className="text-sm text-muted-foreground">Сохранение аудио звонков</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">Транскрипция</p>
                <p className="text-sm text-muted-foreground">Автоматическая расшифровка</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Безопасность</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">Маскирование данных</p>
                <p className="text-sm text-muted-foreground">Скрытие личных данных в логах</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">Ограничение по времени</p>
                <p className="text-sm text-muted-foreground">Звонки только в рабочее время</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg">
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}
