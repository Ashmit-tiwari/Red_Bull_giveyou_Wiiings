"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { MinimalUI } from "./MinimalUI";
import { LoadingScreen } from "./LoadingScreen";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const CinematicVideoScrubber: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Experience states
  const [loadProgress, setLoadProgress] = useState(25);
  const [isReady, setIsReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoSrc, setVideoSrc] = useState("/redbull-video.mp4");

  // High-performance scrubbing refs
  const targetTimeRef = useRef(0);
  const currentScrubTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive video stream selector (1440p desktop vs 1080p mobile)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      setVideoSrc(isMobile ? "/redbull-video-1080.mp4" : "/redbull-video.mp4");
    }
  }, []);

  // Monitor video buffering
  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const percent = Math.min(100, Math.round((bufferedEnd / video.duration) * 100));
      setLoadProgress((prev) => Math.max(prev, percent));
    }
  }, []);

  const handleLoadedData = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setLoadProgress((prev) => Math.max(prev, 65));
    }
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    setLoadProgress(100);
    setIsReady(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadProgress(100);
      setIsReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Dedicated RAF scrub loop + Lenis + GSAP ScrollTrigger
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!container || !video) return;

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 2. High-performance requestAnimationFrame Scrub Loop
    let rafId: number;
    let seekSafetyTimer: NodeJS.Timeout | null = null;

    const scrubLoop = () => {
      if (video && video.duration) {
        const target = targetTimeRef.current;
        const current = currentScrubTimeRef.current;

        // Smooth lerp toward target timestamp
        const diff = target - current;
        if (Math.abs(diff) > 0.001) {
          // Dynamic lerp: higher factor when far away, fine dampening when close
          const factor = Math.abs(diff) > 0.5 ? 0.35 : 0.22;
          currentScrubTimeRef.current += diff * factor;
        } else {
          currentScrubTimeRef.current = target;
        }

        const scrubDiff = Math.abs(video.currentTime - currentScrubTimeRef.current);

        // Perform video seek if not currently blocked
        if (!isSeekingRef.current && scrubDiff > 0.012) {
          isSeekingRef.current = true;
          video.currentTime = currentScrubTimeRef.current;

          // Safety timeout in case a browser drops the seeked event
          if (seekSafetyTimer) clearTimeout(seekSafetyTimer);
          seekSafetyTimer = setTimeout(() => {
            isSeekingRef.current = false;
          }, 50);
        }
      }
      rafId = requestAnimationFrame(scrubLoop);
    };

    rafId = requestAnimationFrame(scrubLoop);

    const onSeeked = () => {
      isSeekingRef.current = false;
      const target = targetTimeRef.current;
      if (video && Math.abs(video.currentTime - target) > 0.02) {
        isSeekingRef.current = true;
        video.currentTime = target;
      }
    };

    video.addEventListener("seeked", onSeeked);

    // 3. GSAP ScrollTrigger: maps 0% -> 100% of scroll to video timeline
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 to 1.0
        setScrollProgress(progress);

        if (video && video.duration) {
          // Map 0% scroll strictly to 0.0s, and 100% scroll strictly to the final frame
          const maxTime = Math.max(0, video.duration - 0.04);
          let computedTime = progress * maxTime;

          if (progress <= 0.001) {
            computedTime = 0;
          } else if (progress >= 0.998) {
            computedTime = maxTime;
          }

          targetTimeRef.current = computedTime;

          // Synchronize audio if unmuted
          const audio = audioRef.current;
          if (audio && !isMuted) {
            const timeDiff = Math.abs(audio.currentTime - computedTime);
            if (timeDiff > 0.25) {
              audio.currentTime = computedTime;
            }

            isScrollingRef.current = true;
            if (audio.paused && progress < 0.99) {
              audio.play().catch(() => {});
            }

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
              isScrollingRef.current = false;
              if (audio && !audio.paused) {
                audio.pause();
              }
            }, 180);
          }
        }
      },
    });

    return () => {
      st.kill();
      cancelAnimationFrame(rafId);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      video.removeEventListener("seeked", onSeeked);
      if (seekSafetyTimer) clearTimeout(seekSafetyTimer);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isMuted, videoSrc]);

  // Audio mute/unmute
  const handleToggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setIsMuted(false);
      audio.muted = false;
      audio.currentTime = targetTimeRef.current;
      audio.play().catch(() => {});
    } else {
      setIsMuted(true);
      audio.muted = true;
      audio.pause();
    }
  }, [isMuted]);

  // Scroll to Top action
  const handleScrollToTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Scroll to End (Final invitation frame)
  const handleScrollToEnd = useCallback(() => {
    if (lenisRef.current && containerRef.current) {
      lenisRef.current.scrollTo(containerRef.current.scrollHeight, {
        duration: 1.8,
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <>
      {/* Loading state overlay */}
      {!hasEntered && (
        <LoadingScreen
          progress={loadProgress}
          isReady={isReady}
          onEnter={() => setHasEntered(true)}
        />
      )}

      {/* Synchronized soundtrack */}
      <audio
        ref={audioRef}
        src="/audio.mp3"
        preload="auto"
        loop={false}
        muted={isMuted}
      />

      {/* Main Scroll Container (480vh for granular, tactile scrubbing) */}
      <div
        ref={containerRef}
        className="relative w-full h-[480vh] bg-[#050608] select-none"
      >
        {/* Pinned Full Viewport Screen */}
        <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-10">
          <video
            ref={videoRef}
            src={videoSrc}
            poster="/poster-first.jpg"
            preload="auto"
            muted
            playsInline
            webkit-playsinline="true"
            onProgress={handleProgress}
            onLoadedData={handleLoadedData}
            onCanPlayThrough={handleCanPlayThrough}
            className="w-full h-full object-cover object-center transform-gpu will-change-[currentTime]"
          />

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/30" />

          {/* Micro-grain texture */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />

          {/* Final Frame Lock (at 100% scroll) */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              scrollProgress >= 0.992 ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src="/poster-final.jpg"
              alt="AIML Club Inventra 2026 Red Bull Invitation"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-radial from-[#00b4d8]/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Minimal UI Overlay */}
        <MinimalUI
          scrollProgress={scrollProgress}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onScrollToTop={handleScrollToTop}
          onScrollToEnd={handleScrollToEnd}
        />
      </div>
    </>
  );
};
