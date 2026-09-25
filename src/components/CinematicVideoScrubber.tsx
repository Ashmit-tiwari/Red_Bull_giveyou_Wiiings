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

  const [loadProgress, setLoadProgress] = useState(20);
  const [isReady, setIsReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoSrc, setVideoSrc] = useState("/redbull-video.mp4");

  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      setVideoSrc(isMobile ? "/redbull-video-1080.mp4" : "/redbull-video.mp4");
    }
  }, []);

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
      setLoadProgress((prev) => Math.max(prev, 60));
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

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!container || !video) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    let seekTimeout: NodeJS.Timeout | null = null;

    const performSeek = (targetTime: number) => {
      if (!video || isNaN(targetTime) || !video.duration) return;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = targetTime;

        if (seekTimeout) clearTimeout(seekTimeout);
        seekTimeout = setTimeout(() => {
          isSeekingRef.current = false;
        }, 60);
      }
    };

    const onSeeked = () => {
      isSeekingRef.current = false;
      const targetTime = targetTimeRef.current;
      if (Math.abs(video.currentTime - targetTime) > 0.02) {
        isSeekingRef.current = true;
        video.currentTime = targetTime;
      }
    };

    video.addEventListener("seeked", onSeeked);

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
          const computedTime = Math.min(maxTime, Math.max(0, progress * maxTime));
          targetTimeRef.current = computedTime;

          performSeek(computedTime);

          const audio = audioRef.current;
          if (audio && !isMuted) {
            const timeDiff = Math.abs(audio.currentTime - computedTime);
            if (timeDiff > 0.25) {
              audio.currentTime = computedTime;
            }

            const now = Date.now();
            lastScrollTimeRef.current = now;

            if (audio.paused && progress < 0.99) {
              audio.play().catch(() => {});
            }

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
              if (Date.now() - lastScrollTimeRef.current >= 150) {
                if (!audio.paused) {
                  audio.pause();
                }
              }
            }, 180);
          }
        }
      },
    });

    return () => {
      st.kill();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      video.removeEventListener("seeked", onSeeked);
      if (seekTimeout) clearTimeout(seekTimeout);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isMuted, videoSrc]);

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

  const handleScrollToTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

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
      {!hasEntered && (
        <LoadingScreen
          progress={loadProgress}
          isReady={isReady}
          onEnter={() => setHasEntered(true)}
        />
      )}

      <audio
        ref={audioRef}
        src="/audio.mp3"
        preload="auto"
        loop={false}
        muted={isMuted}
      />

      <div
        ref={containerRef}
        className="relative w-full h-[480vh] bg-[#050608] select-none"
      >
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
            className="w-full h-full object-cover object-center transform-gpu"
          />

          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/30" />

          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />

          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
              scrollProgress >= 0.992 ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src="/poster-final.jpg"
              alt="Inventra 2026 Red Bull Invitation"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-radial from-[#00b4d8]/10 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

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
