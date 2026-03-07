import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const WishlistContext = createContext(null);

// ── Load from localStorage on startup ──
function loadWishlist() {
  try {
    const stored = localStorage.getItem("animeforge-wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadWishlist);
  const [isOpen, setIsOpen] = useState(false);

  // ── Persist to localStorage on every change ──
  useEffect(() => {
    localStorage.setItem("animeforge-wishlist", JSON.stringify(items));
  }, [items]);

  const addToWishlist = useCallback((product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleWishlist = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      return exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback(
    (id) => items.some((p) => p.id === id),
    [items],
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  const openWishlist = useCallback(() => setIsOpen(true), []);
  const closeWishlist = useCallback(() => setIsOpen(false), []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        isOpen,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        clearWishlist,
        openWishlist,
        closeWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
