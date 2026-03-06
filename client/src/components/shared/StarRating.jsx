/* ─────────────────────────────────────────────
   StarRating — Crystalline Obsidian Edition
   ───────────────────────────────────────────── */

const styles = `
  .star-rating {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .stars {
    display: flex;
    gap: 1.5px;
  }

  .star {
    line-height: 1;
    transition: color 0.18s ease, text-shadow 0.18s ease;
  }

  .star--on {
    color: var(--accent, #e8a838);
    text-shadow: 0 0 10px color-mix(in srgb, var(--accent, #e8a838) 60%, transparent);
  }
  .star--half {
    color: var(--accent, #e8a838);
    opacity: 0.5;
  }
  .star--off {
    color: rgba(255,255,255,0.1);
  }

  .star-count {
    font-family: var(--font-ui, "DM Sans", sans-serif);
    font-weight: 600;
    color: rgba(255,255,255,0.22);
    letter-spacing: 0.5px;
  }

  /* Sizes */
  .star-rating--sm .star  { font-size: 12px; }
  .star-rating--sm .star-count { font-size: 10.5px; }

  .star-rating--md .star  { font-size: 15px; }
  .star-rating--md .star-count { font-size: 12.5px; }

  .star-rating--lg .star  { font-size: 21px; }
  .star-rating--lg .star-count { font-size: 14px; }
`;

export default function StarRating({ rating = 0, count, size = "sm" }) {
  const filled = Math.round(rating);
  return (
    <>
      <style>{styles}</style>
      <div
        className={`star-rating star-rating--${size}`}
        aria-label={`${rating} out of 5`}
      >
        <div className="stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`star ${n <= filled ? "star--on" : "star--off"}`}
            >
              ★
            </span>
          ))}
        </div>
        {count !== undefined && <span className="star-count">({count})</span>}
      </div>
    </>
  );
}
