import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "../shared/StarRating";
import { Skeleton } from "../shared/Skeleton";
import { api } from "../../utils/api";
import "./Reviewssection.css";

function ReviewCard({ review, isNew }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <motion.div
      className={`rv-card ${isNew ? "rv-card--new" : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <div className="rv-head">
        <div className="rv-avatar">
          {review.name?.[0]?.toUpperCase() || "A"}
        </div>
        <div className="rv-meta">
          <span className="rv-name">{review.name}</span>
          <span className="rv-date">{date}</span>
        </div>
        <StarRating rating={review.rating} size="sm" />
        {isNew && <span className="rv-pending">Pending approval</span>}
      </div>
      {review.comment && <p className="rv-comment">{review.comment}</p>}
    </motion.div>
  );
}

const EMPTY_FORM = { name: "", rating: 0, comment: "" };

export default function ReviewsSection({
  slug,
  reviews,
  loading,
  error,
  addOptimistic,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim() || form.rating === 0) {
      setSubmitError("Please enter your name and a star rating.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await api.postReview(slug, form);
      addOptimistic(res.data || { ...form, isApproved: false });
      setForm(EMPTY_FORM);
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }, [form, slug, addOptimistic]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <>
      <section className="rs-section">
        {/* Header */}
        <div className="rs-head">
          <div>
            <span className="rs-eyebrow">Community</span>
            <h2 className="rs-title">Reviews</h2>
          </div>
          {reviews.length > 0 && (
            <div className="rs-summary">
              <span className="rs-score">{avgRating}</span>
              <div className="rs-score-right">
                <StarRating rating={Number(avgRating)} size="md" />
                <span className="rs-count">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="rs-body">
          {/* Review list */}
          <div className="rs-list">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rs-skel">
                  <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <Skeleton width="36px" height="36px" radius="50%" />
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <Skeleton width="120px" height="13px" />
                      <Skeleton width="80px" height="10px" />
                    </div>
                  </div>
                  <Skeleton width="100%" height="12px" />
                  <Skeleton width="70%" height="12px" />
                </div>
              ))
            ) : error ? (
              <p className="rs-err">Failed to load reviews.</p>
            ) : reviews.length === 0 ? (
              <div className="rs-empty">
                <span className="rs-empty__icon">★</span>
                <p className="rs-empty__text">
                  No reviews yet. Be the first to share your experience.
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {reviews.map((r) => (
                  <ReviewCard key={r._id} review={r} isNew={!r.isApproved} />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Form */}
          <div className="rf-form" ref={formRef}>
            <h3 className="rf-title">Write a Review</h3>
            {submitted ? (
              <div className="rf-success">
                <span className="rf-success__icon">✓</span>
                <p className="rf-success__text">
                  Review submitted!
                  <br />
                  It will appear after approval.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="rf-reset"
                >
                  Write another
                </button>
              </div>
            ) : (
              <>
                <div className="rf-field">
                  <label className="rf-label">Your Rating *</label>
                  <div className="rf-stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className={`rf-star ${n <= (hoveredStar || form.rating) ? "rf-star--on" : ""}`}
                        onMouseEnter={() => setHoveredStar(n)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setForm((f) => ({ ...f, rating: n }))}
                        aria-label={`Rate ${n} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rf-field">
                  <label className="rf-label" htmlFor="review-name">
                    Your Name *
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Enter your name"
                    className="rf-input"
                    maxLength={80}
                  />
                </div>

                <div className="rf-field">
                  <label className="rf-label" htmlFor="review-comment">
                    Comment
                  </label>
                  <textarea
                    id="review-comment"
                    value={form.comment}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, comment: e.target.value }))
                    }
                    placeholder="Share your experience..."
                    className="rf-textarea"
                    rows={4}
                    maxLength={500}
                  />
                </div>

                {submitError && <p className="rf-error">{submitError}</p>}

                <button
                  className="rf-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="rf-spinner" />
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
