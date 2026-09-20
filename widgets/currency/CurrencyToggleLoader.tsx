"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// `ssr: false` is only valid from a Client Component, so this thin wrapper is
// what the (server) store layout renders — it keeps CurrencyToggleButton (and
// everything it pulls in) out of the server-rendered HTML and initial bundle.
const CurrencyToggleButton = dynamic(() => import("./CurrencyToggleButton"), { ssr: false });

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void) => number;
  cancelIdleCallback?: (id: number) => void;
};

/** True once the browser has an idle moment, so this non-critical widget never competes with initial page rendering. */
function useIdle() {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const win = window as IdleWindow;
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setIdle(true));
      return () => win.cancelIdleCallback?.(id);
    }
    const timer = setTimeout(() => setIdle(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return idle;
}

export default function CurrencyToggleLoader() {
  const isIdle = useIdle();
  if (!isIdle) return null;
  return <CurrencyToggleButton />;
}
