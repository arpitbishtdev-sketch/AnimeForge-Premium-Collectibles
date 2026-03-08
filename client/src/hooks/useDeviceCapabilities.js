import { useState, useEffect, useMemo } from "react";

function detectStatic() {
  if (typeof window === "undefined")
    return {
      prefersReducedMotion: false,
      isLowEnd: false,
      isSlowNetwork: false,
      dpr: 1,
    };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const lowMemory =
    "deviceMemory" in navigator ? navigator.deviceMemory < 4 : false;
  const lowCPU =
    "hardwareConcurrency" in navigator
      ? navigator.hardwareConcurrency <= 4
      : false;
  const conn = navigator.connection || navigator.mozConnection || null;
  const isSlowNetwork = conn
    ? conn.saveData || ["slow-2g", "2g", "3g"].includes(conn.effectiveType)
    : false;
  const isLowEnd =
    prefersReducedMotion ||
    (lowMemory && lowCPU) ||
    (lowMemory && isSlowNetwork);

  return {
    prefersReducedMotion,
    isLowEnd,
    isSlowNetwork,
    dpr: window.devicePixelRatio || 1,
  };
}

export function useDeviceCapabilities() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
  );
  const staticCaps = useMemo(() => detectStatic(), []); // eslint-disable-line

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return useMemo(() => ({ ...staticCaps, isMobile }), [staticCaps, isMobile]);
}
