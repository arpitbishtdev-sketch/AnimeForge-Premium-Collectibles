export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export const STATUS_LABELS = {
  new: "New",
  popular: "Popular",
  rare: "Rare",
  featured: "Featured",
  bestseller: "Bestseller",
  "ultra-rare": "Ultra Rare",
};

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function createAbortableFetch() {
  const controller = new AbortController();

  return {
    fetch: (url, options = {}) =>
      fetch(url, { ...options, signal: controller.signal }),
    abort: () => controller.abort(),
  };
}
