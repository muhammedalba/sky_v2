"use client";

import { useReportWebVitals } from "next/web-vitals";

export default function PerformanceMonitor({
  debugMode = false,
}: {
  debugMode: boolean;
}) {
  useReportWebVitals((metric) => {
    // Only log in development mode to avoid cluttering production
    // if (process.env.NODE_ENV === "development") {
    if (debugMode) {
      const timeInMs = Math.round(metric.value);
      let speedStatus = "🟢 Fast";

      switch (metric.name) {
        case "TTFB": // Time to First Byte (Backend & Network speed)
          if (timeInMs > 200) speedStatus = "🟡 Avg";
          if (timeInMs > 600) speedStatus = "🔴 Slow";
          break;
        case "FCP": // First Contentful Paint (Initial rendering)
          if (timeInMs > 1800) speedStatus = "🟡 Avg";
          if (timeInMs > 3000) speedStatus = "🔴 Slow";
          break;
        case "LCP": // Largest Contentful Paint (Main content loaded)
          if (timeInMs > 2500) speedStatus = "🟡 Avg";
          if (timeInMs > 4000) speedStatus = "🔴 Slow";
          break;
        case "Next.js-route-change-to-render": // Soft navigation speed
          speedStatus = timeInMs > 500 ? "🔴 Slow" : "🟢 Fast";
          console.log(`[Router] Route Change: ${timeInMs}ms ${speedStatus}`);
          return;
      }

      console.log(
        `[Web Vitals] Router is ${metric?.entries[0]?.name?.slice(21) ?? ""} --> name: ${metric.name} --> time: ${timeInMs}ms --> status: ${speedStatus}`,
      );
    }
  });

  return null;
}
