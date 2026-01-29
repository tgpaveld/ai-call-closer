import { useState, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface UseTextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { lang = "ru-RU", rate = 1, pitch = 1 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
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

    if (!window.speechSynthesis) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Ваш браузер не поддерживает синтез речи",
      });
      return;
    }

    stop();
    setIsLoading(true);

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      // Try to find a Russian voice
      const voices = window.speechSynthesis.getVoices();
      const russianVoice = voices.find(voice => voice.lang.startsWith('ru'));
      if (russianVoice) {
        utterance.voice = russianVoice;
      }

      utteranceRef.current = utterance;

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        setIsPlaying(false);
        setIsLoading(false);
        if (event.error !== 'canceled') {
          toast({
            variant: "destructive",
            title: "Ошибка воспроизведения",
            description: "Не удалось воспроизвести аудио",
          });
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS error:", error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Ошибка генерации голоса",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    }
  }, [lang, rate, pitch, stop]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
  };
}
