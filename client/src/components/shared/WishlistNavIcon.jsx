import { useCallback } from "react";
import { useWishlist } from "../../context/WishlistContext";
import { useTheme } from "../../context/ThemeContext";
import "./WishlistDrawer.css"; // reuses the .wl-nav-btn styles

const HeartIcon = ({ filled }) =>
  filled ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
      a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
      1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  ) : (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
      a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
      1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  );

export default function WishlistNavIcon() {
  const { items, openWishlist } = useWishlist();
  const { activeCharacter } = useTheme();

  const accent = activeCharacter?.gradient?.accent || "#ff8c00";
  const count = items.length;

  return (
    <button
      className={`wl-nav-btn${count > 0 ? " has-items" : ""}`}
      onClick={openWishlist}
      aria-label={`Wishlist (${count} items)`}
      style={{ "--acc": accent }}
    >
      <HeartIcon filled={count > 0} />
      {count > 0 && (
        /* key forces badge re-mount animation on count change */
        <span className="wl-nav-btn__badge" key={count}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
