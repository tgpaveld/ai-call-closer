import { 
  LayoutDashboard, 
  Users, 
  Phone, 
  FileText, 
  Settings, 
  Bot,
  Table2,
  GitBranch,
  MessageSquareWarning,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'clients', label: 'Клиенты', icon: Users },
  { id: 'campaigns', label: 'Кампании', icon: Phone },
  { id: 'scripts', label: 'Скрипты', icon: FileText },
  { id: 'script-editor', label: 'Редактор скриптов', icon: GitBranch },
  { id: 'objections', label: 'Возражения', icon: MessageSquareWarning },
  { id: 'script-chat', label: 'Тест скрипта', icon: MessageCircle },
  { id: 'ai-agent', label: 'AI Агент', icon: Bot },
  { id: 'sheets', label: 'Google Sheets', icon: Table2 },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <Phone className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">CallAI Pro</h1>
            <p className="text-xs text-muted-foreground">Холодный прозвон</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-sidebar-accent text-primary shadow-md" 
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">AI Агент</span>
          </div>
          <p className="text-sm font-medium text-foreground">Активен</p>
          <p className="text-xs text-muted-foreground mt-1">Готов к звонкам</p>
        </div>
      </div>
    </aside>
  );
}
