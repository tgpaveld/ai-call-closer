import { useState, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface UseTextToSpeechOptions {
  voiceId?: string;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { voiceId = "JBFqnCBsd6RMkjVDRZzb" } = options;
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка запроса: ${response.status}`);
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
  }, [voiceId, stop]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
  };
}
