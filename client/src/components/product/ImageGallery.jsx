import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import "./ImageGallery.css";

const imgVariants = {
  enter: (d) => ({
    opacity: 0,
    x: d * 20,
    scale: 0.98,
    filter: "blur(4px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (d) => ({
    opacity: 0,
    x: d * -12,
    scale: 0.99,
    filter: "blur(2px)",
  }),
};

export default function ImageGallery({ images = [], name }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const imgRef = useRef(null);

  const select = useCallback(
    (idx) => {
      setDirection(idx > activeIdx ? 1 : -1);
      setActiveIdx(idx);
    },
    [activeIdx],
  );

  const active = images[activeIdx];

  useEffect(() => {
    const handleKey = (e) => {
      if (!images.length) return;

      if (e.key === "ArrowRight") {
        const next = (activeIdx + 1) % images.length;
        select(next);
      }

      if (e.key === "ArrowLeft") {
        const prev = (activeIdx - 1 + images.length) % images.length;
        select(prev);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIdx, images.length, select]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      el.style.transform = `scale(1.05) translate(${x * 12}px, ${y * 12}px)`;
    };

    const reset = () => {
      el.style.transform = "scale(1)";
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);

    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);
  return (
    <>
      <div className="ig-root">
        {/* Main stage */}
        <div className="ig-stage">
          {images.length > 1 && <div className="ig-zoom-hint">Explore</div>}

          <AnimatePresence mode="wait">
            {active && (
              <motion.img
                ref={imgRef}
                draggable="false"
                key={active.url || activeIdx}
                src={active.url}
                alt={`${name} — view ${activeIdx + 1}`}
                loading="lazy"
                variants={imgVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="ig-main-img"
              />
            )}
          </AnimatePresence>

          {images.length > 1 && (
            <div className="ig-counter">
              <span>{activeIdx + 1}</span>
              <span style={{ opacity: 0.3, margin: "0 2px" }}>/</span>
              <span>{images.length}</span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="ig-thumbs">
            {images.map((img, i) => (
              <button
                key={img.public_id || i}
                className={`ig-thumb ${i === activeIdx ? "ig-thumb--active" : ""}`}
                onClick={() => select(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt={`${name} thumbnail ${i + 1}`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
