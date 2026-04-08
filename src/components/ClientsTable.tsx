import { useMemo, useState, useRef, useCallback } from "react";
import { Search, Plus, Phone, Mail, MessageCircle, Loader2, Pencil, Trash2, Upload, Download, FileUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Client } from "@/types/client";
import { cn } from "@/lib/utils";
import { useClients, NewClientData } from "@/hooks/useClients";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
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

const statusKeys = ["new", "called", "callback", "interested", "not_interested"] as const;
const statusClassNames: Record<string, string> = {
  new: "bg-primary/20 text-primary",
  called: "bg-muted text-muted-foreground",
  callback: "bg-warning/20 text-warning",
  interested: "bg-success/20 text-success",
  not_interested: "bg-destructive/20 text-destructive",
};
const statusTranslationKeys: Record<string, string> = {
  new: "statusNew",
  called: "statusCalled",
  callback: "statusCallback",
  interested: "statusInterested",
  not_interested: "statusNotInterested",
};

const emptyForm: NewClientData = {
  firstName: "", lastName: "", email: "", phone: "",
  socialMedia: "", messengers: "", status: "new", comment: "",
};

export function ClientsTable() {
  const { clients, loading, createClient, updateClient, deleteClient, bulkCreateClients } = useClients();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<NewClientData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error(t("clients", "dragDropInvalidType"));
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) { toast.error(t("clients", "importNoData")); return; }
      const headers = Object.keys(rows[0]).map((h) => h.toLowerCase());
      const hasName = headers.some((h) => columnMap[h] === "firstName");
      if (!hasName) { toast.error(t("clients", "importNoName")); return; }
      const mapped: NewClientData[] = rows
        .map((row) => {
          const client: NewClientData = { ...emptyForm };
          Object.entries(row).forEach(([key, value]) => {
            const field = columnMap[key.toLowerCase()];
            if (field) (client as any)[field] = value;
          });
          return client;
        })
        .filter((c) => c.firstName.trim());
      if (mapped.length === 0) { toast.error(t("clients", "importNoData")); return; }
      const count = await bulkCreateClients(mapped);
      toast.success(t("clients", "importSuccess").replace("{count}", String(count)));
    } catch (err) {
      console.error("CSV import error:", err);
      toast.error(t("clients", "importError"));
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const parseCsv = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(/[,;]/).map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      const values = line.split(/[,;]/).map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ""; });
      return row;
    });
  };

  const columnMap: Record<string, keyof NewClientData> = {
    first_name: "firstName", firstname: "firstName", "имя": "firstName", name: "firstName",
    last_name: "lastName", lastname: "lastName", "фамилия": "lastName",
    email: "email", "почта": "email",
    phone: "phone", "телефон": "phone",
    social_media: "socialMedia", socialmedia: "socialMedia", "соцсети": "socialMedia",
    messengers: "messengers", messenger: "messengers", "мессенджеры": "messengers",
    status: "status", "статус": "status",
    comment: "comment", "комментарий": "comment",
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    processFile(file);
  };

  const handleCsvExport = () => {
    const headers = ["first_name", "last_name", "email", "phone", "social_media", "messengers", "status", "comment"];
    const rows = filteredClients.map((c) =>
      [c.firstName, c.lastName, c.email, c.phone, c.socialMedia, c.messengers, c.status, c.comment]
        .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("clients", "exportCsv"));
  };

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
    if (ok) { setForm(emptyForm); setEditingClient(null); setShowDialog(false); }
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setForm({
      firstName: client.firstName, lastName: client.lastName,
      email: client.email, phone: client.phone,
      socialMedia: client.socialMedia, messengers: client.messengers,
      status: client.status, comment: client.comment,
    });
    setShowDialog(true);
  };

  const openCreateDialog = () => { setEditingClient(null); setForm(emptyForm); setShowDialog(true); };
  const updateField = <K extends keyof NewClientData>(key: K, value: NewClientData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("clients", "title")}</h1>
          <p className="text-muted-foreground mt-1">{t("clients", "subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleCsvImport} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {t("clients", "importCsv")}
          </Button>
          <Button variant="outline" onClick={handleCsvExport} disabled={clients.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            {t("clients", "exportCsv")}
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            {t("clients", "addClient")}
          </Button>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) setEditingClient(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClient ? t("clients", "editClient") : t("clients", "newClient")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("clients", "firstName")} *</Label>
                <Input placeholder="" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>{t("clients", "lastName")}</Label>
                <Input placeholder="" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} maxLength={100} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("clients", "email")}</Label>
                <Input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label>{t("clients", "phone")}</Label>
                <Input placeholder="+7 (999) 123-45-67" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} maxLength={30} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("clients", "socialMedia")}</Label>
                <Input placeholder="VK, LinkedIn" value={form.socialMedia} onChange={(e) => updateField("socialMedia", e.target.value)} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>{t("clients", "messengers")}</Label>
                <Input placeholder="Telegram, WhatsApp" value={form.messengers} onChange={(e) => updateField("messengers", e.target.value)} maxLength={200} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("clients", "status")}</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v as Client["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusKeys.map((key) => (
                    <SelectItem key={key} value={key}>{t("clients", statusTranslationKeys[key])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("clients", "comment")}</Label>
              <Textarea placeholder={t("clients", "clientNotes")} value={form.comment} onChange={(e) => updateField("comment", e.target.value)} maxLength={1000} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{t("clients", "cancel")}</Button>
            <Button onClick={handleSubmit} disabled={!form.firstName.trim() || saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingClient ? t("clients", "save") : t("clients", "add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {importing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isDragging ? (
          <div className="flex flex-col items-center gap-2">
            <FileUp className="w-8 h-8 text-primary animate-bounce" />
            <p className="text-sm font-medium text-primary">{t("clients", "dragDropActive")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{t("clients", "dragDropTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("clients", "dragDropOr")}</p>
            <Button variant="outline" size="sm" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              {t("clients", "dragDropButton")}
            </Button>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("clients", "searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary border-border" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {[
              { key: "all", labelKey: "all" },
              ...statusKeys.map((key) => ({ key, labelKey: statusTranslationKeys[key] })),
            ].map(({ key, labelKey }) => (
              <button key={key} onClick={() => setFilterStatus(key)}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  filterStatus === key ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                {t("clients", labelKey)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {clients.length === 0 ? t("clients", "noClients") : t("clients", "notFound")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">{t("clients", "firstName")}</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">{t("clients", "contacts")}</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">{t("clients", "socialMedia")}</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">{t("clients", "messengers")}</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">{t("clients", "status")}</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">{t("clients", "comment")}</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">{t("clients", "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{client.firstName?.[0] ?? ""}{client.lastName?.[0] ?? ""}</span>
                        </div>
                        <p className="font-medium text-foreground">{client.firstName} {client.lastName}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {client.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-3 h-3" />{client.email}</div>}
                        {client.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-3 h-3" />{client.phone}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-4"><span className="text-sm text-muted-foreground">{client.socialMedia || "—"}</span></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{client.messengers || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusClassNames[client.status])}>
                        {t("clients", statusTranslationKeys[client.status] || client.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4"><span className="text-sm text-muted-foreground max-w-[200px] truncate block">{client.comment || "—"}</span></td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(client)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingClientId(client.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deletingClientId} onOpenChange={(open) => !open && setDeletingClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clients", "deleteClient")}</AlertDialogTitle>
            <AlertDialogDescription>{t("clients", "deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("clients", "cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => { if (deletingClientId) { await deleteClient(deletingClientId); setDeletingClientId(null); } }}
            >{t("clients", "delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
