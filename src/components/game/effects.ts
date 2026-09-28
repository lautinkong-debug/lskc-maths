"use client";
import { useCallback,useRef } from "react";

export function useSound(enabled:boolean) {
  const context=useRef<AudioContext|null>(null);
  return useCallback((kind:"correct"|"wrong"|"streak"|"countdown"|"podium") => {
    if (!enabled || typeof window === "undefined") return;
    const AudioContextType=window.AudioContext;
    if (!AudioContextType) return;
    const audio=context.current ?? (context.current=new AudioContextType());
    const tones={correct:[523,659],wrong:[220],streak:[523,659,784],countdown:[440],podium:[523,659,784,1047]}[kind];
    tones.forEach((frequency,index) => {
      const oscillator=audio.createOscillator(),gain=audio.createGain(); const at=audio.currentTime+index*.11;
      oscillator.type="sine"; oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(.0001,at); gain.gain.exponentialRampToValueAtTime(.15,at+.015); gain.gain.exponentialRampToValueAtTime(.0001,at+.19);
      oscillator.connect(gain).connect(audio.destination); oscillator.start(at); oscillator.stop(at+.2);
    });
  },[enabled]);
}
export function useHaptics(enabled:boolean) {
  return useCallback((kind:"correct"|"wrong") => { if (enabled && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(kind==="correct"?20:45); },[enabled]);
}
