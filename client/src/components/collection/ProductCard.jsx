import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import StatusBadge from "../shared/StatusBadge";
import { formatPrice } from "../../utils/helpers";
import { flyToCart } from "../../utils/flyToCart";
import "./PC.css";

// Heart SVG icon — rendered inline for crisp control
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
  const [wishlisted, setWishlisted] = useState(false);
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

  const handleCardClick = useCallback(() => {
    navigate(`/product/${slug}`);
  }, [navigate, _id]);

  const handleWishlist = useCallback((e) => {
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  }, []);

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
    },
    [addToCart, _id, name, basePrice, images, category],
  );

  const handleBuyNow = useCallback(
    (e) => {
      e.stopPropagation();

      navigate(`/checkout?product=${slug}`);
    },
    [navigate, _id],
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

        {/* Category badge */}
        {category && <span className="product-card__badge">{category}</span>}

        {/* Heart wishlist button — ONLY icon, no text */}
        <button
          className={`product-card__wish${wishlisted ? " product-card__wish--active" : ""}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon />
        </button>

        {/* Out of stock overlay */}
        {isOOS && (
          <div className="product-card__oos-label">
            <span>Out of Stock</span>
          </div>
        )}

        {/* Stock remaining badge */}
        {!isOOS && stock <= 10 && (
          <span className="product-card__stock-dot">{stock} left</span>
        )}
      </div>

      {/* Body */}
      <div className="product-card__body">
        {/* Name */}
        <h3 className="product-card__name">{name}</h3>

        {/* Rating */}
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

        {/* Price */}
        <div className="product-card__price-row">
          <span className="product-card__price">
            ₹
            {formatPrice
              ? formatPrice(basePrice)
              : basePrice.toLocaleString("en-IN")}
          </span>
          {originalPrice && originalPrice > basePrice && (
            <span className="product-card__price-orig">
              ₹
              {formatPrice
                ? formatPrice(originalPrice)
                : originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          {discount && (
            <span className="product-card__discount">−{discount}%</span>
          )}
        </div>

        {/* Action buttons */}
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
