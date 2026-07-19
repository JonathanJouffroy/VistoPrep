"use client";

import { useRef, useState } from "react";

interface AudioRecorderProps {
  onTranscribed: (transcription: string) => void;
}

type RecState = "idle" | "recording" | "transcribing" | "error";

export function AudioRecorder({ onTranscribed }: AudioRecorderProps) {
  const [state, setState] = useState<RecState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendForTranscription(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setState("error");
      setErrorMsg(
        "Impossible d'accéder au micro. Vérifie les autorisations de ton navigateur."
      );
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setState("transcribing");
  }

  async function sendForTranscription(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "reponse.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Échec de la transcription.");
      }

      const data = await res.json();
      onTranscribed(data.transcription);
      setState("idle");
    } catch (err) {
      setState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Échec de la transcription."
      );
    }
  }

  return (
    <div className="rounded-card border border-structural2 bg-white p-4">
      <div className="flex items-center gap-3">
        {state !== "recording" ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={state === "transcribing"}
            className="flex items-center gap-2 rounded-full bg-blue-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-mid disabled:opacity-50"
          >
            <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
            {state === "transcribing" ? "Transcription en cours…" : "Enregistrer une réponse orale"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-full bg-amber-deep px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <span className="h-2 w-2 rounded-sm bg-white" aria-hidden="true" />
            Arrêter l&apos;enregistrement
          </button>
        )}
        {state === "recording" && (
          <span className="font-mono text-xs text-amber-deep">● en cours</span>
        )}
      </div>
      {errorMsg && (
        <p className="mt-2 text-xs text-amber-deep">{errorMsg}</p>
      )}
    </div>
  );
}
