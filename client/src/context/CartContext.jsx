import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { cartApi } from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

// ── Initial State ──────────────────────────────────────────────────────────
const initialState = { items: [] };

function loadLocalCart() {
  try {
    const stored = localStorage.getItem("animeforge-cart");
    return stored ? JSON.parse(stored) : initialState;
  } catch {
    return initialState;
  }
}

// ── Reducer ────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item,
        ),
      };

    case "CLEAR_CART":
      return initialState;

    default:
      return state;
  }
}

// ── Helper: map backend cart items → frontend shape ────────────────────────
function mapBackendItems(backendItems = []) {
  return backendItems.map((item) => ({
    id: item._id, // cart item id (for update/remove)
    productId: item.product?._id,
    name: item.product?.name || "",
    price: item.priceAtAdd,
    image: item.product?.images?.[0]?.url || null,
    category: item.product?.category || "",
    quantity: item.quantity,
    variantIndex: item.variantIndex,
    variantValue: item.variantValue,
    variantType: item.variantType,
    stock: item.product?.stock || 0,
  }));
}

// ── Provider ───────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    loadLocalCart,
  );
  const [syncing, setSyncing] = useState(false);

  // ── When user logs in → fetch backend cart ─────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      // Not logged in → use localStorage
      return;
    }

    // Logged in → fetch backend cart
    setSyncing(true);
    cartApi
      .getCart()
      .then((data) => {
        const mapped = mapBackendItems(data.items || []);
        dispatch({ type: "SET_CART", payload: mapped });
      })
      .catch(console.error)
      .finally(() => setSyncing(false));
  }, [isLoggedIn]);

  // ── Persist to localStorage when NOT logged in ─────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("animeforge-cart", JSON.stringify(state));
    }
  }, [state, isLoggedIn]);

  // ── ADD TO CART ────────────────────────────────────────────────────────
  const addToCart = useCallback(
    async (product) => {
      if (!isLoggedIn) {
        // Guest → local only
        dispatch({ type: "ADD_ITEM", payload: product });
        return;
      }

      try {
        const data = await cartApi.addToCart({
          productId: product.productId || product.id,
          quantity: product.quantity || 1,
          variantIndex: product.variantIndex ?? null,
        });
        const mapped = mapBackendItems(data.items || []);
        dispatch({ type: "SET_CART", payload: mapped });
      } catch (err) {
        console.error("addToCart error:", err);
        throw err; // let UI handle error toast
      }
    },
    [isLoggedIn],
  );

  // ── REMOVE FROM CART ───────────────────────────────────────────────────
  const removeFromCart = useCallback(
    async (id) => {
      if (!isLoggedIn) {
        dispatch({ type: "REMOVE_ITEM", payload: id });
        return;
      }

      try {
        const data = await cartApi.removeItem(id);
        const mapped = mapBackendItems(data.items || []);
        dispatch({ type: "SET_CART", payload: mapped });
      } catch (err) {
        console.error("removeFromCart error:", err);
      }
    },
    [isLoggedIn],
  );

  // ── UPDATE QUANTITY ────────────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (id, quantity) => {
      if (quantity < 1) {
        removeFromCart(id);
        return;
      }

      if (!isLoggedIn) {
        dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
        return;
      }

      try {
        const data = await cartApi.updateItem(id, quantity);
        const mapped = mapBackendItems(data.items || []);
        dispatch({ type: "SET_CART", payload: mapped });
      } catch (err) {
        console.error("updateQuantity error:", err);
      }
    },
    [isLoggedIn, removeFromCart],
  );

  // ── CLEAR CART ─────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (!isLoggedIn) {
      dispatch({ type: "CLEAR_CART" });
      return;
    }

    try {
      await cartApi.clearCart();
      dispatch({ type: "CLEAR_CART" });
    } catch (err) {
      console.error("clearCart error:", err);
    }
  }, [isLoggedIn]);

  // ── Derived values ─────────────────────────────────────────────────────
  const cartCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  );

  const subtotal = useMemo(
    () =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [state.items],
  );

  const shipping = subtotal > 999 ? 0 : subtotal > 0 ? 99 : 0; // ₹999 free shipping
  const tax = useMemo(() => subtotal * 0.18, [subtotal]); // 18% GST
  const total = subtotal + shipping + tax;

  const value = useMemo(
    () => ({
      items: state.items,
      syncing,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      subtotal,
      shipping,
      tax,
      total,
    }),
    [
      state.items,
      syncing,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      subtotal,
      shipping,
      tax,
      total,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Custom Hook ────────────────────────────────────────────────────────────
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
