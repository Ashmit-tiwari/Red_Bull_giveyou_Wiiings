"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, RotateCcw, Sparkles, Send } from "lucide-react";

interface MinimalUIProps {
  scrollProgress: number;
  isMuted: boolean;
  onToggleSound: () => void;
  onScrollToTop: () => void;
  onScrollToEnd: () => void;
}

export const MinimalUI: React.FC<MinimalUIProps> = ({
  scrollProgress,
  isMuted,
  onToggleSound,
  onScrollToTop,
  onScrollToEnd,
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const percent = Math.min(100, Math.max(0, Math.round(scrollProgress * 100)));
  const isStart = scrollProgress < 0.05;
  const isEnd = scrollProgress > 0.94;

  const getChapterName = () => {
    if (scrollProgress < 0.2) return "CAN CLOSE-UP";
    if (scrollProgress < 0.45) return "COLD HISS";
    if (scrollProgress < 0.7) return "DEV FOCUS";
    if (scrollProgress < 0.88) return "WINGS REVEAL";
    return "OFFICIAL INVITATION";
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("aimlclub@inventra2026.edu");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-10 py-5 sm:py-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900/60 border border-neutral-700/60 backdrop-blur-md shadow-lg">
            <span className="text-[11px] font-black tracking-widest text-[#00b4d8]">
              AI
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                AIML Club
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 font-mono tracking-wider">
                INVENTRA &apos;26
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase hidden sm:block">
              Red Bull Partnership
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800/70 backdrop-blur-md text-[11px] font-mono text-neutral-300">
            <span className="text-neutral-400 uppercase tracking-wider text-[10px] hidden sm:inline">
              Progress
            </span>
            <span className="text-white font-bold tabular-nums min-w-[32px] text-right">
              {percent}%
            </span>
          </div>

          <button
            onClick={onToggleSound}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/70 border border-neutral-700/60 backdrop-blur-md hover:bg-neutral-800/80 transition-all duration-300 cursor-pointer shadow-lg active:scale-95"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-mono tracking-wider text-neutral-400 group-hover:text-white uppercase hidden sm:inline">
                  Sound: Off
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#ea1d2d] animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider text-[#ea1d2d] uppercase hidden sm:inline">
                  Sound: On
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      <div
        className={`fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 transition-all duration-700 pointer-events-none ${
          isStart ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
          Scroll To Scrub Experience
        </span>
        <div className="w-5 h-9 rounded-full border border-neutral-600/70 flex items-start justify-center p-1.5 backdrop-blur-sm bg-neutral-900/40">
          <div className="w-1 h-2 rounded-full bg-white animate-bounce" />
        </div>
        <span className="text-[9px] font-mono tracking-widest text-neutral-400">
          [ 0% → 100% ]
        </span>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-end justify-between px-6 sm:px-10 py-5 sm:py-6 pointer-events-none">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-neutral-400 bg-neutral-950/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-neutral-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ea1d2d]" />
          <span className="uppercase text-neutral-300 font-semibold">
            {getChapterName()}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {isEnd ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onScrollToTop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900/80 border border-neutral-700/80 hover:bg-neutral-800 text-[11px] font-mono tracking-wider text-neutral-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              >
                <RotateCcw className="w-3 h-3" />
                <span>REPLAY</span>
              </button>

              <button
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#ea1d2d] hover:bg-[#ff2436] text-[11px] font-bold tracking-wider text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(234,29,45,0.4)]"
              >
                <Sparkles className="w-3 h-3" />
                <span>CONNECT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onScrollToEnd}
              className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-neutral-200 transition-colors uppercase bg-neutral-950/40 backdrop-blur-sm px-2.5 py-1 rounded border border-neutral-800/40 cursor-pointer hidden sm:block"
            >
              Skip to Invitation ↓
            </button>
          )}
        </div>
      </footer>

      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0a0c10] border border-neutral-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ea1d2d]" />
                <h3 className="text-sm font-bold tracking-wider uppercase">
                  Inventra 2026 Sponsorship
                </h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono p-1"
              >
                ✕ CLOSE
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-6 leading-relaxed font-sans">
              AIML Club cordially invites Red Bull to fuel the minds of 2,000+
              builders, AI developers, and innovators at Inventra 2026. Let&apos;s
              give the next generation wings.
            </p>

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 mb-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">
                  Sponsorship Desk
                </div>
                <div className="text-xs font-mono text-white font-semibold">
                  aimlclub@inventra2026.edu
                </div>
              </div>
              <button
                onClick={handleCopyEmail}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? "COPIED!" : "COPY"}
              </button>
            </div>

            <div className="flex gap-3">
              <a
                href="mailto:aimlclub@inventra2026.edu?subject=Red%20Bull%20Sponsorship%20-%20Inventra%202026"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#ea1d2d] to-[#c7001e] hover:shadow-[0_0_20px_rgba(234,29,45,0.5)] text-xs font-bold uppercase tracking-wider text-white transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Send Email
              </a>
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
