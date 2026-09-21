"use client";

import Image from "next/image";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

/**
 * null = not yet known (SSR/first paint) — always render the static poster
 * in that case, so it (not the video) is the actual LCP element on every
 * device. Only mount the 6.8 MB video once resolved to a desktop viewport;
 * mobile visitors never download it at all.
 */
export default function HeroBackground() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? (
    // Video Background — preload=none delays the download until autoplay starts
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      poster="/assets/images/hero-poster.webp"
      className="absolute inset-0 z-0 w-full h-full object-cover"
    >
      <source src="/assets/video/banner-video.mp4" type="video/mp4" />
    </video>
  ) : (
    <Image
      src="/assets/images/hero-poster.webp"
      alt=""
      fill
      priority
      sizes="100vw"
      className="absolute inset-0 z-0 w-full h-full object-cover"
    />
  );
}
