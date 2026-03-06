import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STATUS_LABELS, formatPrice } from "../../utils/helpers";
import "./FilterSidebar.css";

const STATUSES = Object.keys(STATUS_LABELS);

export default function FilterSidebar({
  filters,
  onChange,
  meta, // { categories, tags, priceRange }
  isOpen,
  onClose,
  isMobile,
}) {
  const drawerRef = useRef(null);

  // Close on outside click (mobile)
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile, isOpen, onClose]);

  const set = useCallback(
    (key, value) => onChange((prev) => ({ ...prev, [key]: value })),
    [onChange],
  );

  const toggleSet = useCallback(
    (key, value) =>
      onChange((prev) => {
        const s = new Set(prev[key]);
        s.has(value) ? s.delete(value) : s.add(value);
        return { ...prev, [key]: s };
      }),
    [onChange],
  );

  const reset = useCallback(
    () =>
      onChange({
        categories: new Set(),
        tags: new Set(),
        statuses: new Set(),
        priceMin: "",
        priceMax: "",
        inStockOnly: false,
      }),
    [onChange],
  );

  const hasActive =
    filters.categories.size > 0 ||
    filters.tags.size > 0 ||
    filters.statuses.size > 0 ||
    filters.priceMin ||
    filters.priceMax ||
    filters.inStockOnly;

  const content = (
    <div className="filter-sidebar__inner">
      {/* Header */}
      <div className="filter-sidebar__head">
        <div>
          <span className="filter-sidebar__eyebrow">Refine</span>
          <h2 className="filter-sidebar__title">Filters</h2>
        </div>
        {hasActive && (
          <button className="filter-sidebar__reset" onClick={reset}>
            Clear all
          </button>
        )}
        {isMobile && (
          <button
            className="filter-sidebar__close"
            onClick={onClose}
            aria-label="Close filters"
          >
            ✕
          </button>
        )}
      </div>

      {/* In Stock */}
      <div className="filter-group">
        <label className="filter-toggle">
          <span className="filter-toggle__label">In Stock Only</span>
          <button
            role="switch"
            aria-checked={filters.inStockOnly}
            className={`toggle-switch ${filters.inStockOnly ? "toggle-switch--on" : ""}`}
            onClick={() => set("inStockOnly", !filters.inStockOnly)}
          >
            <span className="toggle-thumb" />
          </button>
        </label>
      </div>

      {/* Category */}
      {meta.categories.length > 0 && (
        <FilterSection title="Category">
          {meta.categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={filters.categories.has(cat)}
              onClick={() => toggleSet("categories", cat)}
            />
          ))}
        </FilterSection>
      )}

      {/* Status */}
      <FilterSection title="Status">
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            active={filters.statuses.has(s)}
            onClick={() => toggleSet("statuses", s)}
          />
        ))}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="filter-price">
          <div className="filter-price__field">
            <span className="filter-price__sym">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => set("priceMin", e.target.value)}
              className="filter-price__input"
              min={0}
            />
          </div>
          <span className="filter-price__sep">—</span>
          <div className="filter-price__field">
            <span className="filter-price__sym">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => set("priceMax", e.target.value)}
              className="filter-price__input"
              min={0}
            />
          </div>
        </div>
      </FilterSection>

      {/* Tags */}
      {meta.tags.length > 0 && (
        <FilterSection title="Tags">
          <div className="filter-tags">
            {meta.tags.map((tag) => (
              <FilterChip
                key={tag}
                label={tag}
                active={filters.tags.has(tag)}
                onClick={() => toggleSet("tags", tag)}
                small
              />
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="filter-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              ref={drawerRef}
              className="filter-sidebar filter-sidebar--drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "tween",
                duration: 0.32,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="filter-sidebar filter-sidebar--sticky">{content}</aside>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="filter-group">
      <div className="filter-group__title">{title}</div>
      <div className="filter-group__body">{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick, small }) {
  return (
    <button
      className={`filter-chip ${active ? "filter-chip--active" : ""} ${small ? "filter-chip--sm" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
