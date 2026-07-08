import { useEffect, useRef } from "react";
import { ASSET_IMAGES } from "@/lib/assets";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay may be blocked; poster remains visible until interaction.
      });
    }
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={ASSET_IMAGES.hero}
        className="hero-video absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src="/bg_rwa.mp4" type="video/mp4" />
      </video>

      <div
        className="hero-video-fallback absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSET_IMAGES.hero})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,oklch(0.78_0.13_78/0.12),transparent_50%)]" />
    </div>
  );
}
