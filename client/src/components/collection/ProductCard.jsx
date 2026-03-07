import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import StatusBadge from "../shared/StatusBadge";
import { formatPrice } from "../../utils/helpers";
import { flyToCart } from "../../utils/flyToCart";
import { useWishlist } from "../../context/WishlistContext";
import "./PC.css";

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  );
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return "★";
    if (i === full && half) return "½";
    return "☆";
  }).join("");
  return <span className="product-card__stars">{stars}</span>;
}

export default function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [added, setAdded] = useState(false);

  const {
    _id,
    slug,
    name,
    category,
    images,
    basePrice,
    originalPrice,
    averageRating,
    reviewCount,
    stock,
    status,
  } = product;

  const isOOS = stock <= 0;
  const discount =
    originalPrice && originalPrice > basePrice
      ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
      : null;

  // Format price safely — avoid double ₹ if formatPrice already includes symbol
  const formatSafePrice = (price) => {
    if (!price && price !== 0) return "0";
    const formatted = formatPrice
      ? formatPrice(price)
      : price.toLocaleString("en-IN");
    // Strip any leading ₹ from formatPrice result since we prepend it manually
    return String(formatted).replace(/^₹/, "");
  };

  const handleCardClick = useCallback(() => {
    navigate(`/product/${slug}`);
  }, [navigate, slug]);

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      toggleWishlist({
        id: _id,
        name,
        price: basePrice,
        image: images?.[0]?.url,
        category,
      });
    },
    [toggleWishlist, _id, name, basePrice, images, category],
  );

  const handleAddToCart = useCallback(
    (e) => {
      e.stopPropagation();
      const img = e.currentTarget.closest(".product-card").querySelector("img");
      const cart = document.querySelector(
        ".navbar-icon-btn[aria-label='Cart']",
      );
      flyToCart(img, cart);
      addToCart({
        id: _id,
        name,
        price: basePrice,
        image: images?.[0]?.url,
        category,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    },
    [addToCart, _id, name, basePrice, images, category],
  );

  const handleBuyNow = useCallback(
    (e) => {
      e.stopPropagation();
      navigate("/checkout", {
        state: {
          product: {
            id: _id,
            name: name,
            universe: category || "Limited Edition",
            price: basePrice,
            image: images?.[0]?.url || null,
            scale: product.scale || "1/6",
            material: product.material || "Premium Resin",
          },
          accent: product.themeColor || "#ff8c00",
          glow: `${product.themeColor || "#ff8c00"}66`,
        },
      });
    },
    [navigate, _id, name, category, basePrice, images, product],
  );

  return (
    <article
      className={`product-card${isOOS ? " product-card--oos" : ""}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      aria-label={`View ${name}`}
      style={{
        animationDelay: `${index * 40}ms`,
        "--card-accent": product.themeColor || "#e8a838",
      }}
    >
      {/* Image */}
      <div className="product-card__img-wrap">
        {/* Status badge only — category badge removed */}
        {status && (
          <StatusBadge status={status} themeColor={product.themeColor} />
        )}

        {images?.[0]?.url ? (
          <img
            className="product-card__img"
            src={images[0].url}
            alt={name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="product-card__img"
            style={{ background: "rgba(30,20,10,0.8)" }}
          />
        )}

        {/* Category badge REMOVED — was causing double label with status */}

        <button
          className={`product-card__wish${
            isWishlisted(_id) ? " product-card__wish--active" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            isWishlisted(_id) ? "Remove from wishlist" : "Add to wishlist"
          }
          title={isWishlisted(_id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon />
        </button>

        {isOOS && (
          <div className="product-card__oos-label">
            <span>Out of Stock</span>
          </div>
        )}

        {!isOOS && stock <= 10 && (
          <span className="product-card__stock-dot">{stock} left</span>
        )}
      </div>

      {/* Body */}
      <div className="product-card__body">
        {/* Category shown as subtle text label here instead */}
        {category && (
          <span className="product-card__category-label">{category}</span>
        )}

        <h3 className="product-card__name">{name}</h3>

        {averageRating > 0 && (
          <div className="product-card__meta">
            <StarRating rating={averageRating} />
            <span className="product-card__rating">
              {averageRating.toFixed(1)}
            </span>
            {reviewCount > 0 && (
              <span className="product-card__reviews">({reviewCount})</span>
            )}
          </div>
        )}

        <div className="product-card__price-row">
          <span className="product-card__price">
            ₹{formatSafePrice(basePrice)}
          </span>
          {originalPrice && originalPrice > basePrice && (
            <span className="product-card__price-orig">
              ₹{formatSafePrice(originalPrice)}
            </span>
          )}
          {discount && (
            <span className="product-card__discount">−{discount}%</span>
          )}
        </div>

        <div className="product-card__actions">
          <button
            className={`product-card__btn-cart ${added ? "added" : ""}`}
            onClick={handleAddToCart}
            disabled={isOOS}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
          <button
            className="product-card__btn-buy"
            onClick={handleBuyNow}
            disabled={isOOS}
            aria-label="Buy now"
          >
            Buy Now →
          </button>
        </div>
      </div>
    </article>
  );
}
