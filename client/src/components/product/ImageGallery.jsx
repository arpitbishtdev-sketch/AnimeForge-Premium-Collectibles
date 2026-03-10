// import { motion, AnimatePresence } from "framer-motion";
// import { useState, useCallback, useEffect, useRef } from "react";
// import "./ImageGallery.css";

// const imgVariants = {
//   enter: (d) => ({
//     opacity: 0,
//     x: d * 20,
//     scale: 0.98,
//     filter: "blur(4px)",
//   }),
//   center: {
//     opacity: 1,
//     x: 0,
//     scale: 1,
//     filter: "blur(0px)",
//   },
//   exit: (d) => ({
//     opacity: 0,
//     x: d * -12,
//     scale: 0.99,
//     filter: "blur(2px)",
//   }),
// };

// export default function ImageGallery({ images = [], name }) {
//   const [activeIdx, setActiveIdx] = useState(0);

//   useEffect(() => {
//     setActiveIdx(0);
//   }, [images]);
//   const [direction, setDirection] = useState(1);
//   const imgRef = useRef(null);

//   const select = useCallback(
//     (idx) => {
//       setDirection(idx > activeIdx ? 1 : -1);
//       setActiveIdx(idx);
//     },
//     [activeIdx],
//   );

//   const active = images[activeIdx];

//   useEffect(() => {
//     const handleKey = (e) => {
//       if (!images.length) return;

//       if (e.key === "ArrowRight") {
//         const next = (activeIdx + 1) % images.length;
//         select(next);
//       }

//       if (e.key === "ArrowLeft") {
//         const prev = (activeIdx - 1 + images.length) % images.length;
//         select(prev);
//       }
//     };

//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [activeIdx, images.length, select]);

//   useEffect(() => {
//     const el = imgRef.current;
//     if (!el) return;

//     const handleMove = (e) => {
//       const rect = el.getBoundingClientRect();

//       const x = (e.clientX - rect.left) / rect.width - 0.5;
//       const y = (e.clientY - rect.top) / rect.height - 0.5;

//       el.style.transform = `scale(1.05) translate(${x * 12}px, ${y * 12}px)`;
//     };

//     const reset = () => {
//       el.style.transform = "scale(1)";
//     };

//     el.addEventListener("mousemove", handleMove);
//     el.addEventListener("mouseleave", reset);

//     return () => {
//       el.removeEventListener("mousemove", handleMove);
//       el.removeEventListener("mouseleave", reset);
//     };
//   }, []);
//   return (
//     <>
//       <div className="ig-root">
//         {/* Main stage */}
//         <div className="ig-stage">
//           {images.length > 1 && <div className="ig-zoom-hint">Explore</div>}

//           <AnimatePresence mode="wait">
//             {active && (
//               <motion.img
//                 ref={imgRef}
//                 draggable="false"
//                 key={active.url || activeIdx}
//                 src={active.url}
//                 alt={`${name} — view ${activeIdx + 1}`}
//                 loading="lazy"
//                 variants={imgVariants}
//                 initial="enter"
//                 animate="center"
//                 exit="exit"
//                 transition={{
//                   duration: 0.38,
//                   ease: [0.22, 1, 0.36, 1],
//                 }}
//                 className="ig-main-img"
//               />
//             )}
//           </AnimatePresence>

//           {images.length > 1 && (
//             <div className="ig-counter">
//               <span>{activeIdx + 1}</span>
//               <span style={{ opacity: 0.3, margin: "0 2px" }}>/</span>
//               <span>{images.length}</span>
//             </div>
//           )}
//         </div>

//         {/* Thumbnails */}
//         {images.length > 1 && (
//           <div className="ig-thumbs">
//             {images.map((img, i) => (
//               <button
//                 key={img.public_id || i}
//                 className={`ig-thumb ${i === activeIdx ? "ig-thumb--active" : ""}`}
//                 onClick={() => select(i)}
//                 aria-label={`View image ${i + 1}`}
//               >
//                 <img
//                   src={img.url}
//                   alt={`${name} thumbnail ${i + 1}`}
//                   loading="lazy"
//                 />
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
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

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export default function ImageGallery({ images = [], name = "" }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState(1);
  const imgRef = useRef(null);

  // Lightbox drag-to-dismiss
  const dragY = useMotionValue(0);
  const lightboxOpacity = useTransform(dragY, [-200, 0, 200], [0.3, 1, 0.3]);
  const lightboxScale = useTransform(dragY, [-300, 0, 300], [0.7, 1, 0.7]);
  const overlayOpacity = useTransform(dragY, [-200, 0, 200], [0.2, 1, 0.2]);

  useEffect(() => {
    setActiveIdx(0);
  }, [images]);

  const select = useCallback(
    (idx) => {
      setDirection(idx > activeIdx ? 1 : -1);
      setActiveIdx(idx);
    },
    [activeIdx],
  );

  const active = images[activeIdx];

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!images.length) return;
      if (e.key === "ArrowRight") {
        select((activeIdx + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        select((activeIdx - 1 + images.length) % images.length);
      }
      if (e.key === "Escape" && lightboxOpen) {
        setLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIdx, images.length, select, lightboxOpen]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  // Mouse parallax on stage image
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
  }, [activeIdx]);

  // Swipe handler for lightbox
  const handleLightboxDragEnd = (_, info) => {
    // Vertical dismiss
    if (Math.abs(info.offset.y) > 80 || Math.abs(info.velocity.y) > 300) {
      setLightboxOpen(false);
      return;
    }
    // Horizontal swipe to navigate
    if (info.offset.x < -50 || info.velocity.x < -300) {
      select((activeIdx + 1) % images.length);
    } else if (info.offset.x > 50 || info.velocity.x > 300) {
      select((activeIdx - 1 + images.length) % images.length);
    }
  };

  // Stage swipe (touch devices, inline)
  const handleStageDragEnd = (_, info) => {
    if (images.length <= 1) return;
    if (info.offset.x < -50 || info.velocity.x < -300) {
      select((activeIdx + 1) % images.length);
    } else if (info.offset.x > 50 || info.velocity.x > 300) {
      select((activeIdx - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      <div className="ig-root">
        {/* Main stage */}
        <div
          className="ig-stage"
          onClick={() => active && setLightboxOpen(true)}
        >
          {images.length > 1 && <div className="ig-zoom-hint">Explore</div>}
          <AnimatePresence mode="wait" custom={direction}>
            {active && (
              <motion.img
                ref={imgRef}
                draggable="false"
                key={active.url || activeIdx}
                src={active.url}
                alt={`${name} — view ${activeIdx + 1}`}
                loading="lazy"
                custom={direction}
                variants={imgVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="ig-main-img"
                drag={images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleStageDragEnd}
              />
            )}
          </AnimatePresence>
          {images.length > 1 && (
            <div className="ig-counter">
              <span>{activeIdx + 1}</span>
              <span className="ig-counter-sep">/</span>
              <span>{images.length}</span>
            </div>
          )}
          {/* Click-to-zoom indicator */}
          <div className="ig-expand-hint">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </div>
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
      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && active && (
          <motion.div
            className="ig-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springTransition}
            style={{ opacity: overlayOpacity }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              className="ig-lightbox-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0, y: 60 }}
              transition={springTransition}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={active.url || activeIdx}
                  src={active.url}
                  alt={`${name} — view ${activeIdx + 1}`}
                  className="ig-lightbox-img"
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction * -40, scale: 0.96 }}
                  transition={springTransition}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.18}
                  style={{
                    y: dragY,
                    opacity: lightboxOpacity,
                    scale: lightboxScale,
                  }}
                  onDragEnd={handleLightboxDragEnd}
                  draggable="false"
                />
              </AnimatePresence>
              {/* Lightbox counter */}
              {images.length > 1 && (
                <div className="ig-lightbox-counter">
                  <span>{activeIdx + 1}</span>
                  <span className="ig-counter-sep">/</span>
                  <span>{images.length}</span>
                </div>
              )}
              {/* Swipe hint */}
              <div className="ig-lightbox-hint">
                Swipe or drag to navigate · Pull down to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
