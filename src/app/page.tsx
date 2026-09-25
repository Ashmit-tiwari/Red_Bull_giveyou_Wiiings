"use client";

import dynamic from "next/dynamic";

const VideoScrubber = dynamic(
  () =>
    import("../components/VideoScrubber").then((mod) => mod.VideoScrubber),
  { ssr: false }
);

export default function Home() {
  return <VideoScrubber />;
}
