"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  /**
   * Content to reveal. Can be a React node or a render function that receives the visibility state.
   */
  children: React.ReactNode | ((isVisible: boolean) => React.ReactNode);
  /**
   * Additional classes for the wrapper.
   */
  className?: string;
  /**
   * Intersection observer threshold (0 to 1).
   */
  threshold?: number;
  /**
   * Intersection observer root margin.
   */
  rootMargin?: string;
  /**
   * Whether to trigger the animation only once.
   */
  once?: boolean;
  /**
   * Built-in animation presets.
   */
  animation?: "fade" | "slide-up" | "slide-left" | "slide-right" | "none";
  /**
   * Delay in milliseconds.
   */
  delay?: number;
  /**
   * Duration in milliseconds.
   */
  duration?: number;
}

/**
 * ScrollReveal Component
 * A high-performance wrapper that triggers entrance animations when scrolled into view.
 * Uses IntersectionObserver for optimal performance and supports staggered children.
 */
export const ScrollReveal = ({
  children,
  className,
  threshold = 0.05,
  rootMargin = "0px 0px -50px 0px",
  once = true,
  animation = "slide-up",
  delay = 0,
  duration = 700,
}: ScrollRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  const animations = {
    fade: isVisible ? "opacity-100" : "opacity-0",
    "slide-up": isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
    "slide-left": isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12",
    "slide-right": isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12",
    none: "",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all",
        animation !== "none" && animations[animation],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {typeof children === "function" ? children(isVisible) : children}
    </div>
  );
};
