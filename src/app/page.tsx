"use client";

import dynamic from "next/dynamic";

const CinematicVideoScrubber = dynamic(
  () =>
    import("../components/CinematicVideoScrubber").then(
      (mod) => mod.CinematicVideoScrubber
    ),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050608] text-white overflow-x-hidden">
      <CinematicVideoScrubber />
    </main>
  );
}
