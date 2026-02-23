
import React, { useState, useEffect, useRef } from 'react';
import { Protocol, Preferences } from '../types';
import { GeminiService } from '../services/geminiService';
import { AudioService } from '../services/audioService';

interface ProtocolTimerProps {
  protocol: Protocol;
  onComplete: () => void;
  preferences?: Preferences;
}

const ProtocolTimer: React.FC<ProtocolTimerProps> = ({ protocol, onComplete, preferences }) => {
  const [timeLeft, setTimeLeft] = useState(protocol.duration);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(!preferences?.audioEnabled);
  
  // Fix: Use any to avoid NodeJS.Timeout namespace error in browser environments
  const timerRef = useRef<any>(null);
  const gemini = GeminiService.getInstance();

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, onComplete]);

  // Handle step transitions and Audio Guide
  useEffect(() => {
    const elapsed = protocol.duration - timeLeft;
    
    // Update step index
    let stepSum = 0;
    let newStepIndex = 0;
    for (let i = 0; i < protocol.steps.length; i++) {
      stepSum += protocol.steps[i].duration;
      if (elapsed < stepSum) {
        newStepIndex = i;
        break;
      }
    }

    if (newStepIndex !== currentStepIndex) {
      setCurrentStepIndex(newStepIndex);
      // Haptic feedback on step change if enabled
      if (preferences?.haptics && isActive) {
        navigator.vibrate?.(200);
      }
    }

    // Trigger AI Audio Guide if matched
    if (!isMuted && isActive) {
      const guide = protocol.audioGuide.find(g => g.time === elapsed);
      if (guide) {
        gemini.generateSpeech(guide.text).then(base64 => {
          if (base64) {
            const volume = (preferences?.audioVolume ?? 80) / 100;
            AudioService.decodeAndPlay(base64, volume);
          }
        });
      }
    }
  }, [timeLeft, protocol, isActive, isMuted, gemini, currentStepIndex, preferences]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(protocol.duration);
    setCurrentStepIndex(0);
  };

  const progress = ((protocol.duration - timeLeft) / protocol.duration) * 100;
  const currentStep = protocol.steps[currentStepIndex];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center">
        {/* Progress Ring */}
        <div className="relative w-64 h-64 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={754}
              strokeDashoffset={754 - (754 * progress) / 100}
              className="text-indigo-600 transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-slate-900 dark:text-white tabular-nums">{timeLeft}s</span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Remaining</span>
          </div>
        </div>

        {/* Step Info */}
        <div className="text-center mb-8 max-w-md">
          <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2">Step {currentStepIndex + 1}: {currentStep.title}</h4>
          <p className="text-slate-700 dark:text-slate-300 font-medium text-lg leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Breathing Orb (if applicable) */}
        {protocol.hasBreathing && isActive && (
          <div className="mb-8 h-20 flex items-center justify-center w-full">
             <div className="bg-indigo-400/20 w-16 h-16 rounded-full flex items-center justify-center animate-pulse">
                <div className="bg-indigo-500 w-8 h-8 rounded-full shadow-lg shadow-indigo-300"></div>
             </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all transform active:scale-95 ${
              isActive ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'
            }`}
          >
            <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <i className="fas fa-rotate-left"></i>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-50 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-high'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtocolTimer;
