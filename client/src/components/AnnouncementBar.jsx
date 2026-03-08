import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../styles/AnnouncementBar.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AnnouncementBar({ accentColor }) {
  const [announcements, setAnnouncements] = useState([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const textRef = useRef(null);
  const barRef = useRef(null);
  const intervalRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    setVisible(true);
    setCurrent(0);
  }, [location.pathname]);

  useEffect(() => {
    fetch(`${API_URL}/announcements`)
      .then((r) => r.json())
      .then((data) => {
        const active = Array.isArray(data)
          ? data.filter((a) => a.isActive)
          : [];
        setAnnouncements(active);
      })
      .catch(() => setAnnouncements([]));
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (announcements.length <= 1) return;

    intervalRef.current = setInterval(() => {
      animateOut(() => {
        setCurrent((p) => (p + 1) % announcements.length);
      });
    }, 4000);

    return () => clearInterval(intervalRef.current);
  }, [announcements]);

  // Animate in when current changes
  useEffect(() => {
    if (!textRef.current || announcements.length === 0) return;
    animateIn();
  }, [current, announcements]);

  const animateOut = (cb) => {
    if (tweenRef.current) tweenRef.current.kill();
    tweenRef.current = gsap.to(textRef.current, {
      y: -16,
      opacity: 0,
      duration: 0.28,
      ease: "power2.in",
      onComplete: cb,
    });
  };

  const animateIn = () => {
    if (!textRef.current) return;
    if (tweenRef.current) tweenRef.current.kill();
    gsap.fromTo(
      textRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" },
    );
  };

  const handlePrev = () => {
    clearInterval(intervalRef.current);
    animateOut(() =>
      setCurrent((p) => (p - 1 + announcements.length) % announcements.length),
    );
  };

  const handleNext = () => {
    clearInterval(intervalRef.current);
    animateOut(() => setCurrent((p) => (p + 1) % announcements.length));
  };

  const handleClose = () => {
    gsap.to(barRef.current, {
      height: 0,
      opacity: 0,
      duration: 0.35,
      ease: "power2.inOut",
      onComplete: () => setVisible(false),
    });
  };

  if (!visible || announcements.length === 0) return null;

  const ann = announcements[current];

  return (
    <div
      className="ann-bar"
      ref={barRef}
      style={{ "--ann-accent": accentColor || ann?.accentColor || "#ff8c00" }}
    >
      {/* Left shimmer line */}
      <div className="ann-bar__shimmer" />

      {/* Nav arrow — prev */}
      {announcements.length > 1 && (
        <button
          className="ann-bar__arrow"
          onClick={handlePrev}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      {/* Content */}
      <div className="ann-bar__center">
        <div className="ann-bar__text-wrap" ref={textRef}>
          {ann?.icon && <span className="ann-bar__icon">{ann.icon}</span>}
          {ann?.label && <span className="ann-bar__label">{ann.label}</span>}
          <span className="ann-bar__message">{ann?.message}</span>
          {ann?.linkText && ann?.linkUrl && (
            <a
              href={ann.linkUrl}
              className="ann-bar__link"
              target={ann.linkUrl.startsWith("http") ? "_blank" : "_self"}
              rel="noreferrer"
            >
              {ann.linkText} →
            </a>
          )}
        </div>
      </div>

      {/* Nav arrow — next */}
      {announcements.length > 1 && (
        <button
          className="ann-bar__arrow"
          onClick={handleNext}
          aria-label="Next"
        >
          ›
        </button>
      )}

      {/* Dots */}
      {announcements.length > 1 && (
        <div className="ann-bar__dots">
          {announcements.map((_, i) => (
            <button
              key={i}
              className={`ann-bar__dot ${i === current ? "ann-bar__dot--active" : ""}`}
              onClick={() => {
                clearInterval(intervalRef.current);
                animateOut(() => setCurrent(i));
              }}
              aria-label={`Announcement ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Close */}
      <button
        className="ann-bar__close"
        onClick={handleClose}
        aria-label="Close"
      >
        ✕
      </button>

      {/* Right shimmer line */}
      <div className="ann-bar__shimmer ann-bar__shimmer--right" />
    </div>
  );
}
