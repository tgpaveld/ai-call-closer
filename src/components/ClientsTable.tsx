import { useState } from "react";
import { Search, Plus, Phone, Mail, MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Client } from "@/types/client";
import { cn } from "@/lib/utils";

const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan.petrov@mail.ru',
    phone: '+7 (999) 123-45-67',
    socialMedia: 'VK, LinkedIn',
    messengers: 'Telegram, WhatsApp',
    status: 'new',
    comment: '',
    fullContent: '',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Мария',
    lastName: 'Сидорова',
    email: 'maria.s@gmail.com',
    phone: '+7 (999) 234-56-78',
    socialMedia: 'Instagram, Facebook',
    messengers: 'WhatsApp, Viber',
    status: 'interested',
    comment: 'Перезвонить в понедельник',
    fullContent: 'Разговор состоялся 15.01.2024 в 14:30...',
    lastCallDate: '2024-01-15',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    firstName: 'Алексей',
    lastName: 'Козлов',
    email: 'a.kozlov@yandex.ru',
    phone: '+7 (999) 345-67-89',
    socialMedia: 'VK',
    messengers: 'Telegram',
    status: 'called',
    comment: 'Просит информацию по email',
    fullContent: '',
    lastCallDate: '2024-01-14',
    createdAt: '2024-01-08',
  },
  {
    id: '4',
    firstName: 'Елена',
    lastName: 'Новикова',
    email: 'elena.n@mail.ru',
    phone: '+7 (999) 456-78-90',
    socialMedia: 'LinkedIn, VK',
    messengers: 'WhatsApp, Signal',
    status: 'callback',
    comment: 'Перезвонить после 18:00',
    fullContent: '',
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    firstName: 'Дмитрий',
    lastName: 'Волков',
    email: 'd.volkov@gmail.com',
    phone: '+7 (999) 567-89-01',
    socialMedia: 'Facebook',
    messengers: 'Viber',
    status: 'not_interested',
    comment: 'Не актуально',
    fullContent: 'Разговор состоялся 14.01.2024...',
    lastCallDate: '2024-01-14',
    createdAt: '2024-01-05',
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'Новый', className: 'bg-primary/20 text-primary' },
  called: { label: 'Позвонили', className: 'bg-muted text-muted-foreground' },
  callback: { label: 'Перезвонить', className: 'bg-warning/20 text-warning' },
  interested: { label: 'Заинтересован', className: 'bg-success/20 text-success' },
  not_interested: { label: 'Не интересует', className: 'bg-destructive/20 text-destructive' },
};

export function ClientsTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients] = useState<Client[]>(mockClients);

  const filteredClients = clients.filter(client => 
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Клиенты</h1>
          <p className="text-muted-foreground mt-1">Управление базой клиентов</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Добавить клиента
        </Button>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени, email или телефону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Имя</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Контакты</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Соц.сети</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Мессенджеры</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Статус</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Комментарий</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {client.firstName[0]}{client.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {client.firstName} {client.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {client.socialMedia || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {client.messengers || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      statusConfig[client.status].className
                    )}>
                      {statusConfig[client.status].label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                      {client.comment || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
