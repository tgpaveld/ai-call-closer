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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItemKeys = [
  { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { id: 'clients', labelKey: 'clients', icon: Users },
  { id: 'campaigns', labelKey: 'campaigns', icon: Phone },
  { id: 'scripts', labelKey: 'scripts', icon: FileText },
  { id: 'script-editor', labelKey: 'scriptEditor', icon: GitBranch },
  { id: 'objections', labelKey: 'objections', icon: MessageSquareWarning },
  { id: 'script-chat', labelKey: 'scriptChat', icon: MessageCircle },
  { id: 'ai-agent', labelKey: 'aiAgent', icon: Bot },
  { id: 'sheets', labelKey: 'sheets', icon: Table2 },
  { id: 'settings', labelKey: 'settings', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <Phone className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">CallAI Pro</h1>
            <p className="text-xs text-muted-foreground">{t("sidebar", "coldCalling")}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItemKeys.map((item) => {
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
                  {t("sidebar", item.labelKey)}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">{t("sidebar", "aiAgent")}</span>
          </div>
          <p className="text-sm font-medium text-foreground">{t("sidebar", "active")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("sidebar", "readyForCalls")}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("sidebar", "signOut")}
        </button>
      </div>
    </aside>
  );
}
