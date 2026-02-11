import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export type ChatMode = "ai_manager" | "ai_client" | "ai_auto";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseScriptChatOptions {
  scriptContent: string;
  objections: { category: string; trigger: string; keywords: string[] }[];
  mode: ChatMode;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-chat`;

async function streamResponse(
  body: Record<string, unknown>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) toast.error("Слишком много запросов, попробуйте позже");
    else if (resp.status === 402) toast.error("Требуется пополнение баланса AI");
    else toast.error("Ошибка соединения с AI");
    return false;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onChunk(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onChunk(content);
      } catch { /* ignore */ }
    }
  }

  return true;
}

export function useScriptChat({ scriptContent, objections, mode }: UseScriptChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const makeAssistantUpserter = () => {
    const assistantId = crypto.randomUUID();
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === assistantId) {
          return prev.map((m) => m.id === assistantId ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { id: assistantId, role: "assistant" as const, content: assistantSoFar, timestamp: new Date() }];
      });
    };
    return upsert;
  };

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const upsert = makeAssistantUpserter();

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const apiMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: input },
      ];

      await streamResponse(
        { messages: apiMessages, scriptContent, objections, mode },
        upsert,
        controller.signal,
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("Chat error:", e);
        toast.error("Ошибка отправки сообщения");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, scriptContent, objections, mode]);

  const startConversation = useCallback(async () => {
    setMessages([]);
    setIsLoading(true);

    const upsert = makeAssistantUpserter();

    const startPrompts: Record<ChatMode, string> = {
      ai_client: "Начни разговор — ты клиент, тебе только что позвонили.",
      ai_manager: "Начни разговор — ты менеджер, ты только что позвонил клиенту.",
      ai_auto: "Начни полный разговор между менеджером и клиентом. Покажи как правильно вести диалог и обрабатывать возражения.",
    };

    try {
      await streamResponse(
        {
          messages: [{ role: "user", content: startPrompts[mode] }],
          scriptContent,
          objections,
          mode,
        },
        upsert,
      );
    } catch (e) {
      console.error("Start chat error:", e);
      toast.error("Ошибка запуска разговора");
    } finally {
      setIsLoading(false);
    }
  }, [scriptContent, objections, mode]);

  const continueAutoDialog = useCallback(async () => {
    if (mode !== "ai_auto") return;
    setIsLoading(true);

    const upsert = makeAssistantUpserter();

    try {
      const apiMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: "Продолжай разговор. Следующие реплики менеджера и клиента." },
      ];

      await streamResponse(
        { messages: apiMessages, scriptContent, objections, mode },
        upsert,
      );
    } catch (e) {
      console.error("Continue auto error:", e);
      toast.error("Ошибка продолжения разговора");
    } finally {
      setIsLoading(false);
    }
  }, [messages, scriptContent, objections, mode]);

  const clearChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, sendMessage, startConversation, continueAutoDialog, clearChat };
}
