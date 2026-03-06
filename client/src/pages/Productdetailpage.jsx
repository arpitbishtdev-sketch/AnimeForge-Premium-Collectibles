import { useRef, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { useProduct, useReviews, useCollections } from "../hooks/useData";
import { formatPrice, prefersReducedMotion } from "../utils/helpers";
import ImageGallery from "../components/product/ImageGallery";
import ReviewsSection from "../components/product/ReviewsSection";
import YouMayAlsoLike from "../components/product/YouMayAlsoLike";
import StatusBadge from "../components/shared/StatusBadge";
import StarRating from "../components/shared/StarRating";
import { ProductDetailSkeleton } from "../components/shared/Skeleton";
import "../styles/ProductDetailPage.css";

import { useTheme } from "../context/ThemeContext";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { product, loading, error } = useProduct(slug);
  const {
    reviews,
    loading: revLoading,
    error: revError,
    addOptimistic,
  } = useReviews(slug);
  const { products: allProducts } = useCollections();
  const infoRef = useRef(null);

  const { activeCharacter } = useTheme();

  const accentColor =
    product?.themeColor || activeCharacter?.gradient?.accent || "#7c5cff";

  useEffect(() => {
    if (loading || !product || prefersReducedMotion()) return;
    if (!infoRef.current) return;
    const els = infoRef.current.querySelectorAll(".pdp-animate");
    gsap.fromTo(
      els,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: "power3.out",
        delay: 0.15,
      },
    );
  }, [loading, product]);

  const related = useMemo(() => {
    if (!product || !allProducts.length) return [];
    return allProducts
      .filter(
        (p) =>
          p._id !== product._id &&
          p.isActive !== false &&
          (p.category === product.category ||
            p.tags?.some((t) => product.tags?.includes(t))),
      )
      .slice(0, 8);
  }, [product, allProducts]);

  const stockStatus = useMemo(() => {
    if (!product) return null;
    if (product.stock === 0) return { label: "Sold Out", cls: "stock--out" };
    if (product.stock <= 5)
      return { label: `Only ${product.stock} left`, cls: "stock--low" };
    return { label: "In Stock", cls: "stock--in" };
  }, [product]);

  if (error) {
    return (
      <div className="pdp-error">
        <span>✦</span>
        <p>Product not found</p>
        <Link to="/collections" className="pdp-error__link">
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="pdp">
      <div className="grain-overlay" />

      {/* Breadcrumb */}
      <nav className="pdp-breadcrumb">
        <Link to="/" className="pdp-breadcrumb__link">
          Home
        </Link>
        <span className="pdp-breadcrumb__sep">›</span>
        <Link to="/collections" className="pdp-breadcrumb__link">
          Collections
        </Link>
        {product && (
          <>
            <span className="pdp-breadcrumb__sep">›</span>
            <span className="pdp-breadcrumb__current">{product.name}</span>
          </>
        )}
      </nav>

      {loading ? (
        <div className="pdp-inner">
          <ProductDetailSkeleton />
        </div>
      ) : (
        <>
          <div className="pdp-inner">
            <div className="pdp-layout">
              {/* Gallery column */}
              <motion.div
                className="pdp-gallery-col"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <ImageGallery
                  images={product.images || []}
                  name={product.name}
                />
              </motion.div>

              {/* Info column */}
              <div
                className="pdp-info-col"
                ref={infoRef}
                style={{
                  "--pdp-accent": accentColor,
                }}
              >
                {/* Category + badge */}
                <div className="pdp-top-row pdp-animate">
                  {product.category && (
                    <span className="pdp-category">{product.category}</span>
                  )}
                  <StatusBadge
                    status={product.status}
                    themeColor={product.themeColor}
                  />
                </div>

                {/* Title */}
                <h1 className="pdp-name pdp-animate">{product.name}</h1>

                {/* Rating */}
                <div className="pdp-rating pdp-animate">
                  <StarRating
                    rating={product.averageRating || 0}
                    count={product.reviewCount || reviews.length || 0}
                    size="md"
                  />
                </div>

                {/* Decorative rule */}
                <div className="pdp-rule pdp-animate">
                  <div className="pdp-rule__line" />
                  <div className="pdp-rule__diamond" />
                  <div className="pdp-rule__line pdp-rule__line--short" />
                </div>

                {/* Description */}
                <p className="pdp-description pdp-animate">
                  {product.description}
                </p>

                {/* Price */}
                <div className="pdp-price-row pdp-animate">
                  <span className="pdp-price-currency">&#8377;</span>
                  <span className="pdp-price">
                    {String(product.basePrice).replace(/[₹,]/g, "")}
                  </span>
                  <div className="pdp-price-meta">
                    <span className="pdp-price-label">Base Price</span>
                    <span className="pdp-price-shipping">
                      Free Shipping · All India
                    </span>
                  </div>
                </div>

                {/* Stock */}
                {stockStatus && (
                  <div className={`pdp-stock pdp-animate ${stockStatus.cls}`}>
                    <span className="pdp-stock__dot" />
                    <span className="pdp-stock__label">
                      {stockStatus.label}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {product.tags?.length > 0 && (
                  <div className="pdp-tags pdp-animate">
                    {product.tags.map((t) => (
                      <span key={t} className="pdp-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="pdp-cta pdp-animate">
                  <button
                    className="pdp-btn-cart"
                    disabled={product.stock === 0}
                    style={{ "--btn-bg": accentColor }}
                  >
                    <span>
                      {product.stock === 0 ? "Sold Out" : "Add to Cart"}
                    </span>
                    {product.stock > 0 && (
                      <span className="pdp-btn-cart__arrow">→</span>
                    )}
                  </button>

                  {product.stock > 0 && (
                    <button
                      className="pdp-btn-buy-now"
                      style={{ "--btn-accent": accentColor }}
                    >
                      <span>Buy Now</span>
                    </button>
                  )}

                  <button className="pdp-btn-wish" aria-label="Add to wishlist">
                    <svg
                      viewBox="0 0 24 24"
                      width="17"
                      height="17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* Trust strip */}
                <div className="pdp-meta-strip pdp-animate">
                  <div className="pdp-meta-item">
                    <span className="pdp-meta-icon">✦</span>
                    <span>Premium Quality</span>
                  </div>
                  <div className="pdp-meta-item">
                    <span className="pdp-meta-icon">⟳</span>
                    <span>30-Day Returns</span>
                  </div>
                  <div className="pdp-meta-item">
                    <span className="pdp-meta-icon">◎</span>
                    <span>Authenticity Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="pdp-inner">
            <ReviewsSection
              slug={slug}
              reviews={reviews}
              loading={revLoading}
              error={revError}
              addOptimistic={addOptimistic}
            />
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="pdp-inner">
              <YouMayAlsoLike products={related} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
