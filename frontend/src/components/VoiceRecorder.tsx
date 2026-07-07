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
  placeholderText = "Click microphone to dictate in Hindi/Kannada/Marathi/Tamil.",
  className = "",
  variant = "form",
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "recording" | "uploading" | "error">("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await uploadAndTranscribe(blob, mimeType || "audio/webm");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setStatus("recording");
      onRecordingStateChange?.(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error("Microphone access failed:", err);
      setStatus("error");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    onRecordingStateChange?.(false);
  };

  const uploadAndTranscribe = async (blob: Blob, mimeType: string) => {
    setStatus("uploading");
    try {
      const formData = new FormData();
      const extension = mimeType.includes("mp4") ? "mp4" : "webm";
      formData.append("audio", blob, `recording.${extension}`);

      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Transcription request failed");
      }

      const data = await res.json();
      onTranscribed(data.transcript, data.detectedLanguage);
      setStatus("idle");
    } catch (err) {
      console.error("Upload/transcription failed:", err);
      setStatus("error");
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
          title={recording ? "Stop Recording" : "Record Voice Note"}
          disabled={status === "uploading"}
        >
          {status === "uploading" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : recording ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>
        {recording && (
          <span className="text-[10px] text-rose-600 font-bold animate-pulse">
            Recording {formatTime(recordingSeconds)}
          </span>
        )}
        {status === "uploading" && (
          <span className="text-[10px] text-slate-500 italic animate-pulse">Transcribing...</span>
        )}
        {status === "error" && (
          <span className="text-[9px] text-rose-500 leading-tight">
            Mic error. Use HTTPS or check permission.
          </span>
        )}
      </div>
    );
  }

  // Default "form" variant
  return (
    <div className={`space-y-2 ${className}`}>
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
        Voice Intake (Gemini Multilingual)
      </span>
      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-250 shadow-xs">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={status === "uploading"}
          className={`p-3 rounded-full cursor-pointer flex items-center justify-center border transition-all shadow-sm ${
            recording
              ? "bg-rose-600 border-rose-500 text-white animate-pulse"
              : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
          }`}
        >
          {status === "uploading" ? (
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
                <span>● RECORDING</span>
                <span className="bg-rose-100 px-1.5 py-0.5 rounded text-[10px] text-rose-700 font-mono">
                  {formatTime(recordingSeconds)}
                </span>
              </span>
              <span className="text-slate-500 text-[10px] block">
                Speaking... Tap mic again when finished.
              </span>
            </div>
          ) : status === "uploading" ? (
            <div className="space-y-0.5">
              <span className="text-emerald-600 font-semibold text-xs animate-pulse">
                Transcribing Audio...
              </span>
              <span className="text-[10px] text-slate-500 block">
                Analyzing multilingual voice content via Gemini API.
              </span>
            </div>
          ) : status === "error" ? (
            <div className="space-y-0.5">
              <span className="text-rose-600 font-bold text-xs block">Transcription Failed</span>
              <span className="text-[10px] text-rose-500 leading-tight block">
                Check mic permissions and that the backend server is running.
              </span>
            </div>
          ) : (
            <div className="text-[11px] leading-tight text-slate-650">
              <span className="text-slate-500 font-sans block">{placeholderText}</span>
              <span className="text-slate-400 text-[9px] block mt-0.5 uppercase tracking-wide">
                Supports English · Hindi · Kannada · Tamil · Marathi
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
