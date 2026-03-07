const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  return res.json();
}

export const api = {
  getCollections: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products?${query}`);
  },

  getProduct: (slug) => request(`/products/slug/${slug}`),

  getReviews: (slug) => request(`/products/${slug}/reviews`),

  postReview: (slug, body) =>
    request(`/products/${slug}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
