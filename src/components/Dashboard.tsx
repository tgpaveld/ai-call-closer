import { Users, Phone, TrendingUp, Activity } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const recentCallsData = [
  { name: 'Иван Петров', statusKey: 'interested', time: 5 },
  { name: 'Мария Сидорова', statusKey: 'callback', time: 12 },
  { name: 'Алексей Козлов', statusKey: 'notInterested', time: 18 },
  { name: 'Елена Новикова', statusKey: 'called', time: 25 },
  { name: 'Дмитрий Волков', statusKey: 'interested', time: 32 },
];

const statusColors: Record<string, string> = {
  interested: 'text-success',
  callback: 'text-warning',
  notInterested: 'text-destructive',
  called: 'text-muted-foreground',
};

export function Dashboard() {
  const { t } = useLanguage();

  const stats = [
    { title: t("dashboard", "totalClients"), value: '1,247', change: `+12% ${t("dashboard", "perWeek")}`, changeType: 'positive' as const, icon: Users },
    { title: t("dashboard", "callsToday"), value: '89', change: `+23 ${t("dashboard", "perHour")}`, changeType: 'positive' as const, icon: Phone },
    { title: t("dashboard", "conversion"), value: '18.5%', change: `+2.3% ${t("dashboard", "perMonth")}`, changeType: 'positive' as const, icon: TrendingUp },
    { title: t("dashboard", "activeCampaigns"), value: '3', change: `2 ${t("dashboard", "onPause")}`, changeType: 'neutral' as const, icon: Activity },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard", "title")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard", "subtitle")}</p>
        </div>
        <Button variant="glow" size="lg">
          <Phone className="w-5 h-5 mr-2" />
          {t("dashboard", "startCalling")}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t("dashboard", "recentCalls")}</h2>
          <div className="space-y-4">
            {recentCallsData.map((call, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {call.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{call.name}</p>
                    <p className={`text-sm ${statusColors[call.statusKey]}`}>
                      {t("dashboard", call.statusKey)}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{call.time} {t("dashboard", "minAgo")}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">{t("dashboard", "weekStats")}</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-foreground">523</p>
                  <p className="text-xs text-primary-foreground/80">{t("dashboard", "calls")}</p>
                </div>
              </div>
              <p className="text-muted-foreground">{t("dashboard", "successful")}: 97 (18.5%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
