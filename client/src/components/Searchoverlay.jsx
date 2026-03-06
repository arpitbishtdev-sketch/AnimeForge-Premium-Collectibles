import { useEffect, useRef, useState } from "react";
import "../styles/Search-overlay.css";

import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

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
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const trimmed = query.trim();
        const data = await api.getCollections({
          search: trimmed,
        });
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

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
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                navigate(`/collections?search=${query.trim()}`);
                onClose();
              }
            }}
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
            {query.length > 0
              ? loading
                ? "Searching..."
                : `${results.length} results`
              : "Start typing to search"}
          </span>
          <div className="search-divider-line search-divider-line--short" />
        </div>

        {/* Trending / results list */}
        <ul className="search-results-list">
          {loading ? (
            <li className="search-no-results">Searching...</li>
          ) : results.length > 0 ? (
            results.map((product, i) => (
              <li key={product._id}>
                <button
                  className="search-result-item"
                  style={{ animationDelay: `${i * 0.045}s` }}
                  onClick={() => {
                    navigate(`/product/${product.slug}`);
                    onClose();
                  }}
                >
                  <span className="search-result-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <img
                    src={product.images?.[0]?.url || "/placeholder.webp"}
                    alt={product.name}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginRight: 10,
                    }}
                  />

                  <span className="search-result-label">{product.name}</span>

                  <span className="search-result-arrow">
                    <ArrowIcon />
                  </span>
                </button>
              </li>
            ))
          ) : query ? (
            <li className="search-no-results">
              No results for <strong>"{query}"</strong>
            </li>
          ) : null}
        </ul>

        {/* Footer */}
        <div className="search-modal-footer">
          <span className="search-footer-hint">
            <kbd>ESC</kbd> to close · <kbd>↵</kbd> to search
          </span>
          <span className="search-footer-count">{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
