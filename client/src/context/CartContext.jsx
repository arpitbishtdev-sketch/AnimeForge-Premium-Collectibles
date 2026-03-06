import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from "react";

import { useEffect } from "react";
/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */

const CartContext = createContext();

/* ─────────────────────────────────────────────
   Initial State
───────────────────────────────────────────── */

const initialState = {
  items: [],
};

function loadCart() {
  try {
    const stored = localStorage.getItem("animeforge-cart");
    return stored ? JSON.parse(stored) : initialState;
  } catch {
    return initialState;
  }
}
/* ─────────────────────────────────────────────
   Reducer (Pure + Fast)
───────────────────────────────────────────── */

function cartReducer(state, action) {
  switch (action.type) {
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
            ? {
                ...item,
                quantity: Math.max(1, action.payload.quantity),
              }
            : item,
        ),
      };

    case "CLEAR_CART":
      return initialState;

    default:
      return state;
  }
}

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, loadCart);

  useEffect(() => {
    localStorage.setItem("animeforge-cart", JSON.stringify(state));
  }, [state]);

  /* Stable Functions */
  const addToCart = useCallback((product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  /* Derived Values (Memoized) */
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

  const shipping = subtotal > 200 ? 0 : subtotal > 0 ? 15.99 : 0;

  const tax = useMemo(() => subtotal * 0.08, [subtotal]);

  const total = subtotal + shipping + tax;

  const value = useMemo(
    () => ({
      items: state.items,
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

/* ─────────────────────────────────────────────
   Custom Hook
───────────────────────────────────────────── */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
