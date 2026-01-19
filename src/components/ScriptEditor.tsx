import { useState } from "react";
import { FileText, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface Script {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
}

const mockScripts: Script[] = [
  {
    id: '1',
    name: 'Основной скрипт продаж',
    content: `Здравствуйте, {имя}!

Меня зовут [Имя агента], я представляю компанию [Название компании].

Мы помогаем бизнесам автоматизировать процессы продаж и увеличить конверсию на 30-50%.

Скажите, вы сейчас занимаетесь активными продажами?

[Если да]
Отлично! Тогда вам будет интересно узнать о нашем решении, которое позволяет...

[Если нет]
Понимаю. А планируете ли вы расширять клиентскую базу в ближайшее время?

Могу предложить вам бесплатную консультацию, где мы разберём ваши текущие процессы и покажем, как можно их улучшить.

Когда вам было бы удобно созвониться на 15 минут?`,
    isActive: true,
  },
  {
    id: '2',
    name: 'Скрипт для повторного звонка',
    content: `Добрый день, {имя}!

Это снова [Имя агента] из [Название компании].

Мы с вами общались ранее по поводу [тема предыдущего разговора].

Как продвигаются ваши дела? Удалось ли обдумать наше предложение?`,
    isActive: false,
  },
];

export function ScriptEditor() {
  const [scripts, setScripts] = useState<Script[]>(mockScripts);
  const [selectedScript, setSelectedScript] = useState<Script>(mockScripts[0]);
  const [editedContent, setEditedContent] = useState(mockScripts[0].content);

  const handleSave = () => {
    setScripts(scripts.map(s => 
      s.id === selectedScript.id ? { ...s, content: editedContent } : s
    ));
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
    setEditedContent(script.content);
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Скрипты</h1>
          <p className="text-muted-foreground mt-1">Создание и редактирование скриптов для звонков</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Новый скрипт
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground px-2">Мои скрипты</h3>
          {scripts.map((script) => (
            <button
              key={script.id}
              onClick={() => handleSelectScript(script)}
              className={cn(
                "w-full text-left p-4 rounded-lg transition-all duration-200",
                selectedScript.id === script.id
                  ? "glass border-primary/50 shadow-glow"
                  : "bg-secondary/50 hover:bg-secondary"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{script.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {script.content.slice(0, 50)}...
                    </p>
                  </div>
                </div>
                {script.isActive && (
                  <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">
                    Активен
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Input
              value={selectedScript.name}
              className="max-w-md bg-secondary border-border text-lg font-medium"
              readOnly
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Текст скрипта
              </label>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] bg-secondary border-border font-mono text-sm"
                placeholder="Введите текст скрипта..."
              />
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <h4 className="text-sm font-medium text-foreground mb-2">Переменные</h4>
              <p className="text-sm text-muted-foreground">
                Используйте <code className="px-1 py-0.5 rounded bg-primary/20 text-primary">{'{имя}'}</code> для подстановки имени клиента,{' '}
                <code className="px-1 py-0.5 rounded bg-primary/20 text-primary">{'{компания}'}</code> для названия компании.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
