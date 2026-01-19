import { Users, Phone, TrendingUp, Activity } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Button } from "./ui/button";

const stats = [
  { 
    title: 'Всего клиентов', 
    value: '1,247', 
    change: '+12% за неделю', 
    changeType: 'positive' as const, 
    icon: Users 
  },
  { 
    title: 'Звонков сегодня', 
    value: '89', 
    change: '+23 за час', 
    changeType: 'positive' as const, 
    icon: Phone 
  },
  { 
    title: 'Конверсия', 
    value: '18.5%', 
    change: '+2.3% за месяц', 
    changeType: 'positive' as const, 
    icon: TrendingUp 
  },
  { 
    title: 'Активные кампании', 
    value: '3', 
    change: '2 на паузе', 
    changeType: 'neutral' as const, 
    icon: Activity 
  },
];

const recentCalls = [
  { name: 'Иван Петров', status: 'interested', time: '5 мин назад' },
  { name: 'Мария Сидорова', status: 'callback', time: '12 мин назад' },
  { name: 'Алексей Козлов', status: 'not_interested', time: '18 мин назад' },
  { name: 'Елена Новикова', status: 'called', time: '25 мин назад' },
  { name: 'Дмитрий Волков', status: 'interested', time: '32 мин назад' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  interested: { label: 'Заинтересован', color: 'text-success' },
  callback: { label: 'Перезвонить', color: 'text-warning' },
  not_interested: { label: 'Не интересует', color: 'text-destructive' },
  called: { label: 'Позвонили', color: 'text-muted-foreground' },
};

export function Dashboard() {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Дашборд</h1>
          <p className="text-muted-foreground mt-1">Обзор активности за сегодня</p>
        </div>
        <Button variant="glow" size="lg">
          <Phone className="w-5 h-5 mr-2" />
          Начать обзвон
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Последние звонки</h2>
          <div className="space-y-4">
            {recentCalls.map((call, index) => (
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
                    <p className={`text-sm ${statusLabels[call.status].color}`}>
                      {statusLabels[call.status].label}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{call.time}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Статистика за неделю</h2>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-foreground">523</p>
                  <p className="text-xs text-primary-foreground/80">звонков</p>
                </div>
              </div>
              <p className="text-muted-foreground">Успешных: 97 (18.5%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
