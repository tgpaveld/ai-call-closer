import { useState } from "react";
import { Plus, Play, Pause, MoreHorizontal, Users, Phone, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  totalClients: number;
  calledClients: number;
  successfulCalls: number;
  scriptName: string;
  createdAt: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Январская кампания B2B',
    status: 'active',
    totalClients: 500,
    calledClients: 247,
    successfulCalls: 45,
    scriptName: 'Основной скрипт продаж',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Ретаргет декабрь',
    status: 'paused',
    totalClients: 150,
    calledClients: 89,
    successfulCalls: 23,
    scriptName: 'Скрипт для повторного звонка',
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Новые лиды из рекламы',
    status: 'completed',
    totalClients: 200,
    calledClients: 200,
    successfulCalls: 52,
    scriptName: 'Основной скрипт продаж',
    createdAt: '2024-01-01',
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Активна', className: 'bg-success/20 text-success' },
  paused: { label: 'Пауза', className: 'bg-warning/20 text-warning' },
  completed: { label: 'Завершена', className: 'bg-muted text-muted-foreground' },
};

export function CampaignsPage() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Кампании</h1>
          <p className="text-muted-foreground mt-1">Управление кампаниями обзвона</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Новая кампания
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const progress = (campaign.calledClients / campaign.totalClients) * 100;
          const successRate = campaign.calledClients > 0 
            ? ((campaign.successfulCalls / campaign.calledClients) * 100).toFixed(1)
            : 0;

          return (
            <div 
              key={campaign.id} 
              className="glass rounded-xl p-6 hover:shadow-glow transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{campaign.scriptName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    statusConfig[campaign.status].className
                  )}>
                    {statusConfig[campaign.status].label}
                  </span>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="text-foreground font-medium">
                      {campaign.calledClients} / {campaign.totalClients}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full gradient-primary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-primary/10 mb-2">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{campaign.totalClients}</p>
                    <p className="text-xs text-muted-foreground">Клиентов</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-success/10 mb-2">
                      <Phone className="w-5 h-5 text-success" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{campaign.successfulCalls}</p>
                    <p className="text-xs text-muted-foreground">Успешных</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-warning/10 mb-2">
                      <TrendingUp className="w-5 h-5 text-warning" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{successRate}%</p>
                    <p className="text-xs text-muted-foreground">Конверсия</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {campaign.status === 'active' ? (
                    <Button variant="outline" className="flex-1">
                      <Pause className="w-4 h-4 mr-2" />
                      Пауза
                    </Button>
                  ) : campaign.status === 'paused' ? (
                    <Button className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Продолжить
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
