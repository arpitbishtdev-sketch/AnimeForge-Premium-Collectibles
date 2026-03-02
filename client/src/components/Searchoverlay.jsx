import { useEffect, useRef, useState } from "react";
import "../styles/Search-overlay.css";

const TRENDING = [
  { label: "Naruto Sage Mode", tag: "Bestseller" },
  { label: "Gojo Satoru Infinity", tag: "New Drop" },
  { label: "Luffy Gear 5", tag: "Hot" },
  { label: "Spider-Man No Way Home", tag: "Limited" },
  { label: "Demon Slayer Tanjiro", tag: "Trending" },
  { label: "Attack on Titan Eren", tag: "Popular" },
  { label: "Dragon Ball Goku Ultra", tag: "Fan Pick" },
];

const SearchIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export default function SearchOverlay({
  isOpen,
  onClose,
  accentColor,
  accentGlow,
}) {
  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle open/close with animation timing
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Focus input after animation starts
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      // Let exit animation play before unmounting
      const t = setTimeout(() => {
        setVisible(false);
        setQuery("");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ESC key close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const filtered =
    query.length > 0
      ? TRENDING.filter((t) =>
          t.label.toLowerCase().includes(query.toLowerCase()),
        )
      : TRENDING;

  return (
    <div
      className={`search-overlay ${isOpen ? "open" : "closing"}`}
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{ "--accent-color": accentColor, "--accent-glow": accentGlow }}
    >
      {/* Noise texture layer */}
      <div className="search-overlay-grain" />

      {/* Modal panel */}
      <div className={`search-modal ${isOpen ? "open" : "closing"}`}>
        {/* Header row */}
        <div className="search-modal-header">
          <div className="search-modal-label">
            <span className="search-modal-label-dot" />
            SEARCH CATALOG
          </div>
          <button className="search-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Input area */}
        <div className={`search-input-wrap ${focused ? "focused" : ""}`}>
          <span className="search-input-icon">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search figures, characters..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            spellCheck={false}
          />
          {query.length > 0 && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              ✕
            </button>
          )}
          <div className="search-input-glow" />
        </div>

        {/* Divider */}
        <div className="search-divider">
          <div className="search-divider-line" />
          <span className="search-divider-label">
            {query.length > 0 ? `${filtered.length} results` : "Top Searches"}
          </span>
          <div className="search-divider-line search-divider-line--short" />
        </div>

        {/* Trending / results list */}
        <ul className="search-results-list">
          {filtered.length > 0 ? (
            filtered.map((item, i) => (
              <li key={item.label}>
                <button
                  className="search-result-item"
                  style={{ animationDelay: `${i * 0.045}s` }}
                  onClick={onClose}
                >
                  <span className="search-result-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="search-result-label">{item.label}</span>
                  <span className="search-result-tag">{item.tag}</span>
                  <span className="search-result-arrow">
                    <ArrowIcon />
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="search-no-results">
              <span>No results for </span>
              <strong>"{query}"</strong>
            </li>
          )}
        </ul>

        {/* Footer */}
        <div className="search-modal-footer">
          <span className="search-footer-hint">
            <kbd>ESC</kbd> to close · <kbd>↵</kbd> to search
          </span>
          <span className="search-footer-count">
            {TRENDING.length} items in catalog
          </span>
        </div>
      </div>
    </div>
  );
}
