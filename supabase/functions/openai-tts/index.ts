import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = "alloy", speed = 1.0 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!text) {
      throw new Error("Text is required");
    }

    console.log("Generating OpenAI TTS for text:", text.substring(0, 100) + "...");
    console.log("Voice:", voice, "Speed:", speed);

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        speed: speed,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS API error:", response.status, errorText);

      try {
        const parsed = JSON.parse(errorText);
        const errorMessage = parsed?.error?.message || `OpenAI API error: ${response.status}`;
        
        return new Response(
          JSON.stringify({
            error: errorMessage,
            provider: "openai",
            provider_status: response.status,
          }),
          {
            status: response.status === 401 ? 401 : 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch {
        return new Response(
          JSON.stringify({
            error: `OpenAI API error: ${response.status}`,
            provider: "openai",
            provider_status: response.status,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Audio generated successfully, size:", audioBuffer.byteLength);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
