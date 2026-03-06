// src/hooks/useAdaptiveAnimation.js
import { useMemo } from "react";

/**
 * Adaptive animation strategy — mirrors what large tech companies do.
 * Returns a capability profile so components can gate expensive effects.
 */
export function useAdaptiveAnimation() {
  return useMemo(() => {
    // SSR guard
    if (typeof window === "undefined") {
      return {
        tier: "reduced",
        shouldAnimate: false,
        blurIntensity: 0,
        enableOrbs: false,
        enableGrain: false,
        durationScale: 0,
      };
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      return {
        tier: "reduced",
        shouldAnimate: false,
        blurIntensity: 4,
        enableOrbs: false,
        enableGrain: false,
        durationScale: 0,
      };
    }

    // Device memory API (Chrome only, degrades gracefully)
    const memory = navigator.deviceMemory ?? 4; // default 4GB if unsupported
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 4;
    const isSmallScreen = window.innerWidth < 768;
    const isMid = window.innerWidth < 1024;

    // Low-end: < 2GB RAM or <= 2 cores or small screen
    if (memory < 2 || hardwareConcurrency <= 2 || isSmallScreen) {
      return {
        tier: "low",
        shouldAnimate: true,
        blurIntensity: 8,
        enableOrbs: false,
        enableGrain: false,
        durationScale: 0.6,
      };
    }

    // Mid-tier
    if (memory < 4 || hardwareConcurrency <= 4 || isMid) {
      return {
        tier: "mid",
        shouldAnimate: true,
        blurIntensity: 20,
        enableOrbs: true,
        enableGrain: false,
        durationScale: 0.8,
      };
    }

    // High-end
    return {
      tier: "high",
      shouldAnimate: true,
      blurIntensity: 30,
      enableOrbs: true,
      enableGrain: true,
      durationScale: 1,
    };
  }, []);
}
