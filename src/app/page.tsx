"use client";

import dynamic from "next/dynamic";

const VideoScrubber = dynamic(
  () => import("../components/VideoScrubber").then((mod) => mod.VideoScrubber),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050608] text-white overflow-x-hidden">
      <VideoScrubber />
    </main>
  );
}
