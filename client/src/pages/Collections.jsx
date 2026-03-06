import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useCollections } from "../hooks/useData";
import ProductCard from "../components/collection/ProductCard";
import FilterSidebar from "../components/collection/FilterSidebar";
import { ProductCardSkeleton } from "../components/shared/Skeleton";
import { prefersReducedMotion } from "../utils/helpers";
import "../styles/CollectionPage.css";

import { useTheme } from "../context/ThemeContext";

const DEFAULT_FILTERS = {
  categories: new Set(),
  tags: new Set(),
  statuses: new Set(),
  priceMin: "",
  priceMax: "",
  inStockOnly: false,
};

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export default function Collections() {
  const { activeCharacter } = useTheme();

  const accentColor = activeCharacter.gradient.accent;
  const accentGlow = activeCharacter.gradient.glow;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { products, loading, error } = useCollections({
    search: searchQuery,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("default");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const pageRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Page entrance
  useEffect(() => {
    if (loading || prefersReducedMotion()) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6 },
      );
    }
  }, [loading]);

  useEffect(() => {
    if (!pageRef.current) return;

    gsap.to(pageRef.current, {
      "--collection-accent": accentColor,
      duration: 0.6,
      ease: "power2.out",
    });

    pageRef.current.style.setProperty("--collection-accent", accentColor);
    pageRef.current.style.setProperty("--collection-glow", accentGlow);
  }, [accentColor, accentGlow]);

  // Derive meta (categories, tags, price bounds) from full product list
  const meta = useMemo(() => {
    const cats = new Set();
    const tags = new Set();
    let pMin = Infinity,
      pMax = 0;

    products.forEach((p) => {
      if (p.category) cats.add(p.category);
      p.tags?.forEach((t) => tags.add(t));
      if (p.basePrice < pMin) pMin = p.basePrice;
      if (p.basePrice > pMax) pMax = p.basePrice;
    });

    return {
      categories: [...cats].sort(),
      tags: [...tags].sort(),
      priceRange: [pMin === Infinity ? 0 : pMin, pMax],
    };
  }, [products]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (filters.inStockOnly) list = list.filter((p) => p.stock > 0);
    if (filters.categories.size > 0)
      list = list.filter((p) => filters.categories.has(p.category));
    if (filters.statuses.size > 0)
      list = list.filter((p) => filters.statuses.has(p.status));
    if (filters.tags.size > 0)
      list = list.filter((p) => p.tags?.some((t) => filters.tags.has(t)));
    if (filters.priceMin !== "")
      list = list.filter((p) => p.basePrice >= Number(filters.priceMin));
    if (filters.priceMax !== "")
      list = list.filter((p) => p.basePrice <= Number(filters.priceMax));

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.basePrice - b.basePrice);
      case "price-desc":
        return [...list].sort((a, b) => b.basePrice - a.basePrice);
      case "rating":
        return [...list].sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
        );
      case "newest":
        return [...list].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      default:
        return list;
    }
  }, [products, filters, sort, searchQuery]);

  const handleFiltersChange = useCallback((updater) => {
    setFilters(typeof updater === "function" ? updater : () => updater);
  }, []);

  const handleSort = useCallback((e) => setSort(e.target.value), []);

  if (error) {
    return (
      <div className="collection-error">
        <span className="collection-error__icon">✦</span>
        <p>Failed to load collections</p>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div
      className="collection-page"
      ref={pageRef}
      style={{
        "--accent": accentColor,
        "--accent-glow": accentGlow,
      }}
    >
      <div className="grain-overlay" />

      {/* Header */}
      <header className="collection-header" ref={headerRef}>
        <div className="collection-header__inner">
          <div className="collection-header__text">
            <span className="collection-header__eyebrow">Limited Edition</span>
            <h1 className="collection-header__title">Collections</h1>
            <p className="collection-header__sub">
              Premium anime collectibles, meticulously crafted for true fans.
            </p>
          </div>
          <div className="collection-header__line" />
        </div>
      </header>

      <div className="collection-layout">
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={handleFiltersChange}
          meta={meta}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          isMobile={isMobile}
        />

        {/* Main */}
        <main className="collection-main">
          {/* Toolbar */}
          <div className="collection-toolbar">
            {isMobile && (
              <button
                className="toolbar-filter-btn"
                onClick={() => setDrawerOpen(true)}
              >
                <span>⊟</span>
                <span>Filters</span>
                {(filters.categories.size +
                  filters.statuses.size +
                  filters.tags.size >
                  0 ||
                  filters.inStockOnly) && (
                  <span className="toolbar-filter-badge" />
                )}
              </button>
            )}

            <span className="toolbar-count">
              {loading ? "—" : `${filtered.length} items`}
            </span>

            <div className="toolbar-sort">
              <label className="toolbar-sort__label" htmlFor="sort-select">
                Sort
              </label>
              <select
                id="sort-select"
                className="toolbar-sort__select"
                value={sort}
                onChange={handleSort}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="collection-grid" ref={gridRef}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : filtered.length === 0 ? (
              <div className="collection-empty">
                <span className="collection-empty__icon">✦</span>
                <p>No products match your filters.</p>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="collection-empty__btn"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filtered.map((p, i) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  index={i}
                  accentColor={p.themeColor}
                  soldOut={p.stock === 0}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
