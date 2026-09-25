"use client";

import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  progress: number;
  isReady: boolean;
  onEnter: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  isReady,
  onEnter,
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < progress) {
          return Math.min(progress, prev + 2);
        }
        return prev;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [progress]);

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050608] text-white transition-all duration-700 ${
        hasStarted ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#ea1d2d]/10 via-[#002244]/15 to-[#00b4d8]/10 rounded-full blur-3xl opacity-60 animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
        <div className="flex items-center gap-2 tracking-[0.3em] text-xs font-mono text-neutral-400 mb-8 uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ea1d2d] animate-ping" />
          <span>AIML CLUB</span>
          <span className="text-neutral-600">/</span>
          <span>INVENTRA &apos;26</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase mb-2 bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Cinematic Invitation
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 tracking-wider uppercase mb-10 font-mono">
          Interactive Scroll Experience
        </p>

        <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-full h-1.5 overflow-hidden mb-5 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-[#ea1d2d] via-[#ffd100] to-[#00b4d8] rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(234,29,45,0.6)]"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        <div className="flex justify-between items-center w-full text-xs font-mono text-neutral-400 mb-8">
          <span className="tracking-widest">
            {isReady && displayProgress >= 100
              ? "EXPERIENCE READY"
              : "BUFFERING CINEMATICS..."}
          </span>
          <span className="text-neutral-200 font-semibold tabular-nums">
            {displayProgress}%
          </span>
        </div>

        {isReady && displayProgress >= 100 ? (
          <button
            onClick={handleStart}
            className="group relative px-8 py-3.5 rounded-full text-xs font-bold tracking-[0.25em] uppercase text-white bg-gradient-to-r from-[#ea1d2d] to-[#c7001e] hover:shadow-[0_0_25px_rgba(234,29,45,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              ENTER INVITATION
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </button>
        ) : (
          <div className="h-[46px] flex items-center justify-center">
            <span className="text-[11px] font-mono tracking-widest text-neutral-400 animate-pulse">
              OPTIMIZING 60FPS SCROLL ENGINE
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase">
        AIML Club x Red Bull Gives You Wiiings
      </div>
    </div>
  );
};
