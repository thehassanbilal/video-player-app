"use client"

import LiveTVPlayer from "@/components/live-tv-player"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-6 pb-6 px-6">
      <LiveTVPlayer />
    </div>
  );
}
