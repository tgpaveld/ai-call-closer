import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function buildAutoSystemPrompt(scriptContent: string): string {
  return `Ты симулируешь ПОЛНЫЙ ТЕЛЕФОННЫЙ РАЗГОВОР между менеджером по продажам и клиентом. Ты играешь ОБЕ роли одновременно.

ФОРМАТ ОТВЕТА:
Каждую реплику начинай с метки роли:
**Менеджер:** [реплика менеджера]
**Клиент:** [реплика клиента]

ПРАВИЛА:
1. Менеджер следует скрипту продаж и обрабатывает возражения
2. Клиент ведёт себя реалистично — задаёт вопросы, возражает, иногда соглашается
3. Разговор должен быть реалистичным и поучительным
4. Каждая реплика — 1-3 предложения
5. Напиши полный разговор (8-15 реплик суммарно)
6. Разговор должен завершиться логически — либо назначена встреча, либо клиент отказался

СКРИПТ ПРОДАЖ:
${scriptContent || "Скрипт не загружен"}

Менеджер: Алексей (AI Caller)
Клиент: Дмитрий Сергеевич, Коммерческий директор ООО "ТехноСтар"

Начни разговор с первого звонка менеджера. Проведи ВЕСЬ разговор от начала до конца.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("auto-dialog-cron: starting daily auto-dialog run");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch an active text script
    const { data: scripts, error: scriptErr } = await supabase
      .from("text_scripts")
      .select("*")
      .eq("is_active", true)
      .limit(1);

    if (scriptErr) {
      console.error("Error fetching scripts:", scriptErr);
      return new Response(
        JSON.stringify({ error: "Failed to fetch scripts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!scripts || scripts.length === 0) {
      console.log("No active scripts found, skipping auto-dialog");
      return new Response(
        JSON.stringify({ message: "No active scripts, skipping" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const script = scripts[0];
    console.log(`auto-dialog-cron: using script "${script.name}" (${script.id})`);

    const systemPrompt = buildAutoSystemPrompt(script.content);

    // Call AI gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "Начни полный разговор между менеджером и клиентом. Проведи весь диалог от начала до конца.",
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`AI gateway error: ${aiResponse.status}`, errText);

      const status = aiResponse.status === 402 ? "no_credits" : "error";
      await supabase.from("auto_dialog_runs").insert({
        script_id: script.id,
        script_name: script.name,
        conversation: `Error: ${aiResponse.status} — ${errText}`,
        status,
      });

      return new Response(
        JSON.stringify({ error: `AI error: ${aiResponse.status}` }),
        { status: aiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await aiResponse.json();
    const conversation = result.choices?.[0]?.message?.content || "Empty response";

    console.log(`auto-dialog-cron: got response, ${conversation.length} chars`);

    // Save the dialog run
    const { error: insertErr } = await supabase.from("auto_dialog_runs").insert({
      script_id: script.id,
      script_name: script.name,
      conversation,
      status: "completed",
    });

    if (insertErr) {
      console.error("Error saving dialog run:", insertErr);
    }

    console.log("auto-dialog-cron: completed successfully");

    return new Response(
      JSON.stringify({ message: "Auto-dialog completed", script: script.name }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("auto-dialog-cron error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
