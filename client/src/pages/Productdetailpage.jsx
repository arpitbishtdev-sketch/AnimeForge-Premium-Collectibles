import { useRef, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { useProduct, useReviews, useCollections } from "../hooks/useData";
import { prefersReducedMotion } from "../utils/helpers";
import ImageGallery from "../components/product/ImageGallery";
import ReviewsSection from "../components/product/ReviewsSection";
import YouMayAlsoLike from "../components/product/YouMayAlsoLike";
import StatusBadge from "../components/shared/StatusBadge";
import StarRating from "../components/shared/StarRating";
import { ProductDetailSkeleton } from "../components/shared/Skeleton";
import "../styles/Productdetailpage.css";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

/* ─────────────────────────────────────────────────────
   Other Versions — your navigate logic + Loveable animations
───────────────────────────────────────────────────── */
// function OtherVersions({ product, siblings, accentColor }) {
//   const navigate = useNavigate();

//   if (!siblings || siblings.length === 0) return null;

//   const allVersions = [
//     {
//       _id: product._id,
//       slug: product.slug,
//       name: product.name,
//       basePrice: product.basePrice,
//       image: product.images?.[0]?.url || null,
//       isCurrent: true,
//     },
//     ...siblings.map((s) => ({ ...s, isCurrent: false })),
//   ];

//   return (
//     <motion.div
//       className="pdp-siblings"
//       initial={{ opacity: 0, y: 14 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.2 }}
//     >
//       <div className="pdp-siblings-header">
//         <span className="pdp-siblings-heading pdp-animate">Other Versions</span>
//         <div className="pdp-siblings-line" />
//       </div>
//       <div className="pdp-siblings-chips pdp-animate">
//         {allVersions.map((v, i) => (
//           <motion.button
//             key={v._id}
//             type="button"
//             className={`pdp-sibling-chip ${v.isCurrent ? "pdp-sibling-chip--active" : ""}`}
//             style={{ "--sibling-accent": accentColor }}
//             onClick={() => !v.isCurrent && navigate(`/product/${v.slug}`)}
//             title={`₹${Number(v.basePrice).toLocaleString("en-IN")}`}
//             initial={{ opacity: 0, scale: 0.92 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.35, delay: 0.25 + i * 0.06 }}
//             whileHover={!v.isCurrent ? { scale: 1.03, y: -2 } : {}}
//           >
//             <div className="pdp-sibling-chip__img">
//               {v.image ? (
//                 <img src={v.image} alt={v.name} />
//               ) : (
//                 <span style={{ fontSize: 20, opacity: 0.3 }}>🎴</span>
//               )}
//             </div>
//             <div className="pdp-sibling-chip__info">
//               <span className="pdp-sibling-chip__name">{v.name}</span>
//               <span className="pdp-sibling-chip__price">
//                 ₹{Number(v.basePrice).toLocaleString("en-IN")}
//               </span>
//             </div>
//             {v.isCurrent && <span className="pdp-sibling-chip__dot" />}
//           </motion.button>
//         ))}
//       </div>
//     </motion.div>
//   );
// }

function OtherVersions({ product, siblings, accentColor }) {
  const navigate = useNavigate();

  if (!siblings || siblings.length === 0) return null;

  const allVersions = [
    {
      _id: product._id,
      slug: product.slug,
      name: product.name,
      basePrice: product.basePrice,
      image: product.images?.[0]?.url || null,
      isCurrent: true,
    },
    ...siblings.map((s) => ({ ...s, isCurrent: false })),
  ];

  return (
    <motion.div
      className="pdp-siblings"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="pdp-siblings-header">
        <span className="pdp-siblings-heading pdp-animate">Other Versions</span>
        <div className="pdp-siblings-line" />
      </div>
      <div className="pdp-siblings-chips pdp-animate">
        {allVersions.map((v, i) => (
          <motion.button
            key={v._id}
            type="button"
            className={`pdp-sibling-chip ${v.isCurrent ? "pdp-sibling-chip--active" : ""}`}
            style={{ "--sibling-accent": accentColor }}
            onClick={() => !v.isCurrent && navigate(`/product/${v.slug}`)}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.25 + i * 0.06 }}
            whileHover={!v.isCurrent ? { scale: 1.03, y: -2 } : {}}
          >
            {/* Image */}
            <div className="pdp-sibling-chip__img">
              {v.image ? (
                <img src={v.image} alt={v.name} />
              ) : (
                <span style={{ fontSize: 20, opacity: 0.3 }}>🎴</span>
              )}
            </div>

            {/* Info */}
            <div className="pdp-sibling-chip__info">
              <span className="pdp-sibling-chip__name">{v.name}</span>
              <span className="pdp-sibling-chip__price">
                ₹{Number(v.basePrice).toLocaleString("en-IN")}
              </span>
              {!v.isCurrent && (
                <span className="pdp-sibling-chip__cta">View →</span>
              )}
            </div>

            {/* Current indicator */}
            {v.isCurrent && (
              <div className="pdp-sibling-chip__current">
                <span className="pdp-sibling-chip__dot" />
                <span className="pdp-sibling-chip__current-label">Current</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Variant Selector — your logic + Loveable animations
───────────────────────────────────────────────────── */
function VariantSelector({
  variants,
  basePrice,
  selectedVariant,
  onSelect,
  accentColor,
  // new props
  currentProduct,
  siblings,
  onNavigate,
}) {
  const validVariants = (variants || []).filter((v) =>
    v.value?.toString().trim(),
  );

  const groups = validVariants.reduce((acc, v) => {
    const key = v.type || "custom";
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  const TYPE_LABELS = {
    size: "📐  Size",
    color: "🎨  Color / Edition",
    material: "🧱  Material",
    custom: "✏️  Options",
  };

  const validGroups = Object.entries(groups).filter(([, items]) =>
    items.some((v) => v.value?.toString().trim()),
  );

  // Build sibling chips — current product + siblings as "Versions" group
  const hasSiblings = siblings && siblings.length > 0;
  const allVersions = hasSiblings
    ? [
        {
          _id: currentProduct._id,
          slug: currentProduct.slug,
          name: currentProduct.name,
          basePrice: currentProduct.basePrice,
          image: currentProduct.images?.[0]?.url || null,
          isCurrent: true,
        },
        ...siblings.map((s) => ({ ...s, isCurrent: false })),
      ]
    : [];

  // Nothing to show at all
  if (validGroups.length === 0 && !hasSiblings) return null;

  return (
    <motion.div
      className="pdp-variants"
      style={{ "--variant-accent": accentColor }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      <div className="pdp-variants-header">
        <span className="pdp-variants-heading">Options</span>
        <div className="pdp-variants-line" />
      </div>

      {/* ── Regular variant groups (size, color, etc.) ── */}
      {validGroups.map(([type, items], groupIdx) => {
        const validItems = items.filter((v) => v.value?.toString().trim());
        if (validItems.length === 0) return null;

        return (
          <motion.div
            key={type}
            className="pdp-variant-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + groupIdx * 0.08 }}
          >
            <span className="pdp-variant-group-label">
              {TYPE_LABELS[type] || type}
            </span>
            <div className="pdp-variant-chips">
              {/* Normal chip — main product, only in size group */}
              {type === "size" &&
                (() => {
                  const mainImg = currentProduct?.images?.[0]?.url;
                  const isNormalSelected = !selectedVariant;
                  return (
                    <motion.button
                      key="normal-chip"
                      type="button"
                      className={[
                        "pdp-variant-chip",
                        isNormalSelected ? "pdp-variant-chip--selected" : "",
                      ].join(" ")}
                      style={{ "--chip-accent": accentColor }}
                      onClick={() => onSelect(null)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.18 }}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {mainImg && (
                        <span className="pdp-variant-chip-img">
                          <img src={mainImg} alt="Normal" />
                        </span>
                      )}
                      <span className="pdp-variant-chip-label">Normal</span>
                    </motion.button>
                  );
                })()}
              {validItems.map((v, i) => {
                const isSelected =
                  selectedVariant?.value === v.value &&
                  selectedVariant?.type === v.type;
                const isOutOfStock = Number(v.stock) === 0;
                const finalPrice = basePrice + Number(v.priceModifier || 0);
                return (
                  <motion.button
                    key={i}
                    type="button"
                    className={[
                      "pdp-variant-chip",
                      isSelected ? "pdp-variant-chip--selected" : "",
                      isOutOfStock ? "pdp-variant-chip--soldout" : "",
                    ].join(" ")}
                    style={{ "--chip-accent": accentColor }}
                    onClick={() =>
                      !isOutOfStock && onSelect(isSelected ? null : v)
                    }
                    disabled={isOutOfStock}
                    title={
                      isOutOfStock
                        ? "Out of stock"
                        : `₹${finalPrice.toLocaleString("en-IN")}`
                    }
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                    whileHover={!isOutOfStock ? { scale: 1.04, y: -2 } : {}}
                    whileTap={!isOutOfStock ? { scale: 0.97 } : {}}
                  >
                    {/* variant image if exists */}
                    {(v.images?.[0]?.url || v.image?.url) && (
                      <span className="pdp-variant-chip-img">
                        <img
                          src={v.images?.[0]?.url || v.image?.url}
                          alt={v.value}
                        />
                      </span>
                    )}
                    <span className="pdp-variant-chip-label">{v.value}</span>
                    {Number(v.priceModifier) !== 0 && (
                      <span className="pdp-variant-chip-mod">
                        {Number(v.priceModifier) > 0 ? "+" : ""}₹
                        {Math.abs(Number(v.priceModifier)).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="pdp-variant-chip-out">sold out</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* ── Siblings as "Versions" group inside OPTIONS ── */}
      {/* ── Siblings merged into Color/Edition group ── */}
      {hasSiblings &&
        (() => {
          // Check if a "color" group already exists from variants
          const colorGroupExists = validGroups.some(([t]) => t === "color");

          return (
            <motion.div
              className="pdp-variant-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.15 + validGroups.length * 0.08,
              }}
            >
              <span className="pdp-variant-group-label">
                {colorGroupExists ? "🎴  Versions" : "🎨  Color / Edition"}
              </span>
              <div className="pdp-variant-chips">
                {allVersions.map((v, i) => (
                  <motion.button
                    key={v._id}
                    type="button"
                    className={[
                      "pdp-variant-chip pdp-variant-chip--version",
                      v.isCurrent ? "pdp-variant-chip--selected" : "",
                    ].join(" ")}
                    style={{ "--chip-accent": accentColor }}
                    onClick={() =>
                      !v.isCurrent && onNavigate(`/product/${v.slug}`)
                    }
                    disabled={v.isCurrent}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                    whileHover={!v.isCurrent ? { scale: 1.04, y: -2 } : {}}
                    whileTap={!v.isCurrent ? { scale: 0.97 } : {}}
                  >
                    {v.image && (
                      <span className="pdp-variant-chip-img">
                        <img src={v.image} alt={v.name} />
                      </span>
                    )}
                    <span className="pdp-variant-chip-label">{v.name}</span>
                    <span className="pdp-variant-chip-mod">
                      ₹{Number(v.basePrice).toLocaleString("en-IN")}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          );
        })()}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Main Page — 100% your logic, untouched
───────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
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
  const { addToCart } = useCart();

  const [cartAdded, setCartAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const accentColor =
    product?.themeColor || activeCharacter?.gradient?.accent || "#7c5cff";

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    if (!selectedVariant) return product.basePrice;
    return product.basePrice + Number(selectedVariant.priceModifier || 0);
  }, [product, selectedVariant]);

  const displayTitle = useMemo(() => {
    if (!product) return "";
    if (selectedVariant?.title?.trim()) return selectedVariant.title;
    return product.name;
  }, [product, selectedVariant]);

  const displayDescription = useMemo(() => {
    if (!product) return "";
    if (selectedVariant?.description?.trim())
      return selectedVariant.description;
    return product.description;
  }, [product, selectedVariant]);

  const displayTags = useMemo(() => {
    if (!product) return [];
    if (selectedVariant?.tags?.length) return selectedVariant.tags;
    return product.tags || [];
  }, [product, selectedVariant]);

  useEffect(() => {
    setSelectedVariant(null);
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart({
      id: product._id,
      name:
        product.name + (selectedVariant ? ` (${selectedVariant.value})` : ""),
      price: displayPrice,
      image: product.images?.[0]?.url || null,
      category: product.category || "",
      quantity: 1,
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1800);
  };

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        product: {
          id: product._id,
          name:
            product.name +
            (selectedVariant ? ` (${selectedVariant.value})` : ""),
          universe: product.category || product.tags?.[0] || "Limited Edition",
          price: displayPrice,
          image: product.images?.[0]?.url || null,
          scale: product.scale || "1/6",
          material: product.material || "Premium Resin",
        },
        accent: accentColor,
        glow: activeCharacter?.gradient?.glow || "rgba(124,92,255,0.3)",
      },
    });
  };

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
    const siblingIds = new Set((product.siblings || []).map((s) => s._id));
    return allProducts
      .filter(
        (p) =>
          p._id !== product._id &&
          !siblingIds.has(p._id) &&
          p.isActive !== false &&
          (p.category === product.category ||
            p.tags?.some((t) => product.tags?.includes(t))),
      )
      .slice(0, 8);
  }, [product, allProducts]);

  const stockStatus = useMemo(() => {
    if (!product) return null;
    const qty = selectedVariant ? Number(selectedVariant.stock) : product.stock;
    if (qty === 0) return { label: "Sold Out", cls: "stock--out" };
    if (qty <= 5) return { label: `Only ${qty} left`, cls: "stock--low" };
    return { label: "In Stock", cls: "stock--in" };
  }, [product, selectedVariant]);

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
              {/* Gallery */}
              <motion.div
                className="pdp-gallery-col"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <ImageGallery
                  images={
                    selectedVariant?.images?.length
                      ? selectedVariant.images
                      : selectedVariant?.image?.url
                        ? [
                            {
                              url: selectedVariant.image.url,
                              public_id: selectedVariant.image.public_id,
                            },
                          ]
                        : product.images || []
                  }
                  name={product.name}
                />
              </motion.div>

              {/* Info */}
              <div
                className="pdp-info-col"
                ref={infoRef}
                style={{ "--pdp-accent": accentColor }}
              >
                <div className="pdp-top-row pdp-animate">
                  {product.category && (
                    <span className="pdp-category">{product.category}</span>
                  )}
                  <StatusBadge
                    status={product.status}
                    themeColor={product.themeColor}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.h1
                    key={displayTitle}
                    className="pdp-name pdp-animate"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {displayTitle}
                  </motion.h1>
                </AnimatePresence>

                <div className="pdp-rating pdp-animate">
                  <StarRating
                    rating={product.averageRating || 0}
                    count={product.reviewCount || reviews.length || 0}
                    size="md"
                  />
                </div>

                <div className="pdp-rule pdp-animate">
                  <div className="pdp-rule__line" />
                  <div className="pdp-rule__diamond" />
                  <div className="pdp-rule__line pdp-rule__line--short" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={displayDescription}
                    className="pdp-description pdp-animate"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {displayDescription}
                  </motion.p>
                </AnimatePresence>

                <div className="pdp-price-row pdp-animate">
                  <span className="pdp-price-currency">&#8377;</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={displayPrice}
                      className="pdp-price"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22 }}
                    >
                      {String(displayPrice).replace(/[₹,]/g, "")}
                    </motion.span>
                  </AnimatePresence>
                  <div className="pdp-price-meta">
                    <span className="pdp-price-label">
                      {selectedVariant
                        ? `${selectedVariant.value} · Price`
                        : "Base Price"}
                    </span>
                    <span className="pdp-price-shipping">
                      Free Shipping · All India
                    </span>
                  </div>
                </div>

                {stockStatus && (
                  <div className={`pdp-stock pdp-animate ${stockStatus.cls}`}>
                    <span className="pdp-stock__dot" />
                    <span className="pdp-stock__label">
                      {stockStatus.label}
                    </span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {displayTags.length > 0 && (
                    <motion.div
                      key={displayTags.join(",")}
                      className="pdp-tags pdp-animate"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                    >
                      {displayTags.map((t) => (
                        <span key={t} className="pdp-tag">
                          {t}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <VariantSelector
                  variants={product.variants || []}
                  basePrice={product.basePrice}
                  selectedVariant={selectedVariant}
                  onSelect={setSelectedVariant}
                  accentColor={accentColor}
                  currentProduct={product}
                  siblings={product.siblings}
                  onNavigate={navigate}
                />

                {/* CTA */}
                <div className="pdp-cta pdp-animate">
                  <button
                    className={`pdp-btn-cart${cartAdded ? " pdp-btn-cart--added" : ""}`}
                    disabled={product.stock === 0}
                    style={{ "--btn-bg": accentColor }}
                    onClick={handleAddToCart}
                  >
                    <AnimatePresence mode="wait">
                      {cartAdded ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <span>✓</span> Added!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <span>
                            {product.stock === 0 ? "Sold Out" : "Add to Cart"}
                          </span>
                          {product.stock > 0 && (
                            <span className="pdp-btn-cart__arrow">→</span>
                          )}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  {product.stock > 0 && (
                    <button
                      className="pdp-btn-buy-now"
                      style={{ "--btn-accent": accentColor }}
                      onClick={handleBuyNow}
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

          <div className="pdp-inner">
            <ReviewsSection
              slug={slug}
              reviews={reviews}
              loading={revLoading}
              error={revError}
              addOptimistic={addOptimistic}
            />
          </div>

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
