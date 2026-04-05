import { useMemo, useState } from "react";
import { Search, Plus, Phone, Mail, MessageCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Client } from "@/types/client";
import { cn } from "@/lib/utils";
import { useClients, NewClientData } from "@/hooks/useClients";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "./ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Новый", className: "bg-primary/20 text-primary" },
  called: { label: "Позвонили", className: "bg-muted text-muted-foreground" },
  callback: { label: "Перезвонить", className: "bg-warning/20 text-warning" },
  interested: { label: "Заинтересован", className: "bg-success/20 text-success" },
  not_interested: { label: "Не интересует", className: "bg-destructive/20 text-destructive" },
};

const emptyForm: NewClientData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  socialMedia: "",
  messengers: "",
  status: "new",
  comment: "",
};

export function ClientsTable() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<NewClientData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        client.comment?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, filterStatus]);

  const handleSubmit = async () => {
    if (!form.firstName.trim()) return;
    setSaving(true);
    let ok: boolean;
    if (editingClient) {
      ok = await updateClient(editingClient.id, form);
    } else {
      ok = await createClient(form);
    }
    setSaving(false);
    if (ok) {
      setForm(emptyForm);
      setEditingClient(null);
      setShowDialog(false);
    }
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      socialMedia: client.socialMedia,
      messengers: client.messengers,
      status: client.status,
      comment: client.comment,
    });
    setShowDialog(true);
  };

  const openCreateDialog = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const updateField = <K extends keyof NewClientData>(key: K, value: NewClientData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Клиенты</h1>
          <p className="text-muted-foreground mt-1">Управление базой клиентов</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить клиента
        </Button>
      </div>

      {/* New client dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) setEditingClient(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Редактировать клиента" : "Новый клиент"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя *</Label>
                <Input
                  placeholder="Иван"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Фамилия</Label>
                <Input
                  placeholder="Петров"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input
                  placeholder="+7 (999) 123-45-67"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  maxLength={30}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Соц. сети</Label>
                <Input
                  placeholder="VK, LinkedIn"
                  value={form.socialMedia}
                  onChange={(e) => updateField("socialMedia", e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label>Мессенджеры</Label>
                <Input
                  placeholder="Telegram, WhatsApp"
                  value={form.messengers}
                  onChange={(e) => updateField("messengers", e.target.value)}
                  maxLength={200}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select
                value={form.status}
                onValueChange={(v) => updateField("status", v as Client["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea
                placeholder="Заметки о клиенте..."
                value={form.comment}
                onChange={(e) => updateField("comment", e.target.value)}
                maxLength={1000}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={!form.firstName.trim() || saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingClient ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
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
          <div className="flex gap-1 flex-wrap">
            {[
              { key: "all", label: "Все" },
              ...Object.entries(statusConfig).map(([key, { label }]) => ({ key, label })),
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  filterStatus === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {clients.length === 0
              ? "Нет клиентов. Нажмите «Добавить клиента» чтобы начать."
              : "Ничего не найдено по вашему запросу."}
          </div>
        ) : (
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
                            {client.firstName?.[0] ?? ""}{client.lastName?.[0] ?? ""}
                          </span>
                        </div>
                        <p className="font-medium text-foreground">
                          {client.firstName} {client.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">
                        {client.socialMedia || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {client.messengers || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          statusConfig[client.status]?.className
                        )}
                      >
                        {statusConfig[client.status]?.label ?? client.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                        {client.comment || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)} title="Редактировать">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
