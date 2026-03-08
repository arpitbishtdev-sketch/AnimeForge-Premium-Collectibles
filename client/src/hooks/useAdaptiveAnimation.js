import { useMemo } from "react";

/**
 * Adaptive animation strategy.
 *
 * Tier breakdown:
 *  reduced — user opted out of motion (OS setting)
 *  low     — genuinely weak device: < 2GB RAM AND <= 2 cores
 *  mid     — mid-range: < 4GB RAM or <= 4 cores (but not both)
 *  high    — everything else (most modern phones + all desktops)
 */
export function useAdaptiveAnimation() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        tier: "high",
        shouldAnimate: true,
        blurIntensity: 30,
        enableOrbs: true,
        enableGrain: true,
        durationScale: 1,
      };
    }

    // Respect OS "reduce motion" setting — this one we always honour
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

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSmallIOS = isIOS && window.screen.width <= 390;
    const memory = navigator.deviceMemory ?? (isSmallIOS ? 2 : 8);
    const cores = navigator.hardwareConcurrency ?? (isSmallIOS ? 2 : 8);

    // Low-end: genuinely weak — needs BOTH low memory AND low cores
    // This avoids flagging a 6-core laptop with no deviceMemory API support
    if (memory < 2 && cores <= 2) {
      return {
        tier: "low",
        shouldAnimate: true,
        blurIntensity: 8,
        enableOrbs: false,
        enableGrain: false,
        durationScale: 0.6,
      };
    }

    // Mid-tier: old phones / budget devices — only if BOTH signals agree
    if (memory < 3 && cores <= 4) {
      return {
        tier: "mid",
        shouldAnimate: true,
        blurIntensity: 20,
        enableOrbs: true,
        enableGrain: false,
        durationScale: 0.85,
      };
    }

    // High — everything else (modern phones, all desktops, unknowns)
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
