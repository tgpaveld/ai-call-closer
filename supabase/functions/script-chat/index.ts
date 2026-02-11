import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ChatMode = "ai_manager" | "ai_client" | "ai_auto";

function buildObjectionsContext(objections: { category: string; trigger: string; keywords: string[] }[]): string {
  if (!objections || objections.length === 0) return "";
  let ctx = "\n\nБаза возражений клиентов:\n";
  for (const obj of objections) {
    ctx += `\n- Категория: ${obj.category}, Триггер: "${obj.trigger}", Ключевые слова: [${obj.keywords.join(", ")}]`;
  }
  return ctx;
}

function buildSystemPrompt(mode: ChatMode, scriptContent: string, objections: any[]): string {
  const objectionsContext = buildObjectionsContext(objections);

  if (mode === "ai_manager") {
    return `Ты играешь роль МЕНЕДЖЕРА ПО ПРОДАЖАМ, который звонит клиенту. Твоя задача — реалистично вести разговор по скрипту, обрабатывать возражения клиента и вести к закрытию сделки.

ПРАВИЛА ПОВЕДЕНИЯ:
1. Следуй скрипту продаж, но адаптируйся к ответам клиента
2. Обрабатывай возражения профессионально, используя техники из базы возражений
3. Будь вежлив, но настойчив
4. Задавай уточняющие вопросы
5. Пытайся вывести разговор к назначению встречи/демо
6. Отвечай как реальный менеджер (1-3 предложения)
7. Используй техники активного слушания
8. Не сдавайся после первого возражения

СКРИПТ ПРОДАЖ (следуй ему):
${scriptContent || "Скрипт не загружен"}
${objectionsContext}

Имя менеджера: Алексей
Компания: AI Caller

Начни с приветствия по скрипту.`;
  }

  if (mode === "ai_auto") {
    return `Ты симулируешь ПОЛНЫЙ ТЕЛЕФОННЫЙ РАЗГОВОР между менеджером по продажам и клиентом. Ты играешь ОБЕ роли одновременно.

ФОРМАТ ОТВЕТА:
Каждую реплику начинай с метки роли:
**Менеджер:** [реплика менеджера]
**Клиент:** [реплика клиента]

ПРАВИЛА:
1. Менеджер следует скрипту продаж и обрабатывает возражения
2. Клиент ведёт себя реалистично — задаёт вопросы, возражает, иногда соглашается
3. Клиент использует возражения из базы (не все сразу, постепенно)
4. Менеджер демонстрирует лучшие практики обработки возражений
5. Разговор должен быть реалистичным и поучительным
6. Каждая реплика — 1-3 предложения
7. Пиши по 2-4 реплики за раз (чередуя менеджера и клиента)
8. Разговор должен развиваться — не зацикливайся

СКРИПТ ПРОДАЖ:
${scriptContent || "Скрипт не загружен"}
${objectionsContext}

Менеджер: Алексей (AI Caller)
Клиент: Дмитрий Сергеевич, Коммерческий директор ООО "ТехноСтар"

Начни разговор с первого звонка менеджера.`;
  }

  // Default: ai_client (original behavior)
  return `Ты играешь роль КЛИЕНТА, которому звонит менеджер по продажам. Твоя задача — реалистично имитировать поведение живого клиента во время холодного звонка.

ПРАВИЛА ПОВЕДЕНИЯ:
1. Веди себя как настоящий клиент — иногда заинтересованный, иногда скептичный, иногда занятой
2. Реагируй естественно на то, что говорит менеджер
3. Задавай уточняющие вопросы
4. Иногда выдвигай возражения (цена, время, доверие, не нужно и т.д.)
5. Если менеджер хорошо обрабатывает возражения — можешь смягчиться и проявить интерес
6. Отвечай коротко, как в реальном телефонном разговоре (1-3 предложения)
7. Не будь слишком лёгким клиентом — создавай реалистичное сопротивление
8. Иногда перебивай или просишь говорить конкретнее

СКРИПТ ПРОДАЖ (для контекста — это скрипт менеджера, ты должен реагировать на него как клиент):
${scriptContent || "Скрипт не загружен"}
${objectionsContext}

Имя клиента: Дмитрий Сергеевич
Компания клиента: ООО "ТехноСтар"
Должность: Коммерческий директор

Начни разговор с того, что ты поднял трубку и сказал "Алло" или "Да, слушаю".`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, scriptContent, objections, mode = "ai_client" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("script-chat mode:", mode, "messages:", messages.length);

    const systemPrompt = buildSystemPrompt(mode as ChatMode, scriptContent, objections);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов, попробуйте позже" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Требуется пополнение баланса AI" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Ошибка AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("script-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
