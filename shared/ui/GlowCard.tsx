"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
}

/**
 * GlowCard Component
 * 
 * A high-end, premium widget container that tracks the user's cursor
 * to display a subtle, dynamic radial hover glow effect.
 * Perfect for bento-grid cards and premium dashboard widgets.
 *
 * @example
 * ```tsx
 * <GlowCard glowColor="rgba(255,255,255,0.2)" glowSize={500}>
 *   <h3>Card Content</h3>
 * </GlowCard>
 * ```
 * 
 * @param children - The React node components to be wrapped inside the card
 * @param className - Optional CSS class strings for custom styling (e.g. padding, background, border)
 * @param glowColor - Custom color of the radial glow. Defaults to soft white overlay "rgba(255, 255, 255, 0.15)"
 * @param glowSize - The diameter size of the glow circle in pixels. Defaults to 600px.
 */
export const GlowCard = ({
  children,
  className = "",
  glowColor = "rgba(255, 255, 255, 0.15)",
  glowSize = 600,
  ...props
}: GlowCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px z-30 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${glowSize}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};
