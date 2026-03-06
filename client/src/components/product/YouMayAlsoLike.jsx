import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatPrice } from "../../utils/helpers";
import StatusBadge from "../shared/StatusBadge";
import StarRating from "../shared/StarRating";
import "./YouMayAlsoLike.css";

function RelatedCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.44,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ "--card-accent": product.themeColor || "var(--accent)" }}
    >
      <Link to={`/product/${product.slug}`} className="rc2">
        <div className="rc2__img-wrap">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              loading="lazy"
              className="rc2__img"
            />
          ) : (
            <div className="rc2__placeholder">✦</div>
          )}
          <div className="rc2__badge">
            <StatusBadge
              status={product.status}
              themeColor={product.themeColor}
            />
          </div>
        </div>
        <div className="rc2__body">
          <p className="rc2__name">{product.name}</p>
          <div className="rc2__foot">
            <StarRating rating={product.averageRating || 0} size="sm" />
            <span className="rc2__price">
              {formatPrice(product.basePrice || 0)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function YouMayAlsoLike({ products = [] }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    checkScroll();

    const handler = () => checkScroll();
    el.addEventListener("scroll", handler, { passive: true });

    return () => el.removeEventListener("scroll", handler);
  }, [products]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <>
      <section className="ymal2">
        <div className="ymal2__head">
          <div>
            <span className="ymal2__eyebrow">Discover More</span>
            <h2 className="ymal2__title">You May Also Like</h2>
          </div>
          <div className="ymal2__nav">
            <button
              className="ymal2__btn"
              onClick={() => scroll(-1)}
              disabled={!canLeft}
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              className="ymal2__btn"
              onClick={() => scroll(1)}
              disabled={!canRight}
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        <div className="ymal2__track-wrap">
          <div className="ymal2__track" ref={trackRef}>
            {products.map((p, i) => (
              <RelatedCard key={p._id} product={p} index={i} />
            ))}
          </div>
          {canLeft && <div className="ymal2__fade ymal2__fade--left" />}
          {canRight && <div className="ymal2__fade ymal2__fade--right" />}
        </div>
      </section>
    </>
  );
}
