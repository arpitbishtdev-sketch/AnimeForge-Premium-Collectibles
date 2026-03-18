const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Token helpers ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("animeforge-token");
export const setToken = (token) =>
  localStorage.setItem("animeforge-token", token);
export const removeToken = () => localStorage.removeItem("animeforge-token");

export const getRefreshToken = () =>
  localStorage.getItem("animeforge-refresh-token");
export const setRefreshToken = (token) =>
  localStorage.setItem("animeforge-refresh-token", token);
export const removeRefreshToken = () =>
  localStorage.removeItem("animeforge-refresh-token");

// ── Core request ───────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!retryRes.ok) {
        const err = await retryRes
          .json()
          .catch(() => ({ message: retryRes.statusText }));
        throw new Error(err.message || "Request failed");
      }
      return retryRes.json();
    } else {
      removeToken();
      removeRefreshToken();
      localStorage.removeItem("animeforge-user");
      window.location.href = "/user";
      return;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  return res.json();
}

// ── Refresh token logic ────────────────────────────────────────────────────
async function tryRefreshToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    setToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════
export const authApi = {
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: async (body) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (data?.accessToken) setToken(data.accessToken);
    if (data?.refreshToken) setRefreshToken(data.refreshToken);
    return data;
  },

  logout: async () => {
    await request("/auth/logout", { method: "POST" }).catch(() => {});
    removeToken();
    removeRefreshToken();
    localStorage.removeItem("animeforge-user");
  },

  forgotPassword: (body) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  resetPassword: (body) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProfile: (body) =>
    request("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  changePassword: (body) =>
    request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN AUTH
// ═══════════════════════════════════════════════════════════════════════════
export const adminAuthApi = {
  login: (body) =>
    request("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyOTP: async (body) => {
    const data = await request("/auth/admin/verify-otp", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (data?.accessToken) setToken(data.accessToken);
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════
export const api = {
  getCollections: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products?${query}`);
  },

  getProduct: (slug) => request(`/products/slug/${slug}`),

  getShopProducts: () => request("/products?displaySection=shop"),
};

// ═══════════════════════════════════════════════════════════════════════════
// CART
// ═══════════════════════════════════════════════════════════════════════════
export const cartApi = {
  getCart: () => request("/cart"),

  addToCart: (body) =>
    request("/cart/add", { method: "POST", body: JSON.stringify(body) }),

  updateItem: (itemId, quantity) =>
    request(`/cart/item/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId) => request(`/cart/item/${itemId}`, { method: "DELETE" }),

  clearCart: () => request("/cart/clear", { method: "DELETE" }),
};

// ═══════════════════════════════════════════════════════════════════════════
// ADDRESSES
// ═══════════════════════════════════════════════════════════════════════════
export const addressApi = {
  getAll: () => request("/addresses"),

  add: (body) =>
    request("/addresses", { method: "POST", body: JSON.stringify(body) }),

  update: (id, body) =>
    request(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  setDefault: (id) => request(`/addresses/${id}/default`, { method: "PATCH" }),

  delete: (id) => request(`/addresses/${id}`, { method: "DELETE" }),
};

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════════════
export const orderApi = {
  place: (body) =>
    request("/orders/place", { method: "POST", body: JSON.stringify(body) }),

  verifyRazorpay: (body) =>
    request("/orders/verify/razorpay", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  capturePayPal: (body) =>
    request("/orders/capture/paypal", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMyOrders: () => request("/orders/my"),

  getOrder: (id) => request(`/orders/${id}`),

  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: "PATCH" }),
};

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════════════
export const reviewApi = {
  getProductReviews: (productId) => request(`/reviews/product/${productId}`),

  addReview: (body) =>
    request("/reviews", { method: "POST", body: JSON.stringify(body) }),

  editReview: (id, body) =>
    request(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  deleteReview: (id) => request(`/reviews/${id}`, { method: "DELETE" }),

  markHelpful: (id) => request(`/reviews/${id}/helpful`, { method: "POST" }),
};