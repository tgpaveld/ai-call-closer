import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Save, Trash2, Phone, Square, Loader2, Edit2, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { TextScript, useTextScripts } from "@/hooks/useTextScripts";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

export function ScriptEditor() {
  const { scripts, loading, error, saveScript, createScript, deleteScript, duplicateScript } = useTextScripts();
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const selectedScript = useMemo(
    () => scripts.find((s) => s.id === selectedScriptId) ?? scripts[0] ?? null,
    [scripts, selectedScriptId]
  );
  const [editedContent, setEditedContent] = useState<string>("");
  const [editedName, setEditedName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newScriptName, setNewScriptName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (selectedScript && selectedScriptId !== selectedScript.id) {
      setSelectedScriptId(selectedScript.id);
    }
  }, [selectedScript, selectedScriptId]);

  useEffect(() => {
    if (selectedScript) {
      setEditedContent(selectedScript.content);
      setEditedName(selectedScript.name);
      setHasUnsavedChanges(false);
    }
  }, [selectedScript?.id]);
  
  // Use OpenAI TTS by default now
  const { speak, stop, isLoading, isPlaying } = useTextToSpeech({
    provider: "openai",
    openaiVoice: "onyx", // Male professional voice
    speed: 1.0
  });

  const handleTestCall = () => {
    // Заменяем переменные на тестовые значения
    const testText = editedContent
      .replace(/{имя}/g, "Иван")
      .replace(/{компания}/g, "ТестКомпани")
      .replace(/\[Имя агента\]/g, "Алексей")
      .replace(/\[Название компании\]/g, "AI Caller");
    
    speak(testText);
  };

  const handleSave = async () => {
    if (!selectedScript) return;
    setIsSaving(true);
    const success = await saveScript({
      ...selectedScript,
      name: editedName,
      content: editedContent,
    } as TextScript);
    setIsSaving(false);
    if (success) {
      setHasUnsavedChanges(false);
      toast.success('Скрипт сохранён');
    }
  };

  const handleCreate = async () => {
    if (!newScriptName.trim()) return;
    const created = await createScript(newScriptName.trim());
    if (created) {
      setSelectedScriptId(created.id);
      setShowNewDialog(false);
      setNewScriptName('');
      toast.success('Скрипт создан');
    }
  };

  const handleDelete = async () => {
    if (!selectedScript) return;
    const ok = await deleteScript(selectedScript.id);
    if (ok) {
      setSelectedScriptId(null);
      setShowDeleteDialog(false);
      toast.success('Скрипт удалён');
    }
  };

  const handleDuplicate = async () => {
    if (!selectedScript) return;
    const dup = await duplicateScript(selectedScript);
    if (dup) {
      setSelectedScriptId(dup.id);
      toast.success('Скрипт дублирован');
    }
  };

  const handleSelectScript = (script: TextScript) => {
    setSelectedScriptId(script.id);
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Скрипты</h1>
          <p className="text-muted-foreground mt-1">Создание и редактирование скриптов для звонков</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Новый скрипт
        </Button>
      </div>

      {/* Dialog for new script */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый скрипт</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Название скрипта"
            value={newScriptName}
            onChange={(e) => setNewScriptName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!newScriptName.trim()}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить скрипт?</AlertDialogTitle>
            <AlertDialogDescription>
              Скрипт «{selectedScript?.name}» будет удалён без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground px-2">Мои скрипты</h3>

          {loading ? (
            <div className="p-4 glass rounded-lg flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Загрузка...
            </div>
          ) : error ? (
            <div className="p-4 glass rounded-lg text-destructive">
              {error}
            </div>
          ) : scripts.length === 0 ? (
            <div className="p-4 glass rounded-lg text-muted-foreground">
              Скриптов пока нет
            </div>
          ) : null}

          {scripts.map((script) => (
            <button
              key={script.id}
              onClick={() => handleSelectScript(script)}
              className={cn(
                "w-full text-left p-4 rounded-lg transition-all duration-200",
                selectedScript?.id === script.id
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
          {!selectedScript ? (
            <div className="p-8 text-muted-foreground">Выбери скрипт слева</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <Input
                  value={editedName}
                  onChange={(e) => {
                    setEditedName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="max-w-md bg-secondary border-border text-lg font-medium"
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handleDuplicate} title="Дублировать">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleSave} disabled={!hasUnsavedChanges || isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Сохранить
                  </Button>
                  {isPlaying ? (
                    <Button variant="destructive" onClick={stop}>
                      <Square className="w-4 h-4 mr-2" />
                      Остановить
                    </Button>
                  ) : (
                    <Button 
                      variant="glow" 
                      onClick={handleTestCall}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Phone className="w-4 h-4 mr-2" />
                      )}
                      Тестовый звонок
                    </Button>
                  )}
                </div>
              </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Текст скрипта
              </label>
              <Textarea
                value={editedContent}
                onChange={(e) => {
                  setEditedContent(e.target.value);
                  setHasUnsavedChanges(true);
                }}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
