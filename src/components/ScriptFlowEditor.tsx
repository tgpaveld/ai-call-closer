import { useState, useCallback, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  MessageSquare,
  HelpCircle,
  Target,
  Phone,
  AlertTriangle,
  Settings2,
  Check
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Script, ScriptBlock } from "@/types/script";
import { scriptsList } from "@/data/mockScripts";
import { toast } from "sonner";

const blockTypeConfig = {
  greeting: { icon: MessageSquare, color: 'bg-blue-500/20 border-blue-500/50 text-blue-400', label: 'Приветствие' },
  pitch: { icon: Target, color: 'bg-purple-500/20 border-purple-500/50 text-purple-400', label: 'Презентация' },
  question: { icon: HelpCircle, color: 'bg-green-500/20 border-green-500/50 text-green-400', label: 'Вопрос' },
  objection_handler: { icon: AlertTriangle, color: 'bg-amber-500/20 border-amber-500/50 text-amber-400', label: 'Возражение' },
  closing: { icon: Phone, color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400', label: 'Закрытие' },
  custom: { icon: Settings2, color: 'bg-slate-500/20 border-slate-500/50 text-slate-400', label: 'Кастомный' },
};

interface ScriptBlockNodeProps {
  block: ScriptBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  scale: number;
}

function ScriptBlockNode({ block, isSelected, onSelect, onDragStart, scale }: ScriptBlockNodeProps) {
  const config = blockTypeConfig[block.type];
  const Icon = config.icon;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
      className={cn(
        "absolute cursor-move transition-all duration-200",
        isSelected && "z-10"
      )}
      style={{
        left: block.position.x * scale,
        top: block.position.y * scale,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      <Card
        className={cn(
          "w-64 p-4 border-2 transition-all duration-200",
          config.color,
          isSelected && "ring-2 ring-primary shadow-glow"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", config.color)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground truncate">{block.title}</h4>
              {block.isEntryPoint && (
                <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/50">
                  Старт
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {block.content}
            </p>
          </div>
        </div>
        
        {block.transitions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Переходы:</p>
            <div className="space-y-1">
              {block.transitions.map((transition) => (
                <div
                  key={transition.id}
                  className="text-xs px-2 py-1 rounded bg-secondary/50 text-muted-foreground truncate"
                >
                  → {transition.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  scale: number;
}

function ConnectionLine({ from, to, scale }: ConnectionLineProps) {
  const startX = (from.x + 128) * scale;
  const startY = (from.y + 60) * scale;
  const endX = to.x * scale;
  const endY = (to.y + 30) * scale;

  const midX = (startX + endX) / 2;
  const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

  return (
    <path
      d={path}
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth={2}
      strokeOpacity={0.5}
      markerEnd="url(#arrowhead)"
    />
  );
}

export function ScriptFlowEditor() {
  const [scripts, setScripts] = useState<Script[]>(scriptsList);
  const [selectedScript, setSelectedScript] = useState<Script>(scriptsList[0]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.8);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleBlockDragStart = (blockId: string) => (e: React.DragEvent) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedBlock || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setSelectedScript((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === draggedBlock
          ? { ...block, position: { x: Math.max(0, x - 128), y: Math.max(0, y - 30) } }
          : block
      ),
    }));
    setDraggedBlock(null);
    setHasUnsavedChanges(true);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getBlockById = useCallback(
    (id: string) => selectedScript.blocks.find((b) => b.id === id),
    [selectedScript.blocks]
  );

  const handleSaveScript = () => {
    setScripts((prev) =>
      prev.map((s) => (s.id === selectedScript.id ? selectedScript : s))
    );
    setHasUnsavedChanges(false);
    toast.success("Скрипт сохранён", {
      description: selectedScript.name,
      icon: <Check className="w-4 h-4" />,
    });
  };

  const handleUpdateScriptName = (name: string) => {
    setSelectedScript((prev) => ({ ...prev, name }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<ScriptBlock>) => {
    setSelectedScript((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddBlock = (type: ScriptBlock['type']) => {
    const newBlock: ScriptBlock = {
      id: `block-${Date.now()}`,
      type,
      title: blockTypeConfig[type].label,
      content: 'Введите текст блока...',
      position: { x: 100, y: 100 + selectedScript.blocks.length * 120 },
      transitions: [],
    };
    setSelectedScript((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    setSelectedBlockId(newBlock.id);
    setHasUnsavedChanges(true);
  };

  const handleDeleteBlock = (blockId: string) => {
    setSelectedScript((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }));
    setSelectedBlockId(null);
    setHasUnsavedChanges(true);
  };

  const connections = selectedScript.blocks.flatMap((block) =>
    block.transitions.map((transition) => {
      const targetBlock = getBlockById(transition.targetBlockId);
      if (!targetBlock) return null;
      return {
        id: `${block.id}-${transition.id}`,
        from: block.position,
        to: targetBlock.position,
      };
    }).filter(Boolean)
  );

  return (
    <div className="p-8 space-y-6 animate-fade-in h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Редактор скриптов</h1>
          <p className="text-muted-foreground mt-1">Визуальное построение диалоговых деревьев</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setScale((s) => Math.max(0.3, s - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setScale(1)}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Тест
          </Button>
          <Button onClick={handleSaveScript} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Сохранить
            {hasUnsavedChanges && (
              <span className="ml-2 w-2 h-2 rounded-full bg-warning animate-pulse" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
        {/* Script List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Скрипты</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {scripts.map((script) => (
            <button
              key={script.id}
              onClick={() => {
                setSelectedScript(script);
                setSelectedBlockId(null);
                setHasUnsavedChanges(false);
              }}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-200",
                selectedScript.id === script.id
                  ? "glass border-primary/50 shadow-glow"
                  : "bg-secondary/50 hover:bg-secondary"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{script.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {script.blocks.length} блоков
                  </p>
                </div>
                {script.isActive && (
                  <Badge variant="outline" className="text-xs bg-success/20 text-success">
                    Активен
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3 glass rounded-xl overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Input
              value={selectedScript.name}
              onChange={(e) => handleUpdateScriptName(e.target.value)}
              className="bg-background/80 backdrop-blur border-border w-64"
            />
            <Badge variant="secondary">v{selectedScript.version}</Badge>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-warning/20 text-warning border-warning/50">
                Не сохранено
              </Badge>
            )}
          </div>

          <div
            ref={canvasRef}
            className="w-full h-full overflow-auto bg-[radial-gradient(circle_at_center,_hsl(var(--border))_1px,_transparent_1px)] bg-[size:20px_20px]"
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '2000px', minHeight: '1000px' }}>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="hsl(var(--primary))"
                    fillOpacity="0.5"
                  />
                </marker>
              </defs>
              {connections.map((conn) =>
                conn ? (
                  <ConnectionLine
                    key={conn.id}
                    from={conn.from}
                    to={conn.to}
                    scale={scale}
                  />
                ) : null
              )}
            </svg>

            <div className="relative" style={{ minWidth: '2000px', minHeight: '1000px' }}>
              {selectedScript.blocks.map((block) => (
                <ScriptBlockNode
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => setSelectedBlockId(block.id)}
                  onDragStart={handleBlockDragStart(block.id)}
                  scale={scale}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Block Editor */}
        <div className="glass rounded-xl p-4 space-y-4 overflow-auto">
          <h3 className="text-sm font-medium text-muted-foreground">Свойства блока</h3>
          
          {selectedBlockId ? (
            (() => {
              const block = getBlockById(selectedBlockId);
              if (!block) return null;
              const config = blockTypeConfig[block.type];
              const Icon = config.icon;

              return (
                <div className="space-y-4">
                  <div className={cn("p-3 rounded-lg flex items-center gap-3", config.color)}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{config.label}</span>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Название</label>
                    <Input 
                      value={block.title} 
                      onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                      className="mt-1 bg-secondary" 
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Текст</label>
                    <textarea
                      value={block.content}
                      onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                      className="mt-1 w-full min-h-[100px] p-2 rounded-lg bg-secondary border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Переходы ({block.transitions.length})</label>
                    <div className="mt-2 space-y-2">
                      {block.transitions.map((t) => (
                        <div key={t.id} className="p-2 rounded bg-secondary/50 text-sm">
                          <p className="text-foreground">{t.label}</p>
                          <p className="text-xs text-muted-foreground">
                            → {getBlockById(t.targetBlockId)?.title || 'Неизвестный блок'}
                          </p>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="w-3 h-3 mr-1" />
                        Добавить переход
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleDeleteBlock(block.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Удалить блок
                  </Button>
                </div>
              );
            })()
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Выберите блок для редактирования</p>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Добавить блок</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(blockTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className={cn("justify-start text-xs", config.color)}
                    onClick={() => handleAddBlock(type as ScriptBlock['type'])}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
