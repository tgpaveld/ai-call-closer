import { useState } from "react";
import { Table2, Link2, RefreshCw, Check, ExternalLink, Upload, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function SheetsIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleConnect = () => {
    if (sheetUrl) {
      setIsConnected(true);
      setLastSync(new Date().toLocaleString('ru-RU'));
    }
  };

  const handleSync = () => {
    setLastSync(new Date().toLocaleString('ru-RU'));
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Google Sheets</h1>
          <p className="text-muted-foreground mt-1">Синхронизация данных с таблицей</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center",
              isConnected ? "bg-success/20" : "bg-secondary"
            )}>
              <Table2 className={cn(
                "w-7 h-7",
                isConnected ? "text-success" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Подключение</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-success" : "bg-muted-foreground"
                )} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? "Подключено" : "Не подключено"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Ссылка на Google Sheets
              </label>
              <div className="flex gap-2">
                <Input
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="bg-secondary border-border"
                />
                <Button 
                  onClick={handleConnect}
                  disabled={!sheetUrl}
                  variant={isConnected ? "secondary" : "default"}
                >
                  {isConnected ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {isConnected && (
              <div className="p-4 rounded-lg bg-secondary/50 border border-success/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Последняя синхронизация</p>
                    <p className="text-foreground font-medium">{lastSync}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSync}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Синхронизировать
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Структура таблицы</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Убедитесь, что ваша таблица содержит следующие колонки:
          </p>
          
          <div className="space-y-3">
            {[
              { name: 'Имя', description: 'Имя клиента', required: true },
              { name: 'Фамилия', description: 'Фамилия клиента', required: true },
              { name: 'Email', description: 'Электронная почта', required: true },
              { name: 'Телефон', description: 'Номер телефона', required: true },
              { name: 'Соц.Сети', description: 'Заполняется AI агентом', required: false },
              { name: 'Мессенджеры', description: 'Заполняется AI агентом', required: false },
              { name: 'Коммент', description: 'Краткое резюме звонка', required: false },
              { name: 'Полное содержание', description: 'Полная расшифровка', required: false },
            ].map((col, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{col.name}</p>
                    <p className="text-xs text-muted-foreground">{col.description}</p>
                  </div>
                </div>
                {col.required && (
                  <span className="text-xs text-warning">Обязательно</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled={!isConnected}>
            <Upload className="w-6 h-6" />
            <span>Импортировать клиентов</span>
            <span className="text-xs text-muted-foreground">Загрузить данные из таблицы</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled={!isConnected}>
            <Download className="w-6 h-6" />
            <span>Экспортировать результаты</span>
            <span className="text-xs text-muted-foreground">Выгрузить данные в таблицу</span>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled={!isConnected}>
            <ExternalLink className="w-6 h-6" />
            <span>Открыть таблицу</span>
            <span className="text-xs text-muted-foreground">Перейти в Google Sheets</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
