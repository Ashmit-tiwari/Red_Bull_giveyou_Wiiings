"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const VideoScrubber: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Scrub engine refs
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const rafIdRef = useRef(0);

  // Choose video source based on viewport width
  const [videoSrc, setVideoSrc] = useState("/redbull-video.mp4");
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setVideoSrc("/redbull-video-1080.mp4");
    }
  }, []);

  // Video ready handler
  const handleCanPlay = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Fallback: force-ready after 3s
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Fade out loading screen once loaded
  useEffect(() => {
    if (isLoaded) {
      const t = setTimeout(() => setIsFading(true), 200);
      return () => clearTimeout(t);
    }
  }, [isLoaded]);

  // Hide scroll hint after first scroll or after 4s
  useEffect(() => {
    if (!isFading) return;

    const hideOnScroll = () => setShowScrollHint(false);
    window.addEventListener("scroll", hideOnScroll, { once: true, passive: true });

    const t = setTimeout(() => setShowScrollHint(false), 4000);
    return () => {
      window.removeEventListener("scroll", hideOnScroll);
      clearTimeout(t);
    };
  }, [isFading]);

  // ── CORE SCRUB ENGINE ──
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!container || !video) return;

    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    // RAF lerp loop — smooth interpolation for buttery scrubbing
    const scrubLoop = () => {
      if (video && video.duration) {
        const target = targetTimeRef.current;
        const current = currentTimeRef.current;
        const diff = target - current;

        if (Math.abs(diff) > 0.001) {
          const factor = Math.abs(diff) > 0.5 ? 0.3 : 0.18;
          currentTimeRef.current += diff * factor;
        } else {
          currentTimeRef.current = target;
        }

        const seekDiff = Math.abs(video.currentTime - currentTimeRef.current);
        if (seekDiff > 0.01) {
          video.currentTime = currentTimeRef.current;
        }
      }
      rafIdRef.current = requestAnimationFrame(scrubLoop);
    };
    rafIdRef.current = requestAnimationFrame(scrubLoop);

    // ScrollTrigger: maps scroll 0-100% to video timeline
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;

        if (video && video.duration) {
          const maxTime = Math.max(0, video.duration - 0.04);
          let t: number;
          if (progress <= 0.001) {
            t = 0;
          } else if (progress >= 0.998) {
            t = maxTime;
          } else {
            t = progress * maxTime;
          }
          targetTimeRef.current = t;
          currentTimeRef.current = currentTimeRef.current || 0;
        }

        setAtEnd(progress >= 0.993);
      },
    });

    return () => {
      st.kill();
      cancelAnimationFrame(rafIdRef.current);
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [videoSrc]);

  return (
    <>
      {/* Loading screen */}
      {!isFading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030305]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.3em] text-white/30 uppercase">
              Loading
            </span>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 bg-[#030305] pointer-events-none transition-opacity duration-700 opacity-0" />
      )}

      {/* Scroll container — 500vh for fine-grained scrubbing */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#030305]"
        style={{ height: "500vh" }}
      >
        {/* Pinned full-viewport video */}
        <div className="fixed inset-0 w-screen h-screen overflow-hidden z-10">
          <video
            ref={videoRef}
            src={videoSrc}
            poster="/poster-first.jpg"
            preload="auto"
            muted
            playsInline
            onCanPlayThrough={handleCanPlay}
            className="w-full h-full object-cover object-center"
          />

          {/* Subtle cinematic vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-black/20" />

          {/* Final frame lock at 100% scroll */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              atEnd ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src="/poster-final.jpg"
              alt=""
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Initial scroll hint — auto-fades */}
        {showScrollHint && isFading && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-pulse pointer-events-none">
            <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-white/40" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-white/25 uppercase">
              Scroll
            </span>
          </div>
        )}
      </div>
    </>
  );
};
