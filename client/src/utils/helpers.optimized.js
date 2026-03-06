// ── Cached reduced-motion check ────────────────────────────────────────────
// WHY: Your existing prefersReducedMotion() calls matchMedia() fresh every
// invocation. Cache it + listen for OS changes mid-session.
let _rmCache = null;
export function prefersReducedMotion() {
  if (_rmCache !== null) return _rmCache;
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  _rmCache = mq.matches;
  mq.addEventListener("change", (e) => {
    _rmCache = e.matches;
  });
  return _rmCache;
}

// ── XSS-safe HTML sanitiser ────────────────────────────────────────────────
// WHY: product.description rendered via dangerouslySetInnerHTML without
// sanitisation = stored XSS. DOMParser whitelist needs zero external deps.
const ALLOWED = new Set([
  "b",
  "i",
  "em",
  "strong",
  "br",
  "p",
  "ul",
  "li",
  "ol",
  "span",
]);
export function sanitizeHTML(raw = "") {
  if (!raw || typeof window === "undefined") return raw;
  const doc = new DOMParser().parseFromString(raw, "text/html");
  doc.querySelectorAll("*").forEach((el) => {
    if (!ALLOWED.has(el.tagName.toLowerCase()))
      el.replaceWith(doc.createTextNode(el.textContent));
    [...el.attributes].forEach((a) => el.removeAttribute(a.name));
  });
  return doc.body.innerHTML;
}

// ── Abortable fetch ────────────────────────────────────────────────────────
// WHY: Store.jsx / useData hooks fire fetch with no cleanup.
// When user navigates away, the promise resolves and calls setState
// on unmounted component → React warning + memory leak.
//
// Usage:
//   const { fetch: sf, abort } = createAbortableFetch();
//   useEffect(() => { sf(url).then(...); return abort; }, []);
export function createAbortableFetch() {
  const ctrl = new AbortController();
  return {
    fetch: (url, opts = {}) => fetch(url, { ...opts, signal: ctrl.signal }),
    abort: () => ctrl.abort(),
  };
}

// ── Deduped fetch (fixes StrictMode double-invoke) ─────────────────────────
const _inflight = new Map();
export async function dedupedFetch(url, opts = {}) {
  const key = `${url}|${opts.method || "GET"}|${opts.body || ""}`;
  if (_inflight.has(key)) return _inflight.get(key);
  const p = fetch(url, opts)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .finally(() => _inflight.delete(key));
  _inflight.set(key, p);
  return p;
}

// ── Locale-aware price formatter ───────────────────────────────────────────
// WHY: PDP uses .replace(/[₹,]/g,"") which breaks for other currencies.
export function formatPrice(amount, currency = "INR", locale = "en-IN") {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// ── RAF throttle ───────────────────────────────────────────────────────────
// WHY: Encapsulates your Navbar's manual rafId pattern into a reusable util.
export function rafThrottle(fn) {
  let raf = null;
  const t = (...args) => {
    if (raf !== null) return;
    raf = requestAnimationFrame(() => {
      fn(...args);
      raf = null;
    });
  };
  t.cancel = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };
  return t;
}

export const debounce = (fn, wait = 200) => {
  let t;
  const d = (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), wait);
  };
  d.cancel = () => clearTimeout(t);
  return d;
};
