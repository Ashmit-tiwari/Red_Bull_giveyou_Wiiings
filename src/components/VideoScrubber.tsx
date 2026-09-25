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
  const [scrollProgress, setScrollProgress] = useState(0);

  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const seekSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fast decoding video selection
  const [videoSrc, setVideoSrc] = useState("/redbull-video-1080.mp4");

  useEffect(() => {
    // 1080p all-intra video provides optimal 60fps seek performance across all desktop and mobile displays
    setVideoSrc("/redbull-video-1080.mp4");
  }, []);

  const handleLoadedData = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setIsLoaded(true);
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Failsafe timer to remove loading screen
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Core Seek Execution Engine
  const executeSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(time)) return;

    const clampedTime = Math.max(0, Math.min(video.duration - 0.04, time));

    if (isSeekingRef.current) {
      pendingSeekTimeRef.current = clampedTime;
      return;
    }

    isSeekingRef.current = true;
    video.currentTime = clampedTime;

    // Safety timeout in case the browser drops the seeked event
    if (seekSafetyTimerRef.current) clearTimeout(seekSafetyTimerRef.current);
    seekSafetyTimerRef.current = setTimeout(() => {
      isSeekingRef.current = false;
      if (pendingSeekTimeRef.current !== null) {
        const nextTime = pendingSeekTimeRef.current;
        pendingSeekTimeRef.current = null;
        executeSeek(nextTime);
      }
    }, 70);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!container || !video) return;

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    const onSeeked = () => {
      if (seekSafetyTimerRef.current) clearTimeout(seekSafetyTimerRef.current);
      isSeekingRef.current = false;

      if (pendingSeekTimeRef.current !== null) {
        const nextTime = pendingSeekTimeRef.current;
        pendingSeekTimeRef.current = null;
        if (Math.abs(video.currentTime - nextTime) > 0.015) {
          executeSeek(nextTime);
        }
      }
    };

    video.addEventListener("seeked", onSeeked);

    // Continuous frame sync loop for silky responsiveness
    let rafId: number;
    const syncLoop = () => {
      if (video && video.duration && !isSeekingRef.current) {
        const target = targetTimeRef.current;
        if (Math.abs(video.currentTime - target) > 0.02) {
          executeSeek(target);
        }
      }
      rafId = requestAnimationFrame(syncLoop);
    };
    rafId = requestAnimationFrame(syncLoop);

    // GSAP ScrollTrigger: maps 0% -> 100% of scroll to video timeline
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        setScrollProgress(progress);

        if (video && video.duration) {
          const maxTime = Math.max(0, video.duration - 0.04);
          let target = progress * maxTime;
          if (progress <= 0.001) target = 0;
          if (progress >= 0.997) target = maxTime;

          targetTimeRef.current = target;
          executeSeek(target);
        }
      },
    });

    return () => {
      st.kill();
      cancelAnimationFrame(rafId);
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
      video.removeEventListener("seeked", onSeeked);
      if (seekSafetyTimerRef.current) clearTimeout(seekSafetyTimerRef.current);
    };
  }, [executeSeek, videoSrc]);

  const atEnd = scrollProgress >= 0.992;
  const isAtStart = scrollProgress < 0.03;

  return (
    <>
      {/* Minimal Loading Screen */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#050608] transition-opacity duration-700 ${
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ea1d2d] animate-ping" />
          <span className="text-[11px] font-mono tracking-[0.3em] text-neutral-400 uppercase">
            Loading
          </span>
        </div>
      </div>

      {/* Main Scroll Container (550vh for tactile, cinematic scrubbing) */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#050608]"
        style={{ height: "550vh" }}
      >
        {/* Full-Screen Pinned Viewport */}
        <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-10">
          <video
            ref={videoRef}
            src={videoSrc}
            poster="/poster-first.jpg"
            preload="auto"
            muted
            playsInline
            onLoadedData={handleLoadedData}
            onCanPlay={handleCanPlay}
            onCanPlayThrough={handleCanPlay}
            className="w-full h-full object-cover object-center transform-gpu"
          />

          {/* Subtle cinematic vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/35 via-transparent to-black/25" />

          {/* Final Frame Lock (100% scroll) */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              atEnd ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src="/poster-final.jpg"
              alt="Final Invitation"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Minimal Subtle Scroll Indicator at Start */}
        <div
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500 ${
            isAtStart && isLoaded ? "opacity-75" : "opacity-0"
          }`}
        >
          <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-white/50 to-white/90 animate-pulse" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
            Scroll
          </span>
        </div>
      </div>
    </>
  );
};

export default VideoScrubber;
