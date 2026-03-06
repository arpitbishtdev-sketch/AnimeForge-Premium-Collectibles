import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../utils/api";

export function useCollections(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const data = await api.getCollections({
          ...params,
        });

        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [params.search]);

  return { products, loading, error };
}

export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    api
      .getProduct(slug)
      .then((data) => {
        if (!cancelled) {
          setProduct(data.product || data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, loading, error };
}

export function useReviews(slug) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    api
      .getReviews(slug)
      .then((data) => {
        const list = Array.isArray(data) ? data : data.reviews || [];
        setReviews(list.filter((r) => r.isApproved));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addOptimistic = useCallback((review) => {
    setReviews((prev) => [
      {
        ...review,
        _id: `opt_${Date.now()}`,
        isApproved: true,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  return { reviews, loading, error, refetch, addOptimistic };
}
