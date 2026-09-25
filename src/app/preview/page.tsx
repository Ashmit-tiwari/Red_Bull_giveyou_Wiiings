"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PreviewPage() {
  const [viewMode, setViewMode] = useState<"after" | "before">("after");
  const [zoom, setZoom] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#050608] text-white flex flex-col items-center justify-between select-none">
      {/* Top Floating Control Bar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-black/75 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
        <Link
          href="/"
          className="text-xs font-mono tracking-wider text-neutral-400 hover:text-white transition-colors uppercase pr-3 border-r border-white/10"
        >
          ← Back to Scroller
        </Link>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full">
          <button
            onClick={() => setViewMode("after")}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === "after"
                ? "bg-[#ea1d2d] text-white shadow-lg shadow-red-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            New (Blueprint Spec)
          </button>
          <button
            onClick={() => setViewMode("before")}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === "before"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Original (Before)
          </button>
        </div>

        <button
          onClick={() => setZoom(!zoom)}
          className="text-xs font-mono tracking-wider text-neutral-400 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-all uppercase"
        >
          {zoom ? "Fit View" : "100% Zoom"}
        </button>
      </header>

      {/* Main Preview Container */}
      <main className="w-screen h-screen flex items-center justify-center overflow-auto p-4 pt-20">
        <div
          className={`relative transition-all duration-300 ${
            zoom
              ? "scale-150 origin-center cursor-zoom-out"
              : "max-w-full max-h-[88vh] aspect-video cursor-zoom-in"
          }`}
          onClick={() => setZoom(!zoom)}
        >
          <img
            src={
              viewMode === "after"
                ? "/preview_blueprint_can.jpg"
                : "/original_reference_frame.jpg"
            }
            alt="Red Bull Frame Preview"
            className="w-full h-full object-contain rounded-lg shadow-2xl border border-white/5"
          />
        </div>
      </main>

      {/* Bottom Information Bar */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/60 backdrop-blur-sm px-6 py-2 rounded-full border border-white/5 text-[11px] font-mono tracking-wide text-neutral-400 flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Local Preview (Not Pushed to Git)
        </span>
        <span className="text-white/20">|</span>
        <span>Resolution: 2560 × 1440 QHD</span>
      </footer>
    </div>
  );
}
