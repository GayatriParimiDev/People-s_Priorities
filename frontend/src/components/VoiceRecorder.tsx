import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onTranscribed: (transcript: string, detectedLanguage: string) => void;
  onRecordingStateChange?: (recording: boolean) => void;
  placeholderText?: string;
  className?: string;
  variant?: "form" | "whatsapp";
}

export default function VoiceRecorder({
  onTranscribed,
  onRecordingStateChange,
  placeholderText = "Click microphone to dictate in your system language (e.g. English, Hindi).",
  className = "",
  variant = "form",
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "recording" | "transcribing" | "error">("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Web Speech API is not supported in this browser.");
      setStatus("error");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      // Auto-detect browser language or fall back to English
      recognition.lang = navigator.language || "en-US";

      let fullTranscript = "";

      recognition.onstart = () => {
        setRecording(true);
        setStatus("recording");
        onRecordingStateChange?.(true);
        setRecordingSeconds(0);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
      };

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            fullTranscript += event.results[i][0].transcript + " ";
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("In-browser Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setStatus("error");
        }
      };

      recognition.onend = () => {
        setRecording(false);
        onRecordingStateChange?.(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        if (fullTranscript.trim()) {
          onTranscribed(fullTranscript.trim(), recognition.lang);
          setStatus("idle");
        } else if (status !== "error") {
          setStatus("idle");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to initialize Web Speech API:", err);
      setStatus("error");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      setStatus("transcribing");
      recognitionRef.current.stop();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (variant === "whatsapp") {
    return (
      <div className={`flex items-center space-x-1.5 ${className}`}>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`p-2.5 rounded-full cursor-pointer flex items-center justify-center border transition-all ${
            recording
              ? "bg-rose-600 border-rose-500 text-white animate-pulse"
              : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
          }`}
          title={recording ? "Stop Dictation" : "Record Voice Note"}
          disabled={status === "transcribing"}
        >
          {status === "transcribing" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : recording ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>
        {recording && (
          <span className="text-[10px] text-rose-600 font-bold animate-pulse">
            Listening {formatTime(recordingSeconds)}
          </span>
        )}
        {status === "transcribing" && (
          <span className="text-[10px] text-slate-500 italic animate-pulse">Transcribing...</span>
        )}
        {status === "error" && (
          <span className="text-[9px] text-rose-500 leading-tight">
            Speech API error or block.
          </span>
        )}
      </div>
    );
  }

  // Default "form" variant
  return (
    <div className={`space-y-2 ${className}`}>
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
        Voice Intake (In-Browser Speech-to-Text)
      </span>
      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-250 shadow-xs">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={status === "transcribing"}
          className={`p-3 rounded-full cursor-pointer flex items-center justify-center border transition-all shadow-sm ${
            recording
              ? "bg-rose-600 border-rose-500 text-white animate-pulse"
              : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
          }`}
        >
          {status === "transcribing" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : recording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {recording ? (
            <div className="space-y-1">
              <span className="text-rose-600 font-bold text-xs flex items-center space-x-1.5 animate-pulse">
                <span>● LISTENING</span>
                <span className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] text-rose-700 font-mono">
                  {formatTime(recordingSeconds)}
                </span>
              </span>
              <span className="text-slate-500 text-[10px] block">
                Speaking... Tap mic again when finished.
              </span>
            </div>
          ) : status === "transcribing" ? (
            <div className="space-y-0.5">
              <span className="text-emerald-600 font-semibold text-xs animate-pulse">
                Processing Speech...
              </span>
              <span className="text-[10px] text-slate-500 block">
                Formatting final text transcript in-browser.
              </span>
            </div>
          ) : status === "error" ? (
            <div className="space-y-0.5">
              <span className="text-rose-600 font-bold text-xs block">Speech Recognition Failed</span>
              <span className="text-[10px] text-rose-500 leading-tight block">
                Please check microphone permissions or ensure your browser supports the Web Speech API.
              </span>
            </div>
          ) : (
            <div className="text-[11px] leading-tight text-slate-650">
              <span className="text-slate-500 font-sans block">{placeholderText}</span>
              <span className="text-slate-400 text-[9px] block mt-0.5 uppercase tracking-wide">
                Supports English · Hindi · Tamil · Kannada · System Native Locale
              </span>
            </div>
          )}
        </div>
      </div>

      {recording && (
        <div className="flex items-center space-x-1 h-3 px-3">
          <div className="bg-rose-500 w-0.5 rounded h-2 animate-bounce"></div>
          <div className="bg-rose-500 w-0.5 rounded h-3 animate-bounce delay-75"></div>
          <div className="bg-rose-500 w-0.5 rounded h-1 animate-bounce delay-150"></div>
          <div className="bg-rose-500 w-0.5 rounded h-2.5 animate-bounce delay-100"></div>
          <div className="bg-rose-500 w-0.5 rounded h-3.5 animate-bounce delay-200"></div>
          <div className="bg-rose-500 w-0.5 rounded h-1.5 animate-bounce delay-50"></div>
          <div className="bg-rose-500 w-0.5 rounded h-3 animate-bounce delay-125"></div>
        </div>
      )}
    </div>
  );
}
