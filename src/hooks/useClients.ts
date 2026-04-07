import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Client } from "@/types/client";

interface DbClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  social_media: string;
  messengers: string;
  status: string;
  comment: string;
  last_call_date: string | null;
  created_at: string;
}

function mapDbToClient(db: DbClient): Client {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    email: db.email,
    phone: db.phone,
    socialMedia: db.social_media,
    messengers: db.messengers,
    status: db.status as Client["status"],
    comment: db.comment,
    fullContent: "",
    lastCallDate: db.last_call_date ?? undefined,
    createdAt: db.created_at,
  };
}

export interface NewClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  socialMedia: string;
  messengers: string;
  status: Client["status"];
  comment: string;
}

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setClients((data ?? []).map((r) => mapDbToClient(r as unknown as DbClient)));
    } catch (err) {
      console.error("Error loading clients:", err);
      toast.error("Не удалось загрузить клиентов");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createClient = useCallback(
    async (data: NewClientData): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase.from("clients").insert({
          user_id: user.id,
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          social_media: data.socialMedia.trim(),
          messengers: data.messengers.trim(),
          status: data.status,
          comment: data.comment.trim(),
        });
        if (error) throw error;
        toast.success("Клиент добавлен");
        await loadClients();
        return true;
      } catch (err) {
        console.error("Error creating client:", err);
        toast.error("Ошибка добавления клиента");
        return false;
      }
    },
    [user, loadClients]
  );

  const updateClient = useCallback(
    async (clientId: string, data: Partial<NewClientData>): Promise<boolean> => {
      try {
        const mapped: Record<string, unknown> = {};
        if (data.firstName !== undefined) mapped.first_name = data.firstName.trim();
        if (data.lastName !== undefined) mapped.last_name = data.lastName.trim();
        if (data.email !== undefined) mapped.email = data.email.trim();
        if (data.phone !== undefined) mapped.phone = data.phone.trim();
        if (data.socialMedia !== undefined) mapped.social_media = data.socialMedia.trim();
        if (data.messengers !== undefined) mapped.messengers = data.messengers.trim();
        if (data.status !== undefined) mapped.status = data.status;
        if (data.comment !== undefined) mapped.comment = data.comment.trim();
        const { error } = await supabase.from("clients").update(mapped).eq("id", clientId);
        if (error) throw error;
        toast.success("Клиент обновлён");
        await loadClients();
        return true;
      } catch (err) {
        console.error("Error updating client:", err);
        toast.error("Ошибка обновления клиента");
        return false;
      }
    },
    [loadClients]
  );

  const deleteClient = useCallback(
    async (clientId: string): Promise<boolean> => {
      try {
        const { error } = await supabase.from("clients").delete().eq("id", clientId);
        if (error) throw error;
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        toast.success("Клиент удалён");
        return true;
      } catch (err) {
        console.error("Error deleting client:", err);
        toast.error("Ошибка удаления клиента");
        return false;
      }
    },
    []
  );

  const bulkCreateClients = useCallback(
    async (rows: NewClientData[]): Promise<number> => {
      if (!user || rows.length === 0) return 0;
      try {
        const mapped = rows.map((d) => ({
          user_id: user.id,
          first_name: d.firstName.trim(),
          last_name: d.lastName.trim(),
          email: d.email.trim(),
          phone: d.phone.trim(),
          social_media: d.socialMedia.trim(),
          messengers: d.messengers.trim(),
          status: d.status,
          comment: d.comment.trim(),
        }));
        const { error } = await supabase.from("clients").insert(mapped);
        if (error) throw error;
        await loadClients();
        return rows.length;
      } catch (err) {
        console.error("Error bulk creating clients:", err);
        throw err;
      }
    },
    [user, loadClients]
  );

  useEffect(() => {
    if (user) {
      loadClients();
    } else {
      setLoading(false);
    }
  }, [loadClients, user]);

  return { clients, loading, createClient, updateClient, deleteClient, bulkCreateClients, reloadClients: loadClients };
}
