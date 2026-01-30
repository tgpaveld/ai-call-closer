import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb" } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!text) {
      throw new Error("Text is required");
    }

    console.log("Generating TTS for text:", text.substring(0, 100) + "...");

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);

      // ElevenLabs sometimes returns 401 for blocked/free-tier usage with a helpful JSON body.
      // Surface a user-friendly error to the client instead of a generic 500.
      try {
        const parsed = JSON.parse(errorText);
        const status = parsed?.detail?.status as string | undefined;
        const message = parsed?.detail?.message as string | undefined;

        if (status === "detected_unusual_activity") {
          return new Response(
            JSON.stringify({
              error:
                "ElevenLabs заблокировал использование Free Tier (detected_unusual_activity). Перейдите на платный план или используйте другой ключ/аккаунт без VPN/прокси.",
              provider: "elevenlabs",
              provider_status: response.status,
              provider_detail: { status, message },
            }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            error: `ElevenLabs API error: ${response.status}`,
            provider: "elevenlabs",
            provider_status: response.status,
            provider_body: parsed,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch {
        return new Response(
          JSON.stringify({
            error: `ElevenLabs API error: ${response.status}`,
            provider: "elevenlabs",
            provider_status: response.status,
            provider_body_raw: errorText,
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
