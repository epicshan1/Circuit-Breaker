
import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';

interface VoiceJournalProps {
  onTranscription: (text: string) => void;
}

const VoiceJournal: React.FC<VoiceJournalProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const gemini = GeminiService.getInstance();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(chunks.current, { type: 'audio/webm;codecs=opus' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const transcription = await gemini.transcribeAudio(base64Audio);
            if (transcription) onTranscription(transcription);
          } catch (error) {
            console.error("Transcription error:", error);
          } finally {
            setIsLoading(false);
          }
        };
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access failed", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
          isRecording 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
        } disabled:opacity-50`}
      >
        <i className={`fas ${isRecording ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
        {isLoading ? 'Transcribing...' : isRecording ? 'Stop Recording' : 'Voice Journal'}
      </button>
    </div>
  );
};

export default VoiceJournal;
