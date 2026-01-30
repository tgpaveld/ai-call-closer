import { useState, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export type TTSProvider = "elevenlabs" | "openai";

interface UseTextToSpeechOptions {
  provider?: TTSProvider;
  voiceId?: string; // ElevenLabs voice ID
  openaiVoice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed?: number;
}

const ELEVENLABS_VOICES: Record<string, string> = {
  "JBFqnCBsd6RMkjVDRZzb": "George (мужской)",
  "EXAVITQu4vr4xnSDxMaL": "Sarah (женский)",
  "onwK4e9ZLuTAKqWW03F9": "Daniel (мужской)",
  "pFZP5JQG7iQjIQuC4Bku": "Lily (женский)",
};

const OPENAI_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { 
    provider = "openai",
    voiceId = "JBFqnCBsd6RMkjVDRZzb",
    openaiVoice = "alloy",
    speed = 1.0
  } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Текст для озвучивания не может быть пустым",
      });
      return;
    }

    stop();
    setIsLoading(true);

    try {
      const endpoint = provider === "elevenlabs" 
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-tts`;

      const body = provider === "elevenlabs"
        ? { text, voiceId }
        : { text, voice: openaiVoice, speed };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const providerName = provider === "elevenlabs" ? "ElevenLabs" : "OpenAI";
        throw new Error(errorData.error || `Ошибка ${providerName}: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        toast({
          variant: "destructive",
          title: "Ошибка воспроизведения",
          description: "Не удалось воспроизвести аудио",
        });
      };

      setIsPlaying(true);
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка генерации голоса",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider, voiceId, openaiVoice, speed, stop]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
  };
}

export { ELEVENLABS_VOICES, OPENAI_VOICES };
