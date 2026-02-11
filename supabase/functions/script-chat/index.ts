import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, scriptContent, objections } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build objections context
    let objectionsContext = "";
    if (objections && objections.length > 0) {
      objectionsContext = `\n\nУ тебя есть база возражений. Когда пользователь (менеджер) говорит что-то, а ты (клиент) возражаешь — используй эти типичные возражения:\n`;
      for (const obj of objections) {
        objectionsContext += `\n- Категория: ${obj.category}, Триггер: "${obj.trigger}", Ключевые слова: [${obj.keywords.join(", ")}]`;
      }
    }

    const systemPrompt = `Ты играешь роль КЛИЕНТА, которому звонит менеджер по продажам. Твоя задача — реалистично имитировать поведение живого клиента во время холодного звонка.

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
