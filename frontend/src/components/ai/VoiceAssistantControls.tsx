"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Square, Sparkles } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN"; // Supports Indian English and Sanskrit terms

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onTranscript(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? "Listening... Click to stop" : "Speak your question (Voice Input)"}
      className={`relative p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
        isListening
          ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30 scale-105"
          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
      }`}
    >
      {isListening ? (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Mic className="w-4 h-4 animate-bounce" />
          <span className="hidden sm:inline">Listening...</span>
        </span>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}

interface VoiceReaderProps {
  textToRead: string;
}

export function VoiceReaderControls({ textToRead }: VoiceReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text of markdown characters
    const cleanText = textToRead
      .replace(/[*#_`~>|-]/g, " ")
      .replace(/\[.*?\]\(.*?\)/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.lang = "en-IN";

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const toggleRate = () => {
    const nextRate = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 0.9 : 1.0;
    setSpeechRate(nextRate);
    if (isPlaying) {
      handleStop();
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
      {!isPlaying && !isPaused ? (
        <button
          type="button"
          onClick={handlePlay}
          className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition"
          title="Read Aloud"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Read Aloud</span>
        </button>
      ) : isPlaying ? (
        <>
          <button
            type="button"
            onClick={handlePause}
            className="p-1 rounded text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            title="Pause Reading"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Stop Reading"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={handlePlay}
            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            title="Resume Reading"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Stop Reading"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      <button
        type="button"
        onClick={toggleRate}
        className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        title="Toggle Speed"
      >
        {speechRate}x
      </button>
    </div>
  );
}
